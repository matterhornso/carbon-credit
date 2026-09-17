import { expect } from 'chai';
import {
  selectSourceExcerpts,
  buildAdditionalityPrompt,
  MAX_EXCERPTS,
  MAX_TOTAL_EXCERPT_CHARS,
} from '../../application/usecases/generation/PromptAssembler';

/**
 * Per-excerpt truncation already bounded one document. Nothing bounded how many
 * documents entered a prompt, so fifty uploads meant a fifty-times-larger prompt
 * at fifty times the cost — per section, for every section.
 *
 * The cap is the easy half. The hard half is that dropping an evidence document
 * silently produces a section reading "evidence needed" for something the
 * project team *did* upload, which is the platform asserting something untrue
 * about its own user. These tests are mostly about that half.
 */

const doc = (filename: string, chars: number, linkedSections: string[] = []) => ({
  filename,
  extractedText: 'x'.repeat(chars),
  linkedSections,
});

describe('Test source excerpt budget', () => {

  describe('the count cap', () => {

    it('admits every document when the set is within budget', () => {
      const docs: any = [doc('a.pdf', 100), doc('b.pdf', 100), doc('c.pdf', 100)];
      const { excerpts, omitted } = selectSourceExcerpts(docs, 'additionality');

      expect(excerpts).to.have.length(3);
      expect(omitted).to.deep.equal([]);
    });

    it('caps the number of excerpts and names every document it dropped', () => {
      const docs: any = Array.from({ length: MAX_EXCERPTS + 5 }, (_, i) => doc(`doc-${i}.pdf`, 50));
      const { excerpts, omitted } = selectSourceExcerpts(docs, 'additionality');

      expect(excerpts).to.have.length(MAX_EXCERPTS);
      expect(omitted).to.have.length(5);
      // Named, not counted: a UI that can only say "5 documents were dropped"
      // cannot tell the user *which* evidence is missing from the draft.
      expect(omitted.every(o => typeof o.filename === 'string' && o.filename.length > 0)).to.equal(true);
      expect(omitted.every(o => o.reason === 'excerpt_count_cap')).to.equal(true);
    });

    it('accounts for every input document as either included or omitted', () => {
      // The property that matters: nothing vanishes. A document that is neither
      // shown to the model nor reported to the caller is the silent-loss bug.
      const docs: any = Array.from({ length: MAX_EXCERPTS + 7 }, (_, i) => doc(`doc-${i}.pdf`, 50));
      const { excerpts, omitted } = selectSourceExcerpts(docs, 'additionality');

      expect(excerpts.length + omitted.length).to.equal(docs.length);
    });
  });

  describe('the total size cap', () => {

    it('stops before exceeding the total character budget', () => {
      // Each doc is truncated to MAX_EXCERPT_CHARS (4000), so ten of them are
      // 40k against a 30k budget — the size cap binds before the count cap.
      const docs: any = Array.from({ length: 10 }, (_, i) => doc(`big-${i}.pdf`, 8000));
      const { excerpts, omitted } = selectSourceExcerpts(docs, 'additionality');

      const totalChars = excerpts.reduce((sum, e) => sum + e.excerpt.length, 0);
      expect(totalChars).to.be.at.most(MAX_TOTAL_EXCERPT_CHARS);
      expect(omitted.length).to.be.greaterThan(0);
      expect(omitted.every(o => o.reason === 'total_size_cap')).to.equal(true);
    });
  });

  describe('what gets dropped first', () => {

    it('keeps documents a human linked to this section over general-purpose ones', () => {
      // An unlinked upload is a guess that it might be relevant. A linked one is
      // someone stating that it is. When the budget forces a choice, the guess
      // loses.
      const docs: any = [
        ...Array.from({ length: MAX_EXCERPTS }, (_, i) => doc(`general-${i}.pdf`, 50)),
        doc('linked.pdf', 50, ['additionality']),
      ];
      const { excerpts, omitted } = selectSourceExcerpts(docs, 'additionality');

      expect(excerpts.map(e => e.filename)).to.include('linked.pdf');
      expect(omitted.map(o => o.filename)).to.not.include('linked.pdf');
    });
  });

  describe('excerpt IDs', () => {

    it('numbers excerpts contiguously over what was actually included', () => {
      // If IDs were assigned before the cap, a citation could name SRC-14 when
      // only 12 excerpts were shown — an unresolvable citation that the
      // verification step would then flag as a hallucination. It would not be
      // one; it would be our bug, blamed on the model.
      const docs: any = Array.from({ length: MAX_EXCERPTS + 4 }, (_, i) => doc(`doc-${i}.pdf`, 50));
      const { excerpts } = selectSourceExcerpts(docs, 'additionality');

      expect(excerpts.map(e => e.id)).to.deep.equal(
        Array.from({ length: MAX_EXCERPTS }, (_, i) => `SRC-${i + 1}`)
      );
    });
  });

  describe('what the model is told', () => {

    const methodology: any = {
      code: 'VM0047', version: '1.1', title: 'Test', additionalityTiers: [{ tier: '1', name: 'regulatory_surplus', description: 'd', requiredEvidence: ['e'] }],
      sourceReference: { name: 'ref', publisher: 'pub' },
    };
    const project: any = { intake: { projectArea: 100 } };

    it('names the omitted documents in the prompt', () => {
      const docs: any = Array.from({ length: MAX_EXCERPTS + 2 }, (_, i) => doc(`doc-${i}.pdf`, 50));
      const selection = selectSourceExcerpts(docs, 'additionality');
      const messages = buildAdditionalityPrompt(methodology, project, undefined, selection);
      const userContent = messages.find(m => m.role === 'user')!.content;

      expect(userContent).to.include('NOT SHOWN TO YOU');
      selection.omitted.forEach(o => expect(userContent).to.include(o.filename));
    });

    it('tells the model not to claim the omitted documents were never provided', () => {
      // Without this instruction the model does the reasonable thing with the
      // evidence in front of it and reports a gap. The gap is real for this
      // request and false about the project.
      const docs: any = Array.from({ length: MAX_EXCERPTS + 2 }, (_, i) => doc(`doc-${i}.pdf`, 50));
      const selection = selectSourceExcerpts(docs, 'additionality');
      const messages = buildAdditionalityPrompt(methodology, project, undefined, selection);
      const userContent = messages.find(m => m.role === 'user')!.content;

      expect(userContent).to.include('Do not state or imply that they were not provided');
    });

    it('says nothing about omissions when nothing was omitted', () => {
      const docs: any = [doc('only.pdf', 50)];
      const selection = selectSourceExcerpts(docs, 'additionality');
      const messages = buildAdditionalityPrompt(methodology, project, undefined, selection);
      const userContent = messages.find(m => m.role === 'user')!.content;

      expect(userContent).to.not.include('NOT SHOWN TO YOU');
    });

    it('distinguishes "no documents supplied" from "all documents dropped"', () => {
      const none = selectSourceExcerpts([], 'additionality');
      const noneContent = buildAdditionalityPrompt(methodology, project, undefined, none)
        .find(m => m.role === 'user')!.content;

      expect(noneContent).to.include('none supplied for this section');
      expect(noneContent).to.not.include('NOT SHOWN TO YOU');
    });
  });
});

import { expect } from 'chai';
import { buildSourceExcerpts, validateCitations, parseNarrativeCitations } from '../../application/usecases/generation/PromptAssembler';

describe('Test buildSourceExcerpts', () => {
  const docs: any = [
    { filename: 'survey.pdf', extractedText: 'a'.repeat(10), linkedSections: ['additionality'] },
    { filename: 'general.pdf', extractedText: 'b'.repeat(10), linkedSections: [] },
    { filename: 'unrelated.pdf', extractedText: 'c'.repeat(10), linkedSections: ['monitoring'] },
    { filename: 'no-text.pdf', extractedText: undefined, linkedSections: ['additionality'] },
  ];

  it('includes docs linked to the requested section', () => {
    const excerpts = buildSourceExcerpts(docs, 'additionality');
    expect(excerpts.map((e) => e.filename)).to.include('survey.pdf');
  });

  it('includes docs with no linkedSections as general-purpose', () => {
    const excerpts = buildSourceExcerpts(docs, 'additionality');
    expect(excerpts.map((e) => e.filename)).to.include('general.pdf');
  });

  it('excludes docs linked only to a different section', () => {
    const excerpts = buildSourceExcerpts(docs, 'additionality');
    expect(excerpts.map((e) => e.filename)).to.not.include('unrelated.pdf');
  });

  it('excludes docs with no extracted text', () => {
    const excerpts = buildSourceExcerpts(docs, 'additionality');
    expect(excerpts.map((e) => e.filename)).to.not.include('no-text.pdf');
  });

  it('assigns sequential SRC-n ids in order', () => {
    const excerpts = buildSourceExcerpts(docs, 'additionality');
    expect(excerpts[0].id).equals('SRC-1');
    expect(excerpts[1].id).equals('SRC-2');
  });
});

describe('Test validateCitations', () => {
  const excerpts: any = [{ id: 'SRC-1', filename: 'a.pdf', excerpt: 'x' }];

  it('marks a source_document citation verified when its id was actually supplied', () => {
    const result = validateCitations([{ claim: 'x', source: 'source_document', sourceDetail: 'SRC-1' }], excerpts);
    expect(result[0].verified).equals(true);
  });

  it('marks a source_document citation unverified when its id was not supplied — the fabrication case', () => {
    const result = validateCitations([{ claim: 'x', source: 'source_document', sourceDetail: 'SRC-99' }], excerpts);
    expect(result[0].verified).equals(false);
  });

  it('leaves verified undefined for methodology_reference citations (nothing to check against)', () => {
    const result = validateCitations([{ claim: 'x', source: 'methodology_reference', sourceDetail: 'VM0047' }], excerpts);
    expect(result[0].verified).to.be.undefined;
  });

  it('coerces an unrecognized source value to none rather than trusting it', () => {
    const result = validateCitations([{ claim: 'x', source: 'made_up', sourceDetail: 'anything' }], excerpts);
    expect(result[0].source).equals('none');
  });
});

describe('Test parseNarrativeCitations', () => {
  it('splits prose text from trailing CITATION lines', () => {
    const raw = 'The project area is 40 hectares.\nCITATION | project area is 40ha | source_document | SRC-1';
    const { text, citations } = parseNarrativeCitations(raw);
    expect(text).equals('The project area is 40 hectares.');
    expect(citations).to.have.length(1);
    expect(citations[0].sourceDetail).equals('SRC-1');
  });

  it('returns the full text and no citations when none are present', () => {
    const { text, citations } = parseNarrativeCitations('Just prose, no citations.');
    expect(text).equals('Just prose, no citations.');
    expect(citations).to.have.length(0);
  });
});

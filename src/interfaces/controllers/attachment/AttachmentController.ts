import express from 'express';
import multer from 'multer';
import { Response } from '../../response/Response'
import { Controller, Get, Route, Post, Request, Query, Security } from "tsoa"
import { ProjectRepository } from '../../database/ProjectRepository'
import { ProjectMongoConnection } from '../../../infrastructure/database/helper/database/Project'
import { SourceDocumentRepository } from '../../database/SourceDocumentRepository'
import { SourceDocumentMongoConnection } from '../../../infrastructure/database/helper/database/SourceDocument'
import { AuditEventRepository } from '../../database/AuditEventRepository'
import { AuditEventMongoConnection } from '../../../infrastructure/database/helper/database/AuditEvent'
import { SourceDocumentUseCase, AuditEventUseCase } from '../../../application/usecases/index'
import { SourceDocument, AuditEvent } from '../../../domain'
import { StorageService } from '../../services/Storage.service'
import { extractText } from '../../services/TextExtraction.service'
import { Util } from '../../utils/Util'

// Same limit as the precedent in encryption-service/FileUtil.ts. A single
// file per request — carbon-project evidence documents (surveys, land
// titles, financial models) don't need bulk upload for v1.
const MAX_FILE_SIZE_BYTES = 8_000_000;

@Route('attachment')
export class AttachmentController extends Controller {
  private projectRepository: ProjectRepository;
  private sourceDocumentRepository: SourceDocumentRepository;
  private auditEventRepository: AuditEventRepository;
  private storageService: StorageService;

  constructor() {
    super();
    this.projectRepository = new ProjectRepository(new ProjectMongoConnection());
    this.sourceDocumentRepository = new SourceDocumentRepository(new SourceDocumentMongoConnection());
    this.auditEventRepository = new AuditEventRepository(new AuditEventMongoConnection());
    this.storageService = new StorageService();
  }

  private async getActor(request: any): Promise<{ userId: string; role: string }> {
    const user: any = await new Util().getUserInfo(request.user);
    const department: any = await new Util().getDepartmentInfo(request.user);
    return { userId: user._id, role: (department?.roles || []).join(',') || 'UNKNOWN' };
  }

  private parseUpload(request: express.Request): Promise<Express.Multer.File> {
    const handler = multer({ limits: { fileSize: MAX_FILE_SIZE_BYTES } }).single('file');
    return new Promise((resolve, reject) => {
      handler(request, {} as express.Response, (error: any) => {
        if (error) return reject(error);
        const file = (request as any).file;
        if (!file) return reject(new Error('No file field named "file" was found in the upload'));
        resolve(file);
      });
    });
  }

  private parseLinkedSections(request: express.Request): string[] {
    const raw = (request.body || {}).linkedSections;
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      // fall through to comma-separated parsing
    }
    return String(raw).split(',').map((s) => s.trim()).filter(Boolean);
  }

  // multipart/form-data: field "file" (required), field "linkedSections"
  // (optional — JSON array or comma-separated section keys; omit to make
  // the document available to every section). Extracts text synchronously
  // — fine at the current 8MB cap, would need a background job if that
  // limit ever grows significantly.
  @Security("jwt")
  @Post("upload")
  async upload(@Request() request: express.Request, @Query() projectId: string) {
    try {
      const project = await this.projectRepository.getProjectById(projectId);
      if (!project) {
        this.setStatus(404);
        return new Response().sendResponseFailure("Project not found", false);
      }

      const file = await this.parseUpload(request);
      const actor = await this.getActor(request);
      const linkedSections = this.parseLinkedSections(request);

      const uploadResult = await this.storageService.upload(file.buffer, file.originalname, projectId);

      const sourceDocument_useCase = new SourceDocumentUseCase(this.sourceDocumentRepository);
      const created: any = await new SourceDocument().create({
        projectId,
        filename: file.originalname,
        storageRef: uploadResult.storageRef,
        mimeType: file.mimetype,
        sizeBytes: uploadResult.sizeBytes,
        uploadedByUserId: actor.userId,
        status: 'processing',
        linkedSections,
      }, sourceDocument_useCase);

      await this.projectRepository.addAttachment(projectId, created._id);

      const extraction = await extractText(file.buffer, file.mimetype);
      const finalDoc = await this.sourceDocumentRepository.updateExtractedText(
        String(created._id),
        extraction.text,
        extraction.supported ? 'processed' : 'failed'
      );

      const auditEvent_useCase = new AuditEventUseCase(this.auditEventRepository);
      await new AuditEvent().record({
        projectId,
        actorUserId: actor.userId,
        actorRole: actor.role,
        eventType: 'SOURCE_DOCUMENT_UPLOADED',
        after: { filename: file.originalname, mimeType: file.mimetype, sizeBytes: uploadResult.sizeBytes, textExtracted: extraction.supported },
      }, auditEvent_useCase);

      if (!extraction.supported) {
        return new Response().sendResponseSuccess({
          ...finalDoc,
          _warning: `Text extraction is not supported for ${file.mimetype} yet — the file is stored and linked to the project, but generation won't be able to cite it until extraction is added for this format.`,
        }, true);
      }

      return new Response().sendResponseSuccess(finalDoc, true);
    } catch (error: any) {
      this.setStatus(400);
      return new Response().sendResponseFailure(error?.message || "Something went wrong", false);
    }
  }

  @Get("listByProject")
  @Security("jwt")
  async listByProject(@Request() request: any, @Query() projectId: string) {
    try {
      const result = await this.sourceDocumentRepository.getSourceDocumentsByProjectId(projectId);
      return new Response().sendResponseSuccess(result, true);
    } catch (Error) {
      this.setStatus(500);
      return new Response().sendResponseFailure("Something went wrong " + Error, false);
    }
  }
}

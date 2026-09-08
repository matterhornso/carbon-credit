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
import { TenantResolver } from '../../services/TenantResolver.service'

// Same limit as the precedent in encryption-service/FileUtil.ts. A single
// file per request — carbon-project evidence documents (surveys, land
// titles, financial models) don't need bulk upload for v1.
const MAX_FILE_SIZE_BYTES = 8_000_000;

@Route('attachment')
export class AttachmentController extends Controller {
  private storageService: StorageService;

  private tenantResolver = new TenantResolver();

  constructor() {
    super();
    this.storageService = new StorageService();
  }

  // Per request: these carry the caller's tenant.
  private async scoped(request: any) {
    const scope = await this.tenantResolver.scopeFor(
      (request as any)?.user?._user_uuid || (request as any)?.headers?.['_user_uuid']
    );
    return {
      projectRepository: new ProjectRepository(new ProjectMongoConnection(), scope),
      sourceDocumentRepository: new SourceDocumentRepository(new SourceDocumentMongoConnection(), scope),
      auditEventRepository: new AuditEventRepository(new AuditEventMongoConnection(), scope),
    };
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
      const { projectRepository, sourceDocumentRepository, auditEventRepository } = await this.scoped(request);
      const project = await projectRepository.getProjectById(projectId);
      if (!project) {
        this.setStatus(404);
        return new Response().sendResponseFailure("Project not found", false);
      }

      const file = await this.parseUpload(request);
      const actor = await this.getActor(request);
      const linkedSections = this.parseLinkedSections(request);

      const uploadResult = await this.storageService.upload(file.buffer, file.originalname, projectId);

      const sourceDocument_useCase = new SourceDocumentUseCase(sourceDocumentRepository);
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

      await projectRepository.addAttachment(projectId, created._id);

      const extraction = await extractText(file.buffer, file.mimetype);
      // Parsing successfully is not the same as producing evidence. A scanned
      // PDF reads fine and yields nothing, and buildSourceExcerpts drops any
      // document with no text — so marking that 'processed' would leave the
      // customer believing they supplied something no section can ever cite.
      const usable = extraction.supported && extraction.text.trim().length > 0;
      const finalDoc = await sourceDocumentRepository.updateExtractedText(
        String(created._id),
        extraction.text,
        usable ? 'processed' : 'failed'
      );

      const auditEvent_useCase = new AuditEventUseCase(auditEventRepository);
      await new AuditEvent().record({
        projectId,
        actorUserId: actor.userId,
        actorRole: actor.role,
        eventType: 'SOURCE_DOCUMENT_UPLOADED',
        after: {
          filename: file.originalname,
          mimeType: file.mimetype,
          sizeBytes: uploadResult.sizeBytes,
          textExtracted: usable,
          extractedChars: extraction.text.trim().length,
          extractionIssue: usable ? undefined : extraction.reason,
        },
      }, auditEvent_useCase);

      if (!usable) {
        return new Response().sendResponseSuccess({
          ...finalDoc,
          _warning: `${extraction.reason || 'No text could be read from this file.'} The file is stored and linked to the project, but generation will not be able to cite it.`,
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
      const { projectRepository, sourceDocumentRepository, auditEventRepository } = await this.scoped(request);
      const result = await sourceDocumentRepository.getSourceDocumentsByProjectId(projectId);
      return new Response().sendResponseSuccess(result, true);
    } catch (Error) {
      this.setStatus(500);
      return new Response().sendResponseFailure("Something went wrong " + Error, false);
    }
  }
}

// Local-disk storage behind a narrow interface (upload/readFile/deleteFile) —
// the full surface a future S3/GCS swap needs to satisfy. This is an
// explicit placeholder: uploaded files live under carbon-credit/uploads/,
// git-ignored. Not yet suitable for real customer documents without a real
// storage vendor decision (see AGENT_BUILD_BRIEF.md / AGENT_BUILD_LOG.md).

import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class StorageServiceError extends Error {}

export interface IUploadResult {
  storageRef: string;
  sizeBytes: number;
}

export class StorageService {
  private readonly baseDir: string;

  constructor(baseDir?: string) {
    this.baseDir = baseDir || path.resolve(__dirname, '../../../uploads');
  }

  async upload(buffer: Buffer, originalFilename: string, projectId: string): Promise<IUploadResult> {
    const safeProjectId = this.sanitizeSegment(projectId);
    const dir = path.join(this.baseDir, safeProjectId);
    await fs.promises.mkdir(dir, { recursive: true });
    const ext = path.extname(originalFilename).slice(0, 10); // cap a pathological extension length
    const storedName = `${uuidv4()}${ext}`;
    await fs.promises.writeFile(path.join(dir, storedName), buffer);
    return { storageRef: `${safeProjectId}/${storedName}`, sizeBytes: buffer.length };
  }

  async readFile(storageRef: string): Promise<Buffer> {
    return fs.promises.readFile(this.resolvePath(storageRef));
  }

  async deleteFile(storageRef: string): Promise<void> {
    await fs.promises.unlink(this.resolvePath(storageRef)).catch(() => undefined);
  }

  private sanitizeSegment(segment: string): string {
    return segment.replace(/[^a-zA-Z0-9_-]/g, '_');
  }

  // storageRef values are read back from the database on every download —
  // treat them as untrusted input and reject anything that could escape
  // baseDir, even though nothing currently lets a caller set storageRef
  // directly.
  private resolvePath(storageRef: string): string {
    const normalized = path.normalize(storageRef);
    if (normalized.startsWith('..') || path.isAbsolute(normalized)) {
      throw new StorageServiceError(`Invalid storageRef: ${storageRef}`);
    }
    return path.join(this.baseDir, normalized);
  }
}

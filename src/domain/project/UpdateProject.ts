
import { IProjectInterface } from './projectInterface';
import { v4 as generateUUID } from 'uuid';
import { Types } from 'mongoose';

export class UpdateProject implements IProjectInterface {
  uuid?: string;
  section_a: Types.ObjectId;
  section_b!: Types.ObjectId;
  section_c!: Types.ObjectId;
  section_d!: Types.ObjectId;
  section_e!: Types.ObjectId;
  constructor(project: IProjectInterface) {
    if (!project.section_a) throw new Error('section_a missing!');
    if (!project.section_b) throw new Error('section_b missing!');
    if (!project.section_c) throw new Error('section_c missing!');
    if (!project.section_d) throw new Error('section_d missing!');
    if (!project.section_e) throw new Error('section_e missing!');
    this.uuid = project.uuid;
    this.section_a = project.section_a;
    this.section_b = project.section_b;
    this.section_c = project.section_c;
    this.section_d = project.section_d;
    this.section_e = project.section_e;
  }
}
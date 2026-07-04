
import { IProjectInterface, IUser } from './projectInterface';
import { v4 as generateUUID } from 'uuid';
export class CreateProject implements IProjectInterface {
  uuid!: string;
  company_name!: string;
  start_date!: Date;
  type!: string;
  location!: string;
  duration!: number;
  area!: string;
  user?: IUser
  constructor(project: IProjectInterface) {
    if (!project.company_name) throw new Error('company name missing!');
    if (!project.start_date) throw new Error('start date missing!');
    if (!project.type) throw new Error('project type missing!');
    if (!project.location) throw new Error('project location missing!');
    if (!project.duration) throw new Error('project duration missing!');
    if (!project.area) throw new Error('project area missing!');
    this.uuid = generateUUID();
    this.company_name = project.company_name;
    this.start_date = project.start_date;
    this.type = project.type;
    this.location = project.location;
    this.duration = project.duration;
    this.area = project.area;
    this.user = project.user
  }
}
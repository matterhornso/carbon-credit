import { Types } from 'mongoose';

export interface IProjectInterface {
  uuid?: string;
  company_name?: string;
  start_date?: Date;
  type?: string;
  location?: string;
  duration?: number;
  area?: string;
  section_a?: Types.ObjectId,
  section_b?: Types.ObjectId,
  section_c?: Types.ObjectId,
  section_d?: Types.ObjectId,
  section_e?: Types.ObjectId,
  user?: IUser,
}

export interface IUser {
  name: string;
  email: string;
  uuid: string;
  user_id: string;
}
import { ClassLevel } from '../entities/student.entity';

export class CreateStudentDto {
  user_id: number;
  class_level?: ClassLevel;
  birth_date?: Date | string;
  phone_number?: string;
  address?: string;
  parent_id?: number;
}

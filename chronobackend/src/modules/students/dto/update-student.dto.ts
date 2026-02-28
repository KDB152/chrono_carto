import { ClassLevel } from '../entities/student.entity';

export class UpdateStudentDto {
  class_level?: ClassLevel;
  birth_date?: Date | string;
  phone_number?: string;
  address?: string;
  parent_id?: number | null;
  progress_percentage?: number;
  total_quiz_attempts?: number;
  average_score?: number;
  last_activity?: Date | string;
}

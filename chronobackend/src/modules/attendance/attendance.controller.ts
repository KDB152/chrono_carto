import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { AttendanceService } from './attendance.service';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  async findAll(@Query('class') classLevel?: string, @Query('search') search?: string) {
    return await this.attendanceService.findAll({ classLevel, search });
  }

  @Post()
  async markAttendance(@Body() attendanceData: {
    studentId: number;
    date: string;
    isPresent: boolean;
    action?: string;
    seances_payees?: number;
    seances_non_payees?: number;
  }) {
    // Si c'est une mise à jour des séances
    if (attendanceData.action === 'update_sessions') {
      return await this.attendanceService.updateSessions({
        studentId: attendanceData.studentId,
        seances_payees: attendanceData.seances_payees || 0,
        seances_non_payees: attendanceData.seances_non_payees || 0
      });
    }
    
    // Sinon, c'est un marquage de présence normal
    return await this.attendanceService.markAttendance(attendanceData);
  }
}
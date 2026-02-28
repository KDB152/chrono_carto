import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('students')
@UseGuards(JwtAuthGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.studentsService.findAll({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 1000,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(parseInt(id));
  }

  @Get('by-user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.studentsService.findByUserId(parseInt(userId));
  }

  @Get(':id/parent')
  async getParent(@Param('id') id: string) {
    return this.studentsService.getParent(parseInt(id));
  }

  @Post()
  create(@Body() dto: CreateStudentDto) {
    return this.studentsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStudentDto) {
    return this.studentsService.update(parseInt(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentsService.remove(parseInt(id));
  }
}
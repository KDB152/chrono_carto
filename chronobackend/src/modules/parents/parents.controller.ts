import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ParentsService } from './parents.service';
import { CreateParentDto } from './dto/create-parent.dto';
import { UpdateParentDto } from './dto/update-parent.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('parents')
@UseGuards(JwtAuthGuard)
export class ParentsController {
  constructor(private readonly parentsService: ParentsService) { }

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.parentsService.findAll({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 1000,
    });
  }

  @Get('by-user/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.parentsService.findByUserIdWithUser(parseInt(userId));
  }

  @Get(':id/child')
  async getChild(@Param('id') id: string) {
    return this.parentsService.getChild(parseInt(id));
  }

  @Get('children')
  async getChildren(@Query('parentId') parentId: string) {
    return this.parentsService.getChildren(parseInt(parentId));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.parentsService.findOne(parseInt(id));
  }

  @Post()
  create(@Body() dto: CreateParentDto) {
    return this.parentsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateParentDto) {
    return this.parentsService.update(parseInt(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.parentsService.remove(parseInt(id));
  }
}
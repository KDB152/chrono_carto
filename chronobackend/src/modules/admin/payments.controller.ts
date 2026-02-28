import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('admin/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  async findAll(@Query('classLevel') classLevel?: string, @Query('status') status?: string, @Query('search') search?: string, @Query('parentId') parentId?: string) {
    if (parentId) {
      return await this.paymentsService.findByParentId(parseInt(parentId));
    }
    return await this.paymentsService.findAll({ classLevel, status, search });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.paymentsService.findOne(parseInt(id));
  }

  @Post()
  async create(@Body() paymentData: any) {
    return await this.paymentsService.create(paymentData);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateData: any) {
    return await this.paymentsService.update(parseInt(id), updateData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.paymentsService.remove(parseInt(id));
  }
}

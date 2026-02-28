import { Controller, Get, Post, Patch, Body, Query, Param, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentStatus } from './entities/payment.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('student/:studentId')
  @Roles(UserRole.ADMIN, UserRole.PARENT)
  async getPaymentsByStudent(@Param('studentId') studentId: number) {
    console.log('?? Getting payments for student:', studentId);
    
    try {
      const payments = await this.paymentsService.getPaymentsByStudent(studentId);
      
      return {
        success: true,
        data: payments.map(payment => ({
          id: payment.id,
          studentId: payment.studentId,
          studentName: `${payment.student.user.firstName} ${payment.student.user.lastName}`,
          classLevel: payment.classLevel,
          sessionDate: payment.sessionDate,
          amount: payment.amount,
          status: payment.status,
          type: payment.type,
          description: payment.description,
          dueDate: payment.dueDate,
          paidAt: payment.paidAt,
          createdAt: payment.createdAt
        }))
      };
    } catch (error) {
      console.error('? Error getting payments:', error);
      return {
        success: false,
        message: 'Error getting payments',
        error: error.message
      };
    }
  }

  @Get('class')
  @Roles(UserRole.ADMIN)
  async getPaymentsByClass(@Query('class') classLevel: string) {
    console.log('?? Getting payments for class:', classLevel);
    
    if (!classLevel) {
      return {
        success: false,
        message: 'Class level is required'
      };
    }

    try {
      const payments = await this.paymentsService.getPaymentsByClass(classLevel);
      
      return {
        success: true,
        data: payments.map(payment => ({
          id: payment.id,
          studentId: payment.studentId,
          studentName: `${payment.student.user.firstName} ${payment.student.user.lastName}`,
          classLevel: payment.classLevel,
          sessionDate: payment.sessionDate,
          amount: payment.amount,
          status: payment.status,
          type: payment.type,
          description: payment.description,
          dueDate: payment.dueDate,
          paidAt: payment.paidAt,
          createdAt: payment.createdAt
        }))
      };
    } catch (error) {
      console.error('? Error getting payments:', error);
      return {
        success: false,
        message: 'Error getting payments',
        error: error.message
      };
    }
  }

  @Get('stats')
  @Roles(UserRole.ADMIN)
  async getPaymentStats(@Query('class') classLevel?: string) {
    console.log('?? Getting payment stats for class:', classLevel);
    
    try {
      const stats = await this.paymentsService.getPaymentStats(classLevel);
      
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('? Error getting payment stats:', error);
      return {
        success: false,
        message: 'Error getting payment stats',
        error: error.message
      };
    }
  }

  @Get('overdue')
  @Roles(UserRole.ADMIN)
  async getOverduePayments() {
    console.log('?? Getting overdue payments');
    
    try {
      const payments = await this.paymentsService.getOverduePayments();
      
      return {
        success: true,
        data: payments.map(payment => ({
          id: payment.id,
          studentId: payment.studentId,
          studentName: `${payment.student.user.firstName} ${payment.student.user.lastName}`,
          classLevel: payment.classLevel,
          sessionDate: payment.sessionDate,
          amount: payment.amount,
          status: payment.status,
          type: payment.type,
          description: payment.description,
          dueDate: payment.dueDate,
          paidAt: payment.paidAt,
          createdAt: payment.createdAt
        }))
      };
    } catch (error) {
      console.error('? Error getting overdue payments:', error);
      return {
        success: false,
        message: 'Error getting overdue payments',
        error: error.message
      };
    }
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  async updatePaymentStatus(
    @Param('id') paymentId: number,
    @Body() body: { status: PaymentStatus; paidAt?: string }
  ) {
    console.log('?? Updating payment status:', paymentId, body);
    
    try {
      const paidAt = body.paidAt ? new Date(body.paidAt) : new Date();
      const payment = await this.paymentsService.updatePaymentStatus(
        paymentId, 
        body.status, 
        paidAt
      );
      
      return {
        success: true,
        message: 'Payment status updated successfully',
        data: {
          id: payment.id,
          status: payment.status,
          paidAt: payment.paidAt
        }
      };
    } catch (error) {
      console.error('? Error updating payment status:', error);
      return {
        success: false,
        message: 'Error updating payment status',
        error: error.message
      };
    }
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async createPayment(@Body() paymentData: {
    studentId: number;
    classLevel: string;
    sessionDate: string;
    amount: number;
    type: string;
    description?: string;
    dueDate?: string;
  }) {
    console.log('?? Creating payment:', paymentData);
    
    try {
      const payment = await this.paymentsService.createPayment({
        ...paymentData,
        sessionDate: new Date(paymentData.sessionDate),
        dueDate: paymentData.dueDate ? new Date(paymentData.dueDate) : undefined,
        type: paymentData.type as any
      });
      
      return {
        success: true,
        message: 'Payment created successfully',
        data: {
          id: payment.id,
          studentId: payment.studentId,
          amount: payment.amount,
          status: payment.status
        }
      };
    } catch (error) {
      console.error('? Error creating payment:', error);
      return {
        success: false,
        message: 'Error creating payment',
        error: error.message
      };
    }
  }
}

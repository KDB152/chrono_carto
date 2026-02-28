import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus, PaymentType } from './entities/payment.entity';
import { Student } from '../students/entities/student.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
  ) {}

  async getPaymentsByStudent(studentId: number) {
    console.log('?? Getting payments for student:', studentId);
    
    const payments = await this.paymentRepo.find({
      where: { studentId },
      relations: ['student', 'student.user'],
      order: { sessionDate: 'DESC' }
    });

    console.log('?? Found payments:', payments.length);
    return payments;
  }

  async getPaymentsByClass(classLevel: string) {
    console.log('?? Getting payments for class:', classLevel);
    
    const payments = await this.paymentRepo
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.student', 'student')
      .leftJoinAndSelect('student.user', 'user')
      .where('payment.classLevel = :classLevel', { classLevel })
      .orderBy('payment.sessionDate', 'DESC')
      .getMany();

    console.log('?? Found payments:', payments.length);
    return payments;
  }

  async getPaymentStats(classLevel?: string) {
    console.log('?? Getting payment stats for class:', classLevel);
    
    let query = this.paymentRepo.createQueryBuilder('payment')
      .leftJoinAndSelect('payment.student', 'student')
      .leftJoinAndSelect('student.user', 'user');

    if (classLevel) {
      query = query.where('payment.classLevel = :classLevel', { classLevel });
    }

    const payments = await query.getMany();

    // Calculer les statistiques
    const totalPayments = payments.length;
    const pendingPayments = payments.filter(p => p.status === PaymentStatus.PENDING).length;
    const paidPayments = payments.filter(p => p.status === PaymentStatus.PAID).length;
    const overduePayments = payments.filter(p => p.status === PaymentStatus.OVERDUE).length;
    
    const totalAmount = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const paidAmount = payments
      .filter(p => p.status === PaymentStatus.PAID)
      .reduce((sum, payment) => sum + Number(payment.amount), 0);
    const pendingAmount = payments
      .filter(p => p.status === PaymentStatus.PENDING)
      .reduce((sum, payment) => sum + Number(payment.amount), 0);

    return {
      totalPayments,
      pendingPayments,
      paidPayments,
      overduePayments,
      totalAmount,
      paidAmount,
      pendingAmount,
      classLevel: classLevel || 'Toutes les classes'
    };
  }

  async updatePaymentStatus(paymentId: number, status: PaymentStatus, paidAt?: Date) {
    console.log('?? Updating payment status:', paymentId, status);
    
    const payment = await this.paymentRepo.findOne({
      where: { id: paymentId }
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    payment.status = status;
    if (status === PaymentStatus.PAID && paidAt) {
      payment.paidAt = paidAt;
    }

    const updatedPayment = await this.paymentRepo.save(payment);
    console.log('? Payment updated:', updatedPayment.id);
    return updatedPayment;
  }

  async createPayment(paymentData: {
    studentId: number;
    classLevel: string;
    sessionDate: Date;
    amount: number;
    type: PaymentType;
    description?: string;
    dueDate?: Date;
  }) {
    console.log('?? Creating payment:', paymentData);
    
    const payment = this.paymentRepo.create({
      ...paymentData,
      status: PaymentStatus.PENDING
    });

    const savedPayment = await this.paymentRepo.save(payment);
    console.log('? Payment created:', savedPayment.id);
    return savedPayment;
  }

  async getOverduePayments() {
    console.log('?? Getting overdue payments');
    
    const today = new Date();
    const overduePayments = await this.paymentRepo
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.student', 'student')
      .leftJoinAndSelect('student.user', 'user')
      .where('payment.status = :status', { status: PaymentStatus.PENDING })
      .andWhere('payment.dueDate < :today', { today })
      .orderBy('payment.dueDate', 'ASC')
      .getMany();

    // Mettre à jour le statut des paiements en retard
    for (const payment of overduePayments) {
      if (payment.status === PaymentStatus.PENDING) {
        payment.status = PaymentStatus.OVERDUE;
        await this.paymentRepo.save(payment);
      }
    }

    console.log('?? Found overdue payments:', overduePayments.length);
    return overduePayments;
  }
}

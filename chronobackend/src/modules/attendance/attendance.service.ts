import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../students/entities/student.entity';
import { Payment } from '../admin/entities/payment.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async findAll(filters: { classLevel?: string; search?: string } = {}) {
    const query = this.studentRepository.createQueryBuilder('student')
      .leftJoin('users', 'user', 'student.user_id = user.id')
      .leftJoin('paiement', 'payment', 'payment.student_id = student.id')
      .leftJoin('parent_student', 'ps', 'ps.student_id = student.id')
      .leftJoin('parents', 'parent', 'ps.parent_id = parent.id')
      .leftJoin('users', 'parent_user', 'parent.user_id = parent_user.id')
      .select([
        'student.id as studentId',
        'user.id as id',
        'user.first_name as firstName',
        'user.last_name as lastName',
        'user.email as email',
        'student.phone_number as phone_number',
        'student.class_level as classLevel',
        'student.birth_date as birthDate',
        'student.progress_percentage as progressPercentage',
        'student.average_score as averageScore',
        'user.role as role',
        'user.is_active as isActive',
        'user.is_approved as isApproved',
        'user.created_at as createdAt',
        'COALESCE(payment.seances_payees, 0) as paid_sessions',
        'COALESCE(payment.seances_non_payees, 0) as unpaid_sessions',
        'COALESCE(payment.montant_paye, 0) as montant_paye',
        'COALESCE(payment.montant_restant, 0) as montant_restant',
        'COALESCE(payment.prix_seance, 40) as prix_seance',
        'COALESCE(payment.statut, \'en_attente\') as statut_paiement',
        'parent_user.first_name as parent_first_name',
        'parent_user.last_name as parent_last_name',
        'parent_user.email as parent_email'
      ]);

    if (filters.classLevel) {
      query.andWhere('student.class_level = :classLevel', { classLevel: filters.classLevel });
    }

    if (filters.search) {
      query.andWhere(
        '(user.first_name ILIKE :search OR user.last_name ILIKE :search OR user.email ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    const students = await query.getRawMany();

    // Transformer les données pour correspondre au format attendu
    return students.map(student => ({
      id: student.id,
      studentId: student.studentId,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone_number: student.phone_number,
      classLevel: student.classLevel,
      birthDate: student.birthDate,
      progressPercentage: student.progressPercentage || 0,
      averageScore: student.averageScore || 0,
      role: student.role,
      isActive: student.isActive,
      isApproved: student.isApproved,
      createdAt: student.createdAt,
      paid_sessions: parseInt(student.paid_sessions) || 0,
      unpaid_sessions: parseInt(student.unpaid_sessions) || 0,
      montant_paye: parseFloat(student.montant_paye) || 0,
      montant_restant: parseFloat(student.montant_restant) || 0,
      prix_seance: parseFloat(student.prix_seance) || 40,
      statut_paiement: student.statut_paiement,
      parent_first_name: student.parent_first_name,
      parent_last_name: student.parent_last_name,
      parent_email: student.parent_email
    }));
  }

  async markAttendance(attendanceData: {
    studentId: number;
    date: string;
    isPresent: boolean;
    action?: string;
  }) {
    const { studentId, date, isPresent, action } = attendanceData;

    if (isPresent && action === 'add_unpaid_session') {
      // Trouver ou créer un enregistrement de paiement pour cet étudiant
      let payment = await this.paymentRepository.findOne({
        where: { student_id: studentId }
      });

      if (!payment) {
        // Créer un nouvel enregistrement de paiement
        payment = this.paymentRepository.create({
          student_id: studentId,
          seances_total: 0,
          seances_payees: 0,
          seances_non_payees: 0,
          montant_total: 0,
          montant_paye: 0,
          montant_restant: 0,
          prix_seance: 40,
          statut: 'en_attente',
          date_derniere_presence: new Date(date)
        });
      }

      // Ajouter une séance non payée
      payment.seances_non_payees += 1;
      payment.seances_total = payment.seances_payees + payment.seances_non_payees;
      payment.montant_total = payment.seances_total * payment.prix_seance;
      payment.montant_restant = payment.seances_non_payees * payment.prix_seance;
      payment.date_derniere_presence = new Date(date);
      
      // Mettre à jour le statut
      if (payment.seances_payees > 0) {
        payment.statut = 'partiel';
      } else {
        payment.statut = 'en_attente';
      }

      await this.paymentRepository.save(payment);

      return {
        success: true,
        message: 'Séance non payée ajoutée avec succès',
        studentId,
        unpaidSessions: payment.seances_non_payees,
        totalSessions: payment.seances_total,
        remainingAmount: payment.montant_restant
      };
    }

    return {
      success: true,
      message: 'Présence enregistrée',
      studentId,
      isPresent
    };
  }

  async updateSessions(updateData: {
    studentId: number;
    seances_payees: number;
    seances_non_payees: number;
  }) {
    const { studentId, seances_payees, seances_non_payees } = updateData;

    // Trouver ou créer un enregistrement de paiement pour cet étudiant
    let payment = await this.paymentRepository.findOne({
      where: { student_id: studentId }
    });

    if (!payment) {
      // Créer un nouvel enregistrement de paiement
      payment = this.paymentRepository.create({
        student_id: studentId,
        seances_total: 0,
        seances_payees: 0,
        seances_non_payees: 0,
        montant_total: 0,
        montant_paye: 0,
        montant_restant: 0,
        prix_seance: 40,
        statut: 'en_attente'
      });
    }

    // Mettre à jour les séances
    payment.seances_payees = seances_payees;
    payment.seances_non_payees = seances_non_payees;
    payment.seances_total = seances_payees + seances_non_payees;
    payment.montant_total = payment.seances_total * payment.prix_seance;
    payment.montant_paye = seances_payees * payment.prix_seance;
    payment.montant_restant = seances_non_payees * payment.prix_seance;
    
    // Mettre à jour le statut
    if (seances_non_payees === 0) {
      payment.statut = 'paye';
    } else if (seances_payees > 0) {
      payment.statut = 'partiel';
    } else {
      payment.statut = 'en_attente';
    }

    await this.paymentRepository.save(payment);

    return {
      success: true,
      message: 'Séances mises à jour avec succès',
      studentId,
      seances_payees: payment.seances_payees,
      seances_non_payees: payment.seances_non_payees,
      seances_total: payment.seances_total,
      montant_total: payment.montant_total,
      montant_paye: payment.montant_paye,
      montant_restant: payment.montant_restant,
      statut: payment.statut
    };
  }
}
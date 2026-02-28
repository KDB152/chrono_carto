import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async findAll(filters: { classLevel?: string; status?: string; search?: string } = {}) {
    // Commencer par récupérer tous les étudiants
    const studentsQuery = this.paymentRepository.manager
      .createQueryBuilder()
      .select([
        'student.id as student_id',
        'student_user.id as user_id',
        'student_user.first_name as student_first_name',
        'student_user.last_name as student_last_name',
        'student_user.email as student_email',
        'student.class_level as class_level',
        'student.phone_number as student_phone',
        'parent_user.first_name as parent_first_name',
        'parent_user.last_name as parent_last_name',
        'parent_user.email as parent_email'
      ])
      .from('students', 'student')
      .leftJoin('users', 'student_user', 'student.user_id = student_user.id')
      .leftJoin('parent_student', 'ps', 'ps.student_id = student.id')
      .leftJoin('parents', 'parent', 'ps.parent_id = parent.id')
      .leftJoin('users', 'parent_user', 'parent.user_id = parent_user.id');

    if (filters.classLevel && filters.classLevel !== 'Total') {
      studentsQuery.andWhere('student.class_level = :classLevel', { classLevel: filters.classLevel });
    }

    if (filters.search) {
      studentsQuery.andWhere(
        '(student_user.first_name ILIKE :search OR student_user.last_name ILIKE :search OR student_user.email ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    const students = await studentsQuery.getRawMany();

    // Pour chaque étudiant, récupérer ou créer un enregistrement de paiement
    const payments = [];
    for (const student of students) {
      let payment = await this.paymentRepository.findOne({
        where: { student_id: student.student_id }
      });

      if (!payment) {
        // Créer un enregistrement de paiement vide pour cet étudiant
        payment = this.paymentRepository.create({
          student_id: student.student_id,
          seances_total: 0,
          seances_payees: 0,
          seances_non_payees: 0,
          montant_total: 0,
          montant_paye: 0,
          montant_restant: 0,
          prix_seance: 40,
          statut: 'en_attente'
        });
        await this.paymentRepository.save(payment);
      }

      // Filtrer par statut si nécessaire
      if (filters.status && filters.status !== 'Tous' && payment.statut !== filters.status) {
        continue;
      }

      payments.push({
        ...payment,
        student_first_name: student.student_first_name,
        student_last_name: student.student_last_name,
        student_email: student.student_email,
        class_level: student.class_level,
        student_phone: student.student_phone,
        parent_first_name: student.parent_first_name,
        parent_last_name: student.parent_last_name,
        parent_email: student.parent_email
      });
    }

    return payments;
  }

  async findOne(id: number) {
    return await this.paymentRepository.findOne({
      where: { id },
      relations: ['student', 'parent']
    });
  }

  async update(id: number, updateData: Partial<Payment>) {
    // Si on met à jour les séances, recalculer les montants
    if (updateData.seances_payees !== undefined || updateData.seances_non_payees !== undefined) {
      const payment = await this.paymentRepository.findOne({ where: { id } });
      if (payment) {
        const prixSeance = payment.prix_seance || 40;
        const seancesTotal = updateData.seances_payees + updateData.seances_non_payees;
        const montantTotal = seancesTotal * prixSeance;
        const montantPaye = updateData.seances_payees * prixSeance;
        const montantRestant = montantTotal - montantPaye;
        
        updateData = {
          ...updateData,
          seances_total: seancesTotal,
          montant_total: montantTotal,
          montant_paye: montantPaye,
          montant_restant: montantRestant,
          statut: montantRestant === 0 ? 'paye' : (montantPaye > 0 ? 'partiel' : 'en_attente')
        };
      }
    }
    
    await this.paymentRepository.update(id, updateData);
    return await this.findOne(id);
  }

  async create(paymentData: Partial<Payment>) {
    const payment = this.paymentRepository.create(paymentData);
    return await this.paymentRepository.save(payment);
  }

  async remove(id: number) {
    return await this.paymentRepository.delete(id);
  }

  async findByParentId(parentId: number) {
    // Récupérer les étudiants liés à ce parent
    const studentsQuery = this.paymentRepository.manager
      .createQueryBuilder()
      .select([
        'student.id as student_id',
        'student_user.id as user_id',
        'student_user.first_name as student_first_name',
        'student_user.last_name as student_last_name',
        'student_user.email as student_email',
        'student.class_level as class_level',
        'student.phone_number as student_phone',
        'parent_user.first_name as parent_first_name',
        'parent_user.last_name as parent_last_name',
        'parent_user.email as parent_email'
      ])
      .from('students', 'student')
      .leftJoin('users', 'student_user', 'student.user_id = student_user.id')
      .leftJoin('parent_student', 'ps', 'ps.student_id = student.id')
      .leftJoin('parents', 'parent', 'ps.parent_id = parent.id')
      .leftJoin('users', 'parent_user', 'parent.user_id = parent_user.id')
      .where('parent.user_id = :parentId', { parentId });

    const students = await studentsQuery.getRawMany();

    // Pour chaque étudiant, récupérer ou créer un enregistrement de paiement
    const payments = [];
    for (const student of students) {
      let payment = await this.paymentRepository.findOne({
        where: { student_id: student.student_id }
      });

      if (!payment) {
        // Créer un enregistrement de paiement vide pour cet étudiant
        payment = this.paymentRepository.create({
          student_id: student.student_id,
          seances_total: 0,
          seances_payees: 0,
          seances_non_payees: 0,
          montant_total: 0,
          montant_paye: 0,
          montant_restant: 0,
          prix_seance: 40,
          statut: 'en_attente'
        });
        await this.paymentRepository.save(payment);
      }

      payments.push({
        ...payment,
        student_first_name: student.student_first_name,
        student_last_name: student.student_last_name,
        student_email: student.student_email,
        class_level: student.class_level,
        student_phone: student.student_phone,
        parent_first_name: student.parent_first_name,
        parent_last_name: student.parent_last_name,
        parent_email: student.parent_email
      });
    }

    return payments;
  }
}

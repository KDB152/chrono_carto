import { NextRequest, NextResponse } from 'next/server';
import urlapi from '@/config/url'
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classFilter = searchParams.get('classLevel');
    const searchQuery = searchParams.get('search');

    console.log('������ API de fallback pour les paiements');

    // Récupérer les étudiants depuis l'API students
    const studentsResponse = await fetch(`${request.nextUrl.origin}${urlapi.backendurlsapi.students}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!studentsResponse.ok) {
      throw new Error('Erreur lors de la récupération des étudiants');
    }

    const studentsData = await studentsResponse.json();
    console.log('✅ Étudiants récupérés:', studentsData);

    // Adapter les données des étudiants en format paiement
    let students = [];
    if (studentsData.items) {
      students = studentsData.items;
    } else if (Array.isArray(studentsData)) {
      students = studentsData;
    }

    const payments = students.map((student: any, index: number) => ({
      id: index + 1,
      student_id: student.studentId || student.id,
      parent_id: null,
      seances_total: 0,
      seances_non_payees: 0,
      seances_payees: 0,
      montant_total: 0,
      montant_paye: 0,
      montant_restant: 0,
      prix_seance: 40,
      statut: 'en_attente',
      date_derniere_presence: null,
      date_dernier_paiement: null,
      student_first_name: student.firstName || student.first_name || '',
      student_last_name: student.lastName || student.last_name || '',
      class_level: student.classLevel || student.class_level || '',
      parent_first_name: null,
      parent_last_name: null,
      date_creation: student.createdAt || new Date().toISOString()
    }));

    // Filtrer par classe si nécessaire
    let filteredPayments = payments;
    if (classFilter && classFilter !== 'Total') {
      filteredPayments = payments.filter(payment => 
        payment.class_level === classFilter
      );
    }

    // Filtrer par recherche si nécessaire
    if (searchQuery) {
      filteredPayments = filteredPayments.filter(payment => 
        payment.student_first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.student_last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.class_level.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    console.log('✅ Paiements formatés:', filteredPayments);

    return NextResponse.json(filteredPayments);
    
  } catch (error) {
    console.error('Erreur lors de la récupération des paiements de fallback:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement des paiements de fallback' },
      { status: 500 }
    );
  }
}
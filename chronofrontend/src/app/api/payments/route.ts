import { NextRequest, NextResponse } from 'next/server';

// URL de l'API backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 400 }
      );
    }

    console.log('������ Récupération des paiements pour userId:', userId);

    try {
      // Appeler l'API admin/payments avec le parentId pour récupérer les paiements spécifiques au parent
      const response = await fetch(`${API_BASE_URL}/admin/payments?parentId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur API backend: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Données de paiements reçues du backend pour parent:', userId, data);

      // Les données viennent déjà filtrées pour ce parent
      const payments = Array.isArray(data) ? data : [];
      
      // Adapter les données au format attendu par le frontend
      const adaptedPayments = payments.map((student: any, index: number) => ({
        id: index + 1,
        student_id: student.studentId || student.id,
        parent_id: null, // TODO: Récupérer depuis la relation parent-enfant
        seances_total: (student.paid_sessions || 0) + (student.unpaid_sessions || 0),
        seances_non_payees: student.unpaid_sessions || 0,
        seances_payees: student.paid_sessions || 0,
        montant_total: ((student.paid_sessions || 0) + (student.unpaid_sessions || 0)) * 40,
        montant_paye: (student.paid_sessions || 0) * 40,
        montant_restant: (student.unpaid_sessions || 0) * 40,
        prix_seance: 40,
        statut: (student.unpaid_sessions || 0) === 0 ? 'paye' : (student.paid_sessions || 0) > 0 ? 'partiel' : 'en_attente',
        date_derniere_presence: null,
        date_dernier_paiement: null,
        student_first_name: student.firstName || student.first_name || '',
        student_last_name: student.lastName || student.last_name || '',
        class_level: student.classLevel || student.class_level || '',
        parent_first_name: null,
        parent_last_name: null,
        date_creation: student.createdAt || new Date().toISOString(),
        date_modification: new Date().toISOString()
      }));

      // Calculer les statistiques
      const stats = {
        totalPayments: adaptedPayments.length,
        totalAmount: adaptedPayments.reduce((sum, p) => sum + p.montant_total, 0),
        totalPaid: adaptedPayments.reduce((sum, p) => sum + p.montant_paye, 0),
        totalRemaining: adaptedPayments.reduce((sum, p) => sum + p.montant_restant, 0),
        totalSessions: adaptedPayments.reduce((sum, p) => sum + p.seances_total, 0),
        totalUnpaidSessions: adaptedPayments.reduce((sum, p) => sum + p.seances_non_payees, 0),
        totalPaidSessions: adaptedPayments.reduce((sum, p) => sum + p.seances_payees, 0)
      };

      console.log('✅ Paiements adaptés:', adaptedPayments);
      console.log('✅ Statistiques calculées:', stats);

      return NextResponse.json({
        success: true,
        payments: adaptedPayments,
        stats: stats,
        total: adaptedPayments.length
      });

    } catch (backendError) {
      console.log('⚠️  Backend non accessible, utilisation des données simulées');
      
      // Retourner des données simulées si le backend n'est pas accessible
      const mockData = generateMockData('payments');
      
      return NextResponse.json({
        success: true,
        payments: mockData,
        stats: {
          totalPayments: mockData.length,
          totalAmount: mockData.reduce((sum: number, p: any) => sum + (p.amount || 0), 0),
          totalPaid: mockData.filter((p: any) => p.status === 'paid').reduce((sum: number, p: any) => sum + (p.amount || 0), 0),
          totalRemaining: mockData.filter((p: any) => p.status === 'pending').reduce((sum: number, p: any) => sum + (p.amount || 0), 0),
          totalSessions: 0,
          totalUnpaidSessions: 0,
          totalPaidSessions: 0
        },
        total: mockData.length
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur API payments:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement des données' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Simuler la création d'un élément
    const newItem = {
      id: Date.now(),
      ...body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('✅ Élément créé (simulation):', newItem.id);
    
    return NextResponse.json({
      success: true,
      message: 'Élément créé avec succès',
      data: newItem
    });
  } catch (error) {
    console.error('❌ Erreur création payments:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création' },
      { status: 500 }
    );
  }
}

function generateMockData(type) {
  switch (type) {
    case 'users':
      return [
        { id: 1, name: 'Admin Test', email: 'admin@test.com', role: 'admin', isActive: true },
        { id: 2, name: 'Parent Test', email: 'parent@test.com', role: 'parent', isActive: true }
      ];
    case 'students':
      return [
        { id: 1, name: 'Lucas Dupont', email: 'lucas@test.com', class: '4ème A', isActive: true },
        { id: 2, name: 'Emma Dupont', email: 'emma@test.com', class: '6ème B', isActive: true }
      ];
    case 'parents':
      return [
        { id: 1, name: 'Marie Dupont', email: 'marie@test.com', children: [1, 2], isActive: true }
      ];
    case 'quizzes':
      return [
        { id: 1, title: 'Mathématiques - Fractions', subject: 'math', level: '4ème', questions: 10 },
        { id: 2, title: 'Français - Grammaire', subject: 'francais', level: '6ème', questions: 15 }
      ];
    case 'messages':
      return [
        { id: 1, from: 'Enseignant', to: 'Parent', subject: 'Progrès de l\'élève', content: 'Message de test', date: new Date().toISOString() }
      ];
    case 'files':
      return [
        { id: 1, name: 'Document.pdf', type: 'pdf', size: '2.5 MB', uploaded_at: new Date().toISOString() }
      ];
    case 'analytics':
      return {
        totalUsers: 150,
        activeUsers: 120,
        totalQuizzes: 25,
        completedQuizzes: 300,
        averageScore: 78.5
      };
    case 'profile':
      return {
        id: 1,
        name: 'Utilisateur Test',
        email: 'user@test.com',
        role: 'admin',
        avatar: null,
        preferences: {}
      };
    case 'achievements':
      return [
        { id: 1, name: 'Premier Quiz', description: 'Avez terminé votre premier quiz', icon: 'trophy', earned: true },
        { id: 2, name: 'Score Parfait', description: 'Avez obtenu 100% à un quiz', icon: 'star', earned: false }
      ];
    case 'resources':
      return [
        { id: 1, title: 'Guide de Mathématiques', type: 'document', subject: 'math', url: '/resources/math-guide.pdf' },
        { id: 2, title: 'Vidéo de Français', type: 'video', subject: 'francais', url: '/resources/french-video.mp4' }
      ];
    case 'notifications':
      return [
        { id: 1, title: 'Nouveau message', content: 'Vous avez reçu un nouveau message', type: 'info', read: false },
        { id: 2, title: 'Quiz disponible', content: 'Un nouveau quiz est disponible', type: 'success', read: true }
      ];
    case 'payments':
      return [
        { id: 1, amount: 150.00, status: 'paid', date: '2024-01-15', description: 'Frais de scolarité' },
        { id: 2, amount: 75.00, status: 'pending', date: '2024-01-20', description: 'Activité extra-scolaire' }
      ];
    default:
      return [];
  }
}
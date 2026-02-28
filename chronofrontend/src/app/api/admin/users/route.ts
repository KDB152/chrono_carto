import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Simuler les données pour users
    const mockData = generateMockData('users');
    
    console.log('✅ Données simulées retournées pour users:', mockData.length || 'N/A');
    
    return NextResponse.json({
      success: true,
      data: mockData,
      total: Array.isArray(mockData) ? mockData.length : 1
    });
  } catch (error) {
    console.error('❌ Erreur API users:', error);
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
    console.error('❌ Erreur création users:', error);
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
        { id: 1, from: 'Enseignant', to: 'Parent', subject: 'Progrès de l`élève', content: 'Message de test', date: new Date().toISOString() }
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
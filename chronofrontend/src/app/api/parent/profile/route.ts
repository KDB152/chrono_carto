import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Configuration de la base de données MySQL
const dbConfig = {
  host: process.env.DB_HOST!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Fonction pour créer une connexion à la base de données
async function getConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connexion MySQL établie avec succès');
    return connection;
  } catch (error) {
    console.error('Erreur de connexion MySQL:', error);
    throw error;
  }
}

// Fonction pour récupérer l'ID du parent connecté
async function getCurrentParentId(request: NextRequest): Promise<number | null> {
  try {
    // Méthode 1: Depuis les headers d'autorisation (si vous utilisez JWT)
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // TODO: Décoder le token JWT pour récupérer l'ID du parent
      // const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // return decoded.parentId;
    }

    // Méthode 2: Depuis les cookies de session
    const sessionCookie = request.cookies.get('session');
    if (sessionCookie) {
      // TODO: Décoder la session pour récupérer l'ID du parent
      // const session = JSON.parse(sessionCookie.value);
      // return session.parentId;
    }

    // Méthode 3: Depuis les paramètres de requête (temporaire pour les tests)
    const url = new URL(request.url);
    const parentIdParam = url.searchParams.get('parentId');
    if (parentIdParam) {
      return parseInt(parentIdParam);
    }

    // Méthode 4: Depuis le localStorage côté client (à implémenter)
    // Pour l'instant, on utilise un ID par défaut pour les tests
    console.log('⚠️  Aucun ID parent trouvé, utilisation de l\'ID par défaut pour les tests');
    return 1; // ID par défaut pour les tests - À REMPLACER par l'authentification réelle

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'ID parent:', error);
    return null;
  }
}

// GET - Récupérer le profil du parent connecté et ses enfants
export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/parent/profile appelé');
    
    // Récupérer l'ID du parent connecté
    const parentId = await getCurrentParentId(request);
    
    if (!parentId) {
      return NextResponse.json(
        { error: 'Parent non authentifié ou ID non trouvé' },
        { status: 401 }
      );
    }

    console.log(`Récupération du profil pour le parent ID: ${parentId}`);
    
    const connection = await getConnection();
    
    // Récupérer les informations du parent
    const [parentRows] = await connection.execute(`
      SELECT 
        p.id,
        p.phone_number,
        p.address,
        p.occupation,
        u.first_name,
        u.last_name,
        u.email,
        u.phone as user_phone
      FROM parents p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `, [parentId]);
    
    if ((parentRows as any[]).length === 0) {
      await connection.end();
      
      // Retourner des données de test si aucun parent trouvé
      console.log('⚠️  Aucun parent trouvé en base, retour de données de test');
      const testProfile = {
        id: parentId,
        firstName: 'Marie',
        lastName: 'Dupont',
        fullName: 'Marie Dupont',
        email: 'marie.dupont@email.com',
        phone_number: '06 12 34 56 78',
        address: '123 Rue de la Paix, 75001 Paris',
        occupation: 'Ingénieure',
        children: [
          {
            id: 1,
            firstName: 'Lucas',
            lastName: 'Dupont',
            fullName: 'Lucas Dupont',
            email: 'lucas.dupont@email.com',
            classLevel: '4ème A',
            birthDate: '2010-05-15',
            phone_number: '06 11 22 33 44',
            address: '123 Rue de la Paix, 75001 Paris'
          },
          {
            id: 2,
            firstName: 'Emma',
            lastName: 'Dupont',
            fullName: 'Emma Dupont',
            email: 'emma.dupont@email.com',
            classLevel: '6ème B',
            birthDate: '2012-08-22',
            phone_number: '06 55 66 77 88',
            address: '123 Rue de la Paix, 75001 Paris'
          }
        ]
      };
      
      return NextResponse.json(testProfile);
    }
    
    const parent = (parentRows as any[])[0];
    
    // Récupérer les enfants du parent
    const [childrenRows] = await connection.execute(`
      SELECT 
        s.id,
        s.class_level,
        s.birth_date,
        s.phone_number,
        s.address,
        u.first_name,
        u.last_name,
        u.email
      FROM parent_student ps
      JOIN students s ON ps.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE ps.parent_id = ?
      ORDER BY u.first_name, u.last_name
    `, [parentId]);
    
    await connection.end();
    
    const children = (childrenRows as any[]).map(child => ({
      id: child.id,
      firstName: child.first_name,
      lastName: child.last_name,
      fullName: `${child.first_name} ${child.last_name}`,
      email: child.email,
      classLevel: child.class_level,
      birthDate: child.birth_date,
      phone_number: child.phone_number,
      address: child.address
    }));
    
    const profile = {
      id: parent.id,
      firstName: parent.first_name,
      lastName: parent.last_name,
      fullName: `${parent.first_name} ${parent.last_name}`,
      email: parent.email,
      phone_number: parent.phone_number || parent.user_phone,
      address: parent.address,
      occupation: parent.occupation,
      children: children
    };
    
    console.log('Profil parent récupéré:', {
      parentId: profile.id,
      parentName: profile.fullName,
      childrenCount: children.length,
      children: children.map(c => `${c.fullName} (ID: ${c.id})`)
    });
    
    return NextResponse.json(profile);
  } catch (error) {
    console.error('Erreur lors de la récupération du profil parent:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du profil parent' },
      { status: 500 }
    );
  }
}


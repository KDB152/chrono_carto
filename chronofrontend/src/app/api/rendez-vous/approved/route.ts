import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Configuration de la base de donn�es MySQL
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

// Fonction pour cr�er une connexion � la base de donn�es
async function getConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    return connection;
  } catch (error) {
    console.error('Erreur de connexion � la base de donn�es:', error);
    throw error;
  }
}

// GET - R�cup�rer les rendez-vous approuv�s
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId');
    const adminId = searchParams.get('adminId');
    const date = searchParams.get('date');
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    
    const connection = await getConnection();
    
     let query = `
       SELECT 
         id,
         parent_id,
         parent_name,
         parent_email,
         parent_phone,
         child_name,
         child_class,
         timing,
         appointment_time,
         parent_reason,
         admin_reason,
         status,
         child_id,
         created_at,
         updated_at
       FROM rendez_vous 
       WHERE status IN ('accepted', 'approved')
     `;
    
    const params: any[] = [];
    
    // Filtrer par parent si sp�cifi�
    if (parentId) {
      query += ' AND parent_id = ?';
      params.push(parentId);
    }
    
    // Filtrer par date si sp�cifi�
    if (date) {
      query += ' AND DATE(timing) = ?';
      params.push(date);
    }
    
    // Filtrer par mois/ann�e si sp�cifi�
    if (month && year) {
      query += ' AND MONTH(timing) = ? AND YEAR(timing) = ?';
      params.push(parseInt(month), parseInt(year));
    }
    
    query += ' ORDER BY timing ASC';
    
    console.log('?? Requ�te SQL:', query);
    console.log('?? Param�tres:', params);
    
    const [rows] = await connection.execute(query, params);
    await connection.end();
    
    console.log('?? Nombre de rendez-vous trouv�s:', (rows as any[]).length);
    console.log('?? Rendez-vous bruts:', rows);
    
     // Transformer les donn�es pour le calendrier
     const appointments = (rows as any[]).map(row => {
       console.log('?? Donn�es du rendez-vous:', {
         id: row.id,
         timing: row.timing,
         appointment_time: row.appointment_time,
         parent_name: row.parent_name,
         child_name: row.child_name
       });
       
       // Utiliser appointment_time si disponible (maintenant datetime complet)
       let appointmentDateTime = row.appointment_time;
       let appointmentTime = '00:00';
       let dateStr = '';
       
       if (appointmentDateTime) {
         // appointment_time contient maintenant la date et heure compl�tes
         const appointmentDate = new Date(appointmentDateTime);
         dateStr = appointmentDate.toISOString().split('T')[0];
         appointmentTime = appointmentDate.toTimeString().split(' ')[0].substring(0, 5);
       } else {
         // Fallback : utiliser timing
         const timingDate = new Date(row.timing);
         dateStr = timingDate.toISOString().split('T')[0];
         appointmentTime = timingDate.toTimeString().split(' ')[0].substring(0, 5);
       }
       
       // Utiliser appointment_time complet ou combiner date + heure
       const fullDateTime = appointmentDateTime || `${dateStr}T${appointmentTime}:00`;
       
       console.log('? Donn�es transform�es:', {
         date: dateStr,
         time: appointmentTime,
         fullDateTime: fullDateTime,
         originalTiming: row.timing
       });
       
       return {
         id: `appointment-${row.id}`,
         title: `Rendez-vous - ${row.child_name}`,
         description: row.parent_reason,
         date: dateStr,
         time: appointmentTime,
         fullDateTime: fullDateTime, // Date et heure compl�tes
         duration: 60, // Dur�e par d�faut d'1 heure
         type: 'meeting',
         location: 'Bureau administratif',
         participants: [row.parent_name, row.child_name],
         isRecurring: false,
         priority: 'high',
         status: 'scheduled',
         reminders: [],
         attachments: [],
         notes: `Raison: ${row.parent_reason}${row.admin_reason ? ` | Admin: ${row.admin_reason}` : ''}`,
         createdBy: 'parent',
         createdAt: row.created_at,
         updatedAt: row.updated_at,
         isAppointment: true,
         parentName: row.parent_name,
         childName: row.child_name,
         childClass: row.child_class,
         parentReason: row.parent_reason,
         adminReason: row.admin_reason,
         originalAppointmentTime: row.appointment_time, // Heure originale choisie par le parent
         originalTiming: row.timing // Date/heure originale compl�te
       };
     });
    
    return NextResponse.json(appointments);
    
  } catch (error) {
    console.error('Erreur lors du chargement des rendez-vous approuv�s:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement des rendez-vous' },
      { status: 500 }
    );
  }
}

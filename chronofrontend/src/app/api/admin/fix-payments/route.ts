import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  port: parseInt(process.env.DB_PORT || '3306')
};

async function getConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    return connection;
  } catch (error) {
    console.error('Erreur de connexion MySQL:', error);
    throw error;
  }
}

export async function POST() {
  try {
    const connection = await getConnection();
    
    console.log('🔧 Début de la correction des paiements...');
    
    // 1. Corriger tous les montant_total existants
    const [updateResult] = await connection.execute(`
      UPDATE paiement 
      SET montant_total = COALESCE(montant_paye, 0) + COALESCE(montant_restant, 0)
      WHERE montant_total = 0 OR montant_total IS NULL
    `);
    
    console.log('✅ Montants totaux corrigés:', updateResult);
    
    // 2. Corriger les séances totales
    const [updateSessionsResult] = await connection.execute(`
      UPDATE paiement 
      SET seances_total = COALESCE(seances_payees, 0) + COALESCE(seances_non_payees, 0)
      WHERE seances_total = 0 OR seances_total IS NULL
    `);
    
    console.log('✅ Séances totales corrigées:', updateSessionsResult);
    
    // 3. Corriger les statuts
    const [updateStatusResult] = await connection.execute(`
      UPDATE paiement 
      SET statut = CASE 
        WHEN COALESCE(montant_restant, 0) = 0 THEN 'paye'
        WHEN COALESCE(montant_paye, 0) > 0 THEN 'partiel'
        ELSE 'en_attente'
      END
      WHERE statut IS NULL OR statut = ''
    `);
    
    console.log('✅ Statuts corrigés:', updateStatusResult);
    
    // 4. Vérifier le résultat
    const [checkResult] = await connection.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(COALESCE(montant_total, 0)) as total_montants,
        SUM(COALESCE(montant_paye, 0)) as total_paye,
        SUM(COALESCE(montant_restant, 0)) as total_restant
      FROM paiement
    `);
    
    await connection.end();
    
    console.log('✅ Correction terminée ! Résultat:', (checkResult as any)[0]);
    
    return NextResponse.json({
      message: 'Correction des paiements terminée avec succès !',
      result: (checkResult as any)[0],
      updates: {
        montants: updateResult,
        sessions: updateSessionsResult,
        status: updateStatusResult
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la correction des paiements' },
      { status: 500 }
    );
  }
}


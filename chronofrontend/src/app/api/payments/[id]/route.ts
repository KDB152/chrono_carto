import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Configuration de la base de donn�es MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'db',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USERNAME!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
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
    console.error('Erreur de connexion MySQL:', error);
    throw error;
  }
}

// PATCH - Mettre � jour un paiement
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const paymentId = params.id;
    const body = await request.json();
    
    console.log('?? PATCH /api/payments/[id] - Payment ID:', paymentId);
    console.log('?? PATCH /api/payments/[id] - Body:', body);

    const connection = await getConnection();

    // Construire la requ�te de mise � jour dynamiquement
    const updateFields = [];
    const values = [];

    if (body.seances_payees !== undefined) {
      updateFields.push('seances_payees = ?');
      values.push(body.seances_payees);
    }
    if (body.seances_non_payees !== undefined) {
      updateFields.push('seances_non_payees = ?');
      values.push(body.seances_non_payees);
    }
    if (body.montant_total !== undefined) {
      updateFields.push('montant_total = ?');
      values.push(body.montant_total);
    }
    if (body.montant_paye !== undefined) {
      updateFields.push('montant_paye = ?');
      values.push(body.montant_paye);
    }
    if (body.montant_restant !== undefined) {
      updateFields.push('montant_restant = ?');
      values.push(body.montant_restant);
    }
    if (body.statut !== undefined) {
      updateFields.push('statut = ?');
      values.push(body.statut);
    }
    if (body.date_dernier_paiement !== undefined) {
      updateFields.push('date_dernier_paiement = ?');
      values.push(body.date_dernier_paiement);
    }

    if (updateFields.length === 0) {
      await connection.end();
      return NextResponse.json(
        { error: 'Aucun champ � mettre � jour' },
        { status: 400 }
      );
    }

    // Ajouter la date de modification
    updateFields.push('date_modification = CURRENT_TIMESTAMP');
    values.push(paymentId);

    const query = `UPDATE paiement SET ${updateFields.join(', ')} WHERE id = ?`;
    console.log('?? PATCH Query:', query);
    console.log('?? PATCH Values:', values);

    const [result] = await connection.execute(query, values);
    await connection.end();

    console.log('?? PATCH Result:', result);

    return NextResponse.json({ 
      success: true, 
      message: 'Paiement mis � jour avec succ�s',
      data: { id: paymentId, ...body }
    });

  } catch (error) {
    console.error('? Erreur PATCH payment:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise � jour du paiement' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un paiement
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const paymentId = params.id;
    
    console.log('?? DELETE /api/payments/[id] - Payment ID:', paymentId);

    const connection = await getConnection();

    const [result] = await connection.execute(
      'DELETE FROM paiement WHERE id = ?',
      [paymentId]
    );

    await connection.end();

    console.log('?? DELETE Result:', result);

    return NextResponse.json({ 
      success: true, 
      message: 'Paiement supprim� avec succ�s'
    });

  } catch (error) {
    console.error('? Erreur DELETE payment:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du paiement' },
      { status: 500 }
    );
  }
}

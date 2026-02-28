import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('?? API Admin Payments Fix - Récupération des paiements...');
    
    // Données de test pour vérifier que l'API fonctionne
    const testPayments = [
      {
        id: 1,
        student_id: 1,
        parent_id: 1,
        student_name: 'Mehdi El Abed',
        parent_name: 'Aucun parent',
        class_level: 'Terminale groupe 3',
        seances_total: 2,
        seances_payees: 0,
        seances_non_payees: 2,
        montant_total: 80.00,
        montant_paye: 0.00,
        montant_restant: 80.00,
        statut: 'en_attente',
        date_creation: '2024-01-01T00:00:00Z',
        date_modification: '2024-01-15T10:30:00Z'
      }
    ];
    
    const stats = {
      totalPayments: testPayments.length,
      totalAmount: testPayments.reduce((sum, p) => sum + p.montant_total, 0),
      paidAmount: testPayments.reduce((sum, p) => sum + p.montant_paye, 0),
      unpaidAmount: testPayments.reduce((sum, p) => sum + p.montant_restant, 0)
    };
    
    console.log(`? ${testPayments.length} paiements retournés (données de test)`);
    
    return NextResponse.json({
      payments: testPayments,
      stats,
      total: testPayments.length
    });
    
  } catch (error) {
    console.error('? Erreur API payments-fix:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors du chargement des paiements' },
      { status: 500 }
    );
  }
}

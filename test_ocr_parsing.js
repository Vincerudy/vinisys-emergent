// Test du parsing OCR avec le texte de la facture fournie par l'utilisateur
// Simule le texte qui serait extrait par Tesseract.js de l'image

const simulateParseReceiptData = (text) => {
    console.log('🔍 Test du parsing OCR avec le texte de la facture');
    console.log('📄 Texte à analyser:', text.substring(0, 200) + '...');
    
    // Utilitaire pour convertir nom de mois en numéro
    const getMonthNumber = (monthName) => {
      const months = {
        'jan': '01', 'janvier': '01',
        'feb': '02', 'février': '02', 'fev': '02',
        'mar': '03', 'mars': '03',
        'apr': '04', 'avril': '04', 'avr': '04',
        'may': '05', 'mai': '05',
        'jun': '06', 'juin': '06',
        'jul': '07', 'juillet': '07',
        'aug': '08', 'août': '08', 'aout': '08',
        'sep': '09', 'septembre': '09',
        'oct': '10', 'octobre': '10',
        'nov': '11', 'novembre': '11',
        'dec': '12', 'décembre': '12', 'decembre': '12'
      };
      return months[monthName.toLowerCase()];
    };
    
    const data = {
      vendeur: '',
      montant_ttc: '',
      montant_ht: '',
      montant_tva: '',
      date_frais: '',
      description: '',
      type_frais: 'repas',
      tva_taux: null,
      tva_multiple: [],
      moyen_paiement: 'Carte de Crédit Société'
    };

    const textLower = text.toLowerCase();

    // Patterns améliorés pour les factures françaises
    const montantHTPatterns = [
      // Pattern spécifique pour "Total H.T."
      /total\s+h\.?t\.?\s*:?\s*(\d+\s*\d*)\s*€?/gi,
      /(?:total\s+)?h[.t]\s*:?\s*(\d+\s*\d*)\s*€?/gi,
      /(?:sous.?total|base)\s*:?\s*(\d+\s*\d*)\s*€?/gi,
      /(\d+\s*\d*)\s*€?\s*h[.t]/gi,
      // Pattern pour montants avec espaces (ex: "5 000€")
      /h\.?t\.?\s*:?\s*(\d+(?:\s+\d{3})*)\s*€?/gi
    ];

    const montantTVAPatterns = [
      // Pattern spécifique pour "T.V.A. 20%"
      /t\.?v\.?a\.?\s*\d+\s*%\s*:?\s*(\d+(?:\s+\d{3})*)\s*€?/gi,
      /tva?\s*(?:\d+[,.]?\d*\s*%\s*)?:?\s*(\d+(?:\s+\d{3})*)\s*€?/gi,
      /(?:montant\s+)?tva?\s*:?\s*(\d+(?:\s+\d{3})*)\s*€?/gi,
      /(\d+(?:\s+\d{3})*)\s*€?\s*tva?/gi
    ];

    const montantTTCPatterns = [
      // Pattern spécifique pour "Total TTC à payer"
      /total\s+ttc\s+à\s+payer\s*:?\s*(\d+(?:\s+\d{3})*)\s*€?/gi,
      /(?:total|montant|à\s+payer|net\s+à\s+payer)\s*:?\s*(\d+(?:\s+\d{3})*)\s*€?/gi,
      /t[.t]c\s*:?\s*(\d+(?:\s+\d{3})*)\s*€?/gi,
      /(\d+(?:\s+\d{3})*)\s*€?\s*(?:ttc|total)/gi
    ];

    console.log('\n🔍 RECHERCHE DES MONTANTS HT:');
    // Extraire HT
    for (const pattern of montantHTPatterns) {
      const matches = [...text.matchAll(pattern)];
      if (matches.length > 0) {
        console.log('✅ Pattern HT trouvé:', pattern);
        console.log('📊 Matches:', matches.map(m => m[0]));
        
        const montants = matches.map(m => {
          const cleanAmount = m[1].replace(/\s+/g, '').replace(',', '.');
          console.log('🧮 Montant nettoyé:', m[1], '->', cleanAmount);
          return parseFloat(cleanAmount);
        }).filter(m => !isNaN(m));
        
        if (montants.length > 0) {
          data.montant_ht = Math.max(...montants).toFixed(2);
          console.log('💰 Montant HT FINAL:', data.montant_ht);
          break;
        }
      }
    }

    console.log('\n🔍 RECHERCHE DES MONTANTS TVA:');
    // Extraire TVA
    for (const pattern of montantTVAPatterns) {
      const matches = [...text.matchAll(pattern)];
      if (matches.length > 0) {
        console.log('✅ Pattern TVA trouvé:', pattern);
        console.log('📊 Matches:', matches.map(m => m[0]));
        
        const montants = matches.map(m => {
          const cleanAmount = m[1].replace(/\s+/g, '').replace(',', '.');
          console.log('🧮 Montant nettoyé:', m[1], '->', cleanAmount);
          return parseFloat(cleanAmount);
        }).filter(m => !isNaN(m));
        
        if (montants.length > 0) {
          data.montant_tva = montants.reduce((sum, m) => sum + m, 0).toFixed(2);
          console.log('🏛️ Montant TVA FINAL:', data.montant_tva);
          break;
        }
      }
    }

    console.log('\n🔍 RECHERCHE DES MONTANTS TTC:');
    // Extraire TTC
    for (const pattern of montantTTCPatterns) {
      const matches = [...text.matchAll(pattern)];
      if (matches.length > 0) {
        console.log('✅ Pattern TTC trouvé:', pattern);
        console.log('📊 Matches:', matches.map(m => m[0]));
        
        const montants = matches.map(m => {
          const cleanAmount = m[1].replace(/\s+/g, '').replace(',', '.');
          console.log('🧮 Montant nettoyé:', m[1], '->', cleanAmount);
          return parseFloat(cleanAmount);
        }).filter(m => !isNaN(m));
        
        if (montants.length > 0) {
          data.montant_ttc = Math.max(...montants).toFixed(2);
          console.log('💳 Montant TTC FINAL:', data.montant_ttc);
          break;
        }
      }
    }

    console.log('\n✅ RÉSULTATS FINAUX:');
    console.log({
      ht: data.montant_ht,
      tva: data.montant_tva, 
      ttc: data.montant_ttc
    });

    return data;
};

// Texte simulé de la facture (basé sur l'image fournie)
const factureText = `
FACTURE N°036
Emise le 29/08/2025

REMI BECHIR
9 rue des Colonnes
75002 Paris 2
06.77.58.44.63
remi.bechir@gmail.com

NIBELIS
116 rue Jules Guesde
92300 Levallois-Perret

Description                          Quantité    Prix unitaire HT    Montant HT
Développement web SIRH (journée)         20             250€           5 000€
du 01/08/2025 au 29/08/2025

Détail des prestations :
Ticket n°224069 - 02h00 --- EVOL - MODIFICATION DU STATUT DES AVANCES DONT LA PÉRIODE EST PASSÉ
Ticket n°228819 - 02h30 --- INTERNE - RECETTES TICKETS
Ticket n°229677 - 02h00 --- INTERNE - VALIDATIONS PR GITLAB
Ticket n°237494 - 05h00 --- INTERNE - PLANNING SEMAINE + MENSUEL
Ticket n°238395 - 08h45 --- COPIE: INTERNE - GESTION PROJET I18N EXPERT
Ticket n°239768 - 34h45 --- INTERNE - EQUIPE PORTAIL RH - AOÛT 2025
Ticket n°240006 - 04h00 --- MANAGER INTERMÉDIAIRE PASSÉ OUTRE MANAGER PRINCIPAL
Ticket n°240125 - 75h00 --- NDF - FIABILISATION DE LA GESTION D'ERREUR
Ticket n°240788 - 06h00 --- URGENT : ANOMALIE BASCULE MODULE NDF

Remarques et instructions de paiement         Total H.T.        5 000€
Montant à payer avant le 28/09/2025          T.V.A. 20%        1 000€
                                             Total TTC à payer  6 000€
Règlement par virement :
IBAN FR76 4061 8804 8500 0404 2170 789

Taux d'intérêt en cas de retard de paiement : 8.28%
Indemnité forfaitaire pour frais de recouvrement
en cas de retard de paiement : 40€
`;

console.log('🧪 TEST DU PARSING OCR CORRIGÉ');
console.log('='.repeat(60));

const result = simulateParseReceiptData(factureText);

console.log('\n📊 COMPARAISON AVEC LES MONTANTS ATTENDUS:');
console.log('Attendu -> HT: 5000.00€, TVA: 1000.00€, TTC: 6000.00€');
console.log('Obtenu  -> HT:', result.montant_ht + '€', ', TVA:', result.montant_tva + '€', ', TTC:', result.montant_ttc + '€');

console.log('\n' + '='.repeat(60));
if (result.montant_ht === '5000.00' && result.montant_tva === '1000.00' && result.montant_ttc === '6000.00') {
    console.log('✅ TEST RÉUSSI - Les montants sont correctement extraits !');
} else {
    console.log('❌ TEST ÉCHOUÉ - Les montants ne correspondent pas à la facture');
}
import React from 'react';
import './css/ModeleFacture.css';

const ModeleFacture = ({ factures, type, parametrage, tvas }) => {
  // Détail des TVA par taux
  const calculerTVAParTaux = () => {
    const totalTVAParTaux = {};
    let totalTVA = 0;
  
    factures.produits.forEach((product) => {
      const quantite = parseFloat(product.quantite) || 0;
      const prix = parseFloat(product.prix) || 0;
      const tauxTVA = parseFloat(product.tva) || parametrage.vatRate || 0;
      const montantLigne = quantite * prix;
  
      if (!totalTVAParTaux[tauxTVA]) totalTVAParTaux[tauxTVA] = 0;
  
      let tva = 0;
  
      if (factures.type_saisie === 'TTC') {
        const montantHT = montantLigne / (1 + tauxTVA / 100);
        tva = montantLigne - montantHT;
      } else {
        tva = montantLigne * (tauxTVA / 100);
      }
  
      totalTVAParTaux[tauxTVA] += tva;
      totalTVA += tva;
    });
  
    // Arrondir à 2 décimales
    Object.keys(totalTVAParTaux).forEach(taux => {
      totalTVAParTaux[taux] = parseFloat(totalTVAParTaux[taux].toFixed(2));
    });
  
    totalTVA = parseFloat(totalTVA.toFixed(2));
  
    return { totalTVAParTaux, totalTVA };
  };
  

  const calculerTaxeSecondaire = () => {
    let totalTPS = 0;
    let tauxTPS = 0;
    let labelTPS = '';
    
    // Vérifier si le devis/facture a une taxe secondaire
    if (factures.taxe_secondaire && parseFloat(factures.taxe_secondaire) > 0) {
      tauxTPS = parseFloat(factures.taxe_secondaire);
      
      // Trouver le libellé correspondant dans la configuration TVA
      const taxeSecondarieConfig = tvas.find(tva => 
        parseFloat(tva.value) === tauxTPS && tva.taxe_secondaire === 'OUI'
      );
      
      if (taxeSecondarieConfig) {
        labelTPS = `${taxeSecondarieConfig.label} ${tauxTPS}%`;
      } else {
        // Fallback si pas trouvé dans la config
        labelTPS = `TPS ${tauxTPS}%`;
      }
      
      // Calculer TPS sur le montant HT
      const montantHT = parseFloat(totalHT);
      totalTPS = montantHT * (tauxTPS / 100);
      totalTPS = parseFloat(totalTPS.toFixed(2));
    }
    
    return { totalTPS, tauxTPS, labelTPS };
  };

  const totalHT = factures.produits.reduce((acc, product) => acc + (product.quantite * parseFloat(product.prix || 0)), 0).toFixed(2);
  const { totalTVAParTaux, totalTVA } = calculerTVAParTaux();
  const { totalTPS, tauxTPS, labelTPS } = calculerTaxeSecondaire();


  const totalTTC = Object.keys(totalTVAParTaux).reduce((total, taux) => {
    return total + parseFloat(totalTVAParTaux[taux]);
  }, parseFloat(factures.type_saisie === 'TTC' ? totalHT : 0)) + (factures.type_saisie === 'HT' ? parseFloat(totalHT) : 0) + totalTPS;

  return (
    <div className="invoice-container">
      <div className="invoice-header">
        <div className="invoice-details">
          <img
            className="InvoiceLogo"
            src={`${import.meta.env.VITE_API_URL}` + factures.logo_soci}
            alt="Logo"
          />
          <p><strong>{factures.vendeur_nom}</strong></p>
          <p><strong>Tel:</strong> {factures.vendeur_phone}</p>
          <p>{factures.vendeur_adresse}</p>
          <p>{factures.vendeur_code_postal}, {factures.vendeur_ville}</p>
          <p>Siret: {factures.siret} 
            {factures.statut === 'payée' && <strong className='tamponPayé'>Payé</strong>}
            {factures.statut === 'annulée' && !type === 'AVOIR' && <strong className='tamponAnnulé'>ANNULÉ</strong>}
            {type === 'AVOIR' && factures.facture_origine_numero && (
              <strong className='factureOrigine'>
                Facture d'origine: {factures.facture_origine_numero}
              </strong>
            )}
          </p>
        </div>
        <div className="invoice-details">
          <div className="NameInvoiceBloc">
            <p className="titleIvoice"><strong>
              {type === 'DEVI' ? 'Devis' : type === 'AVOIR' ? 'Avoir' : 'Facture'} N° {factures.invoiceNumber}
            </strong></p>
            <p className='datefacture'><strong>Date:</strong> {factures.date}</p>
          </div>
          <div className='infoClient'>
            <p className='textInfoClient'><strong>{factures.client}</strong></p>
            <p className='textInfoClient'><strong>Tel:</strong> {factures.client_phone}</p>
            <p className='textInfoClient'>{factures.client_email}</p>
            <p className='textInfoClient'>{factures.client_adresse}</p>
            <p className='textInfoClient'>{factures.client_code_postal}, {factures.client_ville}</p>
          </div>
        </div>
      </div>

      <div className="invoice-table-container">
        <table className="invoice-table">
          <thead className="blocEnteteTableau">
            <tr>
              <th>Libellé</th>
              <th>Quantité</th>
              <th>Tarif</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {factures.produits.map((product, index) => (
              <tr key={index} className="fixed-height-row">
                <td className="td">{product.nom}</td>
                <td className="td">{product.quantite}</td>
                <td className="td">{factures.devise} {parseFloat(product.prix).toFixed(2)}</td>
                <td className="td">{(product.quantite * product.prix).toFixed(2)} {factures.devise}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="2"></td>
              <td><strong>HT</strong></td>
              <td><strong>{totalHT} {factures.devise}</strong></td>
            </tr>
            {parametrage.enableMultipleTVA == 1 && tvas.length > 0  ?
             Object.entries(totalTVAParTaux).map(([taux, montant]) => (
              <tr key={taux}>
                <td colSpan="2"></td>
                <td><strong>TVA ({taux}%)</strong></td>
                <td><strong>{montant.toFixed(2)} {factures.devise}</strong></td>
              </tr>
            )): parametrage.enableMultipleTVA == 0 && tvas.length > 0 ? 
            <tr>
                <td colSpan="2"></td>
                <td><strong>TVA </strong></td>
                <td><strong>{totalTVA.toFixed(2)} {factures.devise}</strong></td>
              </tr> : ''
            }
           
            {/* Affichage de la taxe secondaire si elle existe */}
            {totalTPS > 0 && (
              <tr>
                <td colSpan="2"></td>
                <td><strong>{labelTPS}</strong></td>
                <td><strong>{totalTPS.toFixed(2)} {factures.devise}</strong></td>
              </tr>
            )}
           
            <tr>
              <td colSpan="2"></td>
              <td><strong>TTC</strong></td>
              <td><strong>{totalTTC.toFixed(2)} {factures.devise}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="legal-notice">
        {parametrage.showHeaderNotes == 1 && (
          <p className='textPiedDePage'><strong> Mentions légales: </strong><br /><span>{parametrage.headerNotes}</span></p>
        )}
        {parametrage.showSalesConditions == 1 && (
          <p className='textPiedDePage'><strong> Conditions de vente: </strong><br /><span>{parametrage.salesConditions}</span></p>
        )}
        {parametrage.enableApprovalMention == 1 && type === "DEVI" && (
          <p className='bonAccord'><strong> Bon pour accord </strong><br /></p>
        )}
      </div>
    </div>
  );
};

export default ModeleFacture;

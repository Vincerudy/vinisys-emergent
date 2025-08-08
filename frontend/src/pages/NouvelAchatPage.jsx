import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexte/AuthContext';
import axios from 'axios';
import { 
  FiArrowLeft, 
  FiUpload, 
  FiSave, 
  FiPercent,
  FiCamera,
  FiFile,
  FiCheck,
  FiX,
  FiPlus,
  FiDollarSign,
  FiCalendar,
  FiFileText,
  FiUser,
  FiEye
} from 'react-icons/fi';
import './css/NouvelAchatPage.css';

const NouvelAchatPage = () => {
  const { societe_id, id: user_id } = useAuth();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('manuel'); // 'manuel' ou 'ocr'
  const [fournisseurs, setFournisseurs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [projets, setProjets] = useState([]);

  const [achat, setAchat] = useState({
    numero_facture: '',
    fournisseur_id: '',
    nouveau_fournisseur: '',
    date_achat: new Date().toISOString().split('T')[0],
    date_facture: '',
    date_echeance: '',
    montant_ht: '',
    taux_tva: 20,
    tva_deductible: true,
    categorie_achat_id: '',
    projet_id: '',
    description: '',
    mode_paiement: 'virement',
    compte_comptable_achat: '',
    compte_comptable_tva: '44566'
  });

  const [justificatifs, setJustificatifs] = useState([]);
  const [ocrData, setOcrData] = useState(null);
  const [showNewFournisseur, setShowNewFournisseur] = useState(false);

  // Calculs automatiques
  const montantHT = parseFloat(achat.montant_ht || 0);
  const tauxTVA = parseFloat(achat.taux_tva || 0);
  const montantTVA = montantHT * (tauxTVA / 100);
  const montantTTC = montantHT + montantTVA;

  // Chargement des données de référence
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fournisseursRes, categoriesRes, projetsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/achats/fournisseurs/${societe_id}`),
          axios.get(`${import.meta.env.VITE_API_URL}/categories-achats/${societe_id}`),
          axios.get(`${import.meta.env.VITE_API_URL}/projets/${societe_id}`)
        ]);
        
        setFournisseurs(fournisseursRes.data.fournisseurs || []);
        setCategories(categoriesRes.data.categories || []);
        setProjets(projetsRes.data.projets || []);
      } catch (error) {
        console.error('Erreur chargement données:', error);
      }
    };

    if (societe_id) {
      fetchData();
    }
  }, [societe_id]);

  // Gestion OCR
  const handleOcrUpload = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('document', file);
    
    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/achats/ocr/extract`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      const ocrResult = response.data;
      setOcrData(ocrResult);

      // Pré-remplir le formulaire avec les données OCR
      if (ocrResult.data) {
        setAchat(prev => ({
          ...prev,
          numero_facture: ocrResult.data.numero_facture || '',
          montant_ht: ocrResult.data.montant_ht || '',
          montant_ttc: ocrResult.data.montant_ttc || '',
          taux_tva: ocrResult.data.taux_tva || 20,
          date_facture: ocrResult.data.date_facture || '',
          description: ocrResult.data.description || ''
        }));
      }
    } catch (error) {
      console.error('Erreur OCR:', error);
      alert('Erreur lors de la lecture OCR du document');
    } finally {
      setLoading(false);
    }
  };

  // Sauvegarde de l'achat
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!achat.montant_ht || !achat.fournisseur_id) {
      alert('Veuillez remplir les champs obligatoires');
      return;
    }

    const formData = new FormData();
    
    // Données de l'achat
    Object.keys(achat).forEach(key => {
      formData.append(key, achat[key]);
    });
    
    // Ajout des métadonnées
    formData.append('utilisateur_id', user_id);
    formData.append('societe_id', societe_id);
    formData.append('saisie_ocr', mode === 'ocr');

    // Ajout des justificatifs
    justificatifs.forEach((file, index) => {
      formData.append('justificatifs', file);
    });

    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/achat`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      alert('Achat enregistré avec succès !');
      window.history.back();
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('Erreur lors de l\'enregistrement de l\'achat');
    } finally {
      setLoading(false);
    }
  };

  // Création nouveau fournisseur
  const handleNewFournisseur = async () => {
    if (!achat.nouveau_fournisseur) return;

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/achats/fournisseur`,
        {
          nom: achat.nouveau_fournisseur,
          societe_id: societe_id
        }
      );

      // Rafraîchir la liste des fournisseurs
      const fournisseursRes = await axios.get(`${import.meta.env.VITE_API_URL}/achats/fournisseurs/${societe_id}`);
      setFournisseurs(fournisseursRes.data.fournisseurs || []);
      
      // Sélectionner le nouveau fournisseur
      setAchat(prev => ({ ...prev, fournisseur_id: response.data.fournisseurId }));
      setShowNewFournisseur(false);
      
      alert('Nouveau fournisseur créé !');
    } catch (error) {
      console.error('Erreur création fournisseur:', error);
      alert('Erreur lors de la création du fournisseur');
    }
  };

  return (
    <div className="nouvel-achat-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">
            <FiFileText />
            Nouvelle Dépense/Achat
          </h1>
          <p className="page-subtitle">
            Saisie {mode === 'ocr' ? 'automatique avec OCR' : 'manuelle'} d'une dépense d'entreprise
          </p>
        </div>
        <div className="header-actions">
          <button 
            onClick={() => window.history.back()}
            className="btn-back"
          >
            <FiArrowLeft size={18} />
            Retour
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className={`btn-primary ${loading ? 'btn-loading' : ''}`}
          >
            <FiSave size={18} />
            Enregistrer
          </button>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="mode-selector">
        <h3>
          <FiCamera />
          Mode de saisie
        </h3>
        <div className="mode-buttons">
          <div 
            className={`mode-button ${mode === 'manuel' ? 'active' : ''}`}
            onClick={() => setMode('manuel')}
          >
            <div className="mode-icon">
              <FiFileText />
            </div>
            <div className="mode-title">Saisie manuelle</div>
            <div className="mode-description">
              Saisie traditionnelle avec formulaire complet
            </div>
          </div>
          
          <div 
            className={`mode-button ${mode === 'ocr' ? 'active' : ''}`}
            onClick={() => setMode('ocr')}
          >
            <div className="mode-icon">
              <FiCamera />
            </div>
            <div className="mode-title">Saisie OCR</div>
            <div className="mode-description">
              Extraction automatique depuis photo/PDF
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mode OCR - Zone d'upload */}
        {mode === 'ocr' && (
          <div className="bg-purple-50 border-2 border-dashed border-purple-300 rounded-lg p-8 text-center">
            <FiCamera className="mx-auto text-purple-600 mb-4" size={48} />
            <h3 className="text-lg font-medium text-purple-900 mb-2">
              Lecture automatique de justificatif
            </h3>
            <p className="text-purple-700 mb-4">
              Uploadez votre facture, ticket ou reçu pour extraction automatique des données
            </p>
            <div className="flex justify-center gap-4">
              <label className="bg-purple-600 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-purple-700 flex items-center gap-2">
                <FiUpload size={16} />
                Scanner document
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*,application/pdf"
                  onChange={(e) => handleOcrUpload(e.target.files[0])}
                />
              </label>
              <label className="bg-gray-600 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-gray-700 flex items-center gap-2">
                <FiFile size={16} />
                Fichier PDF
                <input 
                  type="file" 
                  className="hidden" 
                  accept="application/pdf"
                  onChange={(e) => handleOcrUpload(e.target.files[0])}
                />
              </label>
            </div>
            {ocrData && (
              <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg">
                <p className="text-green-800">
                  ✅ Document analysé avec succès (confiance: {(ocrData.confidence * 100).toFixed(1)}%)
                </p>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne 1 - Informations fournisseur */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-blue-600">🏢 Fournisseur</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fournisseur <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={achat.fournisseur_id}
                    onChange={(e) => setAchat({...achat, fournisseur_id: e.target.value})}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Sélectionner un fournisseur</option>
                    {fournisseurs.map(f => (
                      <option key={f.id} value={f.id}>{f.nom}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewFournisseur(!showNewFournisseur)}
                    className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700"
                  >
                    <FiPlus size={16} />
                  </button>
                </div>

                {showNewFournisseur && (
                  <div className="mt-2 p-3 border border-green-300 rounded-lg bg-green-50">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nom du nouveau fournisseur"
                        value={achat.nouveau_fournisseur}
                        onChange={(e) => setAchat({...achat, nouveau_fournisseur: e.target.value})}
                        className="flex-1 border border-gray-300 rounded px-3 py-2"
                      />
                      <button
                        type="button"
                        onClick={handleNewFournisseur}
                        className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
                      >
                        <FiCheck size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowNewFournisseur(false)}
                        className="bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-600"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  N° Facture
                </label>
                <input
                  type="text"
                  value={achat.numero_facture}
                  onChange={(e) => setAchat({...achat, numero_facture: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: FAC-2024-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie analytique <span className="text-red-500">*</span>
                </label>
                <select
                  value={achat.categorie_achat_id}
                  onChange={(e) => setAchat({...achat, categorie_achat_id: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.nom}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Projet / Centre de coût
                </label>
                <select
                  value={achat.projet_id}
                  onChange={(e) => setAchat({...achat, projet_id: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Aucun projet</option>
                  {projets.map(p => (
                    <option key={p.id} value={p.id}>{p.nom} ({p.code})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Colonne 2 - Montants et TVA */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-green-600">💰 Montants & TVA</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant HT <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={achat.montant_ht}
                  onChange={(e) => setAchat({...achat, montant_ht: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Taux TVA (%)
                </label>
                <select
                  value={achat.taux_tva}
                  onChange={(e) => setAchat({...achat, taux_tva: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="0">0% - Exonéré</option>
                  <option value="5.5">5.5% - Taux réduit</option>
                  <option value="10">10% - Taux intermédiaire</option>
                  <option value="20">20% - Taux normal</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={achat.tva_deductible}
                    onChange={(e) => setAchat({...achat, tva_deductible: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">TVA récupérable</span>
                </label>
              </div>

              {/* Calculs automatiques */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Montant HT :</span>
                  <span className="font-medium">{montantHT.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>TVA ({tauxTVA}%) :</span>
                  <span className={`font-medium ${achat.tva_deductible ? 'text-green-600' : 'text-red-600'}`}>
                    {montantTVA.toFixed(2)} €
                  </span>
                </div>
                <div className="border-t border-gray-300 mt-2 pt-2 flex justify-between font-semibold">
                  <span>Montant TTC :</span>
                  <span className="text-blue-600">{montantTTC.toFixed(2)} €</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mode de paiement
                </label>
                <select
                  value={achat.mode_paiement}
                  onChange={(e) => setAchat({...achat, mode_paiement: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="virement">Virement</option>
                  <option value="cheque">Chèque</option>
                  <option value="carte">Carte bancaire</option>
                  <option value="especes">Espèces</option>
                  <option value="prelevement">Prélèvement</option>
                </select>
              </div>
            </div>
          </div>

          {/* Colonne 3 - Dates et informations complémentaires */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-purple-600">📅 Dates & Infos</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date d'achat <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={achat.date_achat}
                  onChange={(e) => setAchat({...achat, date_achat: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de facture
                </label>
                <input
                  type="date"
                  value={achat.date_facture}
                  onChange={(e) => setAchat({...achat, date_facture: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date d'échéance
                </label>
                <input
                  type="date"
                  value={achat.date_echeance}
                  onChange={(e) => setAchat({...achat, date_echeance: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={achat.description}
                  onChange={(e) => setAchat({...achat, description: e.target.value})}
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="Description de l'achat..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Justificatifs
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <FiUpload className="mx-auto text-gray-400 mb-2" size={24} />
                  <label className="text-sm text-gray-600 cursor-pointer hover:text-blue-600">
                    Cliquer pour ajouter des fichiers
                    <input 
                      type="file" 
                      multiple 
                      className="hidden"
                      accept="image/*,application/pdf"
                      onChange={(e) => setJustificatifs([...justificatifs, ...Array.from(e.target.files)])}
                    />
                  </label>
                </div>
                
                {justificatifs.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {justificatifs.map((file, index) => (
                      <div key={index} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                        <span className="truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => setJustificatifs(justificatifs.filter((_, i) => i !== index))}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Comptes comptables (section avancée) */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-indigo-600">📊 Comptabilité</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Compte comptable achat
              </label>
              <input
                type="text"
                value={achat.compte_comptable_achat}
                onChange={(e) => setAchat({...achat, compte_comptable_achat: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 607 (selon catégorie)"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Compte comptable TVA
              </label>
              <input
                type="text"
                value={achat.compte_comptable_tva}
                onChange={(e) => setAchat({...achat, compte_comptable_tva: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="44566"
              />
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <FiX size={16} />
            Annuler
          </button>
          
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg flex items-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <FiSave size={16} />
              )}
              {loading ? 'Enregistrement...' : 'Enregistrer l\'achat'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NouvelAchatPage;
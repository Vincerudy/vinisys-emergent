import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexte/AuthContext';
import axios from 'axios';
import { 
  FiX, 
  FiSave, 
  FiPercent,
  FiUpload,
  FiPlus,
  FiDollarSign,
  FiCalendar,
  FiFileText,
  FiUser,
  FiCheck
} from 'react-icons/fi';
import './css/AchatSidebar.css';

const AchatSidebar = ({ isOpen, onClose, onSaved, prefilledData = null, attachedFile = null, mode: initialMode = 'manuel' }) => {
  const { societe_id, id: user_id } = useAuth();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState(initialMode); // 'manuel' ou 'ocr'
  const [fournisseurs, setFournisseurs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [projets, setProjets] = useState([]);
  const [attachedFiles, setAttachedFiles] = useState([]);

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
  const [showNewFournisseur, setShowNewFournisseur] = useState(false);

  // Calculs automatiques
  const montantHT = parseFloat(achat.montant_ht || 0);
  const tauxTVA = parseFloat(achat.taux_tva || 0);
  const montantTVA = montantHT * (tauxTVA / 100);
  const montantTTC = montantHT + montantTVA;

  // Chargement des données de référence
  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen || !societe_id) return;
      
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

    fetchData();
  }, [isOpen, societe_id]);

  // Reset form when closing or apply prefilled data when opening
  useEffect(() => {
    if (!isOpen) {
      setAchat({
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
      setAttachedFiles([]);
      setShowNewFournisseur(false);
    } else if (prefilledData) {
      // Appliquer les données pré-remplies de l'OCR
      setAchat(prevAchat => ({
        ...prevAchat,
        ...prefilledData
      }));
      
      // Ajouter le fichier attaché s'il y en a un
      if (attachedFile) {
        setAttachedFiles([attachedFile]);
      }
    }
  }, [isOpen, prefilledData, attachedFile]);

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

    // Ajout des justificatifs (fichiers attachés + justificatifs normaux)
    attachedFiles.forEach((file, index) => {
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
      onSaved(); // Callback to refresh the list
      onClose();
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
        `${import.meta.env.VITE_API_URL}/achats/fournisseurs/fournisseur`,
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

  if (!isOpen) return null;

  return (
    <div className="achat-sidebar-overlay">
      {/* Backdrop */}
      <div 
        className="achat-sidebar-backdrop" 
        onClick={onClose}
      ></div>
      
      {/* Sidebar Panel */}
      <div className={`achat-sidebar-panel ${isOpen ? 'open' : ''}`}>
        <div className="achat-sidebar-content">
          {/* Header */}
          <div className="achat-sidebar-header">
            <h2 className="text-xl font-semibold text-gray-900">
              <FiFileText className="inline mr-2" />
              Nouvelle Dépense/Achat
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Form Body */}
          <div className="achat-sidebar-body">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Mode de saisie */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Mode de saisie</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMode('manuel')}
                    className={`p-4 border rounded-lg text-center transition-colors ${
                      mode === 'manuel' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <FiFileText className="mx-auto mb-2" size={20} />
                    <div className="text-sm font-medium">Saisie manuelle</div>
                    <div className="text-xs text-gray-500">Formulaire complet</div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setMode('ocr')}
                    className={`p-4 border rounded-lg text-center transition-colors ${
                      mode === 'ocr' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <FiUpload className="mx-auto mb-2" size={20} />
                    <div className="text-sm font-medium">Saisie OCR</div>
                    <div className="text-xs text-gray-500">Depuis photo/PDF</div>
                  </button>
                </div>
              </div>

              {/* Fournisseur */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiUser className="inline mr-1" />
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

              {/* Numéro de facture */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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

              {/* Catégorie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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

              {/* Date d'achat */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiCalendar className="inline mr-1" />
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

              {/* Montants */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-yellow-600">
                  <FiDollarSign className="inline mr-1" />
                  Montants & TVA
                </h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
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
                    <input
                      type="number"
                      step="0.01"
                      value={achat.taux_tva}
                      onChange={(e) => setAchat({...achat, taux_tva: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Calculs automatiques */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="bg-white p-3 rounded-lg border">
                    <div className="text-gray-600">Montant TVA</div>
                    <div className="font-semibold text-blue-600">
                      {montantTVA.toFixed(2)} €
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border">
                    <div className="text-gray-600">Montant TTC</div>
                    <div className="font-semibold text-green-600">
                      {montantTTC.toFixed(2)} €
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border">
                    <div className="text-gray-600">TVA déductible</div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={achat.tva_deductible}
                        onChange={(e) => setAchat({...achat, tva_deductible: e.target.checked})}
                        className="mr-2"
                      />
                      <span className={achat.tva_deductible ? 'text-green-600' : 'text-red-600'}>
                        {achat.tva_deductible ? 'Oui' : 'Non'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={achat.description}
                  onChange={(e) => setAchat({...achat, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Description de l'achat..."
                />
              </div>

            </form>
          </div>

          {/* Footer */}
          <div className="achat-sidebar-footer">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  <FiSave className="mr-2" size={16} />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchatSidebar;
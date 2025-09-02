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
  FiCheck,
  FiEye,
  FiTrash2
} from 'react-icons/fi';
import './css/AchatSidebar.css';

const AchatSidebar = ({ isOpen, onClose, onSaved, prefilledData = null, attachedFile = null, mode = 'manuel' }) => {
  const { societe_id, id: user_id } = useAuth();
  const [loading, setLoading] = useState(false);
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
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [convertedPdfUrls, setConvertedPdfUrls] = useState({});
  const [convertingFiles, setConvertingFiles] = useState({});

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

  // Fonction pour mapper les données de l'API vers le format du formulaire
  const mapApiDataToForm = (apiData) => {
    return {
      numero_facture: apiData.numero || '',
      fournisseur_id: apiData.fournisseur_id || '',
      date_achat: apiData.date_achat ? apiData.date_achat.split('T')[0] : new Date().toISOString().split('T')[0],
      montant_ht: apiData.montant_ht || '',
      taux_tva: parseFloat(apiData.taux_tva) || 20,
      tva_deductible: apiData.tva_deductible === '1' || apiData.tva_deductible === 1 || apiData.tva_deductible === true,
      categorie_achat_id: apiData.categorie_achat_id || apiData.categorie_id || '',
      description: apiData.description || '',
      mode_paiement: apiData.mode_paiement || 'virement',
      // Garder l'ID pour les opérations d'édition
      id: apiData.id
    };
  };

  // useEffect pour gérer les données pré-remplies et les fichiers attachés
  useEffect(() => {
    if (!isOpen) {
      // Quand la sidebar se ferme, nettoyer tous les états
      setUploadedFiles([]);
      setSelectedFile(null);
      setAttachedFiles([]);
      return;
    }
    
    // Réinitialiser les fichiers à chaque ouverture pour éviter les conflits entre différents achats
    setUploadedFiles([]);
    setSelectedFile(null);
    setAttachedFiles([]);
    
    if (!prefilledData) {
      // Mode nouveau : réinitialiser
      setAchat({
        numero_facture: '',
        fournisseur_id: '',
        date_achat: new Date().toISOString().split('T')[0],
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
      setShowNewFournisseur(false);
    } else if (prefilledData) {
      // Appliquer les données pré-remplies (OCR, édition, ou visualisation)
      const mappedData = mapApiDataToForm(prefilledData);
      setAchat(prevAchat => ({
        ...prevAchat,
        ...mappedData
      }));
      
      // Ajouter le fichier attaché s'il y en a un (OCR)
      if (attachedFile) {
        setAttachedFiles([attachedFile]);
      }
      
      // Charger les justificatifs existants si on édite/visualise un achat
      if (prefilledData.id && (mode === 'edit' || mode === 'view')) {
        loadExistingJustificatifs(prefilledData.id);
      }
    }
  }, [isOpen, prefilledData, attachedFile, mode]);

  // Fonction pour charger les justificatifs existants
  const loadExistingJustificatifs = async (achatId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/achat/${achatId}/justificatifs`);
      
      if (response.ok) {
        const justificatifs = await response.json();
        
        const existingFiles = justificatifs.map(j => {
          // Construire l'URL correcte en utilisant le chemin relatif
          let fileUrl = j.justificatif_path;
          if (fileUrl.startsWith('/app/backend/uploads/')) {
            // Transformer /app/backend/uploads/achats/... en /api/uploads/achats/...
            fileUrl = fileUrl.replace('/app/backend/uploads/', '/api/uploads/');
          }
          
          const finalUrl = `${window.location.origin}${fileUrl}`;
          console.log('🔍 File URL constructed:', finalUrl);
          
          return {
            id: j.id,
            name: j.nom_fichier || j.justificatif_path?.split('/').pop() || 'Justificatif',
            type: j.type_fichier || (j.justificatif_path?.includes('.pdf') ? 'application/pdf' : 'image/jpeg'),
            url: finalUrl,
            isExisting: true
          };
        });
        
        console.log('🔍 Total existing files:', existingFiles.length);
        console.log('🔍 Files:', existingFiles);
        
        setUploadedFiles(existingFiles);
        
        if (existingFiles.length > 0) {
          setSelectedFile(existingFiles[0]);
        }
      }
    } catch (error) {
      console.error('❌ Erreur chargement justificatifs:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!achat.montant_ht || !achat.fournisseur_id) {
      alert('Veuillez remplir les champs obligatoires');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    
    // Données de l'achat
    Object.keys(achat).forEach(key => {
      formData.append(key, achat[key]);
    });
    
    // Ajout des métadonnées
    formData.append('utilisateur_id', user_id);
    formData.append('societe_id', societe_id);
    formData.append('saisie_ocr', mode === 'ocr');

    // Ajout des justificatifs (fichiers attachés + nouveaux fichiers téléchargés)
    attachedFiles.forEach((file, index) => {
      formData.append('justificatifs', file);
    });

    // Ajout des nouveaux fichiers téléchargés
    uploadedFiles.forEach((fileObj, index) => {
      formData.append('justificatifs', fileObj.file);
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

  // Gestion des fichiers
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const validFiles = files.filter(file => {
      const isValidType = file.type.includes('pdf') || file.type.includes('image');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB max
      return isValidType && isValidSize;
    });

    const newFiles = validFiles.map(file => ({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      id: Date.now() + Math.random()
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    if (newFiles.length > 0 && !selectedFile) {
      setSelectedFile(newFiles[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const removeFile = (fileId) => {
    const newFiles = uploadedFiles.filter(f => f.id !== fileId);
    setUploadedFiles(newFiles);
    
    if (selectedFile && selectedFile.id === fileId) {
      setSelectedFile(newFiles.length > 0 ? newFiles[0] : null);
    }
  };

  const selectFile = (file) => {
    setSelectedFile(file);
  };

  // Note: Fonction de conversion supprimée - affichage direct des images

  // Note: Conversion automatique supprimée - les images sont affichées directement

  const renderFileViewer = () => {
    console.log('🔍 renderFileViewer called, selectedFile:', selectedFile);
    
    if (!selectedFile) {
      return (
        <div className="file-viewer">
          <div className="text-center text-gray-500 py-8">
            <FiFileText size={48} className="mx-auto mb-4 text-gray-400" />
            <p>Aucun fichier sélectionné</p>
            <p className="text-sm">Téléchargez un fichier pour le visualiser</p>
          </div>
        </div>
      );
    }

    // Pour les PDF et les images converties, utiliser la même visionneuse
    const renderPdfViewer = (url, filename) => (
      <div className="file-viewer">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">{filename}</span>
          <button
            onClick={() => removeFile(selectedFile.id)}
            className="text-red-500 hover:text-red-700 p-1"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
        <div className="pdf-viewer-container" style={{ height: '500px', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
          <iframe
            src={`${url}#toolbar=1&navpanes=0&scrollbar=1&page=1&view=FitH`}
            title={filename}
            className="w-full h-full border-0"
            style={{ minHeight: '500px' }}
          />
        </div>
      </div>
    );

    if (selectedFile.type.includes('pdf')) {
      return renderPdfViewer(selectedFile.url, selectedFile.name);
    }

    if (selectedFile.type.includes('image')) {
      // Pour les images, on les affiche dans une structure similaire au PDF viewer
      return (
        <div className="file-viewer">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">{selectedFile.name}</span>
            <button
              onClick={() => removeFile(selectedFile.id)}
              className="text-red-500 hover:text-red-700 p-1"
            >
              <FiTrash2 size={16} />
            </button>
          </div>
          <div className="pdf-viewer-container" style={{ height: '500px', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa' }}>
            <img
              src={selectedFile.url}
              alt={selectedFile.name}
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
          </div>
        </div>
      );
    }

    return null;
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
              {mode === 'view' ? 'Visualiser la Dépense' : 
               mode === 'edit' ? 'Modifier la Dépense' : 
               'Nouvelle Dépense/Achat'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Form Body - Two Columns */}
          <div className="achat-sidebar-body">
            {/* Left Column - File Viewer */}
            <div className="achat-sidebar-body-left">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                <FiFileText className="inline mr-2" />
                Justificatifs
              </h3>
              
              {/* Upload Area - Masquée si des fichiers sont présents */}
              {uploadedFiles.length === 0 && (
                <div
                  className={`upload-area ${isDragOver ? 'drag-over' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-input').click()}
                >
                  <FiUpload size={32} className="mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-600 mb-2">
                    Cliquez ou glissez-déposez vos fichiers ici
                  </p>
                  <p className="text-sm text-gray-500">
                    PDF, Images (max 10MB)
                  </p>
                  <input
                    id="file-input"
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.gif"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </div>
              )}

              {/* File List */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Fichiers téléchargés ({uploadedFiles.length})
                  </h4>
                  <div className="file-list space-y-2 max-h-32 overflow-y-auto">
                    {uploadedFiles.map((file) => (
                      <div
                        key={file.id}
                        className={`file-item ${selectedFile?.id === file.id ? 'selected' : ''}`}
                        onClick={() => selectFile(file)}
                      >
                        <FiFileText className="text-blue-600 mr-2 flex-shrink-0" size={16} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(file.id);
                          }}
                          className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* File Viewer */}
              <div className="mt-4">
                {renderFileViewer()}
              </div>
            </div>

            {/* Right Column - Form Fields */}
            <div className="achat-sidebar-body-right">
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

              {/* Fichiers attachés / Justificatifs */}
              {attachedFiles.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiFileText className="inline mr-1" />
                    Justificatifs attachés
                  </label>
                  <div className="space-y-2">
                    {attachedFiles.map((file, index) => (
                      <div key={index} className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <FiFileText className="text-blue-600 mr-2" size={20} />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-blue-900">{file.name}</div>
                          <div className="text-xs text-blue-600">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                            {mode === 'ocr' && <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Analysé par OCR</span>}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAttachedFiles(files => files.filter((_, i) => i !== index))}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              </form>
            </div>
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
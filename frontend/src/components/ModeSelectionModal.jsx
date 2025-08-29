import React, { useState } from 'react';
import { FiCamera, FiFileText, FiUpload, FiX } from 'react-icons/fi';
import './css/ModeSelectionModal.css';

const ModeSelectionModal = ({ isOpen, onClose, onModeSelected }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelection = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    
    try {
      // Simuler l'analyse OCR (remplacer par vraie API OCR plus tard)
      const ocrData = await simulateOCR(file);
      
      // Appeler le callback avec les données OCR et le fichier
      onModeSelected('ocr', ocrData, file);
      onClose();
    } catch (error) {
      console.error('Erreur OCR:', error);
      alert('Erreur lors de l\'analyse OCR. Veuillez réessayer.');
    } finally {
      setIsProcessing(false);
    }
  };

  const simulateOCR = (file) => {
    return new Promise((resolve) => {
      // Simulation d'une analyse OCR - remplacer par vraie API
      setTimeout(() => {
        resolve({
          numero_facture: `OCR-${Date.now()}`,
          montant_ht: (Math.random() * 1000 + 100).toFixed(2),
          date_achat: new Date().toISOString().split('T')[0],
          description: 'Facture analysée par OCR',
          taux_tva: '20.00'
        });
      }, 2000);
    });
  };

  const handleManualMode = () => {
    onModeSelected('manuel');
    onClose();
  };

  const handleCameraCapture = () => {
    // Déclencher la sélection de fichier avec caméra prioritaire sur mobile
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Utilise la caméra arrière sur mobile
    
    input.onchange = handleFileSelection;
    input.click();
  };

  const handleFileUpload = () => {
    // Déclencher la sélection de fichier normal
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,application/pdf';
    
    input.onchange = handleFileSelection;
    input.click();
  };

  if (!isOpen) return null;

  return (
    <div className="mode-selection-overlay">
      <div className="mode-selection-backdrop" onClick={onClose}></div>
      
      <div className="mode-selection-modal">
        <div className="modal-header">
 
          <button onClick={onClose} className="close-button">
            <FiX size={20} />
          </button>
        </div>

        {isProcessing ? (
          <div className="processing-content">
            <div className="processing-spinner"></div>
            <p>Analyse OCR en cours...</p>
            <small>Extraction des données de votre document</small>
          </div>
        ) : (
          <div className="modal-content">
 

            <div className="mode-options">
              {/* Saisie manuelle */}
              <button 
                onClick={handleManualMode}
                className="mode-option manual"
              >
                <div className="option-icon">
                  <FiFileText size={32} />
                </div>
                <div className="option-content">
                  <h4>Saisie manuelle</h4>
                  <p>Remplir le formulaire à la main</p>
                </div>
              </button>

              {/* OCR - Prendre photo */}
              <button 
                onClick={handleCameraCapture}
                className="mode-option camera"
              >
                <div className="option-icon">
                  <FiCamera size={32} />
                </div>
                <div className="option-content">
                  <h4>Prendre une photo</h4>
                  <p>Scanner une facture avec l'appareil photo</p>
                </div>
              </button>

              {/* OCR - Choisir fichier  
              <button 
                onClick={handleFileUpload}
                className="mode-option upload"
              >
                <div className="option-icon">
                  <FiUpload size={32} />
                </div>
                
                <div className="option-content">
                  <h4>Choisir un fichier</h4>
                  <p>Sélectionner une image ou PDF depuis l'appareil</p>
                </div>
              </button>
              */}
            </div>

 
          </div>
        )}
      </div>
    </div>
  );
};

export default ModeSelectionModal;
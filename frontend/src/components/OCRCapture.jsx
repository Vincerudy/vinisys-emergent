import React, { useState, useRef } from 'react';
import { createWorker } from 'tesseract.js';
import { FiCamera, FiUpload, FiX, FiLoader } from 'react-icons/fi';
import './css/OCRCapture.css';

const OCRCapture = ({ isOpen, onClose, onDataExtracted }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedText, setExtractedText] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);
  const [currentStep, setCurrentStep] = useState('capture'); // 'capture', 'processing', 'review'
  
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Analyser l'image avec OCR
  const processImageWithOCR = async (imageFile) => {
    try {
      setIsProcessing(true);
      setCurrentStep('processing');
      setProgress(0);

      // Créer un worker Tesseract
      const worker = await createWorker('fra+eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        }
      });

      // Reconnaître le texte dans l'image
      const { data: { text } } = await worker.recognize(imageFile);
      await worker.terminate();

      setExtractedText(text);
      setCurrentStep('review');

      // Parser les données du texte OCR
      const parsedData = parseReceiptData(text);
      
      // Préparer les données pour la sidebar avec l'image
      const formData = {
        ...parsedData,
        ocrImage: imageFile,
        ocrText: text
      };

      // Appeler le callback avec les données extraites
      onDataExtracted(formData);

    } catch (error) {
      console.error('Erreur OCR:', error);
      alert('Erreur lors de l\'analyse de l\'image. Veuillez réessayer.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Parser intelligent des données de reçu
  const parseReceiptData = (text) => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    const data = {
      vendeur: '',
      montant_ttc: '',
      date_frais: '',
      description: '',
      tva_taux: 20.0,
      moyen_paiement: 'Carte de Crédit Société'
    };

    // Recherche du montant (patterns courants)
    const montantPatterns = [
      /(?:total|montant|à payer|ttc|due)\s*:?\s*(\d+[,.]?\d*)\s*€?/gi,
      /(\d+[,.]?\d*)\s*€\s*(?:ttc|total)?/gi,
      /€\s*(\d+[,.]?\d*)/gi
    ];

    for (const pattern of montantPatterns) {
      const matches = [...text.matchAll(pattern)];
      if (matches.length > 0) {
        const montants = matches.map(m => parseFloat(m[1].replace(',', '.')));
        data.montant_ttc = Math.max(...montants).toString(); // Prendre le plus gros montant
        break;
      }
    }

    // Recherche de la date
    const datePatterns = [
      /(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{2,4})/g,
      /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+(\d{2,4})/gi
    ];

    for (const pattern of datePatterns) {
      const match = pattern.exec(text);
      if (match) {
        if (match[2] && isNaN(match[2])) {
          // Format avec nom de mois
          const mois = getMonthNumber(match[2]);
          if (mois) {
            data.date_frais = `${match[3]}-${mois.padStart(2, '0')}-${match[1].padStart(2, '0')}`;
          }
        } else {
          // Format numérique
          let annee = match[3];
          if (annee.length === 2) {
            annee = annee < 50 ? `20${annee}` : `19${annee}`;
          }
          data.date_frais = `${annee}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
        }
        break;
      }
    }

    // Recherche du vendeur (première ligne souvent)
    if (lines.length > 0) {
      // Prendre les premières lignes qui ne sont pas des numéros ou dates
      for (const line of lines.slice(0, 5)) {
        if (!/^\d+$/.test(line) && !/\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4}/.test(line) && line.length > 3) {
          data.vendeur = line.substring(0, 50); // Limiter la longueur
          break;
        }
      }
    }

    // Description basée sur le contenu
    data.description = `Frais saisi via OCR - ${data.vendeur || 'Reçu'}`;

    return data;
  };

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

  // Gérer l'upload de fichier
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setCapturedImage(URL.createObjectURL(file));
      processImageWithOCR(file);
    }
  };

  // Gérer la capture camera
  const handleCameraCapture = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCapturedImage(URL.createObjectURL(file));
      processImageWithOCR(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="ocr-modal-overlay" onClick={onClose}>
      <div className="ocr-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="ocr-modal-header">
          <h3>Scanner un reçu</h3>
          <button className="btn-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="ocr-modal-body">
          {currentStep === 'capture' && (
            <div className="capture-options">
              <p>Choisissez comment ajouter votre reçu :</p>
              
              <div className="upload-buttons">
                <button 
                  className="upload-btn camera-btn"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <FiCamera />
                  <span>Prendre une photo</span>
                  <small>Utiliser l'appareil photo</small>
                </button>

                <button 
                  className="upload-btn file-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FiUpload />
                  <span>Choisir un fichier</span>
                  <small>Sélectionner depuis la galerie</small>
                </button>
              </div>

              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCameraCapture}
                style={{ display: 'none' }}
              />

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </div>
          )}

          {currentStep === 'processing' && (
            <div className="processing-view">
              {capturedImage && (
                <div className="captured-image">
                  <img src={capturedImage} alt="Reçu capturé" />
                </div>
              )}
              
              <div className="processing-status">
                <FiLoader className="spinner" />
                <h4>Analyse en cours...</h4>
                <p>Extraction des données du reçu</p>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <span className="progress-text">{progress}%</span>
              </div>
            </div>
          )}

          {currentStep === 'review' && (
            <div className="review-view">
              <div className="success-message">
                <h4>✅ Analyse terminée</h4>
                <p>Les données ont été extraites et la sidebar va s'ouvrir avec les informations pré-remplies.</p>
              </div>
              
              {extractedText && (
                <div className="extracted-text">
                  <h5>Texte extrait :</h5>
                  <textarea 
                    value={extractedText} 
                    readOnly 
                    rows={6}
                    className="text-preview"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OCRCapture;
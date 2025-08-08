import React from 'react';
import {
  FiAlertTriangle,
  FiCheck,
  FiX
} from 'react-icons/fi';
import './css/ConfirmationModal.css';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirmer", 
  cancelText = "Annuler",
  type = "warning" // warning, danger, success, info
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <FiAlertTriangle className="modal-icon warning" />;
      case 'danger':
        return <FiAlertTriangle className="modal-icon danger" />;
      case 'success':
        return <FiCheck className="modal-icon success" />;
      default:
        return <FiAlertTriangle className="modal-icon info" />;
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-container">
        <div className={`modal-header ${type}`}>
          {getIcon()}
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>
        
        <div className="modal-body">
          <p className="modal-message">{message}</p>
        </div>
        
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            {cancelText}
          </button>
          <button 
            className={`btn-confirm ${type}`} 
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
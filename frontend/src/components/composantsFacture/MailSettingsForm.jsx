import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './css/MailSettingsForm.css'; // Le fichier CSS pour le design
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons'; // Import des icônes
import { useAuth } from '../../contexte/AuthContext';

const MailSettingsForm = () => {
  const { id, societe_id, token, logout  } = useAuth();
  const [formData, setFormData] = useState({
    host: '',
    port: '',
    security: 'Aucune',
    username: '',
    password: '',
    societe_id: societe_id, // À récupérer dynamiquement si nécessaire
    user_id: id // À récupérer dynamiquement si nécessaire
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false); // État pour gérer la visibilité du mot de passe

  // Charger les paramètres de messagerie existants au montage du composant
  useEffect(() => {
    const fetchMailSettings = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/mail-settings/${formData.societe_id}/${formData.user_id}`);
        console.log('response mot de passe :', response)
        if (response.data) {
          setFormData({
            ...formData,
            host: response.data.host,
            port: response.data.port,
            security: response.data.security || 'Aucune',
            username: response.data.username,
            password: response.data.password, // Ne pas afficher le mot de passe par sécurité
          });
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Impossible de récupérer les paramètres');
      }
    };

    fetchMailSettings();
  }, [formData.societe_id, formData.user_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/mail-settings`, formData);
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue');
    }
  };

  // Toggle la visibilité du mot de passe
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className="form-container">
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit} className={window.innerWidth >= 768 ? "form" :''}>
        <div className="form-group">
          <label>Hôte :</label>
          <input
            type="text"
            name="host"
            value={formData.host}
            onChange={handleChange}
            placeholder="Ex: smtp.example.com"
            required
          />
        </div>

        <div className="form-group">
          <label>Port :</label>
          <input
            type="text"
            name="port"
            value={formData.port}
            onChange={handleChange}
            placeholder="Ex: 587"
            required
          />
        </div>

        <div className="form-group">
          <label>Sécurité :</label>
          <select
            name="security"
            value={formData.security}
            onChange={handleChange}
            className='selectSecu'
          >
            <option value="Aucune">Aucune</option>
            <option value="SSL">SSL</option>
            <option value="TLS">TLS</option>
          </select>
        </div>

        <div className="form-group">
          <label>Nom d'utilisateur :</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Nom d'utilisateur"
            required
          />
        </div>

        <div className="form-group">
          <label>Mot de passe :</label>
          <div className="password-container">
            <input
              type={passwordVisible ? 'text' : 'password'} // Si passwordVisible est vrai, le mot de passe sera visible
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Mot de passe"
              required
            />
            <button
              type="button"
              className="eye-button"
              onClick={togglePasswordVisibility}
            >
              {passwordVisible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            </button>
          </div>
        </div>

        <div className="form-group full-width">
          <button style={window.innerWidth <= 768 ? {marginTop: 20} : {width:'30%'}} type="submit" className="submit-button">Enregistrer</button>
        </div>
      </form>
    </div>
  );
};

export default MailSettingsForm;

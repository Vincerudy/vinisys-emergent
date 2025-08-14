import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './css/ResetPassword.css';
import Logo from '../assets/LogoReset.png';
import { Image } from 'antd';

const ResetPassword = () => {
    const { token } = useParams(); // Récupère le token depuis l'URL
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    

    const handleResetPassword = async (e) => {
        console.log('token reset', token)
        e.preventDefault();
        setMessage('');
        
        if (password !== confirmPassword) {
            setMessage("Les mots de passe ne correspondent pas.");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/reset-new-password/${token}`, { newPassword: password });
            console.log('token reset', response.data.message)
            setMessage(response.data.message);
            setTimeout(() => navigate('/'), 3000); // Redirige après succès
        } catch (error) {
            setMessage(error.response?.data?.message || "Une erreur est survenue.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="resetPassContainer">
            <Image
              width={window.innerWidth <= 768 ? 150 : 250}
              src={Logo}
              preview={false}
              alt="Company Logo"
              className='LogoReset'
            />
            <div className="resetPassContent">
                <h2 className="resetPassTitle">Réinitialiser le mot de passe</h2>
                <form className="resetPassForm" onSubmit={handleResetPassword}>
                    <input
                        type="password"
                        placeholder="Nouveau mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="resetPassInput"
                    />
                    <input
                        type="password"
                        placeholder="Confirmer le mot de passe"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="resetPassInput"
                    />
                    <button type="submit" disabled={loading} className="resetPassButton">
                        {loading ? "Réinitialisation..." : "Valider"}
                    </button>
                </form>
                {message && <p style={message === "Mot de passe réinitialisé avec succès" ? {color: 'green'} : ''} className="resetPassMessage">{message}</p>}
                <div 
                    onClick={() => navigate('/')} 
                    style={{ color: '#18538e', cursor: 'pointer', textDecoration: 'none', marginTop: '30px' }}
                >
                    Retour à la connexion
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;

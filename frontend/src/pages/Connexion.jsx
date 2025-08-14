import React, { useState } from 'react';
import api from '../contexte/Api';
import { useAuth } from '../contexte/AuthContext';
import { useNavigate } from 'react-router-dom';
import './css/Connexion.css'; // Importation du fichier CSS
import Logo from '../assets/logo.png';
import BgLogin from '../assets/bgLogin.png';
 
import { Image } from 'antd';

const Connexion = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [workPhone, setWorkPhone] = useState('');
  const [personalPhone, setPersonalPhone] = useState('');
  const [step, setStep] = useState(1);
  const [isLogin, setIsLogin] = useState(true);
 
  const [errorMessage, setErrorMessage] = useState("Vous devez remplir tous les champs")
  const [errorSaisie, setErrorSaisie] = useState(false)
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isForgetPass, setIsForgetPass] = useState(false)

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e) => {
      e.preventDefault();
      setLoading(true);
      setMessage('');

      try {
          const response = await axios.post(`${import.meta.env.VITE_API_URL}/forgot-password`, { email });
          setMessage(response.data.message);
          console.log(" envois mail ", response.data)
      } catch (error) {
          setMessage(error.response?.data?.message || "Une erreur est survenue.");
      } finally {
          setLoading(false);
      }
  };

  const forgetPassword = ()=>{
    setIsForgetPass(true)
  }

  const handleAuthSubmit = async (e) => {
    console.log('=== CONNEXION DEBUG START ===');
    console.log('handleAuthSubmit called');
    console.log('Event:', e);
    console.log('isLogin:', isLogin);
    console.log('email:', email);
    console.log('password:', password ? '*****' : 'empty');
    
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      if (isLogin) {
        console.log('LOGIN API CALL ATTEMPT');
        console.log('API URL:', `${import.meta.env.VITE_API_URL}/login`);
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/login`, { email, password });
        const data = response.data;
        login(data);
        localStorage.setItem('token', data.token);
        localStorage.setItem('id', data.id);
        localStorage.setItem('societe_id', data.societe_id);
        localStorage.setItem('email', data.email);
        localStorage.setItem('nom', data.nom);
        localStorage.setItem('pren', data.pren);
        localStorage.setItem('permissions', data.permissions);
        localStorage.setItem('urlPhoto', data.urlPhoto);
        console.log('TEST M', data.permissions)
        navigate('/home');
      } else {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/signup/sylver`, { 
          email, 
          password, 
          firstName, 
          lastName, 
          birthDate, 
          companyName, 
          companyAddress, 
          workPhone, 
          personalPhone 
        });
        setMessage(response.data.message);
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.');
      }
    }
  };

  // Fonction pour passer à l'étape suivante
  const nextStep = () => {
    console.log('step ', step);
    setErrorSaisie(false);
    
    if (step < 5) {
        if (step === 1) {
            if (!firstName || !lastName) {
                setErrorSaisie(true);
                return;
            }
        }
        
        if (step === 2) {
            if (!birthDate || !companyName) {
                setErrorSaisie(true);
                return;
            }
        }
        
        if (step === 3) {
            if (!companyAddress || !workPhone) {
                setErrorSaisie(true);
                return;
            }
        }
        
        if (step === 4) {
            if (!personalPhone) {
                setErrorSaisie(true);
                return;
            }
        }
        
        setStep(step + 1);
    }
};


  // Fonction pour revenir à l'étape précédente
  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Calcul de la largeur de la barre de progression
  const getProgressWidth = () => {
    return (step / 5) * 100;
  };

  return (
    <div className='auth-container'>
      <div className='auth-left'>
        <div className='TextTitleLogin'>Logiciel de facturation simple et intuitif</div>
          <Image
            width={500}
            src={BgLogin}
            preview={false}
            alt="Company Logo"
          />
        <div className='baselineLogin'>Un seul outil pour toute votre facturation. </div>
      </div>
      <div className='auth-right'>
        <Image
          width={window.innerWidth <= 768 ? 100 : 200}
          src={Logo}
          preview={false}
          alt="Company Logo"
          className='Logo'
        />
        <div className='auth-box'>
          <h1 className='auth-title neon-text'  >{isLogin ? 'Connexion' : !isForgetPass ? 'Inscription' : 'Mot de passe oublié'}</h1>
 
          {/* Barre de progression */}
          {!isLogin && !isForgetPass && (
            <div  style={{width: '100%'}}>
 
              <div
                className="progress"
                style={{ width: `${getProgressWidth()}%` }}
              ></div>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} noValidate className='auth-form'>
            {!isLogin && !isForgetPass && (
              <>
                {step === 1 && (
                  <>
                    <input
                      className='auth-input neon-input'
                      type="text"
                      placeholder='Nom'
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                    <input
                      className='auth-input neon-input'
                      type="text"
                      placeholder='Prénom'
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                    {errorSaisie ? <p className='erreurMessSaisie'>{errorMessage}</p> : ""} 
                  </>
                )}
                {step === 2 && (
                  <>
                    <input
                      className='auth-input neon-input'
                      type="date"
                      placeholder='Date de Naissance'
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      required
                    />
                    <input
                      className='auth-input neon-input'
                      type="text"
                      placeholder='Raison sociale'
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                    />
                    {errorSaisie ? <p className='erreurMessSaisie'>{errorMessage}</p> : ""} 
                  </>
                )}
                {step === 3 && (
                  <>
                    <input
                      className='auth-input neon-input'
                      type="text"
                      placeholder="Adresse de l'entreprise"
                      value={companyAddress}
                      onChange={(e) => setCompanyAddress(e.target.value)}
                      required
                    />
                    <input
                      className='auth-input neon-input'
                      type="tel"
                      placeholder='Téléphone professionnel'
                      value={workPhone}
                      onChange={(e) => setWorkPhone(e.target.value)}
                      required
                    />
                    {errorSaisie ? <p className='erreurMessSaisie'>{errorMessage}</p> : ""} 
                  </>
                )}
                {step === 4 && (
                  <>
                    <input
                      className='auth-input neon-input'
                      type="tel"
                      placeholder='Téléphone personnel'
                      value={personalPhone}
                      onChange={(e) => setPersonalPhone(e.target.value)}
                      required
                    />
                    {errorSaisie ? <p className='erreurMessSaisie'>{errorMessage}</p> : ""} 
                  </>
                )}
                {step === 5 && (
                  <>
                    <input
                      className='auth-input neon-input'
                      type="email"
                      placeholder='Email'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <input
                      className='auth-input neon-input'
                      type="password"
                      placeholder='Mot de passe'
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  {errorSaisie ? <p className='erreurMessSaisie'>{errorMessage}</p> : ""} 
                  </>
                )}

                <div className="auth-buttons">
                  {step > 1 && (
                    <button
                      type="button"
                      className="auth-button neon-button"
                      onClick={prevStep}
                    >
                      Précédent
                    </button>
                  )}
                  {step < 5 ? (
                    <button
                      type="button"
                      className="auth-button neon-button"
                      onClick={nextStep}
                    >
                      Suivant
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="auth-button neon-button"
                    >
                      GO !
                    </button>
                  )}
                </div>
                 
              </>
            )}
            {isForgetPass ?
              <input
                  className='auth-input neon-input'
                  type="email"
                  placeholder='Email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
              />

              
            :''}
 
              {isForgetPass ?
                <div className='auth-button neon-button' onClick={handleForgotPassword}>
                  Confirmer
                </div>
              :''}
            {isLogin && !isForgetPass && (
              <>
                <input
                  className='auth-input neon-input'
                  type="email"
                  placeholder='Email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input
                  className='auth-input neon-input'
                  type="password"
                  placeholder='Mot de passe'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type='submit' className='auth-button neon-button'>
                  C'est parti !
                </button>
              </>
            )}
            {error && <p className='error-message'>{error}</p>}
            {message && <p className='success-message'>{message}</p>}
          </form>

          <button
            className='toggle-auth neon-button'
            onClick={() => {
              setIsForgetPass(false)
              setIsLogin(!isLogin)}
            }
          >
            {isLogin ? "Pas encore de compte ? Inscrivez-vous" : "Déjà un compte ? Connectez-vous"}
          </button>
          {!isForgetPass ?
            <button
              className='toggle-auth neon-button forgetPass'
              onClick={() => {
                setIsForgetPass(true)
                setIsLogin(false)}
              }
            >
              Mot de passe oublié
            </button>
          : ''}
        </div>
      </div>
    </div>
  );
};

export default Connexion;

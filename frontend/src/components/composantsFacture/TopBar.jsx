import React from 'react';
import './css/TopBar.css';
  // Assumons que le contexte Auth fournit les informations de l'utilisateur
import { Image } from 'antd'; // Assumons que tu utilises Ant Design pour le logo
import logo from '../../assets/logo.png'

const TopBar = ({companyName, nom, prenom, imgPath}) => {
  
  return (
    <div className="top-bar">
      <div className="logo-container">
        <Image
          width={200}
          src={logo} // Remplace par le chemin vers le logo de la société
          preview={false}
          alt="Company Logo"
        />
      </div>
       
    <div className='user-info'>
     
       {imgPath ? <img src={imgPath} style={{ height: '100%', width: 'auto', marginRight: 15 }} /> :<strong>{companyName}</strong>} 
        <span className='topbarMobile' style={{marginLeft: '5px'}}>- Bonjour  {prenom} {nom}</span> {/* Remplace 'name' par le champ approprié */}
    </div>
    </div>
  );
};

export default TopBar;

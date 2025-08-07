import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Tooltip } from 'antd'; 
import { 
  UserOutlined, 
  SettingOutlined, 
  HomeOutlined, 
  DollarOutlined, 
  CalculatorOutlined, 
  MessageOutlined, 
  LogoutOutlined 
} from '@ant-design/icons';
import { useAuth } from '../../contexte/AuthContext';
import './css/NavBarLeft.css';

const NavBarLeft = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="navbar-Container">
      <ul className="sidebar-links">
      <li style={{ position: 'relative' }}>
      <Tooltip title="Accueil" placement="right">  {/* Changer en "left" ou "right" */}
        <NavLink
          to="/facturation"
          className={({ isActive }) => (isActive ? 'active-link' : '')}
        >
          <HomeOutlined className="icon" />
        </NavLink>
      </Tooltip>
      </li>
      {/* 
        <li>
          <NavLink
            to="/personnel"
            className={({ isActive }) => (isActive ? 'active-link' : '')}
          >
            <UserOutlined className="icon" /> Portail RH
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/facturation"
            className={({ isActive }) => (isActive ? 'active-link' : '')}
          >
            <DollarOutlined className="icon" /> Facturation
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/comptabilite"
            className={({ isActive }) => (isActive ? 'active-link' : '')}
          >
            <CalculatorOutlined className="icon" /> Comptabilité
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/administration"
            className={({ isActive }) => (isActive ? 'active-link' : '')}
          >
            <MessageOutlined className="icon" /> Administration
          </NavLink>
        </li>
  */}
        <li>
        <Tooltip title="Paramétrage de la société" placement="right">
          <NavLink
            to="/Configuration"
            className={({ isActive }) => (isActive ? 'active-link' : '')}
          >
            <SettingOutlined className="icon" /> 
          </NavLink>
        </Tooltip>
        </li>
 
      </ul>
 
      <ul className="sidebar-links"> 
      <li  onClick={handleLogout}>
   
          <Tooltip title="Déconnexion" placement="right">
          <NavLink
            to="/Configuration"
            className={({ isActive }) => (isActive ? 'active-link' : '')}
          >
        <LogoutOutlined className="icon" />
          </NavLink>
        </Tooltip>
     
        
        </li>
     </ul>
    </div>
  );
};

export default NavBarLeft;

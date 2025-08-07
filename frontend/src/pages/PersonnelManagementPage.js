import React, { useState } from 'react';
import { Tabs, Button, Table, Form, Input, Select, DatePicker, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import './css/PersonnelManagementPage.css';
import DashboardLayout from './composants/DashboardLayout';
import EmployeeForm from './composants/EmployeeForm';
import DashboardAbsence from './composants/DashboardAbsence';
import AgendaAbsence from './composants/AgendaAbsence';

const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;


const PersonnelManagementPage = () => {
  const [activeTab, setActiveTab] = useState('employees');
  const [activeTabAgenda, setActiveTabAgenda] = useState('tab1')
  const [form] = Form.useForm();

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const handleTabChangeAbsence = (key) => {
    setActiveTabAgenda(key);
  };
 
 

  return (
    <DashboardLayout> 
    <div className="personnel-management-container">
      <h1 className="page-title">Portail RH</h1>
            <Tabs defaultActiveKey="employees" onChange={handleTabChange} className="tabs">
            <TabPane tab="Employés" key="employees">
              <EmployeeForm/>
            </TabPane>
            <TabPane tab="Absences" key="absences">
               <div className='containerAbsence'>
              
                  <Tabs 
                    tabPosition="left" // Positionne les onglets à droite
                    activeKey={activeTabAgenda} // État pour l'onglet actif
                    onChange={handleTabChangeAbsence}
                  >
                  <Tabs.TabPane tab="Tableau de bord" key="tab1">
                    <DashboardAbsence/>
                  </Tabs.TabPane>
                  <Tabs.TabPane tab="Agenda" key="tab2">
                    <AgendaAbsence/>
                  </Tabs.TabPane>
                  {/* Ajoutez d'autres onglets ici */}
                  </Tabs>
        
           </div>
        </TabPane>
        <TabPane tab="Salaires" key="salaries">
       
        </TabPane>
        <TabPane tab="Recrutements" key="recruitment">
         
        </TabPane>
        <TabPane tab="Évaluations" key="evaluations">
          
        </TabPane>
        <TabPane tab="Formations" key="trainings">
         
        </TabPane>
        <TabPane tab="Compétences" key="skills">
          
        </TabPane>
      </Tabs>

       
    </div>
    </DashboardLayout>
  );
};

export default PersonnelManagementPage;

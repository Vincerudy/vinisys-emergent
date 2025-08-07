import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Row, Col, Select, DatePicker, Switch, Tabs, Modal } from 'antd';
import moment from 'moment'; // Importation de moment.js
import './css/EmployeeForm.css'; // Fichier CSS externe pour le style personnalisé
import axios from 'axios';
import no_picture from '../../assets/no-picture.png'
import photo1 from '../../assets/photo1.jpg'
import photo2 from '../../assets/photo2.jpg'
import photo3 from '../../assets/photo3.jpg'
import photo4 from '../../assets/photo4.jpg'
import photo5 from '../../assets/photo5.png'
import EmployeeModale from '../composants/EmployeeModale'
 

const { Option } = Select;
const { TabPane } = Tabs;

const EmployeeForm = () => {
  
    const [selectedEmployeeIndex, setSelectedEmployeeIndex] = useState(0);
    const [form] = Form.useForm();
    const [searchTerm, setSearchTerm] = useState('');
    const [newPhoto, setNewPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(no_picture); // Valeur par défaut
    const [modaleVisible, setModalVisible] = useState(false)

  
 

  // Données des employés fictifs
  const employees = [ 
    {
      name: 'Alice Dupont',
      genre: 'female',
      firstName: 'Alice',
      lastName: 'Dupont',
      birthDate: moment('1990-01-01'), // Format moment
      address: '123 Rue de Paris',
      zipCode: '75001',
      city: 'Paris',
      phone: '0123456789',
      email: 'alice.dupont@example.com',
      socialSecurityNumber: '123-45-6789',
      nationality: 'Française',
      poste: 'Développeuse',
      position: 'Junior',
      niveau: '1',
      coefficient: '1.2',
      manager: 'manager1',
      hoursPerMonth: '160',
      hoursPerDay: '8',
      hourlyRate: '20',
      monthlySalary: '3200',
      contractType: 'CDI',
      entryDate: moment('2022-01-15'), // Format moment
      exitDate: null,
      iban: 'FR761234567890',
      isExecutive: false,
      isPartner: false,
      isPartTime: false,
      photo: newPhoto ? newPhoto : photo2,
    },
    {
      name: 'Bob Martin',
      genre: 'male',
      firstName: 'Bob',
      lastName: 'Martin',
      birthDate: moment('1985-05-20'), // Format moment
      address: '456 Avenue des Champs-Élysées',
      zipCode: '75008',
      city: 'Paris',
      phone: '0987654321',
      email: 'bob.martin@example.com',
      socialSecurityNumber: '987-65-4321',
      nationality: 'Français',
      poste: 'Manager',
      position: 'Senior',
      niveau: '3',
      coefficient: '1.5',
      manager: 'manager2',
      hoursPerMonth: '160',
      hoursPerDay: '8',
      hourlyRate: '30',
      monthlySalary: '4800',
      contractType: 'CDD',
      entryDate: moment('2023-02-01'), // Format moment
      exitDate: null,
      iban: 'FR769876543210',
      isExecutive: true,
      isPartner: true,
      isPartTime: false,
      photo: newPhoto ? newPhoto : photo3, // Pas de photo de profil au départ
    },
    {
        name: 'Giorgia Oliva',
        genre: 'female',
        firstName: 'Giorgia',
        lastName: 'Oliva',
        birthDate: moment('1990-01-08'), // Format moment
        address: '123 Rue de Paris',
        zipCode: '75001',
        city: 'Paris',
        phone: '0123456789',
        email: 'alice.dupont@example.com',
        socialSecurityNumber: '123-45-6789',
        nationality: 'Française',
        poste: 'Développeuse',
        position: 'Junior',
        niveau: '1',
        coefficient: '1.2',
        manager: 'manager1',
        hoursPerMonth: '160',
        hoursPerDay: '8',
        hourlyRate: '20',
        monthlySalary: '3200',
        contractType: 'CDI',
        entryDate: moment('2022-01-15'), // Format moment
        exitDate: null,
        iban: 'FR761234567890',
        isExecutive: false,
        isPartner: false,
        isPartTime: false,
        photo: newPhoto ? newPhoto : photo5,
      },
      {
        name: 'Ding Dong',
        genre: 'female',
        firstName: 'Ding',
        lastName: 'Dong',
        birthDate: moment('1990-01-01'), // Format moment
        address: '123 Rue de Paris',
        zipCode: '75001',
        city: 'Paris',
        phone: '0123456789',
        email: 'alice.dupont@example.com',
        socialSecurityNumber: '123-45-6789',
        nationality: 'Française',
        poste: 'Développeuse',
        position: 'Junior',
        niveau: '1',
        coefficient: '1.2',
        manager: 'manager1',
        hoursPerMonth: '160',
        hoursPerDay: '8',
        hourlyRate: '20',
        monthlySalary: '3200',
        contractType: 'CDI',
        entryDate: moment('2022-01-15'), // Format moment
        exitDate: null,
        iban: 'FR761234567890',
        isExecutive: false,
        isPartner: false,
        isPartTime: false,
        photo: newPhoto ? newPhoto : photo4,
      },
      {
        name: 'Jean Paul',
        genre: 'Male',
        firstName: 'Jean',
        lastName: 'Paul',
        birthDate: moment('1990-01-09'), // Format moment
        address: '123 Rue de Paris',
        zipCode: '75001',
        city: 'Paris',
        phone: '0123456789',
        email: 'alice.dupont@example.com',
        socialSecurityNumber: '123-45-6789',
        nationality: 'Française',
        poste: 'Développeuse',
        position: 'Junior',
        niveau: '1',
        coefficient: '1.2',
        manager: 'manager1',
        hoursPerMonth: '160',
        hoursPerDay: '8',
        hourlyRate: '20',
        monthlySalary: '3200',
        contractType: 'CDI',
        entryDate: moment('2022-01-15'), // Format moment
        exitDate: null,
        iban: 'FR761234567890',
        isExecutive: false,
        isPartner: true,
        isPartTime: false,
        photo: newPhoto ? newPhoto : photo1,
      },
  ];

 

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
 

  // Met à jour les champs de formulaire lorsque l'employé sélectionné change
  useEffect(() => {
    if (filteredEmployees[selectedEmployeeIndex]) {
      const selectedEmployee = filteredEmployees[selectedEmployeeIndex];
      form.setFieldsValue(selectedEmployee);

      // Réinitialise la photo à la valeur par défaut lors du changement d'employé
      setNewPhoto(null); // Réinitialise la photo chargée
      
    }
  }, [selectedEmployeeIndex, filteredEmployees, form]);

  useEffect(() => {
    setPhotoPreview(filteredEmployees[selectedEmployeeIndex].photo || no_picture); // Utilisez la photo de l'employé ou la photo par défaut
  }, [selectedEmployeeIndex])

  const handleTabChange = (key) => {
    setSelectedEmployeeIndex(parseInt(key) - 1);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setSelectedEmployeeIndex(0); // Réinitialiser à l'employé par défaut lors de la recherche
    form.resetFields(); // Réinitialise le formulaire
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewPhoto(URL.createObjectURL(file));
      setPhotoPreview(URL.createObjectURL(file)); // Affiche la nouvelle photo immédiatement
    }
  };

      // Fonction pour enregistrer les données de l'employé
      const handleSubmit = async (values) => {
        console.log('values ', values)
        try {
            const employeeData = {
                ...values,
                photo: newPhoto || no_picture, // Utiliser la photo nouvellement chargée ou la photo par défaut
            };
            const response = await axios.post('/employees', employeeData);
            console.log('Employé enregistré avec succès:', response.data);
            // Réinitialiser le formulaire ou afficher un message de succès ici
            form.resetFields();
            setNewPhoto(null);
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement de l\'employé:', error);
            // Gérer l'erreur (par exemple, afficher un message d'erreur)
        }
    };

    const handleOpenModale = () => {
      setModalVisible(true)
    }

    const handleCloseModale = () =>{
      setModalVisible(false)
    }


  return (
    <div className="employee-form-container">
      <div className='topEmployeePage'>
      <Input
        placeholder="Rechercher un employé"
        value={searchTerm}
        onChange={handleSearch}
        className='inputSearch'
      />
        <Button className='btnNewEmploye' onClick={handleOpenModale} > 
        Ajouter du personnel
        </Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div>
          <Tabs tabPosition="left" activeKey={(selectedEmployeeIndex + 1).toString()} onChange={handleTabChange}>
            {filteredEmployees.map((employee, index) => (
              <TabPane tab={employee.name} key={(index + 1).toString()} />
            ))}
          </Tabs>
        </div>

        <div>
          <Tabs tabPosition="left" defaultActiveKey="1" >
            {/* Onglet État civil */}
            <TabPane tab="État civil" key="1" className='fieldSetForm'>
              <Form form={form} layout="vertical"  onFinish={handleSubmit}>
                
              <div className="photo-profil">
                  <label htmlFor="upload-photo">
                    <img
                      src={photoPreview || no_picture} // Ajouter un chemin par défaut si aucune photo n'est sélectionnée
                      alt="photo profil"
                      style={{
                        display: 'flex',
                        justifyContent: 'center', // Centre horizontalement
                        alignItems: 'center', // Centre verticalement
                        height: '100%', // Hauteur du conteneur (ajustez selon vos besoins)
                        width: '100%', // Largeur du conteneur
                        overflow: 'hidden' // Cache le débordement
                      }}
                    />
                  </label>
                  <input
                    type="file"
                    id="upload-photo"
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                </div>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Genre" name="genre">
                      <Select>
                        <Option value="male">Masculin</Option>
                        <Option value="female">Féminin</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Prénom" name="firstName" rules={[{ required: true }]}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Nom" name="lastName" rules={[{ required: true }]}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Date de naissance" name="birthDate">
                      <DatePicker value={form.getFieldValue('birthDate')} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Adresse" name="address">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Code postal" name="zipCode">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Ville" name="city">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Téléphone" name="phone">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Email" name="email">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="N° sécurité sociale" name="socialSecurityNumber">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Nationalité" name="nationality">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <div style={{width:'100%', display: 'flex', justifyContent: 'flex-end'}}>
                <Form.Item>
                 <Button type="primary" htmlType="submit">Valider</Button>
                </Form.Item>
              </div>
              </Form>
            </TabPane>

            {/* Onglet Informations professionnelles */}
            <TabPane tab="Informations professionnelles" key="2" className='fieldSetForm'>
              <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <div style={{width:'100%', display: 'flex', justifyContent: 'flex-end'}}>
                <Form.Item>
                 <Button type="primary" htmlType="submit">Valider</Button>
                </Form.Item>
              </div>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Poste" name="poste">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Position" name="position">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Niveau" name="niveau">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Coefficient" name="coefficient">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Manager du salarié" name="manager">
                      <Select>
                        <Option value="manager1">Manager 1</Option>
                        <Option value="manager2">Manager 2</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Nombre d'heures/mois" name="hoursPerMonth">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Nombre d'heures à tracker/jour" name="hoursPerDay">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Coût moyen horaire" name="hourlyRate">
                      <Input prefix="€" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Montant brut mensuel" name="monthlySalary">
                      <Input prefix="€" />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </TabPane>

            {/* Onglet Contrat */}
            <TabPane tab="Contrat" key="3" className='fieldSetForm'>
              <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <div style={{width:'100%', display: 'flex', justifyContent: 'flex-end'}}>
                <Form.Item>
                 <Button type="primary" htmlType="submit">Valider</Button>
                </Form.Item>
              </div>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Type de contrat" name="contractType">
                      <Select>
                        <Option value="CDI">CDI</Option>
                        <Option value="CDD">CDD</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Date d'entrée" name="entryDate">
                      <DatePicker value={form.getFieldValue('entryDate')} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Date de sortie" name="exitDate">
                      <DatePicker value={form.getFieldValue('exitDate')} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="IBAN" name="iban">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Salarié cadre" name="isExecutive" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Salarié associé" name="isPartner" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Temps partiel" name="isPartTime" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>
                </Row>
                
 
              </Form>
            </TabPane>
          </Tabs>
        </div>
      </div>
      <Modal
      visible={modaleVisible}
      onOk={handleSubmit}
      onCancel={handleCloseModale}
      closable={false} // Supprimer la croix de fermeture
      okText="Valider"
      cancelText="Annuler"
      width="55vw" // Largeur à 50% de la fenêtre
      styles={{
        body: {
          height: window.innerWidth <= 768 ? '60vh' : '80vh',
          overflowY: 'auto',
          overflowX: 'hidden',
        },
        mask: {},      // si tu veux styliser le fond sombre
        header: {},    // si tu veux styliser le header
        footer: {},    // idem pour le footer
        content: {},   // contenu global
      }}
      className={modaleVisible ? 'modal-slide-in' : ''}
      style={{
        right: 0, // Toujours collé à droite
        position: 'fixed',
        top: '5%', // Ajustez la position verticale si nécessaire
        margin: 0,
        padding: 0,
      }}
    >
      <div style={{ width: '100%' }}>
        <EmployeeModale />
      </div>
    </Modal>
    </div>
  );
};

export default EmployeeForm;

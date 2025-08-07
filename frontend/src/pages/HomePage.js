import React, {useState, useEffect} from 'react';
import DashboardLayout from '../pages/composants/DashboardLayout'; // Importer le layout
import { Tabs, Card } from 'antd';
import { LineChart, Line, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend, BarChart , } from 'recharts';
import Salarie from '../assets/salarie.png'
import ImgAdministrative from '../assets/administrative.png'
import AlertList from './composants/AlertList';
import { useAuth } from '../contexte/AuthContext';
import axios from 'axios';



const { TabPane } = Tabs;
const fakeReports = [
  { name: 'Revenus', value: 2000.00 },
  { name: 'Dépenses', value: 1500.00 },
  { name: 'Bénéfice', value: 500.00 },
];

const HomePage = () => {

  const { email, id } = useAuth();
const [userData, setUserData] = useState({});

    const salesData = [
    { name: 'Jan', sales: 4000 },
    { name: 'Feb', sales: 3000 },
    { name: 'Mar', sales: 5000 },
    { name: 'Apr', sales: 2000 },
    { name: 'May', sales: 6000 },
    { name: 'Jun', sales: 8000 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/globalhome?id=${id}`);
        setUserData(response.data[0])
      } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
      }
    };

    fetchData();
  }, []);

 
  return (
    <DashboardLayout >
      <div className='homContainer'>
 
        <div className='blocGride'>
          
          <div className='blocModule ' onClick={() => window.location.href = '/personnel'}>
            <div className='titleBlox backgroundColorPersonel' >
              <h2>Portail RH</h2>
            </div>
            <div className='blocContainer'>
              <img className='imageSalarie' src={Salarie} alt="Description de l'image" style={{ width: '80%', height: 'auto', marginTop: '10%' }} />
            </div>
          </div>

          <div className='blocModule' onClick={() => window.location.href = '/facturation'}>
            <div className='titleBlox backgroundColorFacturation'>
              <h2>Facturation</h2>
            </div>
            <div>
            <Card title="Ventes Mensuelles">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
            </div>
          </div>
          <div className='blocModule' onClick={() => window.location.href = '/comptabilite'}>
            <div className='titleBlox backgroundColorCompta'>
              <h2>Comptabilité</h2>
            </div>
            <div >
            <Card title="Ventes Mensuelles">
            <ResponsiveContainer width="100%" height={200}>
            <BarChart width={600} height={300} data={fakeReports}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
          </ResponsiveContainer>
          </Card>
          </div>
          </div>

          <div className='blocModule' onClick={() => window.location.href = '/administration'}>
            <div className='titleBlox backgroundColorAdministrative' >
              <h2>Gestion administrative</h2>
            </div>
            <div>
            <img className='imageSalarie' src={ImgAdministrative} alt="Description de l'image" style={{ width: '80%', height: 'auto', marginTop: '10%', marginLeft: '10%' }} />
            </div>
          </div>

        </div>
        <div className='blocInfo'>
          <div className='titleBlox backgroundColorInformation'>
            <p>Information</p>
          </div>
          <div className='BlocListItems'>
            <AlertList/>
          </div>
        </div>
 
      </div>
    </DashboardLayout>
  );
};

export default HomePage;

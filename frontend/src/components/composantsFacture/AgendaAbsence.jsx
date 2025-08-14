import React, { useState, useEffect } from 'react';
import { Table, Button, Select, Space, Progress, Input } from 'antd';
import './css/AgendaAbsence.css'; // Le fichier CSS pour la mise en page

const { Option } = Select;
const { Search } = Input;

// Données factices pour les membres de l'équipe et événements
const teamMembers = [
  "Romain MATHE", "ANDRIAMAROLAHY Anja", "BUTTNER Olivier", "COHEN Pierre", 
  "KAHAN Lionel", "MOUKO Vince", "PANAGUA René", "TRIVIER Céline", 
  "VACHÉ Antoine", "VAN CRACYNEST Alexandre", "VANNIER Benjamin", "VIVIER Sylvain"
];

const initialData = [
  { member: "Romain MATHE", days: [null, null, null, "event", null, null, "event"] },
  { member: "ANDRIAMAROLAHY Anja", days: ["event", null, null, null, "event", null, null] },
  { member: "BUTTNER Olivier", days: [null, "event", null, null, null, null, "event"] },
  { member: "COHEN Pierre", days: [null, null, "event", null, null, "event", null] },
  // Ajoutez d'autres membres et événements ici
];

// Fonction pour obtenir le début de la semaine (par défaut lundi)
const getStartOfWeek = (date) => {
  const currentDay = date.getDay();
  const difference = currentDay === 0 ? -6 : 1 - currentDay;
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() + difference);
  return startOfWeek;
};

// Fonction pour générer les jours de la semaine
const generateWeekDays = (startDay) => {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startDay);
    day.setDate(startDay.getDate() + i);
    days.push(day.toLocaleDateString("fr-FR", { weekday: 'short', day: 'numeric' }));
  }
  return days;
};

const Agenda = () => {
  const [currentWeek, setCurrentWeek] = useState(getStartOfWeek(new Date()));
  const [data, setData] = useState(initialData);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    const today = new Date();
    setCurrentWeek(getStartOfWeek(today));
  }, []);

  const handleNextWeek = () => {
    const nextWeek = new Date(currentWeek);
    nextWeek.setDate(currentWeek.getDate() + 7);
    setCurrentWeek(nextWeek);
  };

  const handlePrevWeek = () => {
    const prevWeek = new Date(currentWeek);
    prevWeek.setDate(currentWeek.getDate() - 7);
    setCurrentWeek(prevWeek);
  };

  const weekDays = generateWeekDays(currentWeek);

  // Colonnes du tableau
  const columns = [
    {
      title: 'Membre de l\'équipe',
      dataIndex: 'member',
      key: 'member',
      width: 200,
    },
    ...weekDays.map((day, index) => ({
      title: day,
      dataIndex: `day${index + 1}`,
      key: `day${index + 1}`,
      render: (event) => (event ? <div className="event">{event}</div> : null),
    })),
  ];

  // Filtrer les données en fonction de la recherche
  const filteredData = data.filter(row => 
    row.member.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Formater les données pour Ant Design
  const tableData = filteredData.map((row, rowIndex) => ({
    key: rowIndex,
    member: row.member,
    day1: row.days[0],
    day2: row.days[1],
    day3: row.days[2],
    day4: row.days[3],
    day5: row.days[4],
    day6: row.days[5],
    day7: row.days[6],
  }));

  return (
    <div className="agenda-container">
      <div className="header-banner">
        <h1>Mon agenda</h1>
        <Button type="primary" danger className="request-button">
          Faire une demande
        </Button>
      </div>

      <div className='blocTableauEtGraph'>
        <div className="content-wrapper">
          <div className='blocTableau'>
            <div className="agenda-section">
              <div className="header">
                <Button onClick={handlePrevWeek}>←</Button>
                <span className="month">
                  {currentWeek.toLocaleDateString("fr-FR", { month: 'long', year: 'numeric' })}
                </span>
                <Button onClick={handleNextWeek}>→</Button>
                <Space>
                  <Select defaultValue="Équipe">
                    <Option value="Équipe">Équipe</Option>
                    <Option value="Individuel">Individuel</Option>
                  </Select>
                  {/* Ajout du champ de recherche */}
                  <Search 
                    placeholder="Rechercher un salarié" 
                    onChange={(e) => setSearchValue(e.target.value)} 
                    style={{ width: 200 }} 
                  />
                </Space>
              </div>

              <Table
                columns={columns}
                dataSource={tableData}
                pagination={false}
                bordered
                className="agenda-table"
              />
            </div>
          </div>
        </div>

        <div className="Absencesidebar">
          <h3>Solde disponible</h3>
          <Select defaultValue="Période en cours">
            <Option value="Période en cours">Période en cours</Option>
            <Option value="Période précédente">Période précédente</Option>
          </Select>

          <div className="solde-block">
            <h4>CP N-1</h4>
            <Progress type="dashboard" percent={100} format={() => '0'} />
            <div className="solde-details">
              <p>Acquis: 25</p>
              <p>Planifié: 0</p>
              <p>Pris: 25</p>
              <p>Solde: 0</p>
            </div>
          </div>

          <div className="solde-block">
            <h4>CP N</h4>
            <Progress type="dashboard" percent={33} format={() => '8.33'} />
            <div className="solde-details">
              <p>Acquis: 8.33</p>
              <p>Planifié: 0</p>
              <p>Pris: 0</p>
              <p>Solde: 8.33</p>
            </div>
          </div>

          <div className="solde-block">
            <h4>RTT</h4>
            <Progress type="dashboard" percent={100} format={() => '0'} />
            <div className="solde-details">
              <p>Acquis: 6</p>
              <p>Planifié: 0</p>
              <p>Pris: 6</p>
              <p>Solde: 0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Agenda;

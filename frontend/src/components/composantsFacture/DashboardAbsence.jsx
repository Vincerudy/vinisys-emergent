import React from 'react';
import { Card, Row, Col, Button, Calendar, Typography, Progress, Dropdown, Menu } from 'antd';
import { PlusOutlined, CalendarOutlined } from '@ant-design/icons';
import './css/DashboardAbsence.css'

const { Title, Text } = Typography;

const Dashboard = () => {
  const handleMenuClick = (e) => {
    console.log('Dropdown selected:', e.key);
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="1">Période en cours</Menu.Item>
      <Menu.Item key="2">Période précédente</Menu.Item>
    </Menu>
  );

  return (
    <div className="dashboard-container">
      {/* Section de bienvenue */}
      <div className="welcome-section">
        <Row>
          <Col span={20}>
            <Title level={2} className="welcome-title"><p style={{color: 'white'}}>Bonjour MOUKO Vince</p></Title>
            <Text className="welcome-text">Bienvenue sur votre espace personnel</Text>
          </Col>
          <Col span={4}>
            <img
              src="https://via.placeholder.com/100"
              alt="User Illustration"
              className="user-image"
            />
          </Col>
        </Row>
      </div>

      {/* Section absence et congés */}
      <Row gutter={16}>
        <Col span={16}>
          <Card className="absence-card">
            <Row>
              <Col span={12}>
                <Button type="primary" icon={<CalendarOutlined />} className="absence-button">
                  Absence
                </Button>
              </Col>
              <Col span={12} style={{ textAlign: 'right' }}>
                <Button shape="circle" icon={<PlusOutlined />} className="absence-button" />
              </Col>
            </Row>

            <Title level={4} className="absence-title">Mes compteurs absences et congés</Title>

            {/* Solde disponible */}
            <Dropdown overlay={menu} trigger={['click']}>
              <Button className="balance-dropdown-button">Période en cours</Button>
            </Dropdown>

            {/* Compteurs */}
            <Row gutter={16}>
              <Col span={8}>
                <Card className="counter-card">
                  <Text className="counter-value">0</Text>
                  <br />
                  <Text className="counter-label">CP N-1</Text>
                </Card>
              </Col>
              <Col span={8}>
                <Card className="counter-card">
                  <Progress type="circle" percent={83.3} format={percent => `${(percent / 10).toFixed(2)}`} strokeColor="#1890ff" />
                  <br />
                  <Text className="counter-label">CP N</Text>
                </Card>
              </Col>
              <Col span={8}>
                <Card className="counter-card">
                  <Text className="counter-value">0</Text>
                  <br />
                  <Text className="counter-label">RTT</Text>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Agenda section */}
        <Col span={8}>
          <Card className="agenda-card">
            <Title level={4} className="agenda-title">Agenda</Title>
            <Calendar fullscreen={false} />
            <div className="agenda-text">
              <Text>Aucune absence à venir</Text>
              <br />
              <img src="https://via.placeholder.com/50" alt="Absence illustration" className="agenda-img" />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;

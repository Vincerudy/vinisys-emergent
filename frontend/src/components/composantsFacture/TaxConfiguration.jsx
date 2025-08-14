import React, { useState } from 'react';
import { Form, Input, Button, Select, message, Row, Col } from 'antd';
import './css/TaxConfiguration.css'; // Importer le fichier CSS pour le style

const { Option } = Select;

const TaxConfiguration = () => {
    const [taxRates, setTaxRates] = useState({
        tva: '',
        impotsSocietes: '',
        cotisationsSociales: '',
        autresTaxes: ''
    });

    const [customTaxes, setCustomTaxes] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTaxRates({ ...taxRates, [name]: value });
    };

    const handleCustomTaxChange = (index, field, value) => {
        const updatedTaxes = [...customTaxes];
        updatedTaxes[index][field] = value;
        setCustomTaxes(updatedTaxes);
    };

    const handleAddCustomTax = () => {
        setCustomTaxes([...customTaxes, { name: '', rate: '', application: '' }]);
    };

    const handleSubmit = () => {
        // Valider et traiter les données ici
        message.success('Taux de taxes enregistrés avec succès!');
        console.log('Taux de taxes:', { ...taxRates, customTaxes });
    };

    return (
        <div className="tax-configuration-container">
            <h1>Configuration des Taux de Taxes</h1>
            <Button type="dashed" onClick={handleAddCustomTax} className="add-tax-button">
                Ajouter une Taxe
            </Button>
            <div className='zoneScrolle'> 
                <Form layout="vertical" onFinish={handleSubmit}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Taux de TVA (%)" required>
                                <Input
                                    type="number"
                                    name="tva"
                                    value={taxRates.tva}
                                    onChange={handleChange}
                                    placeholder="Entrez le taux de TVA"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Taux d'Impôt sur les Sociétés (%)" required>
                                <Input
                                    type="number"
                                    name="impotsSocietes"
                                    value={taxRates.impotsSocietes}
                                    onChange={handleChange}
                                    placeholder="Entrez le taux d'impôt sur les sociétés"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Taux de Cotisations Sociales (%)" required>
                                <Input
                                    type="number"
                                    name="cotisationsSociales"
                                    value={taxRates.cotisationsSociales}
                                    onChange={handleChange}
                                    placeholder="Entrez le taux de cotisations sociales"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Autres Taxes (%)">
                                <Input
                                    type="number"
                                    name="autresTaxes"
                                    value={taxRates.autresTaxes}
                                    onChange={handleChange}
                                    placeholder="Entrez d'autres taxes"
                                />
                            </Form.Item>
                        </Col>
                    </Row>


                    {customTaxes.map((tax, index) => (
                        <Row key={index} gutter={16} className="custom-tax">
                            <Col span={8}>
                                <Form.Item label="Nom de la Taxe" required>
                                    <Input
                                        value={tax.name}
                                        onChange={(e) => handleCustomTaxChange(index, 'name', e.target.value)}
                                        placeholder="Entrez le nom de la taxe"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="Taux (%)" required>
                                    <Input
                                        type="number"
                                        value={tax.rate}
                                        onChange={(e) => handleCustomTaxChange(index, 'rate', e.target.value)}
                                        placeholder="Entrez le taux de la taxe"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="Champ d'Application" required>
                                    <Select
                                        value={tax.application}
                                        onChange={(value) => handleCustomTaxChange(index, 'application', value)}
                                        placeholder="Sélectionnez le champ d'application"
                                    >
                                        <Option value="vente">Vente</Option>
                                        <Option value="achat">Achat</Option>
                                        <Option value="services">Services</Option>
                                        <Option value="autres">Autres</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                    ))}

                    <Button type="primary" htmlType="submit" style={{ marginTop: '20px' }}>
                        Enregistrer les Taux
                    </Button>
                </Form>
            </div>
        </div>
    );
};

export default TaxConfiguration;

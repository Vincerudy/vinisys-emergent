import React, { useState } from 'react';
import { Button, Upload, message, Table, Typography, Alert } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import api from '../contexte/Api';
import { useAuth } from '../contexte/AuthContext';
import '../pages/css/ImportProduitsPage.css';

const { Title, Text } = Typography;

const colonnesProduit = [
  { title: 'Nom du produit', dataIndex: 'nom', key: 'nom' },
  { title: 'Description', dataIndex: 'description', key: 'description' },
  { title: 'Stock disponible', dataIndex: 'stock_disponible', key: 'stock_disponible' },
  { title: 'Seuil minimum', dataIndex: 'seuil_minimum', key: 'seuil_minimum' },
  { title: 'Catégorie', dataIndex: 'categorie', key: 'categorie' },
  { title: 'Sous catégorie', dataIndex: 'sous_categorie', key: 'sous_categorie' },
  {
    title: 'Prix unitaire HT',
    dataIndex: 'prix_unitaire_ht',
    key: 'prix_unitaire_ht',
    render: (val) =>
      val !== null && val !== undefined && val !== '' ? `${val} €` : '-',
  },
  {
    title: 'TVA (%)',
    dataIndex: 'tva',
    key: 'tva',
    render: (val) =>
      val !== null && val !== undefined && val !== '' ? `${val}%` : '-',
  },
];

export default function ImportProduitsPage() {
  const { id, societe_id } = useAuth();
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imported, setImported] = useState(false);

  const handleBeforeUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        const colonnesObligatoires = [
          'Nom du produit',
          'Description',
          'stock disponible',
          'seuil minimum',
          'catégorie',
          'sous catégorie',
        ];

        const colonnesFichier = Object.keys(jsonData[0] || {});
        const manquantes = colonnesObligatoires.filter((c) => !colonnesFichier.includes(c));

        if (manquantes.length > 0) {
          message.error(`Colonnes manquantes : ${manquantes.join(', ')}`);
          setProduits([]);
          return false;
        }

        const produitsParse = jsonData.map((ligne, idx) => ({
          key: idx,
          nom: ligne['Nom du produit'],
          description: ligne['Description'],
          stock_disponible: Number(ligne['stock disponible']),
          seuil_minimum: Number(ligne['seuil minimum']),
          categorie: ligne['catégorie'],
          sous_categorie: ligne['sous catégorie'],
          prix_unitaire_ht:
            'prix unitaire ht' in ligne && ligne['prix unitaire ht'] !== ''
              ? parseFloat(ligne['prix unitaire ht'])
              : null,
          tva:
            'tva' in ligne && ligne['tva'] !== ''
              ? parseFloat(ligne['tva'])
              : null,
        }));
        console.log('produitsParse ', produitsParse)

        setProduits(produitsParse);
        setImported(false);
        message.success(`Fichier chargé avec ${produitsParse.length} produits`);
      } catch (error) {
        console.error(error);
        message.error('Erreur lors de l’analyse du fichier');
      }
    };

    reader.onerror = () => {
      message.error('Erreur lors de la lecture du fichier');
    };

    reader.readAsArrayBuffer(file);
    return false;
  };

  const handleImporter = async () => {
    if (produits.length === 0) {
      message.warning('Aucun produit à importer');
      return;
    }
 console.log('produits ',produits)
    setLoading(true);
    try {
      await api.post(
        `${import.meta.env.VITE_API_URL}/import-produits`,
        { produits, societe_id, user_id: id },
        { headers: { 'Content-Type': 'application/json' } }
      );

      setImported(true);
      message.success('Produits importés avec succès');
      setProduits([]);
    } catch (err) {
      console.error(err);
      message.error("Erreur lors de l'importation des produits");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: 1000, margin: 'auto', padding: '20px' }}>
      <h1 style={{color:'#3454d1'}} className="page-title">Import des produits et services</h1>

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 20 }}
        message={
          <div>
            Le fichier doit contenir les colonnes : <strong>Nom du produit</strong>, <strong>Description</strong>,
            <strong>stock disponible</strong>, <strong>seuil minimum</strong>, <strong>catégorie</strong>, <strong>sous catégorie</strong>. Les colonnes <strong>prix unitaire ht</strong> et <strong>tva</strong> sont optionnelles.
            <br />
            <a
              href="/modeles/produits_import_test.xlsx"
              download
              style={{ marginTop: 8, display: 'inline-block' }}
            >
              📥 Télécharger le modèle d'import
            </a>
          </div>
        }
      />

      <div style={{ marginBottom: 20 }}>
        <Upload
          accept=".xls,.xlsx"
          beforeUpload={handleBeforeUpload}
          maxCount={1}
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />}>Choisir un fichier XLS</Button>
        </Upload>
      </div>

      {produits.length > 0 && (
        <>
          <Title level={4} style={{ marginTop: 20 }}>
            Produits détectés : {produits.length}
          </Title>

          <div style={{ overflowX: 'auto' }}>
            <Table
              dataSource={produits}
              columns={colonnesProduit}
              pagination={{ pageSize: 5 }}
              scroll={{ x: 1000 }}
            />
          </div>

          <Button
            type="primary"
            onClick={handleImporter}
            loading={loading}
            style={{ marginTop: 15 }}
            block
          >
            Enregistrer
          </Button>
        </>
      )}

      {imported && (
        <Text type="success" style={{ marginTop: 20, display: 'block' }}>
          Importation terminée !
        </Text>
      )}
    </div>
  );
}

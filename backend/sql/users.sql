-- Table sociétés

DROP TABLE IF EXISTS societes;
CREATE TABLE societes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    adresse VARCHAR(255),
    ville VARCHAR(255),
    code_postal VARCHAR(10),
    email VARCHAR(255)  NULL,
    facturation VARCHAR(1) null,
    companyName VARCHAR(255)     NULL,
    companyAddress VARCHAR(255)     NULL,
    comptabilite VARCHAR(1) null,
    administrative VARCHAR(1) null,
    workPhone VARCHAR(30)     NULL,
    personnel VARCHAR(1) null,
    pays VARCHAR(50),
    NUME_TVA VARCHAR(20) NULL,      
    SIRET VARCHAR(20) NOT NULL,           -- Numéro SIRET
    DEVISE VARCHAR(10) NOT NULL,  
    LANGUE VARCHAR(5) NOT NULL,  
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE upload_fichier (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fk INT,                 -- Clé étrangère, à définir selon votre logique
    societe_id INT,        -- Référence à la société
    path VARCHAR(255),      -- Chemin du fichier
    date_ajout TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_type VARCHAR(50),  -- Type de fichier (ex: image/png, image/jpeg)
    FOREIGN KEY (societe_id) REFERENCES societes(id) ON DELETE CASCADE
);



DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  firstName VARCHAR(255)        NULL,
  lastName VARCHAR(255)     NULL,
  birthDate VARCHAR(30)     NULL,
  personalPhone VARCHAR(30)     NULL,
  password VARCHAR(255) NOT NULL,
  societe_id INT,
 -- role ENUM('admin', 'utilisateur') DEFAULT 'utilisateur',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (societe_id) REFERENCES societes(id)
);

 

-- Table clients
CREATE TABLE clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    adresse VARCHAR(255),
    ville VARCHAR(255),
    code_postal VARCHAR(10),
    pays VARCHAR(50),
    phone VARCHAR(30)     NULL,
    societe_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (societe_id) REFERENCES societes(id)
);

-- Table factures
CREATE TABLE factures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT,
    societe_id INT,
    date_facture DATE NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    type_fact VARCHAR(4) null, 
    numero VARCHAR(100)     NULL,
    statut ENUM('payée', 'impayée', 'en retard', 'en attente, accepté') DEFAULT 'impayée',
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (societe_id) REFERENCES societes(id)
);

-- Table produits
CREATE TABLE produits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    prix_unitaire DECIMAL(10, 2) NOT NULL,
    quantite INT NOT NULL,
    facture_id INT,
    societe_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (societe_id) REFERENCES societes(id)
);

-- Table paiements
CREATE TABLE paiements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    facture_id INT,
    montant DECIMAL(10, 2) NOT NULL,
    date_paiement DATE NOT NULL,
    mode_paiement VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facture_id) REFERENCES factures(id)
);

-- Table commandes
CREATE TABLE commandes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT,
    societe_id INT,
    total DECIMAL(10, 2) NOT NULL,
    date_commande DATE NOT NULL,
    statut ENUM('en attente', 'expédiée', 'livrée') DEFAULT 'en attente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (societe_id) REFERENCES societes(id)
);
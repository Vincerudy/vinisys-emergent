-- Données de test pour le rapport financier

-- Mise à jour des factures existantes avec des données plus réalistes
UPDATE factures SET 
  total_ht = total / 1.20,
  total_ttc = total,
  type_facture = 'facture'
WHERE total_ttc = 0 OR total_ttc IS NULL;

-- Insertion de nouvelles factures pour avoir plus de données
INSERT INTO factures (client_id, societe_id, date_facture, total, total_ht, total_ttc, statut, numero, type_facture) VALUES
-- Factures payées (août 2025)
(1, 2, '2025-08-01', 1200.00, 1000.00, 1200.00, 'payee', 'FACT-2025-001', 'facture'),
(2, 2, '2025-08-05', 2400.00, 2000.00, 2400.00, 'payee', 'FACT-2025-002', 'facture'),
(3, 2, '2025-08-10', 960.00, 800.00, 960.00, 'payee', 'FACT-2025-003', 'facture'),
(1, 2, '2025-08-15', 1800.00, 1500.00, 1800.00, 'payee', 'FACT-2025-004', 'facture'),

-- Factures en attente de paiement
(2, 2, '2025-08-18', 3600.00, 3000.00, 3600.00, 'envoyee', 'FACT-2025-005', 'facture'),
(3, 2, '2025-08-22', 1440.00, 1200.00, 1440.00, 'acceptee', 'FACT-2025-006', 'facture'),
(1, 2, '2025-08-25', 2160.00, 1800.00, 2160.00, 'envoyee', 'FACT-2025-007', 'facture'),

-- Quelques avoirs (crédits/remboursements)
(1, 2, '2025-08-12', -240.00, -200.00, -240.00, 'payee', 'AVOIR-2025-001', 'avoir'),
(2, 2, '2025-08-20', -120.00, -100.00, -120.00, 'payee', 'AVOIR-2025-002', 'avoir'),

-- Factures des mois précédents
(1, 2, '2025-07-15', 1800.00, 1500.00, 1800.00, 'payee', 'FACT-2025-JUL-001', 'facture'),
(2, 2, '2025-07-20', 2400.00, 2000.00, 2400.00, 'payee', 'FACT-2025-JUL-002', 'facture'),
(3, 2, '2025-06-10', 3000.00, 2500.00, 3000.00, 'payee', 'FACT-2025-JUN-001', 'facture');

-- Insertion des lignes de facture pour le détail TVA
-- Factures avec TVA 20%
INSERT INTO lignes_facture (facture_id, produit_nom, description, quantite, prix_unitaire_ht, montant, taux_tva, montant_tva) 
SELECT 
    f.id,
    'Service conseil',
    'Prestations de conseil',
    1,
    f.total_ht,
    f.total_ht,
    20.00,
    f.total_ht * 0.20
FROM factures f 
WHERE f.numero LIKE 'FACT-2025-%' AND f.type_facture = 'facture' AND f.total_ht > 1000;

-- Quelques factures avec TVA 10% (services spéciaux)
INSERT INTO lignes_facture (facture_id, produit_nom, description, quantite, prix_unitaire_ht, montant, taux_tva, montant_tva) VALUES
((SELECT id FROM factures WHERE numero = 'FACT-2025-003'), 'Formation', 'Formation professionnelle', 1, 800.00, 800.00, 10.00, 80.00);

-- Quelques factures avec TVA 5.5% (produits de première nécessité)
INSERT INTO lignes_facture (facture_id, produit_nom, description, quantite, prix_unitaire_ht, montant, taux_tva, montant_tva) VALUES
((SELECT id FROM factures WHERE numero = 'FACT-2025-JUN-001'), 'Produits alimentaires', 'Produits pour événement entreprise', 1, 2500.00, 2500.00, 5.50, 137.50);

-- Mise à jour des totaux des factures selon leurs lignes
UPDATE factures f SET 
    total_ttc = (SELECT SUM(montant + montant_tva) FROM lignes_facture lf WHERE lf.facture_id = f.id),
    total_ht = (SELECT SUM(montant) FROM lignes_facture lf WHERE lf.facture_id = f.id),
    total = (SELECT SUM(montant + montant_tva) FROM lignes_facture lf WHERE lf.facture_id = f.id)
WHERE f.id IN (SELECT DISTINCT facture_id FROM lignes_facture);

-- Insertion des achats/dépenses pour août 2025
INSERT INTO achats (numero, societe_id, categorie_id, fournisseur_nom, date_achat, description, montant_ht, montant_tva, montant_ttc, taux_tva, statut) VALUES
-- Fournitures de bureau
('ACH-2025-001', 2, 1, 'Bureau Vallée', '2025-08-02', 'Fournitures papeterie', 150.00, 30.00, 180.00, 20.00, 'valide'),
('ACH-2025-002', 2, 1, 'Staples', '2025-08-08', 'Cartouches imprimante', 85.50, 17.10, 102.60, 20.00, 'valide'),

-- Services et abonnements
('ACH-2025-003', 2, 2, 'Microsoft', '2025-08-01', 'Licence Office 365', 120.00, 24.00, 144.00, 20.00, 'valide'),
('ACH-2025-004', 2, 2, 'Adobe', '2025-08-01', 'Abonnement Creative Cloud', 59.99, 11.998, 71.988, 20.00, 'valide'),
('ACH-2025-005', 2, 2, 'OVH', '2025-08-15', 'Hébergement serveur', 89.90, 17.98, 107.88, 20.00, 'valide'),

-- Matériel informatique
('ACH-2025-006', 2, 5, 'LDLC', '2025-08-10', 'Écran 24 pouces', 299.00, 59.80, 358.80, 20.00, 'valide'),
('ACH-2025-007', 2, 5, 'Amazon', '2025-08-12', 'Clavier mécanique', 129.90, 25.98, 155.88, 20.00, 'valide'),

-- Déplacements
('ACH-2025-008', 2, 3, 'SNCF Connect', '2025-08-05', 'Billets train Paris-Lyon', 156.00, 31.20, 187.20, 20.00, 'valide'),
('ACH-2025-009', 2, 3, 'Booking.com', '2025-08-06', 'Hôtel 2 nuits Lyon', 240.00, 24.00, 264.00, 10.00, 'valide'),

-- Restauration
('ACH-2025-010', 2, 4, 'Restaurant Le Gourmet', '2025-08-07', 'Repas clients x4', 145.00, 14.50, 159.50, 10.00, 'valide'),
('ACH-2025-011', 2, 4, 'Traiteur Dupont', '2025-08-20', 'Buffet réunion équipe', 320.00, 32.00, 352.00, 10.00, 'valide'),

-- Formation
('ACH-2025-012', 2, 6, 'Centre Formation Pro', '2025-08-15', 'Formation gestion projet', 890.00, 89.00, 979.00, 10.00, 'valide'),

-- Marketing
('ACH-2025-013', 2, 7, 'Google Ads', '2025-08-03', 'Publicité en ligne août', 450.00, 90.00, 540.00, 20.00, 'valide'),
('ACH-2025-014', 2, 7, 'Imprimerie Moderne', '2025-08-18', 'Flyers et cartes visite', 180.00, 36.00, 216.00, 20.00, 'valide'),

-- Maintenance
('ACH-2025-015', 2, 8, 'TechService', '2025-08-25', 'Maintenance serveur', 350.00, 70.00, 420.00, 20.00, 'valide'),

-- Assurances
('ACH-2025-016', 2, 9, 'AXA Pro', '2025-08-01', 'Assurance RC professionnelle', 125.00, 0.00, 125.00, 0.00, 'valide'),

-- Autres dépenses
('ACH-2025-017', 2, 10, 'Divers Fournisseur', '2025-08-30', 'Frais bancaires', 35.00, 7.00, 42.00, 20.00, 'valide');

-- Quelques achats des mois précédents pour comparaison
INSERT INTO achats (numero, societe_id, categorie_id, fournisseur_nom, date_achat, description, montant_ht, montant_tva, montant_ttc, taux_tva, statut) VALUES
('ACH-2025-JUL-001', 2, 1, 'Bureau Vallée', '2025-07-15', 'Fournitures juillet', 98.50, 19.70, 118.20, 20.00, 'valide'),
('ACH-2025-JUL-002', 2, 2, 'Microsoft', '2025-07-01', 'Licence Office juillet', 120.00, 24.00, 144.00, 20.00, 'valide'),
('ACH-2025-JUL-003', 2, 5, 'LDLC', '2025-07-20', 'Souris sans fil', 45.90, 9.18, 55.08, 20.00, 'valide'),
('ACH-2025-JUN-001', 2, 6, 'Formation Center', '2025-06-10', 'Formation sécurité', 750.00, 75.00, 825.00, 10.00, 'valide'),
('ACH-2025-JUN-002', 2, 7, 'Agence Pub', '2025-06-15', 'Campagne publicitaire', 1200.00, 240.00, 1440.00, 20.00, 'valide');
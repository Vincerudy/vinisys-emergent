-- Insertion de notes de frais de test pour tester les fonctionnalités

-- Note 1 : En brouillon
INSERT INTO notes_frais (numero, user_id, societe_id, periode_debut, periode_fin, titre, description, total_ht, total_tva, total_ttc, statut, created_at) VALUES
('NF-0001', 4, 2, '2025-08-01', '2025-08-07', 'Note de frais semaine 1 août', 'Frais de déplacement et repas client', 150.00, 30.00, 180.00, 'brouillon', '2025-08-05 10:00:00');

-- Note 2 : Soumise pour validation
INSERT INTO notes_frais (numero, user_id, societe_id, periode_debut, periode_fin, titre, description, total_ht, total_tva, total_ttc, statut, date_soumission, created_at) VALUES
('NF-0002', 4, 2, '2025-08-08', '2025-08-14', 'Note de frais semaine 2 août', 'Déplacements clients et formations', 275.50, 55.10, 330.60, 'soumise', '2025-08-08 14:30:00', '2025-08-07 09:00:00');

-- Note 3 : Soumise pour validation (autre utilisateur)
INSERT INTO notes_frais (numero, user_id, societe_id, periode_debut, periode_fin, titre, description, total_ht, total_tva, total_ttc, statut, date_soumission, created_at) VALUES
('NF-0003', 3, 3, '2025-08-01', '2025-08-07', 'Frais août - Giorgia', 'Frais kilométriques et repas', 120.00, 24.00, 144.00, 'soumise', '2025-08-08 11:15:00', '2025-08-06 16:30:00');

-- Note 4 : Validée
INSERT INTO notes_frais (numero, user_id, societe_id, periode_debut, periode_fin, titre, description, total_ht, total_tva, total_ttc, statut, date_soumission, date_validation, validateur_id, created_at) VALUES
('NF-0004', 4, 2, '2025-07-22', '2025-07-28', 'Note de frais juillet', 'Frais de formation et déplacements', 89.90, 17.98, 107.88, 'validee', '2025-07-29 10:00:00', '2025-07-30 15:45:00', 4, '2025-07-28 14:00:00');

-- Insertion des lignes de frais correspondantes
-- Lignes pour Note NF-0001
INSERT INTO lignes_frais (note_frais_id, type_frais_id, date_frais, description, montant, montant_tva, taux_tva) VALUES
(1, 1, '2025-08-02', 'Trajet bureau-client ABC (85 km)', 85.00, 17.00, 20.00),
(1, 7, '2025-08-02', 'Déjeuner avec client ABC', 65.00, 13.00, 20.00),
(1, 9, '2025-08-03', 'Fournitures présentation', 30.00, 6.00, 20.00);

-- Lignes pour Note NF-0002 (soumise)
INSERT INTO lignes_frais (note_frais_id, type_frais_id, date_frais, description, montant, montant_tva, taux_tva) VALUES
(2, 1, '2025-08-09', 'Déplacement formation Paris (120 km)', 120.00, 24.00, 20.00),
(2, 8, '2025-08-09', 'Repas formation', 45.00, 9.00, 20.00),
(2, 5, '2025-08-09', 'Hôtel formation Paris', 110.50, 22.10, 20.00);

-- Lignes pour Note NF-0003 (soumise)
INSERT INTO lignes_frais (note_frais_id, type_frais_id, date_frais, description, montant, montant_tva, taux_tva) VALUES
(3, 1, '2025-08-03', 'Visites clients région (95 km)', 95.00, 19.00, 20.00),
(3, 7, '2025-08-04', 'Repas client prospects', 49.00, 9.80, 20.00);

-- Lignes pour Note NF-0004 (validée)
INSERT INTO lignes_frais (note_frais_id, type_frais_id, date_frais, description, montant, montant_tva, taux_tva) VALUES
(4, 12, '2025-07-25', 'Formation comptabilité', 75.00, 15.00, 20.00),
(4, 1, '2025-07-26', 'Déplacement formation (40 km)', 32.88, 6.58, 20.00);

-- Insertion historique validations
INSERT INTO historique_validations (note_frais_id, ancien_statut, nouveau_statut, utilisateur_id, commentaire, created_at) VALUES
(2, 'brouillon', 'soumise', 4, 'Note soumise pour validation', '2025-08-08 14:30:00'),
(3, 'brouillon', 'soumise', 3, 'Note soumise pour validation', '2025-08-08 11:15:00'),
(4, 'brouillon', 'soumise', 4, 'Note soumise pour validation', '2025-07-29 10:00:00'),
(4, 'soumise', 'validee', 4, 'Note validée - conforme aux barèmes', '2025-07-30 15:45:00');
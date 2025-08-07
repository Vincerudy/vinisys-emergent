const express = require('express');
const multer = require('multer');
const path = require('path');
const moment = require('moment');
const router = express.Router();
const db = require('../../config/db'); // Assurez-vous que le chemin d'importation est correct

// Configuration de multer pour le téléchargement des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Dossier où les fichiers seront enregistrés
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = moment().format('YYYYMMDD_HHmmss') + '-' + file.originalname;
    cb(null, uniqueSuffix);
  }
});

const upload = multer({ storage: storage });

// Route pour enregistrer ou mettre à jour les données de l'employé
router.post('/employees', upload.single('photo'), async (req, res) => {
  const {
    firstName,
    lastName,
    birthDate,
    address,
    zipCode,
    city,
    phone,
    email,
    socialSecurityNumber,
    nationality,
    poste,
    position,
    niveau,
    coefficient,
    manager,
    hoursPerMonth,
    hoursPerDay,
    hourlyRate,
    monthlySalary,
    contractType,
    entryDate,
    exitDate,
    iban,
    isExecutive,
    isPartner,
    isPartTime,
 
    genre, // Ajoutez genre ici
    id // ID de l'employé pour les mises à jour
  } = req.body;

  const societe_id = req.session.user.societe_id

  let imagePath = req.file ? req.file.path : null; // Chemin du fichier téléchargé

  try {
    // Vérifiez si un ID est fourni pour déterminer si c'est une mise à jour ou une insertion
    if (id) {
      // Mise à jour de l'employé
      const result = await db.query(
        'UPDATE employees SET firstName = ?, lastName = ?, birthDate = ?, address = ?, zipCode = ?, city = ?, phone = ?, email = ?, socialSecurityNumber = ?, nationality = ?, poste = ?, position = ?, niveau = ?, coefficient = ?, manager = ?, hoursPerMonth = ?, hoursPerDay = ?, hourlyRate = ?, monthlySalary = ?, contractType = ?, entryDate = ?, exitDate = ?, iban = ?, isExecutive = ?, isPartner = ?, isPartTime = ?, photo = ?, genre = ? WHERE id = ?',
        [
          firstName, lastName, birthDate, address, zipCode, city, phone, email, socialSecurityNumber,
          nationality, poste, position, niveau, coefficient, manager, hoursPerMonth, hoursPerDay,
          hourlyRate, monthlySalary, contractType, entryDate, exitDate, iban, isExecutive,
          isPartner, isPartTime, imagePath, genre, id // Ajoutez genre ici
        ]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Employé non trouvé' });
      }

      // Mettez à jour également l'image dans la table upload_fichier
      if (imagePath) {
        await db.query('UPDATE upload_fichier SET path = ? WHERE fk = ? AND societe_id = ?', [
          imagePath,
          id,
          societe_id
        ]);
      }

      return res.json({ message: 'Employé mis à jour avec succès' });
    } else {
      // Insertion d'un nouvel employé
      const result = await db.query(
        `INSERT INTO employees (
            firstName, 
            lastName, 
            birthDate, 
            address, 
            zipCode, 
            city, 
            phone, 
            email, 
            socialSecurityNumber, 
            nationality, 
            poste, 
            position, 
            niveau, 
            coefficient, 
            manager, 
            hoursPerMonth, 
            hoursPerDay, 
            hourlyRate, 
            monthlySalary, 
            contractType, 
            entryDate, 
            exitDate, 
            iban, 
            isExecutive, 
            isPartner, 
            isPartTime, 
            societe_id, 
            genre
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, // Ajoutez genre ici
        [
            firstName, 
            lastName, 
            birthDate, 
            address, 
            zipCode, 
            city, 
            phone, 
            email, 
            socialSecurityNumber,
            nationality, 
            poste, 
            position, 
            niveau, 
            coefficient, 
            manager, 
            hoursPerMonth, 
            hoursPerDay,
            hourlyRate, 
            monthlySalary, 
            contractType, 
            entryDate, 
            exitDate, 
            iban, 
            isExecutive,
            isPartner, 
            isPartTime, 
            societe_id, 
            genre // Ajoutez genre ici
        ]
      );

      const employeeId = result.insertId; // Récupérer l'ID inséré

      // Enregistrer l'image dans la table upload_fichier
      if (imagePath) {
        await db.query('INSERT INTO upload_fichier (fk, societe_id, path, date_ajout, file_type) VALUES (?, ?, ?, ?, ?)', [
          employeeId,
          societe_id,
          imagePath,
          moment().format('YYYY-MM-DD HH:mm:ss'), // Date actuelle
          req.file.mimetype // Type de fichier
        ]);
      }

      return res.status(201).json({ message: 'Employé enregistré avec succès' });
    }
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de l\'employé:', error);
    res.status(500).json({ message: 'Erreur lors de l\'enregistrement de l\'employé' });
  }
});

module.exports = router;

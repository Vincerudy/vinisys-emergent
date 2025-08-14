const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const db = require('../../config/db');
const isAuthenticated = require('../midleware/authMiddleware');

// 📁 Configuration de Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../uploads/users');
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

// 📦 Création d’un utilisateur avec photo de profil
router.post('/users/create', isAuthenticated,  upload.single('photoProfil'), async (req, res) => {
    const {
        email,
        role_id,
        firstName,
        lastName,
        birthDate,
        companyName,
        companyAddress,
        workPhone,
        personalPhone,
        password,
        permissions,
     
    } = req.body;

    const societe_id =  req.user.societe_id;


    // ✅ Vérification des champs obligatoires
    if (!email || !firstName || !lastName || !password ) {
        return res.status(400).json({ message: 'Certains champs obligatoires sont manquants.' });
    }

    const photoPath = req.file ? `/uploads/users/${req.file.filename}` : null;

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // 🔍 Vérifier si l'utilisateur existe déjà
        const [existingUser] = await connection.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUser.length > 0) {
            await connection.rollback();
            console.log(`[LOG] Utilisateur avec email ${email} existe déjà.`);
            return res.status(409).json({ message: 'Cet email est déjà utilisé.' });
        }

        // 🔒 Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('[LOG] Mot de passe hashé avec succès.');

        // 📥 Insertion de l'utilisateur
        const [result] = await connection.query(
            `INSERT INTO users 
            (email, firstName, lastName, birthDate, companyName, companyAddress, workPhone, personalPhone, password, societe_id, created_at) 
            VALUES (?,  ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [email, firstName, lastName, birthDate || null, companyName, companyAddress, workPhone, personalPhone, hashedPassword, societe_id]
        );

        const newUserId = result.insertId;
        console.log(`[LOG] Utilisateur inséré avec l'ID: ${newUserId}`);

        // 📸 Enregistrement de la photo de profil si présente
        if (photoPath) {
            await connection.query(
                `INSERT INTO upload_fichier (fk, societe_id, path, date_ajout, file_type) 
                 VALUES (?, ?, ?, NOW(), 'USER_PHOTO_PROFIL')`,
                [newUserId, societe_id, photoPath]
            );
            console.log('[LOG] Photo de profil enregistrée.');
        }

        // ✅ Insertion des permissions
        if (Array.isArray(permissions)) {
            for (const perm of permissions) {
                await connection.query(
                    `INSERT INTO user_permissions (user_id, permission, created_at, updated_at) 
                     VALUES (?, ?, NOW(), NOW())`,
                    [newUserId, perm]
                );
            }
            console.log('[LOG] Permissions insérées.');
        }

        await connection.commit();

        res.status(201).json({
            message: 'Utilisateur créé avec succès',
            userId: newUserId,
            photoProfil: photoPath
        });

    } catch (error) {
        await connection.rollback();
        console.error('Erreur lors de la création de l’utilisateur :', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    } finally {
        connection.release();
    }
});

//OK
router.get('/users/:id', isAuthenticated, async (req, res) => {
  const userId = req.params.id;
  const societe_id =  req.user.societe_id;
  const connection = await db.getConnection();

  try {
      // 🔍 1. Récupérer les infos de l’utilisateur + id du rôle
      const [userRows] = await connection.query(
          `SELECT id, email, role_id, firstName, lastName, birthDate, 
                  companyName, companyAddress, workPhone, personalPhone, 
                  societe_id, created_at
           FROM users
           WHERE id = ? and societe_id = ? `,
          [userId, societe_id]
      );

      if (userRows.length === 0) {
          return res.status(404).json({ message: 'Utilisateur non trouvé.' });
      }

      const user = userRows[0];

      // 🧾 2. Récupérer le nom du rôle à partir du role_id
      const [roleRows] = await connection.query(
          `SELECT id, name FROM roles WHERE id = ?`,
          [user.role_id]
      );

      const role = roleRows.length > 0 ? roleRows[0] : null;

      // 📷 3. Récupérer la photo de profil
      const [photoRows] = await connection.query(
          `SELECT path FROM upload_fichier
           WHERE fk = ? AND file_type = 'USER_PHOTO_PROFIL'
           ORDER BY date_ajout DESC LIMIT 1`,
          [userId]
      );

      const photoProfil = photoRows.length > 0 ? photoRows[0].path : null;

      // 🛡️ 4. Récupérer les permissions
      const [permissionRows] = await connection.query(
          `SELECT permission FROM user_permissions WHERE user_id = ?`,
          [userId]
      );

      const permissions = permissionRows.map(p => p.permission);

      // ✅ 5. Réponse complète
      res.status(200).json({
          ...user,
          role,
          photoProfil,
          permissions
      });

  } catch (error) {
      console.error('Erreur lors de la récupération de l’utilisateur :', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
  } finally {
      connection.release();
  }
});

/// Liste des utilisateur
//OK
router.get('/utilisateurs/liste', isAuthenticated, async (req, res) => { //
    const societe_id =  req.user.societe_id;
  const connection = await db.getConnection();

  try {
    // 🔍 1. Récupérer tous les utilisateurs avec leur rôle_id
    const [users] = await connection.query(
      `SELECT id, email, role_id, firstName, lastName, birthDate, 
              companyName, statut, companyAddress, workPhone, personalPhone, 
              societe_id, created_at
       FROM users
       where societe_id = ?`,
       [societe_id]
    );

    if (users.length === 0) {
      return res.status(200).json([]); // Aucun utilisateur
    }

    // Préparer les ID utilisateurs pour les requêtes suivantes
    const userIds = users.map(user => user.id);

    // 🧾 2. Rôles (par batch)
    const [roles] = await connection.query(
      `SELECT id, name FROM roles WHERE id IN (?)`,
      [users.map(u => u.role_id)]
    );
    const rolesMap = Object.fromEntries(roles.map(role => [role.id, role]));

    // 📷 3. Photos (uniquement la dernière par utilisateur)
    const [photos] = await connection.query(
      `SELECT t1.fk AS user_id, t1.path
       FROM upload_fichier t1
       INNER JOIN (
           SELECT fk, MAX(date_ajout) as latest
           FROM upload_fichier
           WHERE file_type = 'USER_PHOTO_PROFIL'
           GROUP BY fk
       ) t2 ON t1.fk = t2.fk AND t1.date_ajout = t2.latest
       WHERE t1.file_type = 'USER_PHOTO_PROFIL'`
    );
    const photosMap = Object.fromEntries(photos.map(photo => [photo.user_id, photo.path]));

    // 🛡️ 4. Permissions
    const [permissions] = await connection.query(
      `SELECT user_id, permission FROM user_permissions WHERE user_id IN (?)`,
      [userIds]
    );
    const permissionsMap = {};
    for (const row of permissions) {
      if (!permissionsMap[row.user_id]) permissionsMap[row.user_id] = [];
      permissionsMap[row.user_id].push(row.permission);
    }

    // ✅ 5. Assemblage final
    const enrichedUsers = users.map(user => ({
      ...user,
      role: rolesMap[user.role_id] || null,
      photoProfil: photosMap[user.id] || null,
      permissions: permissionsMap[user.id] || []
    }));

    res.status(200).json(enrichedUsers);

  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  } finally {
    connection.release();
  }
});


// ✅ Mise à jour d’un utilisateur existant
router.post('/users/:id/update', isAuthenticated, upload.single('photoProfil'), async (req, res) => {
  const userId = req.params.id;
  const societe_id =  req.user.societe_id;
  const {
      email,
      role_id,
      firstName,
      lastName,
      birthDate,
      companyName,
      companyAddress,
      workPhone,
      personalPhone,
      password,
      permissions,
      auto_modi
  } = req.body;

  const newPhoto = req.file ? `/uploads/users/${req.file.filename}` : null;

  const connection = await db.getConnection();
  try {
      await connection.beginTransaction();

      // 🔒 Si un nouveau mot de passe est fourni, on le hash
      let hashedPassword = null;
      if (password) {
          hashedPassword = await bcrypt.hash(password, 10);
      }

      // 🔄 Mise à jour de l’utilisateur
      const updateFields = [
          email,   firstName, lastName,
          birthDate || null, companyName, companyAddress,
          workPhone, personalPhone, societe_id, userId
      ];
      const updateQuery = `
          UPDATE users SET
              email = ?,   firstName = ?, lastName = ?,
              birthDate = ?, companyName = ?, companyAddress = ?,
              workPhone = ?, personalPhone = ?, societe_id = ?
          ${hashedPassword ? ', password = ?' : ''}
          WHERE id = ?
      `;

      await connection.query(
          updateQuery,
          hashedPassword ? [...updateFields.slice(0, -1), hashedPassword, userId] : updateFields
      );
      // si l'utilisateur a le droit de modifier les permission
      if (auto_modi == 'YES'){
        // 🔄 Mise à jour des permissions
        await connection.query(`DELETE FROM user_permissions WHERE user_id = ?`, [userId]);
        if (Array.isArray(permissions)) {
            for (const perm of permissions) {
                await connection.query(
                    `INSERT INTO user_permissions (user_id, permission, created_at, updated_at)
                     VALUES (?, ?, NOW(), NOW())`,
                    [userId, perm]
                );
            }
        }
      }
      

      // 📷 Mise à jour de la photo si nouvelle
      if (newPhoto) {
          // 🔍 Récupérer ancienne photo
          const [oldPhotoRows] = await connection.query(
              `SELECT path FROM upload_fichier WHERE fk = ? AND file_type = 'USER_PHOTO_PROFIL' ORDER BY date_ajout DESC LIMIT 1`,
              [userId]
          );

          // ❌ Supprimer ancienne photo du disque si elle existe
          if (oldPhotoRows.length > 0) {
              const oldPath = path.join(__dirname, '../../', oldPhotoRows[0].path);
              if (fs.existsSync(oldPath)) {
                  fs.unlinkSync(oldPath);
              }

              // 🧹 Supprimer ancienne entrée de la table
              await connection.query(
                  `DELETE FROM upload_fichier WHERE fk = ? AND file_type = 'USER_PHOTO_PROFIL'`,
                  [userId]
              );
          }

          // ✅ Insérer nouvelle photo
          await connection.query(
              `INSERT INTO upload_fichier (fk, societe_id, path, date_ajout, file_type)
               VALUES (?, ?, ?, NOW(), 'USER_PHOTO_PROFIL')`,
              [userId, societe_id, newPhoto]
          );
      }

      await connection.commit();
      res.status(200).json({ message: 'Utilisateur mis à jour avec succès.' });
  } catch (error) {
      await connection.rollback();
      console.error('Erreur lors de la mise à jour de l’utilisateur :', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
  } finally {
      connection.release();
  }
});

router.post('/users/statuts', isAuthenticated, async (req, res) => {
  const { modifications } = req.body; // modifications = [{ id, statut, ... }, ...]
    const societe_id =  req.user.societe_id;

  if (!Array.isArray(modifications) || modifications.length === 0) {
    return res.status(400).json({ message: 'Aucune modification reçue.' });
  }

  const connection = await db.getConnection();

  try {
    const updatePromises = modifications.map(({ id, statut }) => {
      // Forcer la conversion en booléen dans tous les cas
      const isActive =
        statut === true ||
        statut === 'true' ||
        statut === 'actif' ||
        statut === 1 ||
        statut === '1';

      const statutValue = isActive ? 'actif' : 'inactif';
      
      return connection.query(
        `UPDATE users SET statut = ? WHERE id = ? and societe_id = ?`,
        [statutValue, id, societe_id] // <-- il manquait societe_id ici !
      );
    });

    await Promise.all(updatePromises);

    res.status(200).json({ message: 'Statuts mis à jour avec succès.' });

  } catch (error) {
    console.error('Erreur lors de la mise à jour groupée des statuts :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  } finally {
    connection.release();
  }
});






module.exports = router;

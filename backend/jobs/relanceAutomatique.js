const cron = require('node-cron');
const db = require('../config/db');
const nodemailer = require('nodemailer');

class RelanceAutomatique {
  constructor() {
    this.transporter = null;
    this.initTransporter();
  }

  // Initialiser le transporteur email
  async initTransporter() {
    try {
      this.transporter = nodemailer.createTransporter({
        host: 'ssl0.ovh.net',
        port: 465,
        secure: true,
        auth: {
          user: 'support-vinisys@vinisys.com',
          pass: 'viniCinema12selfie2025Mail'
        }
      });
      
      console.log('✅ Transporteur email configuré avec OVH');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation du transporteur email:', error);
    }
  }

  // Démarrer le job de relance automatique
  start() {
    // Exécuter toutes les 30 minutes
    cron.schedule('*/30 * * * *', async () => {
      console.log('🔄 Démarrage du job de relance automatique...', new Date().toISOString());
      await this.executeRelanceJob();
    });

    console.log('✅ Job de relance automatique configuré (toutes les 30 minutes)');
  }

  // Logique principale du job
  async executeRelanceJob() {
    try {
      // 1. Récupérer toutes les sociétés avec relances automatiques activées
      const societes = await this.getSocietesAvecRelancesActivees();
      
      if (societes.length === 0) {
        console.log('ℹ️  Aucune société n\'a activé les relances automatiques');
        return;
      }

      console.log(`📋 ${societes.length} société(s) avec relances automatiques trouvée(s)`);

      // 2. Pour chaque société, traiter les factures en retard
      for (const societe of societes) {
        await this.traiterFacturesEnRetard(societe);
      }

      console.log('✅ Job de relance automatique terminé');
    } catch (error) {
      console.error('❌ Erreur dans le job de relance automatique:', error);
    }
  }

  // Récupérer les sociétés avec relances automatiques activées
  async getSocietesAvecRelancesActivees() {
    try {
      const query = `
        SELECT 
          spf.societe_id,
          spf.paymentDelay,
          s.companyName,
          s.email as societe_email
        FROM societe_parametrage_facturation spf
        JOIN societes s ON s.id = spf.societe_id
        WHERE spf.enableAutoReminders = 1
          AND spf.paymentDelay IS NOT NULL
          AND spf.paymentDelay > 0
      `;

      const [rows] = await db.query(query);
      return rows;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des sociétés:', error);
      return [];
    }
  }

  // Traiter les factures en retard pour une société
  async traiterFacturesEnRetard(societe) {
    try {
      const { societe_id, paymentDelay, companyName } = societe;

      // Calculer la date limite (aujourd'hui - délai de paiement)
      const dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() - paymentDelay);
      const dateLimitString = dateLimit.toISOString().split('T')[0]; // Format YYYY-MM-DD

      console.log(`🏢 Traitement société: ${companyName} (ID: ${societe_id}) - Délai: ${paymentDelay} jours`);
      console.log(`📅 Recherche factures créées avant le: ${dateLimitString}`);

      // Récupérer les factures impayées en retard
      const query = `
        SELECT 
          f.id,
          f.numero,
          f.date_facture,
          f.total,
          f.statut,
          c.nom as client_nom,
          c.email as client_email
        FROM factures f
        JOIN clients c ON c.id = f.client_id
        WHERE f.societe_id = ?
          AND f.statut IN ('impayée', 'en attente')
          AND STR_TO_DATE(f.date_facture, '%Y-%m-%d') <= ?
          AND c.email IS NOT NULL
          AND c.email != ''
      `;

      const [factures] = await db.query(query, [societe_id, dateLimitString]);

      if (factures.length === 0) {
        console.log(`ℹ️  Aucune facture en retard pour la société ${companyName}`);
        return;
      }

      console.log(`📄 ${factures.length} facture(s) en retard trouvée(s) pour ${companyName}`);

      // Envoyer les emails de relance
      for (const facture of factures) {
        await this.envoyerEmailRelance(facture, societe);
        
        // Petite pause entre les emails pour éviter le spam
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    } catch (error) {
      console.error(`❌ Erreur lors du traitement des factures pour la société ${societe.societe_id}:`, error);
    }
  }

  // Envoyer un email de relance
  async envoyerEmailRelance(facture, societe) {
    try {
      const { numero, date_facture, total, client_nom, client_email } = facture;
      const { companyName, societe_email } = societe;

      // Calculer le nombre de jours de retard
      const dateFacture = new Date(date_facture);
      const aujourd = new Date();
      const joursRetard = Math.floor((aujourd.getTime() - dateFacture.getTime()) / (1000 * 60 * 60 * 24));

      console.log(`📧 Préparation email pour facture ${numero} - Client: ${client_nom} (${client_email}) - ${joursRetard} jours de retard`);

      // Vérifier si les paramètres SMTP sont configurés
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log(`⚠️  SMTP non configuré - simulation d'envoi d'email pour la facture ${numero}`);
        console.log(`   📧 À: ${client_email}`);
        console.log(`   💰 Montant: ${total}€`);
        console.log(`   📅 ${joursRetard} jours de retard`);
        
        // Mettre à jour le statut de la facture même en simulation
        await this.updateFactureStatut(facture.id, 'en retard');
        return;
      }

      if (!this.transporter) {
        console.error('❌ Transporteur email non configuré');
        return;
      }

      const sujet = `Rappel de paiement - Facture ${numero}`;
      
      const contenuHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Rappel de paiement</h2>
          
          <p>Bonjour ${client_nom},</p>
          
          <p>Nous vous contactons concernant le paiement de la facture suivante :</p>
          
          <div style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <strong>Facture N° :</strong> ${numero}<br>
            <strong>Date d'émission :</strong> ${date_facture}<br>
            <strong>Montant :</strong> ${total} €<br>
            <strong>Nombre de jours de retard :</strong> ${joursRetard} jour(s)
          </div>
          
          <p>Cette facture n'a toujours pas été réglée. Nous vous remercions de bien vouloir procéder au paiement dans les plus brefs délais.</p>
          
          <p>Si vous avez déjà effectué le paiement, merci de nous transmettre le justificatif.</p>
          
          <p>En cas de question, n'hésitez pas à nous contacter.</p>
          
          <p>Cordialement,</p>
          <p><strong>${companyName}</strong></p>
        </div>
      `;

      const mailOptions = {
        from: societe_email || process.env.SMTP_USER,
        to: client_email,
        subject: sujet,
        html: contenuHtml
      };

      await this.transporter.sendMail(mailOptions);
      
      console.log(`✅ Email de relance envoyé pour la facture ${numero} à ${client_email}`);
      
      // Mettre à jour le statut de la facture
      await this.updateFactureStatut(facture.id, 'en retard');

    } catch (error) {
      console.error(`❌ Erreur lors de l'envoi de l'email pour la facture ${facture.numero}:`, error);
    }
  }

  // Mettre à jour le statut d'une facture
  async updateFactureStatut(factureId, nouveauStatut) {
    try {
      const query = `UPDATE factures SET statut = ? WHERE id = ?`;
      await db.query(query, [nouveauStatut, factureId]);
      console.log(`📝 Statut de la facture ${factureId} mis à jour: ${nouveauStatut}`);
    } catch (error) {
      console.error(`❌ Erreur lors de la mise à jour du statut de la facture ${factureId}:`, error);
    }
  }

  // Arrêter le job (pour les tests)
  stop() {
    console.log('🛑 Arrêt du job de relance automatique');
  }
}

module.exports = RelanceAutomatique;
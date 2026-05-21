const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

// Configurar transporte de email
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Função para enviar email de confirmação
exports.enviarConfirmacao = functions.firestore
  .document("confirmacoes/{docId}")
  .onCreate(async (snap) => {
    const { nome, email, whatsapp, createdAt } = snap.data();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Presença Confirmada - Festa de Brenda Almeida",
      html: `
        <h2>Obrigado por confirmar sua presença!</h2>
        <p>Olá <strong>${nome}</strong>,</p>
        <p>Recebemos sua confirmação de presença na festa de aniversário de Brenda Almeida.</p>
        <p><strong>Data:</strong> 19 de Setembro de 2026</p>
        <p><strong>Horário:</strong> 12:00h - 18:00h</p>
        <p><strong>Local:</strong> Olinda - PE</p>
        <p>Seus dados:</p>
        <ul>
          <li>Nome: ${nome}</li>
          <li>Email: ${email}</li>
          <li>WhatsApp: ${whatsapp}</li>
        </ul>
        <p>Qualquer dúvida, entre em contato através do WhatsApp!</p>
        <p>Abraços!</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("Email enviado para:", email);
    } catch (error) {
      console.error("Erro ao enviar email:", error);
      throw error;
    }
  });

// Função para enviar notificação ao organizador
exports.notificarOrganizador = functions.firestore
  .document("confirmacoes/{docId}")
  .onCreate(async (snap) => {
    const { nome, email, whatsapp } = snap.data();
    const organizadorEmail = process.env.ORGANIZER_EMAIL;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: organizadorEmail,
      subject: "Nova Confirmação - Festa de Brenda",
      html: `
        <h3>Nova confirmação de presença!</h3>
        <p><strong>${nome}</strong> confirmou presença.</p>
        <p>Email: ${email}</p>
        <p>WhatsApp: ${whatsapp}</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("Notificação enviada ao organizador");
    } catch (error) {
      console.error("Erro ao enviar notificação:", error);
    }
  });

// Função para backup automático
exports.backupFirestore = functions.pubsub
  .schedule("0 2 * * *") // 2 AM diariamente
  .onRun(async (context) => {
    const client = new admin.firestore.v1.FirestoreAdminClient();
    const projectId = process.env.GCLOUD_PROJECT;
    const bucket = `gs://${projectId}_backups`;

    const request = {
      parent: client.databasePath(projectId, "(default)"),
      outputUriPrefix: bucket,
    };

    try {
      const responses = await client.exportDocuments(request);
      const operation = responses[0];
      console.log(`Backup iniciado: ${operation.name}`);
    } catch (error) {
      console.error("Erro ao criar backup:", error);
    }
  });

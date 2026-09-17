require('dotenv').config();
const amqp = require('amqplib');

const QUEUE = 'email.queue';
const WORKER = process.env.WORKER_NAME || 'email-worker';

async function processEmail(msg) {
  const data = JSON.parse(msg.content.toString());
  // Simulation d'un envoi d'email (remplacer par nodemailer/SendGrid en prod)
  console.log(`✉️  [${WORKER}] Envoi email à ${data.to} — Sujet : "${data.subject}"`);
  await new Promise(r => setTimeout(r, 200)); // Simuler la latence réseau
  console.log(`✅  [${WORKER}] Email envoyé avec succès`);
}

async function start() {
  let conn;
  // Retry sur connexion (RabbitMQ peut démarrer après le worker)
  for (let i = 0; i < 10; i++) {
    try {
      conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
      break;
    } catch { await new Promise(r => setTimeout(r, 3000)); }
  }

  const channel = await conn.createChannel();
  await channel.assertQueue(QUEUE, { durable: true });
  channel.prefetch(1); // Traiter un message à la fois
  console.log(`🐇  [${WORKER}] En attente de messages sur "${QUEUE}"...`);

  channel.consume(QUEUE, async (msg) => {
    if (!msg) return;
    try {
      await processEmail(msg);
      channel.ack(msg); // Confirmer le traitement
    } catch(err) {
      console.error('❌  Erreur traitement :', err.message);
      channel.nack(msg, false, true); // Remettre en file (requeue)
    }
  });
}

start().catch(console.error);

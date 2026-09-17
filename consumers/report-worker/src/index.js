require('dotenv').config();
const amqp = require('amqplib');

const QUEUE  = 'report.queue';
const WORKER = process.env.WORKER_NAME || 'report-worker';

async function generateReport(data) {
  console.log(`📊  [${WORKER}] Génération rapport "${data.report_type}"...`);
  await new Promise(r => setTimeout(r, 1000)); // Simuler traitement long
  console.log(`✅  [${WORKER}] Rapport "${data.report_type}" généré`);
}

async function start() {
  let conn;
  for (let i = 0; i < 10; i++) {
    try { conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost'); break; }
    catch { await new Promise(r => setTimeout(r, 3000)); }
  }
  const ch = await conn.createChannel();
  await ch.assertQueue(QUEUE, { durable: true });
  ch.prefetch(1);
  console.log(`🐇  [${WORKER}] En attente sur "${QUEUE}"...`);
  ch.consume(QUEUE, async msg => {
    if (!msg) return;
    try {
      await generateReport(JSON.parse(msg.content.toString()));
      ch.ack(msg);
    } catch(e) {
      console.error('❌  Erreur :', e.message);
      ch.nack(msg, false, false); // Pas de requeue si erreur critique
    }
  });
}

start().catch(console.error);

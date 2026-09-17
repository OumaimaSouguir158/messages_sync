const amqp = require('amqplib');

let channel = null;

const QUEUES = {
  EMAIL:  'email.queue',
  REPORT: 'report.queue',
};

async function connect() {
  const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
  channel = await conn.createChannel();
  // Déclarer les files (durables = survivent aux redémarrages de RabbitMQ)
  for (const q of Object.values(QUEUES)) {
    await channel.assertQueue(q, { durable: true });
  }
  console.log('🐇  Connecté à RabbitMQ');
  return channel;
}

function publish(queue, message) {
  if (!channel) throw new Error('Canal RabbitMQ non initialisé');
  const content = Buffer.from(JSON.stringify({ ...message, publishedAt: new Date().toISOString() }));
  // persistent: true = message survit aux redémarrages
  channel.sendToQueue(queue, content, { persistent: true });
  console.log(`📤  Message publié sur "${queue}":`, message);
}

module.exports = { connect, publish, QUEUES };

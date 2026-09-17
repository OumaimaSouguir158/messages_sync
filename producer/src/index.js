require('dotenv').config();
const express = require('express');
const { connect, publish, QUEUES } = require('./broker');

const app = express();
app.use(express.json());

// POST /send/email — Déclencher un envoi d'email
app.post('/send/email', async (req, res) => {
  const { to, subject, body } = req.body;
  if (!to || !subject) return res.status(400).json({ error: 'to et subject sont requis' });
  try {
    publish(QUEUES.EMAIL, { to, subject, body, type: 'email' });
    res.status(202).json({ accepted: true, queue: QUEUES.EMAIL, message: 'Email mis en file' });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// POST /send/report — Déclencher une génération de rapport
app.post('/send/report', async (req, res) => {
  const { report_type, params } = req.body;
  try {
    publish(QUEUES.REPORT, { report_type, params });
    res.status(202).json({ accepted: true, queue: QUEUES.REPORT });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'producer' }));

connect()
  .then(() => app.listen(process.env.PORT || 3000, () => console.log(`📤  Producteur démarré sur :${process.env.PORT || 3000}`)))
  .catch(err => { console.error('Connexion RabbitMQ échouée :', err.message); process.exit(1); });

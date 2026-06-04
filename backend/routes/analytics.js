const prisma = require('../prisma');

module.exports = async function (fastify) {
  fastify.post('/analytics/train', async (req, reply) => {
    const mlUrl = process.env.ML_SERVICE_URL;
    const res = await fetch(`${mlUrl}/train`, { method: 'POST' });
    const data = await res.json();
    return data;
  });

  fastify.post('/analytics/predict', async (req, reply) => {
    const mlUrl = process.env.ML_SERVICE_URL;
    const res = await fetch(`${mlUrl}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const data = await res.json();
    return data;
  });
};

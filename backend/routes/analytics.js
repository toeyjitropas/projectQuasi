module.exports = async function (fastify) {
  const AUTH  = { onRequest: [fastify.authenticate] };
  const ADMIN = { onRequest: [fastify.requireAdmin] };

  fastify.post('/analytics/train', ADMIN, async (req, reply) => {
    const mlUrl = process.env.ML_SERVICE_URL;
    const res = await fetch(`${mlUrl}/train`, { method: 'POST' });
    return res.json();
  });

  fastify.post('/analytics/predict', AUTH, async (req, reply) => {
    const mlUrl = process.env.ML_SERVICE_URL;
    const res = await fetch(`${mlUrl}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    return res.json();
  });
};

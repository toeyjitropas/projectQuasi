require('dotenv').config();
const fastify = require('fastify')({ logger: true, bodyLimit: 20 * 1024 * 1024 });

fastify.register(require('@fastify/cors'), {
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
});
fastify.register(require('@fastify/multipart'), {
  limits: { fileSize: 20 * 1024 * 1024 },
});
fastify.register(require('@fastify/jwt'), {
  secret: process.env.JWT_SECRET,
});

fastify.decorate('authenticate', async function (request, reply) {
  try {
    await request.jwtVerify();
  } catch {
    reply.code(401).send({ error: 'Unauthorized' });
  }
});

fastify.decorate('requireAdmin', async function (request, reply) {
  try {
    await request.jwtVerify();
    if (request.user.role !== 'ADMIN') {
      return reply.code(403).send({ error: 'Forbidden' });
    }
  } catch {
    reply.code(401).send({ error: 'Unauthorized' });
  }
});

fastify.register(require('./routes/auth'));
fastify.register(require('./routes/eventTypes'));
fastify.register(require('./routes/events'));
fastify.register(require('./routes/activities'));
fastify.register(require('./routes/investors'));
fastify.register(require('./routes/images'));
fastify.register(require('./routes/reports'));
fastify.register(require('./routes/analytics'));
fastify.register(require('./routes/audit'));
fastify.register(require('./routes/config'));

const PORT = process.env.PORT || 3001;
fastify.listen({ port: PORT, host: '0.0.0.0' }, err => {
  if (err) { fastify.log.error(err); process.exit(1); }
});

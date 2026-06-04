require('dotenv').config();
const fastify = require('fastify')({ logger: true });

fastify.register(require('@fastify/cors'), {
  origin: process.env.FRONTEND_URL || true,
});
fastify.register(require('@fastify/multipart'));

fastify.register(require('./routes/eventTypes'));
fastify.register(require('./routes/events'));
fastify.register(require('./routes/activities'));
fastify.register(require('./routes/investors'));
fastify.register(require('./routes/images'));
fastify.register(require('./routes/reports'));
fastify.register(require('./routes/analytics'));
fastify.register(require('./routes/audit'));

const PORT = process.env.PORT || 3001;
fastify.listen({ port: PORT, host: '0.0.0.0' }, err => {
  if (err) { fastify.log.error(err); process.exit(1); }
});

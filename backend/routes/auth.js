const { prisma } = require('../prisma');
const bcrypt = require('bcryptjs');

module.exports = async function (fastify) {
  fastify.post('/auth/login', async (req, reply) => {
    const { email, password } = req.body || {};
    if (!email || !password) return reply.code(400).send({ error: 'Email and password required' });

    const user = await prisma.user.findUnique({ where: { email } });
    const valid = user && await bcrypt.compare(password, user.passwordHash);
    if (!valid) return reply.code(401).send({ error: 'Invalid credentials' });

    const token = fastify.jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      { expiresIn: '7d' }
    );
    return { token, user: { id: user.id, email: user.email, role: user.role } };
  });

  fastify.get('/auth/me', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user.sub },
      select: { id: true, email: true, role: true },
    });
    if (!user) return reply.code(404).send({ error: 'Not found' });
    return user;
  });

  fastify.post('/auth/users', { onRequest: [fastify.requireAdmin] }, async (req, reply) => {
    const { email, password, role = 'VIEWER' } = req.body || {};
    if (!email || !password) return reply.code(400).send({ error: 'Email and password required' });
    if (!['ADMIN', 'VIEWER'].includes(role)) return reply.code(400).send({ error: 'Invalid role' });

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return reply.code(409).send({ error: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash, role },
      select: { id: true, email: true, role: true, createdAt: true },
    });
    reply.code(201).send(user);
  });

  fastify.get('/auth/users', { onRequest: [fastify.requireAdmin] }, async () => {
    return prisma.user.findMany({
      select: { id: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
  });

  fastify.delete('/auth/users/:id', { onRequest: [fastify.requireAdmin] }, async (req, reply) => {
    await prisma.user.delete({ where: { id: req.params.id } });
    reply.code(204).send();
  });

  fastify.patch('/auth/users/:id/password', { onRequest: [fastify.requireAdmin] }, async (req, reply) => {
    const { password } = req.body || {};
    if (!password || password.length < 6) return reply.code(400).send({ error: 'Password must be at least 6 characters' });
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({ where: { id: req.params.id }, data: { passwordHash } });
    reply.code(204).send();
  });

  fastify.patch('/auth/me/password', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) return reply.code(400).send({ error: 'Both fields required' });
    if (newPassword.length < 6) return reply.code(400).send({ error: 'New password must be at least 6 characters' });

    const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return reply.code(401).send({ error: 'Current password is incorrect' });

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.user.sub }, data: { passwordHash } });
    reply.code(204).send();
  });
};

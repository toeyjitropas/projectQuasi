const { prisma } = require('../prisma');

module.exports = async function (fastify) {
  const AUTH  = { onRequest: [fastify.authenticate] };
  const ADMIN = { onRequest: [fastify.requireAdmin] };

  // ── Event Types ──────────────────────────────────────────────────────
  fastify.post('/event-types', ADMIN, async (req, reply) => {
    const et = await prisma.eventType.create({ data: { name: req.body.name } });
    reply.code(201).send(et);
  });

  fastify.patch('/event-types/:id', ADMIN, async (req, reply) => {
    const et = await prisma.eventType.update({
      where: { id: parseInt(req.params.id) },
      data: { name: req.body.name },
    });
    return et;
  });

  fastify.delete('/event-types/:id', ADMIN, async (req, reply) => {
    await prisma.eventType.delete({ where: { id: parseInt(req.params.id) } });
    reply.code(204).send();
  });

  // ── Vendor Roles ─────────────────────────────────────────────────────
  fastify.get('/vendor-roles', AUTH, async () => {
    return prisma.vendorRole.findMany({ orderBy: { name: 'asc' } });
  });

  fastify.post('/vendor-roles', ADMIN, async (req, reply) => {
    const vr = await prisma.vendorRole.create({ data: { name: req.body.name } });
    reply.code(201).send(vr);
  });

  fastify.patch('/vendor-roles/:id', ADMIN, async (req, reply) => {
    const vr = await prisma.vendorRole.update({
      where: { id: parseInt(req.params.id) },
      data: { name: req.body.name },
    });
    return vr;
  });

  fastify.delete('/vendor-roles/:id', ADMIN, async (req, reply) => {
    await prisma.vendorRole.delete({ where: { id: parseInt(req.params.id) } });
    reply.code(204).send();
  });

  // ── Vendors ──────────────────────────────────────────────────────────
  fastify.get('/vendors', AUTH, async () => {
    return prisma.vendor.findMany({ orderBy: { name: 'asc' } });
  });

  fastify.post('/vendors', ADMIN, async (req, reply) => {
    const { name, roles } = req.body;
    const v = await prisma.vendor.create({ data: { name, roles: roles || [] } });
    reply.code(201).send(v);
  });

  fastify.patch('/vendors/:id', ADMIN, async (req) => {
    const { name, roles } = req.body;
    return prisma.vendor.update({ where: { id: req.params.id }, data: { name, roles: roles || [] } });
  });

  fastify.delete('/vendors/:id', ADMIN, async (req, reply) => {
    await prisma.vendor.delete({ where: { id: req.params.id } });
    reply.code(204).send();
  });

  // ── Investor Master ───────────────────────────────────────────────────
  fastify.get('/investor-masters', AUTH, async () => {
    return prisma.investorMaster.findMany({ orderBy: { name: 'asc' } });
  });

  fastify.post('/investor-masters', ADMIN, async (req, reply) => {
    const { name, defaultInvestment, defaultReturnRate } = req.body;
    const im = await prisma.investorMaster.create({
      data: { name, defaultInvestment: defaultInvestment || null, defaultReturnRate: defaultReturnRate || null },
    });
    reply.code(201).send(im);
  });

  fastify.patch('/investor-masters/:id', ADMIN, async (req, reply) => {
    const { name, defaultInvestment, defaultReturnRate } = req.body;
    const im = await prisma.investorMaster.update({
      where: { id: req.params.id },
      data: { name, defaultInvestment: defaultInvestment || null, defaultReturnRate: defaultReturnRate || null },
    });
    return im;
  });

  fastify.delete('/investor-masters/:id', ADMIN, async (req, reply) => {
    await prisma.investorMaster.delete({ where: { id: req.params.id } });
    reply.code(204).send();
  });
};

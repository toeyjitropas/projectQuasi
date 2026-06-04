const prisma = require('../prisma');

module.exports = async function (fastify) {
  fastify.post('/events/:id/activities', async (req, reply) => {
    const activity = await prisma.activity.create({
      data: { ...req.body, eventId: req.params.id },
    });
    reply.code(201).send(activity);
  });

  fastify.patch('/activities/:id', async (req, reply) => {
    const activity = await prisma.activity.update({
      where: { id: req.params.id },
      data: req.body,
    });
    return activity;
  });

  fastify.delete('/activities/:id', async (req, reply) => {
    await prisma.activity.delete({ where: { id: req.params.id } });
    reply.code(204).send();
  });
};

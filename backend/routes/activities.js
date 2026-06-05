const { prisma, withUserContext } = require('../prisma');

const toDate = v => (v ? new Date(v) : null);

function parseDates(body) {
  const { billingDate, constructionDate, completeDate, paidDate, ...rest } = body;
  const result = { ...rest };
  if ('billingDate'      in body) result.billingDate      = toDate(billingDate);
  if ('constructionDate' in body) result.constructionDate = toDate(constructionDate);
  if ('completeDate'     in body) result.completeDate     = toDate(completeDate);
  if ('paidDate'         in body) result.paidDate         = toDate(paidDate);
  return result;
}

module.exports = async function (fastify) {
  const AUTH  = { onRequest: [fastify.authenticate] };
  const ADMIN = { onRequest: [fastify.requireAdmin] };

  fastify.post('/events/:id/activities', ADMIN, async (req, reply) => {
    const activity = await withUserContext(req.user.email, tx =>
      tx.activity.create({ data: { ...parseDates(req.body), eventId: req.params.id } })
    );
    reply.code(201).send(activity);
  });

  fastify.patch('/activities/:id', ADMIN, async (req, reply) => {
    const activity = await withUserContext(req.user.email, tx =>
      tx.activity.update({ where: { id: req.params.id }, data: parseDates(req.body) })
    );
    return activity;
  });

  fastify.delete('/activities/:id', ADMIN, async (req, reply) => {
    await withUserContext(req.user.email, tx =>
      tx.activity.delete({ where: { id: req.params.id } })
    );
    reply.code(204).send();
  });
};

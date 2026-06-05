const { prisma, withUserContext } = require('../prisma');

const toDate = v => (v ? new Date(v) : null);

function enrich(inv) {
  const investment = Number(inv.investment);
  const returnRate = Number(inv.returnRate);
  const returnAmount = investment * returnRate / 100;
  const totalPayout = investment + returnAmount;
  const isOverdue = !inv.isPaid && inv.payoutDate && new Date(inv.payoutDate) < new Date();
  return { ...inv, returnAmount, totalPayout, isOverdue };
}

function parseDates(body) {
  const { billingDate, payoutDate, paidDate, ...rest } = body;
  const result = { ...rest };
  if ('billingDate' in body) result.billingDate = toDate(billingDate);
  if ('payoutDate'  in body) result.payoutDate  = toDate(payoutDate);
  if ('paidDate'    in body) result.paidDate    = toDate(paidDate);
  return result;
}

module.exports = async function (fastify) {
  const AUTH  = { onRequest: [fastify.authenticate] };
  const ADMIN = { onRequest: [fastify.requireAdmin] };

  fastify.post('/events/:id/investors', ADMIN, async (req, reply) => {
    const investor = await withUserContext(req.user.email, tx =>
      tx.investor.create({ data: { ...parseDates(req.body), eventId: req.params.id } })
    );
    reply.code(201).send(enrich(investor));
  });

  fastify.patch('/investors/:id', ADMIN, async (req, reply) => {
    const investor = await withUserContext(req.user.email, tx =>
      tx.investor.update({ where: { id: req.params.id }, data: parseDates(req.body) })
    );
    return enrich(investor);
  });

  fastify.delete('/investors/:id', ADMIN, async (req, reply) => {
    await withUserContext(req.user.email, tx =>
      tx.investor.delete({ where: { id: req.params.id } })
    );
    reply.code(204).send();
  });
};

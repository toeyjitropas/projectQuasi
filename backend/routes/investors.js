const prisma = require('../prisma');

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
  const { billingDate, payoutDate, ...rest } = body;
  return {
    ...rest,
    billingDate: toDate(billingDate),
    payoutDate: toDate(payoutDate),
  };
}

module.exports = async function (fastify) {
  fastify.post('/events/:id/investors', async (req, reply) => {
    const investor = await prisma.investor.create({
      data: { ...parseDates(req.body), eventId: req.params.id },
    });
    reply.code(201).send(enrich(investor));
  });

  fastify.patch('/investors/:id', async (req, reply) => {
    const investor = await prisma.investor.update({
      where: { id: req.params.id },
      data: parseDates(req.body),
    });
    return enrich(investor);
  });

  fastify.delete('/investors/:id', async (req, reply) => {
    await prisma.investor.delete({ where: { id: req.params.id } });
    reply.code(204).send();
  });
};

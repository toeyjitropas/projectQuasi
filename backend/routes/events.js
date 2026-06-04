const prisma = require('../prisma');

function deriveSize(participants) {
  if (!participants) return null;
  if (participants <= 30) return 'S';
  if (participants <= 100) return 'M';
  if (participants <= 300) return 'L';
  return 'XL';
}

const toDate = v => (v ? new Date(v) : null);

module.exports = async function (fastify) {
  fastify.get('/events', async (req) => {
    const { status } = req.query;
    const where = status && status !== 'all' ? { status } : {};
    return prisma.event.findMany({
      where,
      include: { eventType: true, activities: true, investors: true },
      orderBy: { createdAt: 'desc' },
    });
  });

  fastify.post('/events', async (req, reply) => {
    const { participants, eventTypeId, date, billingDate, payoutDate, ...rest } = req.body;
    const size = deriveSize(participants);
    const event = await prisma.event.create({
      data: {
        ...rest,
        participants: participants || null,
        size,
        eventTypeId: eventTypeId || null,
        date: toDate(date),
        billingDate: toDate(billingDate),
        payoutDate: toDate(payoutDate),
      },
      include: { eventType: true },
    });
    reply.code(201).send(event);
  });

  fastify.get('/events/:id', async (req, reply) => {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: { eventType: true, activities: true, images: true, investors: true },
    });
    if (!event) return reply.code(404).send({ error: 'Not found' });
    const today = new Date();
    const enrichedInvestors = event.investors.map(inv => {
      const investment = Number(inv.investment);
      const returnRate = Number(inv.returnRate);
      const returnAmount = investment * returnRate / 100;
      const totalPayout = investment + returnAmount;
      const isOverdue = !inv.isPaid && inv.payoutDate && new Date(inv.payoutDate) < today;
      return { ...inv, returnAmount, totalPayout, isOverdue };
    });
    return { ...event, investors: enrichedInvestors };
  });

  fastify.patch('/events/:id', async (req, reply) => {
    const { participants, eventTypeId, date, billingDate, payoutDate, ...rest } = req.body;
    const data = { ...rest };
    if (participants !== undefined) { data.participants = participants || null; data.size = deriveSize(participants); }
    if (eventTypeId !== undefined) data.eventTypeId = eventTypeId || null;
    if (date !== undefined) data.date = toDate(date);
    if (billingDate !== undefined) data.billingDate = toDate(billingDate);
    if (payoutDate !== undefined) data.payoutDate = toDate(payoutDate);
    const event = await prisma.event.update({
      where: { id: req.params.id },
      data,
      include: { eventType: true },
    });
    return event;
  });

  fastify.delete('/events/:id', async (req, reply) => {
    await prisma.event.delete({ where: { id: req.params.id } });
    reply.code(204).send();
  });
};

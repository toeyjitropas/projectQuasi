const { prisma } = require('../prisma');

module.exports = async function (fastify) {
  const AUTH = { onRequest: [fastify.authenticate] };

  fastify.get('/reports/event-summary', AUTH, async (req) => {
    const { from, to, type, size, isMajor } = req.query;
    const where = {};
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }
    if (type) where.eventType = { name: type };
    if (size) where.size = size;
    if (isMajor !== undefined) where.isMajor = isMajor === 'true';

    const events = await prisma.event.findMany({
      where,
      include: { eventType: true, activities: true },
      orderBy: { date: 'desc' },
    });

    return events.map(ev => ({
      ...ev,
      totalCost: ev.activities.reduce((s, a) => s + Number(a.price || 0), 0),
    }));
  });

  fastify.get('/reports/payout-summary', AUTH, async () => {
    const rows = await prisma.$queryRaw`
      SELECT
        TO_CHAR(e."payoutDate", 'YYYY-MM') AS month,
        COUNT(e.id)::int AS event_count,
        COALESCE(SUM(a.total), 0) AS total_cost
      FROM "Event" e
      LEFT JOIN (
        SELECT "eventId", SUM(price) AS total FROM "Activity" GROUP BY "eventId"
      ) a ON a."eventId" = e.id
      WHERE e."payoutDate" IS NOT NULL
      GROUP BY month
      ORDER BY month
    `;
    return rows;
  });

  fastify.get('/reports/vendor-billing', AUTH, async (req) => {
    const { mode, year, month, date } = req.query;

    if (mode === 'date' && date) {
      const rows = await prisma.activity.findMany({
        where: { billingDate: new Date(date) },
        include: { event: { select: { name: true } } },
        orderBy: { billingDate: 'asc' },
      });
      return rows;
    }

    const y = parseInt(year) || new Date().getFullYear();
    const m = parseInt(month) || new Date().getMonth() + 1;
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0);

    const rows = await prisma.activity.findMany({
      where: { billingDate: { gte: start, lte: end } },
      include: { event: { select: { name: true } } },
      orderBy: { billingDate: 'asc' },
    });
    return rows;
  });

  fastify.get('/reports/investors', AUTH, async (req) => {
    const { name, status } = req.query;
    const today = new Date();

    const investors = await prisma.investor.findMany({
      where: name ? { name: { contains: name, mode: 'insensitive' } } : {},
      include: { event: { select: { id: true, name: true, date: true, status: true } } },
      orderBy: { name: 'asc' },
    });

    const enriched = investors.map(inv => {
      const investment = Number(inv.investment);
      const returnRate = Number(inv.returnRate);
      const returnAmount = investment * returnRate / 100;
      const totalPayout = investment + returnAmount;
      const isOverdue = !inv.isPaid && inv.payoutDate && new Date(inv.payoutDate) < today;
      return { ...inv, returnAmount, totalPayout, isOverdue };
    });

    if (!status || status === 'all') return enriched;
    if (status === 'paid') return enriched.filter(r => r.isPaid);
    if (status === 'unpaid') return enriched.filter(r => !r.isPaid && !r.isOverdue);
    if (status === 'overdue') return enriched.filter(r => r.isOverdue);
    return enriched;
  });
};

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const types = ['Conference', 'Workshop', 'Corporate Dinner', 'Team Building', 'Exhibition', 'Other'];
  for (const name of types) {
    await prisma.eventType.upsert({ where: { name }, update: {}, create: { name } });
  }
  console.log('Seeded event types');
}

main().catch(console.error).finally(() => prisma.$disconnect());

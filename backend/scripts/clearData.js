const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.eventImage.deleteMany(),
    prisma.activity.deleteMany(),
    prisma.investor.deleteMany(),
    prisma.event.deleteMany(),
    prisma.investorMaster.deleteMany(),
    prisma.vendor.deleteMany(),
    prisma.vendorRole.deleteMany(),
    prisma.eventType.deleteMany(),
    prisma.reportConfig.deleteMany(),
  ]);
  console.log('All data cleared.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

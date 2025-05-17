import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteUnverifiedUsers() {
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000); // 48 hours ago
  const deleted = await prisma.user.deleteMany({
    where: {
      emailVerified: null,
      createdAt: { lt: cutoff },
    },
  });
  console.log(`Deleted ${deleted.count} unverified user(s) older than 48 hours.`);
}

deleteUnverifiedUsers()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
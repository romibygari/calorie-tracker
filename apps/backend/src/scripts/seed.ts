import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create 2 users (upsert so re-running is safe)
  const user1 = await prisma.user.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'You',
      calorieTarget: 2000,
      proteinTarget: 150,
      carbTarget: 250,
      fatTarget: 65,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      name: 'Friend',
      calorieTarget: 2000,
      proteinTarget: 150,
      carbTarget: 250,
      fatTarget: 65,
    },
  });

  console.log('Seeded users:', user1.name, user2.name);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

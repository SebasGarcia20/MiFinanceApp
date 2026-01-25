import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  { name: 'Fixed/Essentials', color: '#3B82F6', order: 0 }, // Blue
  { name: 'Debt/Card Payment', color: '#EF4444', order: 1 }, // Red
  { name: 'Food', color: '#10B981', order: 2 }, // Green
  { name: 'Transport', color: '#F59E0B', order: 3 }, // Amber
  { name: 'Entertainment', color: '#8B5CF6', order: 4 }, // Purple
  { name: 'Health', color: '#EC4899', order: 5 }, // Pink
  { name: 'Other', color: '#6B7280', order: 6 }, // Gray
];

async function main() {
  console.log('Seeding default categories...');

  // Create global default categories (userId = null)
  // Use cuid() compatible IDs or let Prisma generate them
  for (const category of DEFAULT_CATEGORIES) {
    const existing = await prisma.category.findFirst({
      where: {
        userId: null,
        name: category.name,
      },
    });

    if (!existing) {
      await prisma.category.create({
        data: {
          userId: null, // Global default
          name: category.name,
          color: category.color,
          order: category.order,
        },
      });
    } else {
      await prisma.category.update({
        where: { id: existing.id },
        data: {
          color: category.color,
          order: category.order,
        },
      });
    }
  }

  console.log('✅ Default categories seeded successfully');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { prisma } from "./prisma";

// Default category colors mapping
const DEFAULT_CATEGORY_COLORS: Record<string, string> = {
  "Food": "#10B981", // Green
  "Transport": "#F59E0B", // Amber
  "Bills": "#3B82F6", // Blue
  "Debt": "#EF4444", // Red
  "Entertainment": "#8B5CF6", // Purple
  "Shopping": "#F97316", // Orange
  "Health": "#EC4899", // Pink
  "Other": "#6B7280", // Gray
};

export async function ensureUserDefaults(userId: string) {
  await prisma.userSettings.upsert({
    where: { userId },
    update: {},
    create: { userId, periodStartDay: 15 },
  });

  const categoryCount = await prisma.category.count({ where: { userId } });
  if (categoryCount === 0) {
    await prisma.category.createMany({
      data: [
        { userId, name: "Food", color: DEFAULT_CATEGORY_COLORS["Food"], order: 1 },
        { userId, name: "Transport", color: DEFAULT_CATEGORY_COLORS["Transport"], order: 2 },
        { userId, name: "Bills", color: DEFAULT_CATEGORY_COLORS["Bills"], order: 3 },
        { userId, name: "Debt", color: DEFAULT_CATEGORY_COLORS["Debt"], order: 4 },
        { userId, name: "Entertainment", color: DEFAULT_CATEGORY_COLORS["Entertainment"], order: 5 },
        { userId, name: "Shopping", color: DEFAULT_CATEGORY_COLORS["Shopping"], order: 6 },
        { userId, name: "Health", color: DEFAULT_CATEGORY_COLORS["Health"], order: 7 },
        { userId, name: "Other", color: DEFAULT_CATEGORY_COLORS["Other"], order: 99 },
      ],
      skipDuplicates: true,
    });
  } else {
    // Update existing categories that don't have colors
    const existingCategories = await prisma.category.findMany({
      where: { userId },
    });

    for (const category of existingCategories) {
      if (!category.color && DEFAULT_CATEGORY_COLORS[category.name]) {
        await prisma.category.update({
          where: { id: category.id },
          data: { color: DEFAULT_CATEGORY_COLORS[category.name] },
        });
      }
    }
  }

  const bucketCount = await prisma.bucketConfig.count({ where: { userId } });
  if (bucketCount === 0) {
    await prisma.bucketConfig.createMany({
      data: [
        { userId, name: "Cash", type: "cash", order: 1 },
        { userId, name: "Bank", type: "cash", order: 2 },
        { userId, name: "Credit Card", type: "credit_card", paymentDay: 20, order: 3 },
      ],
      skipDuplicates: true,
    });
  }
}

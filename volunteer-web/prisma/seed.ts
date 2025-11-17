

import { prisma } from "@/lib/prisma";


async function main() {
  // Create default roles if they don't exist
  await prisma.role.createMany({
    data: [
      { name: "admin" },
      { name: "moderator" },
      { name: "publisher" },
      { name: "organizer" },
      { name: "volunteer" },
    ],
    skipDuplicates: true, // prevents errors if they already exist
  });

  console.log("✅ Default roles seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

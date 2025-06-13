// scripts/seed.ts
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create some Algerian wilayas
  const wilayas = [
    { name: 'Adrar', code: '01' },
    { name: 'Chlef', code: '02' },
    { name: 'Laghouat', code: '03' },
    { name: 'Oum El Bouaghi', code: '04' },
    { name: 'Batna', code: '05' },
    { name: 'Béjaïa', code: '06' },
    { name: 'Biskra', code: '07' },
    { name: 'Béchar', code: '08' },
    { name: 'Blida', code: '09' },
    { name: 'Bouira', code: '10' },
    { name: 'Tamanrasset', code: '11' },
    { name: 'Tébessa', code: '12' },
    { name: 'Tlemcen', code: '13' },
    { name: 'Tiaret', code: '14' },
    { name: 'Tizi Ouzou', code: '15' },
    { name: 'Alger', code: '16' },
    { name: 'Djelfa', code: '17' },
    { name: 'Jijel', code: '18' },
    { name: 'Sétif', code: '19' },
    { name: 'Saïda', code: '20' },
  ];

  // Create wilayas
  for (const wilayaData of wilayas) {
    await prisma.wilaya.upsert({
      where: { code: wilayaData.code },
      update: {},
      create: wilayaData,
    });
  }

  console.log('Wilayas created');

  // Create a sample sheep import
  const sheepImport = await prisma.sheepImport.create({
    data: {
      batchName: 'Romania Import Batch 1',
      importDate: new Date('2025-01-15'),
      totalQuantity: 10000,
      remainingQuantity: 10000,
      originCountry: 'Romania',
      status: 'ARRIVED',
    },
  });

  console.log('Sheep import created');

  // Create allocations for some wilayas
  const createdWilayas = await prisma.wilaya.findMany({ take: 10 });
  
  for (const wilaya of createdWilayas) {
    const allocatedQuantity = Math.floor(Math.random() * 500) + 100; // Random between 100-600
    
    await prisma.wilayaAllocation.create({
      data: {
        sheepImportId: sheepImport.id,
        wilayaId: wilaya.id,
        allocatedQuantity,
        remainingQuantity: allocatedQuantity,
      },
    });
  }

  console.log('Wilaya allocations created');

  // Create an admin user
  const bcrypt = await import('bcryptjs');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  await prisma.user.upsert({
    where: { email: 'admin@sheep.dz' },
    update: {},
    create: {
      name: 'System Administrator',
      email: 'admin@sheep.dz',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('Admin user created');
  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

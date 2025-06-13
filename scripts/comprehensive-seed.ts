// scripts/comprehensive-seed.ts
import { PrismaClient } from '../src/generated/prisma';
import * as  const createdImports = [];
  for (const importData of sheepImports) {
    const sheepImport = await prisma.sheepImport.create({
      data: {
        ...importData,
        status: importData.status as 'PENDING' | 'ARRIVED' | 'DISTRIBUTED',
      },
    });
    createdImports.push(sheepImport);
  }om 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with comprehensive test data...');

  // Create all 48 Algerian wilayas
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
    { name: 'Skikda', code: '21' },
    { name: 'Sidi Bel Abbès', code: '22' },
    { name: 'Annaba', code: '23' },
    { name: 'Guelma', code: '24' },
    { name: 'Constantine', code: '25' },
    { name: 'Médéa', code: '26' },
    { name: 'Mostaganem', code: '27' },
    { name: "M'Sila", code: '28' },
    { name: 'Mascara', code: '29' },
    { name: 'Ouargla', code: '30' },
    { name: 'Oran', code: '31' },
    { name: 'El Bayadh', code: '32' },
    { name: 'Illizi', code: '33' },
    { name: 'Bordj Bou Arréridj', code: '34' },
    { name: 'Boumerdès', code: '35' },
    { name: 'El Tarf', code: '36' },
    { name: 'Tindouf', code: '37' },
    { name: 'Tissemsilt', code: '38' },
    { name: 'El Oued', code: '39' },
    { name: 'Khenchela', code: '40' },
    { name: 'Souk Ahras', code: '41' },
    { name: 'Tipaza', code: '42' },
    { name: 'Mila', code: '43' },
    { name: 'Aïn Defla', code: '44' },
    { name: 'Naâma', code: '45' },
    { name: 'Aïn Témouchent', code: '46' },
    { name: 'Ghardaïa', code: '47' },
    { name: 'Relizane', code: '48' },
  ];

  // Create wilayas
  for (const wilayaData of wilayas) {
    await prisma.wilaya.upsert({
      where: { code: wilayaData.code },
      update: {},
      create: wilayaData,
    });
  }

  console.log('All 48 wilayas created');

  // Create multiple sheep imports
  const sheepImports = [
    {
      batchName: 'Romania Import Batch 1',
      importDate: new Date('2025-01-15'),
      totalQuantity: 50000,
      remainingQuantity: 45000,
      originCountry: 'Romania',
      status: 'ARRIVED',
    },
    {
      batchName: 'Argentina Import Batch 1',
      importDate: new Date('2025-01-20'),
      totalQuantity: 30000,
      remainingQuantity: 28000,
      originCountry: 'Argentina',
      status: 'ARRIVED',
    },
    {
      batchName: 'Uruguay Import Batch 1',
      importDate: new Date('2025-01-25'),
      totalQuantity: 20000,
      remainingQuantity: 20000,
      originCountry: 'Uruguay',
      status: 'PENDING',
    },
  ];

  const createdImports = [];
  for (const importData of sheepImports) {
    const sheepImport = await prisma.sheepImport.create({
      data: {
        ...importData,
        status: importData.status as 'PENDING' | 'ARRIVED' | 'DISTRIBUTED',
      },
    });
    createdImports.push(sheepImport);
  }

  console.log('Sheep imports created');

  // Create admin users
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  // System admin
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

  // Get some wilayas for creating wilaya admins
  const createdWilayas = await prisma.wilaya.findMany({ take: 10 });

  // Create wilaya admin users
  for (let i = 0; i < Math.min(5, createdWilayas.length); i++) {
    const wilaya = createdWilayas[i];
    await prisma.user.upsert({
      where: { email: `admin.${wilaya.code}@sheep.dz` },
      update: {},
      create: {
        name: `Admin ${wilaya.name}`,
        email: `admin.${wilaya.code}@sheep.dz`,
        password: hashedPassword,
        role: 'WILAYA_ADMIN',
        wilayaId: wilaya.id,
      },
    });
  }

  console.log('Admin users created');

  // Create allocations for wilayas
  for (let i = 0; i < createdWilayas.length; i++) {
    const wilaya = createdWilayas[i];
    
    // Create allocation for the first import (Romania)
    const allocatedQuantity = Math.floor(Math.random() * 2000) + 500; // Random between 500-2500
    
    await prisma.wilayaAllocation.create({
      data: {
        sheepImportId: createdImports[0].id,
        wilayaId: wilaya.id,
        allocatedQuantity,
        remainingQuantity: Math.floor(allocatedQuantity * 0.8), // 80% remaining
      },
    });

    // Create allocation for the second import (Argentina) for some wilayas
    if (i < 6) {
      const allocatedQuantity2 = Math.floor(Math.random() * 1500) + 300;
      await prisma.wilayaAllocation.create({
        data: {
          sheepImportId: createdImports[1].id,
          wilayaId: wilaya.id,
          allocatedQuantity: allocatedQuantity2,
          remainingQuantity: Math.floor(allocatedQuantity2 * 0.9),
        },
      });
    }
  }

  console.log('Wilaya allocations created');

  // Create customer users with reservations
  const customerNames = [
    'Ahmed Benali', 'Fatima Khelifi', 'Mohamed Saidi', 'Aicha Boudjema',
    'Omar Belkacem', 'Samira Hadj', 'Karim Messaoud', 'Nadia Brahim',
    'Yacine Cherif', 'Leila Mansouri', 'Rachid Lahouel', 'Soumia Benabdallah',
  ];

  const familyNotebooks = [
    'ALG123456789', 'ALG987654321', 'ALG456789123', 'ALG789123456',
    'ALG321654987', 'ALG654987321', 'ALG147258369', 'ALG258369147',
    'ALG369147258', 'ALG741852963', 'ALG852963741', 'ALG963741852',
  ];

  for (let i = 0; i < customerNames.length; i++) {
    const name = customerNames[i];
    const email = `customer${i + 1}@example.com`;
    
    const customer = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'CUSTOMER',
        familyNotebookNumber: familyNotebooks[i],
        wilayaId: createdWilayas[i % createdWilayas.length].id,
      },
    });

    // Create reservations for some customers
    if (i < 8 && customer.wilayaId) {
      const allocation = await prisma.wilayaAllocation.findFirst({
        where: { wilayaId: customer.wilayaId },
      });

      if (allocation) {
        const reservation = await prisma.reservation.create({
          data: {
            userId: customer.id,
            wilayaAllocationId: allocation.id,
            familyNotebookNumber: familyNotebooks[i],
            status: i < 4 ? 'CONFIRMED' : i < 6 ? 'PENDING' : 'PICKED_UP',
          },
        });

        // Create payments for confirmed reservations
        if (i < 4) {
          await prisma.payment.create({
            data: {
              reservationId: reservation.id,
              amount: 25000, // 250 DZD
              status: 'PAID',
            },
          });
        }
      }
    }
  }

  console.log('Customer users and reservations created');

  // Create sample notifications
  const customers = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    take: 5,
  });

  const notificationMessages = [
    'Your sheep reservation has been confirmed.',
    'Your payment has been successfully processed.',
    'Your sheep is ready for pickup. Please visit the distribution center.',
  ];

  for (let i = 0; i < customers.length; i++) {
    const customer = customers[i];
    const message = notificationMessages[i % notificationMessages.length];
    
    await prisma.notification.create({
      data: {
        userId: customer.id,
        message: message,
        read: i % 2 === 0,
      },
    });
  }

  console.log('Sample notifications created');
  console.log('Seeding completed successfully!');
  
  // Print summary
  const stats = {
    wilayas: await prisma.wilaya.count(),
    sheepImports: await prisma.sheepImport.count(),
    allocations: await prisma.wilayaAllocation.count(),
    users: await prisma.user.count(),
    reservations: await prisma.reservation.count(),
    payments: await prisma.payment.count(),
    notifications: await prisma.notification.count(),
  };
  
  console.log('\n=== Database Summary ===');
  console.log(`Wilayas: ${stats.wilayas}`);
  console.log(`Sheep Imports: ${stats.sheepImports}`);
  console.log(`Allocations: ${stats.allocations}`);
  console.log(`Users: ${stats.users}`);
  console.log(`Reservations: ${stats.reservations}`);
  console.log(`Payments: ${stats.payments}`);
  console.log(`Notifications: ${stats.notifications}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

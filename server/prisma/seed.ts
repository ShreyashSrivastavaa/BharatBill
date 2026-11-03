import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding plans…');

  const plans = [
    {
      name: 'Starter',
      price: 99,
      billingCycle: 'monthly',
      sortOrder: 1,
      features: [
        'GST Invoicing',
        'Up to 100 Products',
        'Up to 50 Invoices/month',
        '1 User',
        'Email Support',
      ],
      limits: {
        maxProducts: 100,
        maxInvoicesPerMonth: 50,
        maxUsers: 1,
      },
    },
    {
      name: 'Business',
      price: 199,
      billingCycle: 'monthly',
      sortOrder: 2,
      features: [
        'Everything in Starter',
        'Unlimited Products',
        'Unlimited Invoices',
        '3 Users',
        'Purchase Management',
        'Reports & Analytics',
        'Priority Support',
      ],
      limits: {
        maxProducts: -1,
        maxInvoicesPerMonth: -1,
        maxUsers: 3,
      },
    },
    {
      name: 'Professional',
      price: 399,
      billingCycle: 'monthly',
      sortOrder: 3,
      features: [
        'Everything in Business',
        '10 Users',
        'Advanced Reports',
        'Multi-business',
        'PDF Customization',
        'Dedicated Support',
      ],
      limits: {
        maxProducts: -1,
        maxInvoicesPerMonth: -1,
        maxUsers: 10,
      },
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: {
        price: plan.price,
        billingCycle: plan.billingCycle,
        features: plan.features,
        limits: plan.limits,
        sortOrder: plan.sortOrder,
      },
      create: {
        name: plan.name,
        price: plan.price,
        billingCycle: plan.billingCycle,
        features: plan.features,
        limits: plan.limits,
        sortOrder: plan.sortOrder,
      },
    });

    console.log(`  ✅ Plan "${plan.name}" upserted (₹${plan.price}/mo)`);
  }

  console.log('🌱 Seeding complete.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

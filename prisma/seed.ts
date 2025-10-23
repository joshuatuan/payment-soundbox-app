import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create merchant
  const merchant = await prisma.user.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Koffee Shop MNL',
      type: 'merchant',
      balance: 0,
    },
  })

  // Create payer
  const payer = await prisma.user.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      name: 'Joshua Miguel',
      type: 'payer',
      balance: 500,
    },
  })

  console.log({ merchant, payer })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

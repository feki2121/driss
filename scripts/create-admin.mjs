import { randomBytes, scryptSync } from 'node:crypto'
import { PrismaClient } from '@prisma/client'

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
const password = process.env.ADMIN_PASSWORD

if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  throw new Error('Set ADMIN_EMAIL to a valid email address.')
}
if (!password || password.length < 12) {
  throw new Error('Set ADMIN_PASSWORD to a password with at least 12 characters.')
}

const salt = randomBytes(16).toString('hex')
const passwordHash = `scrypt$${salt}$${scryptSync(password, salt, 64).toString('hex')}`
const prisma = new PrismaClient()

try {
  await prisma.admin.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  })
  console.log(`Administrator account ${email} is ready.`)
} finally {
  await prisma.$disconnect()
}

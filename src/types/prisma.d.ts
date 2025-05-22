import { Prisma } from '@prisma/client'

declare global {
  namespace Prisma {
    interface StudentProfile {
      overallStatus: string
      psaStatus: string
      awardStatus: string
    }
  }
} 
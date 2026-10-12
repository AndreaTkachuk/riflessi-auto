-- CreateEnum
CREATE TYPE "ModelBadge" AS ENUM ('NEW_MODEL', 'NEW_GENERATION', 'FACELIFT');

-- AlterTable
ALTER TABLE "CarModel" ADD COLUMN     "badge" "ModelBadge",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "launchedAt" TIMESTAMP(3);

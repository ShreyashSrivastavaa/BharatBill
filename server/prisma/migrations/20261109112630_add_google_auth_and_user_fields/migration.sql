-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT,
ADD COLUMN IF NOT EXISTS "googleId" TEXT,
ALTER COLUMN "passwordHash" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "User_googleId_idx" ON "User"("googleId");

-- Make password nullable for Google-authenticated users
ALTER TABLE "User"
ALTER COLUMN "password" DROP NOT NULL;

-- Add Google account identifier
ALTER TABLE "User"
ADD COLUMN "googleId" TEXT;

-- Create unique index for Google account identifier
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");
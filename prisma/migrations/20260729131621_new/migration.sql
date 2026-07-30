/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Property` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `areaSqFt` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bathrooms` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bedrooms` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mainImage` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Property` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "areaSqFt" INTEGER NOT NULL,
ADD COLUMN     "bathrooms" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "bedrooms" INTEGER NOT NULL,
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "detailedDescription" TEXT,
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mainImage" TEXT NOT NULL,
ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "reviewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "address" TEXT,
ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "facebook" TEXT,
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "github" TEXT,
ADD COLUMN     "isSuperhost" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "linkedin" TEXT,
ADD COLUMN     "occupation" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "responseRate" TEXT,
ADD COLUMN     "responseTime" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "website" TEXT,
ADD COLUMN     "zipCode" TEXT;

-- CreateTable
CREATE TABLE "PropertyOverview" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "availableFrom" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "yearBuilt" INTEGER NOT NULL,
    "depositAmount" DOUBLE PRECISION NOT NULL,
    "leaseTerm" TEXT NOT NULL,
    "petPolicy" TEXT NOT NULL,
    "parkingType" TEXT NOT NULL,

    CONSTRAINT "PropertyOverview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PropertyOverview_propertyId_key" ON "PropertyOverview"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "Property_slug_key" ON "Property"("slug");

-- AddForeignKey
ALTER TABLE "PropertyOverview" ADD CONSTRAINT "PropertyOverview_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

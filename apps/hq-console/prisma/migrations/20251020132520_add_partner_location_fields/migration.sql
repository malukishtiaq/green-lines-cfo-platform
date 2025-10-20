-- CreateEnum
CREATE TYPE "PartnerAvailability" AS ENUM ('AVAILABLE', 'MODERATE', 'BUSY', 'UNAVAILABLE');

-- AlterTable
ALTER TABLE "partners" ADD COLUMN     "activeEngagements" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "address" TEXT,
ADD COLUMN     "availability" "PartnerAvailability" NOT NULL DEFAULT 'AVAILABLE',
ADD COLUMN     "city" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "rating" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "remoteOk" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "specialties" JSONB;

-- CreateIndex
CREATE INDEX "partners_city_idx" ON "partners"("city");

-- CreateIndex
CREATE INDEX "partners_latitude_longitude_idx" ON "partners"("latitude", "longitude");

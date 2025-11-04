-- CreateEnum
CREATE TYPE "MilestoneStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'CANCELLED');

-- AlterTable
ALTER TABLE "milestones" ADD COLUMN     "actualCost" DECIMAL(65,30),
ADD COLUMN     "completedDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "status" "MilestoneStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "plans" ADD COLUMN     "taskId" TEXT;

-- AlterTable
ALTER TABLE "service_plans" ADD COLUMN     "dataDomains" TEXT[],
ADD COLUMN     "erpConnection" JSONB,
ADD COLUMN     "governancePolicy" JSONB;

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "actualCost" DECIMAL(65,30),
ADD COLUMN     "budget" DECIMAL(65,30);

-- CreateTable
CREATE TABLE "plan_kpis" (
    "id" TEXT NOT NULL,
    "servicePlanId" TEXT NOT NULL,
    "kpiName" TEXT NOT NULL,
    "targetValue" DOUBLE PRECISION NOT NULL,
    "thresholdGreen" DOUBLE PRECISION NOT NULL,
    "thresholdAmber" DOUBLE PRECISION NOT NULL,
    "thresholdRed" DOUBLE PRECISION NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "calculationSource" TEXT NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "actualValue" DOUBLE PRECISION,
    "status" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_kpis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_pricing" (
    "id" TEXT NOT NULL,
    "servicePlanId" TEXT NOT NULL,
    "package" TEXT NOT NULL,
    "addOns" TEXT[],
    "basePrice" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "platformCommissionPct" DOUBLE PRECISION NOT NULL,
    "partnerCommissionPct" DOUBLE PRECISION NOT NULL,
    "payoutDelayDays" INTEGER NOT NULL,
    "refundPolicy" TEXT NOT NULL,
    "contractStartDate" TIMESTAMP(3) NOT NULL,
    "contractEndDate" TIMESTAMP(3) NOT NULL,
    "paymentTerms" TEXT NOT NULL,
    "proposalGenerated" BOOLEAN NOT NULL DEFAULT false,
    "proposalPath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_pricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignments" (
    "id" TEXT NOT NULL,
    "servicePlanId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "partnerId" TEXT,
    "assignmentOwner" TEXT NOT NULL,
    "slaHours" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "priority" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "attachments" TEXT[],
    "notifyPartner" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" DECIMAL(65,30),
    "currency" TEXT NOT NULL DEFAULT 'SAR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "plan_pricing_servicePlanId_key" ON "plan_pricing"("servicePlanId");

-- AddForeignKey
ALTER TABLE "plans" ADD CONSTRAINT "plans_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_kpis" ADD CONSTRAINT "plan_kpis_servicePlanId_fkey" FOREIGN KEY ("servicePlanId") REFERENCES "service_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_pricing" ADD CONSTRAINT "plan_pricing_servicePlanId_fkey" FOREIGN KEY ("servicePlanId") REFERENCES "service_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_servicePlanId_fkey" FOREIGN KEY ("servicePlanId") REFERENCES "service_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "erp_connections" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "erpType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOT_CONNECTED',
    "credentialsEncrypted" TEXT NOT NULL,
    "lastSyncDate" TIMESTAMP(3),
    "lastSyncStatus" TEXT,
    "lastSyncError" TEXT,
    "mappingHealth" INTEGER NOT NULL DEFAULT 0,
    "dataDomains" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "erp_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp_sync_history" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "syncType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "recordsProcessed" INTEGER NOT NULL DEFAULT 0,
    "recordsSkipped" INTEGER NOT NULL DEFAULT 0,
    "errors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "warnings" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "triggeredBy" TEXT,
    "dataDomainssynced" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "erp_sync_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "erp_connections_customerId_idx" ON "erp_connections"("customerId");

-- CreateIndex
CREATE INDEX "erp_connections_erpType_idx" ON "erp_connections"("erpType");

-- CreateIndex
CREATE INDEX "erp_connections_status_idx" ON "erp_connections"("status");

-- CreateIndex
CREATE INDEX "erp_sync_history_connectionId_createdAt_idx" ON "erp_sync_history"("connectionId", "createdAt");

-- CreateIndex
CREATE INDEX "erp_sync_history_status_idx" ON "erp_sync_history"("status");

-- AddForeignKey
ALTER TABLE "erp_connections" ADD CONSTRAINT "erp_connections_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp_sync_history" ADD CONSTRAINT "erp_sync_history_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "erp_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

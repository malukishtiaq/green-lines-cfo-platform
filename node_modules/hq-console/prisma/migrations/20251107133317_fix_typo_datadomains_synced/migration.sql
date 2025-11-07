/*
  Warnings:

  - You are about to drop the column `dataDomainssynced` on the `erp_sync_history` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "erp_sync_history" DROP COLUMN "dataDomainssynced",
ADD COLUMN     "dataDomainsSynced" TEXT[];

/*
  Warnings:

  - A unique constraint covering the columns `[reportId]` on the table `tickets` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "reportId" TEXT;

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "validated" BOOLEAN NOT NULL DEFAULT false,
    "added_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_items" (
    "id" SERIAL NOT NULL,
    "account_number" TEXT NOT NULL,
    "tx_id" TEXT NOT NULL,
    "operation_type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "auth_date" TIMESTAMP(3) NOT NULL,
    "tx_date" TIMESTAMP(3) NOT NULL,
    "currency" INTEGER NOT NULL,
    "sum" DECIMAL(65,30) NOT NULL,
    "counterparty" TEXT NOT NULL,
    "counterparty_inn" TEXT NOT NULL,
    "counterparty_kpp" TEXT NOT NULL,
    "counterparty_account" TEXT NOT NULL,
    "counterparty_bik" TEXT NOT NULL,
    "corr_account" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "card_no" TEXT NOT NULL,
    "mcc" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,

    CONSTRAINT "report_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tickets_reportId_key" ON "tickets"("reportId");

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_added_by_id_fkey" FOREIGN KEY ("added_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_items" ADD CONSTRAINT "report_items_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

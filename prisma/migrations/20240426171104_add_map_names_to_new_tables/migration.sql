/*
  Warnings:

  - You are about to drop the `Ticket` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TicketReciept` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TicketReciept" DROP CONSTRAINT "TicketReciept_reciept_id_fkey";

-- DropForeignKey
ALTER TABLE "TicketReciept" DROP CONSTRAINT "TicketReciept_ticket_id_fkey";

-- DropTable
DROP TABLE "Ticket";

-- DropTable
DROP TABLE "TicketReciept";

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_reciepts" (
    "ticket_id" TEXT NOT NULL,
    "reciept_id" TEXT NOT NULL,

    CONSTRAINT "ticket_reciepts_pkey" PRIMARY KEY ("ticket_id","reciept_id")
);

-- AddForeignKey
ALTER TABLE "ticket_reciepts" ADD CONSTRAINT "ticket_reciepts_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_reciepts" ADD CONSTRAINT "ticket_reciepts_reciept_id_fkey" FOREIGN KEY ("reciept_id") REFERENCES "reciepts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

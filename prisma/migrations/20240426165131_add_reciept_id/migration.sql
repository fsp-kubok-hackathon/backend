/*
  Warnings:

  - The primary key for the `reciepts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `id` to the `reciepts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "reciepts" DROP CONSTRAINT "reciepts_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "reciepts_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "TicketReciept" ADD CONSTRAINT "TicketReciept_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketReciept" ADD CONSTRAINT "TicketReciept_reciept_id_fkey" FOREIGN KEY ("reciept_id") REFERENCES "reciepts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('PENDING', 'OK', 'FAILED');

-- AlterTable
ALTER TABLE "ticket_reciepts" ADD COLUMN     "reason" TEXT;

-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "status" "TicketStatus" NOT NULL DEFAULT 'PENDING';

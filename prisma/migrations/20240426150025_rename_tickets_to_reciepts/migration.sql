/*
  Warnings:

  - You are about to drop the `tickets` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_user_id_fkey";

-- DropTable
DROP TABLE "tickets";

-- CreateTable
CREATE TABLE "reciepts" (
    "user_id" TEXT NOT NULL,
    "image_name" TEXT NOT NULL,
    "fn" BIGINT NOT NULL,
    "fp" BIGINT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "purpose" TEXT NOT NULL,
    "paid_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "reciepts_pkey" PRIMARY KEY ("user_id","image_name")
);

-- AddForeignKey
ALTER TABLE "reciepts" ADD CONSTRAINT "reciepts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

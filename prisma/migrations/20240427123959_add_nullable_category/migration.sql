-- AlterTable
ALTER TABLE "reciepts" ADD COLUMN     "categoryId" INTEGER;

-- AlterTable
ALTER TABLE "report_items" ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "RecieptCategory" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "RecieptCategory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "reciepts" ADD CONSTRAINT "reciepts_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "RecieptCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

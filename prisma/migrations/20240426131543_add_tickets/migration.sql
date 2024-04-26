-- CreateTable
CREATE TABLE "tickets" (
    "user_id" TEXT NOT NULL,
    "image_name" TEXT NOT NULL,
    "fn" BIGINT NOT NULL,
    "fp" BIGINT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "purpose" TEXT NOT NULL,
    "paid_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("user_id","image_name")
);

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

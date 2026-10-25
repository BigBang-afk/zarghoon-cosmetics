-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isSample" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "StoreSettings" ADD COLUMN     "sampleProductsSeededAt" TIMESTAMP(3);

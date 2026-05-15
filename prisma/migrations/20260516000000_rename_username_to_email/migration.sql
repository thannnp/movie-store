-- AlterTable: rename username to email
ALTER TABLE "users" ADD COLUMN "email" TEXT;

-- Populate email from existing username values (temporary data)
UPDATE "users" SET "email" = username || '@example.com' WHERE "email" IS NULL;

-- Make email NOT NULL
ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL;

-- Add unique constraint
ALTER TABLE "users" ADD CONSTRAINT "users_email_key" UNIQUE ("email");

-- Drop old username column
ALTER TABLE "users" DROP COLUMN "username";

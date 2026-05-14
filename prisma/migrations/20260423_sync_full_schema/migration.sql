-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'CLIENT');

-- AlterTable User
ALTER TABLE "User" ADD COLUMN "role" "Role" NOT NULL DEFAULT 'CLIENT',
ADD COLUMN "bio" TEXT DEFAULT 'Research Collaborator',
ADD COLUMN "image" TEXT,
ADD COLUMN "emailNotify" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "desktopNotify" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable Client
ALTER TABLE "Client" ADD COLUMN "company" TEXT,
ADD COLUMN "address" TEXT,
ADD COLUMN "userId" TEXT UNIQUE;

-- AlterTable Project
ALTER TABLE "Project" ADD COLUMN "category" TEXT DEFAULT 'Web Development',
ADD COLUMN "progress" INTEGER NOT NULL DEFAULT 0;

-- AlterTable Task
ALTER TABLE "Task" ADD COLUMN "priority" TEXT DEFAULT 'MEDIUM';

-- AlterTable Invoice
ALTER TABLE "Invoice" ADD COLUMN "invoiceNo" TEXT UNIQUE,
ADD COLUMN "tax" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN "total" DOUBLE PRECISION;

-- CreateTable ResearchData
CREATE TABLE "ResearchData" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "fileUrl" TEXT,
    "tags" TEXT[],
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResearchData_pkey" PRIMARY KEY ("id")
);

-- CreateTable Notification
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchData" ADD CONSTRAINT "ResearchData_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

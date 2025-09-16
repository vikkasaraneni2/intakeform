-- CreateEnum
CREATE TYPE "public"."IntakeStatus" AS ENUM ('NEW', 'SCHEDULED', 'COMPLETED', 'CANCELED');

-- CreateEnum
CREATE TYPE "public"."VisitType" AS ENUM ('WALKTHROUGH_V1');

-- CreateEnum
CREATE TYPE "public"."ActivityType" AS ENUM ('page_view', 'intake_submitted', 'schedule_booked');

-- CreateTable
CREATE TABLE "public"."Account" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActivityAt" TIMESTAMP(3),
    "intakeCount" INTEGER NOT NULL DEFAULT 0,
    "visitCount" INTEGER NOT NULL DEFAULT 0,
    "bookedCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Contact" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Intake" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "public"."IntakeStatus" NOT NULL DEFAULT 'NEW',
    "scheduledAt" TIMESTAMP(3),
    "company" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "siteAddress" TEXT NOT NULL,
    "siteHours" TEXT,
    "roofAccess" TEXT,
    "accessNotes" TEXT,
    "recentOutages" TEXT,
    "brokerContact" TEXT,
    "ppeRequired" BOOLEAN,
    "escortRequired" BOOLEAN,
    "photoPermission" BOOLEAN,
    "notes" TEXT,
    "source" TEXT,
    "leadScore" TEXT,

    CONSTRAINT "Intake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Visit" (
    "id" TEXT NOT NULL,
    "intakeId" TEXT NOT NULL,
    "type" "public"."VisitType" NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "assignee" TEXT,
    "notes" TEXT,
    "slotId" TEXT,

    CONSTRAINT "Visit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Activity" (
    "id" TEXT NOT NULL,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT NOT NULL,
    "type" "public"."ActivityType" NOT NULL,
    "path" TEXT NOT NULL,
    "referrer" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "ua" TEXT,
    "ipHash" TEXT,
    "accountId" TEXT,
    "contactId" TEXT,
    "intakeId" TEXT,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AvailabilitySlot" (
    "id" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "bookedCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AvailabilitySlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Contact_email_key" ON "public"."Contact"("email");

-- CreateIndex
CREATE INDEX "Intake_company_idx" ON "public"."Intake"("company");

-- CreateIndex
CREATE INDEX "Intake_createdAt_idx" ON "public"."Intake"("createdAt");

-- CreateIndex
CREATE INDEX "Activity_type_ts_idx" ON "public"."Activity"("type", "ts");

-- CreateIndex
CREATE INDEX "Activity_sessionId_idx" ON "public"."Activity"("sessionId");

-- CreateIndex
CREATE INDEX "AvailabilitySlot_startTime_idx" ON "public"."AvailabilitySlot"("startTime");

-- AddForeignKey
ALTER TABLE "public"."Contact" ADD CONSTRAINT "Contact_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Intake" ADD CONSTRAINT "Intake_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Intake" ADD CONSTRAINT "Intake_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "public"."Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Visit" ADD CONSTRAINT "Visit_intakeId_fkey" FOREIGN KEY ("intakeId") REFERENCES "public"."Intake"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Visit" ADD CONSTRAINT "Visit_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "public"."AvailabilitySlot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Activity" ADD CONSTRAINT "Activity_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Activity" ADD CONSTRAINT "Activity_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "public"."Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Activity" ADD CONSTRAINT "Activity_intakeId_fkey" FOREIGN KEY ("intakeId") REFERENCES "public"."Intake"("id") ON DELETE SET NULL ON UPDATE CASCADE;

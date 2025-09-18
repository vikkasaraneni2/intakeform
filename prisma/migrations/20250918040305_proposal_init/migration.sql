-- CreateTable
CREATE TABLE "public"."Proposal" (
    "id" TEXT NOT NULL,
    "intakeId" TEXT NOT NULL,
    "proposalNo" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pdfUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EquipmentEstimate" (
    "id" TEXT NOT NULL,
    "intakeId" TEXT NOT NULL,
    "panels100A" INTEGER NOT NULL DEFAULT 0,
    "panels200A" INTEGER NOT NULL DEFAULT 0,
    "transformers45_75" INTEGER NOT NULL DEFAULT 0,
    "switchgear2000A" INTEGER NOT NULL DEFAULT 0,
    "customJson" TEXT,
    "reportOverheadPct" DOUBLE PRECISION NOT NULL DEFAULT 0.30,
    "mobilizationHours" DOUBLE PRECISION NOT NULL DEFAULT 2,
    "blendedRatePerHour" DOUBLE PRECISION NOT NULL DEFAULT 190.6,
    "computedHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "computedPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EquipmentEstimate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pricing_coefficients" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "panel100AHours" DOUBLE PRECISION NOT NULL DEFAULT 0.75,
    "panel200AHours" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "transformer45_75H" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "switchgear2000AH" DOUBLE PRECISION NOT NULL DEFAULT 4.0,
    "reportOverheadPct" DOUBLE PRECISION NOT NULL DEFAULT 0.30,
    "mobilizationHours" DOUBLE PRECISION NOT NULL DEFAULT 2.0,
    "workdayHours" INTEGER NOT NULL DEFAULT 8,

    CONSTRAINT "pricing_coefficients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Proposal_proposalNo_idx" ON "public"."Proposal"("proposalNo");

-- CreateIndex
CREATE UNIQUE INDEX "Proposal_intakeId_version_key" ON "public"."Proposal"("intakeId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "EquipmentEstimate_intakeId_key" ON "public"."EquipmentEstimate"("intakeId");

-- AddForeignKey
ALTER TABLE "public"."Proposal" ADD CONSTRAINT "Proposal_intakeId_fkey" FOREIGN KEY ("intakeId") REFERENCES "public"."Intake"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EquipmentEstimate" ADD CONSTRAINT "EquipmentEstimate_intakeId_fkey" FOREIGN KEY ("intakeId") REFERENCES "public"."Intake"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

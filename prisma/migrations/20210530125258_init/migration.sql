-- CreateTable
CREATE TABLE "User" (
    "Id" BIGSERIAL NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "UserName" TEXT NOT NULL,
    "Email" TEXT,
    "Name" TEXT,
    "Surname" TEXT,
    "PodUserId" INTEGER NOT NULL,
    "PodContactId" INTEGER,
    "ProfileImage" TEXT,
    "PhoneNumber" VARCHAR(32),
    "LocalToken" TEXT,
    "TokenExpiresAt" TIMESTAMP(3),
    "RefreshToken" TEXT,
    "Role" TEXT NOT NULL DEFAULT E'user',
    "SSOProfile" JSONB NOT NULL,
    "Tokens" JSONB NOT NULL,

    PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "TargetDefinitions" (
    "Id" BIGSERIAL NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "Type" TEXT NOT NULL,
    "AnswerCount" INTEGER NOT NULL,
    "DatasetId" BIGINT NOT NULL,
    "UMin" DOUBLE PRECISION NOT NULL,
    "T" DOUBLE PRECISION NOT NULL,
    "UMax" DOUBLE PRECISION NOT NULL,
    "BonusFalse" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "BonusTrue" DOUBLE PRECISION NOT NULL DEFAULT 0,

    PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "UserTargets" (
    "Id" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "TargetDefinitionId" BIGINT NOT NULL,
    "OwnerId" BIGINT NOT NULL,

    PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Datasets" (
    "Id" BIGSERIAL NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "Name" TEXT,
    "Description" TEXT,
    "Type" INTEGER NOT NULL,
    "UMin" DOUBLE PRECISION NOT NULL,
    "T" DOUBLE PRECISION NOT NULL,
    "UMax" DOUBLE PRECISION NOT NULL,
    "LabelingStatus" INTEGER NOT NULL,
    "AnswerType" INTEGER NOT NULL DEFAULT 0,
    "FieldName" VARCHAR(255),
    "IsActive" BOOLEAN NOT NULL DEFAULT false,
    "QuestionType" INTEGER NOT NULL DEFAULT 0,
    "QuestionSrc" TEXT,
    "QuestionTemplate" TEXT,
    "ItemSourcePath" TEXT,
    "ProcessedItemsSourcePath" TEXT,
    "AnswerBudgetCountPerUser" INTEGER NOT NULL DEFAULT 0,
    "CorrectROUTERldenAnswerIndex" INTEGER NOT NULL DEFAULT 0,
    "AnswerReplicationCount" INTEGER NOT NULL DEFAULT 0,
    "TotalBudget" DECIMAL(18,2) NOT NULL DEFAULT 0.0,

    PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "DatasetItems" (
    "Id" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "Name" TEXT NOT NULL,
    "Type" INTEGER NOT NULL,
    "FileExtension" VARCHAR(30) NOT NULL,
    "FileName" TEXT NOT NULL,
    "FilePath" TEXT NOT NULL,
    "FileSize" INTEGER NOT NULL,
    "LabelId" BIGINT,
    "FinalLabelId" BIGINT,
    "IsGoldenData" BOOLEAN NOT NULL,
    "DatasetId" BIGINT NOT NULL,

    PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Labels" (
    "Id" BIGSERIAL NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "Name" TEXT NOT NULL,
    "DatasetId" BIGINT NOT NULL,
    "DatasetItemId" TEXT,

    PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "DatasetItemLabels" (
    "Id" BIGSERIAL NOT NULL,
    "LabelId" BIGINT NOT NULL,
    "DatasetItemId" TEXT NOT NULL,

    PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "AnswerOptions" (
    "Id" BIGSERIAL NOT NULL,
    "Type" INTEGER NOT NULL,
    "Title" TEXT,
    "Src" TEXT,
    "Index" INTEGER NOT NULL,
    "DataSetId" BIGINT NOT NULL,

    PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Transactions" (
    "Id" BIGSERIAL NOT NULL,
    "OwnerId" BIGINT NOT NULL,
    "DebitAmount" DOUBLE PRECISION NOT NULL,
    "CreditAmount" DOUBLE PRECISION NOT NULL,
    "Reason" INTEGER NOT NULL,
    "ReasonDescription" TEXT,
    "ReferenceDataSetId" BIGINT,

    PRIMARY KEY ("Id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User.UserName_unique" ON "User"("UserName");

-- CreateIndex
CREATE UNIQUE INDEX "User.Email_unique" ON "User"("Email");

-- CreateIndex
CREATE UNIQUE INDEX "User.PodUserId_unique" ON "User"("PodUserId");

-- CreateIndex
CREATE UNIQUE INDEX "User.LocalToken_unique" ON "User"("LocalToken");

-- CreateIndex
CREATE UNIQUE INDEX "TargetDefinitions.Type_unique" ON "TargetDefinitions"("Type");

-- CreateIndex
CREATE UNIQUE INDEX "AnswerOptions_DataSetId_unique" ON "AnswerOptions"("DataSetId");

-- AddForeignKey
ALTER TABLE "DatasetItems" ADD FOREIGN KEY ("DatasetId") REFERENCES "Datasets"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD FOREIGN KEY ("OwnerId") REFERENCES "User"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD FOREIGN KEY ("ReferenceDataSetId") REFERENCES "Datasets"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Labels" ADD FOREIGN KEY ("DatasetId") REFERENCES "Datasets"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Labels" ADD FOREIGN KEY ("DatasetItemId") REFERENCES "DatasetItems"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatasetItemLabels" ADD FOREIGN KEY ("LabelId") REFERENCES "Labels"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatasetItemLabels" ADD FOREIGN KEY ("DatasetItemId") REFERENCES "DatasetItems"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTargets" ADD FOREIGN KEY ("TargetDefinitionId") REFERENCES "TargetDefinitions"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTargets" ADD FOREIGN KEY ("OwnerId") REFERENCES "User"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerOptions" ADD FOREIGN KEY ("DataSetId") REFERENCES "Datasets"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TargetDefinitions" ADD FOREIGN KEY ("DatasetId") REFERENCES "Datasets"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

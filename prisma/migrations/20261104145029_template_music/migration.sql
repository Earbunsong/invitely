-- CreateTable
CREATE TABLE "TemplateMusic" (
    "templateId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TemplateMusic_pkey" PRIMARY KEY ("templateId")
);

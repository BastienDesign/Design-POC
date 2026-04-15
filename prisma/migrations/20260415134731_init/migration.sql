-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('Admin', 'Editor', 'Viewer', 'Analyst');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'invited');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('down', 'up', 'redirected', 'unknown');

-- CreateEnum
CREATE TYPE "LabelType" AS ENUM ('counterfeit', 'legitimate', 'suspicious', 'trademark_infringement', 'unlabeled');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('image', 'video');

-- CreateEnum
CREATE TYPE "MediaLabel" AS ENUM ('counterfeit', 'suspicious', 'legitimate', 'unlabeled');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubOrganization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "count" INTEGER,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "SubOrganization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subtitle" TEXT,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'Viewer',
    "roleLabel" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "lastLogin" TEXT,
    "initials" TEXT,
    "avatarUrl" TEXT,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "keyword" TEXT,
    "imageUrl" TEXT,
    "status" "PostStatus" NOT NULL DEFAULT 'up',
    "websiteDomain" TEXT NOT NULL,
    "domainCount" INTEGER NOT NULL DEFAULT 0,
    "accountName" TEXT,
    "accountTag" TEXT,
    "accountTagType" TEXT,
    "price" TEXT,
    "pricePct" TEXT,
    "suspiciousCount" INTEGER NOT NULL DEFAULT 0,
    "suspiciousReasons" TEXT,
    "label" "LabelType" NOT NULL DEFAULT 'unlabeled',
    "labelText" TEXT,
    "impactScore" INTEGER NOT NULL DEFAULT 0,
    "bundleItems" INTEGER NOT NULL DEFAULT 0,
    "platformGeo" TEXT,
    "accountGeo" TEXT,
    "daysSinceTakedown" INTEGER,
    "takedownDate" TIMESTAMP(3),
    "validationErrors" TEXT,
    "ipCertificate" TEXT,
    "websiteCategory" TEXT,
    "listedBrand" TEXT,
    "shipsFrom" TEXT,
    "shipsTo" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "daysSinceModeration" INTEGER NOT NULL DEFAULT 0,
    "daysSinceNoticeSent" INTEGER,
    "volumeSold" INTEGER NOT NULL DEFAULT 0,
    "imageReasons" TEXT,
    "stock" TEXT,
    "productCategory" TEXT,
    "crawlingDate" TIMESTAMP(3),
    "lastCreatedDate" TIMESTAMP(3),
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "relatedDomains" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "label" "MediaLabel" NOT NULL DEFAULT 'unlabeled',
    "subtitlesUrl" TEXT,
    "postId" TEXT NOT NULL,
    "parentMediaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "parentPostId" TEXT NOT NULL,
    "parentPostTitle" TEXT,
    "postsCount" INTEGER NOT NULL DEFAULT 0,
    "accountsCount" INTEGER NOT NULL DEFAULT 0,
    "websitesCount" INTEGER NOT NULL DEFAULT 0,
    "label" "MediaLabel" NOT NULL DEFAULT 'unlabeled',
    "labelText" TEXT,
    "firstSeen" TIMESTAMP(3),
    "similarity" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Website" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "topLevelDomain" TEXT,
    "category" TEXT,
    "creationDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "registrar" TEXT,
    "domainContact" TEXT,
    "metaKeywords" TEXT,
    "description" TEXT,
    "hostingProvider" TEXT,
    "abuseContact" TEXT,
    "estimatedGeo" TEXT,
    "dnsProvider" TEXT,
    "emailInfra" TEXT,
    "riskScore" INTEGER NOT NULL DEFAULT 0,
    "globalRank" TEXT,
    "firstDetected" TIMESTAMP(3),
    "lastCrawled" TIMESTAMP(3),
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Website_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "accountTag" TEXT,
    "tagType" TEXT,
    "platform" TEXT,
    "geo" TEXT,
    "postsCount" INTEGER NOT NULL DEFAULT 0,
    "riskScore" INTEGER NOT NULL DEFAULT 0,
    "label" "LabelType" NOT NULL DEFAULT 'unlabeled',
    "labelText" TEXT,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SubOrganization_organizationId_idx" ON "SubOrganization"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Post_postId_key" ON "Post"("postId");

-- CreateIndex
CREATE INDEX "Post_organizationId_idx" ON "Post"("organizationId");

-- CreateIndex
CREATE INDEX "Post_label_idx" ON "Post"("label");

-- CreateIndex
CREATE INDEX "Post_status_idx" ON "Post"("status");

-- CreateIndex
CREATE INDEX "Post_websiteDomain_idx" ON "Post"("websiteDomain");

-- CreateIndex
CREATE INDEX "Media_postId_idx" ON "Media"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "Image_imageId_key" ON "Image"("imageId");

-- CreateIndex
CREATE INDEX "Image_parentPostId_idx" ON "Image"("parentPostId");

-- CreateIndex
CREATE INDEX "Image_label_idx" ON "Image"("label");

-- CreateIndex
CREATE UNIQUE INDEX "Website_domain_key" ON "Website"("domain");

-- CreateIndex
CREATE INDEX "Website_organizationId_idx" ON "Website"("organizationId");

-- CreateIndex
CREATE INDEX "Account_organizationId_idx" ON "Account"("organizationId");

-- CreateIndex
CREATE INDEX "Account_accountName_idx" ON "Account"("accountName");

-- AddForeignKey
ALTER TABLE "SubOrganization" ADD CONSTRAINT "SubOrganization_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_parentMediaId_fkey" FOREIGN KEY ("parentMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_parentPostId_fkey" FOREIGN KEY ("parentPostId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Website" ADD CONSTRAINT "Website_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

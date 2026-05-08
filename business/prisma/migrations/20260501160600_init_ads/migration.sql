-- CreateTable
CREATE TABLE "ads" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceUrl" TEXT NOT NULL,
    "createdByUserId" INTEGER,
    "brand" TEXT,
    "model" TEXT,
    "year" INTEGER,
    "mileage" INTEGER,
    "price" REAL,
    "currency" TEXT,
    "fuel" TEXT,
    "transmission" TEXT,
    "bodyType" TEXT,
    "vin" TEXT,
    "site" TEXT,
    "parserVersion" TEXT,
    "rawPayload" TEXT,
    "parsedAt" DATETIME,
    "lastFetchedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "ads_sourceUrl_key" ON "ads"("sourceUrl");

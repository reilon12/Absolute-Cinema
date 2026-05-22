-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'CLIENT',
    "cinemaId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_cinemaId_fkey" FOREIGN KEY ("cinemaId") REFERENCES "Cinema" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Cinema" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Movie" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "rating" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "cinemaId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Movie_cinemaId_fkey" FOREIGN KEY ("cinemaId") REFERENCES "Cinema" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Showtime" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "movieId" INTEGER NOT NULL,
    "roomName" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "ticketPrice" REAL NOT NULL,
    "rows" INTEGER NOT NULL DEFAULT 8,
    "cols" INTEGER NOT NULL DEFAULT 10,
    "cinemaId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Showtime_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Showtime_cinemaId_fkey" FOREIGN KEY ("cinemaId") REFERENCES "Cinema" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "showtimeId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "row" INTEGER NOT NULL,
    "col" INTEGER NOT NULL,
    "seatLabel" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "pricePaid" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Ticket_showtimeId_fkey" FOREIGN KEY ("showtimeId") REFERENCES "Showtime" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Cinema_slug_key" ON "Cinema"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_showtimeId_row_col_key" ON "Ticket"("showtimeId", "row", "col");

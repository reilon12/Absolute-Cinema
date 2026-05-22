const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding database...');

  // Clean up database
  await prisma.ticket.deleteMany({});
  await prisma.showtime.deleteMany({});
  await prisma.movie.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.cinema.deleteMany({});

  // 1. Create Cinema
  const centralCinema = await prisma.cinema.create({
    data: {
      name: 'Absolute Cinema Central',
      slug: 'central',
      address: 'Av. Corrientes 1234, Buenos Aires',
    },
  });
  console.log(`Created Cinema: ${centralCinema.name}`);

  // 2. Create Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const clientPassword = await bcrypt.hash('client123', 10);

  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin Absolute',
      email: 'admin@absolute.com',
      password: adminPassword,
      role: 'ADMIN',
      cinemaId: centralCinema.id,
    },
  });

  const clientUser = await prisma.user.create({
    data: {
      name: 'Julio Cliente',
      email: 'client@absolute.com',
      password: clientPassword,
      role: 'CLIENT',
    },
  });

  console.log(`Created users: Admin (${adminUser.email}), Client (${clientUser.email})`);

  // 3. Create Movies
  const movie1 = await prisma.movie.create({
    data: {
      title: 'Inception',
      description: 'Un ladrón que roba secretos corporativos a través del uso de la tecnología de compartir sueños recibe la tarea inversa de plantar una idea en la mente de un director ejecutivo.',
      duration: 148,
      rating: 'PG-13',
      genre: 'Ciencia Ficción / Acción',
      imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80', // Cinema aesthetic
      cinemaId: centralCinema.id,
    },
  });

  const movie2 = await prisma.movie.create({
    data: {
      title: 'Spider-Man: Across the Spider-Verse',
      description: 'Miles Morales se catapulta a través del Multiverso, donde se encuentra con un equipo de Spider-People encargados de proteger su propia existencia.',
      duration: 140,
      rating: 'PG',
      genre: 'Animación / Aventura',
      imageUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=600&q=80',
      cinemaId: centralCinema.id,
    },
  });

  const movie3 = await prisma.movie.create({
    data: {
      title: 'Interstellar',
      description: 'Un equipo de exploradores viaja a través de un agujero de gusano en el espacio en un intento por garantizar la supervivencia de la humanidad.',
      duration: 169,
      rating: 'PG-13',
      genre: 'Ciencia Ficción / Drama',
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
      cinemaId: centralCinema.id,
    },
  });

  console.log('Created Movies');

  // 4. Create Showtimes
  // Today date
  const now = new Date();
  const today18 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0, 0);
  const today21 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 21, 15, 0);
  const tomorrow16 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 16, 30, 0);
  const tomorrow20 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 20, 0, 0);

  const showtime1 = await prisma.showtime.create({
    data: {
      movieId: movie1.id,
      roomName: 'Sala IMAX 3D',
      startTime: today18,
      ticketPrice: 850.0,
      rows: 8,
      cols: 10,
      cinemaId: centralCinema.id,
    },
  });

  const showtime2 = await prisma.showtime.create({
    data: {
      movieId: movie1.id,
      roomName: 'Sala 2 (Standard)',
      startTime: today21,
      ticketPrice: 600.0,
      rows: 6,
      cols: 8,
      cinemaId: centralCinema.id,
    },
  });

  const showtime3 = await prisma.showtime.create({
    data: {
      movieId: movie2.id,
      roomName: 'Sala IMAX 3D',
      startTime: tomorrow16,
      ticketPrice: 900.0,
      rows: 8,
      cols: 10,
      cinemaId: centralCinema.id,
    },
  });

  const showtime4 = await prisma.showtime.create({
    data: {
      movieId: movie3.id,
      roomName: 'Sala 1 (Atmos VIP)',
      startTime: tomorrow20,
      ticketPrice: 1200.0,
      rows: 6,
      cols: 6,
      cinemaId: centralCinema.id,
    },
  });

  console.log('Created Showtimes');

  // 5. Create some pre-booked tickets for showtime1 (Inception today 18:00)
  // Let's book seat B-4 (row 1, col 3), B-5 (row 1, col 4), D-6 (row 3, col 5)
  // Row and col are 0-indexed
  await prisma.ticket.createMany({
    data: [
      {
        showtimeId: showtime1.id,
        userId: clientUser.id,
        row: 1,
        col: 3,
        seatLabel: 'B-4',
        pricePaid: showtime1.ticketPrice,
      },
      {
        showtimeId: showtime1.id,
        userId: clientUser.id,
        row: 1,
        col: 4,
        seatLabel: 'B-5',
        pricePaid: showtime1.ticketPrice,
      },
      {
        showtimeId: showtime1.id,
        userId: clientUser.id,
        row: 3,
        col: 5,
        seatLabel: 'D-6',
        pricePaid: showtime1.ticketPrice,
      },
    ],
  });

  console.log('Seeded tickets successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

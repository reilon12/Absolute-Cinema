const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding database...');

  // Clean up database
  await prisma.reviewLike.deleteMany({});
  await prisma.requestVote.deleteMany({});
  await prisma.userReward.deleteMany({});
  await prisma.userBadge.deleteMany({});
  await prisma.socialActivity.deleteMany({});
  await prisma.follow.deleteMany({});
  await prisma.movieRequest.deleteMany({});
  await prisma.watchlistItem.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.showtime.deleteMany({});
  await prisma.movie.deleteMany({});
  await prisma.reward.deleteMany({});
  await prisma.badge.deleteMany({});
  await prisma.event.deleteMany({});
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
      genres: ['Ciencia Ficción', 'Acción', 'Thriller'],
      imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
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
      genres: ['Animación', 'Aventura', 'Superhéroes'],
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
      genres: ['Ciencia Ficción', 'Drama', 'Aventura'],
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
      cinemaId: centralCinema.id,
    },
  });

  console.log('Created Movies');

  const [badgeFirstReview, badgeWatchlistStarter, badgeSocial] = await Promise.all([
    prisma.badge.create({
      data: {
        id: 'first_review',
        name: 'Primera Reseña',
        description: 'Escribe tu primera reseña y gana reconocimiento cinematográfico.',
        icon: '📝',
        xpReward: 50,
      },
    }),
    prisma.badge.create({
      data: {
        id: 'watchlist_starter',
        name: 'Watchlist Premier',
        description: 'Agrega tu primera película a la Watchlist.',
        icon: '🎬',
        xpReward: 20,
      },
    }),
    prisma.badge.create({
      data: {
        id: 'social_stalker',
        name: 'Cine Social',
        description: 'Comparte actividad social y conéctate con otros cinéfilos.',
        icon: '🌐',
        xpReward: 30,
      },
    }),
  ]);

  const [rewardPopcorn, rewardUpgrade, rewardPass] = await Promise.all([
    prisma.reward.create({
      data: {
        id: 'discount_popcorn',
        name: 'Popcorn Premium',
        description: '10% de descuento en combos de pochoclos en tu próxima función.',
        cost: 100,
        imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
      },
    }),
    prisma.reward.create({
      data: {
        id: 'free_upgrade',
        name: 'Upgrade de Sala',
        description: 'Obtén un upgrade a una sala premium para tu próxima compra.',
        cost: 250,
        imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80',
      },
    }),
    prisma.reward.create({
      data: {
        id: 'member_pass',
        name: 'Pase VIP Semanal',
        description: 'Accede a descuentos exclusivos durante una semana.',
        cost: 450,
        imageUrl: 'https://images.unsplash.com/photo-1523731407965-2430cd12f5e4?auto=format&fit=crop&w=600&q=80',
      },
    }),
  ]);

  const now = new Date();

  const specialEvent = await prisma.event.create({
    data: {
      title: 'Noche de Cine Premium',
      slug: 'noche-de-cine-premium',
      description: 'Una experiencia inmersiva con avance exclusivo y premios para los mejores fans.',
      category: 'Especial',
      startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 20, 0, 0),
      endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 23, 0, 0),
      imageUrl: 'https://images.unsplash.com/photo-1517602302552-471fe67acf66?auto=format&fit=crop&w=800&q=80',
      isOnline: false,
      status: 'ACTIVE',
    },
  });

  const watchlistItem = await prisma.watchlistItem.create({
    data: {
      user: { connect: { id: clientUser.id } },
      movie: { connect: { id: movie1.id } },
      isFavorite: true,
      status: 'WATCHED',
    },
  });

  const review1 = await prisma.review.create({
    data: {
      rating: 5,
      comment: 'Una experiencia visual y emocional increíble con giros de narrativa impecables.',
      user: { connect: { id: clientUser.id } },
      movie: { connect: { id: movie1.id } },
    },
  });

  await prisma.userBadge.create({
    data: {
      user: { connect: { id: clientUser.id } },
      badge: { connect: { id: badgeFirstReview.id } },
    },
  });

  await prisma.socialActivity.create({
    data: {
      user: { connect: { id: clientUser.id } },
      type: 'REVIEW',
      movie: { connect: { id: movie1.id } },
      content: 'Acabo de escribir una reseña de Inception. Un viaje imperdible.',
    },
  });

  const movieRequest = await prisma.movieRequest.create({
    data: {
      movie: { connect: { id: movie3.id } },
      createdBy: { connect: { id: clientUser.id } },
      reason: 'Deseo una función especial con Interstellar para experimentar la banda sonora en vivo.',
    },
  });

  await prisma.requestVote.create({
    data: {
      request: { connect: { id: movieRequest.id } },
      user: { connect: { id: clientUser.id } },
    },
  });

  console.log('Created Movies and SaaS starter content');

  // 4. Create Showtimes
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

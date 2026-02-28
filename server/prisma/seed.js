require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("123456", 6);

  // Hapus data lama (untuk dev - fresh seed)
  await prisma.booking.deleteMany();
  await prisma.passwordReset.deleteMany();
  await prisma.bus.deleteMany();
  await prisma.user.deleteMany();

  // === USERS ===
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: "Admin Sistem",
        email: "admin@test.com",
        password: hashedPassword,
        isAdmin: true,
      },
    }),
    prisma.user.create({
      data: {
        name: "Budi Santoso",
        email: "user@test.com",
        password: hashedPassword,
        isAdmin: false,
      },
    }),
    prisma.user.create({
      data: {
        name: "Siti Aminah",
        email: "siti@test.com",
        password: hashedPassword,
        isAdmin: false,
      },
    }),
    prisma.user.create({
      data: {
        name: "Ahmad Rizki",
        email: "ahmad@test.com",
        password: hashedPassword,
        isAdmin: false,
      },
    }),
    prisma.user.create({
      data: {
        name: "Dewi Lestari",
        email: "dewi@test.com",
        password: hashedPassword,
        isAdmin: false,
      },
    }),
  ]);
  console.log("Users:", users.length);

  // === BUSES ===
  const today = new Date();
  const dates = [
    today.toISOString().split("T")[0],
    new Date(today.getTime() + 86400000).toISOString().split("T")[0],
    new Date(today.getTime() + 172800000).toISOString().split("T")[0],
  ];

  const busData = [
    { name: "Sinar Jaya", busNumber: 101, from: "Jakarta", to: "Semarang", departure: "06:00", arrival: "12:00", capacity: 30, price: 180000 },
    { name: "Sinar Jaya", busNumber: 102, from: "Jakarta", to: "Semarang", departure: "14:00", arrival: "20:00", capacity: 30, price: 180000 },
    { name: "Pahala Kencana", busNumber: 201, from: "Jakarta", to: "Tegal", departure: "08:00", arrival: "14:00", capacity: 25, price: 150000 },
    { name: "Pahala Kencana", busNumber: 202, from: "Tegal", to: "Jakarta", departure: "09:00", arrival: "15:00", capacity: 25, price: 150000 },
    { name: "Eka", busNumber: 301, from: "Semarang", to: "Jakarta", departure: "07:00", arrival: "13:00", capacity: 35, price: 200000 },
    { name: "Eka", busNumber: 302, from: "Jakarta", to: "Semarang", departure: "10:00", arrival: "16:00", capacity: 35, price: 200000 },
    { name: "Lorena", busNumber: 401, from: "Jakarta", to: "Bekasi", departure: "05:30", arrival: "06:30", capacity: 20, price: 25000 },
    { name: "Lorena", busNumber: 402, from: "Bekasi", to: "Jakarta", departure: "07:00", arrival: "08:00", capacity: 20, price: 25000 },
    { name: "Safari Dharma", busNumber: 501, from: "Semarang", to: "Tegal", departure: "11:00", arrival: "14:00", capacity: 28, price: 80000 },
    { name: "Safari Dharma", busNumber: 502, from: "Tegal", to: "Semarang", departure: "15:00", arrival: "18:00", capacity: 28, price: 80000 },
  ];

  const buses = [];
  for (const bus of busData) {
    for (const journeyDate of dates) {
      buses.push({
        ...bus,
        journeyDate,
        seatsBooked: [],
        status: "Yet to start",
      });
    }
  }
  await prisma.bus.createMany({ data: buses });
  const allBuses = await prisma.bus.findMany({ take: 15 });
  console.log("Buses:", buses.length);

  // === BOOKINGS ===
  const regularUsers = users.filter((u) => !u.isAdmin);
  const bookingsData = [];
  for (let i = 0; i < Math.min(8, allBuses.length); i++) {
    const bus = allBuses[i];
    const user = regularUsers[i % regularUsers.length];
    const seats = [1 + (i % 5), 2 + (i % 5)];
    bookingsData.push({
      busId: bus.id,
      userId: user.id,
      seats,
      transactionId: uuidv4(),
    });
  }

  for (const b of bookingsData) {
    const bus = await prisma.bus.findUnique({ where: { id: b.busId } });
    let currentSeats = bus.seatsBooked;
    if (!Array.isArray(currentSeats)) {
      try {
        currentSeats = typeof currentSeats === "string" ? JSON.parse(currentSeats) : [];
      } catch {
        currentSeats = [];
      }
    }
    await prisma.booking.create({ data: b });
    await prisma.bus.update({
      where: { id: b.busId },
      data: { seatsBooked: [...currentSeats, ...b.seats] },
    });
  }
  console.log("Bookings:", bookingsData.length);

  console.log("\n✅ Seed selesai!");
  console.log("--- Login ---");
  console.log("Admin: admin@test.com / 123456");
  console.log("User:  user@test.com / 123456");
  console.log("User:  siti@test.com / 123456");
  console.log("User:  ahmad@test.com / 123456");
  console.log("User:  dewi@test.com / 123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("PostgreSQL Connection Successful");
  } catch (err) {
    console.error("PostgreSQL Connection Failed:", err);
    process.exit(1);
  }
};

module.exports = { prisma, connectDB };

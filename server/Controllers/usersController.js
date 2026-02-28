const { prisma } = require("../config/dbConfig");

const GetUserById = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.userId },
      select: { id: true, name: true, email: true, isAdmin: true },
    });
    if (!user) {
      return res.send({
        message: "User not found",
        success: false,
        data: null,
      });
    }
    res.send({
      message: "User fetched successfully",
      success: true,
      data: user,
    });
  } catch (error) {
    res.send({
      message: error.message,
      success: false,
      data: null,
    });
  }
};

const getAllClients = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { isAdmin: false },
      select: { id: true, name: true, email: true, isAdmin: true },
    });
    res.send({
      message: "Users fetched successfully",
      success: true,
      data: users,
    });
  } catch (error) {
    res.send({
      message: error.message,
      success: false,
      data: null,
    });
  }
};

module.exports = { GetUserById, getAllClients };

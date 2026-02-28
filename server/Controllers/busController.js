const { prisma } = require("../config/dbConfig");

const parseSeatsBooked = (val) => {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const AddBus = async (req, res) => {
  try {
    const existingBus = await prisma.bus.findFirst({
      where: { busNumber: req.body.busNumber },
    });
    if (existingBus) {
      return res.send({
        message: "Bus already exists",
        success: false,
        data: null,
      });
    }
    await prisma.bus.create({
      data: {
        ...req.body,
        seatsBooked: req.body.seatsBooked || [],
      },
    });
    res.status(200).send({
      message: "Bus created successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

const GetAllBuses = async (req, res) => {
  try {
    let buses = await prisma.bus.findMany();

    for (const bus of buses) {
      const journey = new Date(bus.journeyDate);
      const departure = new Date(
        `${journey.getFullYear()}-${journey.getMonth() + 1}-${journey.getDate()} ${bus.departure}`
      );
      if (departure.getTime() - new Date().getTime() < 3600000) {
        await prisma.bus.update({
          where: { id: bus.id },
          data: { status: "Completed" },
        });
        bus.status = "Completed";
      }
    }

    const orderedBuses = buses.sort((a, b) => {
      if (a.status === "Completed" && b.status !== "Completed") return 1;
      if (a.status !== "Completed" && b.status === "Completed") return -1;
      return new Date(a.journeyDate) - new Date(b.journeyDate);
    });

    const result = orderedBuses.map((b) => ({
      ...b,
      seatsBooked: parseSeatsBooked(b.seatsBooked),
    }));

    res.status(200).send({
      message: "Buses fetched successfully",
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).send({
      message: "No Buses Found",
      success: false,
      data: error,
    });
  }
};

const GetBusesForHomepage = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    let buses = await prisma.bus.findMany({
      where: {
        journeyDate: { gte: today },
        status: { not: "Completed" },
      },
      orderBy: [{ journeyDate: "asc" }, { departure: "asc" }],
      take: 12,
    });
    const result = buses.map((b) => ({
      ...b,
      seatsBooked: parseSeatsBooked(b.seatsBooked),
    }));
    res.status(200).send({
      message: "Buses fetched successfully",
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).send({
      message: "No Buses Found",
      success: false,
      data: error,
    });
  }
};

const GetBusesByFromAndTo = async (req, res) => {
  try {
    const { from, to, journeyDate } = req.query;
    let buses = await prisma.bus.findMany({
      where: { from, to, journeyDate },
    });

    for (const bus of buses) {
      const journey = new Date(bus.journeyDate);
      const departure = new Date(
        `${journey.getFullYear()}-${journey.getMonth() + 1}-${journey.getDate()} ${bus.departure}`
      );
      if (departure.getTime() - new Date().getTime() < 3600000) {
        await prisma.bus.update({
          where: { id: bus.id },
          data: { status: "Completed" },
        });
        bus.status = "Completed";
      }
    }

    const filteredBuses = buses
      .filter((bus) => bus.status !== "Completed" && bus.status !== "Running")
      .map((b) => ({ ...b, seatsBooked: parseSeatsBooked(b.seatsBooked) }));

    res.status(200).send({
      message: "Buses fetched successfully",
      success: true,
      data: filteredBuses,
    });
  } catch (error) {
    res.status(500).send({
      message: "No Buses Found",
      success: false,
      data: error,
    });
  }
};

const UpdateBus = async (req, res) => {
  const bus = await prisma.bus.findUnique({ where: { id: req.params.id } });
  if (!bus) {
    return res.status(404).send({ message: "Bus not found", success: false });
  }
  if (bus.status === "Completed") {
    return res.status(400).send({
      message: "You can't update a completed bus",
      success: false,
    });
  }
  try {
    await prisma.bus.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.status(200).send({
      message: "Bus updated successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: "Bus not found",
      success: false,
      data: error,
    });
  }
};

const DeleteBus = async (req, res) => {
  try {
    await prisma.bus.delete({ where: { id: req.params.id } });
    res.status(200).send({
      message: "Bus deleted successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

const GetBusById = async (req, res) => {
  try {
    const bus = await prisma.bus.findUnique({ where: { id: req.params.id } });
    if (!bus) {
      return res.status(404).send({ success: false, message: "Bus not found" });
    }
    const result = {
      ...bus,
      seatsBooked: parseSeatsBooked(bus.seatsBooked),
    };
    res.status(200).send({
      message: "Bus fetched successfully",
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

module.exports = {
  AddBus,
  GetAllBuses,
  GetBusesForHomepage,
  UpdateBus,
  DeleteBus,
  GetBusById,
  GetBusesByFromAndTo,
};

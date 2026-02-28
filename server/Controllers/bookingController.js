const { prisma } = require("../config/dbConfig");
const stripe = require("stripe")(process.env.stripe_key);
const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");
const moment = require("moment");
require("dotenv").config();

const hasEmailConfig = process.env.EMAIL && process.env.PASSWORD;
const transporter = hasEmailConfig
  ? nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    })
  : null;

const parseJson = (val) => {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : parsed;
    } catch {
      return [];
    }
  }
  return [];
};

const BookSeat = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { bus: busId, seats } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const bus = await prisma.bus.findUnique({ where: { id: busId } });

    if (!user || !bus) {
      return res.status(404).send({
        message: "User or bus not found",
        success: false,
      });
    }

    const newBooking = await prisma.booking.create({
      data: {
        busId,
        userId,
        seats: seats,
        transactionId: uuidv4(),
      },
    });

    const currentSeats = parseJson(bus.seatsBooked);
    const updatedSeats = [...currentSeats, ...seats];
    await prisma.bus.update({
      where: { id: busId },
      data: { seatsBooked: updatedSeats },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: "Booking Details",
      text: `Hello ${user.name}, your booking details are as follows:
      Bus: ${bus.name}
      Seats: ${seats.join(", ")}
      Departure Time: ${moment(bus.departure, "HH:mm:ss").format("hh:mm A")}
      Arrival Time: ${moment(bus.arrival, "HH:mm:ss").format("hh:mm A")}
      Journey Date: ${bus.journeyDate}
      Total Price: ${bus.price * seats.length} Rupiah
      Thank you for choosing us!`,
    };

    if (transporter) {
      transporter.sendMail(mailOptions, (err) => {
        if (err) console.log("Email bypass - booking confirmation skipped");
        else console.log("Booking confirmation email sent");
      });
    }

    res.status(200).send({
      message: "Seat booked successfully",
      data: { ...newBooking, bus, user },
      user: user.id,
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Booking failed",
      data: error,
      success: false,
    });
  }
};

const GetAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: { bus: true, user: true },
    });
    const result = bookings.map((b) => ({
      ...b,
      seats: parseJson(b.seats),
      bus: { ...b.bus, seatsBooked: parseJson(b.bus.seatsBooked) },
    }));
    res.status(200).send({
      message: "All bookings",
      data: result,
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: "Failed to get bookings",
      data: error,
      success: false,
    });
  }
};

const GetAllBookingsByUser = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.params.user_Id },
      include: { bus: true, user: true },
    });
    const result = bookings.map((b) => ({
      ...b,
      seats: parseJson(b.seats),
      bus: { ...b.bus, seatsBooked: parseJson(b.bus.seatsBooked) },
    }));
    res.status(200).send({
      message: "Bookings fetched successfully",
      data: result,
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: "Bookings fetch failed",
      data: error,
      success: false,
    });
  }
};

const CancelBooking = async (req, res) => {
  try {
    const { booking_id, user_id, bus_id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id: booking_id },
      include: { bus: true },
    });

    if (!booking) {
      return res.status(404).send({
        message: "Booking not found",
        success: false,
      });
    }

    const seatsToRemove = parseJson(booking.seats);
    const currentSeats = parseJson(booking.bus.seatsBooked);
    const updatedSeats = currentSeats.filter((s) => !seatsToRemove.includes(s));

    await prisma.booking.delete({ where: { id: booking_id } });
    await prisma.bus.update({
      where: { id: bus_id },
      data: { seatsBooked: updatedSeats },
    });

    res.status(200).send({
      message: "Booking cancelled successfully",
      data: booking,
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: "Booking cancellation failed",
      data: error,
      success: false,
    });
  }
};

const PayWithStripe = async (req, res) => {
  try {
    const { token, amount } = req.body;
    const customer = await stripe.customers.create({
      email: token.email,
      source: token.id,
    });
    const payment = await stripe.charges.create(
      {
        amount: amount * 100,
        currency: "gbp",
        customer: customer.id,
        receipt_email: token.email,
      },
      { idempotencyKey: uuidv4() }
    );

    if (payment) {
      res.status(200).send({
        message: "Payment successful",
        data: { transactionId: payment.source.id },
        success: true,
        amount: payment.amount,
      });
    } else {
      res.status(500).send({
        message: "Payment failed",
        success: false,
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Payment failed",
      data: error,
      success: false,
    });
  }
};

module.exports = {
  BookSeat,
  GetAllBookings,
  GetAllBookingsByUser,
  CancelBooking,
  PayWithStripe,
};

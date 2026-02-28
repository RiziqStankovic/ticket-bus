const { prisma } = require("../config/dbConfig");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

const hasEmailConfig = process.env.EMAIL && process.env.PASSWORD;
let transporter = null;
if (hasEmailConfig) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });
  transporter.verify(() => {}); // Bypass - skip verify, jalankan saja
} else {
  console.log("Email bypass - EMAIL/PASSWORD tidak di-set");
}

const CreateUser = async (req, res) => {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: req.body.email.toLowerCase() },
    });
    if (existingUser) {
      return res.send({
        message: "User already exists",
        success: false,
        data: null,
      });
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 6);
    await prisma.user.create({
      data: {
        name: req.body.name,
        email: req.body.email.toLowerCase(),
        password: hashedPassword,
      },
    });
    res.send({
      message: "User created successfully",
      success: true,
      data: null,
    });
  } catch (error) {
    console.log(error);
    res.send({
      message: error.message,
      success: false,
      data: null,
    });
  }
};

const Login = async (req, res) => {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: req.body.email.toLowerCase() },
    });
    if (!existingUser) {
      return res.send({
        message: "User does not exist",
        success: false,
        data: null,
      });
    }
    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      existingUser.password
    );
    if (!isPasswordCorrect) {
      return res.send({
        message: "Incorrect password",
        success: false,
        data: null,
      });
    }

    const token = jwt.sign(
      { userId: existingUser.id },
      process.env.jwt_secret,
      { expiresIn: "24h" }
    );
    res.send({
      message: "User logged in successfully",
      success: true,
      data: token,
      user: {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        isAdmin: existingUser.isAdmin,
      },
    });
  } catch (error) {
    res.send({
      message: error.message,
      success: false,
      data: null,
    });
  }
};

const ResetPassword = async (req, res) => {
  const { email } = req.body;
  const redirectUrl = `${FRONTEND_URL}/reset-password`;

  try {
    const users = await prisma.user.findMany({
      where: { email: email.toLowerCase() },
    });
    if (users.length === 0) {
      return res.status(400).send({
        status: "FAILED",
        message: "Email does not exist",
      });
    }
    await sendResetEmail(users[0], redirectUrl, res);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "FAILED",
      message: "Something went wrong",
    });
  }
};

const sendResetEmail = async ({ id, email, name }, redirectUrl, res) => {
  const resetString = uuidv4() + id;

  try {
    await prisma.passwordReset.deleteMany({ where: { userId: id } });
  } catch (error) {
    return res.status(400).send({
      status: "FAILED",
      message: "Clearing existing password reset records failed",
    });
  }

  const hashedResetString = await bcrypt.hash(resetString, 10);

  try {
    await prisma.passwordReset.create({
      data: {
        userId: id,
        resetString: hashedResetString,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000),
      },
    });
  } catch (error) {
    return res.status(500).send({
      status: "FAILED",
      message: "Couldn't save password reset data!",
    });
  }

  const resetLink = `${redirectUrl}/${id}/${resetString}`;
  if (!transporter) {
    console.log("Bypass - Reset link:", resetLink);
    return res.status(200).send({
      status: "PENDING",
      message: "Reset link created (email bypass). Check server logs for link.",
    });
  }

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Password Reset",
    html: `
      Hello ${name},
      <br/><br/>
      Please click on the link below to reset your password.
      <br/><br/>
      <a href="${resetLink}">Reset Password</a>
      The link will expire in 1 hour.
      <br/><br/>
      If you did not request this, please ignore this email.
      <br/><br/>
      Thank you.
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send({
      status: "PENDING",
      message: "Password reset email sent successfully. Please check your email",
    });
  } catch (error) {
    console.log("Email bypass - link:", resetLink);
    res.status(200).send({
      status: "PENDING",
      message: "Email failed. Check server logs for reset link.",
    });
  }
};

const UpdatePassword = async (req, res) => {
  const { userId, resetString } = req.params;
  const { newPassword } = req.body;

  try {
    const resetRecords = await prisma.passwordReset.findMany({
      where: { userId },
    });

    if (resetRecords.length === 0) {
      return res.status(400).send({
        status: "FAILED",
        message: "Password link either doesn't exist or has expired.",
      });
    }

    const { expiresAt, resetString: hashedResetString } = resetRecords[0];

    if (expiresAt < new Date()) {
      await prisma.passwordReset.deleteMany({ where: { userId } });
      return res.status(410).send({
        status: "FAILED",
        message: "Password reset link has expired",
      });
    }

    const isValid = await bcrypt.compare(resetString, hashedResetString);
    if (!isValid) {
      return res.status(410).send({
        status: "FAILED",
        message: "Invalid password reset details passed.",
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });
    await prisma.passwordReset.deleteMany({ where: { userId } });

    res.status(200).send({
      status: "SUCCESS",
      message: "Password has been reset successfully.",
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      status: "FAILED",
      message: error.message,
    });
  }
};

module.exports = { CreateUser, Login, ResetPassword, UpdatePassword };

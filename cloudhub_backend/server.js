import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import compression from "compression";
dotenv.config();
const app = express();


app.use(express.json());
app.use(compression());

const allowedOrigins = [
  process.env.CLIENT_ORIGIN, // production
  "http://localhost:3000"    // development
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true); // origin allowed
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));




// create reusable transporter object
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",      // for Gmail
  port: 587,                   // SSL port
  secure: false,
  auth: {
    user: process.env.MAIL_USER,  // your email
    pass: process.env.MAIL_PASS,  // app password or your email password
  },
    tls: {
    rejectUnauthorized: false, // ✅ avoids Render TLS issues
  },
});

console.log(process.env.MAIL_USER);

console.log(process.env.MAIL_PASS);

// Use a Map to store OTPs temporarily
const otpStore = new Map(); // key: email, value: { otp, expires }


transporter.verify((err, success) => {
  if (err) console.error("SMTP ERROR:", err);
  else console.log("SMTP READY");
});





// 2️⃣ Log the exact error in your /send-otp route
app.post("/api/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  otpStore.set(email, { otp, expires: Date.now() + 5 * 60 * 1000 });

  try {
    await transporter.sendMail({
      from: `"Cloudhub" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Your OTP for Cloudhub",
      text: `Your OTP is ${otp}. Valid for 5 minutes.`,
    });
    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("EMAIL ERROR:", err); // ✅ logs exact reason
    res.status(500).json({ message: "Failed to send OTP", error: err.toString() });
  }
});



app.post("/api/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp)
    return res.status(400).json({ message: "Email and OTP required" });

  const record = otpStore.get(email);

  if (!record) return res.status(400).json({ message: "No OTP found" });

  if (record.expires < Date.now()) {
    otpStore.delete(email);
    return res.status(400).json({ message: "OTP expired" });
  }

  if (record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

  otpStore.delete(email); // OTP used, remove it
  res.json({ message: "OTP verified successfully" });
});



app.use(cookieParser());

// MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected ✅"))
  .catch(err => console.log(err));

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  contact: String,
  mpin: String
});

const User = mongoose.model("User", userSchema);

const JWT_SECRET = process.env.JWT_SECRET;

// ========== AUTH ROUTES ==========

// ✅ Register
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, contact, mpin } = req.body;

    // check existing user (email or contact)
    const existingUser = await User.findOne({ 
      $or: [{ email }, { contact }] 
    });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPin = await bcrypt.hash(mpin, 10);

    const user = new User({
      name,
      email,
      contact,
      mpin: hashedPin
    });

    await user.save();
    res.status(201).json({ message: "Registered successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


// ✅ Login (Sets cookie)
app.post("/api/login", async (req, res) => {
  try {
    const { email, mpin } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "User not found" });

    const match = await bcrypt.compare(mpin, user.mpin);
    if (!match) return res.status(401).json({ message: "Wrong MPIN" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.json({ message: "Login successful" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});


const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Not authenticated" }); // <-- add return

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "User not found" }); // <-- add return

    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Invalid token" }); // <-- add return
  }
};


app.get("/api/dashboard", authMiddleware, (req, res) => {
  const { name, email, contact } = req.user; // use actual fields
  return res.json({ name, email, contact }); // send data your frontend can use
});


// ✅ Logout (clear cookie)
app.post("/api/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,       // match your login cookie
    sameSite: "none",   // match your login cookie
    path: "/",          // default is "/", match login
  });
  res.json({ message: "Logged out" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

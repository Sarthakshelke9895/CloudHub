import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(express.json());

// ✅ Important CORS config for cookies
app.use(cors({
  origin: process.env.CLIENT_ORIGIN,
  credentials: true
}));

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
  const { email, mpin } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "User not found" });

  const match = await bcrypt.compare(mpin, user.mpin);
  if (!match) return res.status(401).json({ message: "Wrong MPIN" });

  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,         // true only in HTTPS production
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000
  });

  res.json({ message: "Login successful", token });
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
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

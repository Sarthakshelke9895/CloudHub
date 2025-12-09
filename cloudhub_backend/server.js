import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// ----- MongoDB Connection -----
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected!");
  } catch (err) {
    console.error("DB Connection Error:", err.message);
    process.exit(1);
  }
};
connectDB();

// ----- User Schema -----
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mpin: { type: String, required: true, unique: true },
});

const User = mongoose.model("User", userSchema);

// ----- Middleware to protect routes -----
const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Not authorized" });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(401).json({ message: "Session expired" });
      req.user = decoded;
      next();
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ----- Routes -----

// Registration
app.post("/api/register", async (req, res) => {
  const { name, mobile, email, password, mpin } = req.body;

  if (!name || !mobile || !email || !password || !mpin) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  if (/^(\d)\1+$/.test(mpin)) {
    return res.status(400).json({ message: "MPIN cannot be same digits" });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { mpin }] });
    if (existingUser) {
      return res.status(400).json({ message: "Email or MPIN already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      mobile,
      email,
      password: hashedPassword,
      mpin,
    });

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "5s", // short expiry for testing
    });

    res.status(201).json({ message: "Registered successfully", token });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "5s",
    });

    res.json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Protected dashboard
app.get("/api/dashboard", protect, (req, res) => {
  res.json({ message: `Welcome to dashboard, userId: ${req.user.userId}` });
});

// ----- Start server -----
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

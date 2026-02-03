import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import path from "path";



import compression from "compression";
dotenv.config();
const app = express();


app.use(express.json());
app.use(compression());
app.use(cookieParser());

const allowedOrigins = [
  process.env.CLIENT_ORIGIN, // production
  "http://localhost:3000",
  "http://192.168.0.168:3000" ,   // development
];

app.use(cors({
  origin: function (origin, callback) {
    console.log("REQUEST ORIGIN:", origin); 
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



// Use a Map to store OTPs temporarily
const otpStore = new Map(); // key: phone, value: { otp, expires }

// Send OTP via WhatsApp
app.post("/api/send-otp-whatsapp", async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: "Phone number required" });

  // Generate 4-digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const expires = Date.now() + 5 * 60 * 1000; // 5 mins
  otpStore.set(phone, { otp, expires });

  const whatsappLink = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(
  `Your OTP for Cloudhub Registration is:\n${otp}`
)}`;

  

  res.json({ message: "OTP generated", whatsappLink });
});

// Verify OTP
app.post("/api/verify-otp-whatsapp", (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) return res.status(400).json({ message: "Phone and OTP required" });

  const record = otpStore.get(phone);
  if (!record) return res.status(400).json({ message: "No OTP found" });

  if (record.expires < Date.now()) {
    otpStore.delete(phone);
    return res.status(400).json({ message: "OTP expired" });
  }

  if (record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

  otpStore.delete(phone); // OTP used, remove it
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
    const { login, mpin } = req.body;
    const user = await User.findOne({
      $or: [{ email: login }, { contact: login }]
    });
    
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
    return res.status(401).json({ message: "Invalid token" });
     // <-- add return
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




//file upload logic












const Folder = mongoose.model(
  "Folder",
  new mongoose.Schema({
    name: String,
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Folder", default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null }
  })
);

const File = mongoose.model(
  "File",
  new mongoose.Schema({
    filename: String,
    originalname: String,
    mimetype: String,
    size: Number,
    path: String,
    folder: { type: mongoose.Schema.Types.ObjectId, ref: "Folder", default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null }
  })
);

if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, "uploads"),
  filename: (_, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

app.post("/folder", authMiddleware,async (req, res) => {
  const { name, parent } = req.body;
  res.json(await Folder.create({ name, parent: parent || null , userId: req.user._id}));
});

app.get("/folder/:id", authMiddleware, async (req, res) => {
  const parent = req.params.id === "root" ? null : req.params.id;

  const folders = await Folder.find({
    parent,
    userId: req.user._id
  });

  const files = await File.find({
    folder: parent,
    userId: req.user._id
  });

  res.json({ folders, files });
});


app.post("/upload/:folderId",  authMiddleware,upload.single("file"), async (req, res) => {
  const folder = req.params.folderId === "root" ? null : req.params.folderId;
  const f = await File.create({
    filename: req.file.filename,
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    path: req.file.path,
    folder,
    userId: req.user._id
  });
  res.json(f);
});


app.get("/folderinfo/:id", authMiddleware, async (req, res) => {
  if (req.params.id === "root") return res.json({ name: "Root" });

  // Find folder that belongs to logged-in user
  const f = await Folder.findOne({ _id: req.params.id, userId: req.user._id });

  if (!f) return res.status(404).json({ name: "Unknown" });

  res.json({ name: f.name });
});


app.get("/file/:id", authMiddleware, async (req, res) => {
  const file = await File.findOne({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!file) {
    return res.status(404).json({ message: "File not found in DB" });
  }

  const filePath = path.resolve(file.path);

  if (!fs.existsSync(filePath)) {
    console.log("Missing file:", filePath);
    return res.status(404).json({ message: "File missing on server" });
  }

  if (req.query.download === "true") {
    return res.download(filePath, file.originalname);
  }

  res.sendFile(filePath);
});










app.delete("/folder/:id", authMiddleware, async (req, res) => {
  const folder = await Folder.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!folder) {
    return res.status(403).json({ message: "Access denied" });
  }

  res.json({ success: true });
});


app.put("/folder/:id/rename", authMiddleware, async (req, res) => {
  const folder = await Folder.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { name: req.body.name },
    { new: true }
  );

  if (!folder) return res.status(403).json({ message: "Access denied" });

  res.json(folder);
});

app.delete("/file/:id", authMiddleware, async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!file)
      return res.status(404).json({ message: "File not found or access denied" });

    // delete physical file

    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    

    // delete db record
    await File.deleteOne({ _id: file._id });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/search", authMiddleware, async (req, res) => {
  try {
    const q = req.query.q;
    const folderId = req.query.folder;

    if (!q) return res.json({ files: [], folders: [] });

    // Handle root folder: in schema, root folders/files have parent/folder = null
    const folderFilter = folderId === "root" ? null : folderId;

    // Search folders in current folder
    const folders = await Folder.find({
      userId: req.user._id,
      parent: folderFilter,
      name: { $regex: q, $options: "i" },
      isDeleted: false,
    });

    // Search files in current folder
    const files = await File.find({
      userId: req.user._id,
      folder: folderFilter,
      originalname: { $regex: q, $options: "i" },
      isDeleted: false,
    });

    console.log("Search result folders:", folders.length, "files:", files.length);

    res.json({ folders, files });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Search failed" });
  }
});


//notes

// Note schema with proper timestamps
const noteSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
  },
  { timestamps: true } // ✅ this enables createdAt and updatedAt
);

const Note = mongoose.model('Note', noteSchema);



// 1️⃣ Get all notes
app.get('/notes', async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2️⃣ Get single note by ID
app.get('/notes/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/notes', async (req, res) => {
  const { title, content } = req.body;
  const note = new Note({
    title,
    content,
    createdAt: new Date(), // ✅ ensures proper date stored
  });
  await note.save();
  res.json(note);
});



// 4️⃣ Update note by ID
app.put('/notes/:id', async (req, res) => {
  const { title, content } = req.body;
  try {
    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      { title, content },
      { new: true } // return updated document
    );
    if (!updatedNote) return res.status(404).json({ message: 'Note not found' });
    res.json(updatedNote);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 5️⃣ Delete note by ID
app.delete('/notes/:id', async (req, res) => {
  try {
    const deletedNote = await Note.findByIdAndDelete(req.params.id);
    if (!deletedNote) return res.status(404).json({ message: 'Note not found' });
    res.json({ message: 'Note deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 6️⃣ Optional: search notes by title or content
app.get('/notes/search/:query', async (req, res) => {
  const q = req.params.query;
  try {
    const results = await Note.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
      ],
    }).sort({ createdAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

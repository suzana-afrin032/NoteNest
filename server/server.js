// ==========================
// IMPORTS
// ==========================

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const Note = require("./models/note");
const User = require("./models/User");
const authMiddleware = require("./middleware/auth");

require("dotenv").config();


// ==========================
// APP SETUP
// ==========================

const app = express();

app.use(cors());
app.use(express.json());


// ==========================
// MONGODB CONNECTION
// ==========================

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000
    });

    console.log("MongoDB connected successfully! ✅");

  } catch (error) {
    console.log("========== MONGODB ERROR ==========");
    console.log("Main error:", error.message);
    console.log("Error name:", error.name);
    console.log("===================================");
  }
}

connectDB();


// ==========================
// TEST ROUTE
// ==========================

app.get("/", (req, res) => {
  res.send("NoteNest Backend is Running! 🚀");
});


// ==================================================
// AUTHENTICATION
// ==================================================


// ==========================
// SIGNUP
// POST /api/auth/signup
// ==========================

app.post("/api/auth/signup", async (req, res) => {
  try {

    const { name, email, password } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required"
      });
    }

    // Check password length
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    // Clean email
    const cleanEmail = email.toLowerCase().trim();

    // Check existing user
    const existingUser = await User.findOne({
      email: cleanEmail
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword
    });

    const savedUser = await user.save();

    console.log("================================");
    console.log("NEW USER CREATED");
    console.log("Name:", savedUser.name);
    console.log("Email:", savedUser.email);
    console.log("User ID:", savedUser._id);
    console.log("================================");

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email
      }
    });

  } catch (error) {

    console.log("Signup error:", error.message);

    res.status(500).json({
      message: "Failed to register user",
      error: error.message
    });
  }
});


// ==========================
// LOGIN
// POST /api/auth/login
// ==========================

app.post("/api/auth/login", async (req, res) => {
  try {

    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    // Clean email
    const cleanEmail = email.toLowerCase().trim();

    // Find user
    const user = await User.findOne({
      email: cleanEmail
    });

    // ==========================
    // LOGIN DEBUG
    // ==========================

    console.log("================================");
    console.log("LOGIN DEBUG");
    console.log("Email received:", cleanEmail);
    console.log("User found:", user ? "YES" : "NO");

    if (user) {
      console.log("DB email:", user.email);
      console.log("DB user ID:", user._id);
      console.log("Password exists:", !!user.password);
    }

    console.log("================================");

    // User not found
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // ==========================
    // CHECK PASSWORD
    // ==========================

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    console.log("Password correct:", isPasswordCorrect);

    // Wrong password
    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // ==========================
    // CREATE JWT TOKEN
    // ==========================

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        name: user.name,
        email: user.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    // ==========================
    // LOGIN SUCCESS
    // ==========================

    console.log("Login successful for:", user.email);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {

    console.log("Login error:", error.message);

    res.status(500).json({
      message: "Failed to login",
      error: error.message
    });
  }
});


// ==================================================
// FORGOT PASSWORD
// ==================================================


// ==========================
// FORGOT PASSWORD
// POST /api/auth/forgot-password
// ==========================

app.post("/api/auth/forgot-password", async (req, res) => {
  try {

    const { email } = req.body;

    // Check email
    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    // Clean email
    const cleanEmail = email.toLowerCase().trim();

    // Find user
    const user = await User.findOne({
      email: cleanEmail
    });

    // User not found
    if (!user) {
      return res.status(404).json({
        message: "No account found with this email"
      });
    }

    // ==========================
    // CREATE RESET TOKEN
    // ==========================

    const resetToken = crypto.randomBytes(32).toString("hex");

    // Save token
    user.resetPasswordToken = resetToken;

    // Token expires after 15 minutes
    user.resetPasswordExpires =
      new Date(Date.now() + 15 * 60 * 1000);

    await user.save();

    // ==========================
    // RESET URL
    // ==========================

    const resetUrl =
      `http://127.0.0.1:5500/reset-password.html?token=${resetToken}`;

    // ==========================
    // SHOW RESET LINK IN SERVER
    // ==========================

    console.log("");
    console.log("================================");
    console.log("PASSWORD RESET REQUEST");
    console.log("Email:", cleanEmail);
    console.log("RESET TOKEN:", resetToken);
    console.log("PASSWORD RESET LINK:");
    console.log(resetUrl);
    console.log("================================");
    console.log("");

    // ==========================
    // RESPONSE
    // ==========================

    res.status(200).json({
      message: "Password reset link generated",
      resetUrl: resetUrl
    });

  } catch (error) {

    console.error(
      "Forgot password error:",
      error.message
    );

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});


// ==========================
// RESET PASSWORD
// POST /api/auth/reset-password
// ==========================

app.post("/api/auth/reset-password", async (req, res) => {
  try {

    const {
      token,
      password
    } = req.body;

    // Check required fields
    if (!token || !password) {
      return res.status(400).json({
        message: "Token and password are required"
      });
    }

    // Check password length
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    // Find user using token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: {
        $gt: new Date()
      }
    });

    // Invalid/expired token
    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset token"
      });
    }

    // ==========================
    // HASH NEW PASSWORD
    // ==========================

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // Update password
    user.password = hashedPassword;

    // Remove reset token
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    console.log("================================");
    console.log("PASSWORD RESET SUCCESSFUL");
    console.log("Email:", user.email);
    console.log("================================");

    res.status(200).json({
      message: "Password reset successfully"
    });

  } catch (error) {

    console.error(
      "Reset password error:",
      error.message
    );

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});


// ==================================================
// NOTES
// ==================================================


// ==========================
// CREATE NOTE
// POST /api/notes
// ==========================

app.post("/api/notes", authMiddleware, async (req, res) => {
  try {

    const {
      title,
      content,
      category
    } = req.body;

    // Check required fields
    if (!title || !content) {
      return res.status(400).json({
        message: "Title and content are required"
      });
    }

    // Create note
    const note = new Note({
      title: title.trim(),
      content: content.trim(),
      category: category || "Study",
      userId: req.user.userId
    });

    const savedNote = await note.save();

    console.log(
      "Note created by user:",
      req.user.userId
    );

    res.status(201).json({
      message: "Note created successfully",
      note: savedNote
    });

  } catch (error) {

    console.log(
      "Error creating note:",
      error.message
    );

    res.status(500).json({
      message: "Failed to create note",
      error: error.message
    });
  }
});


// ==========================
// GET USER'S NOTES
// GET /api/notes
// ==========================

app.get("/api/notes", authMiddleware, async (req, res) => {
  try {

    console.log("================================");
    console.log("GET /api/notes");
    console.log(
      "Logged in user ID:",
      req.user.userId
    );
    console.log("================================");

    const notes = await Note.find({
      userId: req.user.userId
    }).sort({
      createdAt: -1
    });

    console.log(
      "User notes found:",
      notes.length
    );

    res.status(200).json(notes);

  } catch (error) {

    console.log(
      "GET USER NOTES ERROR:",
      error.message
    );

    res.status(500).json({
      message: "Failed to fetch notes",
      error: error.message
    });
  }
});


// ==========================
// GET SINGLE NOTE
// GET /api/notes/:id
// ==========================

app.get("/api/notes/:id", authMiddleware, async (req, res) => {
  try {

    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!note) {
      return res.status(404).json({
        message: "Note not found"
      });
    }

    res.status(200).json(note);

  } catch (error) {

    console.log(
      "Error fetching note:",
      error.message
    );

    res.status(500).json({
      message: "Failed to fetch note",
      error: error.message
    });
  }
});


// ==========================
// UPDATE NOTE
// PUT /api/notes/:id
// ==========================

app.put("/api/notes/:id", authMiddleware, async (req, res) => {
  try {

    const {
      title,
      content,
      category
    } = req.body;

    // Check required fields
    if (!title || !content) {
      return res.status(400).json({
        message: "Title and content are required"
      });
    }

    // Update note
    const updatedNote =
      await Note.findOneAndUpdate(
        {
          _id: req.params.id,
          userId: req.user.userId
        },
        {
          title: title.trim(),
          content: content.trim(),
          category: category || "Study"
        },
        {
          new: true,
          runValidators: true
        }
      );

    if (!updatedNote) {
      return res.status(404).json({
        message:
          "Note not found or you do not have permission"
      });
    }

    res.status(200).json({
      message: "Note updated successfully",
      note: updatedNote
    });

  } catch (error) {

    console.log(
      "Error updating note:",
      error.message
    );

    res.status(500).json({
      message: "Failed to update note",
      error: error.message
    });
  }
});


// ==========================
// DELETE NOTE
// DELETE /api/notes/:id
// ==========================

app.delete("/api/notes/:id", authMiddleware, async (req, res) => {
  try {

    const deletedNote =
      await Note.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.userId
      });

    if (!deletedNote) {
      return res.status(404).json({
        message:
          "Note not found or you do not have permission"
      });
    }

    res.status(200).json({
      message: "Note deleted successfully",
      note: deletedNote
    });

  } catch (error) {

    console.log(
      "Error deleting note:",
      error.message
    );

    res.status(500).json({
      message: "Failed to delete note",
      error: error.message
    });
  }
});


// ==================================================
// SERVER
// ==================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `NoteNest Backend running on http://localhost:${PORT}`
  );
});
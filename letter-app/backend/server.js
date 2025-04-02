const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const { google } = require("googleapis");
const { uploadToGoogleDrive } = require("./googleDrive");
require("dotenv").config();

const app = express();
const db = new sqlite3.Database("./letter-app.db");

app.use(cors());
app.use(express.json());

//Fetch letters from SQLite
app.get("/api/letters", (req, res) => {
  const { user_id } = req.query;
  db.all("SELECT id, title, content, user_id FROM letters WHERE user_id = ?", [user_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const formattedRows = rows.map(letter => {
      let plainText = "";
      try {
        const content = JSON.parse(letter.content);
        plainText = content.blocks.map(block => block.text).join("\n");
      } catch (error) {
        console.error("Error parsing letter content:", error);
        plainText = "[Error displaying content]";
      }

      return { id: letter.id, title: letter.title, content: plainText };
    });

    res.json(formattedRows);
  });
});


//Save letter to SQLite
app.post("/api/letters/save", (req, res) => {
  const { title, content, user_id } = req.body;

  if (!title || !content || !user_id) {
    return res.status(400).json({ error: "Title, content, and user ID are required" });
  }

  db.run(
    "INSERT INTO letters (title, content, user_id) VALUES (?, ?, ?)",
    [title, content, user_id],
    function (err) {
      if (err) {
        console.error("Error saving letter:", err.message);
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "Letter saved successfully!", letter_id: this.lastID });
    }
  );
});

//Auto-Save to Google Drive
app.post("/api/google-drive/autosave", async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required" });
  }

  try {
    const fileId = await uploadToGoogleDrive(title, content);
    res.json({ message: "Auto-saved to Google Drive", fileId });
  } catch (error) {
    res.status(500).json({ error: "Failed to auto-save to Google Drive" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
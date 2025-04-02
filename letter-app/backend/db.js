const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "letter-app.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("Error connecting to SQLite:", err);
  else console.log("Connected to SQLite");
});

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS letters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      user_id TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    (err) => {
      if (err) console.error("Error creating table:", err);
      else console.log("Table 'letters' ready");
    }
  );
});

module.exports = db;

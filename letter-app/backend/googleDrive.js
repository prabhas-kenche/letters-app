const { google } = require("googleapis");
const fs = require("fs");
require("dotenv").config();

const auth = new google.auth.GoogleAuth({
  keyFile: "./credentials.json",
  scopes: ["https://www.googleapis.com/auth/drive.file"],
});

const drive = google.drive({ version: "v3", auth });

async function uploadToGoogleDrive(title, content) {
  try {
    const authClient = await auth.getClient();
    const driveInstance = google.drive({ version: "v3", auth: authClient });

    const tempFilePath = `./temp_${Date.now()}.txt`;
    fs.writeFileSync(tempFilePath, content, "utf8");

    const fileMetadata = {
      name: `${title}.txt`,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    };

    const media = {
      mimeType: "text/plain",
      body: fs.createReadStream(tempFilePath),
    };

    const response = await driveInstance.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id",
    });

    fs.unlinkSync(tempFilePath); 
    console.log("File Uploaded to Google Drive. File ID:", response.data.id);
    return response.data.id;
  } catch (error) {
    console.error("Google Drive Upload Error:", error);
    throw new Error("Failed to upload file to Google Drive.");
  }
}

module.exports = { uploadToGoogleDrive };

import { readFile } from "fs/promises";
import pdf from "pdf-parse";
import Tesseract from "tesseract.js";

// Next.js Configuration:
// 1. Sets the maximum accepted request body size to 50MB, essential for large base64 files.
// 2. Disables the default body parser so Next.js uses this custom config.
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb', 
    },
  },
};

// Main API Route Handler:
export default async function handler(req, res) {
  // Check if the request method is POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST method allowed" });
  }

  try {
    const file = req.body.file; 
    const type = req.body.type; 

    if (!file) {
      return res.status(400).json({ error: "No file content provided" });
    }

    // Convert the Base64 string back into a Buffer for processing
    const buffer = Buffer.from(file, "base64");

    // --- PDF Extraction ---
    if (type === "pdf") {
      // NOTE: pdf-parse can be memory intensive
      const data = await pdf(buffer);
      return res.json({ text: data.text });
    }

    // --- Image OCR Extraction (JPG, PNG, etc.) ---
    if (type === "image") {
      // Tesseract.recognize is CPU and memory intensive
      const result = await Tesseract.recognize(buffer, "eng");
      return res.json({ text: result.data.text });
    }

    // Fallback if the client sends an unrecognized file type
    return res.status(400).json({ error: "Invalid file type. Must be 'pdf' or 'image'." });

  } catch (err) {
    // Log the server-side error for debugging purposes
    console.error("OCR API Error:", err);
    
    // Return a structured JSON error response to the client
    res.status(500).json({ error: `Server Processing Error: ${err.toString()}` });
  }
}

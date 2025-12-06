import { readFile } from "fs/promises";
import pdf from "pdf-parse";
import Tesseract from "tesseract.js";

// -----------------------------------------------------------------------
// CRITICAL NEXT.JS CONFIGURATION:
// This block tells the Next.js API server to accept a request body 
// up to 50MB, essential for large base64 file uploads.
// -----------------------------------------------------------------------
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb', 
    },
  },
};
// -----------------------------------------------------------------------

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

    // Convert the Base64 string back into a Buffer
    const buffer = Buffer.from(file, "base64");

    // --- PDF Extraction ---
    if (type === "pdf") {
      const data = await pdf(buffer);
      return res.json({ text: data.text });
    }

    // --- Image OCR Extraction ---
    if (type === "image") {
      const result = await Tesseract.recognize(buffer, "eng");
      return res.json({ text: result.data.text });
    }

    // Fallback
    return res.status(400).json({ error: "Invalid file type. Must be 'pdf' or 'image'." });

  } catch (err) {
    // Log the server-side error for debugging
    console.error("OCR API Error:", err);
    
    // Return a structured JSON error response
    res.status(500).json({ error: `Server Processing Error: ${err.toString()}` });
  }
}

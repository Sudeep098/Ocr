import { readFile } from "fs/promises";
import pdf from "pdf-parse";
import Tesseract from "tesseract.js";

// -----------------------------------------------------------------------
// CRITICAL NEXT.JS CONFIGURATION:
// This block belongs here in the API route file and tells Next.js 
// to accept a request body size up to 50MB. This resolves the 413 error.
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
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST method allowed" });
  }

  try {
    const file = req.body.file; 
    const type = req.body.type; 

    if (!file) {
      return res.status(400).json({ error: "No file content provided" });
    }

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
    console.error("OCR API Error:", err);
    res.status(500).json({ error: `Server Processing Error: ${err.toString()}` });
  }
}
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

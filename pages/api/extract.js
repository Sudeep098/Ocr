import { readFile } from "fs/promises";
import pdf from "pdf-parse";
import Tesseract from "tesseract.js";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST allowed" });
    }

    const file = req.body.file; // base64 file string
    const type = req.body.type; // "pdf" or "image"

    if (!file) return res.status(400).json({ error: "No file provided" });

    const buffer = Buffer.from(file, "base64");

    // PDF Extraction
    if (type === "pdf") {
      const data = await pdf(buffer);
      return res.json({ text: data.text });
    }

    // Image OCR Extraction
    if (type === "image") {
      const result = await Tesseract.recognize(buffer, "eng");
      return res.json({ text: result.data.text });
    }

    return res.status(400).json({ error: "Invalid file type" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.toString() });
  }
}            return {"statusCode": 400, "body": json.dumps({"error": "Unsupported Content-Type"})}

        return {
            "statusCode": 200,
            "headers": {"content-type": "application/json"},
            "body": json.dumps({"text": text})
        }

    except Exception as e:
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}

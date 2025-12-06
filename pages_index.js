import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  async function handleUpload(e) {
    e.preventDefault();
    setError("");
    setResult("");

    if (!file) {
      setError("Please select a PDF or image first.");
      return;
    }

    setLoading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();

      const res = await fetch("/api/extract_text", {
        method: "POST",
        headers: {
          "Content-Type": file.type
        },
        body: arrayBuffer
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setResult(data.text);

    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Text Extractor</h1>
      <form onSubmit={handleUpload}>
        <input type="file" accept="application/pdf,image/*"
               onChange={(e) => setFile(e.target.files[0])} />

        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Extract Text"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      <pre>{result}</pre>
    </div>
  );
}

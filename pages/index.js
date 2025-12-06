import { useState } from "react";

export default function Home() {
  const [output, setOutput] = useState("");

  // Convert file to base64
  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });
  }

  async function upload(e) {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) return alert("Select a file!");

    const base64 = await toBase64(file);
    const type = file.type.includes("pdf") ? "pdf" : "image";

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: base64, type }),
      });

      const data = await res.json();
      setOutput(data.text || data.error);
    } catch (err) {
      setOutput(err.message);
    }
  }

  return (
    <div style={{ padding: 30 }}>
      <h2>Upload PDF or Image</h2>
      <input type="file" onChange={upload} />
      <pre style={{ whiteSpace: "pre-wrap", marginTop: 20 }}>{output}</pre>
    </div>
  );
}

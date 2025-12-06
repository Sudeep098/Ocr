import { useState } from "react";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [status, setStatus] = useState("Status: Ready to process.");
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to convert file to base64
  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });
  }

  // Handles file selection and resets state
  function handleFileChange(e) {
    const file = e.target.files ? e.target.files[0] : null;
    setSelectedFile(file);
    setExtractedText(""); // Clear previous text
    setStatus(file ? `File selected: ${file.name}` : "Status: Ready to process.");
  }

  // Handles the API call for text extraction
  async function extractText() {
    if (!selectedFile) {
      alert("Please select a file first!");
      return;
    }

    setIsLoading(true);
    setStatus("Status: Processing file... please wait. This may take a moment.");

    try {
      const base64 = await toBase64(selectedFile);
      const type = selectedFile.type.includes("pdf") ? "pdf" : "image";

      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: base64, type }),
      });

      const data = await res.json();
      
      if (res.ok && data.text) {
        setExtractedText(data.text);
        setStatus("Status: Extraction complete!");
      } else {
        setExtractedText(""); 
        setStatus(`API Error: ${data.error || 'Unknown error occurred'}`);
      }
      
    } catch (err) {
      setStatus(`Network Error: ${err.message}`);
      setExtractedText("");
    } finally {
      setIsLoading(false);
    }
  }

  // Function to create and download the text file
  function handleDownload() {
    if (!extractedText) return;

    const blob = new Blob([extractedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    // Create a sensible file name based on the original file
    link.download = `${selectedFile.name.split('.')[0]}_extracted.txt`; 
    
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ padding: 30, maxWidth: 800, margin: '0 auto' }}>
      <h2>OCR Text Extractor</h2>
      
      {/* File Input and Extraction Button Group */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input type="file" onChange={handleFileChange} accept=".pdf,image/*" />
        <button 
          onClick={extractText} 
          disabled={!selectedFile || isLoading} 
          style={{ padding: 8, cursor: "pointer" }}
        >
          {isLoading ? "Extracting..." : "Extract Text"}
        </button>
        
        {/* Download Button */}
        {extractedText && (
          <button 
            onClick={handleDownload}
            style={{ padding: 8, cursor: "pointer", backgroundColor: '#4CAF50', color: 'white', border: 'none' }}
          >
            Download TXT
          </button>
        )}
      </div>

      <p style={{ marginTop: 20, fontWeight: 'bold' }}>{status}</p>

      {/* Extracted Text Display */}
      {extractedText && (
        <>
          <h3>Extracted Text:</h3>
          <pre style={{ whiteSpace: "pre-wrap", border: '1px solid #ccc', padding: 15, maxHeight: 400, overflowY: 'auto', backgroundColor: '#f9f9f9' }}>
            {extractedText}
          </pre>
        </>
      )}
    </div>
  );
}

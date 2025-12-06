import base64
import json
from io import BytesIO
import fitz  # PyMuPDF
from PIL import Image

def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
    text_parts = []
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    for page in doc:
        text_parts.append(page.get_text())
    return "\n".join(text_parts)

def extract_text_from_image_bytes(image_bytes: bytes) -> str:
    img = Image.open(BytesIO(image_bytes))
    pdf_buffer = BytesIO()
    img.convert("RGB").save(pdf_buffer, format="PDF")
    pdf_bytes = pdf_buffer.getvalue()
    return extract_text_from_pdf_bytes(pdf_bytes)

def handler(event, context):
    try:
        body = event.get("body", b"")
        if isinstance(body, str) and event.get("isBase64Encoded", False):
            body = base64.b64decode(body)
        elif isinstance(body, str):
            body = body.encode("utf-8")

        headers = {k.lower(): v for k, v in (event.get("headers") or {}).items()}
        content_type = headers.get("content-type", "")

        if "application/pdf" in content_type:
            text = extract_text_from_pdf_bytes(body)
        elif content_type.startswith("image/"):
            text = extract_text_from_image_bytes(body)
        else:
            return {"statusCode": 400, "body": json.dumps({"error": "Unsupported Content-Type"})}

        return {
            "statusCode": 200,
            "headers": {"content-type": "application/json"},
            "body": json.dumps({"text": text})
        }

    except Exception as e:
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}

const axios = require("axios");
const pdfParse = require("pdf-parse");

async function test() {
  try {
    const pdfUrl =
      'https://ai-lms-lectures-gaurav.s3.eu-north-1.amazonaws.com/pdfs/1769539787980-gaurav.resume.pdf';

    console.log("📄 Downloading PDF...");

    const res = await axios.get(pdfUrl, {
      responseType: "arraybuffer",
    });

    console.log("📦 PDF size (bytes):", res.data.length);

    const parsed = await pdfParse(res.data);

    console.log("📝 Extracted text length:", parsed.text.length);
    console.log("📝 Sample text:\n", parsed.text.slice(0, 500));
  } catch (err) {
    console.error("❌ ERROR:", err.message);
  }
}

test();

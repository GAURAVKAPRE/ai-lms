/**
 * Chunk large text into overlapping word-based chunks
 *
 * @param {string} text - cleaned PDF text
 * @param {number} chunkSize - words per chunk (default 700)
 * @param {number} overlap - overlapping words (default 100)
 * @returns {Array<{ index: number, text: string, wordCount: number }>}
 */
const chunkText = (
  text,
  chunkSize = 700,
  overlap = 100
) => {
  if (!text || typeof text !== "string") {
    throw new Error("Invalid text provided for chunking");
  }

  // 1️⃣ Normalize whitespace
  const normalized = text
    .replace(/\s+/g, " ")
    .trim();

  // 2️⃣ Split into words
  const words = normalized.split(" ");

  if (words.length <= chunkSize) {
    return [
      {
        index: 0,
        text: normalized,
        wordCount: words.length,
      },
    ];
  }

  const chunks = [];
  let index = 0;
  let start = 0;

  // 3️⃣ Create chunks with overlap
  while (start < words.length) {
    const end = start + chunkSize;
    const chunkWords = words.slice(start, end);

    if (chunkWords.length === 0) break;

    chunks.push({
      index,
      text: chunkWords.join(" "),
      wordCount: chunkWords.length,
    });

    index++;
    start += chunkSize - overlap;
  }

  return chunks;
};

export default chunkText;

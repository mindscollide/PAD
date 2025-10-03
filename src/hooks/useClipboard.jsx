import clipboardCopy from "copy-to-clipboard";

// Reusable pure function to copy text to clipboard
const CopyToClipboard = async (text) => {
  try {
    if (text) {
      await clipboardCopy(text);
    }
  } catch (error) {
    console.error("Copy to clipboard failed:", error);
  }
};

export default CopyToClipboard;

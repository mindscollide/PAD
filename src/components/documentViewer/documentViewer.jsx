// src/components/DocumentViewer/DocumentViewer.jsx
import React, { useEffect, useRef, useState } from "react";
import { Modal, Button } from "antd";

const DocumentViewer = ({ base64Data, mimeType, fileName }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open || !base64Data || mimeType !== "application/pdf") return;

    const byteCharacters = atob(base64Data);
    const byteArray = new Uint8Array(
      Array.from(byteCharacters).map((c) => c.charCodeAt(0))
    );
    const blob = new Blob([byteArray], { type: mimeType });

    // Clear and render iframe
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
      const iframe = document.createElement("iframe");

      // ✅ hide toolbar, sidebar, scrollbars
      iframe.src = URL.createObjectURL(blob) + "#toolbar=0&navpanes=0&scrollbar=0";

      iframe.width = "100%";
      iframe.height = "100%";
      iframe.style.border = "none";
      containerRef.current.appendChild(iframe);
    }
  }, [open, base64Data, mimeType]);

  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        Preview {fileName}
      </Button>
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width="80%"
        style={{ top: 20 }}
      >
        <div
          ref={containerRef}
          style={{
            width: "25vw", // fixed width
            height: "65vh",
            overflow: "hidden",
            background: "#fff",
            border: "1px solid #ddd",
            margin: "0 auto",
          }}
        />
      </Modal>
    </>
  );
};

export default DocumentViewer;

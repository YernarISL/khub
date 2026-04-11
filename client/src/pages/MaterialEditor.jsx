import React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { Link } from "@tiptap/extension-link";
import { Image } from "@tiptap/extension-image";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { host } from "../services";
import { createMaterial } from "../services/materialService";
import { getMaterialById } from "../services/materialService";
import Header from "../components/Header/Header";
import "../styles/MaterialEditor.css";

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt("URL");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const setLink = () => {
    const url = window.prompt("URL");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  // The colors from your image palette
  const colors = [
    "#000000",
    "#705df2",
    "#2196f3",
    "#00bcd4",
    "#4caf50",
    "#ffc107",
    "#ff9800",
    "#f44336",
    "#e91e63",
    "#9c27b0",
    "#673ab7",
    "#3f51b5",
    "#2196f3",
    "#03a9f4",
  ];

  const [isOpen, setIsOpen] = useState(false);
  const currentColor = editor.getAttributes("textStyle").color || "#000000";
  const handleColorClick = (color) => {
    editor.chain().focus().setColor(color).run();
    setIsOpen(false);
  };

  return (
    <div className="control-group">
      <div
        className="button-group"
        style={{
          display: "flex",
          gap: "4px",
          alignItems: "center",
          marginBottom: "72px",
        }}
      >
        {/* Basic Formatting */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "is-active" : ""}
        >
          <b>B</b>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "is-active" : ""}
        >
          <i>I</i>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive("underline") ? "is-active" : ""}
        >
          U
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive("strike") ? "is-active" : ""}
        >
          S
        </button>

        {/* Headings */}
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          H1
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          H2
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          H3
        </button>

        {/* Lists & Blocks */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()} style={{ border: "none", padding: 0}}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 640 640"
          >
            <path
              fill="currentColor"
              d="M104 112c-13.3 0-24 10.7-24 24v48c0 13.3 10.7 24 24 24h48c13.3 0 24-10.7 24-24v-48c0-13.3-10.7-24-24-24zm152 16c-17.7 0-32 14.3-32 32s14.3 32 32 32h288c17.7 0 32-14.3 32-32s-14.3-32-32-32zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32h288c17.7 0 32-14.3 32-32s-14.3-32-32-32zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32h288c17.7 0 32-14.3 32-32s-14.3-32-32-32zM80 296v48c0 13.3 10.7 24 24 24h48c13.3 0 24-10.7 24-24v-48c0-13.3-10.7-24-24-24h-48c-13.3 0-24 10.7-24 24m24 136c-13.3 0-24 10.7-24 24v48c0 13.3 10.7 24 24 24h48c13.3 0 24-10.7 24-24v-48c0-13.3-10.7-24-24-24z"
            />
          </svg>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()} style={{ border: "none", padding: 0}}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="640"
            height="640"
            viewBox="0 0 640 640"
          >
            <path
              fill="currentColor"
              d="M64 136c0-13.2 10.7-24 24-24h48c13.3 0 24 10.7 24 24v104h24c13.3 0 24 10.7 24 24s-10.7 24-24 24H88c-13.3 0-24-10.7-24-24s10.7-24 24-24h24v-80H88c-13.3 0-24-10.7-24-24m30.4 229.2c11.4-8.6 25.3-13.2 39.6-13.2h4.9c33.7 0 61.1 27.4 61.1 61.1c0 19.6-9.4 37.9-25.2 49.4l-24 17.5H184c13.3 0 24 10.7 24 24s-10.7 24-24 24H93.3C77.1 528 64 514.9 64 498.7c0-9.4 4.5-18.2 12.1-23.7l70.5-51.3c3.4-2.5 5.4-6.4 5.4-10.6c0-7.2-5.9-13.1-13.1-13.1H134c-3.9 0-7.7 1.3-10.8 3.6l-20.8 15.6c-10.6 8-25.6 5.8-33.6-4.8s-5.8-25.6 4.8-33.6zM288 128h256c17.7 0 32 14.3 32 32s-14.3 32-32 32H288c-17.7 0-32-14.3-32-32s14.3-32 32-32m0 160h256c17.7 0 32 14.3 32 32s-14.3 32-32 32H288c-17.7 0-32-14.3-32-32s14.3-32 32-32m0 160h256c17.7 0 32 14.3 32 32s-14.3 32-32 32H288c-17.7 0-32-14.3-32-32s14.3-32 32-32"
            />
          </svg>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          style={{ border: "none", padding: 0}}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M4.825 12.025L8.7 15.9q.275.275.275.7t-.275.7t-.7.275t-.7-.275l-4.6-4.6q-.15-.15-.213-.325T2.426 12t.063-.375t.212-.325l4.6-4.6q.3-.3.713-.3t.712.3t.3.713t-.3.712zm14.35-.05L15.3 8.1q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l4.6 4.6q.15.15.213.325t.062.375t-.062.375t-.213.325l-4.6 4.6q-.3.3-.7.288t-.7-.313t-.3-.712t.3-.713z"
            />
          </svg>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          style={{ border: "none", padding: 0}}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
          >
            <path
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-width="1.5"
              d="M10 12H5a1 1 0 0 1-1-1V7.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1zm0 0c0 2.5-1 4-4 5.5M20 12h-5a1 1 0 0 1-1-1V7.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1zm0 0c0 2.5-1 4-4 5.5"
            />
          </svg>
        </button>

        {/* Links & Images */}
        <button onClick={setLink} style={{ border: "none", padding: 0}}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
          >
            <path
              fill="#000"
              fill-rule="evenodd"
              d="M12.502 4.93a4.65 4.65 0 0 1 6.575 6.576l-.011.01l-2.265 2.265a4.65 4.65 0 0 1-7.012-.502a.875.875 0 1 1 1.401-1.048a2.9 2.9 0 0 0 4.374.313l2.259-2.26a2.9 2.9 0 0 0-4.101-4.1l-1.294 1.287a.875.875 0 0 1-1.234-1.24zm-3.64 4.22a4.65 4.65 0 0 1 5.348 1.57a.875.875 0 1 1-1.401 1.05a2.9 2.9 0 0 0-4.373-.314l-2.26 2.26a2.9 2.9 0 0 0 4.1 4.1l1.286-1.285a.875.875 0 1 1 1.238 1.237l-1.292 1.291l-.01.01a4.65 4.65 0 0 1-6.576-6.575l.011-.01l2.265-2.265a4.65 4.65 0 0 1 1.663-1.07"
              clip-rule="evenodd"
            />
          </svg>
        </button>
        <button onClick={addImage} style={{ border: "none", padding: 0}}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
          >
            <path
              fill="#000"
              d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21zm0-2h14V5H5zm1-2h12l-3.75-5l-3 4L9 13zm-1 2V5z"
            />
          </svg>
        </button>

        {/* Color Picker Simulation */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: "24px",
            height: "24px",
            backgroundColor: currentColor,
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
          }}
          title="Pick Color"
        ></button>

        {isOpen && (
          <>
            <div
              onClick={() => setIsOpen(false)}
              style={{ position: "fixed", inset: 0, zIndex: 10 }}
            ></div>
            <div
              style={{
                position: "absolute",
                top: "35px",
                left: "650px",
                backgroundColor: "white",
                padding: "8px",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "8px",
                zIndex: 20,
                border: "1px solid #eee",
              }}
            >
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorClick(color)}
                  style={{
                    width: "24px",
                    height: "24px",
                    backgroundColor: color,
                    borderRadius: "4px",
                    border:
                      color === currentColor
                        ? "2px solid #000"
                        : "1px solid #ddd",
                    cursor: "pointer",
                    padding: 0,
                  }}
                ></button>
              ))}
              <button
                onClick={() => {
                  editor.chain().focus().unsetColor().run();
                  setIsOpen(false);
                }}
                style={{
                  gridColumn: "span 4",
                  fontSize: "12px",
                  marginTop: "4px",
                  cursor: "pointer",
                  background: "#f3f4f6",
                  border: "none",
                  borderRadius: "4px",
                  padding: "4px",
                  width: "72px",
                }}
              >
                Clear color
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Простейшая система сохранения
const SaveSystem = ({ editor }) => {
  const navigate = useNavigate();

  const [savedWorks, setSavedWorks] = useState(() => {
    return JSON.parse(localStorage.getItem("savedWorks") || "[]");
  });

  const [savingToBackend, setSavingToBackend] = useState(false);

  // Saving to backend DB
  const saveToDatabase = async () => {
    if (!editor) return;

    const title = prompt("Название работы:", "Моя работа");
    if (!title) return;

    setSavingToBackend(true);

    try {
      console.log("Начинаю сохранение...");

      const savedMaterial = await createMaterial({
        title: title,
        description: "Работа из редактора",
        content: editor.getHTML(),
        materialType: "EDITOR",
        publishedDate: new Date().toISOString(),
      });

      console.log("Сохраненный материал:", savedMaterial);

      // ИЗМЕНИ ЭТУ СТРОКУ:
      alert(`Сохранено в базу! ID: ${savedMaterial.id || "ID не получен"}`);

      // Также сохраняем в localStorage для быстрого доступа
      const newWork = {
        id: savedMaterial.id || Date.now(), // используем ID из базы или генерируем
        title,
        content: editor.getHTML(),
        date: new Date().toLocaleString(),
        savedInDb: true,
      };

      const updated = [...savedWorks, newWork];
      setSavedWorks(updated);
      localStorage.setItem("savedWorks", JSON.stringify(updated));
    } catch (error) {
      console.error("Ошибка сохранения в базу:", error);

      // ИЗМЕНИ ЭТО:
      console.log("Тип ошибки:", typeof error);
      console.log("Есть ли .response?", error.response);
      console.log("Есть ли .message?", error.message);

      if (error.message) {
        alert("Ошибка: " + error.message);
      } else {
        alert("Неизвестная ошибка при сохранении");
      }
    } finally {
      setSavingToBackend(false);
    }
  };

  const saveToLocal = () => {
    if (!editor) return;

    const title = prompt("Название работы (только локально):", "Моя работа");
    if (!title) return;

    const newWork = {
      id: Date.now(),
      title,
      content: editor.getHTML(),
      date: new Date().toLocaleString(),
      savedInDb: false,
    };

    const updated = [...savedWorks, newWork];
    setSavedWorks(updated);
    localStorage.setItem("savedWorks", JSON.stringify(updated));
    alert("Сохранено локально!");
  };

  const loadWork = (work) => {
    if (editor && confirm(`Загрузить "${work.title}"?`)) {
      editor.commands.setContent(work.content);
    }
  };

  const exportPDF = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html><head><title>Экспорт</title></head>
      <body>${editor?.getHTML() || ""}</body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div
      style={{
        marginTop: "20px",
        borderTop: "1px solid #ccc",
        paddingTop: "10px",
      }}
    >
      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <button
          onClick={saveToDatabase}
          disabled={savingToBackend}
          style={{
            background: "#007bff",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "4px",
          }}
        >
          {savingToBackend ? "Сохранение..." : "Save to DB"}
        </button>

        <button
          onClick={saveToLocal}
          style={{
            background: "#6c757d",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "4px",
          }}
        >
          Save to LocalStorage
        </button>

        <button
          onClick={exportPDF}
          style={{
            background: "#28a745",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "4px",
          }}
        >
          Export to PDF
        </button>
        <button
          onClick={() => navigate("/home")}
          style={{
            background: "#bb8a2fff",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "4px",
          }}
        >
          Back to Home
        </button>
      </div>

      {savedWorks.length > 0 && (
        <div>
          <h4>Saved Works:</h4>
          {savedWorks.map((work) => (
            <div
              key={work.id}
              style={{
                border: "1px solid #ddd",
                padding: "10px",
                margin: "5px 0",
                cursor: "pointer",
                background: work.savedInDb ? "#e8f5e9" : "#fff3e0",
              }}
              onClick={() => loadWork(work)}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>{work.title}</strong>
                <small
                  style={{
                    color: work.savedInDb ? "#4caf50" : "#ff9800",
                    fontWeight: "bold",
                  }}
                >
                  {work.savedInDb ? "In DB" : "Local"}
                </small>
              </div>
              <small>{work.date}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Main Editor Component ---
export default function MaterialEditor() {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Image,
      TextStyle,
      Color,
    ],
    content: `
      <h1>Heading1</h1>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
      <ul><li>unordered list item</li></ul>
      <pre><code>tefor (var i=1; i <= 20; i++) { ... }</code></pre>
      <blockquote>"Nothing is impossible..."</blockquote>
    `,
  });

  return (
    <div className="material-editor-page-wrapper">
      <Header />
      <h1 style={{ margin: "32px 0 0 139px" }}>Sandbox</h1>
      <div className="material-editor-container" style={{}}>
        <MenuBar editor={editor} />
        <EditorContent editor={editor} />
        <style>{`
        .ProseMirror { padding: 10px; min-height: 300px; outline: none; }
        .ProseMirror h1 { font-size: 2rem; }
        .ProseMirror pre { background: #f4f4f4; padding: 1rem; border-radius: 5px; font-family: monospace; }
        .ProseMirror img { max-width: 100%; height: auto; border-radius: 8px; }
        .ProseMirror blockquote { border-left: 3px solid #ccc; padding-left: 1rem; font-style: italic; }

        button.is-active { background: #eee; border-color: #000; }
      `}</style>
        <SaveSystem editor={editor} />
      </div>
    </div>
  );
}

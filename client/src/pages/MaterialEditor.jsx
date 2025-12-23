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
    "#00bcd4",
  ];

  return (
    <div className="control-group">
      <div
        className="button-group"
        style={{
          borderBottom: "1px solid #ccc",
          paddingBottom: "10px",
          marginBottom: "10px",
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
        <button onClick={() => editor.chain().focus().toggleBulletList().run()}>
          UL
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          OL
        </button>
        <button onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          Code
        </button>
        <button onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          ""
        </button>

        {/* Links & Images */}
        <button onClick={setLink}>Link</button>
        <button onClick={addImage}>Img</button>

        {/* Color Picker Simulation */}
        <select
          onChange={(e) =>
            editor.chain().focus().setColor(e.target.value).run()
          }
        >
          <option value="">Text Color</option>
          {colors.map((color) => (
            <option key={color} value={color} style={{ color }}>
              Color
            </option>
          ))}
        </select>
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
    <div
      style={{
        border: "1px solid #ccc",
        padding: "20px",
        borderRadius: "8px",
        maxWidth: "800px",
        margin: "auto",
      }}
    >
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
      <style>{`
        .ProseMirror { padding: 10px; min-height: 300px; outline: none; }
        .ProseMirror h1 { font-size: 2rem; }
        .ProseMirror pre { background: #f4f4f4; padding: 1rem; border-radius: 5px; font-family: monospace; }
        .ProseMirror img { max-width: 100%; height: auto; border-radius: 8px; }
        .ProseMirror blockquote { border-left: 3px solid #ccc; padding-left: 1rem; font-style: italic; }
        button { margin-right: 5px; padding: 5px 10px; cursor: pointer; background: white; border: 1px solid #ddd; }
        button.is-active { background: #eee; border-color: #000; }
      `}</style>
      <SaveSystem editor={editor} />
    </div>
  );
}

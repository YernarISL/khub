import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const COLORS = [
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

export default function EditorMenuBar({ editor }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt("URL");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const setLink = () => {
    const url = window.prompt("URL");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const currentColor = editor.getAttributes("textStyle").color || "#000000";
  const handleColorClick = (color) => {
    editor.chain().focus().setColor(color).run();
    setIsOpen(false);
  };

  return (
    <div className="sandbox-editor-toolbar">
      <div className="sandbox-toolbar-btn-group">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`sandbox-toolbar-btn ${editor.isActive("bold") ? "is-active" : ""}`}
        >
          <b>B</b>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`sandbox-toolbar-btn ${editor.isActive("italic") ? "is-active" : ""}`}
        >
          <i>I</i>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`sandbox-toolbar-btn ${editor.isActive("underline") ? "is-active" : ""}`}
        >
          U
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`sandbox-toolbar-btn ${editor.isActive("strike") ? "is-active" : ""}`}
        >
          S
        </button>

        <button
          type="button"
          className="sandbox-toolbar-btn"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          H1
        </button>
        <button
          type="button"
          className="sandbox-toolbar-btn"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          H2
        </button>
        <button
          type="button"
          className="sandbox-toolbar-btn"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          H3
        </button>

        <button
          type="button"
          className="sandbox-toolbar-btn sandbox-toolbar-btn--plain"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 640 640"
            aria-hidden
          >
            <path
              fill="currentColor"
              d="M104 112c-13.3 0-24 10.7-24 24v48c0 13.3 10.7 24 24 24h48c13.3 0 24-10.7 24-24v-48c0-13.3-10.7-24-24-24zm152 16c-17.7 0-32 14.3-32 32s14.3 32 32 32h288c17.7 0 32-14.3 32-32s-14.3-32-32-32zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32h288c17.7 0 32-14.3 32-32s-14.3-32-32-32zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32h288c17.7 0 32-14.3 32-32s-14.3-32-32-32zM80 296v48c0 13.3 10.7 24 24 24h48c13.3 0 24-10.7 24-24v-48c0-13.3-10.7-24-24-24h-48c-13.3 0-24 10.7-24 24m24 136c-13.3 0-24 10.7-24 24v48c0 13.3 10.7 24 24 24h48c13.3 0 24-10.7 24-24v-48c0-13.3-10.7-24-24-24z"
            />
          </svg>
        </button>
        <button
          type="button"
          className="sandbox-toolbar-btn sandbox-toolbar-btn--plain"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 640 640"
            aria-hidden
          >
            <path
              fill="currentColor"
              d="M64 136c0-13.2 10.7-24 24-24h48c13.3 0 24 10.7 24 24v104h24c13.3 0 24 10.7 24 24s-10.7 24-24 24H88c-13.3 0-24-10.7-24-24s10.7-24 24-24h24v-80H88c-13.3 0-24-10.7-24-24m30.4 229.2c11.4-8.6 25.3-13.2 39.6-13.2h4.9c33.7 0 61.1 27.4 61.1 61.1c0 19.6-9.4 37.9-25.2 49.4l-24 17.5H184c13.3 0 24 10.7 24 24s-10.7 24-24 24H93.3C77.1 528 64 514.9 64 498.7c0-9.4 4.5-18.2 12.1-23.7l70.5-51.3c3.4-2.5 5.4-6.4 5.4-10.6c0-7.2-5.9-13.1-13.1-13.1H134c-3.9 0-7.7 1.3-10.8 3.6l-20.8 15.6c-10.6 8-25.6 5.8-33.6-4.8s-5.8-25.6 4.8-33.6zM288 128h256c17.7 0 32 14.3 32 32s-14.3 32-32 32H288c-17.7 0-32-14.3-32-32s14.3-32 32-32m0 160h256c17.7 0 32 14.3 32 32s-14.3 32-32 32H288c-17.7 0-32-14.3-32-32s14.3-32 32-32m0 160h256c17.7 0 32 14.3 32 32s-14.3 32-32 32H288c-17.7 0-32-14.3-32-32s14.3-32 32-32"
            />
          </svg>
        </button>
        <button
          type="button"
          className="sandbox-toolbar-btn sandbox-toolbar-btn--plain"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              fill="currentColor"
              d="M4.825 12.025L8.7 15.9q.275.275.275.7t-.275.7t-.7.275t-.7-.275l-4.6-4.6q-.15-.15-.213-.325T2.426 12t.063-.375t.212-.325l4.6-4.6q.3-.3.713-.3t.712.3t.3.713t-.3.712zm14.35-.05L15.3 8.1q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l4.6 4.6q.15.15.213.325t.062.375t-.062.375t-.213.325l-4.6 4.6q-.3.3-.7.288t-.7-.313t-.3-.712t.3-.713z"
            />
          </svg>
        </button>
        <button
          type="button"
          className="sandbox-toolbar-btn sandbox-toolbar-btn--plain"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.5"
              d="M10 12H5a1 1 0 0 1-1-1V7.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1zm0 0c0 2.5-1 4-4 5.5M20 12h-5a1 1 0 0 1-1-1V7.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1zm0 0c0 2.5-1 4-4 5.5"
            />
          </svg>
        </button>

        <button
          type="button"
          className="sandbox-toolbar-btn sandbox-toolbar-btn--plain"
          onClick={setLink}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              fill="currentColor"
              fillRule="evenodd"
              d="M12.502 4.93a4.65 4.65 0 0 1 6.575 6.576l-.011.01l-2.265 2.265a4.65 4.65 0 0 1-7.012-.502a.875.875 0 1 1 1.401-1.048a2.9 2.9 0 0 0 4.374.313l2.259-2.26a2.9 2.9 0 0 0-4.101-4.1l-1.294 1.287a.875.875 0 0 1-1.234-1.24zm-3.64 4.22a4.65 4.65 0 0 1 5.348 1.57a.875.875 0 1 1-1.401 1.05a2.9 2.9 0 0 0-4.373-.314l-2.26 2.26a2.9 2.9 0 0 0 4.1 4.1l1.286-1.285a.875.875 0 1 1 1.238 1.237l-1.292 1.291l-.01.01a4.65 4.65 0 0 1-6.576-6.575l.011-.01l2.265-2.265a4.65 4.65 0 0 1 1.663-1.07"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <button
          type="button"
          className="sandbox-toolbar-btn sandbox-toolbar-btn--plain"
          onClick={addImage}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              fill="currentColor"
              d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21zm0-2h14V5H5zm1-2h12l-3.75-5l-3 4L9 13zm-1 2V5z"
            />
          </svg>
        </button>

        <div className="sandbox-toolbar-color-wrap">
          <button
            type="button"
            className="sandbox-toolbar-color-trigger"
            style={{ backgroundColor: currentColor }}
            onClick={() => setIsOpen(!isOpen)}
            title={t("sandbox.pickColor")}
            aria-expanded={isOpen}
            aria-haspopup="dialog"
          />

          {isOpen && (
            <>
              <div
                className="sandbox-color-popover-backdrop"
                onClick={() => setIsOpen(false)}
                role="presentation"
              />
              <div className="sandbox-color-popover" role="dialog">
                {COLORS.map((color, index) => (
                  <button
                    type="button"
                    key={`${color}-${index}`}
                    className={`sandbox-color-swatch ${color === currentColor ? "sandbox-color-swatch--selected" : ""}`}
                    style={{
                      backgroundColor: color,
                      border:
                        color === currentColor
                          ? "2px solid #0f172a"
                          : "1px solid #e2e8f0",
                    }}
                    onClick={() => handleColorClick(color)}
                  />
                ))}
                <button
                  type="button"
                  className="sandbox-color-clear"
                  onClick={() => {
                    editor.chain().focus().unsetColor().run();
                    setIsOpen(false);
                  }}
                >
                  {t("sandbox.clearColor")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

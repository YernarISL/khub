import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { Link } from "@tiptap/extension-link";
import { Image } from "@tiptap/extension-image";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { useTranslation } from "react-i18next";
import { HiOutlineSparkles } from "react-icons/hi2";

import EditorMenuBar from "./ui/EditorMenuBar";
import SavePanel from "./ui/SavePanel";

import "./styles/sandbox-page.css";

const DEFAULT_CONTENT = `
      <h1>Heading1</h1>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
      <ul><li>unordered list item</li></ul>
      <pre><code>tefor (var i=1; i <= 20; i++) { ... }</code></pre>
      <blockquote>"Nothing is impossible..."</blockquote>
    `;

export default function SandboxPage() {
  const { t } = useTranslation();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Image,
      TextStyle,
      Color,
    ],
    content: DEFAULT_CONTENT,
  });

  return (
    <div className="sandbox-page">
      <div className="sandbox-page-inner">
        <header className="sandbox-page-header">
          <div className="sandbox-page-title-row">
            <span className="sandbox-page-icon" aria-hidden>
              <HiOutlineSparkles />
            </span>
            <h1 className="sandbox-page-title">{t("sandbox.pageTitle")}</h1>
          </div>
          <p className="sandbox-page-subtitle">{t("sandbox.pageSubtitle")}</p>
        </header>

        <section className="sandbox-page-promo" aria-label={t("sandbox.promoAria")}>
          <div className="sandbox-page-promo-title">
            <HiOutlineSparkles aria-hidden />
            {t("sandbox.promoTitle")}
          </div>
          <p className="sandbox-page-promo-body">{t("sandbox.promoBody")}</p>
        </section>

        <section className="sandbox-editor-card" aria-label={t("sandbox.editorAria")}>
          <EditorMenuBar editor={editor} />
          <div className="sandbox-editor-prose">
            <EditorContent editor={editor} />
          </div>
        </section>

        <SavePanel editor={editor} />
      </div>
    </div>
  );
}

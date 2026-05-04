import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { createMaterial } from "../../../services/materialService";

export default function SavePanel({ editor }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [savedWorks, setSavedWorks] = useState(() => {
    return JSON.parse(localStorage.getItem("savedWorks") || "[]");
  });

  const [savingToBackend, setSavingToBackend] = useState(false);

  const saveToDatabase = async () => {
    if (!editor) return;

    const title = window.prompt(
      t("sandbox.promptDbTitle"),
      t("sandbox.defaultWorkTitle"),
    );
    if (!title) return;

    setSavingToBackend(true);

    try {
      const savedMaterial = await createMaterial({
        title,
        description: t("sandbox.materialDescription"),
        content: editor.getHTML(),
        materialType: "EDITOR",
        publishedDate: new Date().toISOString(),
      });

      const idLabel = savedMaterial.id ?? t("sandbox.idUnknown");
      window.alert(t("sandbox.savedDb", { id: idLabel }));

      const newWork = {
        id: savedMaterial.id || Date.now(),
        title,
        content: editor.getHTML(),
        date: new Date().toLocaleString(),
        savedInDb: true,
      };

      const updated = [...savedWorks, newWork];
      setSavedWorks(updated);
      localStorage.setItem("savedWorks", JSON.stringify(updated));
    } catch (error) {
      console.error("Sandbox save error:", error);

      if (error.message) {
        window.alert(t("sandbox.errorWithMessage", { message: error.message }));
      } else {
        window.alert(t("sandbox.errorUnknown"));
      }
    } finally {
      setSavingToBackend(false);
    }
  };

  const saveToLocal = () => {
    if (!editor) return;

    const title = window.prompt(
      t("sandbox.promptLocalTitle"),
      t("sandbox.defaultWorkTitle"),
    );
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
    window.alert(t("sandbox.savedLocal"));
  };

  const loadWork = (work) => {
    if (
      editor &&
      window.confirm(t("sandbox.loadConfirm", { title: work.title }))
    ) {
      editor.commands.setContent(work.content);
    }
  };

  const exportPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>${t("sandbox.exportWindowTitle")}</title></head>
      <body>${editor?.getHTML() || ""}</body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="sandbox-save-panel">
      <div className="sandbox-save-actions">
        <button
          type="button"
          className="sandbox-save-btn sandbox-save-btn--primary"
          onClick={saveToDatabase}
          disabled={savingToBackend}
        >
          {savingToBackend ? t("sandbox.saving") : t("sandbox.saveToDb")}
        </button>

        <button
          type="button"
          className="sandbox-save-btn sandbox-save-btn--secondary"
          onClick={saveToLocal}
        >
          {t("sandbox.saveLocal")}
        </button>

        <button
          type="button"
          className="sandbox-save-btn sandbox-save-btn--success"
          onClick={exportPDF}
        >
          {t("sandbox.exportPdf")}
        </button>

        <button
          type="button"
          className="sandbox-save-btn sandbox-save-btn--ghost"
          onClick={() => navigate("/home")}
        >
          {t("sandbox.backHome")}
        </button>
      </div>

      {savedWorks.length > 0 && (
        <div>
          <h4 className="sandbox-saved-heading">{t("sandbox.savedWorks")}</h4>
          <div className="sandbox-saved-list">
            {savedWorks.map((work) => (
              <div
                key={work.id}
                className={`sandbox-saved-item ${work.savedInDb ? "sandbox-saved-item--db" : "sandbox-saved-item--local"}`}
                onClick={() => loadWork(work)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    loadWork(work);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="sandbox-saved-item-top">
                  <span className="sandbox-saved-item-title">{work.title}</span>
                  <span
                    className={`sandbox-saved-badge ${work.savedInDb ? "sandbox-saved-badge--db" : "sandbox-saved-badge--local"}`}
                  >
                    {work.savedInDb ? t("sandbox.badgeDb") : t("sandbox.badgeLocal")}
                  </span>
                </div>
                <span className="sandbox-saved-item-date">{work.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

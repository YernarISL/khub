import React, { useState } from "react";
import { createOrGetDialogue, getStudentPersonalization, updateStudentPersonalization } from "../services/teacherWorkflowService";
import "../styles/TeacherPersonalizationPage.css";

export default function TeacherPersonalizationPage() {
  const [studentId, setStudentId] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");

  const handleLoad = async () => {
    if (!studentId) return;
    try {
      await createOrGetDialogue(Number(studentId));
      const data = await getStudentPersonalization(Number(studentId));
      setNote(data?.note ?? "");
      setStatus("Personalization loaded");
    } catch (error) {
      setStatus(error?.response?.data?.message ?? "Failed to load personalization");
    }
  };

  const handleSave = async () => {
    if (!studentId || !note.trim()) return;
    try {
      await updateStudentPersonalization(Number(studentId), note.trim());
      setStatus("Personalization saved");
    } catch (error) {
      setStatus(error?.response?.data?.message ?? "Failed to save personalization");
    }
  };

  return (
    <section className="teacher-personalization-page">
      <h1>Personalization</h1>
      <p>Add per-student context so AI feedback stays personalized.</p>

      {status ? <p className="teacher-personalization-status">{status}</p> : null}

      <div className="teacher-personalization-form">
        <label>
          Student user id
          <input value={studentId} onChange={(event) => setStudentId(event.target.value)} placeholder="e.g. 12" />
        </label>
        <button type="button" onClick={handleLoad}>
          Load
        </button>

        <label>
          Teacher personalization note
          <textarea
            value={note}
            maxLength={1000}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Старательный, но иногда ленится на простых задачах."
          />
        </label>
        <button type="button" onClick={handleSave}>
          Save note
        </button>
      </div>
    </section>
  );
}

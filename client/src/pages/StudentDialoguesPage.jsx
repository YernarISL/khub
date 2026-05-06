import React, { useEffect, useMemo, useState } from "react";
import { getDialogueMessages, searchTeacherDialogues, sendDialogueMessage } from "../services/teacherWorkflowService";
import "../styles/TeacherDialoguesPage.css";

export default function StudentDialoguesPage() {
  const [query, setQuery] = useState("");
  const [dialogues, setDialogues] = useState([]);
  const [selectedDialogueId, setSelectedDialogueId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageBody, setMessageBody] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const selectedDialogue = useMemo(
    () => dialogues.find((item) => item.dialogueId === selectedDialogueId) ?? null,
    [dialogues, selectedDialogueId],
  );

  const loadDialogues = async (search = "") => {
    try {
      const data = await searchTeacherDialogues(search);
      setDialogues(data);
      if (!selectedDialogueId && data[0]) {
        setSelectedDialogueId(data[0].dialogueId);
      }
    } catch (error) {
      setStatus(error?.response?.data?.message ?? "Failed to load dialogues");
    }
  };

  const loadTimeline = async (dialogueId) => {
    if (!dialogueId) return;
    try {
      const timeline = await getDialogueMessages(dialogueId);
      setMessages(timeline);
    } catch (error) {
      setStatus(error?.response?.data?.message ?? "Failed to load timeline");
    }
  };

  useEffect(() => {
    loadDialogues();
  }, []);

  useEffect(() => {
    loadTimeline(selectedDialogueId);
  }, [selectedDialogueId]);

  const handleSearch = async (event) => {
    event.preventDefault();
    await loadDialogues(query.trim());
  };

  const handleSendMessage = async () => {
    const text = messageBody.trim();
    if (!selectedDialogueId || !text) return;
    setIsLoading(true);
    try {
      await sendDialogueMessage(selectedDialogueId, text);
      setMessageBody("");
      await loadTimeline(selectedDialogueId);
      await loadDialogues(query.trim());
      setStatus("Message sent");
    } catch (error) {
      setStatus(error?.response?.data?.message ?? "Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="teacher-dialogues-page">
      <header className="teacher-dialogues-header">
        <h1>Dialogues</h1>
        <p>Chat with your teacher and receive approved feedback responses.</p>
      </header>

      {status ? <p className="teacher-dialogues-status">{status}</p> : null}

      <div className="teacher-dialogues-layout">
        <aside className="teacher-dialogues-sidebar">
          <div className="teacher-dialogues-sidebar-head">
            <h2>Conversations</h2>
            <span>{dialogues.length}</span>
          </div>
          <form className="teacher-dialogues-search" onSubmit={handleSearch}>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search teacher"
            />
          </form>
          <div className="teacher-dialogues-list">
            {dialogues.map((dialogue) => (
              <button
                key={dialogue.dialogueId}
                type="button"
                className={`teacher-dialogues-list-item${selectedDialogueId === dialogue.dialogueId ? " is-active" : ""}`}
                onClick={() => setSelectedDialogueId(dialogue.dialogueId)}
              >
                <div className="teacher-dialogues-list-title">
                  <strong>{dialogue.teacherUsername ?? dialogue.participantLabel ?? "Teacher"}</strong>
                  <small>{dialogue.lastMessageAt ? new Date(dialogue.lastMessageAt).toLocaleDateString() : ""}</small>
                </div>
                <span>{dialogue.lastMessagePreview || "No messages yet"}</span>
              </button>
            ))}
          </div>
        </aside>

        <div className="teacher-dialogues-main">
          <header className="teacher-dialogues-chat-head">
            <div>
              <h3>{selectedDialogue?.teacherUsername ?? "Select a dialogue"}</h3>
              <p>{selectedDialogue?.teacherFullName ?? "Teacher information"}</p>
            </div>
          </header>

          <div className="teacher-dialogues-timeline">
            {messages.map((message) => (
              <article key={message.id} className={`teacher-dialogues-msg teacher-dialogues-msg-${String(message.senderRole).toLowerCase()}`}>
                <strong>{message.senderRole === "AI" ? "Teacher AI" : message.senderRole}</strong>
                <p>{message.body}</p>
                {message.grade_0_10 !== null ? <small>Grade: {message.grade_0_10}/10</small> : null}
              </article>
            ))}
          </div>

          <div className="teacher-dialogues-compose">
            <textarea
              value={messageBody}
              onChange={(event) => setMessageBody(event.target.value)}
              placeholder="Type a message to teacher"
            />
            <div className="teacher-dialogues-actions">
              <button type="button" className="teacher-dialogues-btn-primary" onClick={handleSendMessage} disabled={isLoading}>
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

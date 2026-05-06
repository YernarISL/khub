import React, { useEffect, useMemo, useState } from "react";
import {
  approveDraftAndSend,
  createOrGetDialogue,
  generateDialogueDraft,
  getDialogueMessages,
  listDialogueDrafts,
  rejectDraft,
  searchTeacherDialogues,
  sendDialogueMessage,
} from "../services/teacherWorkflowService";
import "../styles/TeacherDialoguesPage.css";

export default function TeacherDialoguesPage() {
  const [query, setQuery] = useState("");
  const [dialogues, setDialogues] = useState([]);
  const [selectedDialogueId, setSelectedDialogueId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [draftEdit, setDraftEdit] = useState({ text: "", grade: "" });
  const [messageBody, setMessageBody] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const selectedDraft = useMemo(() => drafts[0] ?? null, [drafts]);
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
      const [timeline, draftList] = await Promise.all([
        getDialogueMessages(dialogueId),
        listDialogueDrafts(dialogueId),
      ]);
      setMessages(timeline);
      setDrafts(draftList);
      if (draftList[0]) {
        setDraftEdit({
          text: draftList[0].feedbackText ?? "",
          grade: draftList[0].grade_0_10 ?? "",
        });
      } else {
        setDraftEdit({ text: "", grade: "" });
      }
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

  const handleGenerateDraft = async () => {
    if (!selectedDialogueId) return;
    setIsLoading(true);
    try {
      await generateDialogueDraft(selectedDialogueId);
      await loadTimeline(selectedDialogueId);
      setStatus("AI draft generated");
    } catch (error) {
      setStatus(error?.response?.data?.message ?? "Draft generation failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveDraft = async () => {
    if (!selectedDraft) return;
    setIsLoading(true);
    try {
      await approveDraftAndSend(selectedDraft.id, {
        feedbackText: draftEdit.text,
        grade_0_10: draftEdit.grade === "" ? null : Number(draftEdit.grade),
      });
      await loadTimeline(selectedDialogueId);
      setStatus("AI feedback sent");
    } catch (error) {
      setStatus(error?.response?.data?.message ?? "Failed to approve draft");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectDraft = async () => {
    if (!selectedDraft) return;
    setIsLoading(true);
    try {
      await rejectDraft(selectedDraft.id);
      await loadTimeline(selectedDialogueId);
      setStatus("Draft rejected");
    } catch (error) {
      setStatus(error?.response?.data?.message ?? "Failed to reject draft");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="teacher-dialogues-page">
      <header className="teacher-dialogues-header">
        <h1>Dialogues</h1>
        <p>Communicate with students, review PDF submissions, and approve AI feedback before sending.</p>
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
              placeholder="Search students"
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
                  <strong>{dialogue.studentUsername}</strong>
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
              <h3>{selectedDialogue?.studentUsername ?? "Select a dialogue"}</h3>
              <p>{selectedDialogue?.studentFullName ?? "Student information"}</p>
            </div>
            <button type="button" className="teacher-dialogues-ai-toggle" disabled>
              Disable AI
            </button>
          </header>

          <div className="teacher-dialogues-timeline">
            {messages.map((message) => (
              <article key={message.id} className={`teacher-dialogues-msg teacher-dialogues-msg-${String(message.senderRole).toLowerCase()}`}>
                <strong>{message.senderRole === "AI" ? "Nexus AI" : message.senderRole}</strong>
                <p>{message.body}</p>
                {message.grade_0_10 !== null ? <small>Grade: {message.grade_0_10}/10</small> : null}
              </article>
            ))}
          </div>

          <div className="teacher-dialogues-compose">
            <textarea
              value={messageBody}
              onChange={(event) => setMessageBody(event.target.value)}
              placeholder="Type a message to student"
            />
            <div className="teacher-dialogues-actions">
              <button type="button" className="teacher-dialogues-btn-primary" onClick={handleSendMessage} disabled={isLoading}>
                Send manually
              </button>
              <button type="button" className="teacher-dialogues-btn-secondary" onClick={handleGenerateDraft} disabled={isLoading}>
                Generate AI feedback
              </button>
            </div>
          </div>
        </div>

        <aside className="teacher-dialogues-drafts">
          <h2>AI review panel</h2>
          {selectedDraft ? (
            <>
              <label>
                Feedback
                <textarea
                  value={draftEdit.text}
                  onChange={(event) => setDraftEdit((prev) => ({ ...prev, text: event.target.value }))}
                />
              </label>
              <label>
                Grade (0-10)
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={draftEdit.grade}
                  onChange={(event) => setDraftEdit((prev) => ({ ...prev, grade: event.target.value }))}
                />
              </label>
              <div className="teacher-dialogues-actions">
                <button type="button" className="teacher-dialogues-btn-primary" onClick={handleApproveDraft} disabled={isLoading}>
                  Approve & send
                </button>
                <button type="button" className="teacher-dialogues-btn-secondary" onClick={handleRejectDraft} disabled={isLoading}>
                  Reject
                </button>
              </div>
            </>
          ) : (
            <p>No drafts yet. Generate from a student PDF submission.</p>
          )}
        </aside>
      </div>
    </section>
  );
}

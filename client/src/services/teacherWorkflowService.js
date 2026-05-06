import { host } from "./index";

export const searchTeacherDialogues = async (query = "") => {
  const response = await host.get(`/teacher-workflow/dialogues?query=${encodeURIComponent(query)}`, {
    withCredentials: true,
  });
  return response.data;
};

export const createOrGetDialogue = async (studentId) => {
  const response = await host.post(
    "/teacher-workflow/dialogues",
    { studentId },
    { withCredentials: true },
  );
  return response.data;
};

export const getDialogueMessages = async (dialogueId) => {
  const response = await host.get(`/teacher-workflow/dialogues/${dialogueId}/messages`, {
    withCredentials: true,
  });
  return response.data;
};

export const sendDialogueMessage = async (dialogueId, body) => {
  const response = await host.post(
    `/teacher-workflow/dialogues/${dialogueId}/messages`,
    { body },
    { withCredentials: true },
  );
  return response.data;
};

export const generateDialogueDraft = async (dialogueId) => {
  const response = await host.post(
    `/teacher-workflow/dialogues/${dialogueId}/drafts/generate`,
    {},
    { withCredentials: true },
  );
  return response.data;
};

export const listDialogueDrafts = async (dialogueId) => {
  const response = await host.get(`/teacher-workflow/dialogues/${dialogueId}/drafts`, {
    withCredentials: true,
  });
  return response.data;
};

export const approveDraftAndSend = async (draftId, payload) => {
  const response = await host.post(
    `/teacher-workflow/drafts/${draftId}/approve-send`,
    payload,
    { withCredentials: true },
  );
  return response.data;
};

export const rejectDraft = async (draftId) => {
  const response = await host.post(
    `/teacher-workflow/drafts/${draftId}/reject`,
    {},
    { withCredentials: true },
  );
  return response.data;
};

export const getStudentPersonalization = async (studentId) => {
  const response = await host.get(`/teacher-workflow/personalization/${studentId}`, {
    withCredentials: true,
  });
  return response.data;
};

export const updateStudentPersonalization = async (studentId, note) => {
  const response = await host.put(
    `/teacher-workflow/personalization/${studentId}`,
    { note },
    { withCredentials: true },
  );
  return response.data;
};

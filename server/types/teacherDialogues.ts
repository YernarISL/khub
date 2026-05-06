export interface DialogueListItemDto {
  dialogueId: number;
  studentId: number;
  studentUsername: string;
  studentFullName: string;
  lastMessagePreview: string;
  lastMessageAt: string | null;
}

export interface DialogueMessageDto {
  id: number;
  dialogueId: number;
  senderId: number;
  senderRole: "TEACHER" | "STUDENT" | "AI";
  source: "MANUAL" | "AI_DRAFT";
  status: "draft_ai" | "draft_teacher" | "ready_for_review" | "approved_sent" | "rejected";
  body: string;
  grade_0_10: number | null;
  sentByTeacher: boolean;
  createdAt: string;
  attachments: Array<{
    id: number;
    originalName: string;
    mimeType: string;
    parseStatus: "pending" | "parsed" | "failed";
  }>;
}

export interface AIFeedbackDraftDto {
  id: number;
  dialogueId: number;
  messageId: number;
  status: "ready_for_review" | "approved_sent" | "rejected" | "failed";
  feedbackText: string | null;
  grade_0_10: number | null;
  confidence: number | null;
  keyPoints: string[];
  refusalReason: string | null;
  errorReason: string | null;
  createdAt: string;
}

import { host } from "./index";

export const getStudentCourses = async () => {
  const response = await host.get("/teacher-workflow/student/courses", {
    withCredentials: true,
  });
  return response.data;
};

export const getCourseAssignments = async (courseId) => {
  const response = await host.get(`/teacher-workflow/student/courses/${courseId}/assignments`, {
    withCredentials: true,
  });
  return response.data;
};

export const createStudentDialogueByCourse = async (courseId) => {
  const response = await host.post(
    "/teacher-workflow/student/dialogues/by-course",
    { courseId },
    { withCredentials: true },
  );
  return response.data;
};

export const uploadAssignmentPdf = async (dialogueId, payload) => {
  const formData = new FormData();
  if (payload.pdfFile) {
    formData.append("pdfFile", payload.pdfFile);
  }
  formData.append("courseId", String(payload.courseId));
  formData.append("assignmentRef", String(payload.assignmentRef));
  formData.append("assignmentLabel", String(payload.assignmentLabel));
  if (payload.text) {
    formData.append("text", payload.text);
  }

  const response = await host.post(
    `/teacher-workflow/dialogues/${dialogueId}/messages/upload-pdf`,
    formData,
    {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return response.data;
};

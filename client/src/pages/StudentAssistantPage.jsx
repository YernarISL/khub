import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  createStudentDialogueByCourse,
  getCourseAssignments,
  getStudentCourses,
  uploadAssignmentPdf,
} from "../services/studentAssistantService";
import "../styles/StudentAssistantPage.css";

export default function StudentAssistantPage() {
  const { t } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [assignmentRef, setAssignmentRef] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadCourses = async () => {
      setIsLoadingCourses(true);
      try {
        const data = await getStudentCourses();
        setCourses(Array.isArray(data) ? data : []);
      } catch (error) {
        setStatus(error?.response?.data?.message ?? t("studentAssistant.errors.loadCourses"));
      } finally {
        setIsLoadingCourses(false);
      }
    };
    loadCourses();
  }, [t]);

  useEffect(() => {
    if (!courseId) {
      setAssignments([]);
      setAssignmentRef("");
      return;
    }

    const loadAssignments = async () => {
      setIsLoadingAssignments(true);
      try {
        const data = await getCourseAssignments(courseId);
        setAssignments(Array.isArray(data) ? data : []);
      } catch (error) {
        setStatus(error?.response?.data?.message ?? t("studentAssistant.errors.loadAssignments"));
      } finally {
        setIsLoadingAssignments(false);
      }
    };
    loadAssignments();
  }, [courseId, t]);

  const selectedAssignment = useMemo(
    () => assignments.find((assignment) => String(assignment.id) === String(assignmentRef)),
    [assignments, assignmentRef],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!courseId || !assignmentRef || (!file && !note.trim())) {
      setStatus(t("studentAssistant.errors.required"));
      return;
    }

    setIsSubmitting(true);
    setStatus("");
    try {
      const { dialogueId } = await createStudentDialogueByCourse(Number(courseId));
      const response = await uploadAssignmentPdf(dialogueId, {
        pdfFile: file,
        courseId,
        assignmentRef,
        assignmentLabel: selectedAssignment?.label ?? "",
        text: note.trim(),
      });

      if (response?.draftGenerationFailed) {
        setStatus(t("studentAssistant.status.uploadedWithDraftError"));
      } else if (response?.autoDraft?.id) {
        setStatus(t("studentAssistant.status.uploadedAndDraftReady"));
      } else {
        setStatus(t("studentAssistant.status.uploaded"));
      }

      setFile(null);
      setNote("");
    } catch (error) {
      setStatus(error?.response?.data?.message ?? t("studentAssistant.errors.upload"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="student-assistant-page">
      <h1>{t("studentAssistant.title")}</h1>
      <p>{t("studentAssistant.subtitle")}</p>
      {status ? <p className="student-assistant-status">{status}</p> : null}

      <form className="student-assistant-form" onSubmit={handleSubmit}>
        <label>
          {t("studentAssistant.courseLabel")}
          <select value={courseId} onChange={(event) => setCourseId(event.target.value)} disabled={isLoadingCourses}>
            <option value="">{t("studentAssistant.coursePlaceholder")}</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title} ({course.code})
              </option>
            ))}
          </select>
        </label>

        <label>
          {t("studentAssistant.assignmentLabel")}
          <select
            value={assignmentRef}
            onChange={(event) => setAssignmentRef(event.target.value)}
            disabled={!courseId || isLoadingAssignments}
          >
            <option value="">{t("studentAssistant.assignmentPlaceholder")}</option>
            {assignments.map((assignment) => (
              <option key={assignment.id} value={assignment.id}>
                {assignment.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          {t("studentAssistant.fileLabel")}
          <input
            type="file"
            accept="application/pdf"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        </label>

        <label>
          {t("studentAssistant.noteLabel")}
          <textarea
            value={note}
            maxLength={500}
            onChange={(event) => setNote(event.target.value)}
            placeholder={t("studentAssistant.notePlaceholder")}
          />
        </label>

        <button type="submit" disabled={isSubmitting || !courseId || !assignmentRef || (!file && !note.trim())}>
          {isSubmitting ? t("studentAssistant.submitting") : t("studentAssistant.submit")}
        </button>
      </form>
    </section>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import "../styles/AnalyticsPage.css";
import { getAnalyticsOverview } from "../services/adminServise";

export default function AnalyticsPage() {
  const [overview, setOverview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadOverview = async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await getAnalyticsOverview();
        if (isMounted) {
          setOverview(data);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError?.response?.data?.message ?? "Failed to load analytics overview.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadOverview();
    return () => {
      isMounted = false;
    };
  }, []);

  const kpis = overview?.kpis ?? {
    activeStudents: 0,
    avgCompletionPct: 0,
    highRiskStudents: 0,
    interventionSuccessPct: 0,
  };
  const trend = overview?.trend ?? [];
  const interventions = overview?.priorityInterventions ?? [];
  const confidencePct =
    (overview?.meta?.kpisSource === "live" ? 34 : 0) +
    (overview?.meta?.trendSource === "live" ? 33 : 0) +
    (overview?.meta?.interventionsSource === "live" ? 33 : 0);

  const chartPoints = useMemo(() => {
    if (trend.length === 0) {
      return { actual: "", predicted: "", months: [] };
    }

    const width = 680;
    const height = 220;
    const innerTop = 20;
    const innerBottom = height - 24;
    const innerLeft = 16;
    const innerRight = width - 20;
    const scaleX = (index) =>
      trend.length === 1
        ? innerLeft
        : innerLeft + (index / (trend.length - 1)) * (innerRight - innerLeft);
    const scaleY = (value) => innerBottom - (Math.min(100, Math.max(0, value)) / 100) * (innerBottom - innerTop);

    return {
      actual: trend.map((point, index) => `${scaleX(index)},${scaleY(point.actualPct)}`).join(" "),
      predicted: trend.map((point, index) => `${scaleX(index)},${scaleY(point.predictedPct)}`).join(" "),
      months: trend.map((point) => point.month),
    };
  }, [trend]);

  if (isLoading) {
    return (
      <div className="analytics-page">
        <p className="analytics-loading">Loading manager analytics...</p>
      </div>
    );
  }

  if (!overview && error) {
    return (
      <div className="analytics-page">
        <p className="analytics-error">{error}</p>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Active Students",
      value: kpis.activeStudents.toLocaleString(),
      trend: "Enrolled students with activity",
      trendType: "neutral",
    },
    {
      title: "Avg. Course Completion",
      value: `${Number(kpis.avgCompletionPct).toFixed(1)}%`,
      trend: "Computed from LMS + ML course progress",
      trendType: "positive",
    },
    {
      title: "High Risk Students",
      value: kpis.highRiskStudents.toLocaleString(),
      trend: "Identified from dropout and inactivity signals",
      trendType: "negative",
    },
    {
      title: "AI Intervention Success",
      value: `${Number(kpis.interventionSuccessPct).toFixed(1)}%`,
      trend: "Students with positive score trend",
      trendType: "positive",
    },
  ];

  return (
    <div className="analytics-page">
      <header className="analytics-header">
        <div>
          <h1 className="analytics-page-title">Institutional AI Analytics</h1>
          <p className="analytics-page-lead">
            Predictive insights and intervention priorities across active learning cohorts.
          </p>
        </div>
        <div className="analytics-confidence">
          <span className="analytics-confidence-label">Model Confidence</span>
          <strong>{confidencePct.toFixed(1)}%</strong>
        </div>
      </header>

      {error ? <p className="analytics-error">{error}</p> : null}

      <section className="analytics-stats-grid" aria-label="Key institution metrics">
        {statCards.map((card) => (
          <article key={card.title} className="analytics-stat-card">
            <p className="analytics-stat-title">{card.title}</p>
            <p className="analytics-stat-value">{card.value}</p>
            <p className={`analytics-stat-trend analytics-stat-trend--${card.trendType}`}>{card.trend}</p>
          </article>
        ))}
      </section>

      <section className="analytics-main-grid">
        <article className="analytics-chart-card">
          <header className="analytics-section-headline">
            <h2>Predicted vs Actual Performance</h2>
            <p>Last available monthly timeline based on LMS event scores.</p>
          </header>
          <div className="analytics-chart-mock">
            {trend.length === 0 ? (
              <p className="analytics-empty">No trend data available yet.</p>
            ) : (
              <>
                <svg viewBox="0 0 680 220" role="img" aria-label="Predicted and actual performance chart">
                  <line x1="16" y1="196" x2="660" y2="196" stroke="#e2e8f0" />
                  <polyline fill="none" stroke="#6366f1" strokeWidth="3" points={chartPoints.predicted} />
                  <polyline fill="none" stroke="#22c55e" strokeWidth="3" points={chartPoints.actual} />
                </svg>
                <ul className="analytics-chart-axis">
                  {chartPoints.months.map((month) => (
                    <li key={month}>{month}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </article>

        <aside className="analytics-interventions-card">
          <header className="analytics-section-headline">
            <h2>Priority Interventions</h2>
            <p>Students requiring immediate manager follow-up.</p>
          </header>

          {interventions.length === 0 ? (
            <p className="analytics-empty">No interventions required right now.</p>
          ) : (
            <div className="analytics-interventions-list">
              {interventions.map((student) => (
                <article key={student.studentId} className="analytics-intervention-item">
                  <div className="analytics-intervention-row">
                    <strong>{student.studentName}</strong>
                    <span>Risk Score {Math.round(student.riskScorePct)}</span>
                  </div>
                  <p className="analytics-intervention-course">{student.courseName}</p>
                  <div className="analytics-risk-track" aria-hidden="true">
                    <span style={{ width: `${student.riskScorePct}%` }} />
                  </div>
                  <p className="analytics-intervention-issue">{student.reason}</p>
                </article>
              ))}
            </div>
          )}

          <button type="button" className="analytics-view-all-btn">
            Open interventions queue
          </button>
        </aside>
      </section>
    </div>
  );
}

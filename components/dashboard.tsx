"use client";

import {
  CalendarDays, CircleCheck, Fingerprint, MessageSquare,
  QrCode, Sparkles, Trophy, UploadCloud, Flame, BookOpen,
  TrendingUp, Users, Clock, Zap, BarChart3, Star, ArrowRight
} from "lucide-react";
import type { Role } from "@/types/domain";
import { activities, assignments, courses, leaderboard, metrics, resources, tests } from "@/lib/data";
import { AttendanceChart, DepartmentChart } from "@/components/charts";
import { useState } from "react";

const toneClass: Record<string, string> = {
  success: "tone-success",
  warning: "tone-warning",
  danger: "tone-danger",
  neutral: "tone-neutral"
};

const metricGlow: Record<number, { color: string; bg: string; border: string }> = {
  0: { color: "#00ffe0", bg: "rgba(0,255,200,0.06)", border: "rgba(0,255,200,0.15)" },
  1: { color: "#ff0aff", bg: "rgba(255,10,255,0.06)", border: "rgba(255,10,255,0.15)" },
  2: { color: "#ffec00", bg: "rgba(255,236,0,0.06)", border: "rgba(255,236,0,0.15)" },
  3: { color: "#9d00ff", bg: "rgba(157,0,255,0.06)", border: "rgba(157,0,255,0.15)" },
};

const metricIcons = [<TrendingUp size={40} />, <Flame size={40} />, <Star size={40} />, <Clock size={40} />];

const courseGradients = [
  "linear-gradient(135deg, rgba(0,255,200,0.15) 0%, rgba(0,128,255,0.06) 100%)",
  "linear-gradient(135deg, rgba(255,10,255,0.15) 0%, rgba(157,0,255,0.06) 100%)",
  "linear-gradient(135deg, rgba(255,236,0,0.15) 0%, rgba(255,107,0,0.06) 100%)",
  "linear-gradient(135deg, rgba(157,0,255,0.15) 0%, rgba(0,128,255,0.06) 100%)",
];

const courseBorders = [
  "rgba(0,255,200,0.25)", "rgba(255,10,255,0.25)",
  "rgba(255,236,0,0.25)", "rgba(157,0,255,0.25)"
];

const courseProgressColors = [
  ["#00ffe0", "#0080ff"], ["#ff0aff", "#9d00ff"],
  ["#ffec00", "#ff6b00"], ["#9d00ff", "#0080ff"]
];

const badgeColors = ["rank-1", "rank-2", "rank-3", "tone-neutral"];
const badgeMedals = ["🥇", "🥈", "🥉", "4"];

const activityDots = ["#00ffe0", "#ff0aff", "#ffec00", "#9d00ff"];

export function Dashboard({ role, section = "dashboard" }: { role: Role; section?: string }) {
  const title = section.replaceAll("-", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  const [aiPrompt, setAiPrompt] = useState("Create a 7-day DBMS revision plan based on weak joins and normalization scores.");
  const [aiLoading, setAiLoading] = useState(false);

  function handleAI(e: React.FormEvent) {
    e.preventDefault();
    setAiLoading(true);
    setTimeout(() => setAiLoading(false), 2000);
  }

  return (
    <div className="space-y-5 animate-slide-up">

      {/* ── Hero Banner ─────────────────────────────────────────── */}
      <section className="grid gap-4 lg:grid-cols-[1.4fr_.6fr]">
        {/* Left hero */}
        <div
          className="card-chaos holographic rounded-2xl p-7 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(0,255,200,0.06) 0%, rgba(0,0,0,0.85) 60%, rgba(157,0,255,0.06) 100%)",
            minHeight: 200
          }}
        >
          {/* Decorative corner */}
          <div className="absolute top-0 right-0 w-48 h-48 opacity-10"
            style={{
              background: "radial-gradient(circle at top right, #00ffe0, transparent 70%)",
            }}
          />
          <div className="absolute bottom-0 left-0 w-32 h-32 opacity-8"
            style={{
              background: "radial-gradient(circle at bottom left, #9d00ff, transparent 70%)",
            }}
          />

          <p className="text-xs font-bold tracking-widest uppercase mb-3 neon-cyan">
            ◈ Kings Engineering College
          </p>
          <h2 className="text-4xl font-bold tracking-tight mb-3" style={{ lineHeight: 1.1 }}>
            <span style={{ color: "#e2f0ff" }}>{title}</span>
          </h2>
          <p className="text-sm leading-7 mb-6" style={{ color: "rgba(180,210,255,0.55)", maxWidth: 520 }}>
            Smart attendance, learning paths, exams, collaboration, library, gamification,
            and AI guidance — all in one campus command center.
          </p>

          <div className="flex flex-wrap gap-3">
            <button id="hero-qr-btn" className="btn-chaos btn-primary">
              <QrCode size={15} /> Generate QR
            </button>
            <button id="hero-ai-btn" className="btn-chaos btn-pink">
              <Sparkles size={15} /> Ask AI
            </button>
          </div>
        </div>

        {/* Security card */}
        <div
          className="card-chaos card-cyan rounded-2xl p-6 relative overflow-hidden"
          style={{ background: "linear-gradient(145deg, rgba(0,255,200,0.05) 0%, rgba(0,0,0,0.9) 100%)" }}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: "rgba(0,255,200,0.6)" }}>
                Security Score
              </p>
              <p className="text-5xl font-bold font-mono neon-cyan glow-cyan" style={{ lineHeight: 1 }}>
                98.4
              </p>
            </div>
            <Fingerprint size={52} style={{ color: "#00ffe0", opacity: 0.25 }} className="animate-pulse-glow" />
          </div>

          <div className="chaos-divider" />

          <div className="grid grid-cols-3 gap-2 text-center">
            {["Face", "Geo", "QR"].map((label, i) => (
              <div
                key={label}
                className="rounded-xl py-2 px-1"
                style={{
                  background: "rgba(0,255,200,0.05)",
                  border: "1px solid rgba(0,255,200,0.1)"
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full mx-auto mb-1 animate-pulse-glow"
                  style={{ background: "#00ffe0", boxShadow: "0 0 6px #00ffe0" }}
                />
                <p className="text-xs font-semibold" style={{ color: "#00ffe0", fontSize: "9px", letterSpacing: "0.1em" }}>
                  {label === "Face" ? "FACE VERIFIED" : label === "Geo" ? "GEO LOCKED" : "QR ROTATED"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Metric Cards ────────────────────────────────────────── */}
      <section className="grid gap-4 grid-cols-2 xl:grid-cols-4">
        {metrics[role].map((metric, i) => {
          const g = metricGlow[i];
          return (
            <div
              key={metric.label}
              className="card-chaos metric-card rounded-2xl"
              style={{ background: g.bg, border: `1px solid ${g.border}` }}
            >
              <div className="metric-icon" style={{ color: g.color }}>{metricIcons[i]}</div>
              <p className="metric-label">{metric.label}</p>
              <p className="metric-val" style={{ color: g.color }}>{metric.value}</p>
              <p className={`mt-2 text-xs font-medium ${toneClass[metric.tone]}`}>{metric.delta}</p>
            </div>
          );
        })}
      </section>

      {/* ── Charts ──────────────────────────────────────────────── */}
      <section className="grid gap-4 xl:grid-cols-2">
        <div className="card-chaos card-cyan rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold" style={{ color: "#e2f0ff" }}>Attendance Intelligence</h3>
              <p className="text-xs mt-0.5" style={{ color: "rgba(0,255,200,0.6)" }}>Week overview · face-verified</p>
            </div>
            <span className="badge badge-cyan animate-pulse-glow">⬤ REALTIME</span>
          </div>
          <AttendanceChart />
        </div>

        <div className="card-chaos card-yellow rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold" style={{ color: "#e2f0ff" }}>Department Comparison</h3>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,236,0,0.6)" }}>Attendance index today</p>
            </div>
            <span className="badge badge-yellow">TODAY</span>
          </div>
          <DepartmentChart />
        </div>
      </section>

      {/* ── Learning Paths ──────────────────────────────────────── */}
      <section className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
        <div className="card-chaos rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold" style={{ color: "#e2f0ff" }}>Learning Paths</h3>
            <button className="btn-chaos btn-secondary text-xs" style={{ height: 32, padding: "0 12px" }}>
              View All <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-4">
            {courses.map((course, i) => {
              const [c1, c2] = courseProgressColors[i];
              return (
                <div
                  key={course.title}
                  className="rounded-xl p-4 transition-all"
                  style={{ background: courseGradients[i], border: `1px solid ${courseBorders[i]}` }}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-bold text-sm" style={{ color: "#e2f0ff" }}>{course.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: "rgba(180,210,255,0.5)" }}>
                        {course.department} · {course.modules} modules · {course.level}
                      </p>
                    </div>
                    <span className="text-sm font-bold font-mono shrink-0" style={{ color: c1 }}>
                      {course.progress}%
                    </span>
                  </div>
                  <div className="chaos-progress">
                    <div
                      className="chaos-progress-bar"
                      style={{
                        width: `${course.progress}%`,
                        background: `linear-gradient(90deg, ${c1}, ${c2})`,
                        boxShadow: `0 0 10px ${c1}60`
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right grid: assignments + tests + library + leaderboard */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Assignments */}
          <div className="card-chaos card-pink rounded-2xl p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold mb-4" style={{ color: "#e2f0ff" }}>
              <UploadCloud size={16} style={{ color: "#ff0aff" }} /> Assignments
            </h3>
            <div className="space-y-3">
              {assignments.map((item) => {
                const statusColor = item.status === "Open" ? "#00ffe0" : item.status === "Submitted" ? "#30d158" : "#ffec00";
                return (
                  <div
                    key={item.title}
                    className="rounded-xl p-3"
                    style={{ background: "rgba(255,10,255,0.04)", border: "1px solid rgba(255,10,255,0.1)" }}
                  >
                    <p className="font-semibold text-xs" style={{ color: "#e2f0ff" }}>{item.title}</p>
                    <p className="text-xs mt-1" style={{ color: "rgba(180,210,255,0.5)" }}>{item.course}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs" style={{ color: "rgba(180,210,255,0.4)" }}>{item.due}</span>
                      <span className="badge" style={{ background: `${statusColor}15`, color: statusColor, borderColor: `${statusColor}30`, fontSize: "8px", padding: "2px 7px" }}>
                        {item.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tests */}
          <div className="card-chaos card-purple rounded-2xl p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold mb-4" style={{ color: "#e2f0ff" }}>
              <CalendarDays size={16} style={{ color: "#c47fff" }} /> Tests
            </h3>
            <div className="space-y-3">
              {tests.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl p-3"
                  style={{ background: "rgba(157,0,255,0.05)", border: "1px solid rgba(157,0,255,0.12)" }}
                >
                  <p className="font-semibold text-xs" style={{ color: "#e2f0ff" }}>{item.title}</p>
                  <p className="text-xs mt-1" style={{ color: "rgba(180,210,255,0.5)" }}>{item.mode}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs" style={{ color: "rgba(180,210,255,0.4)" }}>{item.starts}</span>
                    <span className="badge badge-purple" style={{ fontSize: "8px", padding: "2px 7px" }}>{item.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Library */}
          <div className="card-chaos rounded-2xl p-5" style={{ border: "1px solid rgba(0,128,255,0.15)" }}>
            <h3 className="flex items-center gap-2 text-sm font-bold mb-4" style={{ color: "#e2f0ff" }}>
              <BookOpen size={16} style={{ color: "#0080ff" }} /> Library
            </h3>
            <div className="space-y-3">
              {resources.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl p-3"
                  style={{ background: "rgba(0,128,255,0.05)", border: "1px solid rgba(0,128,255,0.1)" }}
                >
                  <p className="font-semibold text-xs" style={{ color: "#e2f0ff" }}>{item.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs" style={{ color: "rgba(180,210,255,0.4)" }}>{item.subject}</span>
                    <span className="text-xs font-mono" style={{ color: "#0080ff" }}>↓ {item.downloads.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="card-chaos card-yellow rounded-2xl p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold mb-4" style={{ color: "#e2f0ff" }}>
              <Trophy size={16} style={{ color: "#ffec00" }} /> Leaderboard
            </h3>
            <div className="space-y-2">
              {leaderboard.map((item, i) => (
                <div
                  key={item.name}
                  className="flex items-center gap-3 rounded-xl p-3"
                  style={{
                    background: i === 0 ? "rgba(255,236,0,0.07)" : "rgba(255,255,255,0.03)",
                    border: i === 0 ? "1px solid rgba(255,236,0,0.2)" : "1px solid rgba(255,255,255,0.05)"
                  }}
                >
                  <span className={`text-sm font-bold w-5 text-center ${badgeColors[i]}`}>{badgeMedals[i]}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-xs truncate" style={{ color: "#e2f0ff" }}>{item.name}</p>
                    <p className="text-xs" style={{ color: "rgba(180,210,255,0.45)", fontSize: "10px" }}>{item.badge}</p>
                  </div>
                  <span className="text-xs font-mono shrink-0" style={{ color: i === 0 ? "#ffec00" : "rgba(180,210,255,0.5)" }}>
                    {item.score.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Activity + AI Assistant ──────────────────────────────── */}
      <section className="grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
        {/* Realtime Activity */}
        <div className="card-chaos rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="flex items-center gap-2 text-base font-bold" style={{ color: "#e2f0ff" }}>
              <MessageSquare size={17} style={{ color: "#00ffe0" }} /> Realtime Activity
            </h3>
            <span className="badge badge-cyan animate-pulse-glow">⬤ LIVE</span>
          </div>
          <div className="space-y-3">
            {activities.map((activity, i) => (
              <div
                key={activity.title}
                className="flex gap-4 rounded-xl p-4"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  transition: "all 0.2s ease"
                }}
              >
                <div
                  className="activity-dot mt-1.5 flex-shrink-0"
                  style={{ background: activityDots[i], boxShadow: `0 0 8px ${activityDots[i]}` }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: "#e2f0ff" }}>{activity.title}</p>
                  <p className="text-xs mt-1 leading-5" style={{ color: "rgba(180,210,255,0.5)" }}>{activity.detail}</p>
                </div>
                <span className="text-xs shrink-0 font-mono mt-0.5" style={{ color: "rgba(120,160,200,0.4)" }}>{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Learning Assistant */}
        <div
          className="card-chaos holographic rounded-2xl p-6"
          style={{
            background: "linear-gradient(145deg, rgba(157,0,255,0.08) 0%, rgba(0,0,0,0.9) 60%, rgba(255,10,255,0.05) 100%)",
            border: "1px solid rgba(157,0,255,0.2)"
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-8 h-8 rounded-xl grid place-items-center"
              style={{ background: "rgba(157,0,255,0.15)", border: "1px solid rgba(157,0,255,0.3)" }}
            >
              <Zap size={16} style={{ color: "#c47fff" }} />
            </div>
            <div>
              <h3 className="text-sm font-bold" style={{ color: "#e2f0ff" }}>AI Learning Assistant</h3>
              <p className="text-xs" style={{ color: "rgba(157,0,255,0.7)" }}>Powered by Campus AI</p>
            </div>
          </div>

          <div className="chaos-divider" />

          <p className="text-xs leading-6 mb-4" style={{ color: "rgba(180,210,255,0.55)" }}>
            Weak-topic detection, resource recommendations, quiz generation, revision planning, and personalized practice.
          </p>

          <form id="ai-study-form" onSubmit={handleAI} className="space-y-3">
            <textarea
              id="ai-study-prompt"
              name="prompt"
              required
              className="input-chaos resize-none"
              style={{ minHeight: 100, fontSize: "12px" }}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />
            <button
              id="ai-study-submit"
              type="submit"
              className="btn-chaos w-full justify-center"
              disabled={aiLoading}
              style={{
                background: aiLoading
                  ? "rgba(157,0,255,0.05)"
                  : "linear-gradient(135deg, rgba(157,0,255,0.18) 0%, rgba(255,10,255,0.1) 100%)",
                borderColor: "rgba(157,0,255,0.4)",
                color: "#c47fff",
                boxShadow: "0 0 20px rgba(157,0,255,0.1)"
              }}
            >
              {aiLoading ? (
                <>
                  <span
                    className="w-3 h-3 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: "#c47fff", borderTopColor: "transparent" }}
                  />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={14} /> Generate Plan
                </>
              )}
            </button>
          </form>

          {/* Quick action chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            {["Revision plan", "Quiz me", "Weak spots", "Resources"].map((chip) => (
              <button
                key={chip}
                className="text-xs px-3 py-1.5 rounded-full transition-all"
                style={{
                  background: "rgba(157,0,255,0.08)",
                  border: "1px solid rgba(157,0,255,0.2)",
                  color: "rgba(196,127,255,0.7)",
                  cursor: "pointer"
                }}
                onClick={() => setAiPrompt(`${chip}: `)}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

"use client";

import { Github, Mail, Zap, Shield, Eye, EyeOff, GraduationCap, ChevronRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validation";
import { createClient } from "@/lib/supabase";
import { z } from "zod";
import { useState } from "react";

type LoginForm = z.infer<typeof loginSchema>;

const features = [
  { icon: "⚡", label: "Smart Attendance", desc: "Face + QR + Geo verified" },
  { icon: "🧠", label: "AI Study Assistant", desc: "Personalized revision plans" },
  { icon: "🏆", label: "Gamified Learning", desc: "XP, streaks, leaderboard" },
  { icon: "🔒", label: "Enterprise Security", desc: "Supabase RLS + Audit logs" },
];

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: true }
  });

  async function onSubmit(values: LoginForm) {
    setIsLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password
    });
    setIsLoading(false);
    if (error) form.setError("root", { message: error.message });
    else location.href = "/dashboard";
  }

  async function oauth(provider: "google" | "github") {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${location.origin}/dashboard` }
    });
  }

  async function magicLink() {
    const email = form.getValues("email");
    if (!email) return form.setError("email", { message: "Enter your campus email first." });
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/dashboard` }
    });
    if (error) form.setError("root", { message: error.message });
  }

  return (
    <main className="relative min-h-screen grid place-items-center px-4 py-12 overflow-hidden">
      {/* Background */}
      <div className="chaos-bg" />
      <div className="chaos-grid" />

      {/* Decorative orbs */}
      <div style={{
        position: "fixed", top: "10%", right: "15%", width: 400, height: 400,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(157,0,255,0.08), transparent 70%)",
        filter: "blur(40px)", pointerEvents: "none"
      }} />
      <div style={{
        position: "fixed", bottom: "10%", left: "10%", width: 300, height: 300,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(0,255,200,0.07), transparent 70%)",
        filter: "blur(40px)", pointerEvents: "none"
      }} />

      <div className="relative z-10 w-full max-w-5xl animate-slide-up">
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            border: "1px solid rgba(0,255,200,0.1)",
            boxShadow: "0 40px 120px rgba(0,0,0,0.8), 0 0 60px rgba(0,255,200,0.04)"
          }}
        >
          {/* ── Left panel ─────────────────────────────────── */}
          <div
            className="relative flex flex-col justify-between p-10 overflow-hidden"
            style={{
              background: "linear-gradient(145deg, rgba(0,255,200,0.05) 0%, rgba(6,12,20,0.98) 50%, rgba(157,0,255,0.05) 100%)",
              minHeight: 580
            }}
          >
            {/* Decorative diagonal line */}
            <div style={{
              position: "absolute", top: 0, right: 0, width: 1, height: "100%",
              background: "linear-gradient(180deg, transparent, rgba(0,255,200,0.15), transparent)"
            }} />

            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-10">
                <div className="logo-ring animate-float">
                  <GraduationCap size={22} style={{ color: "#00ffe0" }} />
                </div>
                <div>
                  <p className="text-sm font-bold neon-cyan" style={{ letterSpacing: "0.05em" }}>Kings Engineering College</p>
                  <p style={{ color: "rgba(180,210,255,0.4)", fontSize: "11px" }}>Smart Campus OS</p>
                </div>
              </div>

              <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: "rgba(0,255,200,0.5)" }}>
                ◈ Platform Features
              </p>

              <h1 className="text-3xl font-bold mb-2" style={{ lineHeight: 1.2, color: "#e2f0ff" }}>
                Campus Digital
                <br />
                <span className="neon-cyan glow-cyan">Learning Hub</span>
              </h1>
              <p className="text-sm leading-6 mb-8" style={{ color: "rgba(180,210,255,0.5)" }}>
                AI-powered platform for students, faculty, and administrators.
              </p>

              <div className="space-y-4">
                {features.map((f) => (
                  <div key={f.label} className="flex items-start gap-3">
                    <span className="text-xl">{f.icon}</span>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "#e2f0ff" }}>{f.label}</p>
                      <p className="text-xs" style={{ color: "rgba(180,210,255,0.5)" }}>{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom badge */}
            <div
              className="rounded-xl p-4 mt-8"
              style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(0,255,200,0.08)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Shield size={14} style={{ color: "#00ffe0" }} />
                <span className="text-xs font-bold neon-cyan" style={{ letterSpacing: "0.1em" }}>ENTERPRISE SECURITY READY</span>
                <div className="w-1.5 h-1.5 rounded-full ml-auto animate-pulse-glow" style={{ background: "#30d158" }} />
              </div>
              <p style={{ color: "rgba(120,160,200,0.5)", fontSize: "11px", lineHeight: 1.6 }}>
                Supabase Auth · Row Level Security · Audit Logging · Device Verification
              </p>
            </div>
          </div>

          {/* ── Right panel — Form ──────────────────────────── */}
          <div
            className="relative flex flex-col justify-center p-10"
            style={{ background: "rgba(2,4,8,0.97)" }}
          >
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-1" style={{ color: "#e2f0ff" }}>Sign In</h2>
              <p style={{ color: "rgba(180,210,255,0.5)", fontSize: "13px" }}>
                Use your verified campus identity.
              </p>
            </div>

            {/* OAuth Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                id="oauth-google-btn"
                type="button"
                className="btn-chaos btn-secondary"
                onClick={() => oauth("google")}
                style={{ height: 44 }}
              >
                <Mail size={16} /> Google
              </button>
              <button
                id="oauth-github-btn"
                type="button"
                className="btn-chaos btn-secondary"
                onClick={() => oauth("github")}
                style={{ height: 44 }}
              >
                <Github size={16} /> GitHub
              </button>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px" style={{ background: "rgba(0,255,200,0.08)" }} />
              <span style={{ color: "rgba(120,160,200,0.4)", fontSize: "11px", letterSpacing: "0.1em" }}>OR EMAIL</span>
              <div className="flex-1 h-px" style={{ background: "rgba(0,255,200,0.08)" }} />
            </div>

            <form id="login-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="login-email"
                  style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", color: "rgba(120,160,200,0.6)", textTransform: "uppercase" }}
                >
                  Campus Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  className="input-chaos"
                  placeholder="you@kingsengineering.edu"
                  {...form.register("email")}
                  style={{ height: 44 }}
                />
                {form.formState.errors.email && (
                  <p style={{ color: "#ff453a", fontSize: "12px" }}>{form.formState.errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="login-password"
                  style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", color: "rgba(120,160,200,0.6)", textTransform: "uppercase" }}
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    className="input-chaos pr-12"
                    placeholder="••••••••"
                    {...form.register("password")}
                    style={{ height: 44, paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "rgba(120,160,200,0.4)", background: "none", border: "none", cursor: "pointer" }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p style={{ color: "#ff453a", fontSize: "12px" }}>{form.formState.errors.password.message}</p>
                )}
              </div>

              {/* Remember + Magic link */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    id="login-remember"
                    type="checkbox"
                    {...form.register("remember")}
                    style={{ accentColor: "#00ffe0" }}
                  />
                  <span style={{ fontSize: "12px", color: "rgba(120,160,200,0.6)" }}>Remember me</span>
                </label>
                <button
                  id="magic-link-btn"
                  type="button"
                  onClick={magicLink}
                  className="flex items-center gap-1 transition-all"
                  style={{
                    fontSize: "12px",
                    color: "#00ffe0",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "inherit"
                  }}
                >
                  <Zap size={12} /> Magic Link
                </button>
              </div>

              {/* Root error */}
              {form.formState.errors.root && (
                <div
                  className="rounded-xl p-3 flex items-center gap-2"
                  style={{ background: "rgba(255,68,58,0.1)", border: "1px solid rgba(255,68,58,0.2)" }}
                >
                  <span style={{ color: "#ff453a", fontSize: "16px" }}>⚠</span>
                  <p style={{ color: "#ff453a", fontSize: "13px" }}>{form.formState.errors.root.message}</p>
                </div>
              )}

              {/* Submit */}
              <button
                id="login-submit-btn"
                type="submit"
                className="btn-chaos btn-primary w-full justify-center"
                disabled={isLoading}
                style={{ height: 48, fontSize: "14px", fontWeight: 700 }}
              >
                {isLoading ? (
                  <>
                    <span
                      className="w-4 h-4 rounded-full border-2 animate-spin"
                      style={{ borderColor: "#00ffe0", borderTopColor: "transparent" }}
                    />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign in Securely <ChevronRight size={16} />
                  </>
                )}
              </button>
            </form>

            <p style={{ textAlign: "center", marginTop: 24, fontSize: "11px", color: "rgba(120,160,200,0.35)" }}>
              Protected by Supabase Auth · Row Level Security enabled
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

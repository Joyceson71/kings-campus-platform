import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  remember: z.boolean().optional()
});

export const attendanceAttemptSchema = z.object({
  sessionId: z.string().uuid(),
  studentId: z.string().uuid(),
  qrToken: z.string().min(32),
  faceConfidence: z.number().min(0).max(1).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  deviceId: z.string().min(16),
  userAgent: z.string().min(4)
});

export const aiPromptSchema = z.object({
  prompt: z.string().min(10).max(2000)
});

export function distanceMeters(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const earth = 6371e3;
  const p1 = (a.latitude * Math.PI) / 180;
  const p2 = (b.latitude * Math.PI) / 180;
  const dp = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dl = ((b.longitude - a.longitude) * Math.PI) / 180;
  const h = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return earth * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

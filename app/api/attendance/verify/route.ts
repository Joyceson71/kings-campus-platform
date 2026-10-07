import { NextRequest, NextResponse } from "next/server";
import { attendanceAttemptSchema, distanceMeters } from "@/lib/validation";
import { createServerSupabase } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  const body = attendanceAttemptSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ accepted: false, reason: "Invalid attendance payload", issues: body.error.flatten() }, { status: 400 });
  }

  const supabase = await createServerSupabase();
  const { data: session, error } = await supabase
    .from("attendance_sessions")
    .select("id, qr_token_hash, expires_at, latitude, longitude, radius_meters, min_face_confidence")
    .eq("id", body.data.sessionId)
    .single();

  if (error || !session) {
    return NextResponse.json({ accepted: false, reason: "Session not found" }, { status: 404 });
  }

  const now = Date.now();
  if (new Date(session.expires_at).getTime() < now) {
    return NextResponse.json({ accepted: false, reason: "QR session expired" }, { status: 409 });
  }

  const distance = distanceMeters(body.data, { latitude: session.latitude, longitude: session.longitude });
  const faceConfidence = body.data.faceConfidence ?? 1;
  const accepted = distance <= session.radius_meters && faceConfidence >= session.min_face_confidence;

  await supabase.from("attendance_logs").insert({
    attendance_session_id: body.data.sessionId,
    student_id: body.data.studentId,
    accepted,
    reason: accepted ? "verified" : "verification_failed",
    face_confidence: faceConfidence,
    latitude: body.data.latitude,
    longitude: body.data.longitude,
    distance_meters: distance,
    ip_address: request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown",
    user_agent: body.data.userAgent,
    device_id: body.data.deviceId
  });

  if (!accepted) {
    return NextResponse.json({ accepted, reason: "Outside geofence or face verification failed", distance });
  }

  await supabase.from("attendance").upsert({
    attendance_session_id: body.data.sessionId,
    student_id: body.data.studentId,
    status: "present",
    verification_method: "qr_face_geo",
    face_confidence: faceConfidence,
    latitude: body.data.latitude,
    longitude: body.data.longitude,
    device_id: body.data.deviceId
  }, { onConflict: "attendance_session_id,student_id" });

  return NextResponse.json({ accepted: true, distance });
}

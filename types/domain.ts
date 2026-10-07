export type Role = "admin" | "faculty" | "student";

export type Metric = {
  label: string;
  value: string;
  delta: string;
  tone: "success" | "warning" | "danger" | "neutral";
};

export type Activity = {
  title: string;
  detail: string;
  time: string;
};

export type Course = {
  title: string;
  department: string;
  progress: number;
  modules: number;
  level: string;
};

export type Resource = {
  title: string;
  type: "PDF" | "PPT" | "Video" | "Lab" | "Paper";
  subject: string;
  downloads: number;
};

export type Assignment = {
  title: string;
  course: string;
  due: string;
  status: "Open" | "Submitted" | "Grading" | "Late";
};

export type Test = {
  title: string;
  mode: "Objective" | "Subjective" | "Programming";
  starts: string;
  duration: string;
};

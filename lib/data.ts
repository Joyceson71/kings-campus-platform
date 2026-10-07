import type { Activity, Assignment, Course, Metric, Resource, Role, Test } from "@/types/domain";

export const roleNav: Record<Role, { label: string; href: string }[]> = {
  student: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Attendance", href: "/attendance" },
    { label: "Tests", href: "/tests" },
    { label: "Assignments", href: "/assignments" },
    { label: "Library", href: "/library" },
    { label: "Chat", href: "/chat" },
    { label: "Leaderboard", href: "/leaderboard" }
  ],
  faculty: [
    { label: "Dashboard", href: "/faculty/dashboard" },
    { label: "Classes", href: "/faculty/classes" },
    { label: "Attendance", href: "/faculty/attendance" },
    { label: "Tests", href: "/faculty/tests" },
    { label: "Assignments", href: "/faculty/assignments" },
    { label: "Reports", href: "/faculty/reports" },
    { label: "Chat", href: "/faculty/chat" }
  ],
  admin: [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Users", href: "/admin/users" },
    { label: "Attendance", href: "/admin/attendance" },
    { label: "Tests", href: "/admin/tests" },
    { label: "Library", href: "/admin/library" },
    { label: "Reports", href: "/admin/reports" },
    { label: "Settings", href: "/admin/settings" }
  ]
};

export const metrics: Record<Role, Metric[]> = {
  student: [
    { label: "Attendance", value: "92%", delta: "+4 this month", tone: "success" },
    { label: "Learning XP", value: "18,420", delta: "Level 14", tone: "success" },
    { label: "Study Streak", value: "27 days", delta: "Best in CSE-B", tone: "warning" },
    { label: "Pending Work", value: "3", delta: "2 due this week", tone: "neutral" }
  ],
  faculty: [
    { label: "Live Classes", value: "4", delta: "2 attendance active", tone: "success" },
    { label: "Submissions", value: "186", delta: "+42 today", tone: "success" },
    { label: "At-Risk Students", value: "12", delta: "Needs follow-up", tone: "warning" },
    { label: "Question Bank", value: "2,480", delta: "118 reviewed", tone: "neutral" }
  ],
  admin: [
    { label: "Online Users", value: "1,284", delta: "Realtime presence", tone: "success" },
    { label: "Attendance Today", value: "89%", delta: "+6 vs last week", tone: "success" },
    { label: "System Health", value: "99.98%", delta: "All services up", tone: "success" },
    { label: "Audit Events", value: "7,842", delta: "38 flagged", tone: "warning" }
  ]
};

export const attendanceSeries = [
  { day: "Mon", present: 91, late: 4, absent: 5 },
  { day: "Tue", present: 87, late: 7, absent: 6 },
  { day: "Wed", present: 94, late: 3, absent: 3 },
  { day: "Thu", present: 89, late: 5, absent: 6 },
  { day: "Fri", present: 96, late: 2, absent: 2 }
];

export const departmentSeries = [
  { name: "CSE", score: 94 },
  { name: "AI&DS", score: 91 },
  { name: "ECE", score: 87 },
  { name: "MECH", score: 82 },
  { name: "EEE", score: 85 },
  { name: "CIVIL", score: 80 }
];

export const activities: Activity[] = [
  { title: "QR attendance rotated", detail: "CSE-B Data Structures session accepted 58 verified scans.", time: "2 min" },
  { title: "Assignment similarity reviewed", detail: "Cloud lab rubric scored and feedback released.", time: "18 min" },
  { title: "AI revision plan generated", detail: "Weak-topic detector suggested recursion and graph traversal practice.", time: "34 min" },
  { title: "Library resource added", detail: "Linux command handbook published for Semester 3.", time: "1 hr" }
];

export const courses: Course[] = [
  { title: "Programming Mastery", department: "CSE", progress: 76, modules: 18, level: "Intermediate" },
  { title: "Cyber Security Foundations", department: "AI&DS", progress: 48, modules: 22, level: "Beginner" },
  { title: "Cloud Native Engineering", department: "ECE", progress: 64, modules: 16, level: "Advanced" },
  { title: "Data Science Studio", department: "CSE", progress: 81, modules: 20, level: "Intermediate" }
];

export const resources: Resource[] = [
  { title: "Operating Systems Lab Manual", type: "PDF", subject: "Linux", downloads: 1840 },
  { title: "Neural Networks Lecture Deck", type: "PPT", subject: "AI", downloads: 1172 },
  { title: "Previous Year DBMS Papers", type: "Paper", subject: "Database", downloads: 2490 },
  { title: "Packet Tracer Practice Set", type: "Lab", subject: "Networking", downloads: 932 }
];

export const assignments: Assignment[] = [
  { title: "Graph Traversal Visualizer", course: "Programming", due: "Tonight 11:59 PM", status: "Open" },
  { title: "Linux Permissions Report", course: "Linux", due: "Tomorrow", status: "Submitted" },
  { title: "Cloud Deployment Lab", course: "Cloud", due: "Friday", status: "Grading" }
];

export const tests: Test[] = [
  { title: "DBMS Unit Test", mode: "Objective", starts: "Today 2:00 PM", duration: "45 min" },
  { title: "Python Practical", mode: "Programming", starts: "Tomorrow 10:00 AM", duration: "90 min" },
  { title: "Cyber Security Viva", mode: "Subjective", starts: "Friday 1:30 PM", duration: "30 min" }
];

export const leaderboard = [
  { name: "Aarav S", score: 18420, badge: "Top Learner" },
  { name: "Nila R", score: 17980, badge: "Top Helper" },
  { name: "Vikram P", score: 17110, badge: "Attendance Ace" },
  { name: "Meera K", score: 16840, badge: "Research Star" }
];

export const STORAGE_KEYS = {
  AKSHAY_AUTH: "akshay_auth",
  AKSHAY_STUDENTS: "akshay_students",
  AKSHAY_PAYMENTS: "akshay_payments",
  AKSHAY_NOTIFICATIONS: "akshay_notifications",
  AKSHAY_SETTINGS: "akshay_settings",
  AKSHAY_SEEDED: "akshay_seeded",
} as const;

export const DEMO_CREDENTIALS = {
  admin: {
    email: "admin@akshayclasses.com",
    password: "admin123",
    role: "admin" as const,
    name: "Akshay Sharma",
    id: "admin-001",
  },
  student: {
    email: "student@akshayclasses.com",
    password: "student123",
    role: "student" as const,
    name: "Rahul Verma",
    id: "student-demo-001",
  },
} as const;

export const ITEMS_PER_PAGE = 10;

export const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "online", label: "Online Transfer" },
  { value: "cheque", label: "Cheque" },
  { value: "card", label: "Card" },
] as const;

export const NOTIFICATION_TYPES = [
  { value: "alert", label: "Alert" },
  { value: "reminder", label: "Reminder" },
  { value: "update", label: "Update" },
] as const;

export const CLASSES = [
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11 (Science)",
  "Class 11 (Commerce)",
  "Class 12 (Science)",
  "Class 12 (Commerce)",
  "Foundation",
  "Competitive Prep",
] as const;

export const COURSES = [
  "Mathematics",
  "Science",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Social Studies",
  "Computer Science",
  "Economics",
  "Accounts",
  "JEE Preparation",
  "NEET Preparation",
] as const;

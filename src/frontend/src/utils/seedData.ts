import { STORAGE_KEYS } from "@/config/constants";
import type { Notification } from "@/types/notification";
import type { Payment } from "@/types/payment";
import type { Student } from "@/types/student";
import { getData, setData } from "./storage";

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

function monthsAgo(n: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function generateSeedData(): void {
  if (getData<boolean>(STORAGE_KEYS.AKSHAY_SEEDED)) return;

  const ADMIN_ID = "admin-001";

  const students: Student[] = [
    {
      id: "student-demo-001",
      name: "Rahul Verma",
      email: "student@akshayclasses.com",
      class_: "Class 12 (Science)",
      course: "JEE Preparation",
      monthlyFee: 2500,
      joinedDate: daysAgo(180),
      feeStartDate: daysAgo(150),
      isActive: true,
      createdAt: new Date(Date.now() - 180 * 86400_000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "student-002",
      name: "Priya Sharma",
      email: "priya.sharma@email.com",
      class_: "Class 10",
      course: "Mathematics",
      monthlyFee: 1500,
      joinedDate: daysAgo(120),
      feeStartDate: daysAgo(100),
      isActive: true,
      createdAt: new Date(Date.now() - 120 * 86400_000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "student-003",
      name: "Arjun Patel",
      email: "arjun.patel@email.com",
      class_: "Class 11 (Science)",
      course: "Physics",
      monthlyFee: 2000,
      joinedDate: daysAgo(90),
      feeStartDate: daysAgo(70),
      isActive: true,
      createdAt: new Date(Date.now() - 90 * 86400_000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "student-004",
      name: "Sneha Reddy",
      email: "sneha.reddy@email.com",
      class_: "Class 12 (Commerce)",
      course: "Accounts",
      monthlyFee: 1800,
      joinedDate: daysAgo(60),
      feeStartDate: daysAgo(40),
      isActive: true,
      createdAt: new Date(Date.now() - 60 * 86400_000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "student-005",
      name: "Vikram Singh",
      email: "vikram.singh@email.com",
      class_: "Class 9",
      course: "Science",
      monthlyFee: 1200,
      joinedDate: daysAgo(45),
      feeStartDate: daysAgo(30),
      isActive: false,
      createdAt: new Date(Date.now() - 45 * 86400_000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const payments: Payment[] = [
    {
      id: "pay-001",
      studentId: "student-demo-001",
      studentName: "Rahul Verma",
      adminId: ADMIN_ID,
      month: monthsAgo(0),
      amountPaid: 2500,
      paymentMethod: "online",
      notes: "UPI transfer",
      paymentDate: daysAgo(5),
      createdAt: new Date(Date.now() - 5 * 86400_000).toISOString(),
    },
    {
      id: "pay-002",
      studentId: "student-demo-001",
      studentName: "Rahul Verma",
      adminId: ADMIN_ID,
      month: monthsAgo(1),
      amountPaid: 2500,
      paymentMethod: "cash",
      paymentDate: daysAgo(35),
      createdAt: new Date(Date.now() - 35 * 86400_000).toISOString(),
    },
    {
      id: "pay-003",
      studentId: "student-002",
      studentName: "Priya Sharma",
      adminId: ADMIN_ID,
      month: monthsAgo(0),
      amountPaid: 1500,
      paymentMethod: "cash",
      paymentDate: daysAgo(3),
      createdAt: new Date(Date.now() - 3 * 86400_000).toISOString(),
    },
    {
      id: "pay-004",
      studentId: "student-002",
      studentName: "Priya Sharma",
      adminId: ADMIN_ID,
      month: monthsAgo(1),
      amountPaid: 1500,
      paymentMethod: "online",
      notes: "NEFT payment",
      paymentDate: daysAgo(33),
      createdAt: new Date(Date.now() - 33 * 86400_000).toISOString(),
    },
    {
      id: "pay-005",
      studentId: "student-003",
      studentName: "Arjun Patel",
      adminId: ADMIN_ID,
      month: monthsAgo(0),
      amountPaid: 2000,
      paymentMethod: "card",
      paymentDate: daysAgo(7),
      createdAt: new Date(Date.now() - 7 * 86400_000).toISOString(),
    },
    {
      id: "pay-006",
      studentId: "student-004",
      studentName: "Sneha Reddy",
      adminId: ADMIN_ID,
      month: monthsAgo(0),
      amountPaid: 1800,
      paymentMethod: "cheque",
      notes: "Cheque no. 123456",
      paymentDate: daysAgo(10),
      createdAt: new Date(Date.now() - 10 * 86400_000).toISOString(),
    },
    {
      id: "pay-007",
      studentId: "student-003",
      studentName: "Arjun Patel",
      adminId: ADMIN_ID,
      month: monthsAgo(1),
      amountPaid: 2000,
      paymentMethod: "online",
      paymentDate: daysAgo(40),
      createdAt: new Date(Date.now() - 40 * 86400_000).toISOString(),
    },
    {
      id: "pay-008",
      studentId: "student-004",
      studentName: "Sneha Reddy",
      adminId: ADMIN_ID,
      month: monthsAgo(1),
      amountPaid: 1800,
      paymentMethod: "cash",
      paymentDate: daysAgo(38),
      createdAt: new Date(Date.now() - 38 * 86400_000).toISOString(),
    },
    {
      id: "pay-009",
      studentId: "student-demo-001",
      studentName: "Rahul Verma",
      adminId: ADMIN_ID,
      month: monthsAgo(2),
      amountPaid: 2500,
      paymentMethod: "cash",
      paymentDate: daysAgo(65),
      createdAt: new Date(Date.now() - 65 * 86400_000).toISOString(),
    },
    {
      id: "pay-010",
      studentId: "student-002",
      studentName: "Priya Sharma",
      adminId: ADMIN_ID,
      month: monthsAgo(2),
      amountPaid: 1500,
      paymentMethod: "online",
      paymentDate: daysAgo(62),
      createdAt: new Date(Date.now() - 62 * 86400_000).toISOString(),
    },
  ];

  const notifications: Notification[] = [
    {
      id: "notif-001",
      adminId: ADMIN_ID,
      title: "Fee Collection Reminder",
      message:
        "Monthly fee collection for this month is due. Please remind all pending students.",
      type_: "reminder",
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 86400_000).toISOString(),
    },
    {
      id: "notif-002",
      adminId: ADMIN_ID,
      studentId: "student-demo-001",
      title: "Payment Received",
      message: "Payment of ₹2,500 received from Rahul Verma for this month.",
      type_: "update",
      isRead: false,
      createdAt: new Date(Date.now() - 5 * 86400_000).toISOString(),
    },
    {
      id: "notif-003",
      adminId: ADMIN_ID,
      studentId: "student-005",
      title: "Overdue Fee Alert",
      message: "Vikram Singh has an overdue fee. Please follow up immediately.",
      type_: "alert",
      isRead: true,
      createdAt: new Date(Date.now() - 10 * 86400_000).toISOString(),
    },
    {
      id: "notif-004",
      adminId: ADMIN_ID,
      title: "New Student Enrolled",
      message: "Sneha Reddy has joined Class 12 (Commerce) for Accounts.",
      type_: "update",
      isRead: true,
      createdAt: new Date(Date.now() - 15 * 86400_000).toISOString(),
    },
    {
      id: "notif-005",
      adminId: ADMIN_ID,
      title: "System Update",
      message: "Fee Management Portal has been updated with new features.",
      type_: "update",
      isRead: true,
      createdAt: new Date(Date.now() - 20 * 86400_000).toISOString(),
    },
  ];

  setData(STORAGE_KEYS.AKSHAY_STUDENTS, students);
  setData(STORAGE_KEYS.AKSHAY_PAYMENTS, payments);
  setData(STORAGE_KEYS.AKSHAY_NOTIFICATIONS, notifications);
  setData(STORAGE_KEYS.AKSHAY_SEEDED, true);
}

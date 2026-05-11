import { getCurrentMonthKey, getMonthKey } from "@/utils/formatters";
import { usePayments } from "./usePayments";
import { useStudents } from "./useStudents";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function useAdminDashboard() {
  const { data: students = [], isLoading: studentsLoading } = useStudents();
  const { data: payments = [], isLoading: paymentsLoading } = usePayments();

  const currentMonth = getCurrentMonthKey();
  const activeStudents = students.filter((s) => s.isActive);
  const totalStudents = activeStudents.length;

  const totalRevenue = payments.reduce((sum, p) => sum + p.amountPaid, 0);
  const totalPotential = activeStudents.reduce(
    (sum, s) => sum + s.monthlyFee,
    0,
  );
  const paidThisMonth = payments
    .filter((p) => getMonthKey(p.paymentDate) === currentMonth)
    .reduce((sum, p) => sum + p.amountPaid, 0);
  const pendingFees = Math.max(0, totalPotential - paidThisMonth);

  const recentPayments = [...payments]
    .sort(
      (a, b) =>
        new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime(),
    )
    .slice(0, 5);

  // Build last 6 months revenue chart data
  const now = new Date();
  const revenueChartData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const revenue = payments
      .filter((p) => getMonthKey(p.paymentDate) === key)
      .reduce((sum, p) => sum + p.amountPaid, 0);
    return { month: MONTH_LABELS[d.getMonth()], revenue };
  });

  // Pie chart: paid vs pending this month
  const paymentStatusData = [
    { name: "Collected", value: paidThisMonth, color: "oklch(0.72 0.18 190)" },
    {
      name: "Pending",
      value: Math.max(0, totalPotential - paidThisMonth),
      color: "oklch(0.75 0.18 55)",
    },
  ];

  const isLoading = studentsLoading || paymentsLoading;

  return {
    totalStudents,
    totalRevenue,
    pendingFees,
    paidThisMonth,
    recentPayments,
    revenueChartData,
    paymentStatusData,
    students,
    payments,
    isLoading,
  };
}

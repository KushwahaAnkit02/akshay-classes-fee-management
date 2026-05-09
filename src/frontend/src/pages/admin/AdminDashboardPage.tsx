import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageTransition } from "@/components/shared/PageTransition";
import { StatsCard } from "@/components/shared/StatsCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMyAdmin } from "@/hooks/useAdmin";
import { useNotificationsByAdmin } from "@/hooks/useNotifications";
import { usePaymentsByAdmin } from "@/hooks/usePayments";
import { useStudentsByAdmin } from "@/hooks/useStudents";
import type { MonthlyPayment, PaymentMethod, Student } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Bell,
  CreditCard,
  IndianRupee,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function getMonthKey(ts: bigint): string {
  const d = new Date(Number(ts) / 1_000_000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

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

function buildRevenueData(
  payments: MonthlyPayment[],
): { month: string; revenue: number }[] {
  const now = new Date();
  const result: { month: string; revenue: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const monthPayments = payments.filter(
      (p) => getMonthKey(p.payment_date) === key,
    );
    const total = monthPayments.reduce(
      (sum, p) => sum + Number(p.amount_paid),
      0,
    );
    result.push({ month: MONTH_LABELS[d.getMonth()], revenue: total });
  }
  return result;
}

const PAYMENT_METHOD_COLORS: Record<PaymentMethod, string> = {
  cash: "bg-emerald-500/20 text-emerald-600",
  online: "bg-blue-500/20 text-blue-600",
  cheque: "bg-amber-500/20 text-amber-600",
  card: "bg-purple-500/20 text-purple-600",
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function RevenueChart({ payments }: { payments: MonthlyPayment[] }) {
  const data = buildRevenueData(payments);
  return (
    <div className="glass-card rounded-2xl p-5 shadow-soft">
      <h3 className="font-display font-semibold text-foreground mb-4">
        Monthly Revenue
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={data}
          barSize={28}
          margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
        >
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: "currentColor" }}
            axisLine={false}
            tickLine={false}
            className="text-muted-foreground"
          />
          <YAxis
            tick={{ fontSize: 11, fill: "currentColor" }}
            axisLine={false}
            tickLine={false}
            className="text-muted-foreground"
            tickFormatter={(v: number) =>
              v >= 1000 ? `${v / 1000}K` : String(v)
            }
          />
          <Tooltip
            cursor={{ fill: "oklch(var(--primary) / 0.08)" }}
            contentStyle={{
              background: "oklch(var(--card) / 0.95)",
              border: "1px solid oklch(var(--border) / 0.4)",
              borderRadius: "12px",
              color: "oklch(var(--foreground))",
              fontSize: "13px",
            }}
            formatter={(value: number) => [
              `₹${value.toLocaleString("en-IN")}`,
              "Revenue",
            ]}
          />
          <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
            {data.map((_, idx) => (
              <Cell
                // biome-ignore lint/suspicious/noArrayIndexKey: static chart index
                key={idx}
                fill={`oklch(var(--primary) / ${idx === data.length - 1 ? "1" : "0.6"})`}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function FeeDistributionChart({
  collected,
  pending,
}: {
  collected: number;
  pending: number;
}) {
  const data = [
    { name: "Collected", value: collected, color: "oklch(0.72 0.18 190)" },
    {
      name: "Pending",
      value: Math.max(0, pending),
      color: "oklch(0.75 0.18 55)",
    },
  ];
  const total = collected + Math.max(0, pending);
  const pct = total > 0 ? Math.round((collected / total) * 100) : 0;

  return (
    <div className="glass-card rounded-2xl p-5 shadow-soft">
      <h3 className="font-display font-semibold text-foreground mb-4">
        Fee Distribution
      </h3>
      <div className="flex items-center gap-6">
        <ResponsiveContainer width={130} height={130}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={60}
              paddingAngle={3}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "oklch(var(--card) / 0.95)",
                border: "1px solid oklch(var(--border) / 0.4)",
                borderRadius: "12px",
                fontSize: "12px",
              }}
              formatter={(value: number) => [
                `₹${value.toLocaleString("en-IN")}`,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-3">
          <div className="text-center">
            <p className="font-display text-3xl font-bold text-foreground">
              {pct}%
            </p>
            <p className="text-xs text-muted-foreground">Collected</p>
          </div>
          <div className="space-y-1.5">
            {data.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: d.color }}
                />
                <span className="text-muted-foreground flex-1">{d.name}</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(d.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RecentPaymentsTable({
  payments,
  students,
  isLoading,
}: {
  payments: MonthlyPayment[];
  students: Student[];
  isLoading: boolean;
}) {
  const studentMap = new Map(students.map((s) => [s.id, s]));
  const recent = [...payments]
    .sort((a, b) => Number(b.payment_date) - Number(a.payment_date))
    .slice(0, 8);

  return (
    <div className="glass-card rounded-2xl shadow-soft overflow-hidden">
      <div className="px-5 py-4 border-b border-border/30 flex items-center justify-between">
        <h3 className="font-display font-semibold text-foreground">
          Recent Payments
        </h3>
        <Badge variant="secondary" className="text-xs">
          {payments.length} total
        </Badge>
      </div>
      {isLoading ? (
        <div className="p-4">
          <LoadingSkeleton variant="table" rows={5} />
        </div>
      ) : recent.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payments yet"
          description="Recorded payments will appear here."
          dataOcid="recent-payments.empty_state"
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/20">
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Student
                </th>
                <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Amount
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide hidden sm:table-cell">
                  Method
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell">
                  Date
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide hidden lg:table-cell">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {recent.map((payment, idx) => {
                const student = studentMap.get(payment.student_id);
                const dateStr = new Date(
                  Number(payment.payment_date) / 1_000_000,
                ).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                });
                return (
                  <motion.tr
                    key={payment.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-border/10 hover:bg-primary/5 transition-fast cursor-default"
                    data-ocid={`recent-payments.item.${idx + 1}`}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full gradient-accent flex items-center justify-center text-[10px] font-bold text-primary-foreground shrink-0">
                          {student ? getInitials(student.name) : "?"}
                        </div>
                        <span className="font-medium text-foreground truncate max-w-[120px]">
                          {student?.name ?? "Unknown"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right font-display font-semibold text-foreground">
                      ₹{Number(payment.amount_paid).toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                          PAYMENT_METHOD_COLORS[payment.payment_method]
                        }`}
                      >
                        {payment.payment_method}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground text-xs hidden md:table-cell">
                      {dateStr}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground text-xs hidden lg:table-cell max-w-[140px] truncate">
                      {payment.notes ?? "—"}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function RecentStudentsList({
  students,
  isLoading,
  onNavigate,
}: {
  students: Student[];
  isLoading: boolean;
  onNavigate: () => void;
}) {
  const recent = [...students]
    .sort((a, b) => Number(b.created_at) - Number(a.created_at))
    .slice(0, 5);

  return (
    <div className="glass-card rounded-2xl shadow-soft overflow-hidden">
      <div className="px-5 py-4 border-b border-border/30 flex items-center justify-between">
        <h3 className="font-display font-semibold text-foreground">
          Recent Students
        </h3>
        <button
          type="button"
          onClick={onNavigate}
          className="text-xs text-primary hover:text-primary/80 transition-fast font-medium"
          data-ocid="recent-students.view_all_link"
        >
          View all →
        </button>
      </div>
      <div className="p-4 space-y-2">
        {isLoading ? (
          <LoadingSkeleton variant="list" rows={5} />
        ) : recent.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No students yet"
            description="Students you add will appear here."
            dataOcid="recent-students.empty_state"
          />
        ) : (
          recent.map((student, idx) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.06 }}
              onClick={onNavigate}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 transition-fast cursor-pointer group"
              data-ocid={`recent-students.item.${idx + 1}`}
            >
              <div className="w-9 h-9 rounded-full gradient-accent flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">
                {getInitials(student.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm truncate group-hover:text-primary transition-fast">
                  {student.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {student.class_} · {student.course}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-display text-sm font-semibold text-foreground">
                  ₹{Number(student.monthly_fee).toLocaleString("en-IN")}/mo
                </p>
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                    student.is_active
                      ? "bg-emerald-500/15 text-emerald-600"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {student.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

function QuickActions({
  onAddStudent,
  onRecordPayment,
  onSendNotification,
}: {
  onAddStudent: () => void;
  onRecordPayment: () => void;
  onSendNotification: () => void;
}) {
  const actions = [
    {
      label: "Add Student",
      icon: UserPlus,
      onClick: onAddStudent,
      ocid: "dashboard.add_student_button",
      gradient: true,
    },
    {
      label: "Record Payment",
      icon: IndianRupee,
      onClick: onRecordPayment,
      ocid: "dashboard.record_payment_button",
      gradient: false,
    },
    {
      label: "Send Notification",
      icon: Bell,
      onClick: onSendNotification,
      ocid: "dashboard.send_notification_button",
      gradient: false,
    },
  ];

  return (
    <div className="glass-card rounded-2xl p-5 shadow-soft">
      <h3 className="font-display font-semibold text-foreground mb-4">
        Quick Actions
      </h3>
      <div className="flex flex-wrap gap-3">
        {actions.map((action) => (
          <Button
            key={action.label}
            type="button"
            onClick={action.onClick}
            variant={action.gradient ? "default" : "secondary"}
            className={`gap-2 ${
              action.gradient ? "gradient-accent text-primary-foreground" : ""
            }`}
            data-ocid={action.ocid}
          >
            <action.icon className="w-4 h-4" />
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { data: admin, isLoading: adminLoading } = useMyAdmin();
  const { data: students = [], isLoading: studentsLoading } =
    useStudentsByAdmin();
  const { data: payments = [], isLoading: paymentsLoading } =
    usePaymentsByAdmin();
  const { data: notifications = [] } = useNotificationsByAdmin();

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // ── Computed stats ──────────────────────────────────────────────────────
  const activeStudents = students.filter((s) => s.is_active);
  const totalCollected = payments.reduce(
    (sum, p) => sum + Number(p.amount_paid),
    0,
  );

  const totalPotential = activeStudents.reduce(
    (sum, s) => sum + Number(s.monthly_fee),
    0,
  );
  const pendingFees = Math.max(0, totalPotential - totalCollected);

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthlyRevenue = payments
    .filter((p) => getMonthKey(p.payment_date) === currentMonthKey)
    .reduce((sum, p) => sum + Number(p.amount_paid), 0);

  // New students this month
  const newThisMonth = students.filter((s) => {
    const d = new Date(Number(s.created_at) / 1_000_000);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  }).length;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const statsLoading = studentsLoading || adminLoading;

  return (
    <PageTransition className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header greeting */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        data-ocid="admin-dashboard.page"
      >
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            {adminLoading ? (
              <span className="opacity-50">Loading...</span>
            ) : (
              <>
                Welcome back,{" "}
                <span className="gradient-accent bg-clip-text text-transparent">
                  {admin?.institute_name ?? "Institute"}
                </span>
              </>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">{today}</p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => navigate({ to: "/admin/notifications" })}
            className="flex items-center gap-2 glass-card px-3 py-2 rounded-xl text-sm font-medium text-amber-600 border border-amber-500/20 hover:bg-amber-500/10 transition-fast"
            data-ocid="dashboard.notifications_badge"
          >
            <Bell className="w-4 h-4" />
            {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
          </button>
        )}
      </motion.div>

      {/* Stats cards */}
      {statsLoading ? (
        <LoadingSkeleton variant="stats" />
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          data-ocid="admin-dashboard.stats_section"
        >
          <StatsCard
            title="Total Students"
            value={String(activeStudents.length)}
            subtitle={`${students.length} total enrolled`}
            icon={Users}
            trend={
              newThisMonth > 0
                ? { value: newThisMonth, label: "new this month" }
                : undefined
            }
            accentColor="text-primary"
            delay={0}
            dataOcid="stats.total_students_card"
          />
          <StatsCard
            title="Total Collection"
            value={formatCurrency(totalCollected)}
            subtitle={`${payments.length} payments recorded`}
            icon={IndianRupee}
            accentColor="text-primary"
            delay={0.08}
            dataOcid="stats.total_collection_card"
          />
          <StatsCard
            title="Pending Fees"
            value={formatCurrency(pendingFees)}
            subtitle="Estimated uncollected"
            icon={AlertCircle}
            accentColor="text-amber-500"
            delay={0.16}
            dataOcid="stats.pending_fees_card"
          />
          <StatsCard
            title="Monthly Revenue"
            value={formatCurrency(monthlyRevenue)}
            subtitle={`${MONTH_LABELS[now.getMonth()]} ${now.getFullYear()}`}
            icon={TrendingUp}
            accentColor="text-emerald-500"
            delay={0.24}
            dataOcid="stats.monthly_revenue_card"
          />
        </div>
      )}

      {/* Charts row */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-5 gap-4"
        data-ocid="admin-dashboard.charts_section"
      >
        <div className="lg:col-span-3">
          <RevenueChart payments={payments} />
        </div>
        <div className="lg:col-span-2">
          <FeeDistributionChart
            collected={totalCollected}
            pending={pendingFees}
          />
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.28 }}
      >
        <QuickActions
          onAddStudent={() => navigate({ to: "/admin/students" })}
          onRecordPayment={() => navigate({ to: "/admin/fees" })}
          onSendNotification={() => navigate({ to: "/admin/notifications" })}
        />
      </motion.div>

      {/* Recent Payments + Recent Students */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.34 }}
        className="grid grid-cols-1 xl:grid-cols-5 gap-4"
        data-ocid="admin-dashboard.activity_section"
      >
        <div className="xl:col-span-3">
          <RecentPaymentsTable
            payments={payments}
            students={students}
            isLoading={paymentsLoading || studentsLoading}
          />
        </div>
        <div className="xl:col-span-2">
          <RecentStudentsList
            students={students}
            isLoading={studentsLoading}
            onNavigate={() => navigate({ to: "/admin/students" })}
          />
        </div>
      </motion.div>
    </PageTransition>
  );
}

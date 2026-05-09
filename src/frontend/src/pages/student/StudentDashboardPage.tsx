import { EmptyState } from "@/components/shared/EmptyState";
import { PageTransition } from "@/components/shared/PageTransition";
import { StatsCard } from "@/components/shared/StatsCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useMarkNotificationRead,
  useNotificationsByStudent,
} from "@/hooks/useNotifications";
import { usePaymentsByStudent } from "@/hooks/usePayments";
import { useMyStudentProfile } from "@/hooks/useStudents";
import { useAuthStore } from "@/store/authStore";
import type { MonthlyPayment, Notification } from "@/types";
import {
  Bell,
  BellOff,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  TrendingUp,
  Wallet,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const MONTH_NAMES = [
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

function formatAmount(val: bigint) {
  return `₹${Number(val).toLocaleString("en-IN")}`;
}

function getMonthLabel(month: string) {
  const [y, m] = month.split("-");
  return `${MONTH_NAMES[Number.parseInt(m) - 1]} '${y?.slice(2)}`;
}

function formatDate(ts: bigint) {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getCurrentYYYYMM() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function buildChartData(payments: MonthlyPayment[]) {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const pay = payments.find((p) => p.month === key);
    return {
      month: `${MONTH_NAMES[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`,
      amount: pay ? Number(pay.amount_paid) : 0,
    };
  });
}

const METHOD_LABELS: Record<string, string> = {
  cash: "Cash",
  online: "Online",
  cheque: "Cheque",
  card: "Card",
};
const METHOD_COLORS: Record<string, string> = {
  cash: "bg-emerald-500/15 text-emerald-600",
  online: "bg-blue-500/15 text-blue-600",
  cheque: "bg-amber-500/15 text-amber-600",
  card: "bg-purple-500/15 text-purple-600",
};

function NotificationPanel({ onClose }: { onClose: () => void }) {
  const { data: notifications = [], isLoading } = useNotificationsByStudent();
  const markRead = useMarkNotificationRead();

  const handleMark = (id: string) => {
    markRead.mutate(id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="absolute right-0 top-full mt-2 w-80 glass-card rounded-2xl shadow-elevated z-50 overflow-hidden border border-border/50"
      data-ocid="student.notifications.popover"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
        <span className="font-display font-semibold text-sm text-foreground">
          Notifications
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 px-2 text-xs"
          data-ocid="student.notifications.close_button"
        >
          Close
        </Button>
      </div>
      <div className="max-h-72 overflow-y-auto divide-y divide-border/20">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center py-8 px-4 text-center">
            <BellOff className="w-6 h-6 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No notifications yet
            </p>
          </div>
        ) : (
          notifications.map((n: Notification) => (
            // biome-ignore lint/a11y/useKeyWithClickEvents: click-only
            <div
              key={n.id}
              onClick={() => !n.is_read && handleMark(n.id)}
              className={`px-4 py-3 cursor-pointer hover:bg-muted/40 transition-fast ${
                !n.is_read ? "bg-primary/5" : ""
              }`}
              data-ocid={`student.notification.item.${n.id}`}
            >
              <div className="flex items-start gap-2">
                {!n.is_read && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                )}
                <div className="min-w-0">
                  <p
                    className={`text-xs font-semibold text-foreground truncate ${n.is_read ? "opacity-70" : ""}`}
                  >
                    {n.title}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {n.message}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}

export default function StudentDashboardPage() {
  const { profile } = useAuthStore();
  const { data: student, isLoading: studentLoading } = useMyStudentProfile();
  const { data: payments = [], isLoading: paymentsLoading } =
    usePaymentsByStudent();
  const { data: notifications = [] } = useNotificationsByStudent();
  const unreadCount = notifications.filter(
    (n: Notification) => !n.is_read,
  ).length;
  const [showNotifications, setShowNotifications] = useState(false);

  const isLoading = studentLoading || paymentsLoading;

  const monthlyFee = student ? Number(student.monthly_fee) : 0;
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount_paid), 0);
  const currentMonth = getCurrentYYYYMM();
  const currentPayment = payments.find((p) => p.month === currentMonth);
  const currentPaid = currentPayment ? Number(currentPayment.amount_paid) : 0;
  const currentDue = Math.max(0, monthlyFee - currentPaid);

  const feeStatus =
    currentDue === 0 ? "Paid" : currentPaid > 0 ? "Partial" : "Overdue";
  const statusColors: Record<string, string> = {
    Paid: "bg-emerald-500/15 text-emerald-600",
    Partial: "bg-amber-500/15 text-amber-600",
    Overdue: "bg-destructive/15 text-destructive",
  };

  const recentPayments = [...payments]
    .sort((a, b) => Number(b.payment_date) - Number(a.payment_date))
    .slice(0, 3);

  const chartData = buildChartData(payments);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <PageTransition>
      <div
        className="space-y-6 max-w-5xl mx-auto"
        data-ocid="student.dashboard.page"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            {isLoading ? (
              <Skeleton className="h-7 w-48 mb-2" />
            ) : (
              <motion.h1
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="font-display text-2xl font-bold text-foreground"
              >
                {greeting()},{" "}
                <span className="gradient-accent bg-clip-text text-transparent">
                  {profile?.name ?? "Student"}
                </span>
              </motion.h1>
            )}
            <p className="text-sm text-muted-foreground mt-0.5">
              Here's your fee summary for today
            </p>
          </div>
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              className="relative h-9 w-9 rounded-xl border-border/50"
              onClick={() => setShowNotifications((v) => !v)}
              data-ocid="student.dashboard.notifications_button"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full text-[9px] text-primary-foreground flex items-center justify-center font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
            <AnimatePresence>
              {showNotifications && (
                <NotificationPanel
                  onClose={() => setShowNotifications(false)}
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            Array.from({ length: 4 }, (_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
              <Skeleton key={i} className="h-32 w-full rounded-2xl" />
            ))
          ) : (
            <>
              <StatsCard
                title="Monthly Fee"
                value={`₹${monthlyFee.toLocaleString("en-IN")}`}
                subtitle={student?.course}
                icon={CreditCard}
                delay={0}
                dataOcid="student.stats.monthly_fee"
              />
              <StatsCard
                title="Total Paid"
                value={`₹${totalPaid.toLocaleString("en-IN")}`}
                subtitle={`${payments.length} payments`}
                icon={Wallet}
                accentColor="text-emerald-500"
                delay={0.05}
                dataOcid="student.stats.total_paid"
              />
              <StatsCard
                title="Pending Amount"
                value={`₹${currentDue.toLocaleString("en-IN")}`}
                subtitle="This month"
                icon={Clock}
                accentColor={
                  currentDue > 0 ? "text-destructive" : "text-emerald-500"
                }
                delay={0.1}
                dataOcid="student.stats.pending"
              />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="glass-card rounded-2xl p-5 shadow-soft"
                data-ocid="student.stats.fee_status"
              >
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    Fee Status
                  </p>
                  <div className="p-2 rounded-xl bg-primary/10">
                    {feeStatus === "Paid" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-destructive" />
                    )}
                  </div>
                </div>
                <Badge
                  className={`text-sm px-3 py-1 font-semibold rounded-xl ${statusColors[feeStatus]}`}
                >
                  {feeStatus}
                </Badge>
                <p className="text-xs text-muted-foreground mt-3">
                  {MONTH_NAMES[new Date().getMonth()]}{" "}
                  {new Date().getFullYear()}
                </p>
              </motion.div>
            </>
          )}
        </div>

        {/* Current month card + Recent payments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current month status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="glass-card rounded-2xl p-6 shadow-soft"
            data-ocid="student.current_month.card"
          >
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-primary" />
              <h2 className="font-display font-semibold text-foreground">
                {MONTH_NAMES[new Date().getMonth()]} {new Date().getFullYear()}
              </h2>
            </div>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-2 w-full" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">
                    Paid this month
                  </span>
                  <span className="font-display font-bold text-emerald-500">
                    {formatAmount(BigInt(currentPaid))}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">
                    Remaining due
                  </span>
                  <span
                    className={`font-display font-bold ${currentDue > 0 ? "text-destructive" : "text-emerald-500"}`}
                  >
                    {formatAmount(BigInt(currentDue))}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width:
                        monthlyFee > 0
                          ? `${Math.min(100, (currentPaid / monthlyFee) * 100)}%`
                          : "0%",
                    }}
                    transition={{
                      duration: 0.8,
                      delay: 0.4,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                    className="h-full rounded-full gradient-accent"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {monthlyFee > 0
                    ? Math.round((currentPaid / monthlyFee) * 100)
                    : 0}
                  % of monthly fee paid
                </p>
                {currentPayment && (
                  <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Last payment
                    </span>
                    <span className="text-xs font-medium text-foreground">
                      {formatDate(currentPayment.payment_date)}
                    </span>
                  </div>
                )}
              </>
            )}
          </motion.div>

          {/* Recent Payments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="glass-card rounded-2xl p-6 shadow-soft"
            data-ocid="student.recent_payments.card"
          >
            <h2 className="font-display font-semibold text-foreground mb-4">
              Recent Payments
            </h2>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-xl" />
                ))}
              </div>
            ) : recentPayments.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-center">
                <CreditCard className="w-8 h-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">No payments yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentPayments.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + i * 0.07 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/60 transition-fast"
                    data-ocid={`student.recent_payment.item.${i + 1}`}
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {getMonthLabel(p.month)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(p.payment_date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`text-xs px-2 py-0.5 rounded-lg ${METHOD_COLORS[p.payment_method] ?? ""}`}
                      >
                        {METHOD_LABELS[p.payment_method]}
                      </Badge>
                      <span className="font-display font-bold text-sm text-foreground">
                        {formatAmount(p.amount_paid)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Fee Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="glass-card rounded-2xl p-6 shadow-soft"
          data-ocid="student.fee_trend.card"
        >
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h2 className="font-display font-semibold text-foreground">
              Payment Trend
            </h2>
            <span className="text-xs text-muted-foreground ml-1">
              Last 6 months
            </span>
          </div>
          {isLoading ? (
            <Skeleton className="h-44 w-full rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart
                data={chartData}
                margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(var(--border)/0.4)"
                />
                <XAxis
                  dataKey="month"
                  tick={{
                    fontSize: 11,
                    fill: "oklch(var(--muted-foreground))",
                  }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{
                    fontSize: 11,
                    fill: "oklch(var(--muted-foreground))",
                  }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  width={48}
                />
                <Tooltip
                  contentStyle={{
                    background: "oklch(var(--popover))",
                    border: "1px solid oklch(var(--border)/0.4)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "oklch(var(--foreground))",
                  }}
                  formatter={(val: number) => [
                    `₹${val.toLocaleString("en-IN")}`,
                    "Paid",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="oklch(var(--primary))"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "oklch(var(--primary))", strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
}

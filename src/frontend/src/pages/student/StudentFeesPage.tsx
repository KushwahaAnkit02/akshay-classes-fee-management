import { PageTransition } from "@/components/shared/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePaymentsByStudent } from "@/hooks/usePayments";
import { useMyStudentProfile } from "@/hooks/useStudents";
import type { MonthlyPayment } from "@/types";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  GraduationCap,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import type { ReactElement } from "react";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatAmount(val: bigint) {
  return `₹${Number(val).toLocaleString("en-IN")}`;
}

function formatDate(ts: bigint) {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getCurrentYYYYMM() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthsFromStart(feeStartTs: bigint): string[] {
  const start = new Date(Number(feeStartTs) / 1_000_000);
  const now = new Date();
  const months: string[] = [];
  const cur = new Date(start.getFullYear(), start.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 1);
  while (cur <= end) {
    months.push(
      `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}`,
    );
    cur.setMonth(cur.getMonth() + 1);
  }
  return months;
}

function monthLabel(month: string) {
  const [y, m] = month.split("-");
  return `${MONTH_NAMES[Number.parseInt(m) - 1]} ${y}`;
}

type MonthStatus = "paid" | "partial" | "unpaid";

function getMonthStatus(
  month: string,
  monthlyFee: number,
  payments: MonthlyPayment[],
): { status: MonthStatus; paid: number; due: number } {
  const p = payments.find((pay) => pay.month === month);
  const paid = p ? Number(p.amount_paid) : 0;
  const due = Math.max(0, monthlyFee - paid);
  const status: MonthStatus =
    paid === 0 ? "unpaid" : due === 0 ? "paid" : "partial";
  return { status, paid, due };
}

const STATUS_STYLES: Record<
  MonthStatus,
  { badge: string; icon: ReactElement }
> = {
  paid: {
    badge: "bg-emerald-500/15 text-emerald-600",
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
  },
  partial: {
    badge: "bg-amber-500/15 text-amber-600",
    icon: <ChevronRight className="w-4 h-4 text-amber-500" />,
  },
  unpaid: {
    badge: "bg-destructive/15 text-destructive",
    icon: <XCircle className="w-4 h-4 text-destructive" />,
  },
};

export default function StudentFeesPage() {
  const { data: student, isLoading: studentLoading } = useMyStudentProfile();
  const { data: payments = [], isLoading: paymentsLoading } =
    usePaymentsByStudent();

  const isLoading = studentLoading || paymentsLoading;
  const monthlyFee = student ? Number(student.monthly_fee) : 0;
  const allMonths = student ? getMonthsFromStart(student.fee_start_date) : [];
  const currentMonth = getCurrentYYYYMM();

  const pendingMonths = allMonths.filter((m) => {
    const { status } = getMonthStatus(m, monthlyFee, payments);
    return status !== "paid";
  });

  // Group all months by year for history
  const byYear: Record<string, string[]> = {};
  for (const m of allMonths) {
    const [y] = m.split("-");
    if (!byYear[y]) byYear[y] = [];
    byYear[y].push(m);
  }
  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));

  return (
    <PageTransition>
      <div
        className="space-y-6 max-w-4xl mx-auto"
        data-ocid="student.fees.page"
      >
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            My Fees
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your fee details and payment history
          </p>
        </div>

        {/* Fee Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-card rounded-2xl p-6 shadow-soft"
          data-ocid="student.fees.details_card"
        >
          <div className="flex items-center gap-2 mb-5">
            <CreditCard className="w-4 h-4 text-primary" />
            <h2 className="font-display font-semibold text-foreground">
              Fee Details
            </h2>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Array.from({ length: 6 }, (_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : student ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                {
                  label: "Monthly Fee",
                  value: formatAmount(student.monthly_fee),
                  icon: CreditCard,
                },
                { label: "Course", value: student.course, icon: BookOpen },
                { label: "Class", value: student.class_, icon: GraduationCap },
                {
                  label: "Fee Start Date",
                  value: formatDate(student.fee_start_date),
                  icon: Calendar,
                },
                {
                  label: "Joined Date",
                  value: formatDate(student.joined_date),
                  icon: Calendar,
                },
                {
                  label: "Account Status",
                  value: student.is_active ? "Active" : "Inactive",
                  icon: CheckCircle2,
                },
              ].map(({ label, value, icon: Icon }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="p-4 rounded-xl bg-muted/30 border border-border/20"
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {label}
                    </span>
                  </div>
                  <p className="font-display font-semibold text-sm text-foreground truncate">
                    {value}
                  </p>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Student information unavailable.
            </p>
          )}
        </motion.div>

        {/* Upcoming Dues */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="glass-card rounded-2xl p-6 shadow-soft"
          data-ocid="student.fees.upcoming_dues"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-destructive" />
              <h2 className="font-display font-semibold text-foreground">
                Upcoming / Pending Dues
              </h2>
            </div>
            {pendingMonths.length > 0 && (
              <Badge className="bg-destructive/15 text-destructive text-xs">
                {pendingMonths.length} pending
              </Badge>
            )}
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : pendingMonths.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-3" />
              <p className="font-display font-semibold text-foreground">
                All caught up!
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                No pending dues at this time.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingMonths.map((m, i) => {
                const { status, paid, due } = getMonthStatus(
                  m,
                  monthlyFee,
                  payments,
                );
                const isCurrentMonth = m === currentMonth;
                return (
                  <motion.div
                    key={m}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/20 hover:bg-muted/50 transition-fast"
                    data-ocid={`student.fees.due.item.${i + 1}`}
                  >
                    <div className="flex items-center gap-3">
                      {STATUS_STYLES[status].icon}
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {monthLabel(m)}
                          {isCurrentMonth && (
                            <Badge className="ml-2 text-[10px] px-1.5 py-0 bg-primary/15 text-primary">
                              Current
                            </Badge>
                          )}
                        </p>
                        {paid > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Paid: ₹{paid.toLocaleString("en-IN")}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-display font-bold text-sm text-destructive">
                        ₹{due.toLocaleString("en-IN")}
                      </p>
                      <Badge
                        className={`text-[10px] px-2 py-0.5 ${STATUS_STYLES[status].badge}`}
                      >
                        {status === "partial" ? "Partial" : "Unpaid"}
                      </Badge>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Payment History by Year */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="glass-card rounded-2xl p-6 shadow-soft"
          data-ocid="student.fees.history"
        >
          <h2 className="font-display font-semibold text-foreground mb-5">
            Payment History
          </h2>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))}
            </div>
          ) : years.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No history available.
            </p>
          ) : (
            <div className="space-y-6">
              {years.map((year) => (
                <div key={year} data-ocid={`student.fees.history.year.${year}`}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    {year}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {byYear[year].map((m) => {
                      const { status, paid } = getMonthStatus(
                        m,
                        monthlyFee,
                        payments,
                      );
                      const [, mo] = m.split("-");
                      return (
                        <div
                          key={m}
                          className={`p-3 rounded-xl border transition-fast ${
                            status === "paid"
                              ? "bg-emerald-500/8 border-emerald-500/20"
                              : status === "partial"
                                ? "bg-amber-500/8 border-amber-500/20"
                                : "bg-muted/30 border-border/20"
                          }`}
                          data-ocid={`student.fees.history.month.${m}`}
                        >
                          <p className="text-xs font-medium text-foreground">
                            {MONTH_NAMES[Number.parseInt(mo) - 1]?.slice(0, 3)}
                          </p>
                          {paid > 0 ? (
                            <p className="text-xs font-bold text-foreground mt-0.5">
                              ₹{paid.toLocaleString("en-IN")}
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              ₹0
                            </p>
                          )}
                          <Badge
                            className={`mt-1.5 text-[9px] px-1.5 py-0 ${STATUS_STYLES[status].badge}`}
                          >
                            {status}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
}

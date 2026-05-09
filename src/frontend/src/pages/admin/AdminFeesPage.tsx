import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageTransition } from "@/components/shared/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePaymentsByAdmin, useRecordPayment } from "@/hooks/usePayments";
import { useStudentsByAdmin } from "@/hooks/useStudents";
import type { MonthlyPayment, PaymentMethod, Student } from "@/types";
import {
  ArrowUpDown,
  CheckCircle2,
  Clock,
  CreditCard,
  IndianRupee,
  Percent,
  Search,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

// ─── Fee Status ────────────────────────────────────────────────────────────────

type FeeStatus = "Paid" | "Partial" | "Overdue" | "Pending";

function getFeeStatus(
  student: Student,
  payments: MonthlyPayment[],
  currentMonth: string,
): FeeStatus {
  const monthlyFee = Number(student.monthly_fee);
  const monthPayments = payments.filter(
    (p) => p.student_id === student.id && p.month === currentMonth,
  );
  const totalPaid = monthPayments.reduce(
    (sum, p) => sum + Number(p.amount_paid),
    0,
  );

  if (totalPaid >= monthlyFee) return "Paid";
  if (totalPaid > 0) return "Partial";

  // Check if 30+ days past fee_start_date
  const feeStart = Number(student.fee_start_date);
  const now = Date.now();
  const daysDiff = (now - feeStart) / (1000 * 60 * 60 * 24);
  if (daysDiff > 30) return "Overdue";

  return "Pending";
}

const STATUS_STYLES: Record<
  FeeStatus,
  { className: string; dotColor: string }
> = {
  Paid: {
    className:
      "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
    dotColor: "bg-emerald-500",
  },
  Partial: {
    className:
      "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/25",
    dotColor: "bg-blue-500",
  },
  Overdue: {
    className: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/25",
    dotColor: "bg-red-500",
  },
  Pending: {
    className:
      "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25",
    dotColor: "bg-amber-500",
  },
};

function StatusBadge({ status }: { status: FeeStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <Badge
      variant="outline"
      className={`${s.className} font-medium gap-1.5 px-2.5 py-1`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dotColor}`} />
      {status}
    </Badge>
  );
}

// ─── Summary Card ─────────────────────────────────────────────────────────────

function SummaryCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
  index,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  accent: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="glass-card rounded-2xl p-5 shadow-soft group hover:shadow-elevated transition-base"
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent}`}
        >
          <Icon className="w-4.5 h-4.5" />
        </div>
      </div>
      <p className="font-display text-2xl font-bold text-foreground tracking-tight">
        {value}
      </p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </motion.div>
  );
}

// ─── Record Payment Dialog ────────────────────────────────────────────────────

interface PaymentDialogProps {
  student: Student;
  currentMonth: string;
  onClose: () => void;
}

function RecordPaymentDialog({
  student,
  currentMonth,
  onClose,
}: PaymentDialogProps) {
  const recordPayment = useRecordPayment();
  const [amount, setAmount] = useState(String(Number(student.monthly_fee)));
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(() =>
    new Date().toISOString().substring(0, 10),
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await recordPayment.mutateAsync({
        student_id: student.id,
        month: currentMonth,
        amount_paid: Number(amount),
        payment_method: method,
        notes: notes || undefined,
        payment_date: date,
      });
      toast.success(`Payment recorded for ${student.name}`);
      onClose();
    } catch {
      toast.error("Failed to record payment. Please try again.");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      data-ocid="fees.record_payment.dialog"
    >
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: overlay */}
      <div
        className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 8 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="relative w-full max-w-md glass-card rounded-2xl shadow-elevated p-6 z-10"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-display font-semibold text-foreground">
              Record Payment
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {student.name} · {currentMonth}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            data-ocid="fees.record_payment.close_button"
            className="rounded-xl"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="pay-amount">Amount (₹)</Label>
            <Input
              id="pay-amount"
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              data-ocid="fees.record_payment.amount_input"
              className="rounded-xl"
              placeholder={`Monthly: ₹${Number(student.monthly_fee).toLocaleString("en-IN")}`}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pay-method">Payment Method</Label>
            <Select
              value={method}
              onValueChange={(v) => setMethod(v as PaymentMethod)}
            >
              <SelectTrigger
                id="pay-method"
                data-ocid="fees.record_payment.method_select"
                className="rounded-xl"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="online">Online Transfer</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
                <SelectItem value="card">Card</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pay-date">Payment Date</Label>
            <Input
              id="pay-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              data-ocid="fees.record_payment.date_input"
              className="rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pay-notes">Notes (optional)</Label>
            <Textarea
              id="pay-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              data-ocid="fees.record_payment.notes_textarea"
              className="rounded-xl resize-none"
              placeholder="Any remarks..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={onClose}
              data-ocid="fees.record_payment.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-xl gradient-accent text-primary-foreground"
              disabled={recordPayment.isPending}
              data-ocid="fees.record_payment.submit_button"
            >
              {recordPayment.isPending ? "Saving..." : "Record Payment"}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type SortKey = "name" | "pending";
type StatusFilter = "All" | FeeStatus;

export function AdminFeesPage() {
  const { data: students = [], isLoading: studentsLoading } =
    useStudentsByAdmin();
  const { data: payments = [], isLoading: paymentsLoading } =
    usePaymentsByAdmin();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);

  const currentMonth = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  const isLoading = studentsLoading || paymentsLoading;

  // ── Compute per-student fee data ──────────────────────────────────────────
  const rows = useMemo(() => {
    return students
      .filter((s) => s.is_active)
      .map((student) => {
        const monthlyFee = Number(student.monthly_fee);
        const allPaid = payments
          .filter((p) => p.student_id === student.id)
          .reduce((sum, p) => sum + Number(p.amount_paid), 0);
        const thisMonthPaid = payments
          .filter(
            (p) => p.student_id === student.id && p.month === currentMonth,
          )
          .reduce((sum, p) => sum + Number(p.amount_paid), 0);
        const pending = Math.max(0, monthlyFee - thisMonthPaid);
        const status = getFeeStatus(student, payments, currentMonth);
        const lastPayment = payments
          .filter((p) => p.student_id === student.id)
          .sort((a, b) => Number(b.payment_date) - Number(a.payment_date))[0];
        const lastDate = lastPayment
          ? (() => {
              const raw = lastPayment.payment_date;
              // payment_date stored as ISO string or nanoseconds bigint
              const asNum = Number(raw);
              if (!Number.isNaN(asNum) && asNum > 1e12) {
                return new Date(asNum / 1e6).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });
              }
              return new Date(Number(raw)).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });
            })()
          : "—";

        return {
          student,
          monthlyFee,
          allPaid,
          thisMonthPaid,
          pending,
          status,
          lastDate,
        };
      });
  }, [students, payments, currentMonth]);

  // ── Summary stats ─────────────────────────────────────────────────────────
  const totalMonthlyFees = rows.reduce((s, r) => s + r.monthlyFee, 0);
  const totalCollected = rows.reduce((s, r) => s + r.thisMonthPaid, 0);
  const totalPending = rows.reduce((s, r) => s + r.pending, 0);
  const collectionRate =
    totalMonthlyFees > 0
      ? Math.round((totalCollected / totalMonthlyFees) * 100)
      : 0;

  // ── Filter + sort ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let data = rows;
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (r) =>
          r.student.name.toLowerCase().includes(q) ||
          r.student.class_.toLowerCase().includes(q) ||
          r.student.course.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== "All") {
      data = data.filter((r) => r.status === statusFilter);
    }
    return [...data].sort((a, b) => {
      const cmp =
        sortKey === "name"
          ? a.student.name.localeCompare(b.student.name)
          : b.pending - a.pending;
      return sortAsc ? cmp : -cmp;
    });
  }, [rows, search, statusFilter, sortKey, sortAsc]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((v) => !v);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  const fmt = (n: number) =>
    n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

  const summaryCards = [
    {
      icon: IndianRupee,
      label: "Total Monthly Fees",
      value: `₹${fmt(totalMonthlyFees)}`,
      sub: `${rows.length} active students`,
      accent: "bg-primary/15 text-primary",
    },
    {
      icon: TrendingUp,
      label: "Collected This Month",
      value: `₹${fmt(totalCollected)}`,
      sub: `${rows.filter((r) => r.status === "Paid").length} fully paid`,
      accent: "bg-emerald-500/15 text-emerald-500",
    },
    {
      icon: Clock,
      label: "Pending This Month",
      value: `₹${fmt(totalPending)}`,
      sub: `${rows.filter((r) => r.status === "Overdue").length} overdue`,
      accent: "bg-amber-500/15 text-amber-500",
    },
    {
      icon: Percent,
      label: "Collection Rate",
      value: `${collectionRate}%`,
      sub: "Target: 100%",
      accent:
        collectionRate >= 80
          ? "bg-emerald-500/15 text-emerald-500"
          : "bg-red-500/15 text-red-500",
    },
  ];

  return (
    <PageTransition>
      <div className="space-y-7 p-1" data-ocid="fees.page">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Fee Management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track and collect monthly fees for all students
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-muted-foreground">Current Period</p>
              <p className="text-sm font-semibold text-foreground font-display">
                {new Date().toLocaleDateString("en-IN", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center shadow-soft">
              <CreditCard className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {isLoading ? (
          <LoadingSkeleton variant="stats" />
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            data-ocid="fees.stats.section"
          >
            {summaryCards.map((c, i) => (
              <SummaryCard key={c.label} {...c} index={i} />
            ))}
          </div>
        )}

        {/* Table Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.32 }}
          className="glass-card rounded-2xl shadow-soft overflow-hidden"
          data-ocid="fees.table.section"
        >
          {/* Toolbar */}
          <div className="p-4 border-b border-border/30 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 rounded-xl h-9"
                data-ocid="fees.search_input"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {(
                [
                  "All",
                  "Paid",
                  "Partial",
                  "Pending",
                  "Overdue",
                ] as StatusFilter[]
              ).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  data-ocid={`fees.filter.${s.toLowerCase()}`}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-fast ${
                    statusFilter === s
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s}
                  {s !== "All" && (
                    <span className="ml-1 opacity-70">
                      ({rows.filter((r) => r.status === s).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="p-4">
              <LoadingSkeleton variant="table" rows={6} />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No students found"
              description={
                search || statusFilter !== "All"
                  ? "Try adjusting your search or filter criteria."
                  : "Add students to start tracking fees."
              }
              dataOcid="fees.empty_state"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="text-left px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleSort("name")}
                        className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground transition-fast"
                        data-ocid="fees.sort_name_button"
                      >
                        Student
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">
                      Monthly Fee
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">
                      Total Paid
                    </th>
                    <th className="text-right px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleSort("pending")}
                        className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground transition-fast ml-auto"
                        data-ocid="fees.sort_pending_button"
                      >
                        Pending
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Status
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">
                      Last Payment
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row, idx) => (
                    <motion.tr
                      key={row.student.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04, duration: 0.25 }}
                      className="border-b border-border/20 last:border-0 hover:bg-muted/40 transition-fast group"
                      data-ocid={`fees.item.${idx + 1}`}
                    >
                      {/* Student */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full gradient-accent flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-primary-foreground">
                              {row.student.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">
                              {row.student.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {row.student.class_} · {row.student.course}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Monthly Fee */}
                      <td className="px-4 py-3 text-right font-mono text-sm text-foreground hidden md:table-cell">
                        ₹{fmt(row.monthlyFee)}
                      </td>

                      {/* Total Paid */}
                      <td className="px-4 py-3 text-right font-mono text-sm text-emerald-600 dark:text-emerald-400 hidden lg:table-cell">
                        ₹{fmt(row.allPaid)}
                      </td>

                      {/* Pending */}
                      <td className="px-4 py-3 text-right font-mono text-sm">
                        <span
                          className={
                            row.pending > 0
                              ? "text-red-600 dark:text-red-400 font-semibold"
                              : "text-muted-foreground"
                          }
                        >
                          {row.pending > 0 ? `₹${fmt(row.pending)}` : "—"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={row.status} />
                      </td>

                      {/* Last Payment */}
                      <td className="px-4 py-3 text-right text-xs text-muted-foreground hidden sm:table-cell">
                        {row.lastDate}
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveStudent(row.student)}
                          data-ocid={`fees.record_payment_button.${idx + 1}`}
                          className="rounded-xl h-7 px-3 text-xs gap-1.5 opacity-80 group-hover:opacity-100 hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-fast"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          Pay
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer summary */}
          {!isLoading && filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Showing {filtered.length} of {rows.length} students
              </span>
              <span className="font-medium">
                Collected:{" "}
                <span className="text-emerald-600 dark:text-emerald-400">
                  ₹{fmt(filtered.reduce((s, r) => s + r.thisMonthPaid, 0))}
                </span>{" "}
                · Pending:{" "}
                <span className="text-red-600 dark:text-red-400">
                  ₹{fmt(filtered.reduce((s, r) => s + r.pending, 0))}
                </span>
              </span>
            </div>
          )}
        </motion.div>
      </div>

      {/* Record Payment Dialog */}
      <AnimatePresence>
        {activeStudent && (
          <RecordPaymentDialog
            student={activeStudent}
            currentMonth={currentMonth}
            onClose={() => setActiveStudent(null)}
          />
        )}
      </AnimatePresence>
    </PageTransition>
  );
}

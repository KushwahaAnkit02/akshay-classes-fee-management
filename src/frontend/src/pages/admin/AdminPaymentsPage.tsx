import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageTransition } from "@/components/shared/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useDeletePayment,
  usePaymentsByAdmin,
  useRecordPayment,
  useUpdatePayment,
} from "@/hooks/usePayments";
import { useStudentsByAdmin } from "@/hooks/useStudents";
import type { MonthlyPayment, PaymentMethod, UpdatePaymentForm } from "@/types";
import {
  BookOpen,
  Calendar,
  Check,
  CreditCard,
  Edit2,
  Filter,
  IndianRupee,
  PlusCircle,
  RotateCcw,
  Search,
  Trash2,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

// ─── helpers ──────────────────────────────────────────────────────────────────

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "online", label: "Online Transfer" },
  { value: "cheque", label: "Cheque" },
  { value: "card", label: "Card" },
];

const METHOD_BADGE: Record<
  PaymentMethod,
  { label: string; className: string }
> = {
  cash: {
    label: "Cash",
    className:
      "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
  },
  online: {
    label: "Online",
    className:
      "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/25",
  },
  cheque: {
    label: "Cheque",
    className:
      "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25",
  },
  card: {
    label: "Card",
    className:
      "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/25",
  },
};

function formatMonth(ym: string): string {
  const [y, m] = ym.split("-");
  const date = new Date(Number(y), Number(m) - 1);
  return date.toLocaleString("en-IN", { month: "short", year: "numeric" });
}

function formatDate(ts: bigint): string {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function tsToDateInput(ts: bigint): string {
  const d = new Date(Number(ts) / 1_000_000);
  return d.toISOString().split("T")[0];
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

// ─── Record Payment Form ──────────────────────────────────────────────────────

interface RecordFormState {
  student_id: string;
  month: string;
  amount_paid: string;
  payment_method: PaymentMethod;
  payment_date: string;
  notes: string;
  studentSearch: string;
  studentDropdownOpen: boolean;
}

function RecordPaymentCard({
  students,
}: {
  students: { id: string; name: string; class_: string }[];
}) {
  const recordPayment = useRecordPayment();
  const formRef = useRef<HTMLFormElement>(null);

  const [form, setForm] = useState<RecordFormState>({
    student_id: "",
    month: currentMonth(),
    amount_paid: "",
    payment_method: "cash",
    payment_date: todayStr(),
    notes: "",
    studentSearch: "",
    studentDropdownOpen: false,
  });

  const filteredStudents = useMemo(
    () =>
      students.filter((s) =>
        `${s.name} ${s.class_}`
          .toLowerCase()
          .includes(form.studentSearch.toLowerCase()),
      ),
    [students, form.studentSearch],
  );

  const selectedStudent = students.find((s) => s.id === form.student_id);

  function set<K extends keyof RecordFormState>(k: K, v: RecordFormState[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.student_id) {
      toast.error("Please select a student");
      return;
    }
    const amt = Number(form.amount_paid);
    if (!amt || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    try {
      await recordPayment.mutateAsync({
        student_id: form.student_id,
        month: form.month,
        amount_paid: amt,
        payment_method: form.payment_method,
        payment_date: form.payment_date,
        notes: form.notes || undefined,
      });
      toast.success("Payment recorded successfully!");
      setForm({
        student_id: "",
        month: currentMonth(),
        amount_paid: "",
        payment_method: "cash",
        payment_date: todayStr(),
        notes: "",
        studentSearch: "",
        studentDropdownOpen: false,
      });
    } catch {
      toast.error("Failed to record payment. Please try again.");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card rounded-2xl p-6 shadow-soft"
      data-ocid="payments.record_card"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center shadow-soft">
          <PlusCircle className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="font-display font-semibold text-foreground text-lg">
            Record Payment
          </h2>
          <p className="text-xs text-muted-foreground">
            Add a new fee payment entry
          </p>
        </div>
      </div>

      <form ref={formRef} onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Student Picker */}
          <div
            className="space-y-1.5 relative"
            data-ocid="payments.student_select"
          >
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Student
            </Label>
            <button
              type="button"
              onClick={() =>
                set("studentDropdownOpen", !form.studentDropdownOpen)
              }
              className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-sm text-left flex items-center justify-between gap-2 transition-fast hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span
                className={
                  selectedStudent ? "text-foreground" : "text-muted-foreground"
                }
              >
                {selectedStudent
                  ? `${selectedStudent.name} — ${selectedStudent.class_}`
                  : "Select student..."}
              </span>
              <User className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
            <AnimatePresence>
              {form.studentDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 right-0 z-30 mt-1.5 glass-card rounded-xl shadow-elevated overflow-hidden"
                >
                  <div className="p-2 border-b border-border/30">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <input
                        value={form.studentSearch}
                        onChange={(e) => set("studentSearch", e.target.value)}
                        placeholder="Search student..."
                        className="w-full pl-8 pr-3 py-1.5 text-sm bg-transparent rounded-lg border border-transparent focus:outline-none focus:border-primary/40 placeholder:text-muted-foreground"
                        data-ocid="payments.student_search_input"
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredStudents.length === 0 ? (
                      <p className="py-6 text-center text-xs text-muted-foreground">
                        No students found
                      </p>
                    ) : (
                      filteredStudents.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            set("student_id", s.id);
                            set("studentDropdownOpen", false);
                            set("studentSearch", "");
                          }}
                          className="w-full px-3 py-2.5 text-sm text-left flex items-center gap-2.5 hover:bg-primary/8 transition-fast"
                        >
                          <div className="w-7 h-7 rounded-full gradient-accent flex items-center justify-center shrink-0">
                            <span className="text-xs font-semibold text-primary-foreground">
                              {s.name[0]}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">
                              {s.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {s.class_}
                            </p>
                          </div>
                          {form.student_id === s.id && (
                            <Check className="w-3.5 h-3.5 text-primary ml-auto shrink-0" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Month */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Month
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="month"
                value={form.month}
                onChange={(e) => set("month", e.target.value)}
                required
                className="w-full h-10 pl-10 pr-3 rounded-xl border border-input bg-background/50 text-sm text-foreground transition-fast focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                data-ocid="payments.month_input"
              />
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Amount Paid
            </Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="number"
                min="1"
                step="1"
                value={form.amount_paid}
                onChange={(e) => set("amount_paid", e.target.value)}
                placeholder="0"
                required
                className="pl-10 rounded-xl border-input bg-background/50 focus:ring-2 focus:ring-ring"
                data-ocid="payments.amount_input"
              />
            </div>
          </div>

          {/* Method */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Payment Method
            </Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <select
                value={form.payment_method}
                onChange={(e) =>
                  set("payment_method", e.target.value as PaymentMethod)
                }
                className="w-full h-10 pl-10 pr-8 rounded-xl border border-input bg-background/50 text-sm text-foreground appearance-none transition-fast focus:outline-none focus:ring-2 focus:ring-ring"
                data-ocid="payments.method_select"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Payment Date
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="date"
                value={form.payment_date}
                onChange={(e) => set("payment_date", e.target.value)}
                required
                className="pl-10 rounded-xl border-input bg-background/50 focus:ring-2 focus:ring-ring"
                data-ocid="payments.date_input"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5 md:col-span-2 lg:col-span-1">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Notes{" "}
              <span className="normal-case text-muted-foreground/60">
                (optional)
              </span>
            </Label>
            <Textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Any additional notes..."
              rows={1}
              className="rounded-xl border-input bg-background/50 resize-none focus:ring-2 focus:ring-ring"
              data-ocid="payments.notes_textarea"
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <Button
            type="submit"
            disabled={recordPayment.isPending}
            className="gradient-accent text-primary-foreground px-8 rounded-xl font-medium shadow-soft hover:shadow-elevated transition-smooth disabled:opacity-60"
            data-ocid="payments.submit_button"
          >
            {recordPayment.isPending ? (
              <span className="flex items-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 1,
                    ease: "linear",
                  }}
                  className="block w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                />
                Recording...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4" />
                Record Payment
              </span>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}

// ─── Edit Payment Modal ───────────────────────────────────────────────────────

function EditPaymentModal({
  payment,
  studentName,
  onClose,
}: {
  payment: MonthlyPayment;
  studentName: string;
  onClose: () => void;
}) {
  const updatePayment = useUpdatePayment();
  const [form, setForm] = useState<
    UpdatePaymentForm & { payment_date: string }
  >({
    amount_paid: Number(payment.amount_paid),
    payment_method: payment.payment_method,
    payment_date: tsToDateInput(payment.payment_date),
    notes: payment.notes ?? "",
  });

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function handleSave() {
    try {
      await updatePayment.mutateAsync({
        id: payment.id,
        form: {
          amount_paid: form.amount_paid,
          payment_method: form.payment_method,
          payment_date: form.payment_date,
          notes: form.notes || undefined,
        },
      });
      toast.success("Payment updated successfully!");
      onClose();
    } catch {
      toast.error("Failed to update payment.");
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: "spring", damping: 26, stiffness: 300 }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg px-4"
        data-ocid="payments.edit_dialog"
      >
        <div className="glass-card rounded-2xl p-6 shadow-elevated">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-semibold text-foreground text-lg">
                Edit Payment
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {studentName} · {formatMonth(payment.month)}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-fast"
              data-ocid="payments.edit_close_button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Amount Paid (₹)
              </Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  min="1"
                  value={form.amount_paid}
                  onChange={(e) => set("amount_paid", Number(e.target.value))}
                  className="pl-10 rounded-xl border-input bg-background/50"
                  data-ocid="payments.edit_amount_input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Method
                </Label>
                <select
                  value={form.payment_method}
                  onChange={(e) =>
                    set("payment_method", e.target.value as PaymentMethod)
                  }
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-sm text-foreground appearance-none transition-fast focus:outline-none focus:ring-2 focus:ring-ring"
                  data-ocid="payments.edit_method_select"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Payment Date
                </Label>
                <Input
                  type="date"
                  value={form.payment_date}
                  onChange={(e) => set("payment_date", e.target.value)}
                  className="rounded-xl border-input bg-background/50"
                  data-ocid="payments.edit_date_input"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Notes
              </Label>
              <Textarea
                value={form.notes as string}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="Additional notes..."
                rows={2}
                className="rounded-xl border-input bg-background/50 resize-none"
                data-ocid="payments.edit_notes_textarea"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={onClose}
              data-ocid="payments.edit_cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="flex-1 gradient-accent text-primary-foreground rounded-xl shadow-soft"
              onClick={handleSave}
              disabled={updatePayment.isPending}
              data-ocid="payments.edit_save_button"
            >
              {updatePayment.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function AdminPaymentsPage() {
  const { data: payments = [], isLoading: loadingPayments } =
    usePaymentsByAdmin();
  const { data: students = [], isLoading: loadingStudents } =
    useStudentsByAdmin();
  const deletePayment = useDeletePayment();

  const [filterMonth, setFilterMonth] = useState("");
  const [filterStudentId, setFilterStudentId] = useState("");
  const [filterMethod, setFilterMethod] = useState<PaymentMethod | "">("");
  const [editPayment, setEditPayment] = useState<MonthlyPayment | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const studentMap = useMemo(
    () => new Map(students.map((s) => [s.id, s])),
    [students],
  );

  const sorted = useMemo(
    () =>
      [...payments].sort(
        (a, b) => Number(b.payment_date) - Number(a.payment_date),
      ),
    [payments],
  );

  const filtered = useMemo(() => {
    return sorted.filter((p) => {
      if (filterMonth && p.month !== filterMonth) return false;
      if (filterStudentId && p.student_id !== filterStudentId) return false;
      if (filterMethod && p.payment_method !== filterMethod) return false;
      return true;
    });
  }, [sorted, filterMonth, filterStudentId, filterMethod]);

  function resetFilters() {
    setFilterMonth("");
    setFilterStudentId("");
    setFilterMethod("");
  }

  const isFiltered = filterMonth || filterStudentId || filterMethod;
  const isLoading = loadingPayments || loadingStudents;

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deletePayment.mutateAsync(deleteId);
      toast.success("Payment deleted.");
    } catch {
      toast.error("Failed to delete payment.");
    } finally {
      setDeleteId(null);
    }
  }

  return (
    <PageTransition>
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center shadow-soft">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-foreground">
              Payments
            </h1>
            <p className="text-sm text-muted-foreground">
              Record and manage all fee payments
            </p>
          </div>
        </motion.div>

        {/* Record Payment Form */}
        {loadingStudents ? (
          <LoadingSkeleton variant="card" rows={2} />
        ) : (
          <RecordPaymentCard students={students} />
        )}

        {/* Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="glass-card rounded-2xl p-4 shadow-soft"
          data-ocid="payments.filter_bar"
        >
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filters</span>
            </div>

            {/* Month filter */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Month</Label>
              <input
                type="month"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="h-9 px-3 rounded-xl border border-input bg-background/50 text-sm text-foreground transition-fast focus:outline-none focus:ring-2 focus:ring-ring"
                data-ocid="payments.filter_month_input"
              />
            </div>

            {/* Student filter */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Student</Label>
              <select
                value={filterStudentId}
                onChange={(e) => setFilterStudentId(e.target.value)}
                className="h-9 px-3 rounded-xl border border-input bg-background/50 text-sm text-foreground appearance-none transition-fast focus:outline-none focus:ring-2 focus:ring-ring min-w-[160px]"
                data-ocid="payments.filter_student_select"
              >
                <option value="">All students</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Method filter */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Method</Label>
              <select
                value={filterMethod}
                onChange={(e) =>
                  setFilterMethod(e.target.value as PaymentMethod | "")
                }
                className="h-9 px-3 rounded-xl border border-input bg-background/50 text-sm text-foreground appearance-none transition-fast focus:outline-none focus:ring-2 focus:ring-ring min-w-[140px]"
                data-ocid="payments.filter_method_select"
              >
                <option value="">All methods</option>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-2 ml-auto">
              {isFiltered && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  className="rounded-xl h-9 gap-1.5"
                  data-ocid="payments.reset_filters_button"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </Button>
              )}
              <span className="text-sm text-muted-foreground py-1">
                {filtered.length}{" "}
                <span className="text-muted-foreground/70">
                  {filtered.length === 1 ? "result" : "results"}
                </span>
              </span>
            </div>
          </div>
        </motion.div>

        {/* Payment History Table */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="glass-card rounded-2xl shadow-soft overflow-hidden"
          data-ocid="payments.table"
        >
          <div className="flex items-center justify-between p-5 border-b border-border/30">
            <h2 className="font-display font-semibold text-foreground">
              Payment History
            </h2>
            <Badge
              variant="secondary"
              className="rounded-full text-xs font-medium"
            >
              {filtered.length} records
            </Badge>
          </div>

          {isLoading ? (
            <div className="p-5">
              <LoadingSkeleton variant="table" rows={6} />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title={isFiltered ? "No matching payments" : "No payments yet"}
              description={
                isFiltered
                  ? "Try changing or resetting your filters to see more results."
                  : "Record the first payment using the form above to get started."
              }
              actionLabel={isFiltered ? "Reset Filters" : undefined}
              onAction={isFiltered ? resetFilters : undefined}
              dataOcid="payments.empty_state"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/20">
                    {[
                      "Student",
                      "Month",
                      "Amount",
                      "Method",
                      "Date",
                      "Notes",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className={`px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider ${
                          h === "Amount" ? "text-right" : ""
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence initial={false}>
                    {filtered.map((payment, idx) => {
                      const student = studentMap.get(payment.student_id);
                      return (
                        <motion.tr
                          key={payment.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 16, height: 0 }}
                          transition={{ duration: 0.25, delay: idx * 0.03 }}
                          className="border-b border-border/10 hover:bg-primary/4 transition-fast group"
                          data-ocid={`payments.item.${idx + 1}`}
                        >
                          {/* Student */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full gradient-accent flex items-center justify-center shrink-0">
                                <span className="text-xs font-semibold text-primary-foreground">
                                  {student?.name[0] ?? "?"}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {student?.name ?? "Unknown"}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {student?.class_ ?? "—"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Month */}
                          <td className="px-4 py-3">
                            <span className="text-sm text-foreground">
                              {formatMonth(payment.month)}
                            </span>
                          </td>

                          {/* Amount */}
                          <td className="px-4 py-3 text-right">
                            <span className="text-sm font-semibold text-foreground font-mono">
                              ₹
                              {Number(payment.amount_paid).toLocaleString(
                                "en-IN",
                              )}
                            </span>
                          </td>

                          {/* Method badge */}
                          <td className="px-4 py-3">
                            <Badge
                              variant="outline"
                              className={`text-xs rounded-full border ${
                                METHOD_BADGE[payment.payment_method].className
                              }`}
                            >
                              {METHOD_BADGE[payment.payment_method].label}
                            </Badge>
                          </td>

                          {/* Date */}
                          <td className="px-4 py-3">
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                              {formatDate(payment.payment_date)}
                            </span>
                          </td>

                          {/* Notes */}
                          <td className="px-4 py-3 max-w-[160px]">
                            <span className="text-xs text-muted-foreground truncate block">
                              {payment.notes ?? "—"}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-fast">
                              <button
                                type="button"
                                onClick={() => setEditPayment(payment)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-fast"
                                data-ocid={`payments.edit_button.${idx + 1}`}
                                aria-label="Edit payment"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteId(payment.id)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-fast"
                                data-ocid={`payments.delete_button.${idx + 1}`}
                                aria-label="Delete payment"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editPayment && (
          <EditPaymentModal
            payment={editPayment}
            studentName={
              studentMap.get(editPayment.student_id)?.name ?? "Unknown"
            }
            onClose={() => setEditPayment(null)}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <ConfirmModal
        open={!!deleteId}
        title="Delete Payment"
        description="This action cannot be undone. The payment record will be permanently removed."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={deletePayment.isPending}
      />
    </PageTransition>
  );
}

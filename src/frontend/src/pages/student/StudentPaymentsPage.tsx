import { EmptyState } from "@/components/shared/EmptyState";
import { PageTransition } from "@/components/shared/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePaymentsByStudent } from "@/hooks/usePayments";
import type { MonthlyPayment } from "@/types";
import { ArrowDownUp, BookOpen, Download, Search } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

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

function formatDate(ts: bigint) {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getMonthLabel(month: string) {
  const [y, m] = month.split("-");
  return `${MONTH_NAMES[Number.parseInt(m) - 1]} ${y}`;
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

type SortDir = "asc" | "desc";

export default function StudentPaymentsPage() {
  const { data: payments = [], isLoading } = usePaymentsByStudent();
  const [search, setSearch] = useState("");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const filtered = useMemo(() => {
    let result = [...payments];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          getMonthLabel(p.month).toLowerCase().includes(q) ||
          p.month.includes(q),
      );
    }
    result.sort((a, b) => {
      const diff = Number(a.payment_date) - Number(b.payment_date);
      return sortDir === "asc" ? diff : -diff;
    });
    return result;
  }, [payments, search, sortDir]);

  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount_paid), 0);

  const handleDownload = () => {
    toast.info("Receipt download coming soon!", {
      description: "This feature will be available in the next update.",
      duration: 4000,
    });
  };

  return (
    <PageTransition>
      <div
        className="space-y-6 max-w-4xl mx-auto"
        data-ocid="student.payments.page"
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Payment History
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {payments.length} total payments · Total: ₹
              {totalPaid.toLocaleString("en-IN")}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="gap-2 rounded-xl border-border/50 h-9"
            data-ocid="student.payments.download_button"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3"
        >
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by month..."
              className="pl-9 h-9 rounded-xl border-border/50 bg-card/50"
              data-ocid="student.payments.search_input"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
            className="gap-2 rounded-xl border-border/50 h-9"
            data-ocid="student.payments.sort_toggle"
          >
            <ArrowDownUp className="w-4 h-4" />
            {sortDir === "desc" ? "Newest" : "Oldest"}
          </Button>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="glass-card rounded-2xl shadow-soft overflow-hidden"
          data-ocid="student.payments.table"
        >
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }, (_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title={search ? "No matching payments" : "No payments yet"}
              description={
                search
                  ? "Try a different search term."
                  : "Your payment history will appear here once payments are recorded."
              }
              dataOcid="student.payments.empty_state"
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30 hover:bg-transparent">
                    <TableHead className="text-xs font-semibold text-muted-foreground pl-6">
                      #
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      Month
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground text-right">
                      Amount Paid
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      Method
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      Payment Date
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      Notes
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground pr-6">
                      Receipt
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((payment: MonthlyPayment, i) => (
                    <motion.tr
                      key={payment.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.04 }}
                      className="border-border/20 hover:bg-muted/30 transition-fast"
                      data-ocid={`student.payments.row.${i + 1}`}
                    >
                      <TableCell className="pl-6 text-sm text-muted-foreground">
                        {i + 1}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-sm text-foreground">
                          {getMonthLabel(payment.month)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-display font-bold text-sm text-foreground">
                          {formatAmount(payment.amount_paid)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`text-xs px-2 py-0.5 rounded-lg ${METHOD_COLORS[payment.payment_method] ?? ""}`}
                        >
                          {METHOD_LABELS[payment.payment_method] ??
                            payment.payment_method}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(payment.payment_date)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[120px]">
                        <span className="truncate block">
                          {payment.notes ?? "—"}
                        </span>
                      </TableCell>
                      <TableCell className="pr-6">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleDownload}
                          className="h-7 px-2 rounded-lg text-muted-foreground hover:text-primary"
                          data-ocid={`student.payments.receipt.${i + 1}`}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </motion.div>

        {filtered.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xs text-muted-foreground text-center"
          >
            Showing {filtered.length} of {payments.length} payments
          </motion.p>
        )}
      </div>
    </PageTransition>
  );
}

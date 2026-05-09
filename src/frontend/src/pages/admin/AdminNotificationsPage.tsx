import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageTransition } from "@/components/shared/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationsByAdmin,
} from "@/hooks/useNotifications";
import { useStudentsByAdmin } from "@/hooks/useStudents";
import type {
  CreateNotificationForm,
  Notification,
  NotificationType,
  Student,
} from "@/types";
import {
  AlertTriangle,
  Bell,
  BellRing,
  Bot,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  MessageSquare,
  Send,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

// ─── helpers ──────────────────────────────────────────────────────────────────

const TYPE_META: Record<
  NotificationType,
  {
    label: string;
    icon: React.ElementType;
    color: string;
    border: string;
    bg: string;
  }
> = {
  custom: {
    label: "Custom",
    icon: Bell,
    color: "text-blue-400",
    border: "border-l-blue-400",
    bg: "bg-blue-400/10",
  },
  payment_received: {
    label: "Payment Received",
    icon: CheckCircle,
    color: "text-emerald-400",
    border: "border-l-emerald-400",
    bg: "bg-emerald-400/10",
  },
  fee_due: {
    label: "Fee Due",
    icon: Clock,
    color: "text-amber-400",
    border: "border-l-amber-400",
    bg: "bg-amber-400/10",
  },
  overdue: {
    label: "Overdue",
    icon: AlertTriangle,
    color: "text-red-400",
    border: "border-l-red-400",
    bg: "bg-red-400/10",
  },
};

const AUTO_TYPES: NotificationType[] = [
  "payment_received",
  "fee_due",
  "overdue",
];

function relativeTime(ts: bigint): string {
  const diffMs = Date.now() - Number(ts / 1_000_000n);
  const s = Math.floor(diffMs / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} minute${m !== 1 ? "s" : ""} ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h !== 1 ? "s" : ""} ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d !== 1 ? "s" : ""} ago`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatPill({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accent}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-display font-bold text-foreground leading-none">
          {value}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─── Notification card ────────────────────────────────────────────────────────

function NotificationCard({
  notif,
  studentMap,
  index,
}: {
  notif: Notification;
  studentMap: Map<string, Student>;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const markRead = useMarkNotificationRead();
  const meta = TYPE_META[notif.type_];
  const Icon = meta.icon;
  const studentName = notif.student_id
    ? (studentMap.get(notif.student_id)?.name ?? "Unknown")
    : "All Students";

  function handleExpand() {
    setExpanded((p) => !p);
    if (!notif.is_read) {
      markRead.mutate(notif.id);
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className={`glass-card rounded-xl border-l-4 ${meta.border} ${
        notif.is_read ? "opacity-80" : ""
      } transition-fast cursor-pointer group`}
      onClick={handleExpand}
      data-ocid={`notification.item.${index + 1}`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* type icon */}
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${meta.bg}`}
          >
            <Icon className={`w-4 h-4 ${meta.color}`} />
          </div>

          {/* main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-foreground truncate max-w-[200px]">
                {notif.title}
              </span>
              {!notif.is_read && (
                <span
                  className="w-2 h-2 rounded-full bg-primary shrink-0"
                  aria-label="unread"
                />
              )}
              <Badge
                variant="outline"
                className={`text-xs border-transparent ${meta.bg} ${meta.color} ml-auto`}
              >
                {meta.label}
              </Badge>
            </div>
            <p
              className={`text-xs text-muted-foreground mt-0.5 ${
                expanded ? "" : "truncate"
              }`}
            >
              {notif.message}
            </p>
          </div>

          {/* chevron */}
          <div className="shrink-0 text-muted-foreground group-hover:text-foreground transition-fast">
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>

        {/* footer row */}
        <div className="flex items-center justify-between mt-2.5 pl-12">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Users className="w-3 h-3" />
            {studentName}
          </span>
          <span className="text-xs text-muted-foreground">
            {relativeTime(notif.created_at)}
          </span>
        </div>

        {/* expanded body */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 pl-12 pt-3 border-t border-border/30">
                <p className="text-sm text-foreground leading-relaxed">
                  {notif.message}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type FilterTab = "all" | "unread" | "auto" | "manual";

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "auto", label: "Auto-generated" },
  { key: "manual", label: "Manual" },
];

const NOTIF_TYPE_OPTIONS: { value: NotificationType; label: string }[] = [
  { value: "custom", label: "Custom Message" },
  { value: "payment_received", label: "Payment Received" },
  { value: "fee_due", label: "Fee Due" },
  { value: "overdue", label: "Overdue" },
];

export function AdminNotificationsPage() {
  const { data: notifications = [], isLoading: loadingNotifs } =
    useNotificationsByAdmin();
  const { data: students = [], isLoading: loadingStudents } =
    useStudentsByAdmin();
  const createNotification = useCreateNotification();
  const markAllRead = useMarkAllNotificationsRead();

  const [filter, setFilter] = useState<FilterTab>("all");
  const [form, setForm] = useState<CreateNotificationForm>({
    title: "",
    message: "",
    type_: "custom",
    student_id: undefined,
  });

  const studentMap = new Map<string, Student>(students.map((s) => [s.id, s]));

  const totalCount = notifications.length;
  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const autoCount = notifications.filter((n) =>
    AUTO_TYPES.includes(n.type_),
  ).length;

  const filtered = notifications
    .slice()
    .sort((a, b) => Number(b.created_at - a.created_at))
    .filter((n) => {
      if (filter === "unread") return !n.is_read;
      if (filter === "auto") return AUTO_TYPES.includes(n.type_);
      if (filter === "manual") return !AUTO_TYPES.includes(n.type_);
      return true;
    });

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      toast.error("Title and message are required.");
      return;
    }
    try {
      await createNotification.mutateAsync(form);
      toast.success("Notification sent successfully!");
      setForm({
        title: "",
        message: "",
        type_: "custom",
        student_id: undefined,
      });
    } catch {
      toast.error("Failed to send notification.");
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllRead.mutateAsync();
      toast.success("All notifications marked as read.");
    } catch {
      toast.error("Failed to mark notifications as read.");
    }
  }

  return (
    <PageTransition>
      <div className="space-y-6 p-6">
        {/* ── Page header ── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Notifications
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Send and manage student notifications
            </p>
          </div>
        </div>

        {/* ── Stats row ── */}
        {loadingNotifs ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="glass-card rounded-2xl p-4 flex items-center gap-4"
              >
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div className="space-y-1.5">
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            data-ocid="notifications.stats_section"
          >
            <StatPill
              label="Total Notifications"
              value={totalCount}
              icon={Bell}
              accent="bg-primary/15 text-primary"
            />
            <StatPill
              label="Unread"
              value={unreadCount}
              icon={BellRing}
              accent="bg-amber-400/15 text-amber-400"
            />
            <StatPill
              label="Auto-generated"
              value={autoCount}
              icon={Bot}
              accent="bg-emerald-400/15 text-emerald-400"
            />
          </motion.div>
        )}

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">
          {/* ── Send Form ── */}
          <motion.form
            onSubmit={handleSend}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="glass-card rounded-2xl p-5 space-y-4 shadow-soft"
            data-ocid="notification.send_form"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-primary-foreground" />
              </div>
              <h2 className="font-display font-semibold text-foreground">
                Send Notification
              </h2>
            </div>

            {/* Recipient */}
            <div className="space-y-1.5">
              <Label
                htmlFor="notif-recipient"
                className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
              >
                Recipient
              </Label>
              {loadingStudents ? (
                <Skeleton className="h-9 w-full rounded-lg" />
              ) : (
                <select
                  id="notif-recipient"
                  value={form.student_id ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      student_id: e.target.value || undefined,
                    }))
                  }
                  className="w-full h-9 rounded-lg bg-background border border-input px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-fast"
                  data-ocid="notification.recipient_select"
                >
                  <option value="">All Students</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {getInitials(s.name)} · {s.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <Label
                htmlFor="notif-title"
                className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
              >
                Title
              </Label>
              <input
                id="notif-title"
                type="text"
                placeholder="Notification title..."
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                className="w-full h-9 rounded-lg bg-background border border-input px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-fast"
                data-ocid="notification.title_input"
              />
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <Label
                htmlFor="notif-message"
                className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
              >
                Message
              </Label>
              <Textarea
                id="notif-message"
                placeholder="Type your message here..."
                value={form.message}
                onChange={(e) =>
                  setForm((p) => ({ ...p, message: e.target.value }))
                }
                rows={4}
                className="resize-none bg-background text-sm"
                data-ocid="notification.message_textarea"
              />
            </div>

            {/* Type */}
            <div className="space-y-1.5">
              <Label
                htmlFor="notif-type"
                className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
              >
                Type
              </Label>
              <select
                id="notif-type"
                value={form.type_}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    type_: e.target.value as NotificationType,
                  }))
                }
                className="w-full h-9 rounded-lg bg-background border border-input px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-fast"
                data-ocid="notification.type_select"
              >
                {NOTIF_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <Button
              type="submit"
              disabled={createNotification.isPending}
              className="w-full gradient-accent text-primary-foreground gap-2"
              data-ocid="notification.send_button"
            >
              {createNotification.isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Notification
                </>
              )}
            </Button>
          </motion.form>

          {/* ── Notifications list ── */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="space-y-4"
            data-ocid="notification.list_section"
          >
            {/* Filter tabs + mark all read */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
                {FILTER_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setFilter(tab.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-fast ${
                      filter === tab.key
                        ? "bg-card text-foreground shadow-soft"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    data-ocid={`notification.filter.${tab.key}`}
                  >
                    {tab.label}
                    {tab.key === "unread" && unreadCount > 0 && (
                      <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 text-[10px] rounded-full bg-primary text-primary-foreground">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {unreadCount > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllRead}
                  disabled={markAllRead.isPending}
                  className="text-xs"
                  data-ocid="notification.mark_all_read_button"
                >
                  {markAllRead.isPending ? "Marking..." : "Mark All Read"}
                </Button>
              )}
            </div>

            {/* List content */}
            {loadingNotifs ? (
              <LoadingSkeleton variant="list" rows={5} />
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={Bell}
                title="No notifications yet"
                description="Send your first notification to students using the form on the left."
                dataOcid="notification.empty_state"
              />
            ) : (
              <AnimatePresence mode="popLayout">
                <div className="space-y-3">
                  {filtered.map((notif, i) => (
                    <NotificationCard
                      key={notif.id}
                      notif={notif}
                      studentMap={studentMap}
                      index={i}
                    />
                  ))}
                </div>
              </AnimatePresence>
            )}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}

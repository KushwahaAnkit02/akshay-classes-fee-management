import { PageTransition } from "@/components/shared/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useMyProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useMyStudentProfile } from "@/hooks/useStudents";
import { useAuthStore } from "@/store/authStore";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  CreditCard,
  Edit2,
  GraduationCap,
  Mail,
  Moon,
  Phone,
  Save,
  Sun,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function formatDate(ts: bigint) {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatAmount(val: bigint) {
  return `₹${Number(val).toLocaleString("en-IN")}`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function StudentProfilePage() {
  const { profile, setProfile } = useAuthStore();
  const { data: freshProfile, isLoading: profileLoading } = useMyProfile();
  const { data: student, isLoading: studentLoading } = useMyStudentProfile();
  const updateProfile = useUpdateProfile();
  const { theme, setTheme } = useTheme();

  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const activeProfile = freshProfile ?? profile;
  const isLoading = profileLoading || studentLoading;

  useEffect(() => {
    if (activeProfile) {
      setName(activeProfile.name);
      setPhone(activeProfile.phone ?? "");
    }
  }, [activeProfile]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    try {
      await updateProfile.mutateAsync({
        name: name.trim(),
        phone: phone.trim() || undefined,
      });
      if (profile) {
        setProfile({
          ...profile,
          name: name.trim(),
          phone: phone.trim() || undefined,
        });
      }
      toast.success("Profile updated successfully!");
      setEditOpen(false);
    } catch {
      toast.error("Failed to update profile. Please try again.");
    }
  };

  const handleCancel = () => {
    if (activeProfile) {
      setName(activeProfile.name);
      setPhone(activeProfile.phone ?? "");
    }
    setEditOpen(false);
  };

  return (
    <PageTransition>
      <div
        className="space-y-6 max-w-2xl mx-auto"
        data-ocid="student.profile.page"
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              My Profile
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage your account information
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditOpen(true)}
            className="gap-2 rounded-xl border-border/50"
            data-ocid="student.profile.edit_button"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </Button>
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-card rounded-2xl p-6 shadow-soft"
          data-ocid="student.profile.card"
        >
          {isLoading ? (
            <div className="flex items-center gap-5">
              <Skeleton className="w-20 h-20 rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          ) : activeProfile ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
                className="w-20 h-20 rounded-2xl gradient-accent flex items-center justify-center text-2xl font-display font-bold text-primary-foreground shadow-soft shrink-0"
                data-ocid="student.profile.avatar"
              >
                {getInitials(activeProfile.name)}
              </motion.div>
              <div className="flex-1 min-w-0">
                <h2 className="font-display text-xl font-bold text-foreground truncate">
                  {activeProfile.name}
                </h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Mail className="w-3.5 h-3.5" />
                    {activeProfile.email}
                  </span>
                  {activeProfile.phone && (
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Phone className="w-3.5 h-3.5" />
                      {activeProfile.phone}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Badge className="bg-primary/15 text-primary text-xs px-2.5 py-0.5 capitalize rounded-lg">
                    {activeProfile.role}
                  </Badge>
                  <Badge
                    className={`text-xs px-2.5 py-0.5 rounded-lg ${
                      activeProfile.is_active
                        ? "bg-emerald-500/15 text-emerald-600"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {activeProfile.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Profile not found.</p>
          )}
        </motion.div>

        {/* Student Details Card */}
        {student && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="glass-card rounded-2xl p-6 shadow-soft"
            data-ocid="student.profile.student_details_card"
          >
            <div className="flex items-center gap-2 mb-5">
              <GraduationCap className="w-4 h-4 text-primary" />
              <h2 className="font-display font-semibold text-foreground">
                Academic Details
              </h2>
              <Badge className="ml-auto text-[10px] px-2 bg-muted text-muted-foreground">
                Read-only
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Course", value: student.course, icon: BookOpen },
                { label: "Class", value: student.class_, icon: GraduationCap },
                {
                  label: "Monthly Fee",
                  value: formatAmount(student.monthly_fee),
                  icon: CreditCard,
                },
                {
                  label: "Joined Date",
                  value: formatDate(student.joined_date),
                  icon: Calendar,
                },
                {
                  label: "Fee Start Date",
                  value: formatDate(student.fee_start_date),
                  icon: Calendar,
                },
                {
                  label: "Status",
                  value: student.is_active ? "Active" : "Inactive",
                  icon: CheckCircle2,
                },
              ].map(({ label, value, icon: Icon }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + i * 0.06 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/20"
                >
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-sm font-medium text-foreground truncate">
                      {value}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Theme & Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="glass-card rounded-2xl p-6 shadow-soft"
          data-ocid="student.profile.preferences_card"
        >
          <h2 className="font-display font-semibold text-foreground mb-5">
            Preferences
          </h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                {theme === "dark" ? (
                  <Moon className="w-4 h-4 text-primary" />
                ) : (
                  <Sun className="w-4 h-4 text-primary" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Dark Mode</p>
                <p className="text-xs text-muted-foreground">
                  Switch between light and dark theme
                </p>
              </div>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) =>
                setTheme(checked ? "dark" : "light")
              }
              data-ocid="student.profile.theme_toggle"
            />
          </div>
        </motion.div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {editOpen && (
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogContent
              className="glass-card border-border/50 rounded-2xl shadow-elevated max-w-md"
              data-ocid="student.profile.edit_dialog"
            >
              <DialogHeader>
                <DialogTitle className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Edit Profile
                </DialogTitle>
              </DialogHeader>
              <Separator className="opacity-30" />
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="edit-name"
                    className="text-sm font-medium text-foreground"
                  >
                    Full Name
                  </Label>
                  <Input
                    id="edit-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="h-10 rounded-xl border-border/50 bg-card/50"
                    data-ocid="student.profile.name_input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="edit-phone"
                    className="text-sm font-medium text-foreground"
                  >
                    Phone Number
                  </Label>
                  <Input
                    id="edit-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    className="h-10 rounded-xl border-border/50 bg-card/50"
                    data-ocid="student.profile.phone_input"
                  />
                </div>
                <div className="p-3 rounded-xl bg-muted/40 border border-border/20">
                  <p className="text-xs text-muted-foreground">
                    <Mail className="w-3.5 h-3.5 inline mr-1" />
                    Email address cannot be changed from here.
                  </p>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="gap-2 rounded-xl border-border/50"
                  data-ocid="student.profile.edit_cancel_button"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={updateProfile.isPending}
                  className="gap-2 rounded-xl gradient-accent text-primary-foreground"
                  data-ocid="student.profile.edit_save_button"
                >
                  <Save className="w-4 h-4" />
                  {updateProfile.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}

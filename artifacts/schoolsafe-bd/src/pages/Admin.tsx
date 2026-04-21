/* =========================================================
 * SchoolSafe BD — Admin Panel
 *
 * Password-protected page at /admin for editing site content.
 * Editable sections: Hero, Intro Cards, Footer, Contact.
 * Content is stored in the database; homepage reads from it.
 * ========================================================= */

import { useState, useEffect, useRef } from "react";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { toast } from "sonner";
import { Home, LayoutGrid, FileText, Phone, BarChart2, User } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const API_BASE = `${import.meta.env.BASE_URL}api`;

/* ── Field definitions ────────────────────────────────── */

type FieldDef = {
  key: string;
  label: string;
  multiline?: boolean;
};

type Section = {
  title: string;
  icon: React.ReactNode;
  fields: FieldDef[];
  bilingual?: boolean;
  isAnalytics?: boolean;
  isAccount?: boolean;
};

const SECTIONS: Section[] = [
  {
    title: "Hero",
    icon: <Home size={15} />,
    bilingual: true,
    fields: [
      { key: "siteName", label: "Site Name" },
      { key: "siteTagline", label: "Tagline" },
      { key: "siteDescription", label: "Description", multiline: true },
      { key: "prototypeNotice", label: "Prototype Notice", multiline: true },
    ],
  },
  {
    title: "Intro Cards",
    icon: <LayoutGrid size={15} />,
    bilingual: true,
    fields: [
      { key: "introWhatTitle", label: '"What this website does" — Title' },
      { key: "introWhatText", label: '"What this website does" — Text', multiline: true },
      { key: "introHowTitle", label: '"How to use" — Title' },
      { key: "introHowText", label: '"How to use" — Text', multiline: true },
    ],
  },
  {
    title: "Footer",
    icon: <FileText size={15} />,
    bilingual: true,
    fields: [
      { key: "footerPurpose", label: "Purpose", multiline: true },
      { key: "footerDataSource", label: "Data Source" },
      { key: "footerDisclaimer", label: "Disclaimer" },
      { key: "footerCreditBefore", label: "Credit (before link)", multiline: true },
      { key: "footerCreditAfter", label: "Credit (after link)" },
    ],
  },
  {
    title: "Contact",
    icon: <Phone size={15} />,
    bilingual: false,
    fields: [
      { key: "contact_email", label: "Email Address" },
      { key: "contact_phone", label: "Phone / Mobile" },
      { key: "contact_facebook", label: "Facebook URL (leave blank to hide)" },
      { key: "contact_telegram", label: "Telegram URL (leave blank to hide)" },
      { key: "contact_x", label: "X (Twitter) URL (leave blank to hide)" },
    ],
  },
  {
    title: "Analytics",
    icon: <BarChart2 size={15} />,
    bilingual: false,
    fields: [],
    isAnalytics: true,
  },
  {
    title: "Account",
    icon: <User size={15} />,
    bilingual: false,
    fields: [],
    isAccount: true,
  },
];

/* ── Forgot Password Modal ────────────────────────────── */

function ForgotPasswordModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl p-6 max-w-sm w-full shadow-lg">
        <h2 className="text-base font-bold text-foreground mb-2">Password Recovery</h2>
        <p className="text-sm text-muted-foreground mb-4">
          To reset your admin password or username, use one of these methods:
        </p>
        <ol className="text-sm text-foreground space-y-3 list-decimal list-inside">
          <li>
            Go to your <strong>Replit project</strong> → <strong>Secrets</strong> → Update{" "}
            <code className="bg-muted px-1 py-0.5 rounded text-xs">ADMIN_PASSWORD</code>
          </li>
          <li>
            Once logged in, go to the <strong>Account</strong> tab in the admin panel to
            change your username and password.
          </li>
          <li>Contact the site administrator.</li>
        </ol>
        <button
          onClick={onClose}
          className="mt-5 w-full bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

/* ── Login Form ───────────────────────────────────────── */

function LoginForm({
  onLogin,
}: {
  onLogin: (username: string) => void;
}) {
  const [username, setUsername] = useState(
    localStorage.getItem("admin_username") ?? "",
  );
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.status === 401) {
        setError("Invalid credentials. Please check your username and password.");
      } else if (res.ok) {
        const data = (await res.json()) as { username: string };
        onLogin(data.username || username);
      } else {
        setError("Server error. Please try again.");
      }
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {showRecovery && <ForgotPasswordModal onClose={() => setShowRecovery(false)} />}
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm bg-card border border-border rounded-xl shadow-sm p-8">
          <h1 className="text-xl font-bold text-foreground mb-1">Admin Panel</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Enter your credentials to manage site content.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-username"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Username
              </label>
              <input
                id="admin-username"
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="admin@example.com"
                required
                autoFocus
              />
            </div>
            <div>
              <label
                htmlFor="admin-password"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter password"
                required
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 font-medium">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {loading ? "Checking…" : "Log In"}
            </button>
          </form>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setShowRecovery(true)}
              className="text-xs text-muted-foreground hover:text-primary transition-colors hover:underline"
            >
              Forgot password?
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Bilingual Field Row ───────────────────────────────── */

function FieldRow({
  fieldKey,
  label,
  multiline,
  enValue,
  bnValue,
  onChangeEn,
  onChangeBn,
}: {
  fieldKey: string;
  label: string;
  multiline?: boolean;
  enValue: string;
  bnValue: string;
  onChangeEn: (val: string) => void;
  onChangeBn: (val: string) => void;
}) {
  const inputClass =
    "w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-y";

  const hasOverride = enValue.trim() !== "" || bnValue.trim() !== "";

  function handleReset() {
    onChangeEn("");
    onChangeBn("");
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {label}
          <span className="ml-2 font-normal text-xs text-muted-foreground/60 normal-case">
            ({fieldKey})
          </span>
        </p>
        {hasOverride && (
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-red-500 hover:text-red-700 hover:underline transition-colors shrink-0"
            title="Clear this override and restore the built-in default"
          >
            Reset to default
          </button>
        )}
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-muted-foreground mb-1">English</p>
          {multiline ? (
            <textarea
              rows={3}
              value={enValue}
              onChange={(e) => onChangeEn(e.target.value)}
              className={inputClass}
              placeholder="English text…"
            />
          ) : (
            <input
              type="text"
              value={enValue}
              onChange={(e) => onChangeEn(e.target.value)}
              className={inputClass}
              placeholder="English text…"
            />
          )}
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">বাংলা (Bangla)</p>
          {multiline ? (
            <textarea
              rows={3}
              value={bnValue}
              onChange={(e) => onChangeBn(e.target.value)}
              className={inputClass}
              placeholder="বাংলা টেক্সট…"
            />
          ) : (
            <input
              type="text"
              value={bnValue}
              onChange={(e) => onChangeBn(e.target.value)}
              className={inputClass}
              placeholder="বাংলা টেক্সট…"
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Single-value Field Row (for non-bilingual fields) ── */

function SingleFieldRow({
  fieldKey,
  label,
  value,
  onChange,
}: {
  fieldKey: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  const inputClass =
    "w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary";

  const hasOverride = value.trim() !== "";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {label}
          <span className="ml-2 font-normal text-xs text-muted-foreground/60 normal-case">
            ({fieldKey})
          </span>
        </p>
        {hasOverride && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-xs text-red-500 hover:text-red-700 hover:underline transition-colors shrink-0"
            title="Clear this override and restore the built-in default"
          >
            Reset to default
          </button>
        )}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        placeholder="Leave blank to hide / use default"
      />
    </div>
  );
}

/* ── Analytics Panel ─────────────────────────────────── */

type Summary = {
  total: number;
  today: number;
  last7days: number;
  last30days: number;
  uniqueSessions: number;
};

type DailyPoint = { date: string; count: number };
type PageCount = { page: string; count: number };
type DistrictCount = { district: string; count: number };
type UpazilaCount = { upazila: string; count: number };
type DeviceCount = { deviceType: string | null; count: number };
type VisitRow = {
  id: number;
  sessionId: string;
  visitedAt: string;
  page: string;
  ipMasked: string | null;
  browser: string | null;
  os: string | null;
  deviceType: string | null;
  referrer: string | null;
  district: string | null;
  upazila: string | null;
  lang: string | null;
};

function SummaryCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-sm">
      <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{label}</p>
      <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
    </div>
  );
}

function AnalyticsPanel() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [daily, setDaily] = useState<DailyPoint[]>([]);
  const [topPages, setTopPages] = useState<PageCount[]>([]);
  const [topDistricts, setTopDistricts] = useState<DistrictCount[]>([]);
  const [topUpazilas, setTopUpazilas] = useState<UpazilaCount[]>([]);
  const [byDevice, setByDevice] = useState<DeviceCount[]>([]);
  const [recent, setRecent] = useState<VisitRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const endpoints = [
      "/analytics/summary",
      "/analytics/daily?days=30",
      "/analytics/top-pages?limit=10",
      "/analytics/top-districts?limit=10",
      "/analytics/top-upazilas?limit=10",
      "/analytics/by-device",
      "/analytics/recent?limit=50",
    ];

    setLoading(true);
    setError(null);

    Promise.all(
      endpoints.map((e) =>
        fetch(`${API_BASE}${e}`, { credentials: "include" }).then((r) => {
          if (!r.ok) throw new Error(`${e} → ${r.status}`);
          return r.json();
        })
      )
    )
      .then(([s, d, tp, td, tu, bd, rc]) => {
        setSummary(s);
        setDaily(d);
        setTopPages(tp);
        setTopDistricts(td);
        setTopUpazilas(tu);
        setByDevice(bd);
        setRecent(rc);
      })
      .catch((err: Error) => {
        setError(err.message || "Failed to load analytics");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-muted-foreground py-8">Loading analytics…</p>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
        Could not load analytics: {error}
      </div>
    );
  }

  const totalDevice = byDevice.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="space-y-6">
      {/* Privacy note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-900">
        <strong>Privacy:</strong> These analytics track traffic patterns only. No personal data
        is stored. IP addresses are masked (e.g., <code>203.82.14.x</code>) and visitors are
        identified by an anonymous session ID — never by name or email.
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <SummaryCard label="Total Visits" value={summary?.total ?? 0} />
        <SummaryCard label="Today" value={summary?.today ?? 0} />
        <SummaryCard label="Last 7 Days" value={summary?.last7days ?? 0} />
        <SummaryCard label="Last 30 Days" value={summary?.last30days ?? 0} />
        <SummaryCard label="Unique Sessions" value={summary?.uniqueSessions ?? 0} />
      </div>

      {/* Daily chart */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Daily Visits (last 30 days)</h3>
        {daily.length > 0 ? (
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={daily} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d: string) => d.slice(5)}
                  fontSize={11}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis fontSize={11} allowDecimals={false} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  labelFormatter={(d: string) => d}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No data yet.</p>
        )}
      </div>

      {/* Two-column lists */}
      <div className="grid md:grid-cols-2 gap-4">
        <ListCard title="Top Pages" rows={topPages.map((p) => ({ label: p.page, count: p.count }))} />
        <ListCard
          title="Traffic by Device"
          rows={byDevice.map((d) => ({
            label: (d.deviceType ?? "unknown") + (totalDevice ? ` (${Math.round((d.count / totalDevice) * 100)}%)` : ""),
            count: d.count,
          }))}
        />
        <ListCard
          title="Top Districts Selected"
          rows={topDistricts.map((d) => ({ label: d.district, count: d.count }))}
        />
        <ListCard
          title="Top Upazilas Selected"
          rows={topUpazilas.map((u) => ({ label: u.upazila, count: u.count }))}
        />
      </div>

      {/* Recent visits table */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Recent Visits (last 50)</h3>
        {recent.length === 0 ? (
          <p className="text-xs text-muted-foreground">No visits yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left border-b border-border text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Time</th>
                  <th className="py-2 pr-3 font-medium">Page</th>
                  <th className="py-2 pr-3 font-medium">IP (masked)</th>
                  <th className="py-2 pr-3 font-medium">Browser</th>
                  <th className="py-2 pr-3 font-medium">OS</th>
                  <th className="py-2 pr-3 font-medium">Device</th>
                  <th className="py-2 pr-3 font-medium">District</th>
                  <th className="py-2 pr-3 font-medium">Upazila</th>
                  <th className="py-2 pr-3 font-medium">Lang</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((v) => (
                  <tr key={v.id} className="border-b border-border/50 last:border-0">
                    <td className="py-2 pr-3 whitespace-nowrap text-muted-foreground">
                      {new Date(v.visitedAt).toLocaleString()}
                    </td>
                    <td className="py-2 pr-3 font-mono text-foreground">{v.page}</td>
                    <td className="py-2 pr-3 font-mono text-muted-foreground">{v.ipMasked ?? "—"}</td>
                    <td className="py-2 pr-3 text-foreground">{v.browser ?? "—"}</td>
                    <td className="py-2 pr-3 text-foreground">{v.os ?? "—"}</td>
                    <td className="py-2 pr-3 text-foreground">{v.deviceType ?? "—"}</td>
                    <td className="py-2 pr-3 text-foreground">{v.district ?? "—"}</td>
                    <td className="py-2 pr-3 text-foreground">{v.upazila ?? "—"}</td>
                    <td className="py-2 pr-3 text-foreground">{v.lang ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ListCard({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; count: number }[];
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-xs text-muted-foreground">No data yet.</p>
      ) : (
        <ul className="space-y-1.5">
          {rows.map((r, i) => (
            <li
              key={`${r.label}-${i}`}
              className="flex items-center justify-between text-sm gap-3"
            >
              <span className="truncate text-foreground font-mono text-xs">{r.label}</span>
              <span className="shrink-0 font-semibold text-muted-foreground tabular-nums">
                {r.count}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── Account Panel ────────────────────────────────────── */

function AccountPanel({
  username,
  onCredentialsChanged,
}: {
  username: string;
  onCredentialsChanged: (newUser: string, passwordChanged: boolean) => void;
}) {
  const inputClass =
    "w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary";

  const [canonicalUsername, setCanonicalUsername] = useState(username);
  const [newUsername, setNewUsername] = useState(username);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/me`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { username: string } | null) => {
        if (data?.username) {
          setCanonicalUsername(data.username);
          setNewUsername(data.username);
        }
      })
      .catch(() => {});
  }, []);

  async function handleSave() {
    const usernameChanged = newUsername.trim() !== canonicalUsername;
    const passwordChanged = newPassword.trim() !== "";

    if (!usernameChanged && !passwordChanged) {
      toast.info("No changes to save.");
      return;
    }
    if (passwordChanged && newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (passwordChanged && newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/credentials`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newUsername: usernameChanged ? newUsername.trim() : undefined,
          newPassword: passwordChanged ? newPassword : undefined,
        }),
      });

      if (res.ok) {
        toast.success(
          passwordChanged
            ? "Credentials updated! Please log in again with your new password."
            : "Credentials updated.",
        );
        onCredentialsChanged(newUsername.trim(), passwordChanged);
        setNewPassword("");
        setConfirmPassword("");
      } else if (res.status === 401) {
        toast.error("Session expired. Please log in again.");
      } else {
        toast.error("Failed to update credentials. Please try again.");
      }
    } catch {
      toast.error("Could not connect to the server.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-md">
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-900">
        <strong>Security note:</strong> Changing your password here stores it in the database.
        It overrides the <code className="bg-blue-100 px-1 rounded text-xs">ADMIN_PASSWORD</code>{" "}
        environment variable for all future logins.
      </div>

      {/* Username */}
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Username (email)
        </label>
        <input
          type="email"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
          className={inputClass}
          placeholder="admin@example.com"
        />
      </div>

      {/* New password */}
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          New Password
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className={inputClass}
          placeholder="Leave blank to keep current password"
          autoComplete="new-password"
        />
        <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
      </div>

      {/* Confirm password */}
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Confirm New Password
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={inputClass}
          placeholder="Re-enter new password"
          autoComplete="new-password"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-primary text-primary-foreground rounded-lg px-6 py-2.5 text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {saving ? "Saving…" : "Save Credentials"}
      </button>
    </div>
  );
}

/* ── Editor ───────────────────────────────────────────── */

function Editor({
  username,
  onLogout,
  onCredentialsChanged,
}: {
  username: string;
  onLogout: () => void;
  onCredentialsChanged: (newUser: string, passwordChanged: boolean) => void;
}) {
  const { settings, reload } = useSiteSettings();
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setDraft({ ...settings });
  }, [settings]);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeSection]);

  function setValue(key: string, lang: "en" | "bn", value: string) {
    setDraft((prev) => ({ ...prev, [`${key}_${lang}`]: value }));
  }

  function getValue(key: string, lang: "en" | "bn"): string {
    return draft[`${key}_${lang}`] ?? "";
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (res.ok) {
        toast.success("Content saved! The homepage will reflect changes on next load.");
        reload();
      } else if (res.status === 401) {
        toast.error("Session expired. Please log in again.");
        onLogout();
      } else {
        toast.error("Failed to save. Please try again.");
      }
    } catch {
      toast.error("Could not connect to the server.");
    } finally {
      setSaving(false);
    }
  }

  const section = SECTIONS[activeSection];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Top bar ─────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-card border-b border-border px-4 py-3 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-base font-bold text-foreground">Admin Panel</h1>
          <p className="text-xs text-muted-foreground">
            Edit site content — changes are saved to the database
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving…" : "Save All Changes"}
          </button>
          <button
            onClick={onLogout}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Log out
          </button>
        </div>
      </div>

      {/* ── Mobile section picker (full-width bar, above content) ─ */}
      <div className="md:hidden border-b border-border bg-card px-4 py-2 sticky top-[57px] z-10">
        <select
          value={activeSection}
          onChange={(e) => setActiveSection(Number(e.target.value))}
          className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {SECTIONS.map((s, i) => (
            <option key={s.title} value={i}>
              {s.title}
            </option>
          ))}
        </select>
      </div>

      {/* ── Body: sidebar + content ──────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Desktop sidebar (hidden on mobile) */}
        <aside className="hidden md:flex flex-col w-52 shrink-0 border-r border-border bg-card sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto">
          <nav className="py-3 px-2 space-y-0.5">
            {SECTIONS.map((s, i) => (
              <button
                key={s.title}
                onClick={() => setActiveSection(i)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                  activeSection === i
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span className={activeSection === i ? "text-primary" : "text-muted-foreground"}>
                  {s.icon}
                </span>
                {s.title}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content area */}
        <main ref={mainRef} className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
            {/* Info banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
              <strong>Note:</strong> Leaving a field blank uses the built-in default text. Fill in only the fields you want to override. Use the <strong>Reset to default</strong> button on any field to clear your override — the change takes effect when you save.
            </div>

            {/* Active section */}
            <div>
              <h2 className="text-lg font-bold text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2">
                <span className="text-primary">{section.icon}</span>
                {section.title}
              </h2>

              {section.isAccount ? (
                <AccountPanel
                  username={username}
                  onCredentialsChanged={onCredentialsChanged}
                />
              ) : section.isAnalytics ? (
                <AnalyticsPanel />
              ) : section.bilingual === false ? (
                <div className="space-y-6">
                  <p className="text-xs text-muted-foreground">
                    These values are the same in both English and Bangla.
                  </p>
                  {section.fields.map((field) => (
                    <SingleFieldRow
                      key={field.key}
                      fieldKey={field.key}
                      label={field.label}
                      value={draft[field.key] ?? ""}
                      onChange={(val) =>
                        setDraft((prev) => ({ ...prev, [field.key]: val }))
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {section.fields.map((field) => (
                    <FieldRow
                      key={field.key}
                      fieldKey={field.key}
                      label={field.label}
                      multiline={field.multiline}
                      enValue={getValue(field.key, "en")}
                      bnValue={getValue(field.key, "bn")}
                      onChangeEn={(val) => setValue(field.key, "en", val)}
                      onChangeBn={(val) => setValue(field.key, "bn", val)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Bottom save button — hidden on analytics and account sections */}
            {!section.isAnalytics && !section.isAccount && (
              <div className="pt-2 pb-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-primary text-primary-foreground rounded-lg px-6 py-2.5 text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {saving ? "Saving…" : "Save All Changes"}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ── Admin Page ───────────────────────────────────────── */

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [username, setUsername] = useState<string>(
    () => localStorage.getItem("admin_username") ?? "",
  );
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/admin/session`, { credentials: "include" })
      .then(async (r) => {
        if (cancelled) return;
        if (r.ok) {
          const data = (await r.json()) as { username: string };
          if (data?.username) {
            localStorage.setItem("admin_username", data.username);
            setUsername(data.username);
          }
          setAuthed(true);
        } else {
          setAuthed(false);
        }
      })
      .catch(() => {
        if (!cancelled) setAuthed(false);
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleLogin(user: string) {
    localStorage.setItem("admin_username", user);
    setUsername(user);
    setAuthed(true);
  }

  async function handleLogout() {
    try {
      await fetch(`${API_BASE}/admin/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      /* ignore */
    }
    setAuthed(false);
  }

  function handleCredentialsChanged(newUser: string, passwordChanged: boolean) {
    localStorage.setItem("admin_username", newUser);
    setUsername(newUser);
    if (passwordChanged) {
      // Server invalidates the session when the password changes; force re-login.
      setAuthed(false);
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!authed) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <Editor
      username={username}
      onLogout={handleLogout}
      onCredentialsChanged={handleCredentialsChanged}
    />
  );
}

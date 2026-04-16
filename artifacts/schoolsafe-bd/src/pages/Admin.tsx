/* =========================================================
 * SchoolSafe BD — Admin Panel
 *
 * Password-protected page at /admin for editing site content.
 * Editable sections: Hero, Intro Cards, Footer, Contact.
 * Content is stored in the database; homepage reads from it.
 * ========================================================= */

import { useState, useEffect } from "react";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { toast } from "sonner";

const API_BASE = `${import.meta.env.BASE_URL}api`;

/* ── Field definitions ────────────────────────────────── */

type FieldDef = {
  key: string;
  label: string;
  multiline?: boolean;
};

type Section = {
  title: string;
  fields: FieldDef[];
  bilingual?: boolean;
};

const SECTIONS: Section[] = [
  {
    title: "Hero",
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
    bilingual: false,
    fields: [
      { key: "contact_email", label: "Email Address" },
      { key: "contact_phone", label: "Phone / Mobile" },
      { key: "contact_facebook", label: "Facebook URL (leave blank to hide)" },
      { key: "contact_telegram", label: "Telegram URL (leave blank to hide)" },
      { key: "contact_x", label: "X (Twitter) URL (leave blank to hide)" },
    ],
  },
];

/* ── Login Form ───────────────────────────────────────── */

function LoginForm({
  onLogin,
}: {
  onLogin: (password: string) => void;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify({}),
      });
      if (res.status === 401) {
        setError("Incorrect password. Please try again.");
      } else if (res.ok) {
        onLogin(password);
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
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-xl shadow-sm p-8">
        <h1 className="text-xl font-bold text-foreground mb-1">Admin Panel</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Enter the admin password to manage site content.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              autoFocus
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
      </div>
    </div>
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

/* ── Editor ───────────────────────────────────────────── */

function Editor({
  password,
  onLogout,
}: {
  password: string;
  onLogout: () => void;
}) {
  const { settings, reload } = useSiteSettings();
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft({ ...settings });
  }, [settings]);

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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${password}`,
        },
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

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3 flex items-center justify-between shadow-sm">
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

      {/* Content sections */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
          <strong>Note:</strong> Leaving a field blank uses the built-in default text. Fill in only the fields you want to override. Use the <strong>Reset to default</strong> button on any field to clear your override — the change takes effect when you save.
        </div>

        {SECTIONS.map((section) => (
          <div key={section.title}>
            <h2 className="text-lg font-bold text-foreground mb-4 pb-2 border-b border-border">
              {section.title}
            </h2>
            {section.bilingual === false ? (
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
        ))}

        <div className="pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary text-primary-foreground rounded-lg px-6 py-2.5 text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving…" : "Save All Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Admin Page ───────────────────────────────────────── */

export default function AdminPage() {
  const [password, setPassword] = useState<string | null>(() => {
    return sessionStorage.getItem("admin_password");
  });

  function handleLogin(pw: string) {
    sessionStorage.setItem("admin_password", pw);
    setPassword(pw);
  }

  function handleLogout() {
    sessionStorage.removeItem("admin_password");
    setPassword(null);
  }

  if (!password) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return <Editor password={password} onLogout={handleLogout} />;
}

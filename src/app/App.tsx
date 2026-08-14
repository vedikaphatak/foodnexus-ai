import React, { Fragment, useState, useEffect } from "react";
import {
  Shield, AlertTriangle, CheckCircle, XCircle, Clock, Upload,
  Camera, BarChart2, Bell, Search, User, X, ChevronDown, Eye, Zap,
  Activity, TrendingUp, TrendingDown, ArrowRight, ArrowLeft, Home,
  ClipboardList, Building, MapPin, Filter, RefreshCw, AlertCircle,
  BookOpen, Info, Play, Layers, Flag, Lock, Check, Download, Plus,
  CheckSquare
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────
type Role = "consumer" | "business" | "authority";
type Screen =
  | "landing" | "report" | "evidence" | "ai-analysis" | "confirmation" | "tracking"
  | "business-dashboard" | "ai-kitchen" | "complaint-detail" | "corrective-action"
  | "authority-command" | "priority-businesses" | "business-profile"
  | "evidence-review" | "human-decision" | "how-it-works" | "ai-safety";

// ─── Color tokens ─────────────────────────────────────────────────────────────
const C = {
  navy: "#0A1628",
  navyMid: "#0F2040",
  teal: "#0891B2",
  cyan: "#06B6D4",
  safe: "#10B981",
  warning: "#F59E0B",
  critical: "#EF4444",
  bg: "#EEF4FF",
};

// ─── Mock data ────────────────────────────────────────────────────────────────
const trendData = [
  { month: "Mar", complaints: 12, signals: 5, resolved: 9 },
  { month: "Apr", complaints: 15, signals: 7, resolved: 11 },
  { month: "May", complaints: 10, signals: 4, resolved: 14 },
  { month: "Jun", complaints: 18, signals: 9, resolved: 13 },
  { month: "Jul", complaints: 14, signals: 6, resolved: 16 },
  { month: "Aug", complaints: 12, signals: 8, resolved: 15 },
];

const bizRiskTrend = [
  { month: "Mar", risk: 45 }, { month: "Apr", risk: 52 },
  { month: "May", risk: 61 }, { month: "Jun", risk: 74 },
  { month: "Jul", risk: 83 }, { month: "Aug", risk: 92 },
];

const categoryData = [
  { name: "Spoilage", value: 34, color: "#EF4444" },
  { name: "Hygiene", value: 28, color: "#F59E0B" },
  { name: "Foreign Object", value: 18, color: "#8B5CF6" },
  { name: "Storage", value: 12, color: "#0891B2" },
  { name: "Other", value: 8, color: "#6B7280" },
];

const businesses = [
  { name: "GreenBite Foods", risk: 92, complaints: 24, signals: 18, repeat: 7, lastInspection: "12 Jun 2026", action: "Overdue", status: "Critical" },
  { name: "Urban Spice", risk: 84, complaints: 19, signals: 14, repeat: 5, lastInspection: "03 Jul 2026", action: "Pending", status: "High" },
  { name: "FreshBox Kitchen", risk: 78, complaints: 15, signals: 11, repeat: 4, lastInspection: "18 Jul 2026", action: "In Progress", status: "High" },
  { name: "Daily Bowl", risk: 61, complaints: 9, signals: 6, repeat: 2, lastInspection: "01 Aug 2026", action: "Completed", status: "Medium" },
  { name: "TasteStreet", risk: 44, complaints: 5, signals: 3, repeat: 1, lastInspection: "05 Aug 2026", action: "Completed", status: "Low" },
];

const cityMarkers = [
  { city: "New Delhi", x: 31, y: 22, risk: "critical", count: 8 },
  { city: "Mumbai", x: 17, y: 54, risk: "high", count: 6 },
  { city: "Bengaluru", x: 22, y: 70, risk: "medium", count: 4 },
  { city: "Hyderabad", x: 27, y: 63, risk: "high", count: 5 },
  { city: "Chennai", x: 30, y: 76, risk: "medium", count: 3 },
  { city: "Kolkata", x: 44, y: 40, risk: "low", count: 2 },
  { city: "Jaipur", x: 24, y: 30, risk: "high", count: 4 },
  { city: "Ahmedabad", x: 15, y: 44, risk: "low", count: 2 },
];

// ─── Shared primitives ────────────────────────────────────────────────────────
function RiskBadge({ level }: { level: string }) {
  const map: Record<string, string> = {
    Critical: "bg-red-100 text-red-700 border-red-200",
    High: "bg-orange-100 text-orange-700 border-orange-200",
    Medium: "bg-amber-100 text-amber-700 border-amber-200",
    Low: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Resolved: "bg-blue-100 text-blue-700 border-blue-200",
  };
  const dot: Record<string, string> = {
    Critical: "bg-red-500", High: "bg-orange-500", Medium: "bg-amber-500",
    Low: "bg-emerald-500", Resolved: "bg-blue-500",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${map[level] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot[level] ?? "bg-gray-400"}`} />
      {level}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    "Pending": "bg-gray-100 text-gray-600",
    "In Progress": "bg-blue-100 text-blue-700",
    "Completed": "bg-emerald-100 text-emerald-700",
    "Overdue": "bg-red-100 text-red-700",
    "Under Review": "bg-purple-100 text-purple-700",
    "Resolved": "bg-emerald-100 text-emerald-700",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

function KPICard({ label, value, icon: Icon, color, trend }: {
  label: string; value: string | number; icon: React.ElementType;
  color: string; trend?: "up" | "down" | "neutral";
}) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + "18" }}>
          <Icon size={20} style={{ color }} />
        </div>
        {trend && (
          <span className={`flex items-center gap-1 text-xs font-semibold ${trend === "up" ? "text-red-500" : trend === "down" ? "text-emerald-500" : "text-gray-400"}`}>
            {trend === "up" ? <TrendingUp size={12} /> : trend === "down" ? <TrendingDown size={12} /> : null}
            {trend === "up" ? "+12%" : trend === "down" ? "−8%" : "—"}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-0.5">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
type NavItem = { label: string; screen: Screen; icon: React.ElementType };

const consumerNav: NavItem[] = [
  { label: "Home", screen: "landing", icon: Home },
  { label: "Report Issue", screen: "report", icon: AlertTriangle },
  { label: "Track Report", screen: "tracking", icon: ClipboardList },
  { label: "How It Works", screen: "how-it-works", icon: BookOpen },
];
const businessNav: NavItem[] = [
  { label: "Dashboard", screen: "business-dashboard", icon: BarChart2 },
  { label: "AI Kitchen", screen: "ai-kitchen", icon: Zap },
  { label: "Complaints", screen: "complaint-detail", icon: AlertTriangle },
  { label: "Corrective Actions", screen: "corrective-action", icon: CheckSquare },
];
const authorityNav: NavItem[] = [
  { label: "Command Center", screen: "authority-command", icon: Shield },
  { label: "Priority Businesses", screen: "priority-businesses", icon: Flag },
  { label: "Investigations", screen: "business-profile", icon: Eye },
  { label: "Evidence Review", screen: "evidence-review", icon: Layers },
  { label: "Human Decision", screen: "human-decision", icon: Lock },
];

function Sidebar({ role, current, navigate }: { role: Role; current: Screen; navigate: (s: Screen) => void }) {
  const nav = role === "consumer" ? consumerNav : role === "business" ? businessNav : authorityNav;
  const identity = role === "consumer" ? "Vedika Phatak" : role === "business" ? "GreenBite Foods" : "FSSAI Authority";
  return (
    <aside className="w-60 min-h-screen flex flex-col flex-shrink-0" style={{ backgroundColor: C.navy }}>
      <div className="p-5 flex items-center gap-2.5 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: C.teal }}>
          <Shield size={16} color="white" />
        </div>
        <div>
          <div className="text-white font-bold text-sm leading-tight tracking-wide">FOODNEXUS</div>
          <div className="text-xs leading-tight" style={{ color: C.cyan }}>AI Safety Platform</div>
        </div>
      </div>

      <div className="px-4 py-3">
        <div className="rounded-lg px-3 py-2.5" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
          <div className="text-xs text-slate-400 uppercase tracking-widest mb-0.5">Signed in as</div>
          <div className="text-white text-sm font-semibold">{identity}</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {nav.map((item) => {
          const active = current === item.screen;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.screen)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left"
              style={active
                ? { backgroundColor: C.teal + "28", color: C.cyan }
                : { color: "#94A3B8" }
              }
              onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.color = "#CBD5E1"; }}
              onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.color = "#94A3B8"; }}
            >
              <item.icon size={15} />
              <span>{item.label}</span>
              {active && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: C.cyan }} />}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <button onClick={() => navigate("ai-safety")} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200 transition-colors">
          <Info size={13} /> AI Safety & Oversight
        </button>
      </div>
    </aside>
  );
}

// ─── TopBar ───────────────────────────────────────────────────────────────────
function TopBar({ role, setRole, navigate }: { role: Role; setRole: (r: Role) => void; navigate: (s: Screen) => void }) {
  const [notifs, setNotifs] = useState(false);
  const initials = role === "consumer" ? "VP" : role === "business" ? "GB" : "FA";
  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center px-5 gap-4 sticky top-0 z-30 shadow-sm flex-shrink-0">
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5 w-56">
        <Search size={13} className="text-gray-400" />
        <input className="bg-transparent text-sm text-gray-600 outline-none w-full placeholder:text-gray-400" placeholder="Search reports, businesses…" />
      </div>
      <div className="flex-1" />

      {/* Role switcher */}
      <div className="flex items-center gap-1 p-1 bg-gray-50 rounded-lg border border-gray-100">
        {(["consumer", "business", "authority"] as Role[]).map((r) => (
          <button
            key={r}
            onClick={() => { setRole(r); navigate(r === "consumer" ? "landing" : r === "business" ? "business-dashboard" : "authority-command"); }}
            className="px-3 py-1.5 rounded-md text-xs font-semibold transition-all capitalize"
            style={role === r ? { backgroundColor: C.navy, color: "#fff" } : { color: "#6B7280" }}
          >
            {r === "authority" ? "Authority" : r === "business" ? "Business" : "Consumer"}
          </button>
        ))}
      </div>

      {/* Notifications */}
      <div className="relative">
        <button onClick={() => setNotifs(!notifs)} className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-50 border border-gray-100 text-gray-500">
          <Bell size={15} />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">3</span>
        </button>
        {notifs && (
          <div className="absolute right-0 top-11 w-76 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 font-semibold text-sm text-gray-800">Notifications</div>
            {[
              { msg: "High-risk signal detected at GreenBite Foods", t: "5m ago", c: "bg-red-500" },
              { msg: "New complaint submitted — Urban Spice", t: "23m ago", c: "bg-orange-500" },
              { msg: "Corrective action overdue: FreshBox Kitchen", t: "1h ago", c: "bg-amber-500" },
            ].map((n, i) => (
              <div key={i} className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 flex gap-2.5">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.c}`} />
                <div>
                  <div className="text-xs font-medium text-gray-700">{n.msg}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{n.t}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded-lg border border-gray-100 hover:bg-gray-50">
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: C.teal }}>{initials}</div>
        <ChevronDown size={12} className="text-gray-400" />
      </div>
    </header>
  );
}

// ─── App layout ───────────────────────────────────────────────────────────────
function AppLayout({ role, setRole, navigate, screen, children }: {
  role: Role; setRole: (r: Role) => void; navigate: (s: Screen) => void;
  screen: Screen; children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: C.bg }}>
      <Sidebar role={role} current={screen} navigate={navigate} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar role={role} setRole={setRole} navigate={navigate} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — LANDING
// ═══════════════════════════════════════════════════════════════════════════════
function LandingScreen({ navigate, setRole }: { navigate: (s: Screen) => void; setRole: (r: Role) => void }) {
  const workflow = [
    { icon: Camera, label: "Report", sub: "Consumer captures issue" },
    { icon: Zap, label: "AI Analysis", sub: "Visual pattern detection" },
    { icon: AlertTriangle, label: "Risk Signal", sub: "Confidence-scored alert" },
    { icon: Building, label: "Business Action", sub: "Corrective steps required" },
    { icon: Shield, label: "Authority", sub: "Priority investigation" },
    { icon: CheckCircle, label: "Resolution", sub: "Verified outcome logged" },
  ];

  const roles = [
    { title: "Consumer", role: "consumer" as Role, color: C.teal, icon: User, dest: "report" as Screen, points: ["Report food safety concerns in minutes", "Upload photographic evidence", "Track complaint status in real-time", "Receive resolution updates"] },
    { title: "Food Business", role: "business" as Role, color: "#7C3AED", icon: Building, dest: "business-dashboard" as Screen, points: ["Detect AI safety signals early", "Manage corrective actions swiftly", "Track compliance performance", "Build food safety culture"] },
    { title: "Food Authority", role: "authority" as Role, color: "#DC2626", icon: Shield, dest: "authority-command" as Screen, points: ["Prioritize investigations by risk score", "Evidence-based decision making", "Monitor corrective action compliance", "Full audit trail and accountability"] },
  ];

  const features = [
    { icon: Zap, title: "AI Visual Analysis", desc: "Pattern detection identifies contamination signals, mold, discoloration, and hygiene anomalies in uploaded evidence." },
    { icon: Activity, title: "Risk Intelligence", desc: "Automated risk scoring from complaint frequency, AI signals, and business response history." },
    { icon: ClipboardList, title: "Complaint Tracking", desc: "End-to-end transparency from first report to final resolution with timestamped audit trail." },
    { icon: CheckCircle, title: "Corrective Actions", desc: "Structured action management with owner assignment, due dates, and evidence upload." },
    { icon: Shield, title: "Command Center", desc: "National-level oversight with risk mapping and priority business intelligence dashboards." },
    { icon: Eye, title: "Evidence Review", desc: "AI-assisted human review workflow with clear decision authority and full accountability." },
    { icon: Lock, title: "Human Oversight", desc: "AI provides observations only. All enforcement decisions are made by authorized human reviewers." },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: C.navy }}>
              <Shield size={15} color="white" />
            </div>
            <span className="font-extrabold text-gray-900 tracking-tight">FOODNEXUS AI</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-500">
            <button onClick={() => navigate("how-it-works")} className="hover:text-gray-900 transition-colors">How It Works</button>
            <button onClick={() => navigate("ai-safety")} className="hover:text-gray-900 transition-colors">AI Safety</button>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button onClick={() => { setRole("consumer"); navigate("report"); }}
              className="px-4 py-2 text-sm font-bold text-white rounded-lg" style={{ backgroundColor: C.teal }}>
              Report Issue
            </button>
            <button onClick={() => { setRole("authority"); navigate("authority-command"); }}
              className="px-4 py-2 text-sm font-bold rounded-lg border-2 transition-colors hover:bg-gray-50"
              style={{ borderColor: C.navy, color: C.navy }}>
              Explore Platform
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background: `linear-gradient(140deg, ${C.navy} 0%, #0F2D5E 55%, #0A3D4A 100%)` }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.04) 1px, transparent 0)", backgroundSize: "36px 36px" }} />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-6"
            style={{ backgroundColor: C.teal + "20", color: C.cyan, border: `1px solid ${C.teal}40` }}>
            <Zap size={11} /> AI-Assisted Food Safety Intelligence · IDEATHON 2026
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-[1.08] mb-6 tracking-tight">
            See Food Risk<br />
            <span style={{ color: C.cyan }}>Before It Becomes</span><br />
            a Crisis.
          </h1>
          <p className="text-lg text-blue-200 max-w-2xl mx-auto mb-10 leading-relaxed">
            AI-assisted food-safety intelligence connecting consumers, businesses and authorities.
            Evidence-based. Human-verified. Transparent.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button onClick={() => { setRole("consumer"); navigate("report"); }}
              className="px-8 py-4 text-base font-bold text-white rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              style={{ backgroundColor: C.teal }}>
              Report Food Safety Concern <ArrowRight size={16} />
            </button>
            <button onClick={() => { setRole("consumer"); navigate("report"); }}
              className="px-8 py-4 text-base font-bold rounded-xl border-2 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
              style={{ borderColor: "rgba(255,255,255,0.3)", color: "white" }}>
              <Play size={15} /> Start Demo
            </button>
          </div>
        </div>

        {/* Workflow strip */}
        <div className="relative max-w-4xl mx-auto px-6 pb-16">
          <div className="flex items-start justify-between relative">
            <div className="absolute top-5 left-10 right-10 h-px" style={{ background: `linear-gradient(to right, transparent, ${C.cyan}40, transparent)` }} />
            {workflow.map((step, i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-1 text-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center border z-10 relative"
                  style={{ backgroundColor: C.navy, borderColor: C.teal + "50" }}>
                  <step.icon size={15} style={{ color: C.cyan }} />
                </div>
                <div className="text-white text-xs font-semibold">{step.label}</div>
                <div className="text-blue-300 text-xs max-w-[70px] leading-snug">{step.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role cards */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">One Platform, Three Perspectives</h2>
          <p className="text-gray-500 max-w-xl mx-auto">FOODNEXUS AI serves every stakeholder in the food safety ecosystem with role-specific tools and intelligence.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((r) => (
            <div key={r.title} className="rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => { setRole(r.role); navigate(r.dest); }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: r.color + "12" }}>
                <r.icon size={22} style={{ color: r.color }} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">{r.title}</h3>
              <ul className="space-y-2">
                {r.points.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={13} className="mt-0.5 flex-shrink-0" style={{ color: r.color }} /> {p}
                  </li>
                ))}
              </ul>
              <div className="mt-5 text-sm font-bold flex items-center gap-1" style={{ color: r.color }}>
                Explore {r.title} view <ArrowRight size={13} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20" style={{ backgroundColor: C.bg }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Intelligence at Every Step</h2>
            <p className="text-gray-500">From consumer evidence to authority decision — every stage is transparent, accountable, and AI-assisted.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-sm transition-shadow">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: C.teal + "12" }}>
                  <f.icon size={17} style={{ color: C.teal }} />
                </div>
                <div className="font-semibold text-gray-900 text-xs mb-1.5">{f.title}</div>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="rounded-2xl p-12" style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.navyMid})` }}>
            <h2 className="text-3xl font-extrabold text-white mb-4">See the Full Demo Flow</h2>
            <p className="text-blue-200 mb-8">Walk through the complete journey — from consumer complaint to authority resolution in 9 steps.</p>
            <button onClick={() => { setRole("consumer"); navigate("report"); }}
              className="px-8 py-4 font-bold text-white rounded-xl hover:opacity-90 transition-opacity inline-flex items-center gap-2"
              style={{ backgroundColor: C.teal }}>
              <Play size={16} /> Start Demo
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield size={13} style={{ color: C.teal }} />
          <span className="text-sm font-bold" style={{ color: C.navy }}>FOODNEXUS AI</span>
        </div>
        <p className="text-xs text-gray-400 max-w-sm mx-auto">AI-assisted food safety intelligence. AI provides visual observations only — all decisions are made by authorized human reviewers.</p>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — CONSUMER REPORT
// ═══════════════════════════════════════════════════════════════════════════════
function ReportScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const [form, setForm] = useState({ business: "", location: "", category: "", desc: "", anon: false });
  const steps = ["Issue Details", "Evidence", "AI Analysis", "Submit", "Track"];
  const cats = [
    { id: "spoilage", label: "Spoilage", emoji: "🍎" },
    { id: "hygiene", label: "Hygiene Issue", emoji: "🧼" },
    { id: "foreign", label: "Foreign Object", emoji: "⚠️" },
    { id: "storage", label: "Storage Failure", emoji: "❄️" },
    { id: "contamination", label: "Suspected Contamination", emoji: "☣️" },
    { id: "other", label: "Other Concern", emoji: "📋" },
  ];

  return (
    <div>
      {/* Stepper */}
      <div className="flex items-center mb-8 max-w-2xl">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={i === 0 ? { backgroundColor: C.teal, color: "#fff" } : i < 0 ? { backgroundColor: C.safe, color: "#fff" } : { border: "2px solid #E5E7EB", color: "#9CA3AF" }}>
                {i === 0 ? 1 : i + 1}
              </div>
              <span className="text-sm font-medium" style={{ color: i === 0 ? "#111" : "#9CA3AF" }}>{s}</span>
            </div>
            {i < steps.length - 1 && <div className="flex-1 h-px mx-3 bg-gray-200 max-w-12" />}
          </div>
        ))}
      </div>

      <div className="max-w-2xl">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-gray-900">Report Food Safety Concern</h2>
          <p className="text-sm text-gray-500 mt-1">Your report helps keep communities safe. Reviewed by authorized food safety officials.</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Business / Restaurant Name *</label>
            <input className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-teal-400 transition-colors"
              placeholder="e.g. GreenBite Foods, Connaught Place"
              value={form.business} onChange={(e) => setForm({ ...form, business: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Location *</label>
            <div className="flex gap-2">
              <input className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-teal-400"
                placeholder="Full address or area"
                value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              <button className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-1.5">
                <MapPin size={13} /> Use Location
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category of Concern *</label>
            <div className="grid grid-cols-3 gap-2">
              {cats.map((c) => (
                <button key={c.id} onClick={() => setForm({ ...form, category: c.id })}
                  className="p-3 rounded-lg border-2 text-left transition-all"
                  style={form.category === c.id ? { borderColor: C.teal, backgroundColor: C.teal + "08" } : { borderColor: "#E5E7EB" }}>
                  <div className="text-xl mb-1">{c.emoji}</div>
                  <div className="text-xs font-semibold" style={{ color: form.category === c.id ? C.teal : "#4B5563" }}>{c.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description of the Issue *</label>
            <textarea className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-teal-400 resize-none"
              rows={4} placeholder="Describe what you observed — appearance, smell, texture, context. The more detail, the better."
              value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} />
            <div className="text-xs text-gray-400 mt-1">{form.desc.length}/500 characters</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date of Incident *</label>
              <input type="date" defaultValue="2026-08-13" className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-teal-400" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Approximate Time</label>
              <input type="time" defaultValue="13:30" className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-teal-400" />
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <button onClick={() => setForm({ ...form, anon: !form.anon })}
              className="w-11 h-6 rounded-full relative flex-shrink-0 transition-colors"
              style={{ backgroundColor: form.anon ? C.teal : "#CBD5E1" }}>
              <span className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all" style={{ left: form.anon ? "1.375rem" : "0.25rem" }} />
            </button>
            <div>
              <div className="text-sm font-semibold text-gray-700">Submit Anonymously</div>
              <div className="text-xs text-gray-500">Your identity will not be shared with the business or public</div>
            </div>
          </div>

          <div className="p-3 rounded-lg border text-xs" style={{ backgroundColor: C.teal + "08", borderColor: C.teal + "30", color: C.navy }}>
            <Info size={12} className="inline mr-1.5" style={{ color: C.teal }} />
            AI will analyze your evidence for visual patterns. This is AI-assisted observation only — not a laboratory test or legal finding.
          </div>
        </div>

        <div className="flex justify-between mt-5">
          <button className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Save Draft</button>
          <button onClick={() => navigate("evidence")} className="px-8 py-2.5 rounded-lg text-sm font-bold text-white flex items-center gap-2" style={{ backgroundColor: C.teal }}>
            Continue to Evidence <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — EVIDENCE UPLOAD
// ═══════════════════════════════════════════════════════════════════════════════
function EvidenceScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState([
    { name: "food_photo_greenBite.jpg", size: "2.4 MB", type: "Food Photo", status: "uploaded", emoji: "📷" },
    { name: "packaging_label.jpg", size: "1.1 MB", type: "Packaging", status: "uploaded", emoji: "📦" },
    { name: "kitchen_video.mp4", size: "8.7 MB", type: "Video", status: "uploading", emoji: "🎥" },
  ]);

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <div className="flex gap-1 h-1.5 rounded-full overflow-hidden bg-gray-100 max-w-xs">
          {[1, 1, 0, 0, 0].map((v, i) => (
            <div key={i} className="flex-1 rounded-full" style={{ backgroundColor: v ? C.teal : "transparent" }} />
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-1">Step 2 of 5 — Evidence Upload</p>
      </div>

      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-900">Upload Evidence</h2>
        <p className="text-sm text-gray-500 mt-1">Photos and videos provide crucial context for AI visual analysis and human review.</p>
      </div>

      <div
        className="rounded-xl border-2 border-dashed p-12 text-center mb-5 transition-all cursor-pointer"
        style={{ borderColor: dragOver ? C.teal : "#D1D5DB", backgroundColor: dragOver ? C.teal + "06" : "transparent" }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={() => setDragOver(false)}
      >
        <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: C.teal + "14" }}>
          <Upload size={24} style={{ color: C.teal }} />
        </div>
        <h3 className="font-bold text-gray-800 mb-2">Drag & drop files here</h3>
        <p className="text-sm text-gray-500 mb-4">Food photos, kitchen images, packaging, receipts, video (Max 50 MB per file)</p>
        <button className="px-5 py-2 rounded-lg text-sm font-bold text-white" style={{ backgroundColor: C.teal }}>Browse Files</button>
      </div>

      <div className="grid grid-cols-5 gap-2.5 mb-5">
        {[{ emoji: "🍽️", type: "Food Photo" }, { emoji: "🍳", type: "Kitchen" }, { emoji: "📦", type: "Packaging" }, { emoji: "🧾", type: "Receipt" }, { emoji: "🎥", type: "Video" }].map((t) => (
          <div key={t.type} className="rounded-lg border border-gray-200 p-3 text-center hover:border-teal-300 cursor-pointer transition-colors">
            <div className="text-2xl mb-1">{t.emoji}</div>
            <div className="text-xs font-semibold text-gray-600">{t.type}</div>
          </div>
        ))}
      </div>

      {files.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-5">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">Uploaded Files ({files.length})</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <span className="text-xl">{f.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">{f.name}</div>
                  <div className="text-xs text-gray-400">{f.type} · {f.size}</div>
                  {f.status === "uploading" && (
                    <div className="h-1 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                      <div className="h-full rounded-full w-3/5" style={{ backgroundColor: C.teal }} />
                    </div>
                  )}
                </div>
                {f.status === "uploaded" ? <CheckCircle size={15} className="text-emerald-500 flex-shrink-0" /> : <RefreshCw size={13} className="text-teal-500 animate-spin flex-shrink-0" />}
                <button onClick={() => setFiles(files.filter((_, j) => j !== i))} className="text-gray-300 hover:text-red-400 transition-colors">
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-3 rounded-lg border text-xs mb-5" style={{ backgroundColor: "#FFF7ED", borderColor: "#FED7AA", color: "#92400E" }}>
        <AlertTriangle size={12} className="inline mr-1.5 text-amber-500" />
        Evidence is used solely for food safety assessment. Privacy protected under FOODNEXUS AI Data Protection Policy.
      </div>

      <div className="flex justify-between">
        <button onClick={() => navigate("report")} className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-1.5">
          <ArrowLeft size={14} /> Back
        </button>
        <button onClick={() => navigate("ai-analysis")} className="px-8 py-2.5 rounded-lg text-sm font-bold text-white flex items-center gap-2" style={{ backgroundColor: C.teal }}>
          <Zap size={14} /> Analyze with FOODNEXUS AI
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — AI ANALYSIS (HERO SCREEN)
// ═══════════════════════════════════════════════════════════════════════════════
function AIAnalysisScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 2200); return () => clearTimeout(t); }, []);

  const obs = [
    { text: "Dark discoloration detected on surface", conf: 91 },
    { text: "Texture anomaly inconsistent with freshness", conf: 83 },
    { text: "Possible mold-like pattern in region of interest", conf: 78 },
    { text: "Appearance deviates from freshness benchmark", conf: 72 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center animate-pulse" style={{ backgroundColor: C.teal + "18" }}>
            <Zap size={36} style={{ color: C.teal }} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Analyzing Evidence…</h2>
          <p className="text-sm text-gray-500 mb-7">FOODNEXUS AI is processing your uploaded evidence</p>
          <div className="space-y-2.5 text-left">
            {["Loading image data…", "Running visual pattern analysis…", "Calculating confidence scores…", "Generating observations…"].map((step, i) => (
              <div key={i} className={`flex items-center gap-2.5 text-sm ${i < 3 ? "text-teal-600" : "text-gray-400"}`}>
                {i < 3 ? <CheckCircle size={14} /> : <RefreshCw size={14} className="animate-spin" />}
                {step}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 p-3 rounded-lg border flex items-center gap-2 text-sm" style={{ backgroundColor: "#FFF7ED", borderColor: "#FED7AA" }}>
        <AlertTriangle size={13} className="text-amber-500 flex-shrink-0" />
        <span className="text-amber-800"><strong>AI-assisted visual observation only</strong> — not a laboratory diagnosis. Human verification required before any enforcement action.</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Image with AI overlay */}
        <div className="lg:col-span-3">
          <div className="bg-gray-900 rounded-xl overflow-hidden relative shadow-lg">
            <img src="https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=900&h=560&fit=crop&auto=format"
              alt="Food evidence under AI analysis" className="w-full object-cover" style={{ maxHeight: 440 }} />
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <rect x="22" y="14" width="56" height="50" fill="none" stroke="#EF4444" strokeWidth="0.45" strokeDasharray="2.5,1.2" />
              <text x="22" y="12.5" fill="#EF4444" fontSize="2.8" fontFamily="'JetBrains Mono',monospace">RISK ZONE A · 91% confidence</text>
              <rect x="58" y="34" width="24" height="28" fill="none" stroke="#F59E0B" strokeWidth="0.35" strokeDasharray="2,1" />
              <text x="58" y="32.5" fill="#F59E0B" fontSize="2.4" fontFamily="'JetBrains Mono',monospace">ZONE B · 78%</text>
              <circle cx="44" cy="36" r="9" fill="#EF4444" opacity="0.16" />
              <circle cx="68" cy="48" r="6" fill="#F59E0B" opacity="0.16" />
              <circle cx="33" cy="50" r="4" fill="#EF4444" opacity="0.10" />
              {/* Corner markers */}
              {[{ x1: 22, y1: 14, dx: 4, dy: 0 }, { x1: 22, y1: 14, dx: 0, dy: 4 }, { x1: 78, y1: 14, dx: -4, dy: 0 }, { x1: 78, y1: 14, dx: 0, dy: 4 }, { x1: 22, y1: 64, dx: 4, dy: 0 }, { x1: 22, y1: 64, dx: 0, dy: -4 }, { x1: 78, y1: 64, dx: -4, dy: 0 }, { x1: 78, y1: 64, dx: 0, dy: -4 }].map((l, i) => (
                <line key={i} x1={l.x1} y1={l.y1} x2={l.x1 + l.dx} y2={l.y1 + l.dy} stroke="#EF4444" strokeWidth="0.7" />
              ))}
            </svg>
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between">
              <span className="text-xs text-gray-300 font-mono">food_photo_greenBite.jpg · AI Scan v3.2</span>
              <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-red-600/90 text-white">HIGH RISK DETECTED</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-3">
            {[{ label: "Image Quality", val: 94, color: C.safe }, { label: "Evidence Clarity", val: 87, color: C.teal }, { label: "AI Coverage", val: 91, color: C.teal }].map((m) => (
              <div key={m.label} className="bg-white rounded-lg border border-gray-100 p-3 text-center">
                <div className="text-lg font-bold" style={{ color: m.color }}>{m.val}%</div>
                <div className="text-xs text-gray-500 mt-0.5">{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Analysis panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border-2 border-red-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={14} style={{ color: C.teal }} />
              <span className="text-sm font-bold" style={{ color: C.teal }}>AI ANALYSIS COMPLETE</span>
            </div>

            <div className="space-y-2.5 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Potential Risk Level</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-extrabold text-red-600">HIGH</span>
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">AI Confidence</span>
                <span className="text-2xl font-extrabold text-gray-900 font-mono">87%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: "87%", backgroundColor: C.teal }} />
              </div>
            </div>

            <div className="p-3.5 rounded-lg mb-4" style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA" }}>
              <div className="text-xs font-bold text-red-700 mb-2 flex items-center gap-1.5">
                <AlertTriangle size={11} /> AI-Assisted Observations
              </div>
              <ul className="space-y-1.5">
                {obs.map((o, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-red-700">
                    <span className="text-red-400 mt-0.5">•</span>
                    <span className="flex-1">{o.text}</span>
                    <span className="font-mono font-bold ml-1 flex-shrink-0">{o.conf}%</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-lg" style={{ backgroundColor: "#FFFBEB", border: "1px solid #FDE68A" }}>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
                <Eye size={11} /> Human Verification Required
              </div>
              <p className="text-xs text-amber-600 mt-1">This AI analysis must be reviewed by an authorized human reviewer before any action is taken.</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Observation Confidence Scores</h4>
            <div className="space-y-2.5">
              {obs.map((o, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{o.text.split(" ").slice(0, 3).join(" ")}…</span>
                    <span className="font-mono font-bold">{o.conf}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-red-500" style={{ width: `${o.conf}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button onClick={() => navigate("confirmation")} className="w-full py-3 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity" style={{ backgroundColor: C.teal }}>Submit Report</button>
            <button onClick={() => navigate("evidence")} className="w-full py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">Review Evidence</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — CONFIRMATION
// ═══════════════════════════════════════════════════════════════════════════════
function ConfirmationScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const timeline = [
    { label: "Report Submitted", time: "13 Aug 2026, 14:23 IST", done: true },
    { label: "AI Analysis Complete", time: "13 Aug 2026, 14:23 IST", done: true },
    { label: "Business Notified", time: "In progress…", active: true },
    { label: "Authority Monitoring", time: "Pending", done: false },
  ];
  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
        <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: C.safe + "14" }}>
          <CheckCircle size={38} style={{ color: C.safe }} />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Report Submitted</h1>
        <p className="text-sm text-gray-500 mb-6">Your food safety concern has been received and is being processed.</p>

        <div className="p-4 rounded-xl mb-6 text-left" style={{ backgroundColor: C.bg, border: `1px solid ${C.teal}20` }}>
          <div className="text-xs text-gray-400 mb-1">Report ID</div>
          <div className="font-mono font-extrabold text-xl" style={{ color: C.navy }}>FNX-2026-084721</div>
          <div className="text-xs text-gray-400 mt-1.5">Save this ID to track your report</div>
        </div>

        <div className="space-y-0 mb-8 text-left">
          {timeline.map((item, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={item.done ? { backgroundColor: C.safe } : item.active ? { backgroundColor: C.teal } : { border: "2px solid #E5E7EB", backgroundColor: "white" }}>
                  {item.done && <Check size={13} color="white" />}
                  {item.active && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                </div>
                {i < timeline.length - 1 && <div className="w-px flex-1 my-1" style={{ backgroundColor: item.done ? C.safe : "#E5E7EB" }} />}
              </div>
              <div className="pb-5">
                <div className="text-sm font-semibold" style={{ color: item.done || item.active ? "#111" : "#9CA3AF" }}>{item.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{item.time}</div>
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => navigate("tracking")} className="w-full py-3 rounded-xl text-sm font-bold text-white mb-2" style={{ backgroundColor: C.teal }}>Track My Report</button>
        <button onClick={() => navigate("landing")} className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors">Return to Home</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 6 — CONSUMER TRACKING
// ═══════════════════════════════════════════════════════════════════════════════
function TrackingScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const steps = [
    { label: "Submitted", time: "13 Aug, 14:23", done: true, desc: "Report FNX-2026-084721 received" },
    { label: "AI Analysis", time: "13 Aug, 14:23", done: true, desc: "HIGH risk signal generated — 87% confidence" },
    { label: "Business Notified", time: "13 Aug, 14:45", done: true, desc: "GreenBite Foods notified via platform" },
    { label: "Corrective Action", time: "13 Aug, 16:00", active: true, desc: "Business required to respond within 24 hours" },
    { label: "Authority Review", time: "Pending", desc: "FSSAI escalation pending resolution" },
    { label: "Resolved", time: "Pending", desc: "Awaiting final resolution" },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Report FNX-2026-084721</h2>
                <p className="text-sm text-gray-500 mt-0.5">GreenBite Foods · Connaught Place, New Delhi</p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <RiskBadge level="High" />
                <span className="text-xs text-gray-400">13 Aug 2026</span>
              </div>
            </div>

            <div>
              {steps.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={step.done ? { backgroundColor: C.safe } : step.active ? { backgroundColor: C.teal, boxShadow: `0 0 0 4px ${C.teal}20` } : { border: "2px solid #E5E7EB", backgroundColor: "white" }}>
                      {step.done && <Check size={14} color="white" />}
                      {step.active && <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />}
                    </div>
                    {i < steps.length - 1 && <div className="w-0.5 flex-1 my-1.5" style={{ backgroundColor: step.done ? C.safe : "#E5E7EB" }} />}
                  </div>
                  <div className="pb-6">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold" style={{ color: step.done || step.active ? "#111" : "#9CA3AF" }}>{step.label}</span>
                      <span className="text-xs text-gray-400">{step.time}</span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: step.done || step.active ? "#6B7280" : "#D1D5DB" }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Report Summary</h3>
            {[{ l: "Category", v: "Spoilage" }, { l: "AI Risk Level", v: "HIGH" }, { l: "AI Confidence", v: "87%" }, { l: "Evidence Files", v: "3 uploaded" }].map((r) => (
              <div key={r.l} className="flex justify-between text-xs py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-gray-500">{r.l}</span>
                <span className="font-semibold text-gray-800">{r.v}</span>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Business Response</h3>
            <div className="p-3 rounded-lg text-xs" style={{ backgroundColor: C.teal + "08" }}>
              <div className="font-bold text-gray-800 mb-1">GreenBite Foods</div>
              <p className="text-gray-600 leading-relaxed">Acknowledging the report. Our food safety team is reviewing the complaint. Corrective actions will be initiated within 24 hours.</p>
              <div className="text-gray-400 mt-2">13 Aug 2026, 15:12</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Authority Status</h3>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              FSSAI monitoring — escalation criteria not yet met
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Evidence</h3>
            <div className="grid grid-cols-3 gap-2">
              <img src="https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=120&h=80&fit=crop&auto=format" className="rounded-lg object-cover w-full h-14 bg-gray-100" alt="Evidence" />
              <div className="rounded-lg h-14 bg-gray-100 flex items-center justify-center text-xl">📦</div>
              <div className="rounded-lg h-14 bg-gray-100 flex items-center justify-center text-xl">🎥</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 7 — BUSINESS DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
function BusinessDashboardScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const recent = [
    { id: "FNX-2026-084721", cat: "Spoilage", risk: "High", time: "2h ago", status: "Under Review" },
    { id: "FNX-2026-084698", cat: "Hygiene", risk: "Medium", time: "5h ago", status: "In Progress" },
    { id: "FNX-2026-084612", cat: "Storage", risk: "Low", time: "1d ago", status: "Pending" },
    { id: "FNX-2026-084490", cat: "Spoilage", risk: "High", time: "2d ago", status: "Resolved" },
  ];

  return (
    <div>
      <div className="mb-4 p-4 rounded-xl border flex items-center gap-3" style={{ backgroundColor: "#FEF2F2", borderColor: "#FECACA" }}>
        <AlertCircle size={17} className="text-red-500 flex-shrink-0" />
        <div className="flex-1 text-sm">
          <span className="font-bold text-red-700">3 high-priority food safety signals require attention. </span>
          <span className="text-red-600">Immediate review recommended.</span>
        </div>
        <button onClick={() => navigate("ai-kitchen")} className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-red-500 hover:bg-red-600 transition-colors flex-shrink-0">View Signals</button>
      </div>

      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-900">Good morning, GreenBite Foods.</h2>
        <p className="text-sm text-gray-500">Food Safety Overview · 13 August 2026</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <KPICard label="Open Complaints" value={12} icon={AlertTriangle} color="#EF4444" trend="up" />
        <KPICard label="High-Risk Signals" value={3} icon={Zap} color="#F59E0B" trend="up" />
        <KPICard label="Pending Actions" value={5} icon={Clock} color="#8B5CF6" trend="neutral" />
        <KPICard label="Resolution Rate" value="94%" icon={CheckCircle} color={C.safe} trend="down" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Complaint & Signal Trends</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="gTeal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.teal} stopOpacity={0.18} />
                  <stop offset="95%" stopColor={C.teal} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gRed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 }} />
              <Area type="monotone" dataKey="complaints" stroke="#EF4444" fill="url(#gRed)" strokeWidth={2} name="Complaints" />
              <Area type="monotone" dataKey="signals" stroke={C.teal} fill="url(#gTeal)" strokeWidth={2} name="AI Signals" />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">By Category</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={3} dataKey="value">
                {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(val, name) => [`${val}%`, name]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {categoryData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-gray-600">{d.name}</span>
                </div>
                <span className="font-mono font-bold text-gray-700">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Recent Complaints</h3>
          <button onClick={() => navigate("complaint-detail")} className="text-xs font-bold" style={{ color: C.teal }}>View All</button>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>{["Report ID", "Category", "Risk", "Received", "Status", ""].map((h) => (
              <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {recent.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50/60 transition-colors cursor-pointer" onClick={() => navigate("complaint-detail")}>
                <td className="px-4 py-3 text-xs font-mono font-bold" style={{ color: C.teal }}>{c.id}</td>
                <td className="px-4 py-3 text-xs text-gray-700">{c.cat}</td>
                <td className="px-4 py-3"><RiskBadge level={c.risk} /></td>
                <td className="px-4 py-3 text-xs text-gray-500">{c.time}</td>
                <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                <td className="px-4 py-3"><button className="text-xs font-bold" style={{ color: C.teal }}>Review →</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 8 — AI KITCHEN
// ═══════════════════════════════════════════════════════════════════════════════
function AIKitchenScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const zones = [
    { name: "Preparation Zone", risk: "High", status: "Hygiene concern detected", emoji: "🔪", detections: 3 },
    { name: "Storage Area", risk: "High", status: "Improper storage detected", emoji: "📦", detections: 5 },
    { name: "Refrigeration", risk: "Medium", status: "Temperature-control concern", emoji: "❄️", detections: 2 },
    { name: "Cooking Station", risk: "Low", status: "Handling anomaly noted", emoji: "🔥", detections: 1 },
    { name: "Cleaning Station", risk: "Low", status: "Normal — no issues", emoji: "🧼", detections: 0 },
  ];

  const detections = [
    { time: "14:18", zone: "Storage Area", obs: "Items stored without proper sealing", conf: 88, risk: "High" },
    { time: "13:45", zone: "Preparation Zone", obs: "Surface hygiene anomaly detected", conf: 82, risk: "High" },
    { time: "12:30", zone: "Refrigeration", obs: "Temperature above recommended range", conf: 74, risk: "Medium" },
    { time: "11:15", zone: "Cooking Station", obs: "Handling procedure deviation noted", conf: 61, risk: "Low" },
  ];

  const riskC = (r: string) => r === "High" ? "#EF4444" : r === "Medium" ? "#F59E0B" : C.safe;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">AI Kitchen Monitor</h2>
          <p className="text-sm text-gray-500 mt-0.5">Real-time food safety intelligence across kitchen zones</p>
        </div>
        <button onClick={() => navigate("corrective-action")} className="px-4 py-2 rounded-lg text-sm font-bold text-white" style={{ backgroundColor: C.teal }}>
          View Corrective Actions
        </button>
      </div>

      <div className="grid grid-cols-5 gap-3 mb-5">
        {zones.map((z) => (
          <div key={z.name} className="bg-white rounded-xl border-2 shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
            style={{ borderColor: riskC(z.risk) + "35" }}>
            <div className="flex items-start justify-between mb-2.5">
              <div className="text-2xl">{z.emoji}</div>
              <RiskBadge level={z.risk} />
            </div>
            <h4 className="text-xs font-bold text-gray-800 mb-1 leading-tight">{z.name}</h4>
            <p className="text-xs text-gray-500 mb-2 leading-snug">{z.status}</p>
            {z.detections > 0 && <div className="text-xs font-bold" style={{ color: riskC(z.risk) }}>{z.detections} detection{z.detections !== 1 ? "s" : ""}</div>}
            <div className="h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: z.risk === "High" ? "78%" : z.risk === "Medium" ? "48%" : "18%", backgroundColor: riskC(z.risk) }} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Kitchen Risk Heatmap</h3>
          <div className="grid grid-cols-3 grid-rows-2 gap-2 rounded-xl overflow-hidden bg-gray-50 p-3" style={{ height: 200 }}>
            {[
              { label: "Preparation", color: "#EF4444", opacity: 0.36 },
              { label: "Storage", color: "#EF4444", opacity: 0.46 },
              { label: "Cooking", color: "#10B981", opacity: 0.22 },
              { label: "Refrigeration", color: "#F59E0B", opacity: 0.32 },
              { label: "Cleaning", color: "#10B981", opacity: 0.16 },
              { label: "Service", color: "#10B981", opacity: 0.14 },
            ].map((zone, i) => (
              <div key={i} className="rounded-lg flex items-center justify-center text-xs font-semibold relative overflow-hidden border"
                style={{ borderColor: zone.color + "30" }}>
                <div className="absolute inset-0" style={{ backgroundColor: zone.color, opacity: zone.opacity }} />
                <span className="relative text-gray-800 text-xs font-bold">{zone.label}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-end gap-4 mt-2 text-xs text-gray-500">
            {[["#10B981", "Low"], ["#F59E0B", "Medium"], ["#EF4444", "High"]].map(([c, l]) => (
              <div key={l} className="flex items-center gap-1.5"><div className="w-3 h-3 rounded" style={{ backgroundColor: c }} />{l}</div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">AI Recommendations</h3>
          <div className="space-y-2">
            {[
              { text: "Deep-clean preparation surfaces immediately", p: "bg-red-500" },
              { text: "Re-seal storage containers and audit inventory", p: "bg-orange-500" },
              { text: "Calibrate refrigeration temperature sensor", p: "bg-amber-500" },
              { text: "Review food handling procedure with staff", p: "bg-emerald-500" },
            ].map((r, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg" style={{ backgroundColor: C.bg }}>
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${r.p}`} />
                <span className="text-xs text-gray-700">{r.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">Recent AI Detections Today</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {detections.map((d, i) => (
            <div key={i} className="px-5 py-3 flex items-center gap-4 hover:bg-gray-50/50">
              <span className="font-mono text-xs text-gray-400 w-12 flex-shrink-0">{d.time}</span>
              <span className="text-xs text-gray-500 w-28 flex-shrink-0">{d.zone}</span>
              <span className="text-xs text-gray-700 flex-1">{d.obs}</span>
              <span className="font-mono text-xs font-bold text-gray-600">{d.conf}%</span>
              <RiskBadge level={d.risk} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 9 — COMPLAINT DETAIL
// ═══════════════════════════════════════════════════════════════════════════════
function ComplaintDetailScreen({ navigate }: { navigate: (s: Screen) => void }) {
  return (
    <div>
      <button onClick={() => navigate("business-dashboard")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5 transition-colors">
        <ArrowLeft size={14} /> Back to Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm font-bold" style={{ color: C.navy }}>FNX-2026-084721</span>
                  <RiskBadge level="High" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Suspected food spoilage — cooked rice dish</h2>
                <p className="text-sm text-gray-500 mt-1">GreenBite Foods · Connaught Place, New Delhi · 13 Aug 2026, 12:30</p>
              </div>
              <StatusBadge status="Under Review" />
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-700 leading-relaxed italic">
              "The rice dish I ordered had a very unusual smell and texture. The top layer had dark spots that appeared after it was served. Food appeared stale and not freshly prepared."
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-red-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={14} style={{ color: C.teal }} />
              <span className="text-sm font-bold" style={{ color: C.teal }}>AI VISUAL ANALYSIS</span>
              <span className="ml-auto text-xs text-gray-400">Confidence: 87%</span>
            </div>
            <div className="flex gap-4">
              <div className="relative flex-shrink-0">
                <img src="https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=200&h=150&fit=crop&auto=format"
                  className="rounded-lg object-cover bg-gray-100" style={{ width: 148, height: 110 }} alt="Evidence" />
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <rect x="12" y="10" width="76" height="70" fill="none" stroke="#EF4444" strokeWidth="1.2" strokeDasharray="5,2.5" />
                </svg>
              </div>
              <div className="flex-1 space-y-1.5">
                {["Dark discoloration on surface — 91%", "Texture anomaly — 83%", "Possible mold-like pattern — 78%", "Inconsistent freshness appearance — 72%"].map((obs, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs text-gray-700">
                    <AlertTriangle size={10} className="text-red-400 mt-0.5 flex-shrink-0" />{obs}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-3 p-2.5 rounded-lg text-xs" style={{ backgroundColor: "#FFFBEB", border: "1px solid #FDE68A", color: "#92400E" }}>
              AI-assisted visual observation — not a laboratory diagnosis. Human verification required.
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Evidence Gallery</h3>
            <div className="grid grid-cols-4 gap-2">
              <img src="https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=120&h=90&fit=crop&auto=format" className="rounded-lg object-cover w-full h-20 bg-gray-100" alt="Evidence 1" />
              <img src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=120&h=90&fit=crop&auto=format" className="rounded-lg object-cover w-full h-20 bg-gray-100" alt="Evidence 2" />
              <div className="rounded-lg h-20 bg-gray-100 flex items-center justify-center text-lg">📦</div>
              <div className="rounded-lg h-20 bg-gray-100 flex items-center justify-center text-lg">🎥</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Actions Required</h3>
            <div className="space-y-2">
              <button onClick={() => navigate("corrective-action")} className="w-full py-2.5 rounded-lg text-sm font-bold text-white" style={{ backgroundColor: C.teal }}>Create Corrective Action</button>
              <button className="w-full py-2.5 rounded-lg text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50">Acknowledge Complaint</button>
              <button className="w-full py-2.5 rounded-lg text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50">Request More Time</button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Activity Timeline</h3>
            <div className="space-y-3">
              {[
                { t: "14:45", e: "Business notified via platform", type: "info" },
                { t: "14:23", e: "AI analysis completed — HIGH risk", type: "alert" },
                { t: "14:23", e: "Report submitted by consumer", type: "info" },
              ].map((ev, i) => (
                <div key={i} className="flex gap-2 text-xs">
                  <span className="text-gray-400 w-10 flex-shrink-0">{ev.t}</span>
                  <div className="flex items-start gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0 ${ev.type === "alert" ? "bg-red-500" : "bg-blue-400"}`} />
                    <span className="text-gray-600">{ev.e}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 10 — CORRECTIVE ACTION CENTER
// ═══════════════════════════════════════════════════════════════════════════════
function CorrectiveActionScreen() {
  const [actions, setActions] = useState([
    { id: "CA-001", title: "Discard affected food batch", desc: "Remove all potentially affected rice dishes and associated ingredients from service immediately.", owner: "Kitchen Manager", due: "13 Aug, 16:00", priority: "Critical", status: "Pending", progress: 0 },
    { id: "CA-002", title: "Deep-clean preparation surfaces", desc: "Sanitize all food preparation surfaces in identified zones using food-grade disinfectant.", owner: "Head Chef", due: "13 Aug, 18:00", priority: "High", status: "In Progress", progress: 65 },
    { id: "CA-003", title: "Inspect refrigeration units", desc: "Check and calibrate all refrigeration units. Verify temperature compliance across all zones.", owner: "Facilities Manager", due: "14 Aug, 10:00", priority: "Medium", status: "Completed", progress: 100 },
  ]);

  const overall = Math.round(actions.reduce((s, a) => s + a.progress, 0) / actions.length);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Corrective Action Center</h2>
          <p className="text-sm text-gray-500 mt-0.5">Track and manage all food safety corrective actions</p>
        </div>
        <button className="px-4 py-2 rounded-lg text-sm font-bold text-white flex items-center gap-1.5" style={{ backgroundColor: C.teal }}>
          <Plus size={14} /> New Action
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-700">FNX-2026-084721 — Corrective Actions</h3>
            <p className="text-xs text-gray-500 mt-0.5">3 actions required · Due by 14 Aug 2026</p>
          </div>
          <div className="text-2xl font-extrabold" style={{ color: C.teal }}>{overall}%</div>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${overall}%`, backgroundColor: C.teal }} />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>1 pending · 1 in progress · 1 completed</span>
          <span>{overall}% complete</span>
        </div>
      </div>

      <div className="space-y-4">
        {actions.map((a) => (
          <div key={a.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-gray-400">{a.id}</span>
                  <RiskBadge level={a.priority} />
                  <StatusBadge status={a.status} />
                </div>
                <h3 className="font-bold text-gray-900">{a.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{a.desc}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-3 text-xs">
              <div><span className="text-gray-400">Owner</span><br /><span className="font-semibold text-gray-700 mt-0.5 block">{a.owner}</span></div>
              <div><span className="text-gray-400">Due Date</span><br /><span className="font-semibold text-gray-700 mt-0.5 block">{a.due}</span></div>
              <div><span className="text-gray-400">Progress</span><br /><span className="font-semibold mt-0.5 block" style={{ color: a.progress === 100 ? C.safe : C.teal }}>{a.progress}%</span></div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
              <div className="h-full rounded-full transition-all" style={{ width: `${a.progress}%`, backgroundColor: a.progress === 100 ? C.safe : a.progress > 0 ? C.teal : "#E5E7EB" }} />
            </div>
            <div className="flex gap-2 flex-wrap">
              {a.status !== "Completed" && (
                <button onClick={() => setActions(actions.map(x => x.id === a.id ? { ...x, status: "Completed", progress: 100 } : x))}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ backgroundColor: C.safe }}>Mark Complete</button>
              )}
              <button className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50">Upload Evidence</button>
              <button className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50">Add Notes</button>
              {a.status === "Completed" && (
                <button className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-emerald-200 text-emerald-700 hover:bg-emerald-50">Request Verification</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 11 — AUTHORITY COMMAND CENTER
// ═══════════════════════════════════════════════════════════════════════════════
function AuthorityCommandScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const alerts = [
    { business: "GreenBite Foods", level: "Critical", reason: "Repeated high-risk signals · 24 complaints", time: "2h ago" },
    { business: "Urban Spice", level: "High", reason: "Complaint spike — 19 reports in 30 days", time: "5h ago" },
    { business: "FreshBox Kitchen", level: "High", reason: "Unresolved corrective action overdue", time: "1d ago" },
  ];
  const riskColor = (r: string) => r === "critical" ? "#EF4444" : r === "high" ? "#F59E0B" : r === "medium" ? "#3B82F6" : C.safe;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Authority Command Center</h2>
          <p className="text-sm text-gray-500">National Food Safety Intelligence · FSSAI Operations · 13 August 2026</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-2 rounded-lg text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-1.5"><Filter size={13} /> Filter</button>
          <button className="px-3 py-2 rounded-lg text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-1.5"><RefreshCw size={13} /> Refresh</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <KPICard label="Active High-Risk Businesses" value={28} icon={Building} color="#EF4444" trend="up" />
        <KPICard label="Open Investigations" value={46} icon={Eye} color="#F59E0B" trend="neutral" />
        <KPICard label="Critical AI Signals" value={9} icon={Zap} color="#8B5CF6" trend="up" />
        <KPICard label="Resolved This Month" value={183} icon={CheckCircle} color={C.safe} trend="down" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Map */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Risk Intelligence Map — India</h3>
            <div className="flex gap-4 text-xs text-gray-500">
              {[["#EF4444", "Critical"], ["#F59E0B", "High"], ["#3B82F6", "Medium"], [C.safe, "Low"]].map(([c, l]) => (
                <div key={l} className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />{l}</div>
              ))}
            </div>
          </div>
          <div className="relative rounded-xl overflow-hidden" style={{ height: 310, background: `linear-gradient(145deg, #0F2040 0%, #0A1628 100%)` }}>
            <svg className="absolute inset-0 w-full h-full opacity-10">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
            <svg className="absolute inset-0 w-full h-full">
              {cityMarkers.map((city, i) => (
                <g key={i} className="cursor-pointer" onClick={() => navigate("priority-businesses")}>
                  <circle cx={`${city.x}%`} cy={`${city.y}%`} r="14" fill={riskColor(city.risk)} opacity="0.12" />
                  <circle cx={`${city.x}%`} cy={`${city.y}%`} r="7" fill={riskColor(city.risk)} opacity="0.55" />
                  <circle cx={`${city.x}%`} cy={`${city.y}%`} r="3.5" fill={riskColor(city.risk)} />
                  <text x={`${city.x + 2.5}%`} y={`${city.y - 2}%`} fill="white" fontSize="8" fontFamily="monospace" opacity="0.9">{city.city}</text>
                  <text x={`${city.x + 2.5}%`} y={`${city.y + 1.8}%`} fill={riskColor(city.risk)} fontSize="7" fontFamily="monospace">{city.count} reports</text>
                </g>
              ))}
            </svg>
            <div className="absolute bottom-3 left-3 text-xs text-blue-300 font-mono opacity-50">India · FSSAI Region · Live</div>
            <div className="absolute top-3 right-3 flex items-center gap-1.5 text-xs text-blue-300 font-mono">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />Live
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Priority Alerts</h3>
              <button onClick={() => navigate("priority-businesses")} className="text-xs font-bold" style={{ color: C.teal }}>View All</button>
            </div>
            <div className="space-y-3">
              {alerts.map((a, i) => (
                <div key={i} className="p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-shadow"
                  style={{ borderColor: a.level === "Critical" ? "#FECACA" : "#FED7AA", backgroundColor: a.level === "Critical" ? "#FEF2F2" : "#FFF7ED" }}
                  onClick={() => navigate("business-profile")}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-gray-900">{a.business}</span>
                    <RiskBadge level={a.level} />
                  </div>
                  <p className="text-xs text-gray-600 mb-0.5">{a.reason}</p>
                  <span className="text-xs text-gray-400">{a.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Today's Activity</h3>
            <div className="space-y-2 text-xs">
              {[{ l: "New reports received", v: 23, c: C.teal }, { l: "AI signals generated", v: 8, c: "#F59E0B" }, { l: "Business responses", v: 17, c: C.safe }, { l: "Cases escalated", v: 3, c: "#EF4444" }].map((s) => (
                <div key={s.l} className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0">
                  <span className="text-gray-600">{s.l}</span>
                  <span className="font-bold" style={{ color: s.c }}>{s.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 12 — PRIORITY BUSINESSES
// ═══════════════════════════════════════════════════════════════════════════════
function PriorityBusinessesScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Priority Business Intelligence</h2>
          <p className="text-sm text-gray-500 mt-0.5">Ranked by composite risk score — AI signals, complaint frequency, repeat issues, corrective action compliance</p>
        </div>
        <button className="px-3 py-2 rounded-lg text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-1.5">
          <Download size={13} /> Export
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {["All Risk Levels", "Critical", "High", "Medium", "Low"].map((f) => (
          <button key={f} className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">{f}</button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: C.navy }}>
              {["Business", "Risk Score", "Complaints", "AI Signals", "Repeats", "Last Inspection", "Action Status", "Status", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: "#93C5FD" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {businesses.map((b) => (
              <Fragment key={b.name}>
                <tr className="hover:bg-gray-50/70 transition-colors cursor-pointer" onClick={() => setExpanded(expanded === b.name ? null : b.name)}>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-sm text-gray-900">{b.name}</div>
                    <div className="text-xs text-gray-400">New Delhi, India</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold text-white"
                        style={{ backgroundColor: b.risk >= 80 ? "#EF4444" : b.risk >= 60 ? "#F59E0B" : C.safe }}>
                        {b.risk}
                      </div>
                      <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${b.risk}%`, backgroundColor: b.risk >= 80 ? "#EF4444" : b.risk >= 60 ? "#F59E0B" : C.safe }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-700">{b.complaints}</td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-700">{b.signals}</td>
                  <td className="px-4 py-3 text-sm font-bold text-red-600">{b.repeat}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{b.lastInspection}</td>
                  <td className="px-4 py-3"><StatusBadge status={b.action} /></td>
                  <td className="px-4 py-3"><RiskBadge level={b.status} /></td>
                  <td className="px-4 py-3">
                    <button onClick={(e) => { e.stopPropagation(); navigate("business-profile"); }} className="text-xs font-bold" style={{ color: C.teal }}>Profile →</button>
                  </td>
                </tr>
                {expanded === b.name && (
                  <tr style={{ backgroundColor: "#EEF4FF" }}>
                    <td colSpan={9} className="px-6 py-4">
                      <div className="text-xs font-bold text-gray-700 mb-2">Why Prioritized?</div>
                      <div className="flex gap-8">
                        {[
                          { factor: "Repeated Complaints", detail: `${b.complaints} total complaints` },
                          { factor: "High-Risk AI Observations", detail: `${b.signals} AI signals in 30 days` },
                          { factor: "Corrective Action", detail: b.action === "Overdue" ? "Corrective action overdue" : "Actions pending" },
                          { factor: "Repeat Incidents", detail: `${b.repeat} repeat safety issues` },
                        ].map((f, i) => (
                          <div key={i} className="flex items-start gap-1.5">
                            <AlertTriangle size={11} className="text-amber-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="font-semibold text-gray-700 text-xs">{f.factor}</div>
                              <div className="text-gray-500 text-xs">{f.detail}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 13 — BUSINESS INTELLIGENCE PROFILE
// ═══════════════════════════════════════════════════════════════════════════════
function BusinessProfileScreen({ navigate }: { navigate: (s: Screen) => void }) {
  return (
    <div>
      <button onClick={() => navigate("priority-businesses")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5 transition-colors">
        <ArrowLeft size={14} /> Priority Businesses
      </button>

      <div className="bg-white rounded-xl border-2 border-red-100 shadow-sm p-6 mb-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: C.bg }}>🍃</div>
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">GreenBite Foods</h2>
              <p className="text-sm text-gray-500 mt-0.5">Connaught Place, New Delhi · FSSAI: FSSR-2021-DL-1842</p>
              <div className="flex gap-2 mt-2">
                <RiskBadge level="Critical" />
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-600 text-white">Critical Monitoring</span>
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-extrabold" style={{ color: "#EF4444" }}>92</div>
            <div className="text-xs text-gray-500 font-medium mt-0.5">Risk Score / 100</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        {[
          { title: "Risk Score Trend", data: bizRiskTrend, key: "risk", color: "#EF4444" },
          { title: "Complaint Volume", data: trendData, key: "complaints", color: "#F59E0B" },
          { title: "AI Signal Frequency", data: trendData, key: "signals", color: C.teal },
        ].map((chart) => (
          <div key={chart.title} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">{chart.title}</h3>
            <ResponsiveContainer width="100%" height={110}>
              <AreaChart data={chart.data}>
                <defs>
                  <linearGradient id={`g-${chart.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chart.color} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={chart.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 9, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                <Area type="monotone" dataKey={chart.key} stroke={chart.color} fill={`url(#g-${chart.key})`} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <div className="bg-white rounded-xl border-2 border-red-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-red-700 mb-3 flex items-center gap-2"><TrendingUp size={14} /> Why Risk Score Increased</h3>
          <ul className="space-y-2">
            {[
              "7 repeat food safety incidents in 6 months",
              "18 high-risk AI observations — highest in region",
              "Corrective action overdue on 3 open cases",
              "Consumer complaints up 42% month-over-month",
              "No voluntary inspection request since June 2026",
            ].map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-red-700">
                <AlertTriangle size={11} className="text-red-500 mt-0.5 flex-shrink-0" />{r}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: C.teal }}>
            <Zap size={14} /> AI-Assisted Authority Recommendation
          </h3>
          <div className="p-3.5 rounded-lg text-xs mb-4" style={{ backgroundColor: C.teal + "08", borderLeft: `3px solid ${C.teal}` }}>
            <div className="font-bold text-gray-800 mb-1">Priority Investigation Recommended</div>
            <p className="text-gray-600 leading-relaxed">Based on complaint frequency, AI signal severity, and corrective action compliance, this business meets the threshold for priority investigation.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate("evidence-review")} className="flex-1 py-2 rounded-lg text-xs font-bold text-white" style={{ backgroundColor: C.navy }}>Begin Investigation</button>
            <button className="flex-1 py-2 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50">Schedule Inspection</button>
          </div>
          <p className="text-xs text-gray-400 mt-2">AI assists the reviewer. Final investigation decision by authorized human officer only.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">Inspection & Action History</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {[
            { date: "12 Jun 2026", type: "Inspection", outcome: "Minor violations — corrective action required", status: "Completed" },
            { date: "03 May 2026", type: "Investigation", outcome: "Consumer complaint cluster — business notified", status: "Resolved" },
            { date: "14 Mar 2026", type: "Inspection", outcome: "Passed — no major violations noted", status: "Completed" },
            { date: "28 Jan 2026", type: "Warning", outcome: "Hygiene concern — improvement notice issued", status: "Resolved" },
          ].map((h, i) => (
            <div key={i} className="px-5 py-3 flex items-center gap-4 hover:bg-gray-50/50 text-xs">
              <span className="text-gray-400 w-20 flex-shrink-0">{h.date}</span>
              <span className="font-semibold text-gray-700 w-24 flex-shrink-0">{h.type}</span>
              <span className="text-gray-600 flex-1">{h.outcome}</span>
              <StatusBadge status={h.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 14 — EVIDENCE REVIEW
// ═══════════════════════════════════════════════════════════════════════════════
function EvidenceReviewScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const [notes, setNotes] = useState("");
  const obs = [
    { text: "Discoloration detected on food surface", conf: 91 },
    { text: "Texture anomaly — inconsistent freshness", conf: 83 },
    { text: "Possible mold-like pattern in region of interest", conf: 78 },
  ];

  return (
    <div>
      <div className="mb-5 p-4 rounded-xl border flex items-center gap-3" style={{ backgroundColor: "#F0F9FF", borderColor: "#BAE6FD" }}>
        <Eye size={17} style={{ color: C.teal }} className="flex-shrink-0" />
        <span className="text-sm font-semibold" style={{ color: C.navy }}>AI assists the reviewer — authorized humans make the final decision on all evidence and enforcement action.</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">Evidence — FNX-2026-084721</h3>
              <span className="text-xs text-gray-400">1 of 3 files</span>
            </div>
            <div className="relative">
              <img src="https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=900&h=480&fit=crop&auto=format"
                className="w-full object-cover bg-gray-100" style={{ maxHeight: 350 }} alt="Evidence under review" />
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <rect x="18" y="12" width="64" height="58" fill="none" stroke="#EF4444" strokeWidth="0.5" strokeDasharray="3,1.5" />
                <text x="18" y="10.5" fill="#EF4444" fontSize="2.8" fontFamily="monospace">Observation Zone · 91% confidence</text>
                <circle cx="42" cy="38" r="10" fill="#EF4444" opacity="0.13" />
                <circle cx="68" cy="46" r="6.5" fill="#F59E0B" opacity="0.13" />
              </svg>
            </div>
            <div className="px-5 py-2.5 bg-gray-50 text-xs text-gray-400 font-mono">
              food_photo_greenBite.jpg · 13 Aug 2026, 14:20 · SHA-256: 7f3a1e2b4c8d…
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={13} style={{ color: C.teal }} />
              <h3 className="text-sm font-semibold text-gray-700">AI-Assisted Visual Observations</h3>
              <span className="ml-auto text-xs px-2 py-0.5 rounded font-semibold" style={{ backgroundColor: C.teal + "14", color: C.teal }}>Observation Only</span>
            </div>
            <div className="space-y-3">
              {obs.map((o, i) => (
                <div key={i} className="p-3 rounded-lg border" style={{ backgroundColor: "#FEF2F2", borderColor: "#FECACA" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-red-700">{o.text}</span>
                    <span className="font-mono font-bold text-red-600 text-sm">{o.conf}%</span>
                  </div>
                  <div className="h-1.5 bg-red-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-red-500" style={{ width: `${o.conf}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Reviewer Decision</h3>
            <div className="space-y-2 mb-5">
              <button onClick={() => navigate("human-decision")} className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity" style={{ backgroundColor: C.safe }}>
                <CheckCircle size={15} /> Confirm — Evidence Supports Concern
              </button>
              <button className="w-full py-3 rounded-xl text-sm font-bold border-2 border-red-200 text-red-600 flex items-center justify-center gap-2 hover:bg-red-50 transition-colors">
                <XCircle size={15} /> Reject — Insufficient Evidence
              </button>
              <button className="w-full py-3 rounded-xl text-sm font-bold border border-amber-200 text-amber-700 flex items-center justify-center gap-2 hover:bg-amber-50 transition-colors">
                <AlertCircle size={15} /> Needs More Evidence
              </button>
            </div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Reviewer Notes (Required)</label>
            <textarea
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-xs outline-none focus:border-teal-400 transition-colors resize-none"
              rows={4} placeholder="Add your observations and rationale for this decision…"
              value={notes} onChange={(e) => setNotes(e.target.value)} />
            <p className="text-xs text-gray-400 mt-1">Notes are recorded in the permanent audit trail.</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h3 className="text-xs font-bold text-gray-600 mb-3 uppercase tracking-widest">Audit Trail</h3>
            <div className="space-y-2.5 text-xs">
              {[
                { action: "Evidence review started", who: "Officer Kavita Mehta", time: "14:55" },
                { action: "AI analysis processed", who: "System", time: "14:23" },
                { action: "Report received", who: "Consumer (Anonymous)", time: "14:23" },
              ].map((e, i) => (
                <div key={i} className="flex gap-2.5">
                  <span className="text-gray-400 w-9 flex-shrink-0 font-mono">{e.time}</span>
                  <div>
                    <span className="font-semibold text-gray-700">{e.action}</span>
                    <span className="text-gray-400"> · {e.who}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 15 — HUMAN DECISION / RESOLUTION
// ═══════════════════════════════════════════════════════════════════════════════
function HumanDecisionScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const [decision, setDecision] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const [resolved, setResolved] = useState(false);

  if (resolved) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center max-w-md w-full">
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: C.safe + "14" }}>
            <CheckCircle size={38} style={{ color: C.safe }} />
          </div>
          <div className="inline-block px-4 py-1.5 rounded-full text-xs font-extrabold text-white mb-4" style={{ backgroundColor: C.safe }}>CASE RESOLVED</div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Resolution Approved</h2>
          <p className="text-sm text-gray-500 mb-5">Case FNX-2026-084721 has been resolved. Business has been notified. Consumer will receive a resolution update.</p>
          <div className="p-3.5 rounded-lg text-xs mb-6 text-left" style={{ backgroundColor: C.teal + "10", borderLeft: `3px solid ${C.teal}` }}>
            <div className="font-bold text-gray-800 mb-1">Final Decision Recorded</div>
            <p className="text-gray-600">Decision made by authorized human reviewer — Officer Kavita Mehta · FSSAI Delhi · 13 Aug 2026, 15:04</p>
          </div>
          <button onClick={() => navigate("authority-command")} className="w-full py-3 rounded-xl text-sm font-bold text-white" style={{ backgroundColor: C.navy }}>Return to Command Center</button>
        </div>
      </div>
    );
  }

  const options = [
    { label: "Approve Resolution", desc: "Case closed, corrective actions accepted", color: C.safe, icon: CheckCircle },
    { label: "Request More Evidence", desc: "Additional documentation required", color: C.teal, icon: Eye },
    { label: "Escalate Investigation", desc: "Formal enforcement action required", color: "#EF4444", icon: AlertTriangle },
    { label: "Close Case", desc: "Insufficient grounds for action", color: "#6B7280", icon: X },
  ];

  return (
    <div>
      <div className="mb-5 p-4 rounded-xl border flex items-center gap-3" style={{ backgroundColor: "#F0F9FF", borderColor: "#BAE6FD" }}>
        <Lock size={17} style={{ color: C.navy }} className="flex-shrink-0" />
        <div className="text-sm">
          <span className="font-bold" style={{ color: C.navy }}>Human Decision Required. </span>
          <span className="text-gray-600">AI analysis is advisory only. Final decision and any enforcement action is made exclusively by authorized human reviewers.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Case Summary — FNX-2026-084721</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              {[
                { l: "Business", v: "GreenBite Foods" }, { l: "Location", v: "Connaught Place, New Delhi" },
                { l: "Category", v: "Suspected Food Spoilage" }, { l: "AI Risk Level", v: "HIGH — 87% confidence" },
                { l: "Reports Filed", v: "1 consumer complaint" }, { l: "Date", v: "13 August 2026" },
              ].map((f) => (
                <div key={f.l}>
                  <div className="text-gray-400 mb-0.5">{f.l}</div>
                  <div className="font-semibold text-gray-800">{f.v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Corrective Actions Completed</h3>
            <div className="space-y-2.5">
              {[
                { a: "Affected food batch discarded", d: "13 Aug, 16:30" },
                { a: "Preparation surfaces deep-cleaned", d: "13 Aug, 18:15" },
                { a: "Refrigeration units inspected & calibrated", d: "14 Aug, 10:00" },
              ].map((c, i) => (
                <div key={i} className="flex items-center gap-3 text-xs">
                  <CheckCircle size={13} style={{ color: C.safe }} />
                  <span className="flex-1 text-gray-700">{c.a}</span>
                  <span className="text-gray-400">{c.d}</span>
                  <StatusBadge status="Completed" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Reviewer Assessment</h3>
            <div className="p-3.5 rounded-lg text-sm text-gray-700 leading-relaxed" style={{ backgroundColor: C.bg }}>
              Evidence reviewed and confirmed. Business has taken adequate corrective actions. All 3 required actions completed within 24 hours. Recommend approving resolution with follow-up inspection in 90 days.
            </div>
            <div className="text-xs text-gray-400 mt-2">Officer Kavita Mehta · FSSAI Delhi · 13 Aug 2026, 14:58</div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Final Decision</h3>
            <div className="space-y-2 mb-4">
              {options.map((opt) => (
                <button key={opt.label} onClick={() => setDecision(opt.label)}
                  className="w-full text-left p-3.5 rounded-xl border-2 transition-all"
                  style={decision === opt.label ? { borderColor: opt.color, backgroundColor: opt.color + "08" } : { borderColor: "#E5E7EB" }}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <opt.icon size={14} style={{ color: opt.color }} />
                    <span className="text-sm font-semibold" style={{ color: decision === opt.label ? opt.color : "#374151" }}>{opt.label}</span>
                  </div>
                  <div className="text-xs text-gray-500 pl-5">{opt.desc}</div>
                </button>
              ))}
            </div>
            {decision && (
              <button onClick={() => setModal(true)} className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90" style={{ backgroundColor: C.navy }}>
                Confirm Decision
              </button>
            )}
          </div>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Final Decision</h3>
            <p className="text-sm text-gray-500 mb-4">You are about to make a final decision on case FNX-2026-084721. This action will be permanently recorded in the audit trail.</p>
            <div className="p-3.5 rounded-lg mb-6 text-sm font-bold" style={{ backgroundColor: C.safe + "12", color: C.safe }}>
              Decision: {decision}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={() => { setModal(false); setResolved(true); }} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white" style={{ backgroundColor: C.navy }}>Confirm & Record</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 16 — HOW IT WORKS
// ═══════════════════════════════════════════════════════════════════════════════
function HowItWorksScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const steps = [
    { icon: Camera, title: "Citizen Evidence", desc: "Consumers report food safety concerns and upload photographic evidence directly from their device — anytime, anywhere." },
    { icon: Zap, title: "AI Visual Analysis", desc: "FOODNEXUS AI analyzes uploaded evidence for visual patterns — discoloration, texture anomalies, potential hygiene concerns." },
    { icon: AlertTriangle, title: "Risk Signal Generated", desc: "A confidence-scored risk signal is generated. HIGH signals are immediately escalated to the relevant food business." },
    { icon: Building, title: "Business Response", desc: "Food businesses receive the signal, acknowledge the complaint, and submit corrective actions with supporting evidence." },
    { icon: Shield, title: "Authority Intelligence", desc: "Food safety authorities see prioritized business profiles, risk maps, and AI-assisted recommendations across their jurisdiction." },
    { icon: Eye, title: "Human Verification", desc: "Trained food safety officers review all evidence and AI observations with full audit trail and accountability." },
    { icon: CheckCircle, title: "Resolution", desc: "Final decisions are made exclusively by authorized human reviewers. All outcomes are transparently recorded and traceable." },
  ];

  const benefits = [
    { emoji: "⚡", title: "Faster Reporting", desc: "Consumer reports reach authorities in minutes, not weeks" },
    { emoji: "🎯", title: "Evidence-Based Priority", desc: "AI risk scoring ensures urgent cases get attention first" },
    { emoji: "📋", title: "Transparent Actions", desc: "Every corrective step is tracked, documented, and verified" },
    { emoji: "🔄", title: "Reduced Repeat Risk", desc: "Pattern detection identifies systemic issues early" },
    { emoji: "⚖️", title: "Human Accountability", desc: "All enforcement decisions made by authorized humans only" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-gray-900">How FOODNEXUS AI Works</h2>
        <p className="text-gray-500 mt-1">From a consumer's phone to a government decision — every step connected, tracked, and accountable.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {steps.map((step, i) => (
          <div key={i} className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex gap-4 ${i === 6 ? "lg:col-span-2" : ""}`}>
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: C.teal + "14" }}>
                <step.icon size={18} style={{ color: C.teal }} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold font-mono" style={{ color: C.teal }}>0{i + 1}</span>
                <h3 className="text-sm font-bold text-gray-900">{step.title}</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <h3 className="text-sm font-bold text-gray-900 mb-5 text-center">Why FOODNEXUS AI Works</h3>
        <div className="grid grid-cols-5 gap-4">
          {benefits.map((b) => (
            <div key={b.title} className="text-center p-4 rounded-xl" style={{ backgroundColor: C.bg }}>
              <div className="text-3xl mb-2">{b.emoji}</div>
              <div className="font-bold text-sm text-gray-900 mb-1">{b.title}</div>
              <p className="text-xs text-gray-500 leading-snug">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <button onClick={() => navigate("report")} className="px-8 py-3 rounded-xl text-sm font-bold text-white" style={{ backgroundColor: C.teal }}>
          Report a Food Safety Concern
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 17 — AI SAFETY & HUMAN OVERSIGHT
// ═══════════════════════════════════════════════════════════════════════════════
function AISafetyScreen() {
  const canDo = [
    "Analyze food images for visual patterns",
    "Detect discoloration, texture anomalies, hygiene signals",
    "Generate confidence-scored risk signals",
    "Prioritize cases for human review",
    "Identify complaint frequency patterns",
    "Assist reviewers with structured observations",
  ];
  const cannotDo = [
    "Prove contamination or food poisoning",
    "Replace laboratory testing",
    "Independently enforce penalties",
    "Make final compliance decisions",
    "Guarantee 100% accuracy",
    "Substitute for authorized human judgment",
  ];

  return (
    <div>
      <div className="rounded-2xl p-8 mb-8" style={{ background: `linear-gradient(135deg, ${C.navy}, #0A3D4A)` }}>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4" style={{ backgroundColor: C.teal + "22", color: C.cyan, border: `1px solid ${C.teal}40` }}>
          <Lock size={11} /> Human Oversight First
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-3">
          AI Assists. <span style={{ color: C.cyan }}>Humans Decide.</span>
        </h1>
        <p className="text-blue-200 max-w-2xl leading-relaxed">
          FOODNEXUS AI is a food safety intelligence tool. It does not independently enforce, accuse, or penalize. All enforcement decisions are made exclusively by qualified human reviewers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        {[{ title: "What AI Can Do", color: C.teal, items: canDo }, { title: "What AI Cannot Do", color: "#EF4444", items: cannotDo }].map((s) => (
          <div key={s.title} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-2 h-6 rounded-full" style={{ backgroundColor: s.color }} />
              {s.title}
            </h3>
            <ul className="space-y-2">
              {s.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: s.color }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-5">
        <h3 className="text-sm font-bold text-gray-900 text-center mb-6">The Human-in-the-Loop Process</h3>
        <div className="flex items-center justify-center gap-3">
          {[
            { icon: Camera, label: "Image Evidence", color: "#6B7280" },
            { icon: Zap, label: "AI Observation", color: C.teal },
            { icon: AlertTriangle, label: "Risk Signal", color: "#F59E0B" },
            { icon: Eye, label: "Human Review", color: "#8B5CF6" },
            { icon: Shield, label: "Authority Decision", color: C.navy },
          ].map((step, i) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center text-center w-24">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: step.color + "14" }}>
                  <step.icon size={20} style={{ color: step.color }} />
                </div>
                <span className="text-xs font-semibold text-gray-700 leading-snug">{step.label}</span>
              </div>
              {i < 4 && <ArrowRight size={14} className="text-gray-300 mx-1 flex-shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl p-6" style={{ background: `linear-gradient(135deg, ${C.navy}08, ${C.teal}08)`, border: `1px solid ${C.teal}20` }}>
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen size={15} style={{ color: C.teal }} /> Transparency & Auditability
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {[
            { title: "Full Audit Trail", desc: "Every AI observation, human review, and decision is permanently logged with timestamps and reviewer identity — immutable and transparent." },
            { title: "Confidence Scores", desc: "All AI observations include confidence scores so reviewers can appropriately weigh AI input and make informed, independent decisions." },
            { title: "Separation of Powers", desc: "AI generates signals. Businesses respond. Authorities decide. No single actor can bypass the multi-stakeholder review process." },
          ].map((item) => (
            <div key={item.title}>
              <div className="font-semibold text-gray-800 text-sm mb-1.5">{item.title}</div>
              <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [role, setRole] = useState<Role>("consumer");
  const [screen, setScreen] = useState<Screen>("landing");
  const navigate = (s: Screen) => setScreen(s);

  if (screen === "landing") {
    return <LandingScreen navigate={navigate} setRole={setRole} />;
  }

  const screens: Record<string, React.ReactNode> = {
    "report": <ReportScreen navigate={navigate} />,
    "evidence": <EvidenceScreen navigate={navigate} />,
    "ai-analysis": <AIAnalysisScreen navigate={navigate} />,
    "confirmation": <ConfirmationScreen navigate={navigate} />,
    "tracking": <TrackingScreen navigate={navigate} />,
    "business-dashboard": <BusinessDashboardScreen navigate={navigate} />,
    "ai-kitchen": <AIKitchenScreen navigate={navigate} />,
    "complaint-detail": <ComplaintDetailScreen navigate={navigate} />,
    "corrective-action": <CorrectiveActionScreen />,
    "authority-command": <AuthorityCommandScreen navigate={navigate} />,
    "priority-businesses": <PriorityBusinessesScreen navigate={navigate} />,
    "business-profile": <BusinessProfileScreen navigate={navigate} />,
    "evidence-review": <EvidenceReviewScreen navigate={navigate} />,
    "human-decision": <HumanDecisionScreen navigate={navigate} />,
    "how-it-works": <HowItWorksScreen navigate={navigate} />,
    "ai-safety": <AISafetyScreen />,
  };

  return (
    <AppLayout role={role} setRole={setRole} navigate={navigate} screen={screen}>
      {screens[screen] ?? <div className="text-gray-400 p-8">Screen not found.</div>}
    </AppLayout>
  );
}

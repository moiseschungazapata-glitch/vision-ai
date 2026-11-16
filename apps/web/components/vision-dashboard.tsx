"use client";

import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Boxes,
  Building2,
  Camera,
  CheckCircle2,
  ChevronDown,
  CircleGauge,
  Clock3,
  Download,
  Eye,
  Factory,
  FileBarChart,
  Filter,
  Gauge,
  LayoutDashboard,
  LifeBuoy,
  Menu,
  Moon,
  Pause,
  Play,
  Radio,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Truck,
  Users,
  Video,
  Wifi,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useVisionStore } from "@/hooks/use-vision-store";
import { downloadCsv } from "@/services/vision-local-repository";
import type { CameraRecord, EventRecord, ReportRecord, UiSettings, UserProfile } from "@/types/vision";

type ModuleKey = "security" | "quality" | "retail" | "mobility";
type ViewKey = "overview" | "cameras" | "events" | "analytics" | "reports";
type ModalKind = "camera" | "filters" | "event" | "report" | "settings" | "support" | "profile" | "notifications" | null;

type VisionModule = {
  key: ModuleKey;
  short: string;
  name: string;
  caption: string;
  accent: string;
  accentRgb: string;
  icon: LucideIcon;
  total: string;
  alerts: string;
  accuracy: string;
  eventLabel: string;
  detectedLabel: string;
};

const MODULES: VisionModule[] = [
  {
    key: "security",
    short: "Seguridad",
    name: "Seguridad industrial",
    caption: "EPP y zonas críticas",
    accent: "#42e8b4",
    accentRgb: "66, 232, 180",
    icon: ShieldCheck,
    total: "2,042",
    alerts: "12",
    accuracy: "98.65%",
    eventLabel: "Incumplimientos EPP",
    detectedLabel: "Personas detectadas",
  },
  {
    key: "quality",
    short: "Manufactura",
    name: "Calidad en línea",
    caption: "Defectos y piezas faltantes",
    accent: "#9b8cff",
    accentRgb: "155, 140, 255",
    icon: Factory,
    total: "8,431",
    alerts: "26",
    accuracy: "97.42%",
    eventLabel: "Piezas en revisión",
    detectedLabel: "Unidades analizadas",
  },
  {
    key: "retail",
    short: "Retail",
    name: "Retail y almacén",
    caption: "Aforo, filas y congestión",
    accent: "#57b7ff",
    accentRgb: "87, 183, 255",
    icon: ShoppingBag,
    total: "1,286",
    alerts: "08",
    accuracy: "96.91%",
    eventLabel: "Zonas congestionadas",
    detectedLabel: "Visitantes hoy",
  },
  {
    key: "mobility",
    short: "Logística",
    name: "Acceso vehicular",
    caption: "Flujo, cola y sentido",
    accent: "#ffb85c",
    accentRgb: "255, 184, 92",
    icon: Truck,
    total: "3,704",
    alerts: "05",
    accuracy: "98.12%",
    eventLabel: "Incidencias de acceso",
    detectedLabel: "Vehículos procesados",
  },
];

const NAV_ITEMS: { key: ViewKey; label: string; icon: LucideIcon }[] = [
  { key: "overview", label: "Centro de control", icon: LayoutDashboard },
  { key: "cameras", label: "Cámaras", icon: Video },
  { key: "events", label: "Eventos", icon: AlertTriangle },
  { key: "analytics", label: "Analítica", icon: BarChart3 },
  { key: "reports", label: "Reportes", icon: FileBarChart },
];

function BrandMark() {
  return (
    <div className="brand-mark" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}

function Sidebar({ activeView, setActiveView, mobileOpen, setMobileOpen, collapsed, onOpen, profile }: {
  activeView: ViewKey;
  setActiveView: (view: ViewKey) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  collapsed: boolean;
  onOpen: (modal: Exclude<ModalKind, null>) => void;
  profile: UserProfile;
}) {
  return (
    <>
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""} ${collapsed ? "sidebar-collapsed" : ""}`}>
        <div className="brand">
          <BrandMark />
          <div>
            <strong>VISION AI</strong>
            <span>EDGE INTELLIGENCE</span>
          </div>
          <button className="icon-button mobile-close" onClick={() => setMobileOpen(false)} aria-label="Cerrar navegación">
            <X size={18} />
          </button>
        </div>

        <div className="workspace-selector">
          <div className="workspace-icon"><Building2 size={17} /></div>
          <div><span>ESPACIO OPERATIVO</span><strong>Planta Central</strong></div>
          <ChevronDown size={16} />
        </div>

        <nav className="sidebar-nav" aria-label="Navegación principal">
          <span className="nav-label">OPERACIÓN</span>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                className={activeView === item.key ? "nav-item active" : "nav-item"}
                onClick={() => { setActiveView(item.key); setMobileOpen(false); }}
              >
                <Icon size={19} />
                <span>{item.label}</span>
                {item.key === "events" && <em>12</em>}
              </button>
            );
          })}
          <span className="nav-label nav-label-spaced">SISTEMA</span>
          <button className="nav-item" onClick={() => onOpen("settings")}><SlidersHorizontal size={19} /><span>Configuración</span></button>
          <button className="nav-item" onClick={() => onOpen("support")}><LifeBuoy size={19} /><span>Soporte</span></button>
        </nav>

        <div className="edge-health">
          <div className="edge-health-top"><span>EDGE NODE 01</span><span className="status-dot">ACTIVO</span></div>
          <div className="edge-meter"><span style={{ width: "71%" }} /></div>
          <div className="edge-values"><span>GPU 71%</span><span>42°C</span></div>
        </div>

        <button className="user-card" onClick={() => onOpen("profile")} aria-label={`Abrir perfil de ${profile.name}`}>
          <div className="avatar">{profile.name.split(" ").map(part => part[0]).slice(0,2).join("")}</div>
          <div><strong>{profile.name}</strong><span>{profile.role}</span></div>
          <Settings size={17} />
        </button>
      </aside>
      {mobileOpen && <button className="sidebar-backdrop" onClick={() => setMobileOpen(false)} aria-label="Cerrar navegación" />}
    </>
  );
}

function Topbar({ title, onMenu, onNotify, theme, onTheme, query, onQuery }: {
  title: string;
  onMenu: () => void;
  onNotify: () => void;
  theme: "dark" | "light";
  onTheme: () => void;
  query: string;
  onQuery: (value: string) => void;
}) {
  return (
    <header className="topbar">
      <div className="topbar-leading">
        <button className="icon-button menu-button" onClick={onMenu} aria-label="Mostrar u ocultar navegación"><Menu size={20} /></button>
        <div className="topbar-title"><span>OPERACIÓN /</span><strong>{title}</strong></div>
      </div>
      <div className="topbar-actions">
        <label className="search-box">
          <Search size={17} />
          <input value={query} onChange={event => onQuery(event.target.value)} placeholder="Buscar evento, cámara..." aria-label="Buscar" />
          <kbd>⌘ K</kbd>
        </label>
        <button className="icon-button theme-toggle" onClick={onTheme} aria-label={theme === "dark" ? "Activar modo claro" : "Activar modo oscuro"} title={theme === "dark" ? "Modo claro" : "Modo oscuro"}>
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button className="icon-button has-badge" onClick={onNotify} aria-label="Notificaciones"><Bell size={19} /><span /></button>
        <div className="system-time"><span>15 NOV 2026</span><strong>10:48:32</strong></div>
      </div>
    </header>
  );
}

function ModuleTabs({ selected, onSelect }: { selected: ModuleKey; onSelect: (key: ModuleKey) => void }) {
  return (
    <div className="module-tabs" role="tablist" aria-label="Módulos de visión">
      {MODULES.map((module) => {
        const Icon = module.icon;
        return (
          <button
            key={module.key}
            role="tab"
            aria-selected={selected === module.key}
            className={selected === module.key ? "module-tab active" : "module-tab"}
            onClick={() => onSelect(module.key)}
          >
            <span className="module-icon" style={{ "--module-color": module.accent } as React.CSSProperties}><Icon size={19} /></span>
            <span><strong>{module.short}</strong><small>{module.caption}</small></span>
          </button>
        );
      })}
    </div>
  );
}

function StatCard({ label, value, delta, icon: Icon, tone = "default" }: {
  label: string; value: string; delta: string; icon: LucideIcon; tone?: string;
}) {
  return (
    <article className={`stat-card tone-${tone}`}>
      <div className="stat-card-head"><span>{label}</span><div><Icon size={18} /></div></div>
      <div className="stat-value">{value}</div>
      <div className="stat-foot"><span className="sparkline"><i /><i /><i /><i /><i /><i /></span><small>{delta}</small></div>
    </article>
  );
}

function SceneArtwork({ moduleKey }: { moduleKey: ModuleKey }) {
  if (moduleKey === "quality") {
    return (
      <svg viewBox="0 0 900 500" className="scene-svg" role="img" aria-label="Línea de producción con detección de piezas">
        <defs><linearGradient id="factoryBg" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#172231"/><stop offset="1" stopColor="#080d13"/></linearGradient></defs>
        <rect width="900" height="500" fill="url(#factoryBg)" />
        <path d="M0 330 L900 270 L900 500 L0 500Z" fill="#101923" />
        <rect x="60" y="80" width="150" height="190" fill="#1b2835" /><rect x="690" y="70" width="160" height="190" fill="#192532" />
        <g opacity=".55" stroke="#51677b"><path d="M0 332H900"/><path d="M0 380H900"/><path d="M0 430H900"/></g>
        <g><path d="M90 310 L790 265 L820 330 L120 390Z" fill="#263645"/><path d="M112 326 L775 285" stroke="#7d91a3" strokeWidth="8"/></g>
        {[180,320,460,600].map((x,i)=><g key={x}><rect x={x} y={304-i*9} width="70" height="48" rx="5" fill={i===2?"#9b8cff":"#d1d8dc"}/><rect x={x+8} y={312-i*9} width="54" height="5" fill="#7f929d"/></g>)}
        <g className="detect-box warning-box"><rect x="440" y="252" width="112" height="122"/><text x="440" y="242">ANOMALÍA 87%</text></g>
        <g className="detect-box"><rect x="300" y="267" width="108" height="115"/><text x="300" y="257">PIEZA OK 98%</text></g>
      </svg>
    );
  }
  if (moduleKey === "retail") {
    return (
      <svg viewBox="0 0 900 500" className="scene-svg" role="img" aria-label="Tienda con conteo de personas y zonas de aforo">
        <defs><linearGradient id="retailBg" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#142437"/><stop offset="1" stopColor="#080d13"/></linearGradient></defs>
        <rect width="900" height="500" fill="url(#retailBg)" />
        <path d="M0 500L170 220H730L900 500Z" fill="#14202a"/>
        {[70,250,610,790].map(x=><g key={x}><rect x={x} y="90" width="90" height="240" fill="#1b2c3a"/><rect x={x+8} y="110" width="74" height="12" fill="#5a7488"/><rect x={x+8} y="170" width="74" height="12" fill="#5a7488"/><rect x={x+8} y="230" width="74" height="12" fill="#5a7488"/></g>)}
        <path d="M330 80H570V450H330Z" fill="rgba(87,183,255,.08)" stroke="#57b7ff" strokeDasharray="10 8"/>
        {[{x:390,y:240},{x:470,y:290},{x:535,y:210}].map((p,i)=><g key={i}><circle cx={p.x} cy={p.y} r="15" fill="#dbb287"/><path d={`M${p.x-21} ${p.y+18}H${p.x+21}L${p.x+28} ${p.y+95}H${p.x-28}Z`} fill={i===1?"#57b7ff":"#637d91"}/><g className="detect-box"><rect x={p.x-37} y={p.y-23} width="74" height="125"/><text x={p.x-37} y={p.y-32}>ID {41+i}</text></g></g>)}
        <g className="zone-label"><rect x="340" y="405" width="180" height="30"/><text x="355" y="425">FILA · 3 PERSONAS</text></g>
      </svg>
    );
  }
  if (moduleKey === "mobility") {
    return (
      <svg viewBox="0 0 900 500" className="scene-svg" role="img" aria-label="Acceso vehicular con clasificación y sentido">
        <defs><linearGradient id="roadBg" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#17242c"/><stop offset="1" stopColor="#070b0f"/></linearGradient></defs>
        <rect width="900" height="500" fill="url(#roadBg)" />
        <path d="M240 0H660L900 500H0Z" fill="#222a30"/>
        <path d="M450 0V500" stroke="#d5e2e6" strokeWidth="4" strokeDasharray="32 26" opacity=".7"/><path d="M250 360H680" stroke="#ffb85c" strokeWidth="5"/>
        <g transform="translate(230 270)"><rect width="150" height="64" rx="12" fill="#4d7084"/><rect x="30" y="-23" width="85" height="35" rx="8" fill="#6b8999"/><circle cx="30" cy="67" r="14" fill="#111"/><circle cx="120" cy="67" r="14" fill="#111"/></g>
        <g transform="translate(530 170)"><rect width="125" height="55" rx="11" fill="#db9b43"/><rect x="24" y="-20" width="70" height="31" rx="8" fill="#efbb6b"/><circle cx="25" cy="58" r="13" fill="#111"/><circle cx="100" cy="58" r="13" fill="#111"/></g>
        <g className="detect-box"><rect x="210" y="226" width="190" height="130"/><text x="210" y="216">CAMIÓN · ENTRADA</text></g>
        <g className="detect-box warning-box"><rect x="510" y="128" width="165" height="120"/><text x="510" y="118">AUTO · SENTIDO</text></g>
        <path d="M790 410V320M790 320l-18 25M790 320l18 25" stroke="#42e8b4" strokeWidth="5" fill="none"/>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 900 500" className="scene-svg" role="img" aria-label="Área industrial con detección de personas y equipo de protección">
      <defs><linearGradient id="safetyBg" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#17303a"/><stop offset=".6" stopColor="#111a22"/><stop offset="1" stopColor="#070b0f"/></linearGradient></defs>
      <rect width="900" height="500" fill="url(#safetyBg)" />
      <path d="M0 348L900 270V500H0Z" fill="#142029"/>
      <rect x="35" y="68" width="215" height="240" fill="#1c303b"/><g fill="#38505b">{[0,1,2,3].map(i=><rect key={i} x={55+i*45} y="98" width="30" height="185"/>)}</g>
      <rect x="675" y="45" width="180" height="230" fill="#1a2a34"/><path d="M690 255V90H835" stroke="#54717c" strokeWidth="10" fill="none"/>
      <path d="M380 500L520 285H750L640 500Z" fill="rgba(255,75,91,.08)" stroke="#ff5964" strokeDasharray="12 8"/><text x="545" y="330" fill="#ff737d" fontSize="16">ZONA RESTRINGIDA</text>
      <g transform="translate(290 160)"><circle cx="0" cy="0" r="23" fill="#efb981"/><path d="M-34 30H34L46 170H-48Z" fill="#3b7a98"/><rect x="-28" y="52" width="56" height="14" fill="#42e8b4"/><path d="M-28-10Q0-42 28-10" fill="#ffbf4b"/></g>
      <g transform="translate(565 180)"><circle cx="0" cy="0" r="23" fill="#dca878"/><path d="M-34 30H34L46 170H-48Z" fill="#566674"/><rect x="-28" y="52" width="56" height="14" fill="#42e8b4"/></g>
      <g className="detect-box"><rect x="235" y="118" width="112" height="234"/><text x="235" y="108">EPP OK · 98%</text></g>
      <g className="detect-box warning-box"><rect x="510" y="138" width="112" height="234"/><text x="510" y="128">SIN CASCO · 91%</text></g>
      <g className="zone-label danger"><rect x="520" y="388" width="178" height="30"/><text x="534" y="408">ALERTA EPP ACTIVA</text></g>
    </svg>
  );
}

function LiveMonitor({ module, isLive, setIsLive }: { module: VisionModule; isLive: boolean; setIsLive: (live: boolean) => void }) {
  return (
    <section className="panel live-panel">
      <div className="panel-header">
        <div><span className="eyebrow">MONITOREO EN VIVO</span><h2>CAM-01 · Zona de carga</h2></div>
        <div className="panel-actions">
          <span className={isLive ? "live-state" : "live-state paused"}><i />{isLive ? "EN VIVO" : "PAUSADO"}</span>
          <button className="icon-button" onClick={() => setIsLive(!isLive)} aria-label={isLive ? "Pausar visualización" : "Reanudar visualización"}>{isLive ? <Pause size={17}/> : <Play size={17}/>}</button>
          <button className="icon-button" aria-label="Ajustes de cámara"><SlidersHorizontal size={17}/></button>
        </div>
      </div>
      <div className={isLive ? "camera-stage" : "camera-stage camera-paused"}>
        <SceneArtwork moduleKey={module.key} />
        <div className="camera-corners" aria-hidden="true"><span/><span/><span/><span/></div>
        <div className="scan-line" />
        <div className="camera-overlay-top"><span><Radio size={14}/> REAL · EDGE</span><span>1920×1080</span><span>12.4 FPS</span></div>
        <div className="camera-overlay-bottom"><span>MODELO {module.key.toUpperCase()}-0.4.2</span><span>LATENCIA 74 MS</span><span>10:48:32.418</span></div>
        {!isLive && <div className="paused-overlay"><Pause size={30}/><span>Visualización pausada</span></div>}
      </div>
      <div className="live-toolbar">
        <div><span className="telemetry-icon"><Wifi size={15}/></span><span>Conexión</span><strong>Estable</strong></div>
        <div><span className="telemetry-icon"><Gauge size={15}/></span><span>Inferencia</span><strong>38 ms</strong></div>
        <div><span className="telemetry-icon"><Eye size={15}/></span><span>Detecciones</span><strong>4 activas</strong></div>
        <div><span className="telemetry-icon"><Zap size={15}/></span><span>Regla</span><strong>ppe-v3</strong></div>
      </div>
    </section>
  );
}

function DistributionPanel({ module }: { module: VisionModule }) {
  const items = module.key === "security"
    ? [["Persona", "54%", "#42e8b4"], ["Casco", "21%", "#57b7ff"], ["Chaleco", "17%", "#9b8cff"], ["Incidencia", "8%", "#ff5964"]]
    : module.key === "quality"
      ? [["Conforme", "72%", "#42e8b4"], ["Revisión", "18%", "#ffb85c"], ["Defecto", "7%", "#ff5964"], ["Oclusión", "3%", "#9b8cff"]]
      : module.key === "retail"
        ? [["Acceso", "39%", "#57b7ff"], ["Pasillo", "28%", "#42e8b4"], ["Caja", "21%", "#9b8cff"], ["Fila", "12%", "#ffb85c"]]
        : [["Auto", "52%", "#ffb85c"], ["Camión", "23%", "#57b7ff"], ["Moto", "18%", "#9b8cff"], ["Incidencia", "7%", "#ff5964"]];
  const gradient = `conic-gradient(${items.map((item, index) => `${item[2]} ${index === 0 ? 0 : items.slice(0,index).reduce((sum,x)=>sum+parseInt(x[1]),0)}% ${items.slice(0,index+1).reduce((sum,x)=>sum+parseInt(x[1]),0)}%`).join(",")})`;
  return (
    <section className="panel distribution-panel">
      <div className="panel-header"><div><span className="eyebrow">CLASIFICACIÓN</span><h2>Distribución detectada</h2></div><button className="icon-button"><Filter size={16}/></button></div>
      <div className="donut-wrap">
        <div className="donut" style={{ background: gradient }}><div><strong>{module.total}</strong><span>EVENTOS</span></div></div>
        <div className="legend">
          {items.map(item => <div key={item[0]}><span style={{ background: item[2] }}/><em>{item[0]}</em><strong>{item[1]}</strong></div>)}
        </div>
      </div>
      <div className="confidence-block"><div><span>Confianza promedio</span><strong>{module.accuracy}</strong></div><div className="confidence-bar"><span style={{ width: module.accuracy }}/></div><small>+1.8% respecto al turno anterior</small></div>
    </section>
  );
}

function TrendPanel({ module }: { module: VisionModule }) {
  const [range, setRange] = useState<"8H" | "24H" | "7D">("8H");
  const rangeValues = { "8H": "384", "24H": "1,126", "7D": "7,842" };
  const paths: Record<ModuleKey, string> = {
    security: "M0 118 C60 122 72 72 128 88 S218 46 284 70 S370 18 430 45 S520 28 600 50 S690 12 780 30",
    quality: "M0 104 C60 72 100 92 148 66 S240 90 300 48 S410 70 470 40 S600 52 650 24 S730 42 780 18",
    retail: "M0 125 C70 95 110 116 170 86 S270 105 330 75 S420 86 490 52 S600 68 660 41 S720 52 780 27",
    mobility: "M0 116 C55 80 105 104 145 68 S230 90 290 55 S390 70 450 32 S540 60 620 42 S700 51 780 20",
  };
  return (
    <section className="panel trend-panel">
      <div className="panel-header"><div><span className="eyebrow">PERIODO {range}</span><h2>Flujo de actividad</h2></div><div className="segmented">{(["8H","24H","7D"] as const).map(item => <button key={item} className={range === item ? "active" : ""} onClick={() => setRange(item)}>{item}</button>)}</div></div>
      <div className="trend-value"><strong>{rangeValues[range]}</strong><span>eventos procesados <em>+12.4%</em></span></div>
      <svg viewBox="0 0 780 155" className="trend-chart" preserveAspectRatio="none" aria-label="Gráfico de eventos por hora">
        <defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop stopColor={module.accent} stopOpacity=".32"/><stop offset="1" stopColor={module.accent} stopOpacity="0"/></linearGradient></defs>
        {[20,55,90,125].map(y=><line key={y} x1="0" x2="780" y1={y} y2={y} className="grid-line"/>) }
        <path d={`${paths[module.key]} L780 155 L0 155Z`} fill="url(#chartFill)"/>
        <path d={paths[module.key]} fill="none" stroke={module.accent} strokeWidth="3" vectorEffect="non-scaling-stroke"/>
      </svg>
      <div className="chart-labels"><span>03:00</span><span>04:00</span><span>05:00</span><span>06:00</span><span>07:00</span><span>08:00</span><span>09:00</span><span>10:00</span></div>
    </section>
  );
}

function AlertsPanel({ alerts, compact = false, onSelect }: { alerts: EventRecord[]; compact?: boolean; onSelect?: (event: EventRecord) => void }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const filtered = alerts.filter(alert => `${alert.type} ${alert.place} ${alert.id}`.toLowerCase().includes(query.toLowerCase()));
  const pageSize = compact ? 4 : 5;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const visible = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);
  return (
    <section className={`panel alerts-panel ${compact ? "compact" : ""}`}>
      <div className="panel-header"><div><span className="eyebrow">TRAZABILIDAD</span><h2>Eventos recientes</h2></div>{!compact && <label className="table-search"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Filtrar eventos"/></label>}<button className="text-button">Ver todos <span>→</span></button></div>
      <div className="alerts-list">
        {visible.map((alert) => (
          <button className="alert-row" key={alert.id} onClick={() => onSelect?.(alert)}>
            <span className={`severity severity-${alert.severity.toLowerCase().replace("í","i")}`}><AlertTriangle size={15}/></span>
            <span className="alert-main"><strong>{alert.type}</strong><small>{alert.place} · {alert.id}</small></span>
            <span className="alert-status"><em>{alert.status}</em><small>{alert.time}</small></span>
          </button>
        ))}
        {filtered.length === 0 && <div className="empty-state"><Search size={21}/><strong>Sin coincidencias</strong><span>Prueba con otro evento, cámara o identificador.</span></div>}
      </div>
      {!compact && totalPages > 1 && <div className="table-pagination"><span>Página {safePage + 1} de {totalPages}</span><div><button onClick={() => setPage(current => Math.max(0, current - 1))} disabled={safePage === 0}>Anterior</button><button onClick={() => setPage(current => Math.min(totalPages - 1, current + 1))} disabled={safePage >= totalPages - 1}>Siguiente</button></div></div>}
    </section>
  );
}

function Overview({ module, isLive, setIsLive, events }: { module: VisionModule; isLive: boolean; setIsLive: (live: boolean) => void; events: EventRecord[] }) {
  return (
    <>
      <div className="stats-grid">
        <StatCard label={module.detectedLabel} value={module.total} delta="+14.2% vs. ayer" icon={Eye}/>
        <StatCard label={module.eventLabel} value={module.alerts} delta="3 requieren revisión" icon={AlertTriangle} tone="danger"/>
        <StatCard label="Cámaras activas" value="25 / 30" delta="83.3% disponibilidad" icon={Camera} tone="blue"/>
        <StatCard label="Precisión promedio" value={module.accuracy} delta="Dentro del objetivo" icon={CircleGauge} tone="purple"/>
      </div>
      <div className="primary-grid"><LiveMonitor module={module} isLive={isLive} setIsLive={setIsLive}/><DistributionPanel module={module}/></div>
      <div className="secondary-grid"><TrendPanel module={module}/><AlertsPanel alerts={events} compact/></div>
    </>
  );
}

function CamerasView({ module, cameras, query, onOpen }: { module: VisionModule; cameras: CameraRecord[]; query: string; onOpen: (modal: Exclude<ModalKind, null>) => void }) {
  const visibleCameras = cameras.filter(camera => `${camera.name} ${camera.place} ${camera.status} ${camera.profile}`.toLowerCase().includes(query.toLowerCase()));
  const online = cameras.filter(camera => camera.status === "En línea").length;
  return (
    <div className="view-stack">
      <div className="view-heading"><div><span className="eyebrow">INFRAESTRUCTURA VISUAL</span><h1>Cámaras y fuentes de video</h1><p>Supervisa conexión, rendimiento y perfil activo de cada fuente.</p></div><button className="primary-button" onClick={() => onOpen("camera")}><Camera size={17}/>Registrar cámara</button></div>
      <div className="section-metrics">
        <article><span><Video size={15}/>Fuentes registradas</span><strong>{cameras.length}</strong><small>{online} transmitiendo ahora</small></article>
        <article><span><Wifi size={15}/>Disponibilidad</span><strong>99.12%</strong><small>+0.4% frente a ayer</small></article>
        <article><span><Gauge size={15}/>FPS promedio</span><strong>12.4</strong><small>Dentro del perfil objetivo</small></article>
        <article><span><Zap size={15}/>Latencia media</span><strong>86 ms</strong><small>Procesamiento en edge</small></article>
      </div>
      <div className="camera-grid">
        {visibleCameras.map((camera,index)=><article className="camera-card" key={camera.id}>
          <div className="camera-preview"><SceneArtwork moduleKey={index%2===0?module.key:"security"}/><span className={`camera-status ${camera.status.toLowerCase().replaceAll(" ","-")}`}>{camera.status}</span><span className="camera-number">{camera.name}</span></div>
          <div className="camera-card-body"><div><strong>{camera.place}</strong><span>Perfil {camera.profile || module.short}</span></div><button className="icon-button" onClick={() => onOpen("settings")} aria-label={`Configurar ${camera.name}`}><Settings size={16}/></button></div>
          <div className="camera-metrics"><span><Gauge size={14}/>{camera.fps}</span><span><Activity size={14}/>{camera.latency}</span></div>
        </article>)}
        {visibleCameras.length === 0 && <div className="empty-state grid-empty"><Search size={22}/><strong>No se encontraron cámaras</strong><span>Cambia la búsqueda o registra una nueva fuente.</span></div>}
      </div>
    </div>
  );
}

function EventsView({ events, query, advancedStatus, advancedSeverity, onOpen, onToast, onSelect }: { events: EventRecord[]; query: string; advancedStatus: string; advancedSeverity: string; onOpen: (modal: Exclude<ModalKind, null>) => void; onToast: (message: string) => void; onSelect: (event: EventRecord) => void }) {
  const [filter, setFilter] = useState("Todos");
  const counts = {
    Todos: events.length,
    Nuevos: events.filter(event => event.status === "Nuevo").length,
    "En revisión": events.filter(event => event.status === "En revisión").length,
    Resueltos: events.filter(event => ["Resuelto", "Atendido", "Descartado"].includes(event.status)).length,
  };
  const filters = Object.entries(counts);
  const visibleEvents = events.filter(event => {
    const matchesQuery = `${event.id} ${event.type} ${event.place} ${event.module}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = filter === "Todos" || (filter === "Nuevos" && event.status === "Nuevo") || (filter === "En revisión" && event.status === "En revisión") || (filter === "Resueltos" && ["Resuelto", "Atendido", "Descartado"].includes(event.status));
    const matchesAdvancedStatus = advancedStatus === "Todos" || event.status === advancedStatus;
    const matchesAdvancedSeverity = advancedSeverity === "Todas" || event.severity === advancedSeverity;
    return matchesQuery && matchesStatus && matchesAdvancedStatus && matchesAdvancedSeverity;
  });
  const exportEvents = () => {
    downloadCsv("vision-ai-eventos.csv", visibleEvents.map(event => ({ ID: event.id, Evento: event.type, Ubicación: event.place, Hora: event.time, Severidad: event.severity, Estado: event.status, Módulo: event.module })));
    onToast(`${visibleEvents.length} eventos exportados en CSV.`);
  };
  return (
    <div className="view-stack">
      <div className="view-heading"><div><span className="eyebrow">CENTRO DE INCIDENTES</span><h1>Eventos operativos</h1><p>Consulta, valida y clasifica los resultados generados por las reglas.</p></div><button className="secondary-button" onClick={exportEvents}><Download size={17}/>Exportar CSV</button></div>
      <div className="section-metrics event-metrics">
        <article><span><AlertTriangle size={15}/>Eventos hoy</span><strong>{events.length}</strong><small>{counts.Nuevos} requieren atención</small></article>
        <article><span><Clock3 size={15}/>Respuesta media</span><strong>01:42</strong><small>−18 s frente a la semana pasada</small></article>
        <article><span><CheckCircle2 size={15}/>Confirmados</span><strong>84.7%</strong><small>108 eventos validados</small></article>
        <article><span><ShieldCheck size={15}/>Falsos positivos</span><strong>4.2%</strong><small>Objetivo menor a 5%</small></article>
      </div>
      <div className="filter-strip">
        {filters.map(([label, count]) => <button key={label} className={filter === label ? "active" : ""} onClick={() => setFilter(label)}>{label} <span>{count}</span></button>)}
        <button onClick={() => onOpen("filters")}><Filter size={15}/>Más filtros</button>
      </div>
      <AlertsPanel alerts={visibleEvents} onSelect={event => { onSelect(event); onOpen("event"); }}/>
      <div className="events-summary"><div><span>Tiempo medio de respuesta</span><strong>01:42</strong><small>−18 segundos</small></div><div><span>Tasa de confirmación</span><strong>84.7%</strong><small>+3.1% esta semana</small></div><div><span>Falsos positivos</span><strong>4.2%</strong><small>Objetivo &lt; 5%</small></div></div>
    </div>
  );
}

function AnalyticsView({ module }: { module: VisionModule }) {
  return (
    <div className="view-stack">
      <div className="view-heading"><div><span className="eyebrow">INTELIGENCIA OPERATIVA</span><h1>Analítica de {module.short.toLowerCase()}</h1><p>Tendencias, calidad del modelo y desempeño del nodo edge.</p></div><div className="date-range"><Clock3 size={16}/>09 Nov — 15 Nov<ChevronDown size={15}/></div></div>
      <div className="analytics-grid"><TrendPanel module={module}/><DistributionPanel module={module}/></div>
      <div className="analytics-cards"><article><span>Latencia p95</span><strong>1.24 s</strong><div className="mini-progress"><i style={{width:"62%"}}/></div><small>Meta ≤ 2 segundos</small></article><article><span>FPS de inferencia</span><strong>12.4</strong><div className="mini-progress"><i style={{width:"78%"}}/></div><small>Perfil objetivo 8–15 FPS</small></article><article><span>Frames descartados</span><strong>0.8%</strong><div className="mini-progress"><i style={{width:"8%"}}/></div><small>Señal estable</small></article><article><span>Disponibilidad</span><strong>99.12%</strong><div className="mini-progress"><i style={{width:"99%"}}/></div><small>Últimos 7 días</small></article></div>
      <section className="panel activity-matrix">
        <div className="panel-header"><div><span className="eyebrow">PATRÓN SEMANAL</span><h2>Intensidad de detecciones por hora</h2></div><span className="matrix-legend">MENOR <i/><i/><i/><i/> MAYOR</span></div>
        <div className="matrix-body">
          {["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"].map((day, dayIndex) => <div className="matrix-row" key={day}><span>{day}</span>{Array.from({length: 16}, (_, index) => <i key={index} style={{opacity: .12 + (((index * 7 + dayIndex * 5) % 9) / 10)}} />)}</div>)}
          <div className="matrix-hours"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:00</span></div>
        </div>
      </section>
    </div>
  );
}

function ReportsView({ reports, query, onOpen, onToast }: { reports: ReportRecord[]; query: string; onOpen: (modal: Exclude<ModalKind, null>) => void; onToast: (message: string) => void }) {
  const visibleReports = reports.filter(report => `${report.id} ${report.date} ${report.title} ${report.status}`.toLowerCase().includes(query.toLowerCase()));
  const downloadReport = (report: ReportRecord) => {
    downloadCsv(`${report.id.toLowerCase()}.csv`, [{ Reporte: report.title, Fecha: report.date, Eventos: report.events, Estado: report.status, Formato: report.format }]);
    onToast(`${report.id} descargado correctamente.`);
  };
  return (
    <div className="view-stack">
      <div className="view-heading"><div><span className="eyebrow">CIERRE DE JORNADA</span><h1>Reportes automáticos</h1><p>Historial de resúmenes diarios y estado de entrega a administradores.</p></div><button className="primary-button" onClick={() => onOpen("report")}><FileBarChart size={17}/>Generar reporte</button></div>
      <div className="section-metrics report-metrics">
        <article><span><FileBarChart size={15}/>Generados este mes</span><strong>15</strong><small>100% completados</small></article>
        <article><span><CheckCircle2 size={15}/>Entregas correctas</span><strong>98.6%</strong><small>Resend operativo</small></article>
        <article><span><Users size={15}/>Destinatarios</span><strong>03</strong><small>Administradores activos</small></article>
        <article><span><Clock3 size={15}/>Próxima ejecución</span><strong>01:15</strong><small>Zona horaria Lima</small></article>
      </div>
      <div className="report-hero"><div className="report-hero-icon"><Sparkles size={24}/></div><div><span>PRÓXIMA EJECUCIÓN</span><strong>Hoy, 01:15 a. m.</strong><p>El reporte consolidará la actividad REAL de la jornada y será enviado a 3 administradores.</p></div><div className="report-countdown"><span>EN</span><strong>14:26:18</strong></div></div>
      <div className="report-list">
        {visibleReports.map(report=><article key={report.id}><div className="file-icon"><FileBarChart size={20}/></div><div className="report-info"><span>{report.date}</span><strong>{report.title}</strong><small>{report.events} · Seguridad, Calidad, Retail y Logística</small></div><div className="delivery-status"><span className={report.status==="Entregado"?"delivered":"review"}><CheckCircle2 size={14}/>{report.status}</span><small>{report.format} · {report.time}</small></div><button className="icon-button" onClick={() => downloadReport(report)} aria-label={`Descargar reporte del ${report.date}`}><Download size={17}/></button></article>)}
        {visibleReports.length === 0 && <div className="empty-state"><Search size={22}/><strong>No se encontraron reportes</strong><span>Prueba con otra fecha o identificador.</span></div>}
      </div>
    </div>
  );
}

function VisualModal({ kind, onClose, onConfirm, selectedEvent, settings, profile }: {
  kind: Exclude<ModalKind, null>;
  onClose: () => void;
  onConfirm: (message: string, data: Record<string, FormDataEntryValue>) => void;
  selectedEvent?: EventRecord | null;
  settings?: UiSettings;
  profile?: UserProfile;
}) {
  useEffect(() => {
    const closeWithEscape = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", closeWithEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", closeWithEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const meta = {
    camera: { eyebrow: "NUEVA FUENTE", title: "Registrar cámara", icon: Camera },
    filters: { eyebrow: "CONSULTA AVANZADA", title: "Filtros de eventos", icon: Filter },
    event: { eyebrow: "EVT-2048", title: "Detalle del evento", icon: AlertTriangle },
    report: { eyebrow: "REPORTE BAJO DEMANDA", title: "Generar resumen", icon: FileBarChart },
    settings: { eyebrow: "PREFERENCIAS", title: "Configuración visual", icon: SlidersHorizontal },
    support: { eyebrow: "CENTRO DE AYUDA", title: "Soporte VISION AI", icon: LifeBuoy },
    profile: { eyebrow: "CUENTA OPERATIVA", title: "Perfil de usuario", icon: Users },
    notifications: { eyebrow: "ACTIVIDAD RECIENTE", title: "Notificaciones", icon: Bell },
  }[kind];
  const ModalIcon = meta.icon;
  const [filterModules, setFilterModules] = useState(["Seguridad"]);
  const [reportSections, setReportSections] = useState(["Resumen", "Métricas", "Eventos"]);
  const toggleChoice = (value: string, values: string[], setValues: (items: string[]) => void) => setValues(values.includes(value) ? values.filter(item => item !== value) : [...values, value]);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const message = kind === "camera" ? "Cámara registrada y guardada localmente." : kind === "report" ? "Reporte generado y guardado localmente." : kind === "event" ? "Evento revisado correctamente." : "Cambios guardados correctamente.";
    onConfirm(message, data);
    onClose();
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={event => event.target === event.currentTarget && onClose()}>
      <section className="visual-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <header className="modal-header">
          <div className="modal-heading-icon"><ModalIcon size={20}/></div>
          <div><span className="eyebrow">{meta.eyebrow}</span><h2 id="modal-title">{meta.title}</h2></div>
          <button className="icon-button" onClick={onClose} aria-label="Cerrar ventana" data-no-confirmation="true"><X size={18}/></button>
        </header>

        <form id="vision-modal-form" className="modal-body" onSubmit={submit}>
          {kind === "camera" && <>
            <div className="form-grid"><label><span>Nombre de la cámara</span><input name="cameraName" defaultValue="CAM-07" required/></label><label><span>Ubicación</span><input name="cameraPlace" placeholder="Ej. Patio de maniobras" required/></label></div>
            <label><span>Origen de video</span><select name="cameraType" defaultValue="RTSP"><option value="RTSP">RTSP / cámara IP</option><option value="USB">Cámara USB</option></select></label>
            <label><span>URL o dispositivo</span><input name="cameraSource" placeholder="rtsp://usuario:••••@192.168.1.20/stream" required/></label>
            <div className="connection-preview"><Wifi size={18}/><div><strong>Validación pendiente</strong><span>La conexión se probará cuando se implemente el agente Edge.</span></div><em>EDGE</em></div>
          </>}

          {kind === "filters" && <>
            <div className="form-grid"><label><span>Desde</span><input name="from" type="date" defaultValue="2026-11-15"/></label><label><span>Hasta</span><input name="to" type="date" defaultValue="2026-11-15"/></label></div>
            <div className="form-grid"><label><span>Severidad</span><select name="severity"><option>Todas</option><option>Crítica</option><option>Alta</option><option>Media</option><option>Baja</option></select></label><label><span>Estado</span><select name="status"><option>Todos</option><option>Nuevo</option><option>En revisión</option><option>Resuelto</option></select></label></div>
            <div className="choice-group"><span>Módulos incluidos</span><div>{["Seguridad","Calidad","Retail","Logística"].map(item => <button key={item} type="button" className={filterModules.includes(item) ? "selected" : ""} onClick={() => toggleChoice(item, filterModules, setFilterModules)}>{item}</button>)}</div></div>
          </>}

          {kind === "event" && <>
            <div className="event-detail-hero"><div className="severity severity-critica"><AlertTriangle size={18}/></div><div><strong>{selectedEvent?.type ?? "Evento detectado"}</strong><span>{selectedEvent?.place ?? "Planta Central"} · {selectedEvent?.id ?? "EVT"} · {selectedEvent?.time ?? "Ahora"}</span></div><em>{selectedEvent?.severity.toUpperCase() ?? "ALTA"}</em></div>
            <div className="event-evidence"><SceneArtwork moduleKey="security"/><span>CONFIANZA 96.8%</span></div>
            <div className="detail-grid"><div><span>Regla</span><strong>ppe-v3</strong></div><div><span>Track</span><strong>TRK-8841</strong></div><div><span>Módulo</span><strong>{selectedEvent?.module ?? "Seguridad"}</strong></div><div><span>Estado</span><strong>{selectedEvent?.status ?? "Nuevo"}</strong></div></div>
            <label><span>Resultado de revisión</span><select name="eventStatus" defaultValue={selectedEvent?.status ?? "En revisión"}><option>En revisión</option><option>Resuelto</option><option>Atendido</option><option>Descartado</option></select></label>
            <label><span>Comentario de revisión</span><textarea name="eventComment" defaultValue={selectedEvent?.comment} placeholder="Añade una observación para auditoría..."/></label>
          </>}

          {kind === "report" && <>
            <div className="form-grid"><label><span>Fecha del reporte</span><input name="reportDate" type="date" defaultValue="2026-11-15"/></label><label><span>Formato</span><select name="reportFormat"><option>PDF ejecutivo</option><option>CSV detallado</option></select></label></div>
            <div className="choice-group"><span>Contenido</span><div>{["Resumen","Métricas","Eventos","Auditoría"].map(item => <button key={item} type="button" className={reportSections.includes(item) ? "selected" : ""} onClick={() => toggleChoice(item, reportSections, setReportSections)}>{item}</button>)}</div></div>
            <div className="report-preview-card"><FileBarChart size={25}/><div><strong>Resumen diario · Planta Central</strong><span>4 módulos · 128 eventos · 3 destinatarios</span></div><CheckCircle2 size={18}/></div>
          </>}

          {kind === "settings" && <>
            <div className="settings-list"><label><div><strong>Animaciones de interfaz</strong><span>Transiciones, escaneo y telemetría visual.</span></div><input name="animations" type="checkbox" defaultChecked={settings?.animations}/></label><label><div><strong>Alertas sonoras</strong><span>Aviso para eventos de severidad crítica.</span></div><input name="sounds" type="checkbox" defaultChecked={settings?.sounds}/></label><label><div><strong>Modo de alta densidad</strong><span>Muestra más información en cada pantalla.</span></div><input name="dense" type="checkbox" defaultChecked={settings?.dense}/></label></div>
            <label><span>Idioma de la interfaz</span><select name="language" defaultValue={settings?.language ?? "Español"}><option>Español</option><option>English</option></select></label>
          </>}

          {kind === "support" && <>
            <div className="support-grid"><button type="button"><LifeBuoy size={20}/><strong>Guía operativa</strong><span>Consulta flujos y conceptos.</span></button><button type="button"><Activity size={20}/><strong>Estado del sistema</strong><span>Revisa servicios y cámaras.</span></button></div>
            <label><span>Describe tu consulta</span><textarea name="supportMessage" placeholder="¿En qué podemos ayudarte?" required/></label>
            <div className="connection-preview"><Clock3 size={18}/><div><strong>Atención administrativa</strong><span>Tiempo de respuesta estimado: menos de 24 horas.</span></div><em>SLA</em></div>
          </>}

          {kind === "profile" && <>
            <div className="profile-hero"><div className="avatar avatar-large">{profile?.name.split(" ").map(part => part[0]).slice(0,2).join("") ?? "MC"}</div><div><strong>{profile?.name ?? "Moises Chungaza"}</strong><span>{profile?.role ?? "Administrador"} · Planta Central</span></div><em>ACTIVO</em></div>
            <div className="detail-grid"><div><span>Rol</span><strong>{profile?.role ?? "Administrador"}</strong></div><div><span>Zona horaria</span><strong>{profile?.timezone ?? "America/Lima"}</strong></div><div><span>Último acceso</span><strong>Ahora</strong></div><div><span>Sesión</span><strong>Segura</strong></div></div>
            <label><span>Nombre</span><input name="profileName" defaultValue={profile?.name} required/></label>
            <label><span>Correo de notificaciones</span><input name="profileEmail" type="email" defaultValue={profile?.email} required/></label>
          </>}

          {kind === "notifications" && <div className="notification-list">
            <button><span className="severity severity-critica"><AlertTriangle size={15}/></span><div><strong>3 eventos requieren revisión</strong><small>Seguridad industrial · hace 4 min</small></div><em>NUEVO</em></button>
            <button><span className="severity severity-baja"><CheckCircle2 size={15}/></span><div><strong>Reporte diario entregado</strong><small>3 destinatarios · hace 9 h</small></div></button>
            <button><span className="severity"><Wifi size={15}/></span><div><strong>CAM-04 presenta latencia elevada</strong><small>218 ms · hace 16 min</small></div></button>
          </div>}
        </form>

        <footer className="modal-footer">
          <span>PROTOTIPO VISUAL · SIN CAMBIOS REALES</span>
          <div><button type="button" className="secondary-button" onClick={onClose} data-no-confirmation="true">Cancelar</button>
          {kind !== "notifications" && <button type="submit" form="vision-modal-form" className="primary-button">Aplicar</button>}</div>
        </footer>
      </section>
    </div>
  );
}

export function VisionDashboard() {
  const store = useVisionStore();
  const [activeModule, setActiveModule] = useState<ModuleKey>("security");
  const [activeView, setActiveView] = useState<ViewKey>("overview");
  const [isLive, setIsLive] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeModal, setActiveModal] = useState<ModalKind>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<EventRecord | null>(null);
  const [advancedStatus, setAdvancedStatus] = useState("Todos");
  const [advancedSeverity, setAdvancedSeverity] = useState("Todas");
  const module = useMemo(() => MODULES.find(item => item.key === activeModule) ?? MODULES[0], [activeModule]);
  const title = NAV_ITEMS.find(item => item.key === activeView)?.label ?? "Centro de control";

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("vision-ai-theme");
    const savedSidebar = window.localStorage.getItem("vision-ai-sidebar");
    if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme);
    if (savedSidebar === "collapsed") setSidebarCollapsed(true);
  }, []);

  const toggleTheme = () => {
    setTheme(current => {
      const next = current === "dark" ? "light" : "dark";
      window.localStorage.setItem("vision-ai-theme", next);
      return next;
    });
  };

  const toggleNavigation = () => {
    if (window.matchMedia("(max-width: 980px)").matches) {
      setMobileOpen(true);
      return;
    }
    setSidebarCollapsed(current => {
      const next = !current;
      window.localStorage.setItem("vision-ai-sidebar", next ? "collapsed" : "expanded");
      return next;
    });
  };

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2800);
  };

  const handleModalSubmit = (message: string, data: Record<string, FormDataEntryValue>) => {
    if (activeModal === "camera") {
      const name = String(data.cameraName || `CAM-${store.cameras.length + 1}`);
      store.addCamera({
        id: `cam-${Date.now()}`,
        name,
        place: String(data.cameraPlace || "Sin ubicación"),
        status: "En línea",
        fps: "12.0 FPS",
        latency: "Pendiente",
        profile: module.short,
        source: String(data.cameraType || "RTSP"),
      });
    }
    if (activeModal === "event" && selectedEvent) {
      store.updateEvent(selectedEvent.id, {
        status: String(data.eventStatus || "En revisión") as EventRecord["status"],
        comment: String(data.eventComment || ""),
      });
    }
    if (activeModal === "report") {
      const dateValue = String(data.reportDate || "2026-11-15");
      const date = new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${dateValue}T12:00:00Z`)).toUpperCase().replaceAll(".", "");
      store.addReport({
        id: `REP-${Date.now()}`,
        date,
        title: "Resumen diario · Planta Central",
        events: `${store.events.length} eventos`,
        status: "Entregado",
        time: new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }),
        format: String(data.reportFormat || "PDF ejecutivo"),
      });
    }
    if (activeModal === "settings") {
      store.updateSettings({
        animations: "animations" in data,
        sounds: "sounds" in data,
        dense: "dense" in data,
        language: String(data.language || "Español"),
      });
    }
    if (activeModal === "profile") {
      store.updateProfile({
        ...store.profile,
        name: String(data.profileName || store.profile.name),
        email: String(data.profileEmail || store.profile.email),
      });
    }
    if (activeModal === "filters") {
      setAdvancedStatus(String(data.status || "Todos"));
      setAdvancedSeverity(String(data.severity || "Todas"));
    }
    showToast(message);
  };

  const confirmButtonAction = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const button = target.closest("button") as HTMLButtonElement | null;
    if (!button || button.disabled || button.dataset.noConfirmation === "true") return;

    const label = (button.getAttribute("aria-label") || button.title || button.textContent || "Acción")
      .replace(/\s+/g, " ")
      .trim();
    const confirmation = button.dataset.confirmation;
    const knownMessages: Record<string, string> = {
      "Centro de control": "Centro de control abierto correctamente.",
      "Cámaras": "Sección Cámaras abierta correctamente.",
      "Eventos 12": "Sección Eventos abierta correctamente.",
      "Analítica": "Sección Analítica abierta correctamente.",
      "Reportes": "Sección Reportes abierta correctamente.",
      "Configuración": "Panel de configuración abierto.",
      "Soporte": "Centro de soporte abierto.",
      "Activar modo claro": "Modo claro activado.",
      "Activar modo oscuro": "Modo oscuro activado.",
      "Mostrar u ocultar navegación": "Menú lateral actualizado.",
      "Pausar visualización": "Visualización en vivo pausada.",
      "Reanudar visualización": "Visualización en vivo reanudada.",
      "Notificaciones": "Centro de notificaciones abierto.",
      "Registrar cámara": "Formulario de registro de cámara abierto.",
      "Generar reporte": "Asistente de reporte abierto.",
      "Más filtros": "Filtros avanzados abiertos.",
    };

    showToast(confirmation || knownMessages[label] || `${label.slice(0, 72)}: acción confirmada.`);
  };

  return (
    <div className={`app-shell theme-${theme} ${sidebarCollapsed ? "is-sidebar-collapsed" : ""} ${store.settings.animations ? "" : "reduce-motion"} ${store.settings.dense ? "density-compact" : ""}`} onClickCapture={confirmButtonAction} style={{ "--accent": module.accent, "--accent-rgb": module.accentRgb } as React.CSSProperties}>
      <Sidebar activeView={activeView} setActiveView={setActiveView} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} collapsed={sidebarCollapsed} onOpen={setActiveModal} profile={store.profile}/>
      <main className="main-shell">
        <Topbar title={title} onMenu={toggleNavigation} theme={theme} onTheme={toggleTheme} onNotify={() => setActiveModal("notifications")} query={query} onQuery={setQuery}/>
        <div className="content">
          <div className="page-intro">
            <div><span className="eyebrow">VISIÓN ARTIFICIAL · TIEMPO REAL</span><h1>{activeView === "overview" ? module.name : title}</h1><p>{activeView === "overview" ? module.caption : "Plataforma VISION AI · Operación en borde"}</p></div>
            <div className="demo-pill functional"><span/> MODO LOCAL FUNCIONAL</div>
          </div>
          <ModuleTabs selected={activeModule} onSelect={setActiveModule}/>
          {activeView === "overview" && <Overview module={module} isLive={isLive} setIsLive={setIsLive} events={store.events}/>}
          {activeView === "cameras" && <CamerasView module={module} cameras={store.cameras} query={query} onOpen={setActiveModal}/>}
          {activeView === "events" && <EventsView events={store.events} query={query} advancedStatus={advancedStatus} advancedSeverity={advancedSeverity} onOpen={setActiveModal} onToast={showToast} onSelect={setSelectedEvent}/>}
          {activeView === "analytics" && <AnalyticsView module={module}/>}
          {activeView === "reports" && <ReportsView reports={store.reports} query={query} onOpen={setActiveModal} onToast={showToast}/>}
        </div>
      </main>
      {activeModal && <VisualModal kind={activeModal} onClose={() => setActiveModal(null)} onConfirm={handleModalSubmit} selectedEvent={selectedEvent} settings={store.settings} profile={store.profile}/>}
      {toast && <div className="toast" role="status" aria-live="polite"><CheckCircle2 size={18}/><div><strong>Acción confirmada</strong><span>{toast}</span></div></div>}
    </div>
  );
}

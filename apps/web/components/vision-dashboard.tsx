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
  Pause,
  Play,
  Radio,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Truck,
  Users,
  Video,
  Wifi,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

type ModuleKey = "security" | "quality" | "retail" | "mobility";
type ViewKey = "overview" | "cameras" | "events" | "analytics" | "reports";

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

const ALERTS = [
  { id: "EVT-2048", type: "EPP incompleto", place: "Zona de carga 02", time: "10:42:08", severity: "Alta", status: "Nuevo" },
  { id: "EVT-2047", type: "Acceso a zona crítica", place: "Línea de empaque", time: "10:39:31", severity: "Crítica", status: "En revisión" },
  { id: "EVT-2046", type: "Casco verificado", place: "Almacén norte", time: "10:35:14", severity: "Baja", status: "Resuelto" },
  { id: "EVT-2045", type: "Permanencia extendida", place: "Andén 04", time: "10:28:52", severity: "Media", status: "Atendido" },
  { id: "EVT-2044", type: "Chaleco no visible", place: "Acceso principal", time: "10:21:03", severity: "Alta", status: "Descartado" },
];

const CAMERAS = [
  { name: "CAM-01", place: "Zona de carga", status: "En línea", fps: "12.4 FPS", latency: "74 ms" },
  { name: "CAM-02", place: "Línea de empaque", status: "En línea", fps: "11.9 FPS", latency: "81 ms" },
  { name: "CAM-03", place: "Almacén norte", status: "En línea", fps: "13.1 FPS", latency: "68 ms" },
  { name: "CAM-04", place: "Acceso principal", status: "Degradada", fps: "7.2 FPS", latency: "218 ms" },
  { name: "CAM-05", place: "Andén logístico", status: "En línea", fps: "12.0 FPS", latency: "90 ms" },
  { name: "CAM-06", place: "Área de despacho", status: "Fuera de línea", fps: "—", latency: "—" },
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

function Sidebar({ activeView, setActiveView, mobileOpen, setMobileOpen }: {
  activeView: ViewKey;
  setActiveView: (view: ViewKey) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}) {
  return (
    <>
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
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
          <button className="nav-item"><SlidersHorizontal size={19} /><span>Configuración</span></button>
          <button className="nav-item"><LifeBuoy size={19} /><span>Soporte</span></button>
        </nav>

        <div className="edge-health">
          <div className="edge-health-top"><span>EDGE NODE 01</span><span className="status-dot">ACTIVO</span></div>
          <div className="edge-meter"><span style={{ width: "71%" }} /></div>
          <div className="edge-values"><span>GPU 71%</span><span>42°C</span></div>
        </div>

        <div className="user-card">
          <div className="avatar">MC</div>
          <div><strong>Moises Chungaza</strong><span>Administrador</span></div>
          <Settings size={17} />
        </div>
      </aside>
      {mobileOpen && <button className="sidebar-backdrop" onClick={() => setMobileOpen(false)} aria-label="Cerrar navegación" />}
    </>
  );
}

function Topbar({ title, onMenu, onNotify }: { title: string; onMenu: () => void; onNotify: () => void }) {
  return (
    <header className="topbar">
      <button className="icon-button menu-button" onClick={onMenu} aria-label="Abrir navegación"><Menu size={20} /></button>
      <div className="topbar-title"><span>OPERACIÓN /</span><strong>{title}</strong></div>
      <div className="topbar-actions">
        <label className="search-box">
          <Search size={17} />
          <input placeholder="Buscar evento, cámara..." aria-label="Buscar" />
          <kbd>⌘ K</kbd>
        </label>
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
  const paths: Record<ModuleKey, string> = {
    security: "M0 118 C60 122 72 72 128 88 S218 46 284 70 S370 18 430 45 S520 28 600 50 S690 12 780 30",
    quality: "M0 104 C60 72 100 92 148 66 S240 90 300 48 S410 70 470 40 S600 52 650 24 S730 42 780 18",
    retail: "M0 125 C70 95 110 116 170 86 S270 105 330 75 S420 86 490 52 S600 68 660 41 S720 52 780 27",
    mobility: "M0 116 C55 80 105 104 145 68 S230 90 290 55 S390 70 450 32 S540 60 620 42 S700 51 780 20",
  };
  return (
    <section className="panel trend-panel">
      <div className="panel-header"><div><span className="eyebrow">ÚLTIMAS 8 HORAS</span><h2>Flujo de actividad</h2></div><div className="segmented"><button className="active">8H</button><button>24H</button><button>7D</button></div></div>
      <div className="trend-value"><strong>384</strong><span>eventos procesados <em>+12.4%</em></span></div>
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

function AlertsPanel({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState("");
  const filtered = ALERTS.filter(alert => `${alert.type} ${alert.place} ${alert.id}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <section className={`panel alerts-panel ${compact ? "compact" : ""}`}>
      <div className="panel-header"><div><span className="eyebrow">TRAZABILIDAD</span><h2>Eventos recientes</h2></div>{!compact && <label className="table-search"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Filtrar eventos"/></label>}<button className="text-button">Ver todos <span>→</span></button></div>
      <div className="alerts-list">
        {filtered.slice(0, compact ? 4 : 5).map((alert) => (
          <button className="alert-row" key={alert.id}>
            <span className={`severity severity-${alert.severity.toLowerCase().replace("í","i")}`}><AlertTriangle size={15}/></span>
            <span className="alert-main"><strong>{alert.type}</strong><small>{alert.place} · {alert.id}</small></span>
            <span className="alert-status"><em>{alert.status}</em><small>{alert.time}</small></span>
          </button>
        ))}
      </div>
    </section>
  );
}

function Overview({ module, isLive, setIsLive }: { module: VisionModule; isLive: boolean; setIsLive: (live: boolean) => void }) {
  return (
    <>
      <div className="stats-grid">
        <StatCard label={module.detectedLabel} value={module.total} delta="+14.2% vs. ayer" icon={Eye}/>
        <StatCard label={module.eventLabel} value={module.alerts} delta="3 requieren revisión" icon={AlertTriangle} tone="danger"/>
        <StatCard label="Cámaras activas" value="25 / 30" delta="83.3% disponibilidad" icon={Camera} tone="blue"/>
        <StatCard label="Precisión promedio" value={module.accuracy} delta="Dentro del objetivo" icon={CircleGauge} tone="purple"/>
      </div>
      <div className="primary-grid"><LiveMonitor module={module} isLive={isLive} setIsLive={setIsLive}/><DistributionPanel module={module}/></div>
      <div className="secondary-grid"><TrendPanel module={module}/><AlertsPanel compact/></div>
    </>
  );
}

function CamerasView({ module }: { module: VisionModule }) {
  return (
    <div className="view-stack">
      <div className="view-heading"><div><span className="eyebrow">INFRAESTRUCTURA VISUAL</span><h1>Cámaras y fuentes de video</h1><p>Supervisa conexión, rendimiento y perfil activo de cada fuente.</p></div><button className="primary-button"><Camera size={17}/>Registrar cámara</button></div>
      <div className="camera-grid">
        {CAMERAS.map((camera,index)=><article className="camera-card" key={camera.name}>
          <div className="camera-preview"><SceneArtwork moduleKey={index%2===0?module.key:"security"}/><span className={`camera-status ${camera.status.toLowerCase().replaceAll(" ","-")}`}>{camera.status}</span><span className="camera-number">{camera.name}</span></div>
          <div className="camera-card-body"><div><strong>{camera.place}</strong><span>Perfil {module.short}</span></div><button className="icon-button"><Settings size={16}/></button></div>
          <div className="camera-metrics"><span><Gauge size={14}/>{camera.fps}</span><span><Activity size={14}/>{camera.latency}</span></div>
        </article>)}
      </div>
    </div>
  );
}

function EventsView() {
  return (
    <div className="view-stack">
      <div className="view-heading"><div><span className="eyebrow">CENTRO DE INCIDENTES</span><h1>Eventos operativos</h1><p>Consulta, valida y clasifica los resultados generados por las reglas.</p></div><button className="secondary-button"><Download size={17}/>Exportar CSV</button></div>
      <div className="filter-strip"><button className="active">Todos <span>128</span></button><button>Nuevos <span>12</span></button><button>En revisión <span>08</span></button><button>Resueltos <span>96</span></button><button><Filter size={15}/>Más filtros</button></div>
      <AlertsPanel/>
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
    </div>
  );
}

function ReportsView() {
  const reports = [
    {date:"14 NOV 2026",title:"Resumen diario · Planta Central",events:"116 eventos",status:"Entregado",time:"01:15"},
    {date:"13 NOV 2026",title:"Resumen diario · Planta Central",events:"94 eventos",status:"Entregado",time:"01:15"},
    {date:"12 NOV 2026",title:"Resumen diario · Planta Central",events:"Sin eventos",status:"Entregado",time:"01:15"},
    {date:"11 NOV 2026",title:"Resumen diario · Planta Central",events:"132 eventos",status:"Revisar",time:"01:16"},
  ];
  return (
    <div className="view-stack">
      <div className="view-heading"><div><span className="eyebrow">CIERRE DE JORNADA</span><h1>Reportes automáticos</h1><p>Historial de resúmenes diarios y estado de entrega a administradores.</p></div><button className="primary-button"><FileBarChart size={17}/>Generar reporte</button></div>
      <div className="report-hero"><div className="report-hero-icon"><Sparkles size={24}/></div><div><span>PRÓXIMA EJECUCIÓN</span><strong>Hoy, 01:15 a. m.</strong><p>El reporte consolidará la actividad REAL de la jornada y será enviado a 3 administradores.</p></div><div className="report-countdown"><span>EN</span><strong>14:26:18</strong></div></div>
      <div className="report-list">
        {reports.map(report=><article key={report.date}><div className="file-icon"><FileBarChart size={20}/></div><div className="report-info"><span>{report.date}</span><strong>{report.title}</strong><small>{report.events} · Seguridad, Calidad, Retail y Logística</small></div><div className="delivery-status"><span className={report.status==="Entregado"?"delivered":"review"}><CheckCircle2 size={14}/>{report.status}</span><small>Resend · {report.time}</small></div><button className="icon-button"><Download size={17}/></button></article>)}
      </div>
    </div>
  );
}

export function VisionDashboard() {
  const [activeModule, setActiveModule] = useState<ModuleKey>("security");
  const [activeView, setActiveView] = useState<ViewKey>("overview");
  const [isLive, setIsLive] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState(false);
  const module = useMemo(() => MODULES.find(item => item.key === activeModule) ?? MODULES[0], [activeModule]);
  const title = NAV_ITEMS.find(item => item.key === activeView)?.label ?? "Centro de control";
  return (
    <div className="app-shell" style={{ "--accent": module.accent, "--accent-rgb": module.accentRgb } as React.CSSProperties}>
      <Sidebar activeView={activeView} setActiveView={setActiveView} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}/>
      <main className="main-shell">
        <Topbar title={title} onMenu={()=>setMobileOpen(true)} onNotify={()=>{setToast(true); window.setTimeout(()=>setToast(false),2200);}}/>
        <div className="content">
          <div className="page-intro">
            <div><span className="eyebrow">VISIÓN ARTIFICIAL · TIEMPO REAL</span><h1>{activeView === "overview" ? module.name : title}</h1><p>{activeView === "overview" ? module.caption : "Plataforma VISION AI · Operación en borde"}</p></div>
            <div className="demo-pill"><span/> PROTOTIPO VISUAL</div>
          </div>
          <ModuleTabs selected={activeModule} onSelect={setActiveModule}/>
          {activeView === "overview" && <Overview module={module} isLive={isLive} setIsLive={setIsLive}/>} 
          {activeView === "cameras" && <CamerasView module={module}/>} 
          {activeView === "events" && <EventsView/>} 
          {activeView === "analytics" && <AnalyticsView module={module}/>} 
          {activeView === "reports" && <ReportsView/>} 
        </div>
      </main>
      {toast && <div className="toast"><Bell size={18}/><div><strong>Centro de notificaciones</strong><span>Tienes 3 eventos que requieren revisión.</span></div></div>}
    </div>
  );
}

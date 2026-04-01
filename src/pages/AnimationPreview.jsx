import { useState } from "react";
import Header from "@/components/Header";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Paperclip, Link2, ImageIcon, FileText, X, ExternalLink, Upload, Plus, Package, Ship, Clock, CheckCircle2, AlertCircle, Truck, ChevronDown, Globe, Lock, ShoppingCart, TrendingUp, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { COMPANY_APPS } from "@/lib/constants";
import ChinaAgentPortalPreview from "@/components/preview/ChinaAgentPortalPreview";
import DashboardColorPreview from "@/components/preview/DashboardColorPreview";

const APPS = COMPANY_APPS;

// Layout 1: Standard Grid (current style)
function StyleStandardGrid({ apps }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {apps.map((app) => {
        const Icon = app.icon;
        return (
          <div key={app.id} className="bg-white border-2 border-gray-200 hover:border-red-500 rounded-xl p-4 cursor-pointer group transition-all">
            <div className={`${app.customImage ? "bg-white rounded-lg overflow-hidden" : `w-10 h-10 ${app.color} rounded-lg`} flex items-center justify-center mb-3`}
              style={app.customImage ? { width: 40, height: 40 } : {}}>
              {app.customImage ? <img src={app.customImage} alt={app.name} className="w-full h-full object-contain" /> : <Icon className="w-5 h-5 text-white" />}
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-red-600 transition-colors">{app.name}</h3>
            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{app.description}</p>
            <div className="flex items-center text-red-500 mt-2 text-xs font-semibold">
              Launch <ArrowRight className="w-3 h-3 ml-1" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Layout 2: Horizontal List
function StyleHorizontalList({ apps }) {
  return (
    <div className="space-y-3">
      {apps.map((app) => {
        const Icon = app.icon;
        return (
          <div key={app.id} className="bg-white border-2 border-gray-200 hover:border-red-500 rounded-xl p-4 cursor-pointer group transition-all flex items-center gap-4">
            <div className={`${app.customImage ? "bg-white rounded-xl overflow-hidden flex-shrink-0" : `w-12 h-12 ${app.color} rounded-xl flex-shrink-0`} flex items-center justify-center`}
              style={app.customImage ? { width: 48, height: 48 } : {}}>
              {app.customImage ? <img src={app.customImage} alt={app.name} className="w-full h-full object-contain" /> : <Icon className="w-6 h-6 text-white" />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-red-600 transition-colors">{app.name}</h3>
              <p className="text-xs text-gray-500 truncate">{app.description}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-red-500 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
          </div>
        );
      })}
    </div>
  );
}

// Layout 3: Large Logo Cards (logo-first prominent)
function StyleLargeLogoCards({ apps }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {apps.map((app) => {
        const Icon = app.icon;
        return (
          <div key={app.id} className="bg-white border-2 border-gray-200 hover:border-red-500 rounded-xl cursor-pointer group transition-all overflow-hidden">
            <div className={`${app.customImage ? "bg-gray-50" : app.color} h-24 flex items-center justify-center`}>
              {app.customImage
                ? <img src={app.customImage} alt={app.name} className="h-20 w-20 object-contain" />
                : <Icon className="w-10 h-10 text-white" />}
            </div>
            <div className="p-3">
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-red-600 transition-colors">{app.name}</h3>
              <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{app.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Layout 4: Minimal Icon Row
function StyleMinimalIconRow({ apps }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {apps.map((app) => {
        const Icon = app.icon;
        return (
          <div key={app.id} className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-red-50 cursor-pointer group transition-all">
            <div className={`${app.customImage ? "bg-white rounded-xl overflow-hidden border border-gray-200" : `w-12 h-12 ${app.color} rounded-xl`} flex items-center justify-center`}
              style={app.customImage ? { width: 48, height: 48 } : {}}>
              {app.customImage ? <img src={app.customImage} alt={app.name} className="w-full h-full object-contain" /> : <Icon className="w-6 h-6 text-white" />}
            </div>
            <span className="text-xs font-semibold text-slate-700 group-hover:text-red-600 text-center leading-tight">{app.name}</span>
          </div>
        );
      })}
    </div>
  );
}

// Layout 5: Side Banner Card
function StyleSideBannerCard({ apps }) {
  return (
    <div className="space-y-3">
      {apps.map((app) => {
        const Icon = app.icon;
        return (
          <div key={app.id} className="bg-white border-2 border-gray-200 hover:border-red-500 rounded-xl cursor-pointer group transition-all flex overflow-hidden">
            <div className={`${app.customImage ? "bg-gray-50" : app.color} w-16 flex items-center justify-center flex-shrink-0`}>
              {app.customImage
                ? <img src={app.customImage} alt={app.name} className="w-12 h-12 object-contain" />
                : <Icon className="w-7 h-7 text-white" />}
            </div>
            <div className="flex-1 p-4 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-red-600 transition-colors">{app.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{app.description}</p>
              </div>
              <div className="flex items-center text-red-500 text-xs font-semibold mt-2">
                Launch App <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const DEMO_IMAGE = "https://media.base44.com/images/public/69bc62c36ed6e9abb825f80f/686c2d1b3_tradeflow_clean.png";

const ANIM_STYLES = [
  {
    id: "spin",
    label: "Spin / Revolve",
    description: "Full 360° rotation on hover",
    logoMotion: { rotate: 360 },
    transition: { duration: 0.7, ease: "easeInOut" },
  },
  {
    id: "bounce",
    label: "Bounce / Pulse",
    description: "Scale up and bounce on hover",
    logoMotion: { scale: 1.25 },
    transition: { type: "spring", stiffness: 300, damping: 10 },
  },
  {
    id: "wobble",
    label: "Wobble / Shake",
    description: "Side-to-side wiggle on hover",
    logoMotion: { rotate: [0, -12, 12, -8, 8, -4, 4, 0] },
    transition: { duration: 0.6 },
  },
  {
    id: "flip",
    label: "Flip",
    description: "Flip horizontally on hover",
    logoMotion: { rotateY: 180 },
    transition: { duration: 0.6, ease: "easeInOut" },
  },
  {
    id: "rubber",
    label: "Rubber Band",
    description: "Elastic stretch effect",
    logoMotion: { scaleX: [1, 1.4, 0.75, 1.15, 0.95, 1], scaleY: [1, 0.75, 1.2, 0.9, 1.05, 1] },
    transition: { duration: 0.7 },
  },
  {
    id: "float",
    label: "Float Up",
    description: "Gently rises upward",
    logoMotion: { y: -18 },
    transition: { type: "spring", stiffness: 200, damping: 12 },
  },
  {
    id: "swing",
    label: "Swing",
    description: "Pendulum swing from top",
    logoMotion: { rotate: [0, 20, -16, 12, -8, 5, 0] },
    transition: { duration: 0.8, ease: "easeInOut" },
  },
  {
    id: "zoom",
    label: "Zoom In",
    description: "Smooth zoom with shadow pop",
    logoMotion: { scale: 1.35, filter: "drop-shadow(0 8px 16px rgba(239,68,68,0.4))" },
    transition: { duration: 0.25, ease: "easeOut" },
  },
  {
    id: "tilt",
    label: "Tilt & Lift",
    description: "Tilts and floats up",
    logoMotion: { rotate: -8, y: -12, scale: 1.1 },
    transition: { type: "spring", stiffness: 250, damping: 15 },
  },
];

function AnimCard({ style }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="bg-white border-2 border-gray-200 hover:border-red-500 rounded-xl overflow-hidden cursor-pointer transition-colors"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="bg-gray-50 h-36 flex items-center justify-center">
        <motion.img
          src={DEMO_IMAGE}
          alt="logo"
          style={{ width: 150, height: 150, objectFit: "contain" }}
          animate={hovered ? style.logoMotion : {}}
          transition={style.transition}
        />
      </div>
      <div className="p-3">
        <p className="font-bold text-slate-900 text-sm">{style.label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{style.description}</p>
      </div>
    </div>
  );
}

const LAYOUTS = [
  { id: "grid", label: "Standard Grid", component: StyleStandardGrid },
  { id: "list", label: "Horizontal List", component: StyleHorizontalList },
  { id: "largelogo", label: "Large Logo Cards", component: StyleLargeLogoCards },
  { id: "minimal", label: "Minimal Icon Row", component: StyleMinimalIconRow },
  { id: "banner", label: "Side Banner Card", component: StyleSideBannerCard },
];

// ─── Mock Attachments Data ────────────────────────────────────────────────────
const MOCK_LINE_ITEM_ATTACHMENTS = [
  { id: 1, type: 'image', name: 'Product Photo.jpg', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&h=80&fit=crop' },
  { id: 2, type: 'link', name: 'Alibaba Listing', url: 'https://alibaba.com/product/example' },
  { id: 3, type: 'document', name: 'Spec Sheet.pdf', url: '#' },
];

const MOCK_SHEET_ATTACHMENTS = [
  { id: 1, type: 'document', name: 'Client RFQ.pdf', url: '#' },
  { id: 2, type: 'document', name: 'PO-2024-001.pdf', url: '#' },
  { id: 3, type: 'link', name: 'Client Portal', url: 'https://example.com' },
  { id: 4, type: 'image', name: 'Site Photo.png', url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=80&h=80&fit=crop' },
];

function AttachmentChip({ att, onRemove }) {
  const icons = {
    image: <ImageIcon className="w-3.5 h-3.5 text-violet-500" />,
    document: <FileText className="w-3.5 h-3.5 text-blue-500" />,
    link: <Link2 className="w-3.5 h-3.5 text-emerald-500" />,
  };
  const colors = {
    image: 'bg-violet-50 border-violet-200',
    document: 'bg-blue-50 border-blue-200',
    link: 'bg-emerald-50 border-emerald-200',
  };
  return (
    <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-medium ${colors[att.type]}`}>
      {icons[att.type]}
      <span className="text-slate-700 max-w-[100px] truncate">{att.name}</span>
      <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-600">
        <ExternalLink className="w-3 h-3" />
      </a>
      {onRemove && (
        <button onClick={() => onRemove(att.id)} className="text-slate-300 hover:text-red-400 transition-colors">
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

function LineItemAttachmentPreview() {
  const [attachments, setAttachments] = useState(MOCK_LINE_ITEM_ATTACHMENTS);
  const [linkInput, setLinkInput] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);

  const remove = (id) => setAttachments(a => a.filter(x => x.id !== id));
  const addLink = () => {
    if (!linkInput.trim()) return;
    setAttachments(a => [...a, { id: Date.now(), type: 'link', name: linkInput, url: linkInput }]);
    setLinkInput('');
    setShowLinkInput(false);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Simulated line item row */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center gap-3">
        <span className="text-xs font-mono text-slate-400 w-6">01</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-800">Stainless Steel Pipe 2" × 6m</p>
          <p className="text-xs text-slate-400">Qty: 100 PCS · Unit: QAR 45.00 · Total: QAR 4,500</p>
        </div>
        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Awarded</span>
      </div>

      {/* Attachments panel */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Paperclip className="w-3.5 h-3.5" /> Attachments
            <span className="bg-slate-200 text-slate-600 rounded-full px-1.5 text-xs">{attachments.length}</span>
          </p>
          <div className="flex gap-1.5">
            <label className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 cursor-pointer px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors border border-dashed border-slate-200 hover:border-blue-300">
              <Upload className="w-3 h-3" /> Upload
            </label>
            <button
              onClick={() => setShowLinkInput(v => !v)}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-600 cursor-pointer px-2 py-1 rounded-lg hover:bg-emerald-50 transition-colors border border-dashed border-slate-200 hover:border-emerald-300"
            >
              <Link2 className="w-3 h-3" /> Add Link
            </button>
          </div>
        </div>

        {showLinkInput && (
          <div className="flex gap-2 mb-2">
            <input
              value={linkInput}
              onChange={e => setLinkInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addLink()}
              placeholder="Paste ordering link or URL..."
              className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
            <button onClick={addLink} className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700">Add</button>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {attachments.map(att => <AttachmentChip key={att.id} att={att} onRemove={remove} />)}
          {attachments.length === 0 && <p className="text-xs text-slate-400 italic">No attachments yet</p>}
        </div>
      </div>
    </div>
  );
}

function SheetAttachmentPreview() {
  const [attachments, setAttachments] = useState(MOCK_SHEET_ATTACHMENTS);
  const [linkInput, setLinkInput] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);

  const remove = (id) => setAttachments(a => a.filter(x => x.id !== id));
  const addLink = () => {
    if (!linkInput.trim()) return;
    setAttachments(a => [...a, { id: Date.now(), type: 'link', name: linkInput, url: linkInput }]);
    setLinkInput('');
    setShowLinkInput(false);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Simulated PCS sheet header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-4 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-400 font-mono">PCS-00042</p>
            <h3 className="text-base font-bold mt-0.5">QAFCO Pipeline Maintenance</h3>
            <p className="text-xs text-slate-300 mt-1">PO-2024-089 · Client: QAFCO · 8 Line Items</p>
          </div>
          <span className="text-xs bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-1 rounded-full font-medium">In Progress</span>
        </div>
      </div>

      {/* Attachments panel */}
      <div className="px-5 py-4 border-t border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
            <Paperclip className="w-4 h-4" /> Sheet Documents
            <span className="bg-slate-100 text-slate-500 rounded-full px-2 text-xs">{attachments.length}</span>
          </p>
          <div className="flex gap-2">
            <label className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-600 cursor-pointer px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 transition-colors border border-slate-200 hover:border-blue-300">
              <Upload className="w-3.5 h-3.5" /> Upload File
            </label>
            <button
              onClick={() => setShowLinkInput(v => !v)}
              className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-600 cursor-pointer px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-emerald-50 transition-colors border border-slate-200 hover:border-emerald-300"
            >
              <Link2 className="w-3.5 h-3.5" /> Add Link
            </button>
          </div>
        </div>

        {showLinkInput && (
          <div className="flex gap-2 mb-3">
            <input
              value={linkInput}
              onChange={e => setLinkInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addLink()}
              placeholder="Paste link or URL..."
              className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
            <button onClick={addLink} className="text-sm bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">Add</button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {attachments.map(att => (
            <div key={att.id} className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors group">
              <div className="flex-shrink-0">
                {att.type === 'image'
                  ? <img src={att.url} alt={att.name} className="w-8 h-8 rounded object-cover" />
                  : att.type === 'document'
                  ? <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center"><FileText className="w-4 h-4 text-blue-600" /></div>
                  : <div className="w-8 h-8 bg-emerald-100 rounded flex items-center justify-center"><Link2 className="w-4 h-4 text-emerald-600" /></div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-700 truncate">{att.name}</p>
                <p className="text-xs text-slate-400 capitalize">{att.type}</p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-500"><ExternalLink className="w-3.5 h-3.5" /></a>
                <button onClick={() => remove(att.id)} className="text-slate-300 hover:text-red-400"><X className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AnimationPreview() {
  const [selected, setSelected] = useState("grid");

  const activeLayout = LAYOUTS.find(l => l.id === selected);
  const LayoutComponent = activeLayout?.component;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="pt-24 px-4 md:px-6 pb-8 max-w-5xl mx-auto">
        <Link to="/" className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Logo Hover Animation Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Logo Hover Animations</h1>
          <p className="text-slate-500 mb-6">Hover over each card to preview the animation effect.</p>
          <div className="grid grid-cols-3 gap-4">
            {ANIM_STYLES.map(style => <AnimCard key={style.id} style={style} />)}
          </div>
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700">Tell me which animation you'd like applied to the live Home page cards.</p>
          </div>
        </div>

        {/* Layout Styles Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Card Layout Styles</h1>
          <p className="text-slate-500 mb-8">Preview different card layout styles using the existing app logos.</p>

          <div className="flex flex-wrap gap-2 mb-8">
            {LAYOUTS.map((layout) => (
              <button
                key={layout.id}
                onClick={() => setSelected(layout.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                  selected === layout.id
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-gray-200 bg-white text-slate-600 hover:border-red-300"
                }`}
              >
                {layout.label}
              </button>
            ))}
          </div>

          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-slate-50 rounded-xl border border-slate-200 p-6"
          >
            <p className="text-xs text-slate-400 mb-4 uppercase tracking-widest font-semibold">{activeLayout?.label} — Preview</p>
            {LayoutComponent && <LayoutComponent apps={APPS} />}
          </motion.div>

          <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-emerald-900">Selected: <span className="capitalize">{activeLayout?.label}</span></p>
            <p className="text-xs text-emerald-700 mt-1">Let me know which layout you'd like applied to the Home page.</p>
          </div>
        </div>

        {/* Dashboard Color Scheme Preview */}
        <DashboardColorPreview />

        {/* China Agent Portal Preview Section */}
        <ChinaAgentPortalPreview />

        {/* PCS Attachments Preview Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 mt-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">PCS Attachments</h1>
          <p className="text-slate-500 mb-8">Two levels of attachments — per line item and per sheet. Fully interactive mockups below.</p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Line Item Level */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-violet-100 text-violet-700 text-xs font-bold px-2.5 py-1 rounded-full">Option A</span>
                <h2 className="text-sm font-semibold text-slate-700">Line Item Level Attachments</h2>
              </div>
              <p className="text-xs text-slate-500 mb-4">Each line item gets its own attachments — product photos, spec sheets, and ordering links. Inline inside the line items table.</p>
              <LineItemAttachmentPreview />
              <div className="mt-3 bg-violet-50 border border-violet-200 rounded-lg p-3">
                <p className="text-xs text-violet-700">✅ Best for: product images, supplier ordering links per item</p>
              </div>
            </div>

            {/* Sheet Level */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">Option B</span>
                <h2 className="text-sm font-semibold text-slate-700">Sheet Level Attachments</h2>
              </div>
              <p className="text-xs text-slate-500 mb-4">Attachments at the PCS sheet level — RFQs, PO documents, client portal links. Lives in the sheet header area.</p>
              <SheetAttachmentPreview />
              <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">✅ Best for: RFQ docs, client PO PDFs, general reference files</p>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-amber-900">💡 Recommendation</p>
            <p className="text-xs text-amber-700 mt-1">Implement <strong>both</strong> — they serve different purposes. Line item attachments for product-level info, sheet attachments for overall documents. Just say "implement both" to proceed!</p>
          </div>
        </div>

      </div>
    </div>
  );
}
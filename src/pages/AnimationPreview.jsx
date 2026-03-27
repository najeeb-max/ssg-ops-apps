import { useState } from "react";
import Header from "@/components/Header";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Ship, ShoppingCart, Files, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

const APPS = [
  {
    id: 1,
    name: "TradeFlow",
    description: "Manage orders, shipments, suppliers and customers for China hub logistics",
    icon: Ship,
    color: "bg-indigo-600",
    link: "/tradeflow",
  },
  {
    id: 2,
    name: "PCS",
    description: "Overview of SSG procurement price comparisons for Existing System Orders",
    icon: ShoppingCart,
    color: "bg-red-600",
    customImage: "https://media.base44.com/images/public/69bc62c36ed6e9abb825f80f/32d269562_ChatGPTImageMar27202603_38_22AM.png",
    link: "/pcs",
  },
  {
    id: 3,
    name: "Document Hub",
    description: "Create, edit, and collaborate on documents with seamless Google Docs sync",
    icon: Files,
    color: "bg-red-700",
    link: "/documents",
  },
  {
    id: 4,
    name: "Training Portal",
    description: "Access courses and track learning progress via Google Classroom",
    icon: BookOpen,
    color: "bg-red-700",
    link: "/learning",
  },
];

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
      </div>
    </div>
  );
}
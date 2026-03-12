import React, { useState, useMemo, useRef } from 'react';
import { CABINET_TYPES, CABINET_CATEGORIES } from './config/cabinets';
import { MATERIALS, MATERIAL_CATEGORIES, BACK_TYPES, EDGE_TYPES, LEG_OPTIONS, HINGE_OPTIONS } from './config/materials';

// ============================================================================
// KONFIGURACJA - ZMIEŃ NA SWOJE DANE
// ============================================================================
const CONFIG = {
  companyName: 'Meble Na Wymiar',
  companyEmail: 'zamowienia@twojafirma.pl',
  companyPhone: '+48 123 456 789',
  deliveryDays: '5-7 dni roboczych',
  freeDeliveryFrom: 0,
};

// ============================================================================
// HOOK KALKULACJI CENY
// ============================================================================
const useCalculatePrice = (config) => {
  return useMemo(() => {
    const { type, width, height, depth, material, frontMaterial, backType, edgeType, legs, hinges, shelves, hasFronts } = config;
    
    const widthM = width / 1000;
    const heightM = height / 1000;
    const depthM = depth / 1000;
    
    const sideArea = 2 * heightM * depthM;
    const topBottomArea = 2 * widthM * depthM;
    const shelfArea = shelves * widthM * depthM;
    const corpusArea = sideArea + topBottomArea + shelfArea;
    const frontArea = hasFronts ? widthM * heightM : 0;
    const edgeLength = 2 * heightM + 2 * widthM + (shelves * 2 * depthM);
    
    const mat = MATERIALS.find(m => m.id === material);
    const frontMat = MATERIALS.find(m => m.id === frontMaterial) || mat;
    const back = BACK_TYPES.find(b => b.id === backType);
    const edge = EDGE_TYPES.find(e => e.id === edgeType);
    const leg = LEG_OPTIONS.find(l => l.id === legs);
    const hinge = HINGE_OPTIONS.find(h => h.id === hinges);
    const cabinetType = CABINET_TYPES.find(t => t.id === type);
    
    const breakdown = {
      base: cabinetType?.basePrice || 0,
      corpus: Math.round(corpusArea * (mat?.pricePerM2 || 0)),
      fronts: Math.round(frontArea * (frontMat?.pricePerM2 || 0)),
      back: back?.priceAdd || 0,
      edges: Math.round(edgeLength * (edge?.pricePerM || 0)),
      legs: (leg?.price || 0) * 4,
      hinges: (hinge?.price || 0) * (hasFronts ? (width > 600 ? 4 : 2) : 0),
      shelves: shelves * 25,
    };
    
    const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
    return { breakdown, total };
  }, [config]);
};

// ============================================================================
// IKONY SVG
// ============================================================================
const Icons = {
  bottom: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 sm:w-6 sm:h-6"><rect x="3" y="8" width="18" height="12" rx="1" /><line x1="12" y1="8" x2="12" y2="20" /><line x1="3" y1="4" x2="21" y2="4" strokeWidth="2" /></svg>,
  top: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 sm:w-6 sm:h-6"><rect x="3" y="4" width="18" height="12" rx="1" /><line x1="12" y1="4" x2="12" y2="16" /><line x1="3" y1="20" x2="21" y2="20" strokeWidth="2" /></svg>,
  tall: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 sm:w-6 sm:h-6"><rect x="5" y="2" width="14" height="20" rx="1" /><line x1="5" y1="10" x2="19" y2="10" /><line x1="5" y1="16" x2="19" y2="16" /></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3 sm:w-4 sm:h-4"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  expand: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  send: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  download: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  close: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  info: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" strokeLinecap="round" /></svg>,
};

// ============================================================================
// KOMPONENTY UI
// ============================================================================
const MaterialSwatch = ({ material, selected, onClick }) => {
  const isWood = material.texture === 'wood';
  return (
    <button onClick={onClick} className={`group relative flex flex-col items-center p-2 sm:p-3 rounded-xl sm:rounded-2xl transition-all duration-200 ${selected ? 'bg-amber-50 ring-2 ring-amber-700 shadow-md' : 'bg-white hover:bg-stone-50 hover:shadow-md border border-stone-200'}`}>
      <div className="relative">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl shadow-inner border border-stone-200 ${isWood ? 'overflow-hidden' : ''}`} style={{ backgroundColor: material.color }}>
          {isWood && <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `repeating-linear-gradient(85deg, transparent, transparent 3px, rgba(80,50,20,0.15) 3px, rgba(80,50,20,0.15) 5px)` }} />}
        </div>
        {selected && <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-amber-700 rounded-full flex items-center justify-center text-white">{Icons.check}</div>}
      </div>
      <span className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs font-medium text-stone-700 text-center leading-tight">{material.name}</span>
      <span className="text-[9px] sm:text-[10px] text-stone-400">{material.pricePerM2} zł</span>
    </button>
  );
};

const DimensionInput = ({ label, value, onChange, min, max, step, unit = 'mm', presets = [] }) => (
  <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-stone-200 shadow-sm">
    <div className="flex justify-between items-center mb-2 sm:mb-3">
      <label className="text-sm font-medium text-stone-600">{label}</label>
      <div className="flex items-center bg-stone-100 rounded-lg sm:rounded-xl overflow-hidden">
        <input type="number" value={value} onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value))))} min={min} max={max} step={step} className="w-16 sm:w-20 px-2 sm:px-3 py-1.5 sm:py-2 bg-transparent text-right text-stone-800 font-medium focus:outline-none text-sm" />
        <span className="pr-2 sm:pr-3 text-xs sm:text-sm text-stone-400">{unit}</span>
      </div>
    </div>
    <input type="range" value={value} onChange={(e) => onChange(Number(e.target.value))} min={min} max={max} step={step} className="w-full h-1.5 bg-stone-200 rounded-full appearance-none cursor-pointer" style={{ background: `linear-gradient(to right, #92400e ${((value - min) / (max - min)) * 100}%, #e7e5e4 0%)` }} />
    {presets.length > 0 && (
      <div className="flex gap-1 sm:gap-1.5 mt-2 sm:mt-3 flex-wrap">
        {presets.map((preset) => (
          <button key={preset} onClick={() => onChange(preset)} className={`px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded-full transition-all ${value === preset ? 'bg-amber-700 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>{preset}</button>
        ))}
      </div>
    )}
  </div>
);

const OptionSelector = ({ options, value, onChange, columns = 1 }) => (
  <div className={`grid gap-2 ${columns === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
    {options.map((option) => (
      <button key={option.id} onClick={() => onChange(option.id)} className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl text-left transition-all flex items-center justify-between ${value === option.id ? 'bg-amber-50 border-2 border-amber-700 shadow-sm' : 'bg-white border border-stone-200 hover:border-stone-300 hover:shadow-sm'}`}>
        <span className={`text-xs sm:text-sm font-medium ${value === option.id ? 'text-amber-900' : 'text-stone-700'}`}>{option.name}</span>
        <span className={`text-[10px] sm:text-xs ${value === option.id ? 'text-amber-700' : 'text-stone-400'}`}>
          {option.price !== undefined ? `+${option.price} zł` : option.priceAdd !== undefined ? (option.priceAdd === 0 ? 'w cenie' : `+${option.priceAdd} zł`) : option.pricePerM !== undefined ? `${option.pricePerM} zł/m` : ''}
        </span>
      </button>
    ))}
  </div>
);

const Section = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
        <h3 className="text-sm sm:text-base font-semibold text-stone-800">{title}</h3>
        <div className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>{Icons.expand}</div>
      </button>
      {isOpen && <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1 sm:pt-2">{children}</div>}
    </div>
  );
};

// ============================================================================
// PODGLĄD SZAFKI - POPRAWIONY!
// ============================================================================
const CabinetPreview = ({ config }) => {
  const { width, height, depth, material, frontMaterial, shelves, hasFronts, legs, type } = config;
  
  const mat = MATERIALS.find(m => m.id === material);
  const frontMat = MATERIALS.find(m => m.id === frontMaterial) || mat;
  const leg = LEG_OPTIONS.find(l => l.id === legs);
  const cabinetType = CABINET_TYPES.find(t => t.id === type);
  
  // Sprawdź kategorię szafki
  const isTop = cabinetType?.category === 'górne' || type.includes('top');
  const isTall = cabinetType?.category === 'słupki' || type.includes('tall');
  const isBottom = !isTop && !isTall;
  
  // Wymiary podglądu - dostosowane do typu
  const maxW = 260;
  const maxH = isTall ? 320 : 240;
  
  // Skalowanie proporcjonalne
  const scale = Math.min(maxW / width, maxH / height) * 0.55;
  const w = width * scale;
  const h = height * scale;
  const d = depth * scale * 0.25;
  
  // Nóżki tylko dla dolnych i słupków
  const showLegs = isBottom || isTall;
  const legH = showLegs ? (leg?.height || 0) * scale * 0.35 : 0;
  
  // Blat nad szafką dolną
  const showCountertop = isBottom;
  const countertopH = showCountertop ? 12 : 0;
  
  // Ściana za szafką górną
  const showWallMount = isTop;
  
  // Pozycja
  const offX = (maxW - w) / 2 + d/2;
  const offY = showWallMount ? 30 : (maxH - h - legH - countertopH) / 2 + 10;
  
  // Kolory
  const baseColor = mat?.color || '#E8DFD0';
  const frontColor = hasFronts ? (frontMat?.color || baseColor) : baseColor;
  
  // Funkcja rozjaśniania/ciemnienia
  const adjustColor = (hex, percent) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, Math.max(0, (num >> 16) + amt));
    const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
    const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
  };
  
  // Półki wewnętrzne (widoczne gdy brak frontów)
  const shelfPositions = [];
  if (shelves > 0 && !hasFronts) {
    const spacing = h / (shelves + 1);
    for (let i = 1; i <= shelves; i++) {
      shelfPositions.push(spacing * i);
    }
  }
  
  // Podział drzwi dla wysokich szafek
  const doorDivisions = isTall ? 2 : (width > 500 ? 2 : 1);
  
  return (
    <div className="bg-gradient-to-b from-stone-50 to-stone-100 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-stone-200">
      {/* Nazwa typu */}
      <div className="text-center mb-2 sm:mb-3">
        <span className="inline-block px-3 py-1 bg-white rounded-full text-xs sm:text-sm font-medium text-stone-600 border border-stone-200">
          {cabinetType?.name || 'Szafka'}
        </span>
      </div>
      
      <svg viewBox={`0 0 ${maxW} ${maxH}`} className="w-full h-auto" style={{ maxHeight: isTall ? '280px' : '200px' }}>
        <defs>
          {/* Gradient frontu */}
          <linearGradient id="frontGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={adjustColor(frontColor, 10)} />
            <stop offset="100%" stopColor={adjustColor(frontColor, -10)} />
          </linearGradient>
          {/* Gradient boku */}
          <linearGradient id="sideGrad" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={adjustColor(baseColor, -10)} />
            <stop offset="100%" stopColor={adjustColor(baseColor, -25)} />
          </linearGradient>
          {/* Gradient góry */}
          <linearGradient id="topGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={baseColor} />
            <stop offset="100%" stopColor={adjustColor(baseColor, 15)} />
          </linearGradient>
          {/* Gradient blatu */}
          <linearGradient id="counterGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#a8a29e" />
            <stop offset="100%" stopColor="#d6d3d1" />
          </linearGradient>
          {/* Cień */}
          <filter id="shadow" x="-20%" y="-10%" width="140%" height="130%">
            <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#78716c" floodOpacity="0.15"/>
          </filter>
        </defs>
        
        {/* Cień na podłodze (tylko dla dolnych i słupków) */}
        {(isBottom || isTall) && (
          <ellipse
            cx={offX + w/2 - d/4}
            cy={offY + h + legH + 8}
            rx={w/2 + 10}
            ry={5}
            fill="#78716c"
            opacity="0.1"
          />
        )}
        
        {/* Mocowanie ścienne (dla górnych) */}
        {showWallMount && (
          <g>
            <rect x={offX - d - 5} y={offY - d - 15} width={w + d + 10} height={maxH - 20} fill="#f5f5f4" stroke="#e7e5e4" strokeWidth={1} rx={2} />
            <text x={offX + w/2 - d/2} y={offY - d - 5} textAnchor="middle" fill="#a8a29e" fontSize="8">ściana</text>
          </g>
        )}
        
        <g filter="url(#shadow)">
          {/* Nóżki (tylko dolne i słupki) */}
          {showLegs && leg?.id !== 'none' && leg?.id !== 'plinth' && legH > 0 && (
            <>
              <rect x={offX + 6} y={offY + h} width={5} height={legH} fill="#a8a29e" rx={1} />
              <rect x={offX + w - 11} y={offY + h} width={5} height={legH} fill="#a8a29e" rx={1} />
            </>
          )}
          
          {/* Cokół */}
          {showLegs && leg?.id === 'plinth' && legH > 0 && (
            <rect x={offX + 3} y={offY + h} width={w - 6} height={legH} fill={adjustColor(baseColor, -15)} stroke="#d6d3d1" strokeWidth={1} rx={1} />
          )}
          
          {/* Plecy szafki */}
          <rect 
            x={offX - d + 2} 
            y={offY - d + 2} 
            width={w - 4} 
            height={h - 4} 
            fill="#fafaf9" 
            stroke="#e7e5e4" 
            strokeWidth={1}
          />
          
          {/* Bok lewy */}
          <polygon
            points={`${offX},${offY + h} ${offX},${offY} ${offX - d},${offY - d} ${offX - d},${offY + h - d}`}
            fill="url(#sideGrad)"
            stroke="#d6d3d1"
            strokeWidth={1.5}
          />
          
          {/* Góra szafki */}
          <polygon
            points={`${offX},${offY} ${offX + w},${offY} ${offX + w - d},${offY - d} ${offX - d},${offY - d}`}
            fill="url(#topGrad)"
            stroke="#d6d3d1"
            strokeWidth={1.5}
          />
          
          {/* Front */}
          <rect
            x={offX}
            y={offY}
            width={w}
            height={h}
            fill="url(#frontGrad)"
            stroke="#c7c2bc"
            strokeWidth={1.5}
            rx={2}
          />
          
          {/* Półki wewnętrzne (bez frontów) */}
          {!hasFronts && shelfPositions.map((pos, i) => (
            <rect 
              key={i} 
              x={offX + 4} 
              y={offY + pos - 2} 
              width={w - 8} 
              height={4} 
              fill={baseColor} 
              stroke="#d6d3d1" 
              strokeWidth={0.5}
            />
          ))}
          
          {/* Podział drzwi */}
          {hasFronts && doorDivisions === 2 && (
            <line 
              x1={offX + w/2} 
              y1={offY + 3} 
              x2={offX + w/2} 
              y2={offY + h - 3} 
              stroke="#a8a29e" 
              strokeWidth={1.5}
            />
          )}
          
          {/* Podział poziomy dla słupków */}
          {hasFronts && isTall && (
            <line 
              x1={offX + 3} 
              y1={offY + h * 0.4} 
              x2={offX + w - 3} 
              y2={offY + h * 0.4} 
              stroke="#a8a29e" 
              strokeWidth={1.5}
            />
          )}
          
          {/* Uchwyty */}
          {hasFronts && (
            doorDivisions === 2 ? (
              <>
                <rect x={offX + w/2 - 22} y={offY + h/2 - 2.5} width={16} height={5} fill="#78716c" rx={2.5} />
                <rect x={offX + w/2 + 6} y={offY + h/2 - 2.5} width={16} height={5} fill="#78716c" rx={2.5} />
              </>
            ) : (
              <rect x={offX + w - 24} y={offY + h/2 - 2.5} width={16} height={5} fill="#78716c" rx={2.5} />
            )
          )}
          
          {/* Blat (tylko dolne) */}
          {showCountertop && (
            <>
              <polygon
                points={`
                  ${offX - 3},${offY - 2}
                  ${offX + w + 3},${offY - 2}
                  ${offX + w - d + 3},${offY - d - countertopH}
                  ${offX - d - 3},${offY - d - countertopH}
                `}
                fill="url(#counterGrad)"
                stroke="#a8a29e"
                strokeWidth={1}
              />
              <rect
                x={offX - 3}
                y={offY - countertopH - 2}
                width={w + 6}
                height={countertopH}
                fill="#d6d3d1"
                stroke="#a8a29e"
                strokeWidth={1}
              />
            </>
          )}
        </g>
      </svg>
      
      {/* Wymiary */}
      <div className="mt-2 sm:mt-3 text-center text-xs sm:text-sm text-stone-500">
        {width} × {height} × {depth} mm
      </div>
      
      {/* Materiały */}
      <div className="mt-3 space-y-1.5 sm:space-y-2">
        <div className="flex items-center gap-2 sm:gap-3 bg-white rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-2 border border-stone-200">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md sm:rounded-lg border border-stone-200 flex-shrink-0" style={{ backgroundColor: mat?.color }} />
          <div className="flex-1 min-w-0">
            <div className="text-[9px] sm:text-[10px] text-stone-400">Korpus</div>
            <div className="text-[11px] sm:text-xs font-medium text-stone-700 truncate">{mat?.name}</div>
          </div>
        </div>
        {hasFronts && (
          <div className="flex items-center gap-2 sm:gap-3 bg-white rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-2 border border-stone-200">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md sm:rounded-lg border border-stone-200 flex-shrink-0" style={{ backgroundColor: frontMat?.color }} />
            <div className="flex-1 min-w-0">
              <div className="text-[9px] sm:text-[10px] text-stone-400">Front</div>
              <div className="text-[11px] sm:text-xs font-medium text-stone-700 truncate">{frontMat?.name}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// MODAL ZAMÓWIENIA
// ============================================================================
const OrderModal = ({ isOpen, onClose, config, total, breakdown }) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  
  const cabinetType = CABINET_TYPES.find(t => t.id === config.type);
  const mat = MATERIALS.find(m => m.id === config.material);
  const frontMat = MATERIALS.find(m => m.id === config.frontMaterial) || mat;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    
    const orderData = {
      customer: form,
      config: {
        type: cabinetType?.name,
        dimensions: `${config.width} × ${config.height} × ${config.depth} mm`,
        material: mat?.name,
        frontMaterial: config.hasFronts ? frontMat?.name : 'Brak',
        shelves: config.shelves,
        backType: BACK_TYPES.find(b => b.id === config.backType)?.name,
        edgeType: EDGE_TYPES.find(e => e.id === config.edgeType)?.name,
        legs: LEG_OPTIONS.find(l => l.id === config.legs)?.name,
        hinges: config.hasFronts ? HINGE_OPTIONS.find(h => h.id === config.hinges)?.name : 'Brak',
      },
      breakdown,
      total,
      date: new Date().toLocaleString('pl-PL'),
    };
    
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      
      if (res.ok) {
        setSent(true);
      } else {
        const subject = encodeURIComponent(`Zamówienie szafki - ${form.name}`);
        const body = encodeURIComponent(`
Nowe zamówienie z konfiguratora:

DANE KLIENTA:
Imię i nazwisko: ${form.name}
Email: ${form.email}
Telefon: ${form.phone}
Uwagi: ${form.notes || 'Brak'}

KONFIGURACJA:
Typ: ${cabinetType?.name}
Wymiary: ${config.width} × ${config.height} × ${config.depth} mm
Materiał korpusu: ${mat?.name}
Materiał frontu: ${config.hasFronts ? frontMat?.name : 'Brak frontów'}
Półki: ${config.shelves}

CENA: ${total} zł netto
        `);
        window.open(`mailto:${CONFIG.companyEmail}?subject=${subject}&body=${body}`);
        setSent(true);
      }
    } catch {
      window.open(`mailto:${CONFIG.companyEmail}`);
      setSent(true);
    }
    
    setSending(false);
  };
  
  const generatePDF = () => {
    const content = `
ZAMÓWIENIE - ${CONFIG.companyName}
Data: ${new Date().toLocaleString('pl-PL')}

KONFIGURACJA SZAFKI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Typ: ${cabinetType?.name}
Wymiary: ${config.width} × ${config.height} × ${config.depth} mm

Materiał korpusu: ${mat?.name} (${mat?.code})
Materiał frontu: ${config.hasFronts ? `${frontMat?.name} (${frontMat?.code})` : 'Brak frontów'}

Półki: ${config.shelves} szt.
Plecy: ${BACK_TYPES.find(b => b.id === config.backType)?.name}
Obrzeża: ${EDGE_TYPES.find(e => e.id === config.edgeType)?.name}
Nóżki: ${LEG_OPTIONS.find(l => l.id === config.legs)?.name}
${config.hasFronts ? `Zawiasy: ${HINGE_OPTIONS.find(h => h.id === config.hinges)?.name}` : ''}

WYCENA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${Object.entries(breakdown).filter(([,v]) => v > 0).map(([k,v]) => `${k}: ${v} zł`).join('\n')}

RAZEM: ${total} zł netto

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${CONFIG.companyName}
${CONFIG.companyPhone}
${CONFIG.companyEmail}
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zamowienie-szafka-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-stone-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-lg sm:text-xl font-bold text-stone-800">
            {sent ? '✓ Wysłane!' : 'Złóż zamówienie'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">{Icons.close}</button>
        </div>
        
        <div className="p-4 sm:p-6">
          {sent ? (
            <div className="text-center py-6 sm:py-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-stone-800 mb-2">Dziękujemy!</h3>
              <p className="text-sm sm:text-base text-stone-500 mb-6">Skontaktujemy się w ciągu 24h.</p>
              <button onClick={generatePDF} className="flex items-center gap-2 mx-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors text-sm sm:text-base">
                {Icons.download}
                <span>Pobierz podsumowanie</span>
              </button>
            </div>
          ) : (
            <>
              {/* Podsumowanie */}
              <div className="bg-stone-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6">
                <h3 className="font-semibold text-stone-700 mb-2 sm:mb-3 text-sm sm:text-base">Podsumowanie</h3>
                <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                  <div><span className="text-stone-400">Typ:</span> <span className="text-stone-700">{cabinetType?.name}</span></div>
                  <div><span className="text-stone-400">Wymiary:</span> <span className="text-stone-700">{config.width}×{config.height}×{config.depth}</span></div>
                  <div><span className="text-stone-400">Korpus:</span> <span className="text-stone-700">{mat?.name}</span></div>
                  <div><span className="text-stone-400">Front:</span> <span className="text-stone-700">{config.hasFronts ? frontMat?.name : 'Brak'}</span></div>
                </div>
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-stone-200 flex justify-between items-center">
                  <span className="text-stone-500 text-sm">Cena netto:</span>
                  <span className="text-xl sm:text-2xl font-bold text-amber-800">{total} zł</span>
                </div>
              </div>
              
              {/* Formularz */}
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-stone-600 mb-1">Imię i nazwisko *</label>
                  <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-stone-50 border border-stone-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-sm sm:text-base" placeholder="Jan Kowalski" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-stone-600 mb-1">Email *</label>
                    <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-stone-50 border border-stone-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-sm sm:text-base" placeholder="jan@email.pl" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-stone-600 mb-1">Telefon *</label>
                    <input type="tel" required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-stone-50 border border-stone-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-sm sm:text-base" placeholder="+48 123 456 789" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-stone-600 mb-1">Uwagi</label>
                  <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-stone-50 border border-stone-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none text-sm sm:text-base" placeholder="Dodatkowe informacje..." />
                </div>
                
                <div className="flex gap-2 sm:gap-3 pt-2 sm:pt-4">
                  <button type="button" onClick={generatePDF} className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg sm:rounded-xl transition-colors text-sm sm:text-base">
                    {Icons.download}
                    <span className="hidden sm:inline">Pobierz</span> PDF
                  </button>
                  <button type="submit" disabled={sending} className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-amber-700 hover:bg-amber-800 disabled:bg-amber-400 text-white font-semibold rounded-lg sm:rounded-xl transition-colors text-sm sm:text-base">
                    {sending ? <span className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : Icons.send}
                    <span>{sending ? 'Wysyłam...' : 'Wyślij'}</span>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PANEL KONFIGURACJI
// ============================================================================
const ConfigPanel = ({ config, setConfig }) => {
  const updateConfig = (key, value) => setConfig(prev => ({ ...prev, [key]: value }));
  const currentType = CABINET_TYPES.find(t => t.id === config.type);
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const filteredMaterials = categoryFilter === 'all' ? MATERIALS : MATERIALS.filter(m => m.category === categoryFilter);
  
  const handleTypeChange = (typeId) => {
    const newType = CABINET_TYPES.find(t => t.id === typeId);
    if (newType) {
      setConfig(prev => ({
        ...prev,
        type: typeId,
        width: newType.defaultWidth,
        height: newType.defaultHeight,
        depth: newType.defaultDepth,
        legs: newType.hasLegs === false ? 'none' : prev.legs,
      }));
    }
  };
  
  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Typ szafki */}
      <Section title="Typ szafki">
        {CABINET_CATEGORIES.map((cat) => {
          const typesInCat = CABINET_TYPES.filter(t => t.category === cat.id);
          if (typesInCat.length === 0) return null;
          return (
            <div key={cat.id} className="mb-3 sm:mb-4">
              <div className="text-[10px] sm:text-xs font-medium text-stone-400 uppercase tracking-wider mb-1.5 sm:mb-2">{cat.name}</div>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {typesInCat.map((type) => (
                  <button key={type.id} onClick={() => handleTypeChange(type.id)} className={`flex flex-col items-center p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all ${config.type === type.id ? 'bg-amber-700 text-white shadow-lg' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
                    <div className="mb-0.5 sm:mb-1">{Icons[cat.icon] || Icons.bottom}</div>
                    <span className="text-[10px] sm:text-xs font-medium text-center leading-tight">{type.name}</span>
                    <span className={`text-[9px] sm:text-[10px] mt-0.5 ${config.type === type.id ? 'text-amber-200' : 'text-stone-400'}`}>od {type.basePrice} zł</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </Section>
      
      {/* Materiał korpusu */}
      <Section title="Materiał korpusu">
        <div className="flex gap-1.5 sm:gap-2 mb-2 sm:mb-3 flex-wrap">
          {MATERIAL_CATEGORIES.map((cat) => (
            <button key={cat.id} onClick={() => setCategoryFilter(cat.id)} className={`px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded-full transition-all ${categoryFilter === cat.id ? 'bg-amber-700 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>{cat.name}</button>
          ))}
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 sm:gap-2">
          {filteredMaterials.map((mat) => (
            <MaterialSwatch key={mat.id} material={mat} selected={config.material === mat.id} onClick={() => updateConfig('material', mat.id)} />
          ))}
        </div>
      </Section>
      
      {/* Fronty */}
      <Section title="Fronty">
        <label className="flex items-center gap-3 mb-3 sm:mb-4 cursor-pointer">
          <div onClick={() => updateConfig('hasFronts', !config.hasFronts)} className={`w-11 sm:w-12 h-6 sm:h-7 rounded-full transition-colors relative cursor-pointer ${config.hasFronts ? 'bg-amber-700' : 'bg-stone-300'}`}>
            <div className={`absolute top-0.5 sm:top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${config.hasFronts ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'}`} />
          </div>
          <span className="text-xs sm:text-sm font-medium text-stone-700">Dodaj fronty</span>
        </label>
        {config.hasFronts && (
          <div>
            <p className="text-xs sm:text-sm text-stone-500 mb-2 sm:mb-3">Kolor frontów:</p>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 sm:gap-2">
              {MATERIALS.map((mat) => (
                <MaterialSwatch key={mat.id} material={mat} selected={config.frontMaterial === mat.id} onClick={() => updateConfig('frontMaterial', mat.id)} />
              ))}
            </div>
          </div>
        )}
      </Section>
      
      {/* Wymiary */}
      <Section title="Wymiary">
        <div className="space-y-3 sm:space-y-4">
          <DimensionInput label="Szerokość" value={config.width} onChange={(v) => updateConfig('width', v)} min={currentType?.minWidth || 150} max={currentType?.maxWidth || 1200} step={10} presets={[300, 400, 600, 800]} />
          <DimensionInput label="Wysokość" value={config.height} onChange={(v) => updateConfig('height', v)} min={currentType?.minHeight || 200} max={currentType?.maxHeight || 2200} step={10} presets={currentType?.hasLegs === false ? [300, 400, 600, 720] : [720, 800, 1400, 2000]} />
          <DimensionInput label="Głębokość" value={config.depth} onChange={(v) => updateConfig('depth', v)} min={currentType?.minDepth || 200} max={currentType?.maxDepth || 700} step={10} presets={[300, 400, 510, 600]} />
        </div>
      </Section>
      
      {/* Półki */}
      <Section title="Półki" defaultOpen={false}>
        <div className="flex items-center gap-1.5 sm:gap-2">
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => updateConfig('shelves', n)} className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl font-medium transition-all text-sm sm:text-base ${config.shelves === n ? 'bg-amber-700 text-white shadow-md' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>{n}</button>
          ))}
        </div>
      </Section>
      
      {/* Plecy */}
      <Section title="Materiał pleców" defaultOpen={false}>
        <OptionSelector options={BACK_TYPES} value={config.backType} onChange={(v) => updateConfig('backType', v)} />
      </Section>
      
      {/* Obrzeża */}
      <Section title="Obrzeża" defaultOpen={false}>
        <OptionSelector options={EDGE_TYPES} value={config.edgeType} onChange={(v) => updateConfig('edgeType', v)} columns={2} />
      </Section>
      
      {/* Nóżki */}
      {currentType?.hasLegs !== false && (
        <Section title="Nóżki / Cokół" defaultOpen={false}>
          <OptionSelector options={LEG_OPTIONS} value={config.legs} onChange={(v) => updateConfig('legs', v)} />
        </Section>
      )}
      
      {/* Zawiasy */}
      {config.hasFronts && (
        <Section title="Zawiasy" defaultOpen={false}>
          <OptionSelector options={HINGE_OPTIONS} value={config.hinges} onChange={(v) => updateConfig('hinges', v)} />
        </Section>
      )}
    </div>
  );
};

// ============================================================================
// PODSUMOWANIE CENY
// ============================================================================
const PriceSummary = ({ config, onOrder }) => {
  const { breakdown, total } = useCalculatePrice(config);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const labels = { base: 'Cena bazowa', corpus: 'Korpus', fronts: 'Fronty', back: 'Plecy', edges: 'Obrzeża', legs: 'Nóżki', hinges: 'Zawiasy', shelves: 'Półki' };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-stone-200 shadow-2xl z-40">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          {/* Lewa strona - szczegóły (ukryte na mobile) */}
          <div className="hidden sm:flex items-center gap-6">
            <button onClick={() => setShowBreakdown(!showBreakdown)} className="flex items-center gap-2 text-stone-500 hover:text-stone-700 transition-colors">
              <div className={`transform transition-transform ${showBreakdown ? 'rotate-180' : ''}`}>{Icons.expand}</div>
              <span className="text-sm font-medium">Szczegóły</span>
            </button>
            <div className="hidden md:flex items-center gap-4 text-sm text-stone-400">
              <span>{CONFIG.deliveryDays}</span>
              <span>•</span>
              <span>Darmowa dostawa</span>
            </div>
          </div>
          
          {/* Prawa strona - cena i przycisk */}
          <div className="flex items-center gap-3 sm:gap-6 w-full sm:w-auto justify-between sm:justify-end">
            <div className="text-left sm:text-right">
              <div className="text-[10px] sm:text-xs text-stone-400 uppercase tracking-wider">Razem</div>
              <div className="text-2xl sm:text-3xl font-bold text-amber-800">{total.toLocaleString('pl-PL')} <span className="text-sm sm:text-lg font-normal text-stone-400">zł</span></div>
            </div>
            <button onClick={() => onOrder(breakdown, total)} className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-amber-700/25 text-sm sm:text-base">
              {Icons.send}
              <span className="hidden xs:inline">Złóż</span> <span>zamówienie</span>
            </button>
          </div>
        </div>
        
        {showBreakdown && (
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-stone-200 grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
            {Object.entries(breakdown).map(([key, value]) => value > 0 && (
              <div key={key} className="flex justify-between text-xs sm:text-sm bg-stone-50 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
                <span className="text-stone-500">{labels[key]}</span>
                <span className="font-medium text-stone-700">{value} zł</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// GŁÓWNY KOMPONENT
// ============================================================================
export default function FurnitureCalculator() {
  const [config, setConfig] = useState({
    type: 'bottom',
    width: 600,
    height: 720,
    depth: 510,
    material: 'u702',
    frontMaterial: 'u702',
    hasFronts: true,
    backType: 'hdf',
    edgeType: '08',
    legs: 'basic10',
    hinges: 'softclose',
    shelves: 1,
  });
  
  const [orderModal, setOrderModal] = useState({ open: false, breakdown: {}, total: 0 });
  
  const handleOrder = (breakdown, total) => {
    setOrderModal({ open: true, breakdown, total });
  };
  
  return (
    <div className="min-h-screen bg-stone-100 pb-24 sm:pb-28">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-600 to-amber-800 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold text-base sm:text-lg">M</div>
              <div>
                <h1 className="font-semibold text-stone-800 text-sm sm:text-base">{CONFIG.companyName}</h1>
                <p className="text-[10px] sm:text-xs text-stone-400">Konfigurator szafek</p>
              </div>
            </div>
            <a href={`tel:${CONFIG.companyPhone}`} className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-stone-500 hover:text-amber-700 transition-colors">
              {Icons.info}
              <span className="hidden sm:inline">{CONFIG.companyPhone}</span>
            </a>
          </div>
        </div>
      </header>
      
      {/* Content */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Podgląd - na mobile NA GÓRZE */}
          <div className="lg:col-span-1 lg:sticky lg:top-20 lg:self-start order-1 lg:order-1">
            <CabinetPreview config={config} />
          </div>
          
          {/* Konfiguracja */}
          <div className="lg:col-span-2 order-2 lg:order-2">
            <ConfigPanel config={config} setConfig={setConfig} />
          </div>
        </div>
      </main>
      
      <PriceSummary config={config} onOrder={handleOrder} />
      
      <OrderModal 
        isOpen={orderModal.open} 
        onClose={() => setOrderModal({ ...orderModal, open: false })} 
        config={config} 
        breakdown={orderModal.breakdown} 
        total={orderModal.total} 
      />
    </div>
  );
}

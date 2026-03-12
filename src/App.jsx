import React, { useState, useMemo, useEffect } from 'react';

// ============================================================================
// GOOGLE SHEETS CONFIG - WKLEJ SWOJE LINKI
// ============================================================================
const SHEETS_CONFIG = {
  // Zamień TWOJ_ID na ID swojego arkusza Google Sheets
  // Format linku: https://docs.google.com/spreadsheets/d/TWOJ_ID/export?format=csv&gid=NUMER
  // gid=0 to pierwsza zakładka, gid=1 druga, itd.
  
  materials: 'https://docs.google.com/spreadsheets/d/1GUie3q6IBS16ZOEsWlPdmHI7ZGwurDE9QLFFyNyWmBQ/edit?gid=0#gid=0',
  cabinets: 'https://docs.google.com/spreadsheets/d/1GUie3q6IBS16ZOEsWlPdmHI7ZGwurDE9QLFFyNyWmBQ/edit?gid=1287459572#gid=1287459572',
  options: 'https://docs.google.com/spreadsheets/d/1GUie3q6IBS16ZOEsWlPdmHI7ZGwurDE9QLFFyNyWmBQ/edit?gid=1579806458#gid=1579806458',
  config: 'https://docs.google.com/spreadsheets/d/1GUie3q6IBS16ZOEsWlPdmHI7ZGwurDE9QLFFyNyWmBQ/edit?gid=250968456#gid=250968456',
  
  // ⬇️ ZMIEŃ NA true GDY MASZ PRAWDZIWE LINKI ⬇️
  useGoogleSheets: false,
  
  // Cache w minutach
  cacheMinutes: 5,
};

// ============================================================================
// DOMYŚLNE DANE (używane gdy Google Sheets wyłączony)
// ============================================================================
const DEFAULT_CONFIG = {
  companyName: 'Meble Na Wymiar',
  companyEmail: 'zamowienia@twojafirma.pl',
  companyPhone: '+48 123 456 789',
  deliveryDays: '5-7 dni roboczych',
};

const DEFAULT_MATERIALS = [
  { id: 'u702', code: 'U702', name: 'Kaszmir', color: '#E8DFD0', pricePerM2: 180, category: 'uni', texture: 'solid' },
  { id: 'u104', code: 'U104', name: 'Biały alpejski', color: '#FAFAFA', pricePerM2: 160, category: 'uni', texture: 'solid' },
  { id: 'h3303', code: 'H3303', name: 'Dąb Hamilton', color: '#C4A77D', pricePerM2: 220, category: 'drewno', texture: 'wood' },
  { id: 'h3734', code: 'H3734', name: 'Dąb Gladstone', color: '#8B7355', pricePerM2: 240, category: 'drewno', texture: 'wood' },
  { id: 'h3406', code: 'H3406', name: 'Orzech Hickory', color: '#6B4423', pricePerM2: 260, category: 'drewno', texture: 'wood' },
  { id: 'u630', code: 'U630', name: 'Szałwia', color: '#9CAF88', pricePerM2: 190, category: 'uni', texture: 'solid' },
  { id: 'u748', code: 'U748', name: 'Mokka', color: '#5C4033', pricePerM2: 185, category: 'uni', texture: 'solid' },
  { id: 'u963', code: 'U963', name: 'Antracyt', color: '#383838', pricePerM2: 195, category: 'uni', texture: 'solid' },
  { id: 'f638', code: 'F638', name: 'Beton jasny', color: '#A8A8A8', pricePerM2: 210, category: 'kamień', texture: 'solid' },
  { id: 'f204', code: 'F204', name: 'Marmur Carrara', color: '#E8E8E8', pricePerM2: 280, category: 'kamień', texture: 'solid' },
];

const DEFAULT_CABINETS = [
  { id: 'bottom', name: 'Dolna standardowa', category: 'dolne', basePrice: 180, defaultWidth: 600, defaultHeight: 720, defaultDepth: 510, minWidth: 200, maxWidth: 1200, minHeight: 400, maxHeight: 900, minDepth: 300, maxDepth: 700, hasLegs: true },
  { id: 'bottom-sink', name: 'Zlewozmywakowa', category: 'dolne', basePrice: 200, defaultWidth: 800, defaultHeight: 720, defaultDepth: 510, minWidth: 600, maxWidth: 1200, minHeight: 400, maxHeight: 900, minDepth: 300, maxDepth: 700, hasLegs: true },
  { id: 'bottom-drawer', name: 'Z szufladami', category: 'dolne', basePrice: 280, defaultWidth: 600, defaultHeight: 720, defaultDepth: 510, minWidth: 300, maxWidth: 900, minHeight: 400, maxHeight: 900, minDepth: 300, maxDepth: 700, hasLegs: true },
  { id: 'top', name: 'Górna standardowa', category: 'górne', basePrice: 120, defaultWidth: 600, defaultHeight: 400, defaultDepth: 350, minWidth: 200, maxWidth: 1200, minHeight: 200, maxHeight: 900, minDepth: 200, maxDepth: 400, hasLegs: false },
  { id: 'top-hood', name: 'Okapowa', category: 'górne', basePrice: 140, defaultWidth: 600, defaultHeight: 300, defaultDepth: 350, minWidth: 500, maxWidth: 900, minHeight: 200, maxHeight: 400, minDepth: 200, maxDepth: 400, hasLegs: false },
  { id: 'top-glass', name: 'Z witryną', category: 'górne', basePrice: 220, defaultWidth: 400, defaultHeight: 720, defaultDepth: 350, minWidth: 300, maxWidth: 600, minHeight: 400, maxHeight: 900, minDepth: 200, maxDepth: 400, hasLegs: false },
  { id: 'tall', name: 'Słupek wysoki', category: 'słupki', basePrice: 350, defaultWidth: 600, defaultHeight: 2000, defaultDepth: 580, minWidth: 400, maxWidth: 800, minHeight: 1400, maxHeight: 2400, minDepth: 400, maxDepth: 650, hasLegs: true },
  { id: 'tall-oven', name: 'Na piekarnik', category: 'słupki', basePrice: 380, defaultWidth: 600, defaultHeight: 2000, defaultDepth: 580, minWidth: 560, maxWidth: 650, minHeight: 1400, maxHeight: 2400, minDepth: 500, maxDepth: 620, hasLegs: true },
  { id: 'tall-fridge', name: 'Zabudowa lodówki', category: 'słupki', basePrice: 320, defaultWidth: 600, defaultHeight: 2000, defaultDepth: 580, minWidth: 560, maxWidth: 700, minHeight: 1800, maxHeight: 2400, minDepth: 550, maxDepth: 650, hasLegs: true },
];

const DEFAULT_OPTIONS = {
  legs: [
    { id: 'none', name: 'Bez nóżek', price: 0, height: 0 },
    { id: 'basic10', name: 'Nóżki 10cm', price: 8, height: 100 },
    { id: 'basic15', name: 'Nóżki 15cm', price: 12, height: 150 },
    { id: 'plinth', name: 'Cokół 10cm', price: 15, height: 100 },
  ],
  hinges: [
    { id: 'standard', name: 'Standardowe', price: 8 },
    { id: 'softclose', name: 'Cichozamykające', price: 18 },
    { id: 'push', name: 'Push-to-open', price: 28 },
  ],
  back: [
    { id: 'hdf', name: 'HDF 3mm biały', priceAdd: 0 },
    { id: 'hdf-decor', name: 'HDF 3mm w dekorze', priceAdd: 25 },
    { id: 'lam', name: 'Laminat 8mm', priceAdd: 45 },
    { id: 'lam18', name: 'Laminat 18mm', priceAdd: 85 },
  ],
  edge: [
    { id: '04', name: 'ABS 0.4mm', pricePerM: 8 },
    { id: '08', name: 'ABS 0.8mm', pricePerM: 12 },
    { id: '2abs', name: 'ABS 2mm', pricePerM: 22 },
    { id: '2pvc', name: 'PVC 2mm', pricePerM: 28 },
  ],
};

const CABINET_CATEGORIES = [
  { id: 'dolne', name: 'Szafki dolne', icon: 'bottom' },
  { id: 'górne', name: 'Szafki górne', icon: 'top' },
  { id: 'słupki', name: 'Słupki', icon: 'tall' },
];

const MATERIAL_CATEGORIES = [
  { id: 'all', name: 'Wszystkie' },
  { id: 'uni', name: 'Jednolite' },
  { id: 'drewno', name: 'Drewno' },
  { id: 'kamień', name: 'Kamień' },
];

// ============================================================================
// PARSOWANIE CSV
// ============================================================================
const parseCSV = (csv) => {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  return lines.slice(1).map(line => {
    const values = line.match(/(".*?"|[^,]+)/g) || [];
    const obj = {};
    headers.forEach((header, i) => {
      let value = (values[i] || '').trim().replace(/^"|"$/g, '');
      if (!isNaN(value) && value !== '') value = Number(value);
      if (value === 'true') value = true;
      if (value === 'false') value = false;
      obj[header] = value;
    });
    return obj;
  });
};

// ============================================================================
// HOOK POBIERANIA DANYCH Z GOOGLE SHEETS
// ============================================================================
const useGoogleSheetsData = () => {
  const [data, setData] = useState({
    config: DEFAULT_CONFIG,
    materials: DEFAULT_MATERIALS,
    cabinets: DEFAULT_CABINETS,
    options: DEFAULT_OPTIONS,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!SHEETS_CONFIG.useGoogleSheets) {
      setData(prev => ({ ...prev, loading: false }));
      return;
    }

    const cacheKey = 'furniture-calc-data';
    const cacheTimeKey = 'furniture-calc-time';
    
    const cachedData = localStorage.getItem(cacheKey);
    const cachedTime = localStorage.getItem(cacheTimeKey);
    
    if (cachedData && cachedTime) {
      const age = (Date.now() - Number(cachedTime)) / 1000 / 60;
      if (age < SHEETS_CONFIG.cacheMinutes) {
        setData({ ...JSON.parse(cachedData), loading: false });
        return;
      }
    }

    const fetchAllData = async () => {
      try {
        const [materialsRes, cabinetsRes, optionsRes, configRes] = await Promise.all([
          fetch(SHEETS_CONFIG.materials).then(r => r.text()),
          fetch(SHEETS_CONFIG.cabinets).then(r => r.text()),
          fetch(SHEETS_CONFIG.options).then(r => r.text()),
          fetch(SHEETS_CONFIG.config).then(r => r.text()),
        ]);

        const materials = parseCSV(materialsRes);
        const cabinets = parseCSV(cabinetsRes);
        const optionsRaw = parseCSV(optionsRes);
        const configRaw = parseCSV(configRes);

        const options = {
          legs: optionsRaw.filter(o => o.type === 'legs'),
          hinges: optionsRaw.filter(o => o.type === 'hinges'),
          back: optionsRaw.filter(o => o.type === 'back'),
          edge: optionsRaw.filter(o => o.type === 'edge'),
        };

        const config = {};
        configRaw.forEach(row => { config[row.key] = row.value; });

        const newData = {
          config: { ...DEFAULT_CONFIG, ...config },
          materials: materials.length > 0 ? materials : DEFAULT_MATERIALS,
          cabinets: cabinets.length > 0 ? cabinets : DEFAULT_CABINETS,
          options: {
            legs: options.legs.length > 0 ? options.legs : DEFAULT_OPTIONS.legs,
            hinges: options.hinges.length > 0 ? options.hinges : DEFAULT_OPTIONS.hinges,
            back: options.back.length > 0 ? options.back : DEFAULT_OPTIONS.back,
            edge: options.edge.length > 0 ? options.edge : DEFAULT_OPTIONS.edge,
          },
          loading: false,
          error: null,
        };

        localStorage.setItem(cacheKey, JSON.stringify(newData));
        localStorage.setItem(cacheTimeKey, String(Date.now()));
        setData(newData);
      } catch (error) {
        console.error('Błąd pobierania z Google Sheets:', error);
        setData(prev => ({ ...prev, loading: false, error: 'Nie udało się pobrać danych. Używam offline.' }));
      }
    };

    fetchAllData();
  }, []);

  return data;
};

// ============================================================================
// HOOK KALKULACJI CENY
// ============================================================================
const useCalculatePrice = (config, materials, cabinets, options) => {
  return useMemo(() => {
    const { type, width, height, depth, material, frontMaterial, backType, edgeType, legs, hinges, shelves, hasFronts } = config;
    
    const widthM = width / 1000;
    const heightM = height / 1000;
    const depthM = depth / 1000;
    
    const corpusArea = 2 * heightM * depthM + 2 * widthM * depthM + shelves * widthM * depthM;
    const frontArea = hasFronts ? widthM * heightM : 0;
    const edgeLength = 2 * heightM + 2 * widthM + (shelves * 2 * depthM);
    
    const mat = materials.find(m => m.id === material);
    const frontMat = materials.find(m => m.id === frontMaterial) || mat;
    const back = options.back.find(b => b.id === backType);
    const edge = options.edge.find(e => e.id === edgeType);
    const leg = options.legs.find(l => l.id === legs);
    const hinge = options.hinges.find(h => h.id === hinges);
    const cabinetType = cabinets.find(t => t.id === type);
    
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
  }, [config, materials, cabinets, options]);
};

// ============================================================================
// HOOK SCROLL
// ============================================================================
const useScrolled = (threshold = 50) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > threshold);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);
  return scrolled;
};

// ============================================================================
// IKONY
// ============================================================================
const Icons = {
  bottom: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 sm:w-6 sm:h-6"><rect x="3" y="8" width="18" height="12" rx="1" /><line x1="12" y1="8" x2="12" y2="20" /><line x1="3" y1="4" x2="21" y2="4" strokeWidth="2" /></svg>,
  top: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 sm:w-6 sm:h-6"><rect x="3" y="4" width="18" height="12" rx="1" /><line x1="12" y1="4" x2="12" y2="16" /><line x1="3" y1="20" x2="21" y2="20" strokeWidth="2" /></svg>,
  tall: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 sm:w-6 sm:h-6"><rect x="5" y="2" width="14" height="20" rx="1" /><line x1="5" y1="10" x2="19" y2="10" /><line x1="5" y1="16" x2="19" y2="16" /></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  expand: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  send: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  download: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  close: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  info: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" strokeLinecap="round" /></svg>,
  refresh: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M23 4v6h-6M1 20v-6h6" strokeLinecap="round" strokeLinejoin="round"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

// ============================================================================
// KOMPONENTY UI
// ============================================================================
const MaterialSwatch = ({ material, selected, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center p-2 sm:p-3 rounded-xl transition-all ${selected ? 'bg-amber-50 ring-2 ring-amber-700 shadow-md' : 'bg-white hover:bg-stone-50 border border-stone-200'}`}>
    <div className="relative">
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg shadow-inner border border-stone-200" style={{ backgroundColor: material.color }} />
      {selected && <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-700 rounded-full flex items-center justify-center text-white">{Icons.check}</div>}
    </div>
    <span className="mt-1.5 text-[10px] sm:text-xs font-medium text-stone-700 text-center">{material.name}</span>
    <span className="text-[9px] text-stone-400">{material.pricePerM2} zł</span>
  </button>
);

const DimensionInput = ({ label, value, onChange, min, max, step, presets = [] }) => (
  <div className="bg-white rounded-xl p-3 sm:p-4 border border-stone-200">
    <div className="flex justify-between items-center mb-2">
      <label className="text-sm font-medium text-stone-600">{label}</label>
      <div className="flex items-center bg-stone-100 rounded-lg overflow-hidden">
        <input type="number" value={value} onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value))))} className="w-16 px-2 py-1.5 bg-transparent text-right font-medium focus:outline-none text-sm" />
        <span className="pr-2 text-xs text-stone-400">mm</span>
      </div>
    </div>
    <input type="range" value={value} onChange={(e) => onChange(Number(e.target.value))} min={min} max={max} step={step} className="w-full h-1.5 bg-stone-200 rounded-full appearance-none cursor-pointer" style={{ background: `linear-gradient(to right, #92400e ${((value - min) / (max - min)) * 100}%, #e7e5e4 0%)` }} />
    {presets.length > 0 && (
      <div className="flex gap-1 mt-2 flex-wrap">
        {presets.map((p) => (
          <button key={p} onClick={() => onChange(p)} className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${value === p ? 'bg-amber-700 text-white' : 'bg-stone-100 text-stone-600'}`}>{p}</button>
        ))}
      </div>
    )}
  </div>
);

const OptionSelector = ({ options, value, onChange, columns = 1 }) => (
  <div className={`grid gap-2 ${columns === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
    {options.map((opt) => (
      <button key={opt.id} onClick={() => onChange(opt.id)} className={`p-2.5 rounded-xl text-left flex items-center justify-between ${value === opt.id ? 'bg-amber-50 border-2 border-amber-700' : 'bg-white border border-stone-200'}`}>
        <span className={`text-xs font-medium ${value === opt.id ? 'text-amber-900' : 'text-stone-700'}`}>{opt.name}</span>
        <span className={`text-[10px] ${value === opt.id ? 'text-amber-700' : 'text-stone-400'}`}>
          {opt.price !== undefined ? `+${opt.price} zł` : opt.priceAdd !== undefined ? (opt.priceAdd === 0 ? 'w cenie' : `+${opt.priceAdd} zł`) : opt.pricePerM !== undefined ? `${opt.pricePerM} zł/m` : ''}
        </span>
      </button>
    ))}
  </div>
);

const Section = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full px-4 py-3 flex items-center justify-between hover:bg-stone-50">
        <h3 className="text-sm font-semibold text-stone-800">{title}</h3>
        <div className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>{Icons.expand}</div>
      </button>
      {isOpen && <div className="px-4 pb-4 pt-1">{children}</div>}
    </div>
  );
};

// ============================================================================
// PODGLĄD SZAFKI
// ============================================================================
const CabinetPreview = ({ config, materials, cabinets, options, compact = false }) => {
  const { width, height, depth, material, frontMaterial, shelves, hasFronts, legs, type } = config;
  
  const mat = materials.find(m => m.id === material);
  const frontMat = materials.find(m => m.id === frontMaterial) || mat;
  const leg = options.legs.find(l => l.id === legs);
  const cabinetType = cabinets.find(t => t.id === type);
  
  const isTop = cabinetType?.category === 'górne';
  const isTall = cabinetType?.category === 'słupki';
  const isBottom = !isTop && !isTall;
  
  const maxW = compact ? 140 : 260;
  const maxH = compact ? (isTall ? 120 : 80) : (isTall ? 320 : 240);
  
  const scale = Math.min(maxW / width, maxH / height) * (compact ? 0.7 : 0.55);
  const w = width * scale, h = height * scale, d = depth * scale * 0.25;
  
  const showLegs = isBottom || isTall;
  const legH = showLegs ? (leg?.height || 0) * scale * 0.35 : 0;
  
  const offX = (maxW - w) / 2 + d/2;
  const offY = compact ? 5 : (isTop ? 25 : (maxH - h - legH) / 2 + 5);
  
  const baseColor = mat?.color || '#E8DFD0';
  const frontColor = hasFronts ? (frontMat?.color || baseColor) : baseColor;
  
  const adjustColor = (hex, pct) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * pct);
    const R = Math.min(255, Math.max(0, (num >> 16) + amt));
    const G = Math.min(255, Math.max(0, ((num >> 8) & 0xFF) + amt));
    const B = Math.min(255, Math.max(0, (num & 0xFF) + amt));
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
  };
  
  const shelfY = [];
  if (shelves > 0) {
    const sp = h / (shelves + 1);
    for (let i = 1; i <= shelves; i++) shelfY.push(sp * i);
  }
  
  const uid = compact ? 'c' : 'f';
  
  return (
    <div className={`bg-gradient-to-b from-stone-50 to-stone-100 rounded-2xl ${compact ? 'p-2' : 'p-4 sm:p-5'} border border-stone-200`}>
      {!compact && <div className="text-center mb-2"><span className="inline-block px-3 py-1 bg-white rounded-full text-xs font-medium text-stone-600 border border-stone-200">{cabinetType?.name}</span></div>}
      
      <svg viewBox={`0 0 ${maxW} ${maxH}`} className="w-full h-auto" style={{ maxHeight: compact ? '100px' : (isTall ? '280px' : '200px') }}>
        <defs>
          <linearGradient id={`fg${uid}`} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={adjustColor(frontColor, 10)} /><stop offset="100%" stopColor={adjustColor(frontColor, -10)} /></linearGradient>
          <linearGradient id={`sg${uid}`} x1="100%" y1="0%" x2="0%" y2="0%"><stop offset="0%" stopColor={adjustColor(baseColor, -10)} /><stop offset="100%" stopColor={adjustColor(baseColor, -25)} /></linearGradient>
          <linearGradient id={`tg${uid}`} x1="0%" y1="100%" x2="0%" y2="0%"><stop offset="0%" stopColor={baseColor} /><stop offset="100%" stopColor={adjustColor(baseColor, 15)} /></linearGradient>
          <filter id={`sh${uid}`}><feDropShadow dx="0" dy="2" stdDeviation={compact ? 2 : 5} floodColor="#78716c" floodOpacity="0.15"/></filter>
        </defs>
        
        <g filter={`url(#sh${uid})`}>
          {showLegs && leg?.id !== 'none' && leg?.id !== 'plinth' && legH > 0 && (
            <><rect x={offX + 4} y={offY + h} width={4} height={legH} fill="#a8a29e" rx={1} /><rect x={offX + w - 8} y={offY + h} width={4} height={legH} fill="#a8a29e" rx={1} /></>
          )}
          {showLegs && leg?.id === 'plinth' && legH > 0 && (
            <rect x={offX + 2} y={offY + h} width={w - 4} height={legH} fill={adjustColor(baseColor, -15)} stroke="#d6d3d1" strokeWidth={0.5} />
          )}
          <rect x={offX - d + 1} y={offY - d + 1} width={w - 2} height={h - 2} fill="#fafaf9" stroke="#e7e5e4" strokeWidth={0.5} />
          <polygon points={`${offX},${offY + h} ${offX},${offY} ${offX - d},${offY - d} ${offX - d},${offY + h - d}`} fill={`url(#sg${uid})`} stroke="#d6d3d1" strokeWidth={1} />
          <polygon points={`${offX},${offY} ${offX + w},${offY} ${offX + w - d},${offY - d} ${offX - d},${offY - d}`} fill={`url(#tg${uid})`} stroke="#d6d3d1" strokeWidth={1} />
          <rect x={offX} y={offY} width={w} height={h} fill={`url(#fg${uid})`} stroke="#c7c2bc" strokeWidth={1} rx={1} />
          
          {shelfY.map((pos, i) => (
            <line key={i} x1={offX + 2} y1={offY + pos} x2={offX + w - 2} y2={offY + pos} stroke={adjustColor(frontColor, -20)} strokeWidth={1.5} strokeDasharray={hasFronts ? "4 2" : "0"} opacity={hasFronts ? 0.5 : 1} />
          ))}
          
          {hasFronts && width > 500 && <line x1={offX + w/2} y1={offY + 2} x2={offX + w/2} y2={offY + h - 2} stroke="#a8a29e" strokeWidth={1.5} />}
          {hasFronts && !compact && (width > 500 ? <><rect x={offX + w/2 - 18} y={offY + h/2 - 2} width={12} height={4} fill="#78716c" rx={2} /><rect x={offX + w/2 + 6} y={offY + h/2 - 2} width={12} height={4} fill="#78716c" rx={2} /></> : <rect x={offX + w - 18} y={offY + h/2 - 2} width={12} height={4} fill="#78716c" rx={2} />)}
        </g>
        
        {shelves > 0 && <><circle cx={offX + w - 8} cy={offY + 12} r={compact ? 6 : 8} fill="#92400e" /><text x={offX + w - 8} y={offY + (compact ? 14 : 16)} textAnchor="middle" fill="white" fontSize={compact ? 8 : 10} fontWeight="bold">{shelves}</text></>}
      </svg>
      
      {!compact && (
        <>
          <div className="mt-2 text-center text-xs text-stone-500">{width} × {height} × {depth} mm</div>
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center gap-2 bg-white rounded-lg px-2.5 py-2 border border-stone-200">
              <div className="w-7 h-7 rounded-md border border-stone-200" style={{ backgroundColor: mat?.color }} />
              <div><div className="text-[9px] text-stone-400">Korpus</div><div className="text-[11px] font-medium text-stone-700">{mat?.name}</div></div>
            </div>
            {hasFronts && (
              <div className="flex items-center gap-2 bg-white rounded-lg px-2.5 py-2 border border-stone-200">
                <div className="w-7 h-7 rounded-md border border-stone-200" style={{ backgroundColor: frontMat?.color }} />
                <div><div className="text-[9px] text-stone-400">Front</div><div className="text-[11px] font-medium text-stone-700">{frontMat?.name}</div></div>
              </div>
            )}
          </div>
        </>
      )}
      {compact && <div className="mt-1 text-center text-[10px] text-stone-500">{width}×{height}×{depth}</div>}
    </div>
  );
};

// ============================================================================
// STICKY MOBILE
// ============================================================================
const StickyMobilePreview = ({ config, total, materials, cabinets, options }) => {
  const scrolled = useScrolled(100);
  const cabinetType = cabinets.find(t => t.id === config.type);
  if (!scrolled) return null;
  
  return (
    <div className="lg:hidden fixed top-[52px] left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-md">
      <div className="max-w-6xl mx-auto px-3 py-2 flex items-center gap-3">
        <div className="w-24 flex-shrink-0"><CabinetPreview config={config} materials={materials} cabinets={cabinets} options={options} compact={true} /></div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-stone-700 truncate">{cabinetType?.name}</div>
          <div className="text-[10px] text-stone-400">{config.width}×{config.height}×{config.depth} mm • Półki: {config.shelves}</div>
        </div>
        <div className="text-right"><div className="text-lg font-bold text-amber-800">{total.toLocaleString('pl-PL')}</div><div className="text-[10px] text-stone-400">zł</div></div>
      </div>
    </div>
  );
};

// ============================================================================
// MODAL ZAMÓWIENIA
// ============================================================================
const OrderModal = ({ isOpen, onClose, config, total, breakdown, appConfig, materials, cabinets, options }) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  
  const cabinetType = cabinets.find(t => t.id === config.type);
  const mat = materials.find(m => m.id === config.material);
  const frontMat = materials.find(m => m.id === config.frontMaterial) || mat;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await fetch('/api/order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customer: form, config, breakdown, total }) });
      setSent(true);
    } catch {
      window.open(`mailto:${appConfig.companyEmail}?subject=Zamówienie&body=${encodeURIComponent(`Typ: ${cabinetType?.name}\nWymiary: ${config.width}x${config.height}x${config.depth}\nCena: ${total} zł`)}`);
      setSent(true);
    }
    setSending(false);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-lg font-bold text-stone-800">{sent ? '✓ Wysłane!' : 'Złóż zamówienie'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full">{Icons.close}</button>
        </div>
        <div className="p-4 sm:p-6">
          {sent ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>
              <h3 className="text-xl font-semibold mb-2">Dziękujemy!</h3>
              <p className="text-stone-500">Skontaktujemy się w ciągu 24h.</p>
            </div>
          ) : (
            <>
              <div className="bg-stone-50 rounded-2xl p-4 mb-6">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-stone-400">Typ:</span> {cabinetType?.name}</div>
                  <div><span className="text-stone-400">Wymiary:</span> {config.width}×{config.height}×{config.depth}</div>
                </div>
                <div className="mt-4 pt-4 border-t border-stone-200 flex justify-between items-center">
                  <span className="text-stone-500">Cena:</span>
                  <span className="text-2xl font-bold text-amber-800">{total} zł</span>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" required placeholder="Imię i nazwisko *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="email" required placeholder="Email *" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl" />
                  <input type="tel" required placeholder="Telefon *" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl" />
                </div>
                <textarea placeholder="Uwagi" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl resize-none" />
                <button type="submit" disabled={sending} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-xl">
                  {sending ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : Icons.send}
                  {sending ? 'Wysyłam...' : 'Wyślij zamówienie'}
                </button>
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
const ConfigPanel = ({ config, setConfig, materials, cabinets, options }) => {
  const updateConfig = (key, value) => setConfig(prev => ({ ...prev, [key]: value }));
  const currentType = cabinets.find(t => t.id === config.type);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const filteredMaterials = categoryFilter === 'all' ? materials : materials.filter(m => m.category === categoryFilter);
  
  const handleTypeChange = (typeId) => {
    const newType = cabinets.find(t => t.id === typeId);
    if (newType) {
      setConfig(prev => ({ ...prev, type: typeId, width: newType.defaultWidth, height: newType.defaultHeight, depth: newType.defaultDepth, legs: newType.hasLegs === false ? 'none' : prev.legs }));
    }
  };
  
  return (
    <div className="space-y-3">
      <Section title="Typ szafki">
        {CABINET_CATEGORIES.map((cat) => {
          const types = cabinets.filter(t => t.category === cat.id);
          if (types.length === 0) return null;
          return (
            <div key={cat.id} className="mb-4">
              <div className="text-xs font-medium text-stone-400 uppercase mb-2">{cat.name}</div>
              <div className="grid grid-cols-3 gap-2">
                {types.map((type) => (
                  <button key={type.id} onClick={() => handleTypeChange(type.id)} className={`flex flex-col items-center p-3 rounded-xl ${config.type === type.id ? 'bg-amber-700 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
                    <div className="mb-1">{Icons[cat.icon]}</div>
                    <span className="text-xs font-medium text-center">{type.name}</span>
                    <span className={`text-[10px] ${config.type === type.id ? 'text-amber-200' : 'text-stone-400'}`}>od {type.basePrice} zł</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </Section>
      
      <Section title="Materiał korpusu">
        <div className="flex gap-2 mb-3 flex-wrap">
          {MATERIAL_CATEGORIES.map((cat) => (
            <button key={cat.id} onClick={() => setCategoryFilter(cat.id)} className={`px-3 py-1 text-xs font-medium rounded-full ${categoryFilter === cat.id ? 'bg-amber-700 text-white' : 'bg-stone-100 text-stone-600'}`}>{cat.name}</button>
          ))}
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {filteredMaterials.map((mat) => <MaterialSwatch key={mat.id} material={mat} selected={config.material === mat.id} onClick={() => updateConfig('material', mat.id)} />)}
        </div>
      </Section>
      
      <Section title="Fronty">
        <label className="flex items-center gap-3 mb-4 cursor-pointer">
          <div onClick={() => updateConfig('hasFronts', !config.hasFronts)} className={`w-12 h-7 rounded-full relative cursor-pointer ${config.hasFronts ? 'bg-amber-700' : 'bg-stone-300'}`}>
            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${config.hasFronts ? 'translate-x-6' : 'translate-x-1'}`} />
          </div>
          <span className="text-sm font-medium text-stone-700">Dodaj fronty</span>
        </label>
        {config.hasFronts && (
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {materials.map((mat) => <MaterialSwatch key={mat.id} material={mat} selected={config.frontMaterial === mat.id} onClick={() => updateConfig('frontMaterial', mat.id)} />)}
          </div>
        )}
      </Section>
      
      <Section title="Wymiary">
        <div className="space-y-4">
          <DimensionInput label="Szerokość" value={config.width} onChange={(v) => updateConfig('width', v)} min={currentType?.minWidth || 150} max={currentType?.maxWidth || 1200} step={10} presets={[300, 400, 600, 800]} />
          <DimensionInput label="Wysokość" value={config.height} onChange={(v) => updateConfig('height', v)} min={currentType?.minHeight || 200} max={currentType?.maxHeight || 2200} step={10} presets={[720, 800, 1400, 2000]} />
          <DimensionInput label="Głębokość" value={config.depth} onChange={(v) => updateConfig('depth', v)} min={currentType?.minDepth || 200} max={currentType?.maxDepth || 700} step={10} presets={[300, 400, 510, 600]} />
        </div>
      </Section>
      
      <Section title="Półki" defaultOpen={false}>
        <div className="flex gap-2">
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => updateConfig('shelves', n)} className={`w-11 h-11 rounded-xl font-medium ${config.shelves === n ? 'bg-amber-700 text-white' : 'bg-stone-100 text-stone-600'}`}>{n}</button>
          ))}
        </div>
      </Section>
      
      <Section title="Plecy" defaultOpen={false}><OptionSelector options={options.back} value={config.backType} onChange={(v) => updateConfig('backType', v)} /></Section>
      <Section title="Obrzeża" defaultOpen={false}><OptionSelector options={options.edge} value={config.edgeType} onChange={(v) => updateConfig('edgeType', v)} columns={2} /></Section>
      {currentType?.hasLegs !== false && <Section title="Nóżki" defaultOpen={false}><OptionSelector options={options.legs} value={config.legs} onChange={(v) => updateConfig('legs', v)} /></Section>}
      {config.hasFronts && <Section title="Zawiasy" defaultOpen={false}><OptionSelector options={options.hinges} value={config.hinges} onChange={(v) => updateConfig('hinges', v)} /></Section>}
    </div>
  );
};

// ============================================================================
// PODSUMOWANIE CENY
// ============================================================================
const PriceSummary = ({ config, onOrder, appConfig, materials, cabinets, options }) => {
  const { breakdown, total } = useCalculatePrice(config, materials, cabinets, options);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const labels = { base: 'Bazowa', corpus: 'Korpus', fronts: 'Fronty', back: 'Plecy', edges: 'Obrzeża', legs: 'Nóżki', hinges: 'Zawiasy', shelves: 'Półki' };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-stone-200 shadow-2xl z-40">
      <div className="max-w-6xl mx-auto px-3 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="hidden sm:flex items-center gap-6">
            <button onClick={() => setShowBreakdown(!showBreakdown)} className="flex items-center gap-2 text-stone-500">
              <div className={`transition-transform ${showBreakdown ? 'rotate-180' : ''}`}>{Icons.expand}</div>
              <span className="text-sm font-medium">Szczegóły</span>
            </button>
            <span className="text-sm text-stone-400">{appConfig.deliveryDays}</span>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <div className="text-left sm:text-right">
              <div className="text-[10px] text-stone-400 uppercase">Razem</div>
              <div className="text-2xl font-bold text-amber-800">{total.toLocaleString('pl-PL')} <span className="text-sm text-stone-400">zł</span></div>
            </div>
            <button onClick={() => onOrder(breakdown, total)} className="flex items-center gap-2 px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-xl shadow-lg">
              {Icons.send}
              <span>Zamów</span>
            </button>
          </div>
        </div>
        {showBreakdown && (
          <div className="mt-3 pt-3 border-t border-stone-200 grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(breakdown).map(([k, v]) => v > 0 && (
              <div key={k} className="flex justify-between text-sm bg-stone-50 rounded-lg px-3 py-2">
                <span className="text-stone-500">{labels[k]}</span>
                <span className="font-medium text-stone-700">{v} zł</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// LOADING
// ============================================================================
const LoadingScreen = () => (
  <div className="min-h-screen bg-stone-100 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-700 rounded-full animate-spin mx-auto mb-4" />
      <p className="text-stone-500">Ładowanie danych...</p>
    </div>
  </div>
);

// ============================================================================
// GŁÓWNY KOMPONENT
// ============================================================================
export default function FurnitureCalculator() {
  const { config: appConfig, materials, cabinets, options, loading, error } = useGoogleSheetsData();
  
  const [config, setConfig] = useState({
    type: 'bottom', width: 600, height: 720, depth: 510,
    material: 'u702', frontMaterial: 'u702', hasFronts: true,
    backType: 'hdf', edgeType: '08', legs: 'basic10', hinges: 'softclose', shelves: 1,
  });
  
  const [orderModal, setOrderModal] = useState({ open: false, breakdown: {}, total: 0 });
  const { total } = useCalculatePrice(config, materials, cabinets, options);
  
  useEffect(() => {
    if (!loading && materials.length > 0) {
      const defaultMat = materials[0]?.id || 'u702';
      setConfig(prev => ({
        ...prev,
        material: materials.find(m => m.id === prev.material) ? prev.material : defaultMat,
        frontMaterial: materials.find(m => m.id === prev.frontMaterial) ? prev.frontMaterial : defaultMat,
      }));
    }
  }, [loading, materials]);
  
  if (loading) return <LoadingScreen />;
  
  const refreshData = () => {
    localStorage.removeItem('furniture-calc-data');
    localStorage.removeItem('furniture-calc-time');
    window.location.reload();
  };
  
  return (
    <div className="min-h-screen bg-stone-100 pb-24">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-3 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-600 to-amber-800 rounded-lg flex items-center justify-center text-white font-bold">M</div>
            <div><h1 className="font-semibold text-stone-800 text-sm">{appConfig.companyName}</h1><p className="text-[10px] text-stone-400">Konfigurator</p></div>
          </div>
          <div className="flex items-center gap-2">
            {SHEETS_CONFIG.useGoogleSheets && <button onClick={refreshData} className="p-2 text-stone-400 hover:text-amber-700" title="Odśwież">{Icons.refresh}</button>}
            <a href={`tel:${appConfig.companyPhone}`} className="flex items-center gap-1 text-xs text-stone-500">{Icons.info}<span className="hidden sm:inline">{appConfig.companyPhone}</span></a>
          </div>
        </div>
        {error && <div className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5">{error}</div>}
      </header>
      
      <StickyMobilePreview config={config} total={total} materials={materials} cabinets={cabinets} options={options} />
      
      <main className="max-w-6xl mx-auto px-3 py-4">
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 lg:sticky lg:top-20 lg:self-start">
            <CabinetPreview config={config} materials={materials} cabinets={cabinets} options={options} />
          </div>
          <div className="lg:col-span-2">
            <ConfigPanel config={config} setConfig={setConfig} materials={materials} cabinets={cabinets} options={options} />
          </div>
        </div>
      </main>
      
      <PriceSummary config={config} onOrder={(breakdown, total) => setOrderModal({ open: true, breakdown, total })} appConfig={appConfig} materials={materials} cabinets={cabinets} options={options} />
      
      <OrderModal isOpen={orderModal.open} onClose={() => setOrderModal({ ...orderModal, open: false })} config={config} breakdown={orderModal.breakdown} total={orderModal.total} appConfig={appConfig} materials={materials} cabinets={cabinets} options={options} />
    </div>
  );
}

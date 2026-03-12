// ============================================================================
// KONFIGURACJA MATERIAŁÓW (PŁYT)
// 
// Możesz:
// A) Edytować ten plik ręcznie
// B) Połączyć z Google Sheets (instrukcja poniżej)
// ============================================================================

export const MATERIALS = [
  { id: 'w960', code: 'W960', name: 'Biały klasyczny', color: '#FAFAFA', pricePerM2: 89, brand: 'EGGER', category: 'uni' },
  { id: 'h3303', code: 'H3303', name: 'Dąb Hamilton', color: '#C4A77D', pricePerM2: 145, brand: 'EGGER', category: 'drewno', texture: 'wood' },
  { id: 'h3730', code: 'H3730', name: 'Orzech Hickory', color: '#5D4037', pricePerM2: 155, brand: 'EGGER', category: 'drewno', texture: 'wood' },
  { id: 'h3309', code: 'H3309', name: 'Dąb Gladstone', color: '#D4B896', pricePerM2: 142, brand: 'EGGER', category: 'drewno', texture: 'wood' },
  { id: 'u702', code: 'U702', name: 'Kaszmir', color: '#E8DFD0', pricePerM2: 98, brand: 'EGGER', category: 'uni' },
  { id: 'u636', code: 'U636', name: 'Szałwia', color: '#9CAF88', pricePerM2: 112, brand: 'EGGER', category: 'uni' },
  { id: 'u830', code: 'U830', name: 'Mokka', color: '#6F5E53', pricePerM2: 105, brand: 'EGGER', category: 'uni' },
  { id: 'u999', code: 'U999', name: 'Antracyt', color: '#3D3D3D', pricePerM2: 125, brand: 'EGGER', category: 'uni' },
  { id: 'f812', code: 'F812', name: 'Beton jasny', color: '#B8B0A8', pricePerM2: 135, brand: 'EGGER', category: 'kamień', texture: 'stone' },
  { id: 'st28', code: 'ST28', name: 'Marmur Carrara', color: '#F0EDE8', pricePerM2: 165, brand: 'CLEAF', category: 'kamień', texture: 'stone' },
];

export const MATERIAL_CATEGORIES = [
  { id: 'all', name: 'Wszystkie' },
  { id: 'uni', name: 'Jednokolorowe' },
  { id: 'drewno', name: 'Drewnopodobne' },
  { id: 'kamień', name: 'Kamień / Beton' },
];

// ============================================================================
// OPCJE DODATKOWE
// ============================================================================

export const BACK_TYPES = [
  { id: 'hdf', name: 'Płyta HDF 3mm biała', priceAdd: 0 },
  { id: 'same', name: 'Płyta w kolorze korpusu', priceAdd: 45 },
  { id: 'custom', name: 'Płyta według wyboru', priceAdd: 55 },
];

export const EDGE_TYPES = [
  { id: '08', name: '0.8 mm standard', pricePerM: 4.5 },
  { id: '20', name: '2.0 mm premium', pricePerM: 8.9 },
];

export const LEG_OPTIONS = [
  { id: 'basic10', name: 'Nóżka 10 cm', price: 12, height: 100 },
  { id: 'adjust15', name: 'Nóżka regulowana 15 cm', price: 18, height: 150 },
  { id: 'plinth', name: 'Cokół meblowy', price: 45, height: 100 },
  { id: 'none', name: 'Brak (zabudowa)', price: 0, height: 0 },
];

export const HINGE_OPTIONS = [
  { id: 'standard', name: 'Standardowe', price: 8 },
  { id: 'softclose', name: 'Cichy domyk Blum', price: 24 },
  { id: 'pushopen', name: 'Push-to-open', price: 32 },
];

// ============================================================================
// INTEGRACJA Z GOOGLE SHEETS
// ============================================================================
// 
// KROK 1: Przygotuj Google Sheet z kolumnami:
//   id | code | name | color | pricePerM2 | brand | category | texture
//
// KROK 2: Opublikuj jako CSV:
//   Plik → Udostępnij → Opublikuj w internecie → CSV
//   Skopiuj link
//
// KROK 3: Użyj hooka useMaterials w App.jsx:
//
// const SHEETS_URL = 'https://docs.google.com/spreadsheets/d/TWOJ_ID/export?format=csv';
//
// export const useMaterials = () => {
//   const [materials, setMaterials] = useState(MATERIALS); // fallback
//   const [loading, setLoading] = useState(true);
//
//   useEffect(() => {
//     const fetchMaterials = async () => {
//       try {
//         const res = await fetch(SHEETS_URL);
//         const csv = await res.text();
//         const parsed = parseCSV(csv); // funkcja poniżej
//         setMaterials(parsed);
//       } catch (e) {
//         console.error('Błąd pobierania cennika:', e);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchMaterials();
//   }, []);
//
//   return { materials, loading };
// };
//
// // Prosta funkcja parsowania CSV
// const parseCSV = (csv) => {
//   const lines = csv.trim().split('\n');
//   const headers = lines[0].split(',');
//   return lines.slice(1).map(line => {
//     const values = line.split(',');
//     const obj = {};
//     headers.forEach((h, i) => {
//       obj[h.trim()] = values[i]?.trim();
//     });
//     obj.pricePerM2 = Number(obj.pricePerM2);
//     return obj;
//   });
// };
// ============================================================================

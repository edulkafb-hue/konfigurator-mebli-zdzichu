# 🪑 Kalkulator Mebli Kuchennych

Konfigurator szafek na wymiar z:
- ✅ Łatwym dodawaniem nowych typów szafek (edycja 1 pliku)
- ✅ Integracją z Google Sheets (cennik płyt)
- ✅ Formularzem zamówienia → email do Ciebie
- ✅ Pobraniem PDF przez klienta

---

## 🚀 WGRANIE NA GITHUB + VERCEL

### Krok 1: Wgraj na GitHub

```bash
cd furniture-calculator

git init
git add .
git commit -m "Initial commit"

# Utwórz repo na github.com, potem:
git remote add origin https://github.com/TWOJ_USER/furniture-calculator.git
git branch -M main
git push -u origin main
```

### Krok 2: Deploy na Vercel

1. Wejdź na [vercel.com](https://vercel.com) → **Add New Project**
2. Połącz z GitHub → wybierz `furniture-calculator`
3. Framework Preset: **Vite**
4. Kliknij **Deploy**

Gotowe! Twoja strona będzie pod adresem typu `furniture-calculator.vercel.app`

### Krok 3: Skonfiguruj wysyłanie emaili

1. Załóż konto na [resend.com](https://resend.com) (darmowe 3000 emaili/mies.)
2. Skopiuj API Key z dashboardu
3. W Vercel → **Settings** → **Environment Variables**, dodaj:

| Nazwa | Wartość |
|-------|---------|
| `RESEND_API_KEY` | twój klucz z Resend |
| `ORDER_EMAIL` | twój email na zamówienia |

4. W Vercel → **Deployments** → kliknij **Redeploy**

---

## ➕ JAK DODAWAĆ NOWE SZAFKI

Edytuj plik **`src/config/cabinets.js`** - skopiuj istniejący obiekt i zmień:

```javascript
{
  id: 'bottom_cargo',           // unikalny identyfikator
  name: 'Cargo wysuwane',       // nazwa wyświetlana
  category: 'dolne',            // 'dolne', 'górne' lub 'słupki'
  basePrice: 320,               // cena bazowa w zł
  defaultHeight: 720,           // domyślna wysokość mm
  defaultWidth: 300,            // domyślna szerokość mm  
  defaultDepth: 510,            // domyślna głębokość mm
  minWidth: 150, maxWidth: 400, // limity
  minHeight: 400, maxHeight: 900,
  minDepth: 400, maxDepth: 600,
  hasLegs: true,                // czy ma nóżki
  description: 'Szafka z systemem cargo',
},
```

Po edycji:
```bash
git add .
git commit -m "Dodano nową szafkę"
git push
```

Vercel automatycznie zrobi redeploy w ~1 minutę.

---

## 📊 CENNIK PŁYT Z GOOGLE SHEETS

### Krok 1: Przygotuj arkusz

Utwórz Google Sheet z kolumnami (dokładnie takie nazwy!):

| id | code | name | color | pricePerM2 | brand | category | texture |
|----|------|------|-------|------------|-------|----------|---------|
| w960 | W960 | Biały klasyczny | #FAFAFA | 89 | EGGER | uni | |
| h3303 | H3303 | Dąb Hamilton | #C4A77D | 145 | EGGER | drewno | wood |
| u702 | U702 | Kaszmir | #E8DFD0 | 98 | EGGER | uni | |

- `category`: uni, drewno, kamień
- `texture`: wood, stone lub puste

### Krok 2: Opublikuj jako CSV

1. **Plik** → **Udostępnij** → **Opublikuj w internecie**
2. Wybierz arkusz i format **CSV**
3. Kliknij **Opublikuj**
4. Skopiuj link

### Krok 3: Wklej link do aplikacji

W pliku **`src/config/materials.js`** na górze dodaj:

```javascript
const SHEETS_URL = 'https://docs.google.com/spreadsheets/d/TWOJ_ID/export?format=csv';
```

I użyj hooka `useMaterials` w App.jsx (instrukcja w pliku materials.js).

**Teraz możesz edytować ceny w Google Sheets** - zmiany pojawią się automatycznie!

---

## 📧 JAK DZIAŁA ZAMÓWIENIE

```
Klient                         Ty (wykonawca)
   │                                │
   ├─ Konfiguruje szafkę            │
   ├─ Klika "Złóż zamówienie"       │
   ├─ Wypełnia formularz            │
   ├─ Klika "Wyślij"                │
   │                                │
   │──────── EMAIL ────────────────►│ Dostajesz pełną specyfikację
   │                                │ + dane kontaktowe klienta
   │◄─────── EMAIL ─────────────────│ Klient dostaje potwierdzenie
   │                                │
   └─ Może pobrać PDF               │
```

### Bez konfiguracji Resend

Jeśli nie skonfigurujesz Resend, kliknięcie "Wyślij" otworzy `mailto:` z gotową treścią emaila.

---

## 🛠 PERSONALIZACJA

### Zmień dane firmy

W `src/App.jsx` na górze (linia ~15):

```javascript
const CONFIG = {
  companyName: 'Twoja Firma Meblowa',
  companyEmail: 'zamowienia@twojafirma.pl',
  companyPhone: '+48 123 456 789',
  deliveryDays: '7-10 dni roboczych',
  freeDeliveryFrom: 0,  // 0 = zawsze darmowa
};
```

### Zmień logo

Zamień literę "M" w headerze na swoje logo (SVG lub img).

---

## 📁 STRUKTURA PLIKÓW

```
furniture-calculator/
├── api/
│   └── order.js           ← Wysyłanie emaili (Vercel function)
├── src/
│   ├── config/
│   │   ├── cabinets.js    ← 🔧 TUTAJ DODAJESZ SZAFKI
│   │   └── materials.js   ← 🔧 TUTAJ CENNIK PŁYT
│   ├── App.jsx            ← Główna aplikacja
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
└── vite.config.js
```

---

## 🔧 DEVELOPMENT LOKALNY

```bash
npm install
npm run dev
```

Otwórz http://localhost:5173

Emaile nie będą działać lokalnie (brak zmiennych środowiskowych), ale formularz otworzy `mailto:`.

---

## 💡 WSKAZÓWKI

1. **Testuj na Vercel Preview** - każdy PR dostaje własny URL
2. **Backup cen** - trzymaj kopię Google Sheet
3. **Monitoruj emaile** - sprawdź dashboard Resend
4. **Custom domena** - możesz podpiąć swoją domenę w Vercel za darmo

---

## ❓ FAQ

**P: Klient nie dostał emaila?**
O: Sprawdź folder SPAM lub dashboard Resend.

**P: Jak dodać nową kategorię szafek?**
O: Edytuj `CABINET_CATEGORIES` w `cabinets.js`.

**P: Mogę zmienić walutę?**
O: Znajdź "zł" w App.jsx i zamień na inną walutę.

**P: Jak wyłączyć formularz i zostawić tylko PDF?**
O: Usuń przycisk "Wyślij zamówienie" z OrderModal.

---

Stworzono z ❤️ dla branży meblowej.

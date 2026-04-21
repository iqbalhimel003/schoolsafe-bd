# SchoolSafe BD — Project Logic Reference

> এই ডকুমেন্টে পুরো প্রজেক্টে সেট করা **সমস্ত লজিক** (ফ্রন্টএন্ড, API, ঝুঁকি/থ্রেশহোল্ড, অথ, অ্যানালিটিকস, কনফিগ ইত্যাদি) সরাসরি কোড থেকে নেওয়া বিবরণ সহ একত্রে দেওয়া হয়েছে। হ্যান্ডওভার / রেফারেন্সের জন্য তৈরি।
>
> প্রজেক্টে দুইটি অ্যাপ আছে:
> - `artifacts/schoolsafe-bd` — React + Vite ফ্রন্টএন্ড (`/`)
> - `artifacts/api-server` — Express API সার্ভার (`/api`)
>
> ফ্রন্টএন্ড একই বেস পাথের নিচে `/api` দিয়ে API-এ কল করে (Replit edge proxy এর মাধ্যমে)।

---

## সূচিপত্র

1. [Risk Engine ও Thresholds](#১-risk-engine-ও-thresholds)
2. [Locations ডেটা ও ম্যাপিং](#২-locations-ডেটা-ও-ম্যাপিং)
3. [Pages ও Routing লজিক](#৩-pages-ও-routing-লজিক)
4. [Components-এ লজিক](#৪-components-এ-লজিক)
5. [Contexts ও Hooks](#৫-contexts-ও-hooks)
6. [Translations লজিক](#৬-translations-লজিক)
7. [API ক্লায়েন্ট লজিক](#৭-api-ক্লায়েন্ট-লজিক)
8. [API Server রুট](#৮-api-server-রুট)
9. [Auth ও Password লজিক](#৯-auth-ও-password-লজিক)
10. [Logger ও Middleware](#১০-logger-ও-middleware)
11. [Build ও Config](#১১-build-ও-config)

---

## ১. Risk Engine ও Thresholds

**ফাইল:** `artifacts/schoolsafe-bd/src/logic/riskEngine.ts`, `artifacts/schoolsafe-bd/src/logic/thresholds.ts`

### ১.১ ঝুঁকি স্কেল

৪-স্তরের স্কেল (ascending order): `None < Low < Moderate < High`

- **None** — কোন উল্লেখযোগ্য সিগন্যাল নেই; স্কুল স্বাভাবিকভাবে চলবে।
- **Low** — হালকা সিগন্যাল; শুধু সচেতনতা, কোন অ্যাকশন দরকার নেই।
- **Moderate** — উল্লেখযোগ্য বিপদ; সাবধানতা নেওয়া উচিত।
- **High** — মারাত্মক বিপদ; অ্যাকশন বাধ্যতামূলক।

`RiskLevel` ভ্যালু-ম্যাপিং (weighted scoring-এ ব্যবহৃত):
```
None=0, Low=1, Moderate=2, High=3
```

### ১.২ সাতটি রিস্ক টাইপ

`evaluateRisk(weather, airQuality)` ফাংশন নিচের ৭টি ক্যাটাগরি আলাদাভাবে মূল্যায়ন করে এবং একটি `RiskResult` রিটার্ন করে:

| Risk Type   | Inputs (WeatherData/AirQualityData fields) | Sub-evaluator |
|-------------|--------------------------------------------|---------------|
| heat        | `temperature`, `apparentTemperature`        | `evaluateHeat` |
| rain        | `precipitationProbability`, `precipProbNext3hMax`, `rain3h`, `rainNext6h`, `weatherCode` | `evaluateRain` |
| airQuality  | `pm25`, `pm10`                              | `evaluateAirQuality` |
| cold        | `temperature`                               | `evaluateCold` |
| heavyRain   | `rain24h`, `rain3h`                         | `evaluateHeavyRain` |
| flood       | `rain6h`, `rain24h`                         | `evaluateFlood` |
| storm       | `windSpeed`                                 | `evaluateStorm` |

### ১.৩ Threshold কনস্ট্যান্ট (`thresholds.ts`)

#### Heat (Current Conditions — `evaluateHeat` ব্যবহার করে)

| কনস্ট্যান্ট | মান | ব্যাখ্যা |
|---|---|---|
| `CURRENT_HEAT_TEMP_LOW` | `30.0°C` | 30°C+ → Low |
| `CURRENT_HEAT_TEMP_MODERATE` | `34.0°C` | 34°C+ → Moderate |
| `CURRENT_HEAT_TEMP_HIGH` | `38.0°C` | 38°C+ → High |
| `CURRENT_HEAT_FEELS_LOW` | `34.0°C` | feels 34°C+ → Low |
| `CURRENT_HEAT_FEELS_MODERATE` | `38.0°C` | feels 38°C+ → Moderate |
| `CURRENT_HEAT_FEELS_HIGH` | `43.0°C` | feels 43°C+ → High |

`evaluateHeat`: `tempLevel` ও `feelsLevel` আলাদা বের হয়, তারপর `worstCase()` দিয়ে মার্জ। `Moderate`/`High` হলে যথাযথ rule key পুশ হয় (`ruleHighTemp`, `ruleHighApparentTemp`)।

#### Heat (Tomorrow Prep — `assessTomorrowPrep` ব্যবহার করে)

| কনস্ট্যান্ট | মান |
|---|---|
| `HEAT_TEMP_ADVISORY` | `30.0°C` (warm-day advisory tier) |
| `HEAT_TEMP_LOW` | `35.0°C` |
| `HEAT_TEMP_MODERATE` | `36.0°C` |
| `HEAT_TEMP_HIGH` | `38.0°C` |
| `HEAT_FEELS_LOW` | `38.0°C` |
| `HEAT_FEELS_MODERATE` | `41.0°C` |
| `HEAT_FEELS_HIGH` | `44.0°C` |

#### Rain (Current Probability — `evaluateRain` ব্যবহার করে)

| কনস্ট্যান্ট | মান | ব্যাখ্যা |
|---|---|---|
| `CURRENT_RAIN_PROB_LOW` | `5%` | 5%+ → Low |
| `CURRENT_RAIN_PROB_MODERATE` | `40%` | 40%+ → Moderate |
| `CURRENT_RAIN_PROB_HIGH` | `60%` | 60%+ → High |
| `RAIN_3H_LOW` / `MODERATE` / `HIGH` | `1` / `5` / `15` mm | Recent 3h rain |
| `RAIN_NEXT6H_LOW` / `MODERATE` / `HIGH` | `2` / `10` / `25` mm | Forecast next-6h rain |
| `RAIN_PROB_LOW` / `MODERATE` / `HIGH` | `40` / `60` / `80` % | (legacy / methodology display) |

`evaluateRain` ৫টি ইনপুট আলাদা মূল্যায়ন করে: current prob, next-3h max prob, recent 3h rain, next 6h rain, এবং WMO weather code (নিচের সেকশন দেখুন)। চূড়ান্ত লেভেল = `worstCase()`। rule keys: `ruleHighPrecipProb`, `ruleNotableRain`।

#### WMO Weather Code Rain Classifier (`classifyRainCode`)

| Codes | Category | RiskLevel |
|---|---|---|
| `95, 96, 97, 99` | thunderstorm | High |
| `53, 55, 56, 57, 63, 65, 66, 67, 81, 82` | continuous | Moderate |
| `51, 61, 80` | light | Low |
| অন্য সব | none | None |

`isThunderstormCode(code)` বিশেষভাবে 95/96/97/99 চেক করে — `assessTomorrowPrep` এ instant High-trigger হিসেবে ব্যবহৃত।

#### Tomorrow Rain Prep

| কনস্ট্যান্ট | মান |
|---|---|
| `TOMORROW_RAIN_PROB_LOW` / `MODERATE` / `HIGH` | `40` / `60` / `75` % |
| `TOMORROW_RAIN_AMT_LOW` / `MODERATE` / `HIGH` | `2` / `5` / `10` mm |
| `TOMORROW_UMBRELLA_PROB` | `50%` (umbrella tip) |
| `TOMORROW_UMBRELLA_RAIN` | `3 mm` |
| `TOMORROW_UMBRELLA_STRONG_PROB` | `75%` |
| `TOMORROW_UMBRELLA_STRONG_RAIN` | `10 mm` |

#### Air Quality (PM2.5 / PM10, µg/m³ — Bangladesh-calibrated)

| কনস্ট্যান্ট | মান |
|---|---|
| `AQ_PM25_LOW` / `MODERATE` / `HIGH` | `25` / `55` / `90` |
| `AQ_PM10_LOW` / `MODERATE` / `HIGH` | `50` / `100` / `150` |

`evaluateAirQuality`: PM2.5 ও PM10 আলাদা বের হয়, `worstCase()`। rule keys: `ruleHighPM25`, `ruleHighPM10`।

#### Cold (Min Temperature, °C)

| কনস্ট্যান্ট | মান |
|---|---|
| `COLD_TEMP_LOW` | `≤ 10°C` → Low |
| `COLD_TEMP_MODERATE` | `≤ 8°C` → Moderate (`ruleColdTemp`) |
| `COLD_TEMP_HIGH` | `≤ 6°C` → High (`ruleVeryColdTemp`) |

#### Heavy Rain

| কনস্ট্যান্ট | মান |
|---|---|
| `HEAVY_RAIN_24H_LOW` / `MODERATE` / `HIGH` | `20` / `44` / `89` mm |
| `HEAVY_RAIN_3H_LOW` / `MODERATE` / `HIGH` | `15` / `30` / `44` mm |

`worstCase(level24h, level3h)` → Moderate/High হলে `ruleHeavyRain`।

#### Flood

| কনস্ট্যান্ট | মান |
|---|---|
| `FLOOD_6H_LOW` / `MODERATE` / `HIGH` | `30` / `50` / `80` mm |
| `FLOOD_24H_LOW` / `MODERATE` / `HIGH` | `50` / `80` / `120` mm |

`worstCase(level6h, level24h)` → Moderate/High হলে `ruleFloodRisk`।

#### Storm / Cyclone (Wind, km/h)

| কনস্ট্যান্ট | মান |
|---|---|
| `STORM_WIND_LOW` | `≥ 30` → Low |
| `STORM_WIND_MODERATE` | `≥ 40` → Moderate (`ruleStormWind`) |
| `STORM_WIND_HIGH` | `≥ 60` → High (`ruleSevereStorm`) |

#### Weekly Prep Thresholds (শুধু `assessWeeklyPrep` এ)

| কনস্ট্যান্ট | মান |
|---|---|
| `WEEKLY_HEAT_TEMP_MODERATE` | `35.0°C` (Tomorrow uses 36) |
| `WEEKLY_RAIN_PROB_LOW` / `MODERATE` / `HIGH` | `20` / `40` / `70` % |

### ১.৪ Weighted Overall Aggregation (`computeWeightedOverall`)

প্রতিটি রিস্কের weight:

| Risk | Weight |
|---|---|
| `WEIGHT_AIR_QUALITY` | `0.75` |
| `WEIGHT_RAIN` | `0.75` |
| `WEIGHT_HEAT` | `1.0` |
| `WEIGHT_COLD` | `1.0` |
| `WEIGHT_HEAVY_RAIN` | `1.25` |
| `WEIGHT_FLOOD` | `1.5` |
| `WEIGHT_STORM` | `1.5` |

Score-to-Level cut-off:

| কনস্ট্যান্ট | মান |
|---|---|
| `OVERALL_LOW_MIN` | `0.75` |
| `OVERALL_MODERATE_MIN` | `2.0` |
| `OVERALL_HIGH_MIN` | `4.25` |

**Overall computation algorithm (`computeWeightedOverall`):**

1. সব ৭টি লেভেল `None` হলে → `None`।
2. **Override**: `flood === High` বা `storm === High` হলে → `High`।
3. **Override**: ২+ রিস্ক `High` হলে → `High`।
4. **Override**: ১টি `High` + আরও ১টি `Moderate`/`High` (অর্থাৎ ≥২টি High-or-Moderate) → `High`।
5. না হলে weighted `score = Σ (LEVEL_VALUE[risk] × WEIGHT[risk])` বের করে `scoreToLevel(score)`।
6. **Soft-down override**: যদি overall `Moderate` হয় এবং একটিমাত্র non-None রিস্ক থাকে এবং সেটা `airQuality` বা `rain` হয় Moderate লেভেলে — তখন `Low`-এ নামানো হয় (অতিরিক্ত প্যানিক রোধ)।

### ১.৫ Triggered Rules

`evaluateRisk` শেষে সব sub-evaluator এর rule keys ডেডুপ্লিকেট করে `triggeredRules: string[]` রিটার্ন করে — শুধুমাত্র `Moderate`/`High` ক্ষেত্রে rule key পুশ হয়, যেন শান্ত দিনে "Why this advice?" সেকশন খালি থাকে।

### ১.৬ Tomorrow Prep — `assessTomorrowPrep(f: TomorrowForecast)`

Cascading if-chain (প্রথম যেটা ম্যাচ করে সেটা রিটার্ন):

- **High** যদি `tempMax ≥ HEAT_TEMP_HIGH (38)` বা `tempMin ≤ COLD_TEMP_HIGH (6)` বা `windMax ≥ STORM_WIND_HIGH (60)` বা `rainProbMax ≥ TOMORROW_RAIN_PROB_HIGH (75)` বা `rainSum ≥ TOMORROW_RAIN_AMT_HIGH (10)` বা `isThunderstormCode(weatherCode)` বা `pm25Avg ≥ AQ_PM25_HIGH (90)`।
- **Moderate** যদি `tempMax ≥ 36` বা `tempMin ≤ 8` বা `windMax ≥ 40` বা `rainProbMax ≥ 60` বা `rainSum ≥ 5` বা `pm25Avg ≥ 55`।
- **Low** যদি `tempMax ≥ 35` বা `tempMin ≤ 10` বা `windMax ≥ 30` বা `rainProbMax ≥ 40` বা `rainSum ≥ 2` বা `pm25Avg ≥ 25`।
- **Low (Advisory)** যদি `tempMax > HEAT_TEMP_ADVISORY (30)` — শুধু গরম advisory।
- নাহলে `None`।

### ১.৭ Weekly Prep — `assessWeeklyPrep(f: TomorrowForecast)`

`fetchWeeklyForecast`-এ প্রতিদিনের জন্য ব্যবহৃত (PM2.5 এখানে 0 ধরে, lightweight call)।

- **High**: `tempMax ≥ HEAT_TEMP_HIGH` বা `tempMin ≤ COLD_TEMP_HIGH` বা `windMax ≥ STORM_WIND_HIGH` বা `rainProbMax ≥ WEEKLY_RAIN_PROB_HIGH (70)` বা `rainSum ≥ TOMORROW_RAIN_AMT_HIGH (10)` বা thunderstorm code।
- **Moderate**: `tempMax ≥ WEEKLY_HEAT_TEMP_MODERATE (35)` বা `tempMin ≤ COLD_TEMP_MODERATE (8)` বা `windMax ≥ 40` বা `rainProbMax ≥ WEEKLY_RAIN_PROB_MODERATE (40)` বা `rainSum ≥ 5`।
- **Low**: `tempMax > 30` বা `windMax ≥ 30` বা `rainProbMax ≥ WEEKLY_RAIN_PROB_LOW (20)` বা `rainSum ≥ 2` বা `tempMin ≤ 10`।
- নাহলে `None`।

### ১.৮ Helper Functions

- `worstCase(levels[])` — দেওয়া লেভেলগুলোর সর্বোচ্চটা রিটার্ন করে (High > Moderate > Low > None)।
- `scoreToLevel(score)` — overall_*_MIN cut-off এর বিরুদ্ধে চেক।

---

## ২. Locations ডেটা ও ম্যাপিং

**ফাইল:** `artifacts/schoolsafe-bd/src/data/locations.ts`

`DISTRICTS: District[]` — হার্ডকোডেড অ্যারে। প্রতিটি `District` এ `id`, `nameEn`, `nameBn`, এবং `upazilas: Upazila[]`। প্রতিটি `Upazila` এ `id`, `nameEn`, `nameBn`, `districtId`, `lat?`, `lon?`, `isPilot: boolean`, এবং অপশনাল `hotspotLabel`।

### ২.১ Pilot স্কোপ

| জেলা | উপজেলা সংখ্যা | বিশেষত্ব |
|---|---|---|
| **Kishoreganj** (কিশোরগঞ্জ) | ১৩টি (সব pilot) | Sadar, Bhairab, Itna, Karimganj, Katiadi, Bajitpur, Kuliarchar, Nikli, Mithamain, Austagram, Tarail, Hossainpur, Pakundia |
| **Sylhet** | ২ (Jaintiapur, Goainghat) | `hotspotLabel: "Heavy Rain Representative Area"` |
| **Chuadanga** | ১ (Sadar) | `hotspotLabel: "Heat Risk Representative Area"` |
| **Rajshahi** | ২ (Paba, Godagari) | `hotspotLabel: "Heat Risk Representative Area"` |
| **Panchagarh** | ১ (Tetulia) | `hotspotLabel: "Cold Risk Representative Area"` |
| **Patuakhali** | ১ (Kalapara) | `hotspotLabel: "Storm/Cyclone Representative Area"` |
| **Khulna** | ১ (Koyra) | `hotspotLabel: "Storm/Cyclone Representative Area"` |

### ২.২ Helper

- `getDistrictById(id)` — `id` দিয়ে জেলা খোঁজে।
- নন-pilot উপজেলা যোগ করলে `isPilot: false` এবং `lat/lon` ছাড়া দেওয়া যায় — সেগুলো "coming soon" হিসেবে দেখানো যায় (এক্সটেনশনের জন্য তৈরি)।

---

## ৩. Pages ও Routing লজিক

**ফাইল:** `artifacts/schoolsafe-bd/src/App.tsx`, `src/pages/Home.tsx`, `src/pages/Admin.tsx`, `src/pages/not-found.tsx`

### ৩.১ App Root (`App.tsx`)

- `QueryClient`: `staleTime: 10 মিনিট`, `retry: 2` — environmental data জন্য টিউনড।
- প্রোভাইডার চেইন: `QueryClientProvider → SiteSettingsProvider → LanguageProvider → WouterRouter → AppShell`।
- Wouter `base` সেট করা হয় `import.meta.env.BASE_URL` থেকে (trailing slash বাদ দিয়ে) — Replit artifact path-prefix সাপোর্ট।

### ৩.২ AppShell

- `useLocation()` দিয়ে location পড়ে; `isAdmin = location === "/admin"`।
- `usePageTracking()` কল করে।
- `<Header />` ও `<Footer />` শুধু non-admin পেজে রেন্ডার হয়।
- `<Toaster position="bottom-center" richColors />` সবসময় মাউন্ট করা।

### ৩.৩ Routes (`<Switch>`)

| Path | Component |
|---|---|
| `/` | `Home` |
| `/admin` | `AdminPage` |
| অন্য সব | `NotFound` (App.tsx-এর ভেতরের ছোট inline) |

`pages/not-found.tsx` — আলাদা 404 কম্পোনেন্ট (AlertCircle আইকন সহ); বর্তমানে `App.tsx`-এর Inline NotFound ব্যবহার হচ্ছে।

### ৩.৪ Home Page (`pages/Home.tsx`)

State: `selectedUpazila: Upazila | null`। সেকশন রেন্ডারিং:

1. `<Hero />` — সবসময় (no-print)।
2. **Intro Cards** (২টি) — `introWhatTitle/Text`, `introHowTitle/Text` থেকে।
3. `<LocationSelector onUpazilaSelect={setSelectedUpazila} />` — সবসময় (no-print)।
4. `<Dashboard />` যদি `selectedUpazila` থাকে; নাহলে "Select a location" empty-state কার্ড।
5. `<TomorrowSection />`, `<WeeklySection />`, `<ForecastChart />`, `<ComparisonSection />` — শুধু selection হলে।
6. `<MethodologySection />`, `<LimitationsSection />` — সবসময় (no-print)।

`no-print` ক্লাস → প্রিন্টে শুধু Dashboard সেকশন দেখাতে হয়।

### ৩.৫ Admin Page (`pages/Admin.tsx`)

পাসওয়ার্ড-প্রোটেক্টেড `/admin` পেজ (~1067 লাইন)। **Cookie-session ভিত্তিক auth** — কোন token localStorage-এ রাখা হয় না। সব fetch `credentials: "include"` ব্যবহার করে যাতে `ss_admin` HttpOnly cookie পাঠানো যায়।

- **Bootstrap session check**: mount-এ `GET /api/admin/session` কল (credentials: include)। সফল হলে UI আনলক, 401 হলে login form।
- **Login**: `POST /api/admin/login` body `{ username, password }`। সফলে সার্ভার `Set-Cookie: ss_admin=...` দেয়; UI `onLogin(username)` কল করে। ব্যর্থে 401 → "Invalid credentials" মেসেজ। `localStorage["admin_username"]` শুধু username pre-fill এর জন্য (token নয়)।
- **Logout**: `POST /api/admin/logout` (credentials: include)।
- ৬টি ট্যাব: **Hero**, **Intro Cards** (LayoutGrid), **Footer** (FileText), **Contact** (Phone), **Analytics** (BarChart2), **Account** (User)।
- প্রতিটি field-এর জন্য `FieldDef { key, label, multiline? }` ডেফিনিশন। `siteName`, `siteTagline`, `siteDescription`, `prototypeNotice`, `introWhatTitle/Text`, `introHowTitle/Text`, `footerPurpose/DataSource/Disclaimer/CreditBefore/CreditAfter` — bilingual (`_en`/`_bn`)। Contact: `contact_email`, `contact_phone`, `contact_facebook`, `contact_telegram`, `contact_x`।
- Save → `PUT /api/settings` (credentials: include, whitelisted keys only), success-এ `useSiteSettings().reload()`।
- Account ট্যাবে `PUT /api/credentials` দিয়ে username/password আপডেট।
- Analytics ট্যাবে `/api/analytics/{summary,recent,top-pages,top-districts,top-upazilas,by-device,daily}` থেকে ডেটা টেনে রিচার্ট দিয়ে চার্ট আঁকে।
- Username display এর জন্য `GET /api/me` কল (cookie-based)।

---

## ৪. Components-এ লজিক

**ফোল্ডার:** `artifacts/schoolsafe-bd/src/components/`

### ৪.১ Header.tsx

- `useLanguage()` থেকে `lang`, `setLang`, `t`। `toggleLang()` → `en ↔ bn` সুইচ।
- ক্লিকেবল ব্র্যান্ডিং → `window.scrollTo({ top: 0, behavior: "smooth" })`।
- Sticky `no-print` header, primary background।

### ৪.২ Footer.tsx

- `useSiteSettings()` থেকে contact ভ্যালু পড়ে: `contact_email/phone/facebook/telegram/x`।
- কোন কন্ট্যাক্ট না থাকলে (`hasContact === false`) সেকশন hide হয়।
- `MD. IQBAL HUSEN` ক্রেডিট লিংক হার্ডকোডেড: `https://iqbalsir.bd`।

### ৪.৩ Hero.tsx

- `siteName`, `siteDescription`, এবং `prototypeNotice` রেন্ডার করে (translation-driven)। কোন গণনা/লজিক নেই — শুধু সেটিংস থেকে স্ট্রিং রিড।

### ৪.৪ LocationSelector.tsx

- ২টি searchable dropdown (district + upazila)। `useRef` + `mousedown` লিসেনার দিয়ে outside-click detection।
- Language সুইচে ডিসপ্লে নেম রিফ্রেশ (`useEffect` on `lang`)।
- District ও Upazila নাম bilingual: `getDistrictName(d, lang)`, `getUpazilaName(u, lang)`।
- Filter: `nameEn`/`nameBn` substring (case-insensitive) ম্যাচ।
- Upazila সিলেক্টে `onUpazilaSelect(u)` কল।

### ৪.৫ Dashboard.tsx (878 লাইন — মূল ভিউ)

- `useQuery` দিয়ে `fetchWeather` + `fetchAirQuality` সমান্তরালে কল।
- `evaluateRisk(weather, aq)` → `RiskResult`।
- রেন্ডার: ৮টি weather metric tile, ৭টি risk breakdown card (সব level — None থেকে Severe — সবসময় দেখানো হয়; level অনুযায়ী শুধু color/styling বদলায়), একটি Overall School Safety badge, "Why this advice?" এ `triggeredRules` থেকে translation key resolve করে bullets, এবং role-based recommendation কার্ড (school authorities, teachers, students, guardians, vulnerable groups)।
- Helper `weatherIcon(code)` WMO code → emoji ম্যাপ।
- Loading → skeleton; Error → toast + retry।
- `HEAT_TEMP_ADVISORY` ব্যবহার করে warm-day banner।

### ৪.৬ TomorrowSection.tsx + TomorrowOutlook.tsx

- `TomorrowSection`: `useQuery({ refetchInterval: 5 মিনিট })` → `fetchTomorrowForecast`। Loading skeleton, success-এ `<TomorrowOutlook>`।
- `TomorrowOutlook`: ৬টি metric tile + PrepLevel badge + 2–4 প্রিপ-টিপস (`assessTomorrowPrep` + thresholds থেকে decision)। Tip সিলেকশন:
  1. Priority অর্ডারে condition tips জোগাড়।
  2. `prepLevel === "High"` হলে "school authorities" tip।
  3. `<2` হলে fallback (low-risk general + monitor)।
  4. সর্বোচ্চ ৪ tips।

### ৪.৭ WeeklySection.tsx + WeeklyOutlook.tsx

- `WeeklySection`: `useQuery({ refetchInterval: 5 মিনিট })` → `fetchWeeklyForecast`।
- `WeeklyOutlook`: ৭ row (tomorrow…+7) — Day | Weather icon | Max/Min | Rain% | PrepLevel dot। PrepLevel `assessWeeklyPrep` থেকে। `HEAT_TEMP_ADVISORY` ও `HEAT_TEMP_MODERATE` দিয়ে গরম-অ্যাডভাইজরি স্টাইলিং।

### ৪.৮ ForecastChart.tsx

- `useQuery` → `fetchHourlyForecast` (24h)।
- Recharts `ComposedChart`: temperature `Area` + precipitation probability `Bar`, dual Y-axes, bilingual legend।

### ৪.৯ ComparisonSection.tsx

- সব pilot upazila flatten → ২টি dropdown। ডিফল্ট: Kishoreganj Sadar vs Tetulia (heat ↔ cold)।
- `useQueries` দিয়ে দুজনের `fetchWeather` + `fetchAirQuality` সমান্তরাল।
- প্রতিটির জন্য `evaluateRisk` চালিয়ে side-by-side metrics table।

### ৪.১০ MethodologySection.tsx

- ৭টি risk type-এর কার্ড। Numeric thresholds runtime-এ `logic/thresholds.ts` থেকে import করা — কোন hardcoded duplicate নেই, threshold বদলালে UI অটো আপডেট। Overall scoring ব্যাখ্যাও (`OVERALL_LOW_MIN`, ইত্যাদি) এখানে দেখানো।

### ৪.১১ LimitationsSection.tsx

- শুধু bilingual disclaimer text (translation-driven): এই টুল সরকারি সতর্কবার্তা প্রতিস্থাপন করে না (BMD/BWDB/cold wave alert)।

### ৪.১২ DashboardPlaceholder.tsx, ComparisonPlaceholder.tsx

- Selection বা loading-এর আগে empty-state কার্ড।

---

## ৫. Contexts ও Hooks

### ৫.১ `contexts/LanguageContext.tsx`

- State: `lang: "en" | "bn"`, default `"en"`।
- `t(key, vars?)` ফাংশন:
  1. **Override probe**: `settings[`${key}_${lang}`]` (admin DB) — থাকলে সেটা।
  2. ফলব্যাক: `translations[lang][key]`।
  3. শেষ ফলব্যাক: `translations.en[key]`।
  4. শেষমেশ: `key` নিজেই।
  5. `vars` থাকলে `{name}` placeholder replace; Bangla mode-এ number → `Intl.NumberFormat("bn-BD")` (Bangla digits)।
- Hook: `useLanguage()` — provider না থাকলে throw।

### ৫.২ `contexts/SiteSettingsContext.tsx`

- `API_BASE = `${import.meta.env.BASE_URL}api`` — base path-aware।
- Mount-এ `GET /api/settings` কল → `settings: Record<string, string>` রাখে (admin_-prefixed keys API থেকেই বাদ)।
- Public API: `{ settings, loading, reload }`। `reload()` Admin Save এর পর কল হয়।

### ৫.৩ `hooks/usePageTracking.ts`

- প্রতি route change-এ `POST /api/analytics/track` ফায়ার করে। কখনো UI block করে না।
- Session ID: `localStorage["ssbd_session_id"]` এ persist; না থাকলে `crypto.randomUUID()` (fallback `s_${Date.now()}_${random}`)।
- `/admin` ও `/admin/*` track করে না।
- StrictMode/remount dedupe: `useRef` দিয়ে last tracked path মনে রাখে।
- Body: `{ page, sessionId, referrer, district?, upazila?, lang?, userAgent }`, `keepalive: true`।

### ৫.৪ `hooks/use-mobile.tsx`

- `MOBILE_BREAKPOINT = 768`px।
- `matchMedia` listener দিয়ে `isMobile: boolean` রিটার্ন। SSR-safe (initial `undefined`, coerced `!!isMobile`)।

### ৫.৫ `hooks/use-toast.ts`

- 191 লাইন — shadcn/sonner-style standalone toast hook। Reducer-ভিত্তিক টোস্ট queue (TOAST_LIMIT, TOAST_REMOVE_DELAY)। বর্তমানে `sonner`-ই বেশি ব্যবহার হচ্ছে UI জুড়ে; এই হুক হেলপার।

---

## ৬. Translations লজিক

**ফাইল:** `artifacts/schoolsafe-bd/src/translations/en.ts` (385 lines), `bn.ts` (387 lines)

- প্রতিটি ফাইল default-export একটি `const` অবজেক্ট। `en`-এর shape থেকে `TranslationKeys = keyof typeof en` টাইপ এক্সপোর্ট হয় — সব components ও risk rules সেই key set ব্যবহার করে (compile-time safety)।
- কী-গ্রুপ: Branding, Header, Intro Cards, Prototype Notice, Location Selector, Dashboard, Weather Metrics, Risk Cards (৭ টাইপ), Overall Safety Badge, Triggered Rules, Recommendations (role-wise), Comparison, Chart, Methodology, Limitations, Footer।
- Bilingual key convention `<base>_en` / `<base>_bn` শুধু **admin-overridable** ফিল্ডের জন্য (`siteName`, `siteTagline`, `siteDescription`, `prototypeNotice`, `introWhat*`, `introHow*`, `footer*`)। বাকি keys (rule names, methodology text ইত্যাদি) source কোডে hardcoded থাকে এবং `lang` বদলালে শুধু কোন object থেকে পড়া হবে সেটা বদলায়।
- ভাষা সুইচ: শুধু React state — কোন reload নেই, কোন URL persist নেই (page reload-এ আবার `"en"`)।
- Bangla number formatting: `t()` ফাংশনে `Intl.NumberFormat("bn-BD")` দিয়ে `{vars}` placeholder-এর numeric values সয়ংক্রিয়ভাবে বাংলা সংখ্যায় রেন্ডার হয়।

---

## ৭. API ক্লায়েন্ট লজিক

**ফাইল:** `artifacts/schoolsafe-bd/src/utils/api.ts`

দুটি বহিরাগত API — Open-Meteo (key-less, free):
- Weather: `https://api.open-meteo.com/v1/forecast`
- Air Quality: `https://air-quality-api.open-meteo.com/v1/air-quality`

### ৭.১ Helper

- `findCurrentHourIndex(times: string[])` — current `Date.now()`-এর সবচেয়ে কাছের ISO timestamp এর index (current hour rolling বের করতে)।

### ৭.২ `fetchWeather(lat, lon): WeatherData`

হুর্লি ফিল্ডস: `temperature_2m, relativehumidity_2m, apparent_temperature, precipitation_probability, rain, windspeed_10m, uv_index, visibility, weathercode`। `forecast_days=2` (যাতে rolling window-এর জন্য পর্যাপ্ত সামনের ডেটা থাকে)। `timezone=auto`।

Rolling sum গণনা:
- `rain3h` = current hour + পূর্ববর্তী ২ ঘণ্টা।
- `rain6h` = current + পূর্ববর্তী ৫।
- `rain24h` = current + পূর্ববর্তী ২৩।
- `precipProbNext3hMax` = পরবর্তী ৩ ঘণ্টার max probability।
- `rainNext6h` = পরবর্তী ৬ ঘণ্টার rain sum।

Error: `!res.ok` হলে `throw new Error(`Weather API error ${status}: ${statusText}`)` — react-query catch করে `retry: 2` পর্যন্ত retry।

### ৭.৩ `fetchAirQuality(lat, lon): AirQualityData`

Hourly: `pm2_5,pm10`, `forecast_days=2`। Current hour pick → `pm25`, `pm10`।

### ৭.৪ `fetchTomorrowForecast(lat, lon): TomorrowForecast`

দুটি কল সমান্তরাল:
1. Weather daily: `temperature_2m_max, temperature_2m_min, precipitation_sum, precipitation_probability_max, windspeed_10m_max, weathercode`, `forecast_days=2`। **Index 1 = tomorrow** (index 0 = today)।
2. AQ hourly: `pm2_5`, `forecast_days=2`। Tomorrow-এর date prefix (`YYYY-MM-DD`) দিয়ে filter করে non-null গুলোর গড় = `pm25Avg` (no data হলে 0)।

### ৭.৫ `fetchWeeklyForecast(lat, lon): WeeklyForecastDay[]`

Daily fields: `temperature_2m_max, temperature_2m_min, precipitation_probability_max, windspeed_10m_max, weathercode`, `forecast_days=8`। Index 0 (today) `slice(1)` দিয়ে বাদ — ৭ ভবিষ্যৎ দিন। প্রতিটির জন্য `assessWeeklyPrep({ ..., rainSum: 0, pm25Avg: 0 })` দিয়ে `prepLevel`। (PM2.5 & precipitation_sum বাদ, lightweight rakhar জন্য।)

### ৭.৬ `fetchHourlyForecast(lat, lon): HourlyForecast[]`

24-hour `temperature_2m, precipitation_probability` (`forecast_days=1`) — Chart-এর জন্য।

### ৭.৭ Error handling সারাংশ

- সব ফাংশন `Error` throw করে।
- React Query `staleTime: 10 মিনিট`, `retry: 2`। Weekly/Tomorrow সেকশনে অতিরিক্ত `refetchInterval: 5 মিনিট`।
- UI components catch করে `sonner` toast দেখায় + retry button।

---

## ৮. API Server রুট

**ফোল্ডার:** `artifacts/api-server/src/routes/` (mounted at `/api` in `app.ts`)

`routes/index.ts` সব sub-router compose করে এই অর্ডারে: `health`, `admin`, `settings`, `analytics`।

### ৮.১ `GET /api/healthz` (`routes/health.ts`)

- Public। Response: `HealthCheckResponse.parse({ status: "ok" })` → `{ status: "ok" }` (Zod-validated from `@workspace/api-zod`)।

### ৮.২ Admin session routes (`routes/admin.ts`)

cookie-session ভিত্তিক admin auth এর জন্য তিনটা endpoint। সব রুট `cookie-parser` middleware-এর পরে কাজ করে এবং `ss_admin` HttpOnly cookie ব্যবহার করে।

#### `POST /api/admin/login` — public, rate-limited (`adminAuthLimiter`)

- **Body Zod schema** `LoginSchema` (`.strict()`): `{ username: string (trim, max 256, default ""), password: string (1..512) }`।
- `verifyCredentials(username, password)` কল (DB-then-env, bcrypt compare, constant-time username match, legacy plain-text auto-migrate)।
- Fail → `401 { error: "Invalid credentials" }`।
- Success →
  1. `cleanupExpiredSessions()` (best-effort, swallowed errors)।
  2. `createSession(username)` → DB-তে `adminSessionsTable` row insert (token = `crypto.randomBytes(32).toString("hex")`, `expiresAt = now + 8h`)।
  3. `setSessionCookie(res, token)` → `Set-Cookie: ss_admin=<token>; HttpOnly; SameSite=Strict; Path=/api; Max-Age=28800; Secure (prod only)`।
  4. Response: `{ username }`।
- DB error → `500 { error: "Failed to create session" }`।

#### `POST /api/admin/logout` — public

- `req.cookies[ss_admin]` থেকে token পড়ে; `destroySession(token)` (DB row delete, errors swallowed)।
- `clearSessionCookie(res)` দিয়ে cookie expire।
- Response: `{ ok: true }`। Cookie না থাকলেও 200।

#### `GET /api/admin/session` — cookie-based check

- `req.cookies[ss_admin]` না থাকলে → `401 { error: "Not authenticated" }`।
- `lookupSession(token)`:
  - row না পেলে → `401 { error: "Session expired" }` + cookie clear।
  - `expiresAt < now` → row delete (best-effort) + null → 401 + cookie clear।
  - সফল → `{ username }`।

### ৮.৩ Settings routes (`routes/settings.ts`)

#### `GET /settings` — public

`siteSettingsTable` থেকে সব row পড়ে; **`admin_`-prefixed keys filter out** করে JSON রিটার্ন। কোন auth লাগে না। 500 on DB error।

#### `PUT /settings` — auth (adminAuthLimiter + checkAdminAuth)

- Body validate: `SettingsUpdateSchema` (whitelisted keys only)।
- Empty-string value → row **delete**; নাহলে **upsert** (`onConflictDoUpdate` with `updatedAt: new Date()`)।
- Success: `{ ok: true, updated, deleted }`।
- Side-effect: কখনো `admin_*` key লেখা যাবে না (whitelist enforces)।

#### `GET /me` — auth (cookie session, rate-limited via `adminAuthLimiter`)

- `checkAdminAuth(req)` pass হলে `getCurrentUsername(req)` রিটার্ন। Cookie session থাকলে session-এর username, নাহলে DB `admin_username` → env fallback।
- Admin UI-তে current admin name দেখানোর জন্য ব্যবহৃত।

#### `PUT /credentials` — auth (cookie session, rate-limited via `adminAuthLimiter`)

- Body: `CredentialsUpdateSchema` (`newUsername?`, `newPassword?`, কমপক্ষে একটা)।
- `newUsername` upsert as plain string at `admin_username`।
- `newPassword` (trim non-empty) → `hashPassword(plain)` (bcrypt cost 10) → upsert at `admin_password`। `passwordChanged = Boolean(body.newPassword?.trim())`।
- **Side-effect (password change)**: `passwordChanged === true` হলে সার্ভার `destroyAllSessions()` কল করে (`adminSessionsTable` সম্পূর্ণ ক্লিয়ার — সব device-এ থাকা admin session invalidate) এবং current request-এ `clearSessionCookie(res)` দিয়ে `ss_admin` cookie মুছে দেয়। ফলে admin সহ সবাইকে আবার login করতে হয়।
- Success: `{ ok: true, passwordChanged }`।

### ৮.৪ Analytics routes (`routes/analytics.ts`)

Helpers:
- `maskIp(ip)` — IPv4 last octet মাস্ক (`192.168.1.x`); IPv6 প্রথম 4 group রেখে `:x:x:x:x`।
- `extractIp(req)` — `X-Forwarded-For` (1st) → `req.ip` → socket।
- `classifyDevice(ua)` — `mobile | tablet | desktop`।
- `requireAdmin(req,res,next)` — `adminAuthLimiter` + `checkAdminAuth` চেইন; 401 unauth, 500 on auth-check error।

#### `POST /api/analytics/track` — public, body-limit 4 KB

- Validate: `AnalyticsTrackSchema` (`page`, `sessionId`, `userAgent`, `referrer`, `district`, `upazila`, `lang` — সব optional, length-bounded)।
- Defaults: `page = "/"`, `sessionId = "anon"` empty হলে।
- UAParser দিয়ে `browser`, `os`, `deviceType` ডিরাইভ। `ipMasked` সেভ।
- Insert into `visitorLogsTable` (truncated lengths: browser/os 100, referrer 500, district/upazila 100, lang 10)।
- Response: `{ ok: true }`। 500 on DB error।
- Per-IP rate limiting: global `globalApiLimiter` (100 req/min/IP)।

#### Admin analytics endpoints (require `requireAdmin`)

| Endpoint | Query | Returns |
|---|---|---|
| `GET /api/analytics/summary` | — | `{ total, today, last7days, last30days, uniqueSessions }` (concurrent count queries) |
| `GET /api/analytics/recent` | `limit≤200`, `offset` | latest visitor rows desc by `visitedAt` |
| `GET /api/analytics/top-pages` | `limit≤50` | `{page, count}[]` group by page |
| `GET /api/analytics/top-districts` | `limit≤50` | `{district, count}[]` (`district IS NOT NULL`) |
| `GET /api/analytics/top-upazilas` | `limit≤50` | `{upazila, count}[]` (`upazila IS NOT NULL`) |
| `GET /api/analytics/by-device` | — | `{deviceType, count}[]` |
| `GET /api/analytics/daily` | `days=1..365` (default 30) | `{date, count}[]` — missing days filled with 0 |

`daily` Postgres `to_char(date_trunc('day', ...))` দিয়ে date bucket করে।

---

## ৯. Auth ও Password লজিক

### ৯.১ `lib/auth.ts`

বর্তমান auth model: **cookie session only**। সব auth-protected admin endpoint `checkAdminAuth(req)` দিয়ে গার্ড করা — যা শুধু `ss_admin` cookie session যাচাই করে। Bearer-token / `X-Admin-Username` header path সম্পূর্ণভাবে সরিয়ে ফেলা হয়েছে।

#### Session config

| Constant | Value |
|---|---|
| `SESSION_COOKIE` | `"ss_admin"` |
| `SESSION_TTL_MS` | `8 * 60 * 60 * 1000` (8 ঘণ্টা) |
| Token | `crypto.randomBytes(32).toString("hex")` (64-char hex) |
| Storage | `adminSessionsTable` (`@workspace/db/schema`): `{ token (PK), username, expiresAt }` |

#### Cookie attributes (`setSessionCookie`/`clearSessionCookie`)

```
httpOnly: true
secure:   process.env.NODE_ENV === "production"
sameSite: "strict"
path:     "/api"   // SESSION_COOKIE_PATH — scope cookie to API only
maxAge:   SESSION_TTL_MS  (set only)
```

#### Credential Resolution Order (`verifyCredentials`)

1. DB `admin_username` / `admin_password` (siteSettingsTable)।
2. ENV `ADMIN_EMAIL` → `ADMIN_USERNAME` (username fallback)।
3. ENV `ADMIN_PASSWORD` (password fallback)।
4. Username configured না থাকলে চেক "open" (শুধু password চেক), `getCurrentUsername()` `""` রিটার্ন।

#### `verifyCredentials(submittedUsername, submittedPassword): Promise<{ok, username}>`

1. DB থেকে `admin_username` ও `admin_password` row লোড।
2. `passwordSource` resolve: `db | env | none`; `storedPassword` & `storedUsername` সেট।
3. `passwordOk = await comparePassword(p, storedPassword)`।
4. `usernameOk` = (submitted empty OR no stored username) OR `timingSafeStringEqual(u, storedUsername)`।
5. দুটোই pass → `{ok:true, username: storedUsername || u}`। Source `db` এবং stored value bcrypt না হলে → **auto-migrate**: `hashPassword(p)` করে DB-তে upsert (legacy plain-text pwd transparently migrate)।

#### Session helpers

| Function | কাজ |
|---|---|
| `createSession(username)` | Token generate, `adminSessionsTable` insert (`expiresAt = now + 8h`), token রিটার্ন। |
| `lookupSession(token)` | row fetch; না পেলে null। `expiresAt < now` → row delete (best-effort) + null। সফলে `{username}`। |
| `destroySession(token)` | DB row delete। Empty token হলে no-op। |
| `destroyAllSessions()` | `adminSessionsTable` সম্পূর্ণ truncate — সব admin device থেকে force-logout। password change-এ ব্যবহৃত। |
| `cleanupExpiredSessions()` | `WHERE expiresAt < now` সব row delete। Login-এ best-effort call, errors swallowed। |
| `setSessionCookie(res, token)` | উপরের attribute সহ `Set-Cookie: ss_admin=...`। |
| `clearSessionCookie(res)` | একই attributes দিয়ে `clearCookie`। |

#### `checkAdminAuth(req): Promise<boolean>` — flow:

1. `req.cookies["ss_admin"]` পড়ো; না থাকলে → `false`।
2. `lookupSession(token)` কল; result `null` না হলে → `true`, নাহলে → `false`।

কোন Bearer-token বা header-based fallback নেই। `verifyCredentials` শুধু `POST /admin/login`-এ ব্যবহৃত হয়।

#### `getCurrentUsername(req?)`

- `req` থাকলে আগে cookie session দেখে — valid হলে session.username।
- নাহলে DB `admin_username` → env (`ADMIN_EMAIL` → `ADMIN_USERNAME`) → `""`।

#### `timingSafeStringEqual(a, b)`

- Constant-time string compare। Length mismatch হলে `bufA.length` zero-buf এর সাথে dummy `timingSafeEqual` চালিয়ে false রিটার্ন — submitted value-এর length অনুযায়ী কাজ, stored length leak করে না।

#### `adminAuthLimiter` — express-rate-limit

| Setting | Value |
|---|---|
| windowMs | `15 মিনিট` |
| limit | `10` |
| keyGenerator | `req.ip` (trust-proxy আগেই sanitize করেছে) |
| skipSuccessfulRequests | `true` |
| `requestWasSuccessful` | শুধু HTTP 401 fail হিসেবে count (বাকি সব success) |
| Handler | `429` + `Retry-After` + `{error, retryAfterSeconds}` |

`app.set("trust proxy", "loopback, linklocal, uniquelocal")` — শুধু internal/private IP থেকে আসা `X-Forwarded-For` ট্রাস্ট করে; বাইরের attacker spoof করে limiter bypass করতে পারে না।

### ৯.২ `lib/password.ts`

| Symbol | Behaviour |
|---|---|
| `BCRYPT_PREFIX_RE` | `^\$2[abxy]\$` |
| `isBcryptHash(value)` | string-এ bcrypt prefix আছে কিনা |
| `hashPassword(plain)` | `bcrypt.hash(plain, 10)` (cost 10) |
| `comparePassword(plain, stored)` | bcrypt hash হলে `bcrypt.compare`, নাহলে plain `===` (legacy support); error ⇒ `false` |

### ৯.৩ `lib/schemas.ts` (Zod)

- `BILINGUAL_BASE_KEYS` (১৩টা): `siteName`, `siteTagline`, `siteDescription`, `prototypeNotice`, `introWhatTitle/Text`, `introHowTitle/Text`, `footerPurpose/DataSource/Disclaimer/CreditBefore/CreditAfter` — `_en`/`_bn` suffix সহ flat।
- `CONTACT_KEYS` (৫টা): `contact_email/phone/facebook/telegram/x`।
- `ALLOWED_SETTING_KEYS` = bilingual + contact keys একত্রে।
- `MAX_SETTING_VALUE_LEN = 8000`, `MAX_SETTING_KEYS_PER_REQUEST = 200`।
- **`SettingsUpdateSchema`** — `Record<string, string>` (max 8000 chars/value), keys whitelist ও 200-কী সিলিং enforce।
- **`CredentialsUpdateSchema`** — `.strict()`, `newUsername?: string(1..200, trim)`, `newPassword?: string(6..200)`; কমপক্ষে একটা থাকতে হবে।
- **`AnalyticsTrackSchema`** — `.strict()`, সব field optional & length-bounded (page≤500, sessionId≤64, userAgent≤1000, referrer≤500, district≤100, upazila≤100, lang≤10)।

### ৯.৪ `lib/validation.ts`

- `validateBody(req, res, schema)` — `safeParse`। Failure-এ `400 { error: "Invalid request body", details: [{path, message}] }` (max 20 issues, কোন value echo করা হয় না — leak prevent)। Success-এ typed data রিটার্ন।

---

## ১০. Logger ও Middleware

### ১০.১ `lib/logger.ts` (pino)

- `level` = `LOG_LEVEL` env বা `"info"`।
- **Redaction paths**: `req.headers.authorization`, `req.headers.cookie`, `req.headers['x-admin-username']`, `res.headers['set-cookie']`, `req.body.password`, `req.body.admin_password`, `req.body.newPassword`, `req.body.currentPassword`, `password`, `admin_password`, `newPassword`, `currentPassword`, `*.password`, `*.admin_password`, `*.newPassword` — censor `[REDACTED]`, remove false (key থাকে)।
- Production না হলে `pino-pretty` transport (colorized)।

### ১০.২ `app.ts` Middleware Chain

1. `app.set("trust proxy", "loopback, linklocal, uniquelocal")` — শুধু internal IP-এর `X-Forwarded-For` মানে।
2. `pinoHttp({ logger, serializers })` — req: `id, method, url (query strip)`; res: `statusCode`।
3. **Helmet CSP**: `default-src 'none'`, `frame-ancestors 'none'`, `base-uri 'none'`, `form-action 'none'`। `crossOriginResourcePolicy: cross-origin`, `referrerPolicy: no-referrer`। HSTS production-only (180 দিন, includeSubDomains)।
4. Permissions-Policy header: `camera=(), microphone=(), geolocation=(), payment=()`।
5. **CORS allowlist** (`isAllowedOrigin`):
   - `PUBLIC_SITE_ORIGIN` env (comma-separated)।
   - `*.replit.dev | *.repl.co | *.replit.app | *.{janeway,kirk,picard,riker,sisko,spock,worf}.replit.dev`।
   - `localhost | 127.0.0.1` যেকোনো port।
   - কোন Origin না থাকলে (server-to-server) allow।
   - Credentials: `true`।
   - Reject case-এ throw না করে শুধু origin echo না করে — browser নিজে block করবে, 500 noise এড়ানো।
6. `express.json({ limit: "100kb" })` ও `express.urlencoded({ extended: true, limit: "100kb" })`।
7. **`globalApiLimiter`** — `windowMs: 60s`, `limit: 100/IP`, `Retry-After` header, 429 JSON। `app.use("/api", globalApiLimiter, router)`।
8. Auth-sensitive endpoint গুলোর উপর তার উপরে `adminAuthLimiter` বসে (compose)।

### ১০.৩ `index.ts` — Bootstrap

- `PORT` env বাধ্যতামূলক; missing/invalid → throw।
- **Startup seed `seedContactDefaults()`**: `contact_email` (`admin@safeschool.live`), `contact_phone` (`+8801687476714`), `contact_facebook|telegram|x` (`""`) — `onConflictDoNothing` (existing values overwrite হয় না)।
- Seed শেষে `app.listen(port)`, error হলে process.exit(1)।

---

## ১১. Build ও Config

### ১১.১ `artifacts/schoolsafe-bd/vite.config.ts`

- Plugins: `react()`, `tailwindcss()`, `runtimeErrorOverlay()`, এবং dev-only Replit cartographer + dev-banner (only when `NODE_ENV !== "production"` and `REPL_ID` defined)।
- **Env-driven configuration**:
  - `PORT` (default `5173`) — Vite server/preview port; numeric validation।
  - `BASE_PATH` (default `/`) — Vite `base` (Replit artifact path-prefix)।
  - `VITE_SITE_URL` — যদি না থাকে: `https://${REPLIT_DEV_DOMAIN ?? "localhost:5173"}${trimmedBasePath}` derive। OG meta tags-এর জন্য absolute origin।
- `resolve.alias`: `@` → `src`, `@assets` → `../../attached_assets`। `dedupe: ["react", "react-dom"]`।
- Build output: `dist/public`, `emptyOutDir: true`।
- Server: `host: "0.0.0.0"`, `allowedHosts: true` (Replit proxy iframe origin allow), `fs.strict: true`, `fs.deny: ["**/.*"]`।
- Preview ব্লকেও একই host/port/allowedHosts।

### ১১.২ `artifacts/api-server/build.mjs` (esbuild)

- `globalThis.require = createRequire(import.meta.url)` — bundling-time plugin compat।
- Entry: `src/index.ts` → output: `dist/index.mjs` (ESM, Node platform, bundled, sourcemap linked)।
- Pre-clean: `rm -rf dist` recursive force।
- **External**: native modules (`*.node`, `sharp`, `bcrypt`, `argon2`, `re2`, …), heavy/optional vendor packages (AWS, Azure, Google Cloud, gRPC, Prisma, TypeORM, Tensorflow, Sentry profiling, Playwright, Puppeteer, Electron, ইত্যাদি ৭০+ entry) — অযথা bundle এড়ানো।
- Plugin: `esbuildPluginPino({ transports: ["pino-pretty"] })` — pino worker thread proper bundling।
- Banner: প্রতিটি bundle-এ `import { createRequire } from 'node:module'` এবং `require/__filename/__dirname` polyfill — CJS-only deps (`express` ইত্যাদি) ESM output-এ চলতে।

### ১১.৩ Environment Variables রেফারেন্স

| Variable | Used In | Purpose |
|---|---|---|
| `PORT` | api-server `index.ts`, vite | Service listen port (Replit-injected) |
| `BASE_PATH` | vite.config | Frontend artifact path prefix (Replit) |
| `VITE_SITE_URL` | vite.config / OG tags | Absolute site origin (auto-derived) |
| `REPLIT_DEV_DOMAIN` | vite.config fallback | Dev preview domain |
| `NODE_ENV` | vite, app.ts, logger | `"production"` toggles HSTS, dev plugins, pretty logs |
| `REPL_ID` | vite | Trigger Replit dev plugins |
| `LOG_LEVEL` | logger | pino log level (default `info`) |
| `PUBLIC_SITE_ORIGIN` | api-server CORS | Comma-separated production origin allowlist |
| `ADMIN_EMAIL` | api-server auth | Username fallback (preferred over `ADMIN_USERNAME`) |
| `ADMIN_USERNAME` | api-server auth | Username secondary fallback |
| `ADMIN_PASSWORD` | api-server auth | Password fallback (যদি DB-তে set না থাকে) |

### ১১.৪ Database (referenced)

- `@workspace/db` (drizzle ORM) থেকে `db` ও `siteSettingsTable`, `visitorLogsTable` import হয়।
- `siteSettingsTable` schema (inferred from usage): `key (PK)`, `value (text)`, `updatedAt (timestamp)`। `admin_username`, `admin_password` (bcrypt), `contact_*`, `<base>_en`, `<base>_bn` keys store।
- `visitorLogsTable`: `sessionId, page, ipMasked, browser, os, deviceType, referrer, district, upazila, lang, visitedAt`।

---

## পরিশিষ্ট: ফাইল-পথ ইনডেক্স

**Frontend (`artifacts/schoolsafe-bd/src/`):**
`App.tsx`, `main.tsx`, `index.css`, `pages/{Home,Admin,not-found}.tsx`, `components/*.tsx`, `contexts/{LanguageContext,SiteSettingsContext}.tsx`, `hooks/{usePageTracking.ts, use-mobile.tsx, use-toast.ts}`, `data/locations.ts`, `logic/{riskEngine,thresholds}.ts`, `translations/{en,bn}.ts`, `types/index.ts`, `utils/api.ts`, `lib/`.

**Backend (`artifacts/api-server/src/`):**
`index.ts`, `app.ts`, `routes/{index,health,settings,analytics}.ts`, `lib/{auth,password,schemas,validation,logger}.ts`, `middlewares/`.

**Config:**
`artifacts/schoolsafe-bd/vite.config.ts`, `artifacts/schoolsafe-bd/tsconfig.json`, `artifacts/api-server/build.mjs`।

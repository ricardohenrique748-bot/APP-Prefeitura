# Graph Report - .  (2026-07-15)

## Corpus Check
- 96 files · ~93,427 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 223 nodes · 319 edges · 26 communities (20 shown, 6 thin omitted)
- Extraction: 98% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.88)
- Token cost: 43,103 input · 0 output

## Community Hubs (Navigation)
- Fleet & Cost Center Management
- Maintenance & Navigation UI
- TypeScript Config
- Build Tooling Dependencies
- App Runtime Dependencies
- Mobile Build & Bootstrap
- AI-Assisted OS & Reporting
- Package Scripts & Browser Support
- Auth & Device Simulation
- PWA Manifest
- Android Instrumented Test
- Android Unit Test
- Gradle Wrapper Script
- Android Main Activity
- Capacitor Config
- Service Worker Registration
- Local Dev Setup Commands
- Service Worker Cache Assets

## God Nodes (most connected - your core abstractions)
1. `AppScreen` - 20 edges
2. `compilerOptions` - 16 edges
3. `Vehicle` - 16 edges
4. `supabase` - 11 edges
5. `OSDetail` - 10 edges
6. `CostCenter` - 8 edges
7. `Shift` - 6 edges
8. `User` - 5 edges
9. `DashboardProps` - 4 edges
10. `FleetManagementProps` - 4 edges

## Surprising Connections (you probably didn't know these)
- `AI Studio app` --semantically_similar_to--> `Smart Tech (FleetOps)`  [AMBIGUOUS] [semantically similar]
  README.md → COMO_GERAR_APK.md
- `DeviceSimulatorProps` --references--> `AppScreen`  [EXTRACTED]
  components/DeviceSimulator.tsx → types.ts
- `TireBulletinProps` --references--> `Vehicle`  [EXTRACTED]
  components/TireBulletin.tsx → types.ts
- `ChecklistHistoryProps` --references--> `Vehicle`  [EXTRACTED]
  components/ChecklistHistory.tsx → types.ts
- `CostCentersProps` --references--> `CostCenter`  [EXTRACTED]
  components/CostCenters.tsx → types.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Mobile APK build pipeline (build web -> cap sync -> Android Studio -> APK)** — como_gerar_apk_npm_run_build, como_gerar_apk_npx_cap_sync, como_gerar_apk_android_studio, como_gerar_apk_apk_file [EXTRACTED 0.90]
- **index.html app bootstrap flow (error guard, root mount, module entry)** — index_window_onerror_handler, index_root_div, index_index_tsx_entry [EXTRACTED 0.90]
- **Local dev setup flow (install deps, set API key, run dev server)** — readme_npm_install, readme_gemini_api_key, readme_env_local, readme_npm_run_dev [EXTRACTED 0.90]

## Communities (26 total, 6 thin omitted)

### Community 0 - "Fleet & Cost Center Management"
Cohesion: 0.09
Nodes (15): FALLBACK_COST_CENTERS, FALLBACK_VEHICLES, CostCentersProps, FleetManagementProps, ShiftEndProps, SupplierManagementProps, SupplierQuoteProps, TireBulletinProps (+7 more)

### Community 1 - "Maintenance & Navigation UI"
Cohesion: 0.12
Nodes (13): BacklogProps, ChecklistHistoryProps, Header(), HeaderProps, MaintenanceListProps, NavigationProps, OSControlProps, SettingsProps (+5 more)

### Community 2 - "TypeScript Config"
Cohesion: 0.08
Nodes (23): ., DOM, DOM.Iterable, ES2022, node, vite-env.d.ts, compilerOptions, allowImportingTsExtensions (+15 more)

### Community 3 - "Build Tooling Dependencies"
Cohesion: 0.10
Nodes (21): autoprefixer, devDependencies, autoprefixer, postcss, tailwindcss, @tailwindcss/postcss, terser, @types/node (+13 more)

### Community 4 - "App Runtime Dependencies"
Cohesion: 0.10
Nodes (20): @capacitor/android, @capacitor/cli, @capacitor/core, Dashboard(), @google/genai, dependencies, @capacitor/android, @capacitor/cli (+12 more)

### Community 5 - "Mobile Build & Bootstrap"
Cohesion: 0.12
Nodes (17): android project folder, Android SDK, Android Studio, generated .apk file, Capacitor, npm run build command, npx cap sync command, Smart Tech (FleetOps) (+9 more)

### Community 6 - "AI-Assisted OS & Reporting"
Cohesion: 0.24
Nodes (11): DashboardProps, OSCreate(), OSCreateProps, Reports(), ReportsProps, ShiftStartProps, generatePreventiveEmailBody(), getAiClient() (+3 more)

### Community 7 - "Package Scripts & Browser Support"
Cohesion: 0.15
Nodes (12): browserslist, name, private, scripts, build, dev, preview, type (+4 more)

### Community 8 - "Auth & Device Simulation"
Cohesion: 0.27
Nodes (5): DeviceSimulatorProps, LoginProps, Logo(), LogoProps, User

### Community 9 - "PWA Manifest"
Cohesion: 0.25
Nodes (7): background_color, display, icons, name, short_name, start_url, theme_color

### Community 10 - "Android Instrumented Test"
Cohesion: 0.60
Nodes (3): ExampleInstrumentedTest, Test, RunWith

### Community 12 - "Gradle Wrapper Script"
Cohesion: 0.83
Nodes (3): gradlew script, die(), warn()

## Ambiguous Edges - Review These
- `Smart Tech (FleetOps)` → `AI Studio app`  [AMBIGUOUS]
  README.md · relation: semantically_similar_to

## Knowledge Gaps
- **78 isolated node(s):** `FALLBACK_COST_CENTERS`, `FALLBACK_VEHICLES`, `config`, `LogoProps`, `ShiftEndProps` (+73 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Smart Tech (FleetOps)` and `AI Studio app`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **Why does `dependencies` connect `App Runtime Dependencies` to `Package Scripts & Browser Support`?**
  _High betweenness centrality (0.212) - this node is a cross-community bridge._
- **Why does `Dashboard()` connect `App Runtime Dependencies` to `AI-Assisted OS & Reporting`?**
  _High betweenness centrality (0.190) - this node is a cross-community bridge._
- **What connects `FALLBACK_COST_CENTERS`, `FALLBACK_VEHICLES`, `config` to the rest of the system?**
  _78 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Fleet & Cost Center Management` be split into smaller, more focused modules?**
  _Cohesion score 0.0944741532976827 - nodes in this community are weakly interconnected._
- **Should `Maintenance & Navigation UI` be split into smaller, more focused modules?**
  _Cohesion score 0.1225071225071225 - nodes in this community are weakly interconnected._
- **Should `TypeScript Config` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
# EcoAtlas

EcoAtlas is an immersive biodiversity web experience focused on Northern Himalayan ecosystems. It combines region-based conservation storytelling, species exploration, live environmental indicators, and a future-impact simulator in a clean, responsive interface.

## Highlights

- Multi-page React app with route-based navigation
- Interactive map built with Leaflet/OpenStreetMap layers
- Species explorer with filters, detailed inspector cards, and trend metrics
- Biodiversity tracker with search, filters, and decline signals
- Scenario simulator with climate + land-use controls, summary analytics, and projection comparisons
- Live data integration from public APIs (World Bank, Open-Meteo, GBIF)
- Local species image assets integrated into dataset

## Tech Stack

- React 19
- Vite 8
- React Router DOM
- Leaflet + React Leaflet
- ESLint

## Project Structure

```text
src/
	assets/                      # Local species images
	components/                  # Shared layout + UI primitives
	data/                        # Static regions/species/presets
	hooks/                       # Live API data hook
	pages/                       # Route pages (Home, Map, Explore, Tracker, Simulation)
	utils/                       # Biodiversity calculations and projections
	App.jsx                      # Router + page wiring
	App.css                      # Global and page-level styling
	main.jsx                     # App bootstrap
```

## Routes

- `/` Home dashboard
- `/map` Regional map and geospatial context
- `/explore` Species explorer with inspector panel
- `/tracker` Conservation tracker with trend breakdowns
- `/simulation` Scenario modeling and population projections

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start development server

```bash
npm run dev
```

### 3. Build for production

```bash
npm run build
```

### 4. Preview production build

```bash
npm run preview
```

## Data Sources

The app fetches non-authenticated public data at runtime:

- World Bank Indicators API
	- Forest area percent
	- Threatened mammals, birds, and plants counts
- Open-Meteo API
	- Current temperature, precipitation, snowfall by region
- GBIF API
	- Species occurrence counts in India for tracked scientific names

If APIs are slow or unavailable, static species and region data still powers the core experience.

## Key Features by Page

### Home
- High-level biodiversity context and live signal summary.

### Map
- Northern Himalayan region focus with map overlays and contextual region insights.

### Explore
- Region/type/risk filters.
- Species menu + detailed side inspector.
- Trend-oriented metric cards with risk and status tags.

### Tracker
- Search and filter controls for species lists.
- Live indicator chips, decline-sensitive summaries, and trend-oriented rows.

### Simulation
- Adjustable stressor sliders (warming, deforestation, human impact, glacier loss, grazing pressure, policy strength).
- Projection year control and climate signal integration.
- Ecosystem collapse index + species-level projected survivor comparisons.

## Scripts

- `npm run dev` Launch Vite dev server
- `npm run build` Build production bundle
- `npm run preview` Preview built bundle locally
- `npm run lint` Run ESLint checks

## License

This project is for educational and portfolio use.

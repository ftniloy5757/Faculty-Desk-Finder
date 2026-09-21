# BRACU CSE Faculty Desk Finder

An interactive, high-precision 2D/3D seat locator and corridor navigation system designed for the **Department of Computer Science and Engineering** at **BRAC University**.

---

## ✨ Features

- **🗺️ Dual Perspective Map (2D Blueprint ↔ 3D Isometric)**  
  Switch instantly between an orthographic 2D floor blueprint and a rich 3D isometric architectural model with hardware-accelerated CSS 3D transforms.

- **🏢 Volumetric 3D Architectural Layer**  
  - **Extruded 3D Desks:** Every faculty workstation features volumetric depth, bevels, cubicle privacy screens, mini computer displays, and initials badges.
  - **Translucent Room Partitions:** Architectural frosted glass walls with doorway cutouts enclosing Zones 4M, 4N, 4K, 4L, 4J, and 4P.
  - **Holographic Zone Badges:** Floating 3D signage elevated over room entrances with ambient status beacons.

- **⚡ Aisle-Aware Corridor Pathfinding**  
  A 77-node floor-wide interconnected corridor waypoint graph powered by Dijkstra's algorithm. Routes strictly through hallways with crisp 90° orthogonal turns into desks—no wall or furniture clipping.

- **✨ Slower 2.3s Glowing Laser Path Animation**  
  A dual-layer neon cyan laser path with SVG glow filters traces the exact route from the Main Entrance foyer straight to the faculty desk.

- **📍 3D Floating Beacon & Elevated Pin**  
  When navigation arrives at the desk, the target workstation elevates into an active state with an animated floating map pin and concentric ground ripple rings.

- **🔄 Live Faculty Synchronization Engine**  
  Automated CLI scraper (`npm run sync:faculty`) fetching verified faculty profiles, designations, emails, phone numbers, and high-res thumbnail photos directly from the official [cse.bracu.ac.bd](https://cse.bracu.ac.bd/faculty_list) portal.

- **🪟 Non-Blocking Glassmorphic HUD Card**  
  A compact floating details card docked at the bottom-right showing the faculty photo, contact info, class schedule, and official BRACU profile link, keeping the rest of the map fully interactive.

- **🔒 Campus Authentication**  
  Integrated Google OAuth restricted to the `@g.bracu.ac.bd` institutional domain, with development bypass capabilities for rapid local testing.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS & Vanilla CSS 3D Transforms
- **Animation:** [Framer Motion](https://www.framer.com/motion/)
- **Map Interaction:** `react-zoom-pan-pinch`
- **Authentication:** [NextAuth.js](https://next-auth.js.org/) (Google OAuth Provider)
- **Icons:** [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v18+ (tested on Node v20/v22/v25)
- npm or pnpm

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/ftniloy5757/Faculty-Desk-Finder.git
cd Faculty-Desk-Finder/faculty-desk-finder

# Install dependencies
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secure-secret-key
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
BYPASS_AUTH=true  # Set to true for local testing without Google OAuth
```

### 4. Running Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Syncing Live Faculty Data
To refresh faculty data and photos from `https://cse.bracu.ac.bd`:
```bash
npm run sync:faculty
```

### 6. Production Build
```bash
npm run build
npm run start
```

---

## 📁 Project Structure

```
├── public/                 # Static assets (map.png, map.jpg, logo.png)
├── scripts/
│   └── syncFaculty.mjs     # Livewire scraper for cse.bracu.ac.bd
├── src/
│   ├── app/                # Next.js App Router (pages, auth, API routes)
│   │   ├── api/auth/       # NextAuth route handlers
│   │   ├── auth/           # Minimalist sign-in page
│   │   ├── desk/[deskId]/  # Deep-link routing for desks
│   │   ├── dev/mapper/     # Interactive waypoint mapper tool
│   │   ├── faculty/[init]/ # Faculty initial redirect routes
│   │   └── page.tsx        # Main map application
│   ├── components/         # UI Components
│   │   ├── FacultyModal.tsx# Floating HUD faculty details card
│   │   ├── MapView.tsx     # Map view container & 2D/3D orchestrator
│   │   ├── SearchBar.tsx   # Instant search by name, initial, or desk ID
│   │   └── SeatMap.tsx     # 3D volumetric desks, walls, and laser path
│   ├── data/               # Core data models
│   │   ├── deskOverlays.ts # Desk coordinates and zone mappings
│   │   ├── facultyData.json# Synced faculty directory with live photos
│   │   ├── roomZones.ts    # 3D room boundaries & door definitions
│   │   └── waypoints.json  # 77-node corridor navigation mesh
│   ├── lib/
│   │   └── pathfinding.ts  # Aisle-aware Dijkstra orthogonal pathfinding
│   └── middleware.ts       # Domain restriction & session protection
└── package.json
```

---

## 📜 License
Developed for the BRAC University CSE Department. All rights reserved.

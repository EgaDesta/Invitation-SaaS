# Invitation SaaS

Platform undangan digital untuk pernikahan, ulang tahun, dan acara spesial. Dibangun dengan React, TypeScript, dan Supabase.

## Fitur

- Template premium untuk berbagai jenis acara
- Undangan dengan link personal per tamu
- Musik latar & foto cover
- RSVP online & manajemen tamu
- Countdown real-time
- Google Maps embed
- QR Code untuk setiap tamu
- Dark mode
- Dashboard pengguna & admin

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui |
| Animasi | Framer Motion |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Routing | React Router v6 |

## Mulai Cepat

```bash
# Clone
git clone https://github.com/EgaDesta/invitation-saas.git
cd invitation-saas

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env dengan kredensial Supabase kamu

# Jalankan development
npm run dev
```

## Environment Variables

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Scripts

| Command | Deskripsi |
|---------|-----------|
| `npm run dev` | Jalankan development server |
| `npm run build` | Build untuk produksi |
| `npm run preview` | Preview build produksi |

## Struktur Project

```
src/
├── pages/          # Halaman aplikasi
├── components/     # Komponen UI
├── lib/            # Utilities & auth
├── integrations/   # Supabase client
├── types/          # TypeScript definitions
└── hooks/          # Custom hooks
```
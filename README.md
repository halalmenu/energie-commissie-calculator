# Energie Commissie Calculator

Een moderne Next.js applicatie voor het berekenen en vergelijken van energie commissies per leverancier.

## Features

- 📊 **Commissie Berekening**: Bereken commissies op basis van verbruik (kWh en m³)
- 🏢 **Per Leverancier**: Vergelijk commissies tussen verschillende energie leveranciers
- 👥 **Rol-specifieke Tarieven**: Ondersteuning voor verschillende agent rollen (Standard, Morta, Noyan, Auke)
- 📅 **Contract Duur**: Ondersteuning voor 1-jarige en 3-jarige contracten
- 💰 **Tiered Pricing**: Ondersteuning voor gestaffelde tarieven (bijv. Engie)
- 🎨 **Modern UI**: Gebouwd met Shadcn/ui componenten en Tailwind CSS

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: Shadcn/ui
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Language**: TypeScript
- **Icons**: Lucide React

## Installatie

```bash
# Clone de repository
git clone https://github.com/halalmenu/energie-commissie-calculator.git

# Installeer dependencies
npm install

# Maak een .env.local bestand aan met je Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Start de development server
npm run dev
```

## Database Setup

De applicatie gebruikt Supabase voor data opslag. Zorg ervoor dat je de volgende tabellen hebt:

- `energy_suppliers` - Leveranciers
- `energy_agent_roles` - Agent rollen
- `energy_commission_rules` - Commissie regels
- `energy_tiered_rates` - Gestaffelde tarieven

## Gebruik

1. Selecteer een rol/agent
2. Kies de contractduur (1 of 3 jaar)
3. Voer het verbruik in (kWh en m³)
4. Voer het aantal EANs in
5. Klik op "Bereken Commissies"

De applicatie toont alle leveranciers met hun berekende commissies, gesorteerd van hoog naar laag.

## Commissie Berekening

- **3-jarige contracten**: Volledige commissie zoals opgegeven in de database
- **1-jarige contracten**: Commissie wordt gedeeld door 3

## Licentie

MIT

# Design Brief

## Direction

**Akshay Classes Fee Management Portal** — Premium SaaS dashboard with glassmorphism for modern educational fee tracking.

## Tone

Refined, professional, premium tech aesthetic inspired by Linear, Vercel, and Stripe. Clean hierarchy with intentional depth and confidence.

## Differentiation

Frosted glass cards with subtle blur effects, cyan-teal accent for modern tech feel, smooth micro-animations that feel responsive without distraction.

## Color Palette

| Token       | Light OKLCH       | Dark OKLCH         | Role                              |
|-------------|------------------|-------------------|-----------------------------------|
| background  | 0.99 0.005 260   | 0.12 0.01 260     | Base surface                      |
| foreground  | 0.15 0.01 260    | 0.95 0.01 260     | Primary text                      |
| card        | 1.0 0.0 0        | 0.16 0.015 260    | Elevated surfaces, cards, modals  |
| primary     | 0.5 0.22 265     | 0.72 0.18 190     | CTAs, active states               |
| accent      | 0.5 0.22 265     | 0.72 0.18 190     | Cyan-teal highlights              |
| muted       | 0.95 0.01 260    | 0.22 0.02 260     | Secondary content                 |
| destructive | 0.55 0.22 25     | 0.6 0.2 25        | Error states                      |

## Typography

- **Display**: Space Grotesk — Geometric, tech-forward, headlines
- **Body**: DM Sans — Clean, modern, readable
- **Mono**: JetBrains Mono — Data and amounts
- **Scale**: Hero `text-5xl font-bold tracking-tight` / H2 `text-3xl font-bold` / Label `text-sm uppercase` / Body `text-base`

## Elevation & Depth

Layered depth through glass cards with `backdrop-blur-md`, soft shadows, transparent borders at 30-50% opacity. Dark mode uses 0.12 L background, 0.16 L cards.

## Structural Zones

| Zone    | Background          | Border       | Notes                        |
|---------|---------------------|--------------|------------------------------|
| Header  | glass-header        | border-b/40  | Frosted glass, gradient      |
| Sidebar | bg-sidebar/10       | border-r/20  | Semi-transparent             |
| Content | bg-background       | —            | Alternate card sections      |
| Cards   | glass-card backdrop | border/30-50 | 12px radius, hover scale     |
| Footer  | bg-muted/20         | border-t/40  | Minimal, aligned             |

## Spacing & Rhythm

24px section gaps, 16px card padding, 4-8px micro-spacing. Generous whitespace for premium productivity feel.

## Component Patterns

- **Buttons**: Solid primary, rounded-lg, soft shadow on hover, cyan accent for CTAs
- **Cards**: glass-card backdrop blur, 12px radius, transparent border, hover scale +2%
- **Badges**: Rounded-full, muted background, colored text
- **Forms**: Cyan focus ring, clean focus state, muted placeholder

## Motion

- **Entrance**: `slide-up` + `fade-in` (0.3s) for sections, `scale-in` for modals
- **Hover**: `transition-fast` (0.2s), subtle scale 1.02x or shadow elevation
- **Decorative**: `float` (6s infinite), `pulse-soft` (3s infinite) for pending states
- **Transitions**: `fade-in` (0.3s) with staggered children

## Constraints

- Chroma under 0.25 (except chart accents)
- Blur only on cards/modals
- Animations max 0.5s
- All colors via CSS variables
- Dark mode tuned per zone

## Signature Detail

Glassmorphism cards with `backdrop-blur-md` + transparent borders (30-50% opacity), cyan-teal accents, soft elevation shadows. Premium SaaS distinctiveness comparable to Linear and Vercel.

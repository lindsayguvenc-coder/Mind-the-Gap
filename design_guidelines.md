# Mind the Gap - Design Guidelines

## Design Approach

**Selected Framework:** Material Design principles adapted for data-focused applications, drawing inspiration from data visualization tools like Observable, Tableau Public, and analytical dashboards like Linear's metrics views.

**Core Principles:**
- Data-first hierarchy: Statistics are the hero, UI supports but doesn't compete
- Credible authority: Clean, professional presentation that establishes trust
- Scannable structure: Quick comprehension of multiple metrics simultaneously
- Purposeful density: Information-rich without overwhelming

## Color Palette

**Brand Colors:**
- Primary Blue: #5271bf - Main actions, primary buttons, links
- Purple: #b573c3 - Leadership, authority
- Pink: #fa7aab - Maternal health, care
- Coral: #ff9686 - Healthcare, wellness
- Salmon: #ff9686 - Energy, activity
- Yellow: #f9f871 - Optimism, highlight (reserved for future use)

**Statistic-Specific Colors:**
Each statistic has its own unique color for visual differentiation:
- Gender Pay Gap: #5271bf (Blue) - Professional, authoritative
- Leadership Representation: #b573c3 (Purple) - Power, leadership
- Maternal Mortality Rate: #fa7aab (Pink) - Maternal care, compassion
- Contraceptive Access: #ff9686 (Coral) - Health, wellness
- Workforce Participation: #ff9686 (Salmon) - Energy, productivity

**Application:**
- Backgrounds: Pure white (light mode), very dark gray #131419 (dark mode)
- Cards: Off-white #fafafa (light mode), dark gray #1c1d24 (dark mode)
- Borders: Subtle grays derived from light gray palette
- Interactive elements: Primary blue for buttons, hover states use elevation system
- Charts: Each statistic uses its specific color for line charts and icon backgrounds
- Badges & Share Cards: Background color matches the statistic being displayed

**Supported Locations:**
The application supports 5 geographic locations:
- Global (worldwide aggregate data)
- United States
- United Kingdom
- Canada
- Mexico

## Typography System

**Font Stack:**
- Primary: Inter (via Google Fonts) - for UI and data labels
- Data Display: JetBrains Mono - for numerical statistics (monospaced for alignment)

**Hierarchy:**
```
Dashboard Title: text-4xl font-bold
Metric Titles: text-lg font-semibold
Primary Data Values: text-6xl font-bold (JetBrains Mono)
Supporting Details: text-sm font-normal
Data Sources: text-xs font-medium opacity-70
Button Text: text-base font-medium
```

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, and 12 consistently
- Component padding: p-6 or p-8
- Section gaps: gap-6 or gap-8
- Card margins: m-4 or m-6
- Icon sizes: w-6 h-6 or w-8 h-8

**Grid Structure:**
- Dashboard: 2-column grid on desktop (lg:grid-cols-2), single column mobile
- Statistics cards: Minimum 3 rows for all 5 metrics
- Badge selector: Single column centered layout, max-w-2xl
- Full dashboard view: max-w-7xl container

## Component Library

### Dashboard View
**Statistics Cards:**
- Grid layout with equal-height cards
- Each card contains: Icon (top-left), metric title, large numerical value (center-dominant), detailed description, data source citation
- Generous internal padding (p-8)
- Subtle elevation with shadow-lg
- Rounded corners: rounded-xl

**Header Section:**
- Logo/title on left
- Country selector (dropdown) and view toggle on right
- Refresh button with loading state indicator
- Last updated timestamp (small, unobtrusive)
- Bottom border separator

### Badge Selector View
**Centered Card Layout:**
- Single focused card: max-w-2xl, centered
- Large preview area showing live badge
- Statistic selector: Button group or segmented control
- Country selector: Dropdown below stat selector
- Embed code box: Monospace font, copyable, rounded-lg border
- Copy button with success state (checkmark animation)

### Shared Elements
**Buttons:**
- Primary actions: px-6 py-3, rounded-lg, font-medium
- Icon buttons: p-3, rounded-full
- Button groups: gap-2, inline-flex

**Icons:**
- Library: Lucide React (already in code)
- Size: w-6 h-6 for cards, w-5 h-5 for buttons
- Placement: Always paired with text or as standalone in icon buttons

**Form Controls:**
- Dropdowns: Full width on mobile, auto-width desktop
- Rounded: rounded-lg
- Padding: px-4 py-2

## Data Visualization Principles

**Numerical Emphasis:**
- Large, bold numbers draw immediate attention
- Use JetBrains Mono for all statistics to ensure proper alignment
- Place primary value at visual center of each card

**Metric Differentiation:**
- Each metric gets distinct icon (from Lucide)
- Icon positioned top-left of card for immediate recognition
- Consistent icon-to-content spacing (mb-4)

**Context Layering:**
1. Primary: Large number (what)
2. Secondary: Metric title (category)
3. Tertiary: Detailed explanation (context)
4. Quaternary: Source citation (credibility)

## Page Structure

### Badge Generator (Default View)
```
[Header: Logo + Back to Dashboard]
[Main Card - Centered, max-w-2xl]
  - Preview Section (badge visualization)
  - Stat Selector (horizontal button group)
  - Country Selector (dropdown)
  - Embed Code Box (with copy button)
[Footer: Minimal, source links]
```

### Dashboard View
```
[Header: Logo + Country Selector + Refresh + View Toggle]
[Statistics Grid: 2-col desktop, 1-col mobile]
  - Pay Gap Card
  - Leadership Card
  - Maternal Mortality Card
  - Contraceptive Access Card
  - Workforce Participation Card
[Footer: Data sources, methodology link]
```

## Interaction Patterns

**State Indicators:**
- Loading: Spinner icon (RefreshCw with spin animation) + skeleton states for cards
- Success: Brief checkmark animation on copy action
- Error: Inline error message below affected component (text-sm)

**Transitions:** Keep minimal
- Button hover: Subtle opacity change only
- Card interactions: No hover effects (this is informational)
- View switching: Instant swap, no fade

## Accessibility

- All icons have accompanying text labels
- Copy button shows both icon and "Copy" text
- Color is never the only differentiator (icons + text always paired)
- Focus states: 2px outline on all interactive elements
- Skip to content link for keyboard navigation

## Responsive Behavior

**Breakpoints:**
- Mobile (< 768px): Single column, full-width cards
- Desktop (≥ 768px): Multi-column grid, max-w-7xl container

**Mobile Adaptations:**
- Statistics: Stack vertically with full width
- Header: Logo above, controls below (vertical stack)
- Data values: Maintain size (text-6xl) for impact
- Padding reduction: p-6 on mobile vs p-8 desktop
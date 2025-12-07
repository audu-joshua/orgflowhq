<!-- 52418932-e003-4dfa-bc3d-e086d3a62e18 6dcdc997-7894-4cf4-8771-3e72edfd6543 -->
# Theme Switcher & Dark Mode Implementation Plan

## Current State Analysis

**What's Working:**

- ThemeProvider exists and works correctly (already in Navbar)
- CSS variables properly defined for light/dark themes in `app/globals.css`
- Root layout has ThemeProvider wrapper

**Problems Found:**

1. **Sidebar** (`src/components/layout/Sidebar.tsx`): Uses hardcoded colors (`bg-white`, `text-gray-900`, `bg-blue-50`) - NOT theme-aware
2. **TopBar** (`src/components/layout/TopBar.tsx`): Uses hardcoded colors (`bg-white`, `bg-blue-100`) - NOT theme-aware
3. **No theme switcher** in dashboard area (only exists in main Navbar)
4. **Dashboard components** use hardcoded colors:

- `StatCard.tsx` - hardcoded white/gray
- `RoleCard.tsx` - hardcoded white/gray
- `DashboardContent.tsx` - hardcoded gray text
- `ApplicationsContent.tsx` - hardcoded white/gray
- `RoleDetail.tsx` - hardcoded white/gray

## Implementation Steps

### 1. Add Theme Switcher to Sidebar

**File:** `src/components/layout/Sidebar.tsx`

- Import `useTheme` from ThemeProvider
- Add theme toggle button at bottom (above Sign Out)
- Use Lucide icons: `Sun` and `Moon`
- Replace ALL hardcoded colors with theme tokens:
- `bg-white` → `bg-sidebar`
- `border-gray-200` → `border-sidebar-border`
- `text-gray-900` → `text-sidebar-foreground`
- `bg-blue-50 text-blue-600` → `bg-sidebar-primary/10 text-sidebar-primary`
- `text-gray-700 hover:bg-gray-50` → `text-sidebar-foreground hover:bg-sidebar-accent`

### 2. Update TopBar for Dark Theme

**File:** `src/components/layout/TopBar.tsx`

- Replace hardcoded colors:
- `bg-white` → `bg-card`
- `border-gray-200` → `border-border`
- `bg-blue-100 text-blue-600` → `bg-primary/10 text-primary`
- `text-gray-900` → `text-foreground`

### 3. Update Dashboard Components

**StatCard.tsx:**

- `bg-white` → `bg-card`
- `border-gray-200` → `border-border`
- `text-gray-600` → `text-muted-foreground`
- `text-gray-900` → `text-foreground`
- `text-blue-600` → `text-primary`

**RoleCard.tsx:**

- `bg-white` → `bg-card`
- `border-gray-200` → `border-border`
- `text-gray-900` → `text-foreground`
- `text-gray-600` → `text-muted-foreground`
- `bg-blue-100 text-blue-600` → `bg-primary/10 text-primary`

**DashboardContent.tsx:**

- `text-gray-900` → `text-foreground`
- `bg-blue-600 hover:bg-blue-700 text-white` → `bg-primary hover:bg-primary/90 text-primary-foreground`

**ApplicationsContent.tsx:**

- `text-gray-900` → `text-foreground`
- `bg-white` → `bg-card`
- `border-gray-200` → `border-border`
- `border-gray-300` → `border-input`
- `focus:ring-blue-500` → `focus:ring-ring`

**RoleDetail.tsx:**

- All hardcoded colors replaced with theme tokens
- `bg-white` → `bg-card`
- `text-gray-*` → appropriate theme tokens
- `text-blue-*` → `text-primary`

### 4. Update Roles Page

**File:** `app/dashboard/roles/page.tsx`

- `text-gray-900` → `text-foreground`
- `bg-blue-600 hover:bg-blue-700` → `bg-primary hover:bg-primary/90 text-primary-foreground`

## Files to Modify (7 total)

1. `src/components/layout/Sidebar.tsx` - Add theme switcher + fix colors
2. `src/components/layout/TopBar.tsx` - Fix colors
3. `src/features/dashboard/components/StatCard.tsx` - Fix colors
4. `src/features/dashboard/components/RoleCard.tsx` - Fix colors
5. `src/features/dashboard/components/DashboardContent.tsx` - Fix colors
6. `src/features/applications/components/ApplicationsContent.tsx` - Fix colors
7. `src/features/roles/components/RoleDetail.tsx` - Fix colors
8. `app/dashboard/roles/page.tsx` - Fix button colors

## Expected Outcome

- Theme switcher accessible in dashboard sidebar (moon/sun icon)
- All dashboard components properly respect light/dark theme
- Smooth transitions between themes
- Consistent color scheme across all pages
- No more hardcoded `gray-*` or `blue-*` colors in dashboard area

### To-dos

- [x] Add theme switcher button to Sidebar with Sun/Moon icons and update all hardcoded colors to theme tokens
- [x] Replace all hardcoded colors in TopBar with theme-aware tokens
- [x] Update StatCard and RoleCard components with theme tokens
- [x] Fix colors in DashboardContent component
- [x] Update ApplicationsContent with proper theme colors
- [x] Update RoleDetail component with theme tokens
- [x] Fix button colors in roles list page
- [x] Test theme switching across all dashboard pages to ensure consistency
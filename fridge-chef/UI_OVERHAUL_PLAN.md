# Fridge Chef - UI/UX Overhaul Plan

## Design Vision
**Visual Style:** "Modern grocery + AI assistant"
- Clean, high-contrast, slightly warm neutrals
- Softer rounded corners (12-16px), consistent elevation
- Strong typography hierarchy
- Fewer heavy borders, more surfaces and subtle separators

## Implementation Status

### ✅ Phase 1: Design System Foundation
- [ ] Theme tokens (colors, spacing, typography)
- [ ] Reusable component library
- [ ] Typography system
- [ ] Layout grid system

### Phase 2: Screen Redesigns
- [ ] Home (Capture Ingredients)
- [ ] Preview Image
- [ ] Loading ("Creating Your Recipe")
- [ ] Recipe Details
- [ ] My Fridge
- [ ] AI Shopping Suggestions Modal
- [ ] Recipes List
- [ ] Settings

### Phase 3: Polish
- [ ] States (loading, empty, error, success)
- [ ] Accessibility improvements
- [ ] Final cleanup

---

## Design System

### Color Tokens
```typescript
// Brand & Surfaces
bg: #FFFFFF (app background)
surface: #F9FAFB (cards, modals)
surfaceElevated: #FFFFFF with shadow

// Text
text: #111827 (primary text)
textMuted: #6B7280 (secondary text)
textLight: #9CA3AF (tertiary/hints)

// Brand
primary: #10B981 (emerald green - fresh, food)
primaryMuted: #D1FAE5
primaryDark: #059669
primaryTextOn: #FFFFFF

// Semantic
danger: #EF4444
warning: #F59E0B
success: #10B981
info: #3B82F6

// UI Elements
border: #E5E7EB
divider: #F3F4F6
disabled: #D1D5DB

// Shadows
shadow: rgba(0, 0, 0, 0.1)
```

### Typography Scale
```typescript
H1: 32px / 600 / 40px line-height (screen titles)
H2: 24px / 600 / 32px (section headers)
H3: 20px / 600 / 28px (subsection headers)
Body: 16px / 400 / 24px (default text)
BodyMuted: 16px / 400 / 24px + muted color
Caption: 14px / 400 / 20px (metadata)
Small: 12px / 400 / 16px (tiny labels)
ChipLabel: 14px / 500 / 20px (tags)
```

### Spacing Scale
```typescript
4, 8, 12, 16, 20, 24, 32, 48
Screen horizontal padding: 16px
Card padding: 16px
Section spacing: 24px
```

### Component Library
- `Screen` - Safe area wrapper with consistent background
- `Card` - Rounded container with consistent shadow/elevation
- `PrimaryButton` / `SecondaryButton` / `TertiaryButton`
- `IconButton` - Circular icon-only button
- `TextField` - Input with label, icon, clear button
- `Chip` - Small tag/category pill
- `ListRow` - Ingredient/recipe list item
- `EmptyState` - Icon + message + optional CTA
- `BottomSheetModal` - For AI suggestions
- `Toast` - Success/error feedback

---

## Screen-by-Screen Redesign

### A) Home (Capture Ingredients)
**Current:** Empty area with centered card and two buttons
**New:**
- Top greeting: "Fridge Chef" + tagline
- Large primary CTA: "Scan Ingredients" 
- Secondary button: "Upload Photo"
- "How it works" mini-section (3 steps)
- Empty state illustration
- Clean, welcoming layout

**Components:**
- `Screen` wrapper
- `PrimaryButton` (Scan)
- `SecondaryButton` (Upload)
- Info cards for steps

### B) Preview Image
**Current:** Simple preview with retake/confirm
**New:**
- Clean card layout
- Image with proper aspect ratio + rounded corners
- Helper text: "Make sure ingredients are visible"
- Tertiary "Retake" button (left)
- Primary "Generate Recipe" button (right)
- Optional: Crop icon button

**Components:**
- `Card` for image preview
- `TertiaryButton` (Retake)
- `PrimaryButton` (Generate)
- Caption text

### C) Loading: "Creating Your Recipe"
**Current:** Spinner + text
**New:**
- Progress card with animated indicator
- Rotating tips ("Finding recipes...", "Checking pantry...")
- Subtle info banner: "Usually takes 10-15 seconds"
- Optional cancel/back affordance

**Components:**
- `Card` with loading state
- Animated text rotator
- Info banner

### D) Recipe Details
**Current:** Basic layout with all sections stacked
**New:**
- Hero: Recipe title + short description
- Chips row (Quick, Easy, Snack)
- Stats row: 3 small cards (Time, Servings, Difficulty) with icons
- Nutrition: 4-column metric grid (or 2x2 on small screens)
- Ingredients: grouped by category, list rows with bullets
- Instructions: stepper cards with numbered circles + time badges
- Bottom action bar: Primary "Share" + Danger "Delete"

**Components:**
- Hero section with `H1` and `Body`
- `Chip` array
- Stat `Card` components
- `ListRow` for ingredients
- Step cards with numbers
- `PrimaryButton` + danger-outline button

### E) My Fridge
**Current:** Search, clear all, list, AI button
**New:**
- Title + subtitle "Track what you have"
- Search field with icon + clear button
- Optional filter chips ("All", "Expiring soon")
- "Clear All" becomes text button in header/overflow
- Ingredient list: card rows with name, date, quantity
- Swipe actions for delete
- AI Suggestions card: sparkle icon, title, helper text, CTA
- Loading state in AI card

**Components:**
- `Screen` wrapper
- `TextField` for search
- Filter `Chip` array
- `ListRow` for each ingredient
- Prominent AI suggestion `Card`
- `PrimaryButton` for AI trigger

### F) AI Shopping Suggestions Modal
**Current:** Modal with shopping list + recipes
**New:**
- Bottom sheet with header + close icon
- Two tabs/segmented control: "Shopping List" | "Recipes"
- Shopping List: checklist style
- Recipes: card rows with icon + reason
- "Share Shopping List" sticky bottom button
- Empty/loading/error states

**Components:**
- `BottomSheetModal`
- Segmented control
- Checklist items
- Recipe `Card` rows
- Sticky `PrimaryButton`

### G) Recipes List
**Current:** Simple list with search
**New:**
- Header: "Recipes" + count ("3 recipes saved")
- Search field (consistent with My Fridge)
- Recipe cards: title, preview, metadata row (time, servings), difficulty chip, tags
- Empty state: "Scan ingredients to create your first recipe" + CTA
- Cards look tappable

**Components:**
- `Screen` wrapper
- `TextField` for search
- Recipe `Card` components
- `EmptyState` component
- `Chip` for tags

### H) Settings
**Current:** Stats, preferences, dietary restrictions (empty), about
**New:**
- Grouped sections with labels:
  - Account (if exists)
  - Preferences (notifications toggle, default servings)
  - Dietary Restrictions (CTA even if stubbed)
  - About (version, description)
- Consistent toggle/segmented control styling
- Subtle footnotes for destructive actions

**Components:**
- `Screen` wrapper
- Section headers
- Toggle switches
- Segmented controls
- List rows

---

## Quality Bar

### States Checklist
- [ ] Loading (buttons with spinner, disabled)
- [ ] Empty (My Fridge, Recipes)
- [ ] Error (camera permission, API, parse failure)
- [ ] Success (saved, shared, deleted)

### Accessibility
- [ ] 44px minimum tap targets
- [ ] Color contrast meets WCAG AA
- [ ] Dynamic text sizing support
- [ ] Keyboard handling (no UI jumping)
- [ ] SafeAreaView / insets correct

### Polish
- [ ] Consistent padding/margins across all screens
- [ ] Icon sizes consistent
- [ ] Animation timing smooth (if any)
- [ ] No dead/unused styles in files

---

## Testing Checklist

### Functional
- [ ] Camera opens and captures
- [ ] Gallery picker works
- [ ] Generate recipe creates and saves
- [ ] Recipe details display correctly
- [ ] Share recipe works
- [ ] Delete recipe works
- [ ] AI shopping suggestions trigger
- [ ] Share shopping list works
- [ ] Search filters correctly
- [ ] Clear all removes items
- [ ] Settings toggles persist
- [ ] Swipe to delete works

### Visual
- [ ] No inconsistent button styles
- [ ] Typography hierarchy clear
- [ ] Spacing consistent across tabs
- [ ] Loading states intentional
- [ ] Empty states clear and helpful
- [ ] All screens use design system

---

## Before/After Notes

### Key Changes Made
*To be filled in as implementation proceeds*

1. **Design System:**
   - Implemented comprehensive theme tokens
   - Created reusable component library
   - Established typography and spacing scales

2. **Home Screen:**
   - TBD

3. **Recipe Details:**
   - TBD

4. **My Fridge:**
   - TBD

5. **Settings:**
   - TBD

### Components Created
*Component inventory to be updated as built*

### Files Modified
*List of all files changed during overhaul*

### Known Issues / Future Work
*Any deferred items or follow-ups*

---

## Implementation Timeline

**Estimated effort:** 4-6 hours
- Phase 1 (Design System): 1-2 hours
- Phase 2 (Screens): 3-4 hours
- Phase 3 (Polish): 1 hour

**Order of execution:**
1. Theme tokens + typography
2. Component library
3. Home → Preview → Loading → Recipe Details
4. Recipes list → My Fridge → AI modal → Settings
5. States + accessibility + cleanup

# Planning Guide

A web-based hexagonal radar chart tool for visualizing and comparing multi-dimensional competency assessments, allowing users to create, store, and analyze potential profiles across six key dimensions.

**Experience Qualities**:
1. **Analytical** - Provides clear visual representation of strengths and weaknesses across multiple dimensions
2. **Efficient** - Quick data entry with intuitive controls for creating and comparing multiple profiles
3. **Professional** - Clean, modern design suitable for educational and career development contexts

**Complexity Level**: Light Application (multiple features with basic state)
This is a focused data visualization tool with CRUD operations for managing multiple radar chart profiles, requiring local persistence and interactive charting capabilities.

## Essential Features

### Radar Chart Visualization
- **Functionality**: Renders an interactive hexagonal radar chart with six dimensions, showing data points connected by lines with a filled area
- **Purpose**: Provides immediate visual feedback of competency levels across all dimensions
- **Trigger**: Automatically updates when dimension values change or when switching between saved profiles
- **Progression**: Load data → Calculate polygon points → Render SVG chart → Display labels → Apply styling
- **Success criteria**: Chart accurately reflects all six dimension values, is visually clear, and updates smoothly

### Dimension Configuration
- **Functionality**: Allows users to customize the names of all six dimensions while maintaining default Chinese labels
- **Purpose**: Enables adaptation to different evaluation frameworks beyond the default competency model
- **Trigger**: User clicks edit button next to dimension names
- **Progression**: Click edit → Input field appears → Enter new name → Confirm → Chart updates with new labels
- **Success criteria**: All dimension names are editable, changes persist in storage, and chart labels update immediately

### Value Selection (High/Medium/Low)
- **Functionality**: Provides slider or select controls for each dimension with three discrete levels
- **Purpose**: Simplifies data entry while maintaining meaningful granularity
- **Trigger**: User interacts with value controls for each dimension
- **Progression**: Select dimension → Choose value (低/中/高) → Chart updates in real-time → Save to storage
- **Success criteria**: All six dimensions have value controls, changes reflect instantly in the chart

### Profile Management
- **Functionality**: Create, save, view, edit, and delete multiple named radar chart profiles
- **Purpose**: Allows comparison of different individuals, time periods, or scenarios
- **Trigger**: User clicks "Add New Profile" or selects existing profile from list
- **Progression**: Create profile → Enter name → Set dimension values → Save → Appears in list → Can be selected/edited/deleted
- **Success criteria**: Users can manage unlimited profiles, switch between them seamlessly, and all data persists

### Profile List View
- **Functionality**: Displays all saved profiles in a sidebar or list with thumbnails/names
- **Purpose**: Provides quick access to all stored assessments for comparison
- **Trigger**: Sidebar is always visible or toggleable
- **Progression**: View list → See profile names → Click to load → View in main chart area
- **Success criteria**: All profiles are visible, searchable, and selectable; list updates when profiles are added/removed

## Edge Case Handling

- **Empty State**: Display welcome message with instructions when no profiles exist
- **Single Dimension Change**: Ensure chart updates smoothly without jarring transitions
- **Duplicate Names**: Allow duplicate profile names or append timestamp to prevent confusion
- **Data Migration**: Handle gracefully if dimension names change after profiles are created
- **Invalid Values**: Constrain inputs to valid ranges and provide visual feedback
- **Large Profile Lists**: Implement scrolling for more than 10-15 profiles

## Design Direction

The design should evoke precision, clarity, and professionalism, reflecting the analytical nature of competency assessment. The interface should feel structured yet approachable, combining data visualization aesthetics with clean modern UI patterns. Think educational dashboards and professional development tools.

## Color Selection

A professional blue-based palette with strong contrast for data visualization:

- **Primary Color**: Deep Ocean Blue (oklch(0.45 0.15 250)) - Conveys trust, professionalism, and analytical thinking; used for main chart lines and primary actions
- **Secondary Colors**: 
  - Soft Steel Gray (oklch(0.70 0.01 250)) - Supporting UI elements and backgrounds
  - Light Cloud (oklch(0.96 0.005 250)) - Card backgrounds and subtle containers
- **Accent Color**: Vibrant Cyan (oklch(0.70 0.18 220)) - Highlights, active states, and call-to-action elements
- **Foreground/Background Pairings**: 
  - Primary (Deep Ocean Blue oklch(0.45 0.15 250)): White text (oklch(0.99 0 0)) - Ratio 8.2:1 ✓
  - Accent (Vibrant Cyan oklch(0.70 0.18 220)): Dark text (oklch(0.20 0.01 250)) - Ratio 10.5:1 ✓
  - Background (White oklch(0.99 0 0)): Main text (oklch(0.20 0.01 250)) - Ratio 18.1:1 ✓

## Font Selection

Typography should balance technical precision with readability, suitable for data-heavy interfaces:

- **Primary Font**: Inter - Clean geometric sans-serif for excellent readability in UI elements
- **Accent Font**: JetBrains Mono - For numerical values and data labels, adding technical sophistication

- **Typographic Hierarchy**:
  - H1 (Page Title): Inter Bold/32px/tight spacing - "潜力六边形雷达图"
  - H2 (Section Headers): Inter Semibold/20px/normal spacing - Profile names, section titles
  - H3 (Dimension Labels): Inter Medium/16px/normal spacing - Chart axis labels
  - Body (UI Text): Inter Regular/14px/relaxed line-height (1.6) - Instructions, descriptions
  - Data Labels: JetBrains Mono Medium/13px/tabular nums - Value indicators

## Animations

Animations should emphasize data transitions and provide smooth feedback for interactions:

- **Chart Transitions**: 400ms ease-in-out transitions when switching between profiles, with polygon morphing smoothly between states
- **Value Changes**: 200ms spring animations when adjusting sliders, with the chart updating in real-time
- **List Interactions**: Subtle 150ms fade and slide when adding/removing profiles
- **Hover States**: 100ms color transitions on interactive elements
- **Loading States**: Gentle pulse animation if rendering complex charts

## Component Selection

- **Components**:
  - **Card**: Main container for radar chart visualization and profile editor
  - **Slider**: For selecting high/medium/low values with custom marks
  - **Input**: For editing dimension names and profile names
  - **Button**: Primary actions (save, add profile) and secondary actions (edit, delete)
  - **ScrollArea**: For profile list when many items exist
  - **Dialog**: For confirming deletions and editing dimension configurations
  - **Separator**: Visual dividers between sections
  - **Label**: Accessible labels for form controls
  - **Badge**: To show value levels (高/中/低) with color coding

- **Customizations**:
  - Custom SVG radar chart component using D3.js for precise control over hexagonal layout
  - Styled sliders with three discrete positions and Chinese labels
  - Profile cards with thumbnail preview of radar chart
  - Custom color scheme for chart fill and stroke

- **States**:
  - Buttons: Distinct hover (scale 1.02), active (scale 0.98), disabled (opacity 0.5)
  - Sliders: Active track highlight, larger thumb on hover
  - Profile cards: Border highlight on hover, selected state with accent border
  - Inputs: Focus ring with primary color, error state with destructive color

- **Icon Selection**:
  - Plus (for adding new profile)
  - Pencil (for editing dimension names/profiles)
  - Trash (for deleting profiles)
  - Copy (for duplicating profiles)
  - ChartRadar or Pentagon (for profile list items)

- **Spacing**:
  - Page padding: p-6 (24px)
  - Card padding: p-6 (24px)
  - Section gaps: gap-6 (24px)
  - Form field spacing: gap-4 (16px)
  - Inline element spacing: gap-2 (8px)

- **Mobile**:
  - Stack chart above controls on mobile (< 768px)
  - Profile list collapses into a dropdown or drawer on small screens
  - Reduce chart size to fit mobile viewport
  - Touch-friendly slider controls with larger hit areas
  - Bottom sheet for profile management on mobile

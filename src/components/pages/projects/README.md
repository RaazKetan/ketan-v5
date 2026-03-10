# Projects Page - Interactive 2D Office Simulation

## Overview
An innovative, living portfolio visualization where your projects are represented as animated pixel art characters working in a 2D office environment. Characters perform different activities in real-time, creating a dynamic and engaging way to showcase your work.

## Features

### 🏢 2D Office Environment
- **Realistic Office Layout**: Complete with desks, chairs, computers, plants, and bookshelves
- **Pixel Art Aesthetic**: Retro-inspired design with crisp pixel rendering
- **Interactive Space**: Click characters to view project details
- **Dynamic Floor Plan**: Customizable office layout with furniture placement

### 🎮 Animated Characters
Each project is represented by a unique character that performs various activities:

- **💻 Typing (Coding)**: Character actively working on code
- **📖 Reading (Analyzing)**: Character reviewing documentation or files
- **🚶 Walking (Deploying)**: Character moving between workstations
- **⏳ Waiting (Idle)**: Character waiting for tasks
- **💤 Idle**: Character in rest state

### 🎨 Real-Time Activity Simulation
- **Activity Cycling**: Characters automatically change activities every 2 seconds
- **Pathfinding**: Walking characters move smoothly to random destinations
- **Direction Awareness**: Characters face the direction they're moving
- **Contextual Animations**: Different animations for each activity state

### 📊 Live Statistics
Real-time dashboard showing:
- Total active projects
- Number of characters coding
- Number of characters reading
- Number of characters moving

### 🎯 Interactive Elements
- **Click Characters**: Select any character to view detailed project information
- **Selection Indicator**: Visual feedback showing selected character
- **Activity Labels**: Floating labels showing current activity
- **Glow Effects**: Characters pulse with their project's color

### 📱 Project Modal
Detailed project information displayed in a retro-styled modal:
- Project name and description
- Technology stack with pixel-style tags
- Live demo link (if available)
- Source code repository link
- Themed color scheme matching the character

## Office Objects

### Furniture & Decorations
- **Desks**: Workstations where characters perform tasks
- **Chairs**: Seating areas (clickable for future features)
- **Computers**: Monitors showing active work
- **Plants**: Decorative greenery
- **Bookshelves**: Reference materials
- **Walls**: Office boundaries

## Customization

### Adding Projects
Edit `src/context/PersonalDataContext.tsx` to add projects:

```typescript
{
  id: "unique-id",
  name: "Project Name",
  description: "Detailed project description",
  tech: ["React", "Node.js", "MongoDB"],
  liveLink: "https://example.com",
  sourceCode: "https://github.com/username/repo",
  color: "#3b82f6", // Character color
}
```

### Customizing Office Layout
Modify the `generateOfficeLayout()` function in `Projects.tsx`:

```typescript
const generateOfficeLayout = (): OfficeObject[] => {
  const objects: OfficeObject[] = [];
  
  // Add custom furniture
  objects.push({
    id: "custom-desk",
    type: "desk",
    position: { x: 200, y: 200 },
    width: 80,
    height: 50,
  });
  
  return objects;
};
```

### Activity Behavior
Adjust activity change frequency in the `useEffect` interval:

```typescript
// Change from 2000ms to your preferred interval
const interval = setInterval(() => {
  // Activity logic
}, 2000);
```

## Technical Implementation

### State Management
- **Characters State**: Tracks position, activity, direction for each project
- **Selected Character**: Manages which character is currently selected
- **Office Objects**: Static furniture and decoration positions

### Animation System
- **GSAP**: Page entrance animations and navbar interactions
- **Framer Motion**: Character animations, activity states, modal transitions
- **CSS Animations**: Pixel art rendering and glow effects

### Activity Logic
1. Characters initialize at workstation positions
2. Every 2 seconds, random activity changes occur
3. Walking characters calculate paths to random destinations
4. Characters move smoothly using position interpolation
5. Direction updates based on movement vector

## Performance Optimizations
- **Efficient Re-renders**: State updates batched for multiple characters
- **CSS Transforms**: GPU-accelerated animations
- **Conditional Rendering**: Only active elements animated
- **Optimized SVG**: Lightweight pixel art characters

## Responsive Design
- Scales office view on different screen sizes
- Touch-friendly character selection
- Adaptive UI elements
- Mobile-optimized modal

## Future Enhancements
- Drag-and-drop office layout editor
- Custom character designs per project
- Sub-project support (characters spawning helpers)
- Click chairs to reassign character positions
- Save/load custom office layouts
- More activity types (meetings, breaks, etc.)
- Character interactions and collaborations

## Inspiration
Based on the concept of visualizing agent activity in development environments, adapted to showcase portfolio projects as living, working entities in a virtual office space.

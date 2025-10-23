# Safarys AI Journey Orchestrator - Development Summary

## 🏗️ **Architecture Overview**
React-based journey orchestration tool with drag-and-drop node editor, AI integration, and resizable UI components.

## 📁 **File Structure**

### **Core Components**
- `src/app/dashboard/page.tsx` - Main dashboard with React Flow canvas
- `src/components/nodes/JourneyNode.tsx` - Individual journey node component
- `src/components/node-palette.tsx` - Draggable node palette with click-to-expand
- `src/components/context-menu-v2.tsx` - Smart context menu (single/multiple/none selection)
- `src/components/ai-chatbox.tsx` - AI assistant chat interface
- `src/components/sidebar-left.tsx` - Left sidebar with node palette
- `src/components/sidebar-right.tsx` - Right sidebar with AI chat

### **Configuration**
- `src/config/nodeTypes.ts` - Centralized node configuration (icons, colors, categories)

### **Hooks & Utilities**
- `src/hooks/useNodeActions.ts` - Node operations (copy, paste, delete, select)
- `src/hooks/useDnD.tsx` - Drag-and-drop functionality
- `src/components/ui/resizable.tsx` - Resizable panel components

## 🎨 **Node Types & Categories**

### **Flow Control**
- **Entry Point** (Rocket icon) - Starting point of the journey
- **Action** (Play icon) - Generic action step in the journey
- **Decision** (GitBranch icon) - Conditional branching based on user data
- **Wait Period** (Clock icon) - Pause the journey for a specified time
- **End Point** (Target icon) - Termination point of the journey
- **Sample (Random)** (Shuffle icon) - Randomly sample users for A/B testing
- **Segment** (Layers icon) - Segment users based on predefined criteria
- **Join** (Zap icon) - Merge multiple paths back together
- **Goal** (Flag icon) - Define a specific objective or target
- **Milestone** (MapPin icon) - Mark important progress points

### **AI**
- **AI Decision** (Brain icon) - AI-powered decision making based on data
- **AI Copy Generation** (PenTool icon) - Generate personalized content for communications
- **AI Segment** (Users icon) - Intelligently segment users using AI

### **Communication** 
- **Email Action** (Mail icon) - Send email notification to customer
- **SMS Action** (MessageSquare icon) - Send SMS notification to customer

### **Integration**
- **Webhook** (Zap icon) - Trigger external API calls
- **Database** (Database icon) - Store or retrieve data from database

## 🔧 **Key Features**

### **Canvas & Nodes**
- ✅ React Flow integration with custom nodes
- ✅ Drag-and-drop from palette
- ✅ Square tile design with shadows
- ✅ Color-coded icons by node type
- ✅ Shadcn tooltips on nodes
- ✅ SVG arrows on edges with selection styling
- ✅ Auto-organize nodes with Dagre layout algorithm

### **Context Menu**
- ✅ Smart behavior: different options for single/multiple/no selection
- ✅ Configure option (single node only)
- ✅ Copy, paste, delete, select all actions

### **UI Layout**
- ✅ Resizable right sidebar (15-40% width)
- ✅ Floating control bar in canvas with organize button
- ✅ Clean header with breadcrumbs
- ✅ AI chatbox in right sidebar

### **Node Palette**
- ✅ Categorized collapsible sections
- ✅ Click-to-expand for full descriptions
- ✅ Hover effects and visual feedback
- ✅ Drag-and-drop functionality

## 📊 **State Management**

### **React State (Current)**
- `nodes` - Array of journey nodes
- `edges` - Array of connections
- `contextMenu` - Context menu state
- `expandedNodes` - Node palette expansion state

### **Node Data Structure**
```typescript
{
  id: string,
  type: "journeyNode",
  position: { x, y },
  data: {
    nodeId: string,      // nodeType_journeyId_timestamp
    journeyId: string,
    title: string,
    description: string,
    nodeType: string,
    status: string
  }
}
```

## 🚀 **Next Steps (Planned)**
- [ ] Database persistence
- [ ] Zustand state management
- [ ] Node configuration modal
- [ ] Journey management
- [ ] AI integration backend
- [ ] Export/import functionality

## 🛠️ **Tech Stack**
- **Frontend**: React, TypeScript, Next.js
- **UI**: Tailwind CSS, Shadcn/ui
- **Canvas**: React Flow (@xyflow/react)
- **Layout**: Dagre (auto-organize algorithm)
- **Icons**: Lucide React
- **State**: React useState (temporary)

## 📝 **Development Notes**

### **Node Configuration System**
All node types are centrally managed in `src/config/nodeTypes.ts`:
- Icons from Lucide React
- Color schemes with Tailwind classes
- Categories for organization
- Helper functions for easy access

### **Context Menu Logic**
Smart context menu that adapts based on selection:
- **No Selection**: Canvas actions only
- **Single Node**: Node-specific actions + Configure
- **Multiple Nodes**: Bulk operations

### **Resizable Layout**
Uses Shadcn's ResizablePanelGroup:
- Main canvas: 75% default, 30% minimum
- Right sidebar: 25% default, 15-40% range
- Visual resize handle with grip icon

### **Drag & Drop**
Custom implementation with:
- Node palette as source
- Canvas as drop target
- Unique ID generation: `nodeType_journeyId_timestamp`
- Position calculation from drop coordinates

### **Auto-Organize Feature**
Dagre-based layout algorithm:
- **Layout Direction**: Top to Bottom (TB)
- **Spacing**: 100px vertical, 50px horizontal
- **Node Size**: 96x96px (w-24 h-24)
- **Algorithm**: Hierarchical layout based on edge connections
- **Button**: Layout icon in floating control bar

## 🔄 **Recent Updates**
- Added Goal and Milestone node types
- Created dedicated AI category (positioned second)
- Implemented click-to-expand node descriptions
- Added smart context menu behavior
- Moved control bar into canvas as floating panel
- Implemented resizable sidebar layout
- **Added auto-organize feature with Dagre layout algorithm**

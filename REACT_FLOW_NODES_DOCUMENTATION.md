# Safarys Journey Orchestration - Simplified Node Documentation

## Overview
This document outlines Safarys' two-phase product strategy:

**Phase 1: Journey Orchestration** - Simplified journey management inspired by Unica Journey, focusing on journey-level configuration rather than complex node-level settings.

**Phase 2: Campaign Management** - Advanced campaign management with sophisticated segmentation capabilities inspired by Unica Campaign.

The system emphasizes simplicity in Phase 1 while maintaining AI-powered capabilities, with plans for advanced segmentation in Phase 2.

## Journey-Level Configuration

### Journey Settings
- **Journey Goals**: Define high-level objectives (e.g., "Increase customer retention by 20%")
- **Journey Milestones**: Set progress checkpoints (e.g., "Customer made first purchase")
- **Data Sources**: Configure entry sources (File, API, Database, Campaign)
- **Scheduling**: Set journey timing and frequency
- **Segmentation**: Define customer segments at journey level
- **Real-time Insights**: Journey performance dashboard

## Phase 1: Journey Orchestration Nodes

### Core Journey Nodes (Simplified)
**Goal**: Simple, effective journey orchestration inspired by Unica Journey

#### 1. Entry Node
- **Purpose**: Journey start point where customers enter
- **Visual**: Green circle with "START" label
- **Configuration**: 
  - Entry source selection (inherited from journey settings)
  - Entry conditions (optional)
- **Connections**: Single outgoing connection
- **Data Structure**:
```typescript
interface EntryNodeData {
  entrySource: string; // References journey-level data source
  entryConditions?: string; // Optional entry rules
}
```

#### 2. Message Node
- **Purpose**: Send communications to customers
- **Visual**: Blue rectangle with message icon
- **Configuration**:
  - Message type (Email, SMS, WhatsApp, Push)
  - Message content
  - Sender details
- **Connections**: Single incoming, single outgoing
- **Data Structure**:
```typescript
interface MessageNodeData {
  messageType: 'email' | 'sms' | 'whatsapp' | 'push';
  content: string;
  senderId: string;
  subject?: string; // For email
}
```

#### 3. Wait Node
- **Purpose**: Pause journey for specified duration
- **Visual**: Yellow rectangle with clock icon
- **Configuration**:
  - Wait type (Fixed duration or Wait until next day)
  - Duration (days/hours)
  - Resume time (optional)
- **Connections**: Single incoming, single outgoing
- **Data Structure**:
```typescript
interface WaitNodeData {
  waitType: 'fixed' | 'next-day';
  waitDays: number;
  waitHours: number;
  waitTime?: string; // Optional resume time
  waitUntilDay?: string; // For next-day type
}
```

#### 4. Decision Node
- **Purpose**: Branch journey based on conditions
- **Visual**: Diamond shape with decision icon
- **Configuration**:
  - Number of branches
  - Branch conditions (simple rules)
- **Connections**: Single incoming, multiple outgoing
- **Data Structure**:
```typescript
interface DecisionNodeData {
  branches: number;
  branchConfigs: Array<{
    title: string;
    description?: string;
    condition: string;
  }>;
}
```

#### 5. Exit Node
- **Purpose**: Journey completion point
- **Visual**: Red circle with "END" label
- **Configuration**:
  - Exit message (optional)
- **Connections**: Multiple incoming, no outgoing
- **Data Structure**:
```typescript
interface ExitNodeData {
  exitMessage?: string;
}
```

## Journey-Level Configuration

### Journey Settings Panel
- **Journey Goals**: Define high-level objectives
- **Journey Milestones**: Set progress checkpoints  
- **Data Sources**: Configure entry sources (File, API, Database, Campaign)
- **Scheduling**: Set journey timing and frequency
- **Segmentation**: Define customer segments
- **Real-time Insights**: Journey performance dashboard

### Data Sources Configuration
- **File Sources**: CSV, TSV, JSON file uploads
- **API Sources**: REST endpoint configuration
- **Database Sources**: SQL connection and query setup
- **Campaign Sources**: Integration with existing campaigns

### Phase 1: Basic Segmentation (Journey-Level)
- **Simple Segment Builder**: Basic condition builder
- **AI Suggestions**: AI-powered segment recommendations
- **Customer Preview**: Real-time customer count
- **Journey-Level Segments**: Segments defined at journey level

### Scheduling Configuration
- **Journey Timing**: Start/end dates and times
- **Frequency**: How often the journey runs
- **Timezone**: Journey timezone settings
- **Holiday Calendar**: Exclude specific dates

### Goals & Milestones
- **Primary Goals**: Main business objectives
- **Success Metrics**: KPIs to track
- **Milestone Tracking**: Progress checkpoints
- **Performance Alerts**: Automated notifications

## AI-Powered Features

### Journey Optimization
- **AI Decisioning**: Machine learning for real-time decisions
- **Predictive Paths**: AI suggests optimal customer paths
- **Dynamic Content**: AI generates personalized content
- **Intelligent Timing**: AI determines optimal send times

### Analytics & Insights
- **Real-time Dashboard**: Live journey performance
- **Predictive Analytics**: Forecast journey outcomes
- **Anomaly Detection**: Identify unusual patterns
- **Recommendation Engine**: AI-powered optimization suggestions

## Phase 2: Campaign Management (Future)

### Advanced Campaign Nodes
**Goal**: Sophisticated campaign management with advanced segmentation inspired by Unica Campaign

#### Campaign-Specific Nodes
- **Campaign Node**: Multi-step campaign orchestration
- **Segment Node**: Advanced customer segmentation
- **Offer Node**: Dynamic offer management
- **Response Node**: Customer response tracking
- **Trigger Node**: Event-based campaign triggers

### Advanced Segmentation (Competitive Advantage)

#### AI-Powered Segmentation
- **Smart Suggestions**: AI recommends segments based on data patterns
- **Behavioral Analysis**: Real-time customer behavior segmentation
- **Predictive Segments**: AI predicts high-value customer groups
- **Dynamic Updates**: Segments that evolve with customer behavior

#### Advanced Segment Builder
- **Visual Builder**: Drag-and-drop condition creation
- **Complex Logic**: Nested AND/OR conditions
- **Time-based Rules**: Customer behavior over time
- **Cross-channel Analysis**: Behavior across touchpoints

#### Segment Intelligence
- **Performance Analytics**: Segment effectiveness tracking
- **Overlap Detection**: Identify customer group intersections
- **Optimization Suggestions**: AI-powered segment improvements
- **A/B Testing**: Test different segment definitions

#### Cross-Campaign Segments
- **Reusable Segments**: Share segments across campaigns
- **Segment Library**: Centralized segment management
- **Segment Versioning**: Track segment evolution
- **Segment Performance**: Cross-campaign analytics

## Product Roadmap

### Phase 1: Journey Orchestration (Current)
- **Focus**: Simple journey management like Unica Journey
- **Competitive Advantage**: AI-powered journey optimization
- **Segmentation**: Basic journey-level segmentation (better than Unica Journey)

### Phase 2: Campaign Management (Future)
- **Focus**: Advanced campaign management like Unica Campaign
- **Competitive Advantage**: AI-powered segmentation + journey orchestration
- **Segmentation**: Full-featured segment builder with AI capabilities

## Competitive Advantages

### Phase 1: Journey Orchestration vs Unica Journey
- **AI-Powered Optimization**: Machine learning for journey decisions
- **Simplified Configuration**: Journey-level settings vs complex node-level config
- **Real-time Insights**: Live journey performance and optimization
- **Modern UI**: Intuitive drag-and-drop interface

### Phase 2: Campaign Management vs Unica Campaign (Future)
- **AI-Powered Segmentation**: Machine learning-driven segment recommendations
- **Behavioral Segmentation**: Real-time customer behavior analysis
- **Predictive Segments**: AI predicts optimal customer groups
- **Dynamic Segmentation**: Segments that adapt to customer behavior
- **Cross-channel Analysis**: Behavior tracking across all touchpoints
- **Integrated Journey + Campaign**: Combined orchestration and segmentation

## Summary

### Phase 1: Journey Orchestration (Current)
This simplified approach focuses on:

1. **5 Core Nodes Only**: Entry, Message, Wait, Decision, Exit
2. **Journey-Level Configuration**: Data sources, basic segmentation, scheduling, goals
3. **AI-Powered Features**: Journey optimization, analytics, and insights
4. **Unica Journey Inspired**: Simple, effective, and user-friendly
5. **Competitive Advantage**: AI-powered journey optimization vs Unica Journey's basic functionality

### Phase 2: Campaign Management (Future)
The advanced approach will include:

1. **Advanced Campaign Nodes**: Campaign, Segment, Offer, Response, Trigger
2. **Sophisticated Segmentation**: AI-powered segment builder with behavioral analysis
3. **Cross-Campaign Features**: Reusable segments, segment library, performance analytics
4. **Unica Campaign Inspired**: Advanced segmentation with AI enhancements
5. **Competitive Advantage**: AI-powered segmentation + integrated journey orchestration

### Strategic Positioning
- **Phase 1**: Better than Unica Journey with AI-powered optimization
- **Phase 2**: Competitive with Unica Campaign with AI-powered segmentation
- **Combined**: Unique value proposition of integrated journey orchestration + campaign management
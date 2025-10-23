import { 
  Rocket, 
  Play, 
  GitBranch, 
  Target, 
  Shuffle, 
  Zap, 
  Mail, 
  MessageSquare, 
  Database,
  Brain,
  Flag,
  MapPin,
  Users,
  PenTool,
  Layers,
  Hourglass,
  Clock,
  User,
  Handshake,
} from 'lucide-react';

export interface NodeTypeConfig {
  id: string;
  title: string;
  description: string;
  nodeType: 'entry' |'schedule' | 'action' | 'decision' | 'decision-point' | 'wait' | 'loop' | 'end' | 'sample' | 'segment' | 'join' | 'goal' | 'milestone' | 'ai-decision' | 'email' | 'sms' | 'webhook' | 'database' | 'ai-copy' | 'ai-segment';
  icon: React.ComponentType<{ className?: string }>;
  category: 'Flow Control' | 'AI' | 'Communication' | 'Integration';
  color: {
    border: string;
    background: string;
    shadow: string;
    icon: string;
    iconBorder: string;
    iconBackground: string;
  };
}

export const NODE_TYPES: NodeTypeConfig[] = [
  {
    id: 'entry',
    title: 'Jambo',
    description: 'Starting point of the customer journey',
    nodeType: 'entry',
    icon: Users,
    category: 'Flow Control',
    color: {
      border: 'border-green-500',
      background: 'bg-green-50',
      shadow: 'shadow-green-200',
      icon: 'text-green-600',
      iconBorder: 'border-green-300',
      iconBackground: 'bg-green-100'
    }
  },
  // {
  //   id: 'action',
  //   title: 'Action Node',
  //   description: 'Perform a specific action in the journey',
  //   nodeType: 'action',
  //   icon: Rocket,
  //   category: 'Flow Control',
  //   color: {
  //     border: 'border-blue-500',
  //     background: 'bg-blue-50',
  //     shadow: 'shadow-blue-200',
  //     icon: 'text-blue-600',
  //     iconBorder: 'border-blue-300',
  //     iconBackground: 'bg-blue-100'
  //   }
  // },
   {
     id: 'segment',
     title: 'Segment',
     description: 'Segment customers based on conditions',
     nodeType: 'decision',
     icon: Layers,
     category: 'Flow Control',
     color: {
       border: 'border-yellow-500',
       background: 'bg-yellow-50',
       shadow: 'shadow-yellow-200',
       icon: 'text-yellow-600',
       iconBorder: 'border-yellow-300',
       iconBackground: 'bg-yellow-100'
     }
   },
   {
     id: 'decision',
     title: 'Decision Point',
     description: 'Simple Yes/No decision point',
     nodeType: 'decision-point',
     icon: GitBranch,
     category: 'Flow Control',
     color: {
       border: 'border-blue-500',
       background: 'bg-blue-50',
       shadow: 'shadow-blue-200',
       icon: 'text-blue-600',
       iconBorder: 'border-blue-300',
       iconBackground: 'bg-blue-100'
     }
   },
  {
    id: 'merge',
    title: 'Merge Segments',
    description: 'Combine customer data with AND, OR, MINUS operations',
    nodeType: 'merge',
    icon: Handshake,
    category: 'Flow Control',
    color: {
      border: 'border-purple-500',
      background: 'bg-purple-50',
      shadow: 'shadow-purple-200',
      icon: 'text-purple-600',
      iconBorder: 'border-purple-300',
      iconBackground: 'bg-purple-100'
    }
  },
  // {
  //   id: 'schedule',
  //   title: 'Schedule Point',
  //   description: 'Schedule the journey based on conditions',
  //   nodeType: 'schedule',
  //   icon: Clock,
  //   category: 'Flow Control',
  //   color: {
  //     border: 'border-blue-500',
  //     background: 'bg-blue-50',
  //     shadow: 'shadow-blue-200',
  //     icon: 'text-blue-600',
  //     iconBorder: 'border-blue-300',
  //     iconBackground: 'bg-blue-100'
  //   }
  // },
     {
         id: 'wait',
         title: 'Wait Period',
         description: 'Pause the journey for a specified time',
         nodeType: 'wait',
         icon: Hourglass,
         category: 'Flow Control',
         color: {
         border: 'border-orange-500',
         background: 'bg-orange-50',
         shadow: 'shadow-orange-200',
         icon: 'text-orange-600',
         iconBorder: 'border-orange-300',
         iconBackground: 'bg-orange-100'
         }
     },
     {
         id: 'loop',
         title: 'Loop',
         description: 'Repeat a branch until max attempts reached',
         nodeType: 'loop',
         icon: Clock,
         category: 'Flow Control',
         color: {
         border: 'border-indigo-500',
         background: 'bg-indigo-50',
         shadow: 'shadow-indigo-200',
         icon: 'text-indigo-600',
         iconBorder: 'border-indigo-300',
         iconBackground: 'bg-indigo-100'
         }
     },
  {
    id: 'end',
    title: 'Kwaheri',
    description: 'Termination point of the journey',
    nodeType: 'end',
    icon: Target,
    category: 'Flow Control',
    color: {
      border: 'border-red-500',
      background: 'bg-red-50',
      shadow: 'shadow-red-200',
      icon: 'text-red-600',
      iconBorder: 'border-red-300',
      iconBackground: 'bg-red-100'
    }
  },
  // {
  //   id: 'sample',
  //   title: 'Sample (Random)',
  //   description: 'Randomly sample a percentage of users for A/B testing or random selection',
  //   nodeType: 'sample',
  //   icon: Shuffle,
  //   category: 'Flow Control',
  //   color: {
  //     border: 'border-purple-500',
  //     background: 'bg-purple-50',
  //     shadow: 'shadow-purple-200',
  //     icon: 'text-purple-600',
  //     iconBorder: 'border-purple-300',
  //     iconBackground: 'bg-purple-100'
  //   }
  // },
  // {
  //   id: 'segment',
  //   title: 'Segment',
  //   description: 'Segment users based on predefined criteria and conditions',
  //   nodeType: 'segment',
  //   icon: Layers,
  //   category: 'Flow Control',
  //   color: {
  //     border: 'border-indigo-500',
  //     background: 'bg-indigo-50',
  //     shadow: 'shadow-indigo-200',
  //     icon: 'text-indigo-600',
  //     iconBorder: 'border-indigo-300',
  //     iconBackground: 'bg-indigo-100'
  //   }
  // },
  // {
  //   id: 'goal',
  //   title: 'Goal',
  //   description: 'Define a specific objective or target to achieve',
  //   nodeType: 'goal',
  //   icon: Flag,
  //   category: 'Flow Control',
  //   color: {
  //     border: 'border-emerald-500',
  //     background: 'bg-emerald-50',
  //     shadow: 'shadow-emerald-200',
  //     icon: 'text-emerald-600',
  //     iconBorder: 'border-emerald-300',
  //     iconBackground: 'bg-emerald-100'
  //   }
  // },
  // {
  //   id: 'milestone',
  //   title: 'Milestone',
  //   description: 'Mark an important checkpoint or achievement in the journey',
  //   nodeType: 'milestone',
  //   icon: MapPin,
  //   category: 'Flow Control',
  //   color: {
  //     border: 'border-indigo-500',
  //     background: 'bg-indigo-50',
  //     shadow: 'shadow-indigo-200',
  //     icon: 'text-indigo-600',
  //     iconBorder: 'border-indigo-300',
  //     iconBackground: 'bg-indigo-100'
  //   }
  // },
  {
    id: 'ai-decision',
    title: 'AI Decision',
    description: 'AI-powered decision making based on data and conditions',
    nodeType: 'ai-decision',
    icon: Brain,
    category: 'AI',
    color: {
      border: 'border-teal-500',
      background: 'bg-teal-50',
      shadow: 'shadow-teal-200',
      icon: 'text-teal-600',
      iconBorder: 'border-teal-300',
      iconBackground: 'bg-teal-100'
    }
  },
  {
    id: 'ai-copy',
    title: 'AI Copy Generation',
    description: 'Generate personalized content for SMS, email, or other communications',
    nodeType: 'ai-copy',
    icon: PenTool,
    category: 'AI',
    color: {
      border: 'border-cyan-500',
      background: 'bg-cyan-50',
      shadow: 'shadow-cyan-200',
      icon: 'text-cyan-600',
      iconBorder: 'border-cyan-300',
      iconBackground: 'bg-cyan-100'
    }
  },
  {
    id: 'ai-segment',
    title: 'AI Segment',
    description: 'Intelligently segment users based on behavior, demographics, and preferences',
    nodeType: 'ai-segment',
    icon: Users,
    category: 'AI',
    color: {
      border: 'border-rose-500',
      background: 'bg-rose-50',
      shadow: 'shadow-rose-200',
      icon: 'text-rose-600',
      iconBorder: 'border-rose-300',
      iconBackground: 'bg-rose-100'
    }
  },
  {
    id: 'email',
    title: 'Email Action',
    description: 'Send email notification to customer',
    nodeType: 'email',
    icon: Mail,
    category: 'Communication',
    color: {
      border: 'border-cyan-500',
      background: 'bg-cyan-50',
      shadow: 'shadow-cyan-200',
      icon: 'text-cyan-600',
      iconBorder: 'border-cyan-300',
      iconBackground: 'bg-cyan-100'
    }
  },
  {
    id: 'sms',
    title: 'SMS Action',
    description: 'Send SMS message to customer',
    nodeType: 'sms',
    icon: MessageSquare,
    category: 'Communication',
    color: {
      border: 'border-pink-500',
      background: 'bg-pink-50',
      shadow: 'shadow-pink-200',
      icon: 'text-pink-600',
      iconBorder: 'border-pink-300',
      iconBackground: 'bg-pink-100'
    }
  },
  {
    id: 'webhook',
    title: 'Webhook',
    description: 'Trigger external API or service',
    nodeType: 'webhook',
    icon: Zap,
    category: 'Integration',
    color: {
      border: 'border-violet-500',
      background: 'bg-violet-50',
      shadow: 'shadow-violet-200',
      icon: 'text-violet-600',
      iconBorder: 'border-violet-300',
      iconBackground: 'bg-violet-100'
    }
  },
  {
    id: 'database',
    title: 'Database Action',
    description: 'Update or query database records',
    nodeType: 'database',
    icon: Database,
    category: 'Integration',
    color: {
      border: 'border-slate-500',
      background: 'bg-slate-50',
      shadow: 'shadow-slate-200',
      icon: 'text-slate-600',
      iconBorder: 'border-slate-300',
      iconBackground: 'bg-slate-100'
    }
  }
];

// Helper function to get node config by type
export const getNodeConfig = (nodeType: string): NodeTypeConfig | undefined => {
  return NODE_TYPES.find(node => node.nodeType === nodeType);
};

// Helper function to get all categories
export const getCategories = (): string[] => {
  return Array.from(new Set(NODE_TYPES.map(node => node.category)));
};

// Helper function to get nodes by category
export const getNodesByCategory = (category: string): NodeTypeConfig[] => {
  return NODE_TYPES.filter(node => node.category === category);
};

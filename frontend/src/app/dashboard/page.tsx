'use client';

import { usePathname } from 'next/navigation';
import GoalsPage from './goals/page';
import MilestonesPage from './milestones/page';
import JourneyPage from './canvas/page';
import HomePage from './home/page';

export default function Page() {
  const pathname = usePathname();
  
  // Determine which content to show based on pathname
  const renderContent = () => {
    if (pathname === '/dashboard/goals') {
      return <GoalsPage />;
    } else if (pathname === '/dashboard/milestones') {
      return <MilestonesPage />;
    } else if (pathname === '/dashboard/journey') {
      return <JourneyPage />;
    } else {
      // Default to goals page for /dashboard root
      return <HomePage />;
    }
  };

  return renderContent();
}
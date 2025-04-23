import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export const SidebarButton: React.FC = () => {
  return (
    <Button 
      size="icon" 
      variant="ghost" 
      className="fixed top-4 right-4 z-50 lg:hidden"
      data-sidebar-toggle
    >
      <ChevronLeft className="h-5 w-5" />
    </Button>
  );
}; 
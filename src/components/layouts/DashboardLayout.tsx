import React from 'react';
import Sidebar from '../Sidebar';
import { AlterarSenhaDialog } from '../AlterarSenhaDialog';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar>
        {/* Outros links do sidebar */}
        <div className="p-4">
          <AlterarSenhaDialog />
        </div>
      </Sidebar>
      <main className="flex-1 p-6 bg-gray-50">{children}</main>
    </div>
  );
}

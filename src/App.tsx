import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { CartDrawer } from './components/CartDrawer';
import { AccessibilityModal } from './components/AccessibilityModal';
import { ToastContainer } from './components/ToastContainer';

// Views
import { LandingPage } from './views/LandingPage';
import { PlansPage } from './views/PlansPage';
import { LoginPage } from './views/LoginPage';
import { RegisterCompanyPage } from './views/RegisterCompanyPage';
import { SubscriptionView } from './views/SubscriptionView';
import { DashboardView } from './views/DashboardView';
import { DailyReportView } from './views/DailyReportView';
import { WeeklyReportView } from './views/WeeklyReportView';
import { ProductsView } from './views/ProductsView';
import { StockView } from './views/StockView';
import { OrdersView } from './views/OrdersView';
import { TablesView } from './views/TablesView';
import { DigitalMenuView } from './views/DigitalMenuView';
import { OrderTrackingView } from './views/OrderTrackingView';
import { POSView } from './views/POSView';
import { SettingsView } from './views/SettingsView';
import { EmployeesView } from './views/EmployeesView';
import { WholesaleView } from './views/WholesaleView';
import { StatementView } from './views/StatementView';
import { TerminalPOSView } from './views/TerminalPOSView';

const MainLayout: React.FC = () => {
  const { activePage, currentRole, highContrast, fontSize } = useApp();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);

  // Check if current view is an administrative backoffice page
  const isBackoffice =
    activePage === 'dashboard' ||
    activePage === 'orders' ||
    activePage === 'tables' ||
    activePage === 'products' ||
    activePage === 'stock' ||
    activePage === 'daily_report' ||
    activePage === 'weekly_report' ||
    activePage === 'employees' ||
    activePage === 'subscription' ||
    activePage === 'statement' ||
    activePage === 'settings' ||
    activePage === 'pos' ||
    activePage === 'terminal_pos' ||
    activePage === 'wholesale';

  const fontSizeClass =
    fontSize === 'larger'
      ? 'text-lg leading-relaxed'
      : fontSize === 'large'
      ? 'text-base'
      : 'text-sm';

  const renderActiveView = () => {
    switch (activePage) {
      case 'landing':
        return <LandingPage />;
      case 'plans':
        return <PlansPage />;
      case 'login':
        return <LoginPage />;
      case 'register':
        return <RegisterCompanyPage />;
      case 'subscription':
        return <SubscriptionView />;
      case 'statement':
        return <StatementView />;
      case 'dashboard':
        return <DashboardView />;
      case 'daily_report':
        return <DailyReportView />;
      case 'weekly_report':
        return <WeeklyReportView />;
      case 'products':
        return <ProductsView />;
      case 'stock':
        return <StockView />;
      case 'orders':
        return <OrdersView />;
      case 'tables':
        return <TablesView />;
      case 'pos':
        return <POSView />;
      case 'terminal_pos':
        return <TerminalPOSView />;
      case 'employees':
        return <EmployeesView />;
      case 'settings':
        return <SettingsView />;
      case 'menu':
        return <DigitalMenuView onOpenCart={() => setIsCartOpen(true)} />;
      case 'order_tracking':
        return <OrderTrackingView />;
      case 'wholesale':
        return <WholesaleView />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        highContrast ? 'bg-black text-amber-300' : 'bg-slate-950 text-slate-100'
      } ${fontSizeClass}`}
    >
      {/* Top Bar Navigation */}
      <Navbar
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAccessibility={() => setIsAccessibilityOpen(true)}
      />

      {/* Main Container */}
      <div className="flex-1 flex w-full">
        {/* Backoffice Sidebar if on administrative view */}
        {isBackoffice && (
          <div className="hidden lg:block shrink-0">
            <Sidebar />
          </div>
        )}

        {/* View Content Area */}
        <main
          className={`flex-1 min-w-0 ${
            isBackoffice
              ? 'p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full'
              : activePage === 'landing' || activePage === 'plans' || activePage === 'login' || activePage === 'register'
              ? 'w-full'
              : 'p-4 sm:p-6 max-w-7xl mx-auto w-full'
          }`}
        >
          {renderActiveView()}
        </main>
      </div>

      {/* Global Drawers & Modals */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <AccessibilityModal
        isOpen={isAccessibilityOpen}
        onClose={() => setIsAccessibilityOpen(false)}
      />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

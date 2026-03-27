import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
// Add page imports here
import Home from './pages/Home';
import QatarNews from './pages/QatarNews';
import AppViewer from './pages/AppViewer';
import BulkInvite from './pages/BulkInvite';
import PcsDashboard from './pages/PcsDashboard';
import PcsSheets from './pages/PcsSheets';
import PcsCreateSheet from './pages/PcsCreateSheet';
import PcsSheetDetail from './pages/PcsSheetDetail';
import AnimationPreview from './pages/AnimationPreview';
import TradeflowLayout from './components/tradeflow/AppLayout';
import TradeflowDashboard from './pages/TradeflowDashboard';
import TradeflowOrders from './pages/TradeflowOrders';
import TradeflowShipments from './pages/TradeflowShipments';
import TradeflowCustomers from './pages/TradeflowCustomers';
import TradeflowSuppliers from './pages/TradeflowSuppliers';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      {/* Add your page Route elements here */}
      <Route path="/" element={<Home />} />
      <Route path="/qatar-news" element={<QatarNews />} />
      <Route path="/app-viewer" element={<AppViewer />} />
      <Route path="/bulk-invite" element={<BulkInvite />} />
      <Route path="/pcs" element={<PcsDashboard />} />
      <Route path="/pcs-sheets" element={<PcsSheets />} />
      <Route path="/pcs-create" element={<PcsCreateSheet />} />
      <Route path="/pcs-detail" element={<PcsSheetDetail />} />
      <Route path="/animation-preview" element={<AnimationPreview />} />
      <Route path="/tradeflow" element={<TradeflowLayout />}>
        <Route index element={<TradeflowDashboard />} />
        <Route path="orders" element={<TradeflowOrders />} />
        <Route path="shipments" element={<TradeflowShipments />} />
        <Route path="customers" element={<TradeflowCustomers />} />
        <Route path="suppliers" element={<TradeflowSuppliers />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
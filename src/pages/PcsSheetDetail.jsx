import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "../components/Header";
import PcsSheetHeader from "../components/pcs/PcsSheetHeader";
import PcsLineItemsSection from "../components/pcs/PcsLineItemsSection";
import PcsProvidersSection from "../components/pcs/PcsProvidersSection";
import PcsQuickEntryTable from "../components/pcs/PcsQuickEntryTable";
import PcsSummaryCard from "../components/pcs/PcsSummaryCard";
import PcsSplitOrderSummary from "../components/pcs/PcsSplitOrderSummary";
import PcsApprovalSection from "../components/pcs/PcsApprovalSection";

export default function PcsSheetDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const sheetId = urlParams.get("id");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => setCurrentUser(null));
  }, []);

  const { data: sheet, isLoading: loadingSheet } = useQuery({
    queryKey: ["pcs-sheet", sheetId],
    queryFn: async () => {
      const all = await base44.entities.PriceComparisonSheet.list();
      return all.find(s => s.id === sheetId) || null;
    },
    enabled: !!sheetId,
  });

  const { data: lineItems = [] } = useQuery({
    queryKey: ["line-items", sheetId],
    queryFn: () => base44.entities.LineItem.filter({ pcs_id: sheetId }),
    enabled: !!sheetId,
  });

  const { data: providers = [] } = useQuery({
    queryKey: ["providers", sheetId],
    queryFn: () => base44.entities.Provider.filter({ pcs_id: sheetId }),
    enabled: !!sheetId,
  });

  const { data: quotes = [] } = useQuery({
    queryKey: ["quotes", sheetId],
    queryFn: () => base44.entities.ProviderQuote.filter({ pcs_id: sheetId }),
    enabled: !!sheetId,
  });

  if (loadingSheet) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24 px-4 md:px-6 pb-8 max-w-7xl mx-auto space-y-4">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!sheet) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24 flex items-center justify-center">
          <p className="text-slate-500">Sheet not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-24 px-3 md:px-5 pb-8">
        <div className="max-w-[1600px] mx-auto space-y-6">
          {/* Header Section */}
          <PcsSheetHeader sheet={sheet} currentUser={currentUser} />

          {/* Summary Cards */}
          <PcsSummaryCard sheet={sheet} lineItems={lineItems} providers={providers} quotes={quotes} />

          {/* Line Items - Full Width */}
          <PcsLineItemsSection pcsId={sheetId} lineItems={lineItems} canEdit={
            currentUser?.email === (sheet.assigned_to || sheet.created_by) ||
            currentUser?.role === "admin" || currentUser?.role === "manager"
          } />

          {/* Split Order Summary */}
          <PcsSplitOrderSummary lineItems={lineItems} providers={providers} quotes={quotes} />

          {/* Suppliers - Full Width */}
          <PcsProvidersSection pcsId={sheetId} providers={providers} canEdit={
            currentUser?.email === (sheet.assigned_to || sheet.created_by) ||
            currentUser?.role === "admin" || currentUser?.role === "manager"
          } />

          {/* Price Comparison Table - Full Width */}
          <PcsQuickEntryTable pcsId={sheetId} lineItems={lineItems} providers={providers} quotes={quotes} canEdit={
            currentUser?.email === (sheet.assigned_to || sheet.created_by) ||
            currentUser?.role === "admin" || currentUser?.role === "manager"
          } />

          {/* Approval & Workflow Section */}
          <PcsApprovalSection pcsId={sheetId} sheet={sheet} currentUser={currentUser} />
        </div>
      </div>
    </div>
  );
}
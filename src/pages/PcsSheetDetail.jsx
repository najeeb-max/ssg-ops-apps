import React from "react";
import { useQuery } from "@tanstack/react-query";
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

  const { data: sheets, isLoading: loadingSheet } = useQuery({
    queryKey: ["pcs-sheet", sheetId],
    queryFn: () => base44.entities.PriceComparisonSheet.filter({ id: sheetId }),
    enabled: !!sheetId,
  });
  const sheet = sheets?.[0];

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
      <div className="pt-24 px-4 md:px-6 pb-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Section */}
          <PcsSheetHeader sheet={sheet} />

          {/* Summary Cards */}
          <PcsSummaryCard sheet={sheet} lineItems={lineItems} providers={providers} quotes={quotes} />

          {/* Line Items - Full Width */}
          <PcsLineItemsSection pcsId={sheetId} lineItems={lineItems} />

          {/* Split Order Summary */}
          <PcsSplitOrderSummary lineItems={lineItems} providers={providers} quotes={quotes} />

          {/* Main Content - Two Column */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Suppliers */}
            <PcsProvidersSection pcsId={sheetId} providers={providers} />

            {/* Right Column: Price Entry Table */}
            <PcsQuickEntryTable pcsId={sheetId} lineItems={lineItems} providers={providers} quotes={quotes} />
          </div>

          {/* Approval Section */}
          <PcsApprovalSection pcsId={sheetId} pcsStatus={sheet.status} />
        </div>
      </div>
    </div>
  );
}
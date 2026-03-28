import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, X, ArrowLeft, ShieldOff } from "lucide-react";
import Header from "../components/Header";
import PcsStatsGrid from "../components/pcs/PcsStatsGrid";
import PcsRecentSheets from "../components/pcs/PcsRecentSheets";
import { Skeleton } from "@/components/ui/skeleton";

export default function PcsDashboard() {
  const [search, setSearch] = useState("");

  const { data: currentUser, isLoading: userLoading } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me(), staleTime: 60_000 });

  const { data: sheets = [], isLoading } = useQuery({
    queryKey: ["pcs-sheets"],
    queryFn: () => base44.entities.PriceComparisonSheet.list("-created_date"),
  });

  const { data: allProviders = [] } = useQuery({
    queryKey: ["all-providers"],
    queryFn: () => base44.entities.Provider.list(),
  });

  const { data: allLineItems = [] } = useQuery({
    queryKey: ["all-line-items"],
    queryFn: () => base44.entities.LineItem.list(),
  });

  const { data: allQuotes = [] } = useQuery({
    queryKey: ["all-quotes"],
    queryFn: () => base44.entities.ProviderQuote.list(),
  });

  const filteredSheets = search.trim()
    ? sheets.filter((s) => {
        const q = search.toLowerCase();
        return (
          s.client_name?.toLowerCase().includes(q) ||
          s.pcs_number?.toLowerCase().includes(q) ||
          s.po_number?.toLowerCase().includes(q) ||
          s.sq_number?.toLowerCase().includes(q) ||
          s.rfq_number?.toLowerCase().includes(q) ||
          s.remarks?.toLowerCase().includes(q)
        );
      })
    : sheets;

  if (!userLoading && currentUser && currentUser.role !== 'admin' && !(currentUser.can_access_pcs ?? currentUser.data?.can_access_pcs)) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex flex-col items-center justify-center flex-1 gap-4">
          <ShieldOff className="w-12 h-12 text-slate-300" />
          <h2 className="text-lg font-semibold text-slate-700">Access Restricted</h2>
          <p className="text-sm text-slate-500">You don't have permission to access the PCS module.</p>
          <Link to="/" className="text-sm text-red-600 hover:underline">Back to Portal</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-1 pt-24 px-4 md:px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="ghost" size="icon" className="rounded-full border border-slate-200 bg-white shadow-sm">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">PCS Dashboard</h1>
                <p className="text-sm text-slate-500">Price Comparison Sheets Overview</p>
              </div>
            </div>
            <Link to="/pcs-create">
              <Button className="bg-red-600 hover:bg-red-700 text-white gap-2">
                <Plus className="w-4 h-4" />
                New Sheet
              </Button>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-xl mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by client, PCS#, PO#, RFQ#..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-9 bg-white shadow-sm"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
          ) : (
            <>
              <PcsStatsGrid sheets={sheets} />
              <PcsRecentSheets
                sheets={filteredSheets}
                searchActive={!!search.trim()}
                allProviders={allProviders}
                allLineItems={allLineItems}
                allQuotes={allQuotes}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
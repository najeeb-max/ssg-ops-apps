import React, { useState } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Building2, Calendar, DollarSign, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "../components/Header";

const statusStyles = {
  draft: "bg-muted text-muted-foreground",
  in_progress: "bg-amber-50 text-amber-700 border-amber-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  awarded: "bg-violet-50 text-violet-700 border-violet-200",
};

export default function PcsSheets() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: sheets = [], isLoading } = useQuery({
    queryKey: ["pcs-sheets"],
    queryFn: () => base44.entities.PriceComparisonSheet.list("-created_date"),
  });

  const filtered = sheets.filter((s) => {
    const matchSearch = !search ||
      s.pcs_number?.toLowerCase().includes(search.toLowerCase()) ||
      s.client_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.po_number?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-1 pt-24 px-4 md:px-6 pb-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Link to="/pcs">
                <Button variant="ghost" size="icon" className="rounded-full border border-slate-200 bg-white shadow-sm">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">All Comparison Sheets</h1>
                <p className="text-sm text-slate-500">{sheets.length} sheets total</p>
              </div>
            </div>
            <Link to="/pcs-create">
              <Button className="bg-red-600 hover:bg-red-700 text-white gap-2">
                <Plus className="w-4 h-4" />
                New Sheet
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search PCS#, client, PO#..."
                className="pl-9 bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="awarded">Awarded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* List */}
          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">No sheets found.</div>
          ) : (
            <div className="space-y-3">
              {filtered.map((sheet) => (
                <Link key={sheet.id} to={`/pcs-detail?id=${sheet.id}`}>
                  <div className="bg-white border border-slate-200 hover:border-red-300 hover:shadow-md rounded-xl p-4 transition-all cursor-pointer">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-900">{sheet.pcs_number}</h3>
                          <Badge className={statusStyles[sheet.status]}>
                            {sheet.status?.replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-slate-600 text-sm mb-1">
                          <Building2 className="w-3.5 h-3.5" />
                          {sheet.client_name}
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400">
                          {sheet.po_number && <span>PO: {sheet.po_number}</span>}
                          {sheet.rfq_number && <span>RFQ: {sheet.rfq_number}</span>}
                          {sheet.date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(sheet.date), "MMM d, yyyy")}
                            </span>
                          )}
                        </div>
                      </div>
                      {sheet.total_selling_value > 0 && (
                        <div className="text-right">
                          <p className="text-xs text-slate-400 flex items-center gap-1 justify-end">
                            <DollarSign className="w-3 h-3" />Selling Value
                          </p>
                          <p className="font-bold text-slate-900">
                            {sheet.total_selling_value?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
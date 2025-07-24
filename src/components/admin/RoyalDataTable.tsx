
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Filter, ChevronUp, ChevronDown } from 'lucide-react';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface FilterOption {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

interface RoyalDataTableProps {
  data: any[];
  columns: Column[];
  filters?: FilterOption[];
  searchPlaceholder?: string;
  onExport?: () => void;
  loading?: boolean;
  title?: string;
}

const RoyalDataTable: React.FC<RoyalDataTableProps> = ({
  data,
  columns,
  filters = [],
  searchPlaceholder = "البحث...",
  onExport,
  loading = false,
  title
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (searchTerm) {
      result = result.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        result = result.filter(row => row[key] === value);
      }
    });

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, sortConfig, activeFilters]);

  const handleSort = (columnKey: string) => {
    setSortConfig(prev => ({
      key: columnKey,
      direction: prev?.key === columnKey && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  if (loading) {
    return (
      <Card className="royal-card">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal-green"></div>
            <span className="mr-3 text-royal-dark">جاري التحميل...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="royal-card border-royal-border">
      {title && (
        <CardHeader className="bg-gradient-to-l from-royal-gold/5 to-royal-green/5 border-b border-royal-border">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-royal-dark flex items-center">
              <div className="w-1 h-6 bg-royal-green ml-3 rounded-full"></div>
              {title}
            </CardTitle>
            {onExport && (
              <Button onClick={onExport} variant="outline" size="sm" className="royal-button">
                <Download className="w-4 h-4 ml-2" />
                تصدير البيانات
              </Button>
            )}
          </div>
        </CardHeader>
      )}
      
      <CardContent className="p-6">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-royal-dark/40" />
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="royal-input pr-10"
              />
            </div>
          </div>
          
          {filters.map(filter => (
            <Select
              key={filter.key}
              value={activeFilters[filter.key] || 'all'}
              onValueChange={(value) => setActiveFilters(prev => ({ ...prev, [filter.key]: value }))}
            >
              <SelectTrigger className="w-full md:w-48 royal-input">
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع {filter.label}</SelectItem>
                {filter.options.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>

        {/* Table */}
        <div className="border border-royal-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-royal-pattern">
              <TableRow className="border-royal-border">
                {columns.map(column => (
                  <TableHead 
                    key={column.key}
                    className={`text-royal-dark font-semibold py-4 ${
                      column.sortable ? 'cursor-pointer hover:bg-royal-green/5' : ''
                    }`}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center">
                      {column.label}
                      {column.sortable && sortConfig?.key === column.key && (
                        sortConfig.direction === 'asc' ? 
                          <ChevronUp className="w-4 h-4 mr-1" /> : 
                          <ChevronDown className="w-4 h-4 mr-1" />
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedData.map((row, index) => (
                <TableRow 
                  key={index} 
                  className="hover:bg-royal-cream/30 transition-colors border-royal-border/50"
                >
                  {columns.map(column => (
                    <TableCell key={column.key} className="py-4">
                      {column.render 
                        ? column.render(row[column.key], row)
                        : row[column.key]
                      }
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredAndSortedData.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-royal-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-royal-dark/40" />
            </div>
            <p className="text-royal-dark/60 text-lg">لا توجد بيانات مطابقة للبحث</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RoyalDataTable;

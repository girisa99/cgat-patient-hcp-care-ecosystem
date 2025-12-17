import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, X, Loader2, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// CPT/HCPCS Reimbursement rates by category (approximate Medicare rates)
const CPT_CATEGORY_RATES: Record<string, { avgReimbursement: number }> = {
  'E/M': { avgReimbursement: 100 },
  'Anesthesia': { avgReimbursement: 350 },
  'Surgery': { avgReimbursement: 500 },
  'Radiology': { avgReimbursement: 150 },
  'Lab/Pathology': { avgReimbursement: 20 },
  'Medicine': { avgReimbursement: 75 },
  'Mental Health': { avgReimbursement: 100 },
  'Cardiology': { avgReimbursement: 150 },
  'Physical Therapy': { avgReimbursement: 65 },
  'Drugs': { avgReimbursement: 50 },
  'DME': { avgReimbursement: 200 },
  'Procedures': { avgReimbursement: 125 },
  'Supplies': { avgReimbursement: 25 },
  'Unknown': { avgReimbursement: 75 },
};

// Infer category from CPT/HCPCS code
const inferCPTCategory = (code: string): string => {
  const codeUpper = code.toUpperCase().trim();
  
  // HCPCS codes (start with letter)
  if (/^[A-Z]/.test(codeUpper)) {
    if (codeUpper.startsWith('J')) return 'Drugs';
    if (codeUpper.startsWith('A')) return 'Supplies';
    if (codeUpper.startsWith('E')) return 'DME';
    if (codeUpper.startsWith('G')) return 'Procedures';
    if (codeUpper.startsWith('L')) return 'Prosthetics';
    if (codeUpper.startsWith('Q')) return 'Temp Codes';
    return 'HCPCS';
  }
  
  // CPT code ranges (numeric)
  const digitsOnly = codeUpper.replace(/\D/g, '');
  const numCode = parseInt(digitsOnly);
  if (isNaN(numCode)) return 'Unknown';
  
  if (numCode >= 99201 && numCode <= 99499) return 'E/M';
  if (numCode >= 100 && numCode <= 1999) return 'Anesthesia';
  if (numCode >= 10000 && numCode <= 69999) return 'Surgery';
  if (numCode >= 70000 && numCode <= 79999) return 'Radiology';
  if (numCode >= 80000 && numCode <= 89999) return 'Lab/Pathology';
  if (numCode >= 90785 && numCode <= 90899) return 'Mental Health';
  if (numCode >= 93000 && numCode <= 93799) return 'Cardiology';
  if (numCode >= 97001 && numCode <= 97799) return 'Physical Therapy';
  if (numCode >= 90000 && numCode <= 99199) return 'Medicine';
  
  return 'Unknown';
};

export interface CPTCodeResult {
  code: string;
  description: string;
  category: string;
  avgReimbursement: number;
}

interface CPTCodeSearchProps {
  value?: string;
  onSelect: (result: CPTCodeResult) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

// Search CPT/HCPCS codes using NLM Clinical Tables API
const searchCPTCodes = async (query: string): Promise<CPTCodeResult[]> => {
  if (!query || query.length < 2) return [];
  
  const results: CPTCodeResult[] = [];
  
  try {
    // Search HCPCS Level II codes from NLM
    const hcpcsUrl = `https://clinicaltables.nlm.nih.gov/api/hcpcs/v3/search?sf=HCPC,Long_Description&terms=${encodeURIComponent(query)}&maxList=15`;
    const hcpcsResponse = await fetch(hcpcsUrl);
    
    if (hcpcsResponse.ok) {
      const data = await hcpcsResponse.json();
      // Response format: [total, codes[], null, [code, description][]]
      if (data[3] && Array.isArray(data[3])) {
        for (const item of data[3]) {
          const code = item[0];
          const description = item[1];
          const category = inferCPTCategory(code);
          const rates = CPT_CATEGORY_RATES[category] || CPT_CATEGORY_RATES['Unknown'];
          
          results.push({
            code,
            description,
            category,
            avgReimbursement: rates.avgReimbursement,
          });
        }
      }
    }

    // Also search procedures table for surgical CPT codes
    const procUrl = `https://clinicaltables.nlm.nih.gov/api/procedures/v3/search?sf=text&terms=${encodeURIComponent(query)}&maxList=5`;
    const procResponse = await fetch(procUrl);
    
    if (procResponse.ok) {
      const procData = await procResponse.json();
      if (procData[3] && Array.isArray(procData[3])) {
        for (const item of procData[3]) {
          const description = item[0];
          // Extract code if present in description
          const codeMatch = description.match(/\b(\d{5})\b/);
          const code = codeMatch ? codeMatch[1] : `PROC-${results.length + 1}`;
          
          // Only add if not already in results
          if (!results.find(r => r.description === description)) {
            results.push({
              code,
              description,
              category: 'Surgery',
              avgReimbursement: 500,
            });
          }
        }
      }
    }
    
    return results;
  } catch (error) {
    console.error('CPT search error:', error);
    return [];
  }
};

export const CPTCodeSearch: React.FC<CPTCodeSearchProps> = ({
  value,
  onSelect,
  placeholder = 'Search CPT/HCPCS codes...',
  disabled = false,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CPTCodeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const searchResults = await searchCPTCodes(searchQuery);
      setResults(searchResults);
    } catch (err) {
      setError('Failed to search CPT codes');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length >= 2) {
      debounceRef.current = setTimeout(() => {
        handleSearch(query);
      }, 300);
    } else {
      setResults([]);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, handleSearch]);

  const handleSelect = (result: CPTCodeResult) => {
    onSelect(result);
    setOpen(false);
    setQuery('');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between text-left font-normal", className)}
        >
          {value ? (
            <span className="truncate">{value}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0 z-50" align="start">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder="Type 2+ characters to search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <ScrollArea className="max-h-[300px]">
          {loading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
            </div>
          )}
          
          {error && (
            <div className="flex items-center justify-center py-6 text-red-500">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          {!loading && !error && results.length === 0 && query.length >= 2 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No CPT/HCPCS codes found for "{query}"
            </div>
          )}
          
          {!loading && !error && query.length < 2 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Type at least 2 characters to search
            </div>
          )}
          
          {!loading && results.length > 0 && (
            <div className="py-1">
              {results.map((result, idx) => (
                <div
                  key={`${result.code}-${idx}`}
                  className="cursor-pointer px-3 py-2 hover:bg-muted transition-colors border-b last:border-b-0"
                  onClick={() => handleSelect(result)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        {result.code}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {result.category}
                      </Badge>
                    </div>
                    <span className="text-sm font-medium text-green-600">
                      {formatCurrency(result.avgReimbursement)}
                    </span>
                  </div>
                  <p className="text-sm mt-1 text-muted-foreground line-clamp-2">
                    {result.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default CPTCodeSearch;

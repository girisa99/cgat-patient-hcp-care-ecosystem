import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, X, Loader2, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// ICD-10 Reimbursement rates by category (approximate Medicare rates)
const ICD_CATEGORY_RATES: Record<string, { avgBilled: number; avgAllowed: number; avgAdjustment: number }> = {
  'Infectious': { avgBilled: 350, avgAllowed: 285, avgAdjustment: 65 },
  'Oncology': { avgBilled: 1500, avgAllowed: 1200, avgAdjustment: 300 },
  'Endocrine': { avgBilled: 250, avgAllowed: 200, avgAdjustment: 50 },
  'Mental Health': { avgBilled: 175, avgAllowed: 140, avgAdjustment: 35 },
  'Neurological': { avgBilled: 450, avgAllowed: 360, avgAdjustment: 90 },
  'Sensory': { avgBilled: 200, avgAllowed: 160, avgAdjustment: 40 },
  'Cardiovascular': { avgBilled: 550, avgAllowed: 440, avgAdjustment: 110 },
  'Respiratory': { avgBilled: 300, avgAllowed: 240, avgAdjustment: 60 },
  'Digestive': { avgBilled: 400, avgAllowed: 320, avgAdjustment: 80 },
  'Dermatology': { avgBilled: 150, avgAllowed: 120, avgAdjustment: 30 },
  'Musculoskeletal': { avgBilled: 350, avgAllowed: 280, avgAdjustment: 70 },
  'Genitourinary': { avgBilled: 325, avgAllowed: 260, avgAdjustment: 65 },
  'Symptoms': { avgBilled: 125, avgAllowed: 100, avgAdjustment: 25 },
  'Injury': { avgBilled: 500, avgAllowed: 400, avgAdjustment: 100 },
  'Preventive': { avgBilled: 175, avgAllowed: 150, avgAdjustment: 25 },
  'Unknown': { avgBilled: 200, avgAllowed: 160, avgAdjustment: 40 },
};

// Infer category from ICD-10 code prefix
const inferICDCategory = (code: string): string => {
  const normalized = code.trim().toUpperCase();
  if (normalized.startsWith('A') || normalized.startsWith('B')) return 'Infectious';
  if (normalized.startsWith('C') || normalized.startsWith('D0') || normalized.startsWith('D1') || normalized.startsWith('D2') || normalized.startsWith('D3') || normalized.startsWith('D4')) return 'Oncology';
  if (normalized.startsWith('E')) return 'Endocrine';
  if (normalized.startsWith('F')) return 'Mental Health';
  if (normalized.startsWith('G')) return 'Neurological';
  if (normalized.startsWith('H')) return 'Sensory';
  if (normalized.startsWith('I')) return 'Cardiovascular';
  if (normalized.startsWith('J')) return 'Respiratory';
  if (normalized.startsWith('K')) return 'Digestive';
  if (normalized.startsWith('L')) return 'Dermatology';
  if (normalized.startsWith('M')) return 'Musculoskeletal';
  if (normalized.startsWith('N')) return 'Genitourinary';
  if (normalized.startsWith('R')) return 'Symptoms';
  if (normalized.startsWith('S') || normalized.startsWith('T')) return 'Injury';
  if (normalized.startsWith('Z')) return 'Preventive';
  return 'Unknown';
};

export interface ICDCodeResult {
  code: string;
  description: string;
  category: string;
  avgBilled: number;
  avgAllowed: number;
  avgAdjustment: number;
}

interface ICDCodeSearchProps {
  value?: string;
  onSelect: (result: ICDCodeResult) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

// Clinical Tables API for ICD-10 search (free NLM API)
const searchICDCodes = async (query: string): Promise<ICDCodeResult[]> => {
  if (!query || query.length < 2) return [];
  
  try {
    // Use NLM Clinical Tables API for ICD-10-CM
    const url = `https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search?sf=code,name&terms=${encodeURIComponent(query)}&maxList=20`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch ICD codes');
    }
    
    const data = await response.json();
    // Response format: [total, codes[], null, [code, description][]]
    const results: ICDCodeResult[] = [];
    
    if (data[3] && Array.isArray(data[3])) {
      for (const item of data[3]) {
        const code = item[0];
        const description = item[1];
        const category = inferICDCategory(code);
        const rates = ICD_CATEGORY_RATES[category] || ICD_CATEGORY_RATES['Unknown'];
        
        results.push({
          code,
          description,
          category,
          avgBilled: rates.avgBilled,
          avgAllowed: rates.avgAllowed,
          avgAdjustment: rates.avgAdjustment,
        });
      }
    }
    
    return results;
  } catch (error) {
    console.error('ICD search error:', error);
    return [];
  }
};

export const ICDCodeSearch: React.FC<ICDCodeSearchProps> = ({
  value,
  onSelect,
  placeholder = 'Search ICD-10 codes...',
  disabled = false,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ICDCodeResult[]>([]);
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
      const searchResults = await searchICDCodes(searchQuery);
      setResults(searchResults);
    } catch (err) {
      setError('Failed to search ICD codes');
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

  const handleSelect = (result: ICDCodeResult) => {
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
            placeholder="Type 3+ characters to search..."
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
              No ICD-10 codes found for "{query}"
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
                    <Check className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                  </div>
                  <p className="text-sm mt-1 text-muted-foreground line-clamp-2">
                    {result.description}
                  </p>
                  <div className="flex gap-3 mt-1 text-xs">
                    <span className="text-blue-600">Billed: {formatCurrency(result.avgBilled)}</span>
                    <span className="text-green-600">Allowed: {formatCurrency(result.avgAllowed)}</span>
                    <span className="text-orange-600">Adj: {formatCurrency(result.avgAdjustment)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default ICDCodeSearch;

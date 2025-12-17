import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, X, Loader2, Check, AlertCircle, Pill } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NDCCodeResult {
  ndc_code: string;
  brand_name: string;
  generic_name: string;
  dosage_form: string;
  strength: string;
  manufacturer: string;
  route: string;
  product_type: string;
  avgCost: number;
}

interface NDCCodeSearchProps {
  value?: string;
  onSelect: (result: NDCCodeResult) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

// Search NDC codes using OpenFDA API
const searchNDCCodes = async (query: string): Promise<NDCCodeResult[]> => {
  if (!query || query.length < 2) return [];
  
  const results: NDCCodeResult[] = [];
  
  try {
    // OpenFDA Drug API search
    const searchTerms = encodeURIComponent(query);
    const url = `https://api.fda.gov/drug/ndc.json?search=(brand_name:"${searchTerms}"+OR+generic_name:"${searchTerms}"+OR+product_ndc:"${searchTerms}")&limit=15`;
    
    const response = await fetch(url);
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.results && Array.isArray(data.results)) {
        for (const drug of data.results) {
          // Extract active ingredient strength
          const strength = drug.active_ingredients?.[0]?.strength || 
                          drug.strength || '';
          
          // Estimate average cost based on product type
          let avgCost = 25; // Default
          const productType = drug.product_type?.toLowerCase() || '';
          if (productType.includes('prescription')) avgCost = 75;
          if (productType.includes('otc')) avgCost = 15;
          if (drug.pharm_class?.some((c: string) => c.includes('Controlled'))) avgCost = 150;
          
          results.push({
            ndc_code: drug.product_ndc || drug.package_ndc || '',
            brand_name: drug.brand_name || '',
            generic_name: drug.generic_name || '',
            dosage_form: drug.dosage_form || '',
            strength: strength,
            manufacturer: drug.labeler_name || '',
            route: Array.isArray(drug.route) ? drug.route.join(', ') : (drug.route || ''),
            product_type: drug.product_type || 'Human Prescription Drug',
            avgCost: avgCost,
          });
        }
      }
    }
    
    // If no results, try alternative search
    if (results.length === 0) {
      const altUrl = `https://api.fda.gov/drug/ndc.json?search=brand_name:${searchTerms}*&limit=10`;
      const altResponse = await fetch(altUrl);
      
      if (altResponse.ok) {
        const altData = await altResponse.json();
        
        if (altData.results && Array.isArray(altData.results)) {
          for (const drug of altData.results) {
            const strength = drug.active_ingredients?.[0]?.strength || '';
            
            results.push({
              ndc_code: drug.product_ndc || '',
              brand_name: drug.brand_name || '',
              generic_name: drug.generic_name || '',
              dosage_form: drug.dosage_form || '',
              strength: strength,
              manufacturer: drug.labeler_name || '',
              route: Array.isArray(drug.route) ? drug.route.join(', ') : (drug.route || ''),
              product_type: drug.product_type || 'Human Prescription Drug',
              avgCost: 50,
            });
          }
        }
      }
    }
    
    return results;
  } catch (error) {
    console.error('NDC search error:', error);
    return [];
  }
};

export const NDCCodeSearch: React.FC<NDCCodeSearchProps> = ({
  value,
  onSelect,
  placeholder = 'Search NDC codes or drug names...',
  disabled = false,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NDCCodeResult[]>([]);
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
      const searchResults = await searchNDCCodes(searchQuery);
      setResults(searchResults);
    } catch (err) {
      setError('Failed to search NDC codes');
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
      }, 400); // Slightly longer debounce for FDA API
    } else {
      setResults([]);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, handleSearch]);

  const handleSelect = (result: NDCCodeResult) => {
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
          <Pill className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[450px] p-0 z-50" align="start">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder="Type drug name or NDC..."
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
        
        <ScrollArea className="max-h-[350px]">
          {loading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Searching OpenFDA...</span>
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
              No NDC codes found for "{query}"
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
                  key={`${result.ndc_code}-${idx}`}
                  className="cursor-pointer px-3 py-2 hover:bg-muted transition-colors border-b last:border-b-0"
                  onClick={() => handleSelect(result)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs bg-blue-50">
                        {result.ndc_code}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {result.dosage_form}
                      </Badge>
                    </div>
                    <span className="text-sm font-medium text-green-600">
                      ~{formatCurrency(result.avgCost)}
                    </span>
                  </div>
                  <div className="mt-1">
                    <p className="text-sm font-medium">{result.brand_name || result.generic_name}</p>
                    {result.brand_name && result.generic_name && (
                      <p className="text-xs text-muted-foreground">{result.generic_name}</p>
                    )}
                  </div>
                  <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                    {result.strength && <span>{result.strength}</span>}
                    {result.route && <span>• {result.route}</span>}
                    {result.manufacturer && <span>• {result.manufacturer}</span>}
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

export default NDCCodeSearch;

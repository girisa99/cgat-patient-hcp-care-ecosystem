
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TreatmentCenterOnboarding } from '@/types/onboarding';
import { useFinancialAssessment } from '@/hooks/useFinancialAssessment';

interface FinancialAssessmentStepProps {
  data: Partial<TreatmentCenterOnboarding>;
  onDataChange: (data: Partial<TreatmentCenterOnboarding>) => void;
}

const REVENUE_RANGES = [
  { value: 'under_1m', label: 'Under $1M' },
  { value: '1m_to_5m', label: '$1M - $5M' },
  { value: '5m_to_25m', label: '$5M - $25M' },
  { value: '25m_to_100m', label: '$25M - $100M' },
  { value: 'over_100m', label: 'Over $100M' },
];

const CREDIT_SCORE_RANGES = [
  { value: 'excellent', label: 'Excellent (750+)' },
  { value: 'good', label: 'Good (700-749)' },
  { value: 'fair', label: 'Fair (650-699)' },
  { value: 'poor', label: 'Poor (600-649)' },
  { value: 'very_poor', label: 'Very Poor (<600)' },
];

const PAYMENT_HISTORY_RATINGS = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'satisfactory', label: 'Satisfactory' },
  { value: 'needs_improvement', label: 'Needs Improvement' },
];

export const FinancialAssessmentStep: React.FC<FinancialAssessmentStepProps> = ({
  data,
  onDataChange,
}) => {
  const { calculateRiskScore } = useFinancialAssessment();
  
  const financialData = data.financial_assessment || {
    annual_revenue_range: '',
    credit_score_range: '',
    years_in_operation: 0,
    debt_to_equity_ratio: 0,
    current_ratio: 0,
    days_sales_outstanding: 0,
    payment_history_rating: '',
    insurance_coverage: {},
    financial_guarantees: {},
  };

  const updateFinancialData = (updates: any) => {
    const updatedData = {
      ...financialData,
      ...updates,
    };
    
    onDataChange({
      ...data,
      financial_assessment: updatedData,
    });
  };

  const getRiskLevelColor = (score: number) => {
    if (score <= 25) return 'bg-green-100 text-green-800';
    if (score <= 50) return 'bg-yellow-100 text-yellow-800';
    if (score <= 75) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getRiskLevelText = (score: number) => {
    if (score <= 25) return 'Low Risk';
    if (score <= 50) return 'Medium Risk';
    if (score <= 75) return 'High Risk';
    return 'Very High Risk';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Company Financial Information</CardTitle>
          <CardDescription>
            Provide financial details for credit assessment and risk evaluation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="revenue_range">Annual Revenue Range</Label>
              <Select
                value={financialData.annual_revenue_range}
                onValueChange={(value) => updateFinancialData({ annual_revenue_range: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select revenue range" />
                </SelectTrigger>
                <SelectContent>
                  {REVENUE_RANGES.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="credit_score">Credit Score Range</Label>
              <Select
                value={financialData.credit_score_range}
                onValueChange={(value) => updateFinancialData({ credit_score_range: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select credit score range" />
                </SelectTrigger>
                <SelectContent>
                  {CREDIT_SCORE_RANGES.map((score) => (
                    <SelectItem key={score.value} value={score.value}>
                      {score.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="years_operation">Years in Operation</Label>
              <Input
                id="years_operation"
                type="number"
                value={financialData.years_in_operation || ''}
                onChange={(e) => updateFinancialData({ years_in_operation: parseInt(e.target.value) || 0 })}
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="payment_history">Payment History Rating</Label>
              <Select
                value={financialData.payment_history_rating}
                onValueChange={(value) => updateFinancialData({ payment_history_rating: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment history" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_HISTORY_RATINGS.map((rating) => (
                    <SelectItem key={rating.value} value={rating.value}>
                      {rating.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Financial Ratios</CardTitle>
          <CardDescription>
            Key financial ratios for credit evaluation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="debt_equity">Debt-to-Equity Ratio</Label>
              <Input
                id="debt_equity"
                type="number"
                step="0.01"
                value={financialData.debt_to_equity_ratio || ''}
                onChange={(e) => updateFinancialData({ debt_to_equity_ratio: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="current_ratio">Current Ratio</Label>
              <Input
                id="current_ratio"
                type="number"
                step="0.01"
                value={financialData.current_ratio || ''}
                onChange={(e) => updateFinancialData({ current_ratio: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="dso">Days Sales Outstanding</Label>
              <Input
                id="dso"
                type="number"
                value={financialData.days_sales_outstanding || ''}
                onChange={(e) => updateFinancialData({ days_sales_outstanding: parseInt(e.target.value) || 0 })}
                placeholder="0"
                min="0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {(financialData.annual_revenue_range && financialData.years_in_operation) && (
        <Card>
          <CardHeader>
            <CardTitle>Risk Assessment Summary</CardTitle>
            <CardDescription>
              Preliminary risk evaluation based on provided information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center p-4">
              <div className="text-2xl font-bold mb-2">Financial Profile</div>
              <div className="space-y-2">
                <Badge className={getRiskLevelColor(50)} variant="secondary">
                  Assessment Pending
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Final risk assessment will be calculated upon submission
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

import React, { useState, useRef } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Presentation, Eye } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import { 
  GenieStudioOnePager,
  SparkOnePager,
  MindOnePager,
  VibeOnePager,
  ArcOnePager,
  DeckOnePager,
  AskGenieOnePager,
  GenieStudioPitchDeck,
} from '@/components/marketing';

type OnePagerType = 'overview' | 'spark' | 'mind' | 'vibe' | 'arc' | 'deck' | 'askGenie';

const ONE_PAGER_CONFIG: Record<OnePagerType, { name: string; icon: string; component: React.FC }> = {
  overview: { name: 'Genie Suite Overview', icon: '🧞', component: GenieStudioOnePager },
  spark: { name: 'Genie Spark', icon: '✨', component: SparkOnePager },
  mind: { name: 'Genie Mind', icon: '🧠', component: MindOnePager },
  vibe: { name: 'Genie Vibe', icon: '🎬', component: VibeOnePager },
  arc: { name: 'Genie Hub', icon: '🎯', component: ArcOnePager },
  deck: { name: 'Genie Deck', icon: '📊', component: DeckOnePager },
  askGenie: { name: 'Ask Genie', icon: '🧞', component: AskGenieOnePager },
};

const MarketingMaterialsPage: React.FC = () => {
  const [selectedOnePager, setSelectedOnePager] = useState<OnePagerType>('overview');
  const [isExporting, setIsExporting] = useState(false);
  const onePagerRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!onePagerRef.current) return;
    
    setIsExporting(true);
    try {
      const canvas = await html2canvas(onePagerRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2],
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`${ONE_PAGER_CONFIG[selectedOnePager].name.replace(/\s+/g, '-')}-OnePager.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const CurrentOnePager = ONE_PAGER_CONFIG[selectedOnePager].component;

  return (
    <AppLayout title="Marketing Materials">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Marketing Materials</h1>
            <p className="text-muted-foreground">
              PDF-ready one-pagers and pitch deck for Genie Suite
            </p>
          </div>
          <Badge variant="secondary" className="text-sm">
            Genie Deck Format
          </Badge>
        </div>

        <Tabs defaultValue="one-pagers" className="space-y-6">
          <TabsList>
            <TabsTrigger value="one-pagers" className="gap-2">
              <FileText className="h-4 w-4" /> One-Pagers
            </TabsTrigger>
            <TabsTrigger value="pitch-deck" className="gap-2">
              <Presentation className="h-4 w-4" /> Pitch Deck
            </TabsTrigger>
          </TabsList>

          {/* One-Pagers Tab */}
          <TabsContent value="one-pagers" className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Sidebar */}
              <div className="col-span-3">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Select One-Pager</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    {(Object.entries(ONE_PAGER_CONFIG) as [OnePagerType, typeof ONE_PAGER_CONFIG[OnePagerType]][]).map(
                      ([key, config]) => (
                        <button
                          key={key}
                          onClick={() => setSelectedOnePager(key)}
                          className={`w-full flex items-center gap-2 p-2 rounded-md text-left text-sm transition-colors ${
                            selectedOnePager === key
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted'
                          }`}
                        >
                          <span>{config.icon}</span>
                          <span>{config.name}</span>
                        </button>
                      )
                    )}
                  </CardContent>
                </Card>

                <Card className="mt-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button 
                      className="w-full gap-2" 
                      onClick={handleDownloadPDF}
                      disabled={isExporting}
                    >
                      <Download className="h-4 w-4" />
                      {isExporting ? 'Exporting...' : 'Download PDF'}
                    </Button>
                    <Button variant="outline" className="w-full gap-2">
                      <Eye className="h-4 w-4" />
                      Print Preview
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Preview */}
              <div className="col-span-9">
                <Card>
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Preview: {ONE_PAGER_CONFIG[selectedOnePager].name}
                    </CardTitle>
                    <Badge variant="outline">A4 / Letter</Badge>
                  </CardHeader>
                  <CardContent>
                    <div 
                      ref={onePagerRef}
                      className="border rounded-lg shadow-sm overflow-hidden"
                    >
                      <CurrentOnePager />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Pitch Deck Tab */}
          <TabsContent value="pitch-deck">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Presentation className="h-5 w-5" />
                  Genie Suite Investor Pitch Deck
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GenieStudioPitchDeck />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default MarketingMaterialsPage;

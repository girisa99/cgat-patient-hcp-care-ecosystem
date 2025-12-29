import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, Loader2, Newspaper } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface ArticleOption {
  id: string;
  title: string;
  description: string;
  filename: string;
  path: string;
}

const articles: ArticleOption[] = [
  {
    id: 'enhancement',
    title: '🧠 Beyond the 64-Hour Build: Intelligent Dynamic Extraction',
    description: 'The enhancement article covering two-stage Vision AI, multi-model routing, and dynamic field discovery for patient onboarding, prescriptions, insurance & 15+ document types.',
    filename: 'LinkedIn_AI_Enhancement_Article.md',
    path: '/docs/LINKEDIN_UPDATE_RECENT_ENHANCEMENTS.md'
  },
  {
    id: 'full-writeup',
    title: '📖 Full Technical Deep-Dive',
    description: 'Complete technical writeup covering the entire AI document processing platform architecture.',
    filename: 'LinkedIn_Full_Technical_Writeup.md',
    path: '/docs/LINKEDIN_ARTICLE_FULL_WRITEUP.md'
  },
  {
    id: 'document-processing',
    title: '⚡ Document Processing Overview',
    description: 'Overview article focused on the document processing capabilities and features.',
    filename: 'LinkedIn_Document_Processing_Article.md',
    path: '/docs/LINKEDIN_ARTICLE_DOCUMENT_PROCESSING.md'
  },
  {
    id: 'medical-imaging',
    title: '🩻 Medical Imaging Section',
    description: 'Dedicated article section covering medical imaging AI analysis capabilities.',
    filename: 'LinkedIn_Medical_Imaging_Section.md',
    path: '/docs/linkedin-article-medical-imaging-section.md'
  }
];

const LinkedInArticleDownload = () => {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (article: ArticleOption) => {
    setDownloading(article.id);
    
    try {
      const response = await fetch(article.path);
      
      if (!response.ok) {
        throw new Error('Failed to fetch article');
      }
      
      const content = await response.text();
      
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = article.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`${article.filename} downloaded successfully!`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download article. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadAll = async () => {
    setDownloading('all');
    
    try {
      for (const article of articles) {
        const response = await fetch(article.path);
        
        if (!response.ok) {
          console.warn(`Failed to fetch ${article.filename}`);
          continue;
        }
        
        const content = await response.text();
        
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = article.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      toast.success('All articles downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download some articles.');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-primary" />
          LinkedIn Articles - AI Document Processing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm">
          Download the LinkedIn articles covering the AI-powered document processing platform enhancements.
        </p>
        
        <div className="grid gap-3">
          {articles.map((article) => (
            <div 
              key={article.id}
              className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{article.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2">{article.description}</p>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleDownload(article)}
                disabled={downloading !== null}
                className="ml-3 shrink-0"
              >
                {downloading === article.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))}
        </div>

        <Separator />
        
        <Button 
          onClick={handleDownloadAll} 
          className="w-full"
          disabled={downloading !== null}
        >
          {downloading === 'all' ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Downloading All...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Download All Articles (.md)
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default LinkedInArticleDownload;

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, Download, Share2, Trash2, ExternalLink, 
  Globe, Lock, MoreVertical, BarChart3, Calendar
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

interface Presentation {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  thumbnail_url: string | null;
  is_public: boolean;
  status: string;
  view_count: number;
  share_count: number;
  download_count: number;
  created_at: string;
  category: string | null;
  tags: string[] | null;
}

interface PresentationCardProps {
  presentation: Presentation;
  viewMode: 'grid' | 'list';
  onShare: () => void;
  onView: () => void;
  onDelete: () => void;
}

export const PresentationCard: React.FC<PresentationCardProps> = ({
  presentation,
  viewMode,
  onShare,
  onView,
  onDelete
}) => {
  const statusColors = {
    draft: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    published: 'bg-green-100 text-green-800 border-green-300',
    archived: 'bg-gray-100 text-gray-800 border-gray-300'
  };

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4 flex-1">
            {/* Thumbnail */}
            <div className="w-24 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center overflow-hidden">
              {presentation.thumbnail_url ? (
                <img 
                  src={presentation.thumbnail_url} 
                  alt={presentation.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Eye className="w-6 h-6 text-primary/50" />
              )}
            </div>
            
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold truncate">{presentation.name}</h3>
                {presentation.is_public ? (
                  <Globe className="w-4 h-4 text-green-600" />
                ) : (
                  <Lock className="w-4 h-4 text-gray-500" />
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {presentation.description || 'No description'}
              </p>
              <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" /> {presentation.view_count}
                </span>
                <span className="flex items-center gap-1">
                  <Share2 className="w-3 h-3" /> {presentation.share_count}
                </span>
                <span className="flex items-center gap-1">
                  <Download className="w-3 h-3" /> {presentation.download_count}
                </span>
              </div>
            </div>
          </div>

          {/* Status & Actions */}
          <div className="flex items-center gap-3">
            <Badge className={statusColors[presentation.status as keyof typeof statusColors] || statusColors.draft}>
              {presentation.status}
            </Badge>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onView}>
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={onShare}>
                <Share2 className="w-4 h-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onView}>
                    <ExternalLink className="w-4 h-4 mr-2" /> View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onShare}>
                    <Share2 className="w-4 h-4 mr-2" /> Share
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onDelete} className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view
  return (
    <Card className="hover:shadow-lg transition-all hover:-translate-y-1 group">
      {/* Thumbnail */}
      <div className="relative h-40 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 overflow-hidden">
        {presentation.thumbnail_url ? (
          <img 
            src={presentation.thumbnail_url} 
            alt={presentation.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Eye className="w-12 h-12 text-primary/30" />
          </div>
        )}
        
        {/* Overlay actions */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button variant="secondary" size="sm" onClick={onView}>
            <ExternalLink className="w-4 h-4 mr-1" /> View
          </Button>
          <Button variant="secondary" size="sm" onClick={onShare}>
            <Share2 className="w-4 h-4 mr-1" /> Share
          </Button>
        </div>
        
        {/* Status badge */}
        <div className="absolute top-2 right-2">
          <Badge className={statusColors[presentation.status as keyof typeof statusColors] || statusColors.draft}>
            {presentation.status}
          </Badge>
        </div>
        
        {/* Visibility icon */}
        <div className="absolute top-2 left-2">
          {presentation.is_public ? (
            <Badge variant="secondary" className="bg-green-100/80">
              <Globe className="w-3 h-3 mr-1" /> Public
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-gray-100/80">
              <Lock className="w-3 h-3 mr-1" /> Private
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold truncate mb-1">{presentation.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {presentation.description || 'No description'}
        </p>
        
        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" /> {presentation.view_count}
            </span>
            <span className="flex items-center gap-1">
              <Share2 className="w-3 h-3" /> {presentation.share_count}
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {format(new Date(presentation.created_at), 'MMM d')}
          </span>
        </div>

        {/* Tags */}
        {presentation.tags && presentation.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {presentation.tags.slice(0, 3).map((tag, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {presentation.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{presentation.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

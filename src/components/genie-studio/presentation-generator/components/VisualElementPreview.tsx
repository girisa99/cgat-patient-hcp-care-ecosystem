/**
 * Visual Element Preview - Renders hybrid PNG+SVG layers
 * Displays the combined visual with layer controls
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Edit3, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Layers,
  Lock,
  Unlock,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { VisualElement, VisualLayer } from '../types';

interface VisualElementPreviewProps {
  element: VisualElement;
  onEdit: () => void;
  onRegenerate: () => void;
  onLayerVisibilityToggle: (layerId: string) => void;
  onLayerLockToggle: (layerId: string) => void;
  showLayerControls?: boolean;
  className?: string;
}

export function VisualElementPreview({
  element,
  onEdit,
  onRegenerate,
  onLayerVisibilityToggle,
  onLayerLockToggle,
  showLayerControls = false,
  className
}: VisualElementPreviewProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showLayers, setShowLayers] = useState(showLayerControls);

  const isProcessing = element.isRegenerating || element.isEnhancing;

  // Sort layers by z-index for proper rendering
  const sortedLayers = [...element.layers].sort((a, b) => a.zIndex - b.zIndex);
  const visibleLayers = sortedLayers.filter(l => l.isVisible);

  return (
    <div 
      className={cn(
        "relative rounded-lg border overflow-hidden bg-muted/20",
        isProcessing && "opacity-70",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Layer Stack Render */}
      <div className="relative aspect-video">
        {visibleLayers.map((layer) => (
          <LayerRenderer key={layer.id} layer={layer} />
        ))}

        {/* Processing Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
            <div className="flex items-center gap-2 text-sm">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>{element.isRegenerating ? 'Regenerating...' : 'Enhancing...'}</span>
            </div>
          </div>
        )}

        {/* Hover Actions */}
        {isHovered && !isProcessing && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 transition-opacity">
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit3 className="h-3 w-3 mr-1.5" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onRegenerate();
              }}
            >
              <RefreshCw className="h-3 w-3 mr-1.5" />
              Regenerate
            </Button>
          </div>
        )}
      </div>

      {/* Element Info Bar */}
      <div className="flex items-center justify-between p-2 bg-muted/30 border-t">
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="text-[10px]">
            {element.type}
          </Badge>
          <span className="text-[10px] text-muted-foreground">
            {element.layers.length} layers
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setShowLayers(!showLayers)}
        >
          <Layers className={cn("h-3 w-3", showLayers && "text-primary")} />
        </Button>
      </div>

      {/* Layer Controls Panel */}
      {showLayers && (
        <div className="border-t p-2 space-y-1.5 bg-muted/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-medium text-muted-foreground uppercase">Layers</span>
          </div>
          {sortedLayers.map((layer) => (
            <div 
              key={layer.id}
              className="flex items-center gap-2 p-1.5 rounded border bg-background/50 text-xs"
            >
              <button
                onClick={() => onLayerVisibilityToggle(layer.id)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {layer.isVisible ? (
                  <Eye className="h-3 w-3" />
                ) : (
                  <EyeOff className="h-3 w-3" />
                )}
              </button>
              
              <span className={cn(
                "flex-1 truncate",
                !layer.isVisible && "opacity-50"
              )}>
                {getLayerLabel(layer)}
              </span>
              
              <Badge variant="outline" className="text-[9px]">
                {layer.content.type}
              </Badge>
              
              <button
                onClick={() => onLayerLockToggle(layer.id)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {layer.isLocked ? (
                  <Lock className="h-3 w-3" />
                ) : (
                  <Unlock className="h-3 w-3" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper to render individual layers
function LayerRenderer({ layer }: { layer: VisualLayer }) {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: layer.position.x,
    top: layer.position.y,
    width: layer.size.width,
    height: layer.size.height,
    zIndex: layer.zIndex,
  };

  switch (layer.content.type) {
    case 'text':
      const textContent = layer.content as { 
        type: 'text'; 
        text: string; 
        format: 'svg' | 'html';
        style: {
          fontFamily: string;
          fontSize: number;
          fontWeight: number;
          color: string;
          alignment: 'left' | 'center' | 'right';
        }
      };
      
      if (textContent.format === 'svg') {
        return (
          <svg style={style}>
            <text
              x="50%"
              y="50%"
              dominantBaseline="middle"
              textAnchor={
                textContent.style.alignment === 'left' ? 'start' :
                textContent.style.alignment === 'right' ? 'end' : 'middle'
              }
              style={{
                fontFamily: textContent.style.fontFamily,
                fontSize: textContent.style.fontSize,
                fontWeight: textContent.style.fontWeight,
                fill: textContent.style.color,
              }}
            >
              {textContent.text}
            </text>
          </svg>
        );
      }
      
      return (
        <div 
          style={{
            ...style,
            fontFamily: textContent.style.fontFamily,
            fontSize: textContent.style.fontSize,
            fontWeight: textContent.style.fontWeight,
            color: textContent.style.color,
            textAlign: textContent.style.alignment,
            display: 'flex',
            alignItems: 'center',
            justifyContent: textContent.style.alignment === 'left' ? 'flex-start' :
                           textContent.style.alignment === 'right' ? 'flex-end' : 'center',
          }}
        >
          {textContent.text}
        </div>
      );

    case 'visual':
      const visualContent = layer.content as { 
        type: 'visual'; 
        url: string; 
        base64?: string;
        alt: string 
      };
      return (
        <img
          src={visualContent.url || visualContent.base64}
          alt={visualContent.alt}
          style={{
            ...style,
            objectFit: 'cover',
          }}
        />
      );

    case 'vector':
      const vectorContent = layer.content as { 
        type: 'vector'; 
        svgContent: string 
      };
      return (
        <div
          style={style}
          dangerouslySetInnerHTML={{ __html: vectorContent.svgContent }}
        />
      );

    default:
      return null;
  }
}

// Helper to get a display label for a layer
function getLayerLabel(layer: VisualLayer): string {
  switch (layer.content.type) {
    case 'text':
      const text = (layer.content as { text: string }).text;
      return text.length > 20 ? text.substring(0, 20) + '...' : text;
    case 'visual':
      return (layer.content as { alt: string }).alt || 'Image';
    case 'vector':
      return 'Vector shape';
    default:
      return 'Layer';
  }
}

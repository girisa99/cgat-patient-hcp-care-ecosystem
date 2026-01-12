/**
 * Location Story Mode
 * P2 Feature: Create location-based stories with auto geo-tagging
 * Perfect for travel vlogs, real estate, and location-based content
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  MapPin,
  Navigation,
  Camera,
  Video,
  Mic,
  Map,
  Plus,
  Trash2,
  Play,
  Clock,
  Globe,
  Loader2,
  ChevronRight,
  Star,
  Edit,
  GripVertical,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { TimelineClip } from './MultiClipTimeline';

interface LocationPoint {
  id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  clips: string[]; // clip IDs
  thumbnail?: string;
  isHighlight?: boolean;
}

interface StoryRoute {
  id: string;
  name: string;
  points: LocationPoint[];
  totalDistance?: number;
  duration?: number;
}

interface LocationStoryModeProps {
  clips: TimelineClip[];
  onClipsChange: (clips: TimelineClip[]) => void;
  className?: string;
}

export const LocationStoryMode: React.FC<LocationStoryModeProps> = ({
  clips,
  onClipsChange,
  className,
}) => {
  const [locationPoints, setLocationPoints] = useState<LocationPoint[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [autoTagEnabled, setAutoTagEnabled] = useState(true);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [storyName, setStoryName] = useState('My Location Story');
  const [isRecording, setIsRecording] = useState(false);

  // Get current location
  const getCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return null;
    }

    setIsGettingLocation(true);
    
    return new Promise<{ lat: number; lng: number } | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(loc);
          setIsGettingLocation(false);
          resolve(loc);
        },
        (error) => {
          toast.error('Could not get location');
          setIsGettingLocation(false);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }, []);

  // Add a new location point
  const addLocationPoint = useCallback(async (name?: string) => {
    const location = await getCurrentLocation();
    if (!location) return;

    const newPoint: LocationPoint = {
      id: crypto.randomUUID(),
      name: name || `Point ${locationPoints.length + 1}`,
      latitude: location.lat,
      longitude: location.lng,
      timestamp: new Date(),
      clips: [],
      isHighlight: false,
    };

    setLocationPoints(prev => [...prev, newPoint]);
    setSelectedPointId(newPoint.id);
    toast.success(`Location point added at ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`);
  }, [getCurrentLocation, locationPoints.length]);

  // Assign clip to location point
  const assignClipToPoint = (clipId: string, pointId: string) => {
    setLocationPoints(prev => 
      prev.map(p => {
        if (p.id === pointId) {
          const newClips = p.clips.includes(clipId) 
            ? p.clips.filter(id => id !== clipId)
            : [...p.clips, clipId];
          return { ...p, clips: newClips };
        }
        return p;
      })
    );
    toast.success('Clip assigned to location');
  };

  // Toggle highlight for a point
  const toggleHighlight = (pointId: string) => {
    setLocationPoints(prev =>
      prev.map(p => p.id === pointId ? { ...p, isHighlight: !p.isHighlight } : p)
    );
  };

  // Delete location point
  const deletePoint = (pointId: string) => {
    setLocationPoints(prev => prev.filter(p => p.id !== pointId));
    if (selectedPointId === pointId) {
      setSelectedPointId(null);
    }
    toast.success('Location point removed');
  };

  // Update point details
  const updatePoint = (pointId: string, updates: Partial<LocationPoint>) => {
    setLocationPoints(prev =>
      prev.map(p => p.id === pointId ? { ...p, ...updates } : p)
    );
  };

  // Generate location-based story timeline
  const generateStoryTimeline = () => {
    if (locationPoints.length === 0) {
      toast.error('Add location points first');
      return;
    }

    // Sort points by timestamp
    const sortedPoints = [...locationPoints].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    // Collect all clip IDs in order
    const orderedClipIds = sortedPoints.flatMap(p => p.clips);
    
    // Reorder clips on timeline
    let currentTime = 0;
    const reorderedClips = clips.map(clip => {
      const orderIndex = orderedClipIds.indexOf(clip.id);
      if (orderIndex >= 0) {
        // This clip is in the story, position it
        const newClip = { ...clip, startTime: currentTime };
        currentTime += clip.duration + 0.3; // Small gap between clips
        return newClip;
      }
      return clip;
    });

    onClipsChange(reorderedClips);
    toast.success(`Story timeline generated with ${orderedClipIds.length} clips across ${sortedPoints.length} locations`);
  };

  // Start location-aware recording session
  const startLocationRecording = async () => {
    const location = await getCurrentLocation();
    if (!location) return;

    setIsRecording(true);
    
    // Auto-add location point
    const newPoint: LocationPoint = {
      id: crypto.randomUUID(),
      name: `Recording at ${new Date().toLocaleTimeString()}`,
      latitude: location.lat,
      longitude: location.lng,
      timestamp: new Date(),
      clips: [],
    };
    
    setLocationPoints(prev => [...prev, newPoint]);
    setSelectedPointId(newPoint.id);
    toast.success('Recording started with location tracking');
  };

  const stopLocationRecording = () => {
    setIsRecording(false);
    toast.success('Recording stopped');
  };

  const formatCoordinate = (coord: number, type: 'lat' | 'lng') => {
    const direction = type === 'lat' 
      ? (coord >= 0 ? 'N' : 'S')
      : (coord >= 0 ? 'E' : 'W');
    return `${Math.abs(coord).toFixed(4)}° ${direction}`;
  };

  const selectedPoint = locationPoints.find(p => p.id === selectedPointId);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2 px-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Location Story Mode
          </span>
          <Badge variant="secondary" className="text-[10px]">
            {locationPoints.length} points
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 px-3 pb-3">
        {/* Story Name */}
        <Input
          value={storyName}
          onChange={(e) => setStoryName(e.target.value)}
          placeholder="Story name..."
          className="text-sm"
        />

        {/* Current Location Display */}
        <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
          <div className="flex items-center gap-2">
            <Navigation className={cn(
              "h-4 w-4",
              currentLocation ? "text-green-500" : "text-muted-foreground"
            )} />
            {currentLocation ? (
              <span className="text-[10px]">
                {formatCoordinate(currentLocation.lat, 'lat')}, {formatCoordinate(currentLocation.lng, 'lng')}
              </span>
            ) : (
              <span className="text-[10px] text-muted-foreground">Location not set</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-[10px]"
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
          >
            {isGettingLocation ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              'Update'
            )}
          </Button>
        </div>

        {/* Auto-tag toggle */}
        <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
          <div className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[10px]">Auto-tag new recordings</span>
          </div>
          <Switch
            checked={autoTagEnabled}
            onCheckedChange={setAutoTagEnabled}
          />
        </div>

        {/* Recording with location */}
        <div className="flex gap-2">
          <Button
            variant={isRecording ? "destructive" : "default"}
            className="flex-1"
            onClick={isRecording ? stopLocationRecording : startLocationRecording}
          >
            {isRecording ? (
              <>
                <Video className="h-4 w-4 mr-2 animate-pulse" />
                Stop Recording
              </>
            ) : (
              <>
                <Camera className="h-4 w-4 mr-2" />
                Record with Location
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => addLocationPoint()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Location Points List */}
        {locationPoints.length > 0 && (
          <div className="space-y-2">
            <Label className="text-[10px] text-muted-foreground">Location Points</Label>
            <ScrollArea className="h-40">
              <div className="space-y-1 pr-2">
                {locationPoints.map((point, index) => (
                  <div
                    key={point.id}
                    className={cn(
                      "p-2 rounded border cursor-pointer transition-all",
                      selectedPointId === point.id 
                        ? "bg-primary/10 border-primary" 
                        : "bg-muted/30 border-transparent hover:border-muted"
                    )}
                    onClick={() => setSelectedPointId(point.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] font-mono text-muted-foreground">
                          #{index + 1}
                        </span>
                        <MapPin className={cn(
                          "h-3 w-3",
                          point.isHighlight ? "text-yellow-500" : "text-muted-foreground"
                        )} />
                        <span className="text-[10px] font-medium truncate max-w-[100px]">
                          {point.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-[8px] px-1">
                          {point.clips.length} clips
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleHighlight(point.id);
                          }}
                        >
                          <Star className={cn(
                            "h-3 w-3",
                            point.isHighlight ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"
                          )} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePoint(point.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-[8px] text-muted-foreground mt-1 flex items-center gap-2">
                      <span>{formatCoordinate(point.latitude, 'lat')}, {formatCoordinate(point.longitude, 'lng')}</span>
                      <span>•</span>
                      <Clock className="h-2.5 w-2.5" />
                      <span>{point.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Selected Point Details */}
        {selectedPoint && (
          <div className="p-2 bg-muted/30 rounded space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-medium">Edit Point</Label>
              <Edit className="h-3 w-3 text-muted-foreground" />
            </div>
            <Input
              value={selectedPoint.name}
              onChange={(e) => updatePoint(selectedPoint.id, { name: e.target.value })}
              placeholder="Point name..."
              className="h-7 text-[11px]"
            />
            <Textarea
              value={selectedPoint.description || ''}
              onChange={(e) => updatePoint(selectedPoint.id, { description: e.target.value })}
              placeholder="Description (optional)..."
              className="text-[10px] min-h-[40px]"
            />
            
            {/* Assign clips */}
            <div className="space-y-1">
              <Label className="text-[9px] text-muted-foreground">Assign Clips</Label>
              <div className="flex flex-wrap gap-1">
                {clips.filter(c => c.type === 'video').slice(0, 8).map(clip => (
                  <Button
                    key={clip.id}
                    variant={selectedPoint.clips.includes(clip.id) ? "default" : "outline"}
                    size="sm"
                    className="h-6 text-[8px] px-1.5"
                    onClick={() => assignClipToPoint(clip.id, selectedPoint.id)}
                  >
                    {selectedPoint.clips.includes(clip.id) && (
                      <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                    )}
                    {clip.name.slice(0, 10)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Generate Story Timeline */}
        <Button
          className="w-full"
          onClick={generateStoryTimeline}
          disabled={locationPoints.length === 0}
        >
          <Map className="h-4 w-4 mr-2" />
          Generate Location Story
        </Button>

        {/* Tips */}
        <div className="text-[9px] text-muted-foreground bg-muted/30 p-2 rounded">
          <strong>Tip:</strong> Record at different locations, assign clips to each point, then generate a chronological location-based story.
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationStoryMode;

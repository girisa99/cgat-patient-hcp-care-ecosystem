/**
 * Native Feature Button Component
 * Provides one-tap access to native mobile features
 */

import React, { useState } from 'react';
import { Camera, MapPin, Bell, Fingerprint, Share2, Vibrate } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCapacitor } from '@/hooks/useCapacitor';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface NativeFeatureButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
}

export const NativeFeatureButton: React.FC<NativeFeatureButtonProps> = ({
  className,
  variant = 'outline',
}) => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const {
    state,
    takePhoto,
    pickFromGallery,
    getCurrentPosition,
    vibrate,
    registerPush,
  } = useCapacitor();
  const { state: biometricState, authenticate } = useBiometricAuth();

  const handleTakePhoto = async () => {
    setIsLoading('camera');
    try {
      const photo = await takePhoto();
      if (photo) {
        toast.success('Photo captured!', { description: 'Photo saved successfully' });
      }
    } catch (error) {
      toast.error('Failed to capture photo');
    } finally {
      setIsLoading(null);
    }
  };

  const handlePickPhoto = async () => {
    setIsLoading('gallery');
    try {
      const photo = await pickFromGallery();
      if (photo) {
        toast.success('Photo selected!');
      }
    } catch (error) {
      toast.error('Failed to pick photo');
    } finally {
      setIsLoading(null);
    }
  };

  const handleGetLocation = async () => {
    setIsLoading('location');
    try {
      const position = await getCurrentPosition();
      if (position) {
        toast.success('Location obtained!', {
          description: `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`,
        });
      }
    } catch (error) {
      toast.error('Failed to get location');
    } finally {
      setIsLoading(null);
    }
  };

  const handleBiometricAuth = async () => {
    setIsLoading('biometric');
    try {
      const success = await authenticate('Verify your identity');
      if (success) {
        toast.success('Authenticated!', { description: 'Identity verified successfully' });
        await vibrate('light');
      } else {
        toast.error('Authentication failed');
      }
    } catch (error) {
      toast.error('Biometric authentication unavailable');
    } finally {
      setIsLoading(null);
    }
  };

  const handleEnablePush = async () => {
    setIsLoading('push');
    try {
      const token = await registerPush();
      if (token) {
        toast.success('Push notifications enabled!');
        console.log('Push token:', token);
      } else if (!state.isNative) {
        toast.info('Push notifications require native app');
      }
    } catch (error) {
      toast.error('Failed to enable push notifications');
    } finally {
      setIsLoading(null);
    }
  };

  const handleVibrate = async () => {
    await vibrate('medium');
    toast.success('Vibrated!');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'CGAT Healthcare',
          text: 'Check out this healthcare platform!',
          url: window.location.href,
        });
        toast.success('Shared successfully!');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size="sm" className={cn('gap-2', className)}>
          <Camera className="h-4 w-4" />
          <span className="hidden sm:inline">Native Features</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          {state.isNative ? `${state.platform.toUpperCase()} Features` : 'Mobile Features'}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleTakePhoto} disabled={isLoading === 'camera'}>
          <Camera className="h-4 w-4 mr-2" />
          Take Photo
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handlePickPhoto} disabled={isLoading === 'gallery'}>
          <Camera className="h-4 w-4 mr-2" />
          Pick from Gallery
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleGetLocation} disabled={isLoading === 'location'}>
          <MapPin className="h-4 w-4 mr-2" />
          Get Location
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleBiometricAuth}
          disabled={isLoading === 'biometric' || !biometricState.isAvailable}
        >
          <Fingerprint className="h-4 w-4 mr-2" />
          {biometricState.biometryType === 'face' ? 'Face ID' : 'Fingerprint'}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleEnablePush} disabled={isLoading === 'push'}>
          <Bell className="h-4 w-4 mr-2" />
          Enable Push Notifications
        </DropdownMenuItem>

        {state.isNative && (
          <DropdownMenuItem onClick={handleVibrate}>
            <Vibrate className="h-4 w-4 mr-2" />
            Test Haptics
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleShare}>
          <Share2 className="h-4 w-4 mr-2" />
          Share App
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/**
 * MASTER AUTH TABS COMPONENT
 * Extracted tab logic from MasterAuthForm for better maintainability
 * Part of Stability Framework Phase 2 refactoring
 */
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Lock, User } from 'lucide-react';

interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
}

interface MasterAuthTabsProps {
  activeTab: 'login' | 'signup';
  setActiveTab: (tab: 'login' | 'signup') => void;
  loginData: AuthFormData;
  signupData: AuthFormData;
  isLoading: boolean;
  onLogin: (e: React.FormEvent) => void;
  onSignup: (e: React.FormEvent) => void;
  onInputChange: (formType: 'login' | 'signup', field: string, value: string) => void;
}

export const MasterAuthTabs: React.FC<MasterAuthTabsProps> = ({
  activeTab,
  setActiveTab,
  loginData,
  signupData,
  isLoading,
  onLogin,
  onSignup,
  onInputChange
}) => {
  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'signup')}>
      <TabsList className="grid w-full grid-cols-2 mb-8 h-12 p-1 bg-muted/20">
        <TabsTrigger 
          value="login" 
          className="h-10 text-sm font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground transition-all duration-200"
        >
          Sign In
        </TabsTrigger>
        <TabsTrigger 
          value="signup" 
          className="h-10 text-sm font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground transition-all duration-200"
        >
          Create Account
        </TabsTrigger>
      </TabsList>

      <TabsContent value="login" className="space-y-6 mt-6">
        <form onSubmit={onLogin} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="login-email" className="text-sm font-semibold text-foreground">
              Email Address
            </Label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 group-focus-within:text-primary transition-colors" />
              <Input
                id="login-email"
                type="email"
                placeholder="Enter your email address"
                value={loginData.email}
                onChange={(e) => onInputChange('login', 'email', e.target.value)}
                className="pl-12 h-12 border-2 border-border focus:border-primary transition-colors bg-background/50"
                required
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="login-password" className="text-sm font-semibold text-foreground">
              Password
            </Label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 group-focus-within:text-primary transition-colors" />
              <Input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={loginData.password}
                onChange={(e) => onInputChange('login', 'password', e.target.value)}
                className="pl-12 h-12 border-2 border-border focus:border-primary transition-colors bg-background/50"
                required
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                Signing you in...
              </>
            ) : (
              <>
                <Lock className="mr-3 h-5 w-5" />
                Sign In
              </>
            )}
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="signup" className="space-y-6 mt-6">
        <form onSubmit={onSignup} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="signup-firstName" className="text-sm font-semibold text-foreground">
                First Name
              </Label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 group-focus-within:text-primary transition-colors" />
                <Input
                  id="signup-firstName"
                  type="text"
                  placeholder="First name"
                  value={signupData.firstName || ''}
                  onChange={(e) => onInputChange('signup', 'firstName', e.target.value)}
                  className="pl-12 h-12 border-2 border-border focus:border-primary transition-colors bg-background/50"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="signup-lastName" className="text-sm font-semibold text-foreground">
                Last Name
              </Label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 group-focus-within:text-primary transition-colors" />
                <Input
                  id="signup-lastName"
                  type="text"
                  placeholder="Last name"
                  value={signupData.lastName || ''}
                  onChange={(e) => onInputChange('signup', 'lastName', e.target.value)}
                  className="pl-12 h-12 border-2 border-border focus:border-primary transition-colors bg-background/50"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="signup-email" className="text-sm font-semibold text-foreground">
              Email Address
            </Label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 group-focus-within:text-primary transition-colors" />
              <Input
                id="signup-email"
                type="email"
                placeholder="Enter your email address"
                value={signupData.email}
                onChange={(e) => onInputChange('signup', 'email', e.target.value)}
                className="pl-12 h-12 border-2 border-border focus:border-primary transition-colors bg-background/50"
                required
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="signup-password" className="text-sm font-semibold text-foreground">
              Password
            </Label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 group-focus-within:text-primary transition-colors" />
              <Input
                id="signup-password"
                type="password"
                placeholder="Minimum 6 characters"
                value={signupData.password}
                onChange={(e) => onInputChange('signup', 'password', e.target.value)}
                className="pl-12 h-12 border-2 border-border focus:border-primary transition-colors bg-background/50"
                required
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="signup-confirmPassword" className="text-sm font-semibold text-foreground">
              Confirm Password
            </Label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 group-focus-within:text-primary transition-colors" />
              <Input
                id="signup-confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={signupData.confirmPassword || ''}
                onChange={(e) => onInputChange('signup', 'confirmPassword', e.target.value)}
                className="pl-12 h-12 border-2 border-border focus:border-primary transition-colors bg-background/50"
                required
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                Creating your account...
              </>
            ) : (
              <>
                <User className="mr-3 h-5 w-5" />
                Create Account
              </>
            )}
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  );
};

export default MasterAuthTabs;
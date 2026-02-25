/**
 * SocialConnectSection — Social links, community CTA, newsletter subscribe
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';

const SOCIAL_LINKS = [
  { label: 'LinkedIn', icon: '💼', url: '#', color: 'hover:bg-blue-500/10 hover:border-blue-500/30' },
  { label: 'Twitter / X', icon: '𝕏', url: '#', color: 'hover:bg-sky-500/10 hover:border-sky-500/30' },
  { label: 'YouTube', icon: '▶️', url: '#', color: 'hover:bg-red-500/10 hover:border-red-500/30' },
  { label: 'Discord', icon: '💬', url: '#', color: 'hover:bg-indigo-500/10 hover:border-indigo-500/30' },
  { label: 'Instagram', icon: '📸', url: '#', color: 'hover:bg-pink-500/10 hover:border-pink-500/30' },
];

export const SocialConnectSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const { showSuccess, showError } = useMasterToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showError('Invalid email', 'Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    try {
      // Store in access_requests as a newsletter lead (reuse existing table)
      const { error } = await supabase.from('access_requests').insert({
        user_email: email,
        request_reason: 'newsletter_subscription',
        ip_address: 'landing_page',
        status: 'newsletter',
      });

      if (error) throw error;
      setSubscribed(true);
      setEmail('');
      showSuccess('Subscribed!', 'You\'ll receive regional content updates.');
    } catch (err: any) {
      showError('Failed to subscribe', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="community" className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <div className="relative max-w-4xl mx-auto px-4 text-center">
        <Badge variant="secondary" className="mb-4 text-sm px-4 py-1">
          <Sparkles className="w-3 h-3 mr-1" />
          Community & Updates
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          Join the Genie Community
        </h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          Connect with creators, get updates on new AI providers, formats, and regional expansions.
        </p>

        {/* Social links */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {SOCIAL_LINKS.map((social) => (
            <motion.a
              key={social.label}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-card border border-border font-bold text-foreground transition-all ${social.color}`}
            >
              <span className="text-lg">{social.icon}</span>
              <span className="text-sm">{social.label}</span>
            </motion.a>
          ))}
        </div>

        {/* Newsletter subscribe */}
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-bold text-foreground mb-3">
            Get Early Access & Updates
          </h3>
          {subscribed ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-primary/10 border border-primary/30 rounded-xl text-primary font-bold"
            >
              ✅ You're subscribed! Check your inbox for updates.
            </motion.div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 rounded-xl">
                {isSubmitting ? '...' : 'Subscribe'}
                <ArrowRight className="ml-1 w-4 h-4" />
              </Button>
            </form>
          )}
          <p className="text-xs text-muted-foreground/60 mt-2">
            No spam. Unsubscribe anytime. Regional content updates only.
          </p>
        </div>
      </div>
    </section>
  );
};

export default SocialConnectSection;

/**
 * GENIE VIDEO SHOWCASE SECTION - Landing Page Section Wrapper
 * 
 * Full-width section with title, description, and professional video showcase
 * Uses AI-generated videos with avatars, 3D transitions, and Genie character
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles, Film, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LiveVideoShowcase } from './video/LiveVideoShowcase';

interface GenieVideoShowcaseSectionProps {
  className?: string;
}

export const GenieVideoShowcaseSection: React.FC<GenieVideoShowcaseSectionProps> = ({
  className = ''
}) => {
  return (
    <section className={`py-20 px-4 md:px-8 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Film className="w-4 h-4 text-primary" />
            <span className="text-primary text-sm font-medium">
              Experience the Magic
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            See Genie Studio in Action
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Watch how 7 powerful products, 206 AI pipelines, and 12 world-class providers 
            come together to transform your ideas into professional content — in 70+ languages.
          </p>
          
          {/* AI Feature badges */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <motion.div 
              className="flex items-center gap-2 px-3 py-1.5 bg-card/50 backdrop-blur-sm rounded-full border border-border"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Wand2 className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs text-muted-foreground">Avatar Presenters</span>
            </motion.div>
            <motion.div 
              className="flex items-center gap-2 px-3 py-1.5 bg-card/50 backdrop-blur-sm rounded-full border border-border"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs text-muted-foreground">3D Transitions</span>
            </motion.div>
            <motion.div 
              className="flex items-center gap-2 px-3 py-1.5 bg-card/50 backdrop-blur-sm rounded-full border border-border"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Film className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs text-muted-foreground">Genie Character</span>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Video Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          {/* Glow effect */}
          <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-3xl" />
          
          {/* Video component */}
          <div className="relative">
            <LiveVideoShowcase 
              autoPlay={false}
              showControls={true}
              className="shadow-2xl"
            />
          </div>
        </motion.div>
        
        {/* CTA below video */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white px-8 py-6 text-lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Try Genie Studio Free
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 px-8 py-6 text-lg"
            >
              View All Features
            </Button>
          </div>
          
          <p className="text-gray-500 text-sm mt-4">
            No credit card required • Start creating in seconds
          </p>
        </motion.div>
        
        {/* Product logos footer */}
        <motion.div
          className="mt-16 pt-8 border-t border-gray-800"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <p className="text-center text-gray-500 text-sm mb-6">
            Powered by 7 integrated products
          </p>
          
          <div className="flex flex-wrap justify-center items-center gap-8">
            {[
              { name: 'Genie Spark', tagline: 'Ignite Your Ideas' },
              { name: 'Genie Mind', tagline: 'AI That Understands' },
              { name: 'Genie Vibe', tagline: 'Script to Screen' },
              { name: 'Genie Deck', tagline: 'Ideas to Impact' },
              { name: 'Genie Arc', tagline: 'Infinite Possibilities' },
              { name: 'Ask Genie', tagline: 'Your Wish is My Command' },
              { name: 'Genie Cast', tagline: 'Make It. Show It. Scale It.' },
            ].map((product, idx) => (
              <motion.div
                key={product.name}
                className="text-center group cursor-pointer"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * idx }}
                whileHover={{ scale: 1.05 }}
              >
                <p className="text-white/80 font-medium group-hover:text-purple-300 transition-colors">
                  {product.name}
                </p>
                <p className="text-gray-500 text-xs group-hover:text-purple-400/60 transition-colors">
                  {product.tagline}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default GenieVideoShowcaseSection;

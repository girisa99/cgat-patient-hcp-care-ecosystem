/**
 * TYPING INDICATOR COMPONENT
 * Shows when Genie is thinking/responding
 */
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

export const TypingIndicator: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-3 mb-6"
    >
      {/* Genie Avatar */}
      <div className="flex-shrink-0 mr-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 via-cyan-400 to-blue-500 p-0.5">
          <img 
            src="/lovable-uploads/f995d61d-e4c0-44c3-bdcb-8ff8e2c93448.png" 
            alt="Genie" 
            className="w-full h-full rounded-full object-cover"
          />
        </div>
      </div>

      {/* Typing Bubble */}
      <div className="flex-1 max-w-[80%]">
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-teal-500 rounded-full"
                    animate={{
                      y: [0, -8, 0],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 ml-2">Genie is thinking...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};
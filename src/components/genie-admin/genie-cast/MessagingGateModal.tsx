/**
 * MessagingGateModal - Blocks Templates/Assets access without approved messaging
 * 
 * Prevents users from accessing scene creation (templates/assets) 
 * without first generating and approving marketing messaging.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface MessagingGateModalProps {
  isOpen: boolean;
  gateType: 'templates' | 'assets';
  onClose: () => void;
  onNavigateToMessaging: () => void;
}

export const MessagingGateModal: React.FC<MessagingGateModalProps> = ({
  isOpen,
  gateType,
  onClose,
  onNavigateToMessaging,
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Generate Messaging First</h2>
            <p className="text-sm text-gray-600 mt-1">
              Before creating scenes, you need to generate and approve your marketing messaging. This ensures all scenes use consistent hooks, CTAs, and positioning.
            </p>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
          <p className="text-sm text-blue-900">
            <strong>Next step:</strong> Go to the Messaging tab, generate AI-powered marketing copy, and approve it. Then return here to {gateType === 'templates' ? 'select your template' : 'configure assets'}.
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={onNavigateToMessaging}
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition"
          >
            Go to Messaging
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MessagingGateModal;

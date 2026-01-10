import React from 'react';
import { motion } from 'framer-motion';

interface JourneyStageIllustrationProps {
  stageType: string;
  segmentType: string;
  isActive?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// SVG-based illustrated scenes for each journey stage
export const JourneyStageIllustration: React.FC<JourneyStageIllustrationProps> = ({
  stageType,
  segmentType,
  isActive = false,
  size = 'md',
}) => {
  const sizes = {
    sm: { width: 60, height: 60 },
    md: { width: 100, height: 100 },
    lg: { width: 140, height: 140 },
  };

  const { width, height } = sizes[size];

  // Get illustration based on stage type
  const renderIllustration = () => {
    switch (stageType.toLowerCase()) {
      case 'inspiration':
      case 'trip inspiration':
      case 'business need':
      case 'lesson planning':
      case 'patient need':
      case 'strategy':
        return <InspirationScene segmentType={segmentType} isActive={isActive} />;
      
      case 'decide':
      case 'booking':
      case 'template select':
      case 'script ai':
      case 'project setup':
        return <DecideScene segmentType={segmentType} isActive={isActive} />;
      
      case 'script':
      case 'curriculum':
      case 'script prep':
        return <ScriptScene segmentType={segmentType} isActive={isActive} />;
      
      case 'record':
      case 'on location':
      case 'record demo':
      case 'record lecture':
      case 'secure record':
        return <RecordScene segmentType={segmentType} isActive={isActive} />;
      
      case 'voice':
      case 'voice narration':
      case 'brand voice':
      case 'ai voice':
      case 'clear voice':
        return <VoiceScene segmentType={segmentType} isActive={isActive} />;
      
      case 'language':
      case 'offline mode':
      case 'global reach':
      case 'global offices':
        return <LanguageScene segmentType={segmentType} isActive={isActive} />;
      
      case 'generate':
      case 'auto-edit kit':
      case 'ai quiz gen':
      case 'phi redaction':
        return <GenerateScene segmentType={segmentType} isActive={isActive} />;
      
      case 'edit':
      case 'team collab':
      case 'interactive':
      case 'collab edit':
        return <EditScene segmentType={segmentType} isActive={isActive} />;
      
      case 're-record':
      case 'b-roll library':
      case 'student view':
      case 'accessibility':
      case 'legal review':
        return <ReRecordScene segmentType={segmentType} isActive={isActive} />;
      
      case 'script attach':
      case 'travel diary':
      case 'brand kit':
      case 'lms export':
      case 'medical review':
      case 'brand check':
        return <ScriptAttachScene segmentType={segmentType} isActive={isActive} />;
      
      case 'preview':
      case 'review':
      case 'batch process':
      case 'analytics':
      case 'compliance':
      case 'audit trail':
      case 'sso access':
      case 'multi-tenant':
        return <PreviewScene segmentType={segmentType} isActive={isActive} />;
      
      case 'publish':
      case 'secure delivery':
      case 'white-label':
        return <PublishScene segmentType={segmentType} isActive={isActive} />;
      
      default:
        return <DefaultScene segmentType={segmentType} isActive={isActive} />;
    }
  };

  return (
    <motion.div
      className="relative overflow-hidden rounded-xl"
      style={{ width, height }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1 }}
      transition={{ duration: 0.3 }}
    >
      <svg
        viewBox="0 0 100 100"
        width={width}
        height={height}
        className="drop-shadow-lg"
      >
        {renderIllustration()}
      </svg>
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-xl"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
};

// Individual Scene Components with rich SVG illustrations
const InspirationScene: React.FC<{ segmentType: string; isActive: boolean }> = ({ segmentType, isActive }) => {
  const colors = getSegmentColors(segmentType);
  
  return (
    <g>
      {/* Sky gradient background */}
      <defs>
        <linearGradient id={`inspiration-bg-${segmentType}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={colors.primary} stopOpacity="0.3" />
          <stop offset="100%" stopColor={colors.secondary} stopOpacity="0.1" />
        </linearGradient>
        <radialGradient id={`bulb-glow-${segmentType}`}>
          <stop offset="0%" stopColor="#FFD700" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FFA500" stopOpacity="0" />
        </radialGradient>
      </defs>
      
      {/* Background */}
      <rect width="100" height="100" fill={`url(#inspiration-bg-${segmentType})`} rx="12" />
      
      {/* Stars/sparkles */}
      <motion.g
        animate={isActive ? { opacity: [0.5, 1, 0.5] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <circle cx="20" cy="20" r="2" fill="#FFD700" />
        <circle cx="80" cy="15" r="1.5" fill="#FFD700" />
        <circle cx="15" cy="60" r="1" fill="#FFD700" />
        <circle cx="85" cy="50" r="2" fill="#FFD700" />
        <circle cx="40" cy="10" r="1.5" fill="#FFD700" />
      </motion.g>
      
      {/* Light bulb glow */}
      <ellipse cx="50" cy="45" rx="25" ry="25" fill={`url(#bulb-glow-${segmentType})`} />
      
      {/* Light bulb */}
      <path
        d="M50 25 C35 25 30 35 30 45 C30 52 35 58 40 62 L40 70 L60 70 L60 62 C65 58 70 52 70 45 C70 35 65 25 50 25"
        fill="#FFE066"
        stroke="#FFB800"
        strokeWidth="2"
      />
      <rect x="42" y="70" width="16" height="8" rx="2" fill="#888" stroke="#666" strokeWidth="1" />
      
      {/* Filament */}
      <path d="M45 45 Q50 35 55 45 Q50 55 45 45" fill="none" stroke="#FF8C00" strokeWidth="2" />
      
      {/* Person thinking */}
      <circle cx="50" cy="85" r="8" fill={colors.primary} />
      <ellipse cx="50" cy="92" rx="6" ry="4" fill={colors.primary} />
      
      {/* Thought bubbles */}
      <circle cx="30" cy="75" r="3" fill="white" opacity="0.8" />
      <circle cx="25" cy="68" r="2" fill="white" opacity="0.6" />
    </g>
  );
};

const DecideScene: React.FC<{ segmentType: string; isActive: boolean }> = ({ segmentType, isActive }) => {
  const colors = getSegmentColors(segmentType);
  
  return (
    <g>
      <defs>
        <linearGradient id={`decide-bg-${segmentType}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.primary} stopOpacity="0.2" />
          <stop offset="100%" stopColor={colors.secondary} stopOpacity="0.1" />
        </linearGradient>
      </defs>
      
      <rect width="100" height="100" fill={`url(#decide-bg-${segmentType})`} rx="12" />
      
      {/* Crossroads */}
      <path d="M50 100 L50 50 M25 50 L75 50" stroke={colors.primary} strokeWidth="8" strokeLinecap="round" />
      
      {/* Direction signs */}
      <g transform="translate(15, 35)">
        <rect width="25" height="12" rx="2" fill={colors.primary} />
        <polygon points="25,6 32,0 32,12" fill={colors.primary} />
        <text x="12" y="9" fill="white" fontSize="6" textAnchor="middle" fontWeight="bold">A</text>
      </g>
      
      <g transform="translate(60, 35)">
        <rect width="25" height="12" rx="2" fill={colors.secondary} />
        <polygon points="0,6 -7,0 -7,12" fill={colors.secondary} />
        <text x="12" y="9" fill="white" fontSize="6" textAnchor="middle" fontWeight="bold">B</text>
      </g>
      
      {/* Person at crossroads */}
      <circle cx="50" cy="70" r="10" fill={colors.primary} />
      <ellipse cx="50" cy="85" rx="8" ry="10" fill={colors.primary} />
      
      {/* Question mark */}
      <motion.text
        x="50"
        y="25"
        fill={colors.primary}
        fontSize="20"
        textAnchor="middle"
        fontWeight="bold"
        animate={isActive ? { y: [25, 20, 25] } : {}}
        transition={{ duration: 1, repeat: Infinity }}
      >
        ?
      </motion.text>
    </g>
  );
};

const ScriptScene: React.FC<{ segmentType: string; isActive: boolean }> = ({ segmentType, isActive }) => {
  const colors = getSegmentColors(segmentType);
  
  return (
    <g>
      <defs>
        <linearGradient id={`script-bg-${segmentType}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f0f0f0" />
          <stop offset="100%" stopColor="#e0e0e0" />
        </linearGradient>
      </defs>
      
      <rect width="100" height="100" fill={`url(#script-bg-${segmentType})`} rx="12" />
      
      {/* Paper/scroll */}
      <rect x="20" y="15" width="60" height="70" rx="3" fill="white" stroke="#ccc" strokeWidth="1" />
      
      {/* Lines of text */}
      <motion.g
        animate={isActive ? { opacity: [0.3, 1, 0.3] } : {}}
        transition={{ duration: 2, repeat: Infinity, staggerChildren: 0.2 }}
      >
        <rect x="28" y="25" width="44" height="4" rx="1" fill={colors.primary} opacity="0.7" />
        <rect x="28" y="33" width="38" height="4" rx="1" fill={colors.secondary} opacity="0.5" />
        <rect x="28" y="41" width="42" height="4" rx="1" fill={colors.primary} opacity="0.7" />
        <rect x="28" y="49" width="30" height="4" rx="1" fill={colors.secondary} opacity="0.5" />
        <rect x="28" y="57" width="44" height="4" rx="1" fill={colors.primary} opacity="0.7" />
        <rect x="28" y="65" width="35" height="4" rx="1" fill={colors.secondary} opacity="0.5" />
      </motion.g>
      
      {/* Pen/pencil */}
      <g transform="translate(65, 70) rotate(-45)">
        <rect width="25" height="6" rx="1" fill="#444" />
        <polygon points="25,3 32,3 28,0 28,6" fill="#FFB800" />
        <rect x="-3" y="0" width="3" height="6" fill="#FF69B4" />
      </g>
      
      {/* AI sparkle */}
      <motion.g
        transform="translate(75, 20)"
        animate={isActive ? { scale: [1, 1.3, 1], rotate: [0, 180, 360] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <polygon points="0,-8 2,-2 8,0 2,2 0,8 -2,2 -8,0 -2,-2" fill="#FFD700" />
      </motion.g>
    </g>
  );
};

const RecordScene: React.FC<{ segmentType: string; isActive: boolean }> = ({ segmentType, isActive }) => {
  const colors = getSegmentColors(segmentType);
  
  return (
    <g>
      <defs>
        <radialGradient id={`record-spotlight-${segmentType}`}>
          <stop offset="0%" stopColor="#FFD700" stopOpacity="0.4" />
          <stop offset="100%" stopColor={colors.primary} stopOpacity="0.1" />
        </radialGradient>
      </defs>
      
      <rect width="100" height="100" fill="#1a1a2e" rx="12" />
      
      {/* Spotlight */}
      <ellipse cx="50" cy="60" rx="35" ry="25" fill={`url(#record-spotlight-${segmentType})`} />
      
      {/* Camera */}
      <g transform="translate(15, 20)">
        <rect width="30" height="22" rx="3" fill="#333" stroke="#555" strokeWidth="2" />
        <circle cx="15" cy="11" r="7" fill="#1a1a2e" stroke={colors.primary} strokeWidth="2" />
        <circle cx="15" cy="11" r="4" fill={colors.primary} opacity="0.5" />
        {/* Recording indicator */}
        <motion.circle
          cx="28"
          cy="5"
          r="3"
          fill="#ff0000"
          animate={isActive ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      </g>
      
      {/* Tripod */}
      <line x1="30" y1="42" x2="20" y2="70" stroke="#555" strokeWidth="2" />
      <line x1="30" y1="42" x2="40" y2="70" stroke="#555" strokeWidth="2" />
      <line x1="30" y1="42" x2="30" y2="65" stroke="#555" strokeWidth="2" />
      
      {/* Person being recorded */}
      <circle cx="65" cy="55" r="12" fill={colors.primary} />
      <ellipse cx="65" cy="80" rx="10" ry="15" fill={colors.primary} />
      
      {/* Sound waves */}
      <motion.g
        animate={isActive ? { opacity: [0.3, 1, 0.3] } : {}}
        transition={{ duration: 1, repeat: Infinity }}
      >
        <path d="M82 45 Q88 55 82 65" fill="none" stroke={colors.secondary} strokeWidth="2" opacity="0.6" />
        <path d="M86 42 Q95 55 86 68" fill="none" stroke={colors.secondary} strokeWidth="2" opacity="0.4" />
      </motion.g>
    </g>
  );
};

const VoiceScene: React.FC<{ segmentType: string; isActive: boolean }> = ({ segmentType, isActive }) => {
  const colors = getSegmentColors(segmentType);
  
  return (
    <g>
      <defs>
        <linearGradient id={`voice-bg-${segmentType}`} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor={colors.primary} stopOpacity="0.3" />
          <stop offset="100%" stopColor={colors.secondary} stopOpacity="0.1" />
        </linearGradient>
      </defs>
      
      <rect width="100" height="100" fill={`url(#voice-bg-${segmentType})`} rx="12" />
      
      {/* Microphone */}
      <g transform="translate(50, 30)">
        <rect x="-8" y="0" width="16" height="30" rx="8" fill="#333" stroke="#555" strokeWidth="2" />
        <rect x="-6" y="5" width="12" height="20" rx="6" fill={colors.primary} opacity="0.6" />
        <line x1="0" y1="30" x2="0" y2="50" stroke="#555" strokeWidth="4" />
        <ellipse cx="0" cy="52" rx="15" ry="5" fill="#333" />
      </g>
      
      {/* Sound waves */}
      <motion.g
        animate={isActive ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.5, repeat: Infinity }}
      >
        <path d="M25 45 Q15 55 25 65" fill="none" stroke={colors.primary} strokeWidth="3" opacity="0.8" />
        <path d="M20 40 Q5 55 20 70" fill="none" stroke={colors.primary} strokeWidth="2" opacity="0.5" />
        <path d="M75 45 Q85 55 75 65" fill="none" stroke={colors.secondary} strokeWidth="3" opacity="0.8" />
        <path d="M80 40 Q95 55 80 70" fill="none" stroke={colors.secondary} strokeWidth="2" opacity="0.5" />
      </motion.g>
      
      {/* Waveform at bottom */}
      <motion.g
        transform="translate(10, 85)"
        animate={isActive ? { y: [0, -3, 0] } : {}}
        transition={{ duration: 0.3, repeat: Infinity }}
      >
        {[...Array(16)].map((_, i) => (
          <rect
            key={i}
            x={i * 5}
            y={-Math.sin(i * 0.8) * 8 - 5}
            width="3"
            height={Math.abs(Math.sin(i * 0.8) * 8) + 5}
            rx="1"
            fill={i % 2 === 0 ? colors.primary : colors.secondary}
            opacity="0.7"
          />
        ))}
      </motion.g>
    </g>
  );
};

const LanguageScene: React.FC<{ segmentType: string; isActive: boolean }> = ({ segmentType, isActive }) => {
  const colors = getSegmentColors(segmentType);
  
  return (
    <g>
      <rect width="100" height="100" fill="#e8f4f8" rx="12" />
      
      {/* Globe */}
      <circle cx="50" cy="50" r="35" fill="#4a90d9" stroke={colors.primary} strokeWidth="3" />
      
      {/* Continents (simplified) */}
      <ellipse cx="35" cy="40" rx="12" ry="15" fill="#2d8659" transform="rotate(-20, 35, 40)" />
      <ellipse cx="60" cy="35" rx="15" ry="12" fill="#2d8659" transform="rotate(10, 60, 35)" />
      <ellipse cx="55" cy="60" rx="10" ry="8" fill="#2d8659" />
      
      {/* Grid lines */}
      <ellipse cx="50" cy="50" rx="35" ry="15" fill="none" stroke="white" strokeWidth="0.5" opacity="0.5" />
      <ellipse cx="50" cy="50" rx="35" ry="25" fill="none" stroke="white" strokeWidth="0.5" opacity="0.5" />
      <line x1="50" y1="15" x2="50" y2="85" stroke="white" strokeWidth="0.5" opacity="0.5" />
      
      {/* Language bubbles */}
      <motion.g
        animate={isActive ? { y: [0, -5, 0] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <g transform="translate(10, 25)">
          <rect width="18" height="12" rx="3" fill="white" stroke={colors.primary} strokeWidth="1" />
          <text x="9" y="9" fill={colors.primary} fontSize="6" textAnchor="middle" fontWeight="bold">EN</text>
        </g>
        <g transform="translate(72, 20)">
          <rect width="18" height="12" rx="3" fill="white" stroke={colors.secondary} strokeWidth="1" />
          <text x="9" y="9" fill={colors.secondary} fontSize="6" textAnchor="middle" fontWeight="bold">ES</text>
        </g>
        <g transform="translate(5, 65)">
          <rect width="18" height="12" rx="3" fill="white" stroke={colors.primary} strokeWidth="1" />
          <text x="9" y="9" fill={colors.primary} fontSize="6" textAnchor="middle" fontWeight="bold">FR</text>
        </g>
        <g transform="translate(77, 60)">
          <rect width="18" height="12" rx="3" fill="white" stroke={colors.secondary} strokeWidth="1" />
          <text x="9" y="9" fill={colors.secondary} fontSize="6" textAnchor="middle" fontWeight="bold">日</text>
        </g>
      </motion.g>
      
      {/* Connecting lines */}
      <motion.g
        animate={isActive ? { opacity: [0.3, 0.8, 0.3] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <line x1="28" y1="31" x2="35" y2="40" stroke={colors.primary} strokeWidth="1" strokeDasharray="2,2" />
        <line x1="72" y1="26" x2="60" y2="35" stroke={colors.secondary} strokeWidth="1" strokeDasharray="2,2" />
        <line x1="23" y1="71" x2="35" y2="55" stroke={colors.primary} strokeWidth="1" strokeDasharray="2,2" />
        <line x1="77" y1="66" x2="65" y2="55" stroke={colors.secondary} strokeWidth="1" strokeDasharray="2,2" />
      </motion.g>
    </g>
  );
};

const GenerateScene: React.FC<{ segmentType: string; isActive: boolean }> = ({ segmentType, isActive }) => {
  const colors = getSegmentColors(segmentType);
  
  return (
    <g>
      <defs>
        <linearGradient id={`generate-bg-${segmentType}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a1a2e" />
          <stop offset="100%" stopColor="#16213e" />
        </linearGradient>
      </defs>
      
      <rect width="100" height="100" fill={`url(#generate-bg-${segmentType})`} rx="12" />
      
      {/* AI Brain/Chip */}
      <rect x="30" y="30" width="40" height="40" rx="5" fill="#2a2a4e" stroke={colors.primary} strokeWidth="2" />
      
      {/* Circuit lines */}
      <g stroke={colors.primary} strokeWidth="1.5" opacity="0.7">
        <line x1="30" y1="40" x2="15" y2="40" />
        <line x1="30" y1="50" x2="10" y2="50" />
        <line x1="30" y1="60" x2="15" y2="60" />
        <line x1="70" y1="40" x2="85" y2="40" />
        <line x1="70" y1="50" x2="90" y2="50" />
        <line x1="70" y1="60" x2="85" y2="60" />
        <line x1="40" y1="30" x2="40" y2="15" />
        <line x1="50" y1="30" x2="50" y2="10" />
        <line x1="60" y1="30" x2="60" y2="15" />
        <line x1="40" y1="70" x2="40" y2="85" />
        <line x1="50" y1="70" x2="50" y2="90" />
        <line x1="60" y1="70" x2="60" y2="85" />
      </g>
      
      {/* Nodes */}
      {[15, 10, 15, 85, 90, 85, 40, 50, 60, 40, 50, 60].map((_, i) => (
        <motion.circle
          key={i}
          cx={[15, 10, 15, 85, 90, 85, 40, 50, 60, 40, 50, 60][i]}
          cy={[40, 50, 60, 40, 50, 60, 15, 10, 15, 85, 90, 85][i]}
          r="3"
          fill={colors.secondary}
          animate={isActive ? { opacity: [0.5, 1, 0.5] } : {}}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
        />
      ))}
      
      {/* AI symbol in center */}
      <motion.g
        animate={isActive ? { rotate: 360 } : {}}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: '50px 50px' }}
      >
        <polygon points="50,35 55,45 50,42 45,45" fill={colors.primary} />
        <polygon points="50,65 55,55 50,58 45,55" fill={colors.secondary} />
        <polygon points="35,50 45,55 42,50 45,45" fill={colors.primary} />
        <polygon points="65,50 55,55 58,50 55,45" fill={colors.secondary} />
      </motion.g>
      
      {/* Sparkles */}
      <motion.g
        animate={isActive ? { opacity: [0, 1, 0] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <polygon points="20,20 22,25 20,23 18,25" fill="#FFD700" />
        <polygon points="80,25 82,30 80,28 78,30" fill="#FFD700" />
        <polygon points="25,80 27,85 25,83 23,85" fill="#FFD700" />
        <polygon points="75,75 77,80 75,78 73,80" fill="#FFD700" />
      </motion.g>
    </g>
  );
};

const EditScene: React.FC<{ segmentType: string; isActive: boolean }> = ({ segmentType, isActive }) => {
  const colors = getSegmentColors(segmentType);
  
  return (
    <g>
      <rect width="100" height="100" fill="#1a1a2e" rx="12" />
      
      {/* Timeline */}
      <rect x="10" y="70" width="80" height="20" rx="3" fill="#2a2a4e" stroke="#444" strokeWidth="1" />
      
      {/* Timeline clips */}
      <motion.g
        animate={isActive ? { x: [-5, 0, -5] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <rect x="15" y="73" width="15" height="14" rx="2" fill={colors.primary} opacity="0.8" />
        <rect x="32" y="73" width="20" height="14" rx="2" fill={colors.secondary} opacity="0.8" />
        <rect x="54" y="73" width="12" height="14" rx="2" fill={colors.primary} opacity="0.8" />
        <rect x="68" y="73" width="18" height="14" rx="2" fill={colors.secondary} opacity="0.8" />
      </motion.g>
      
      {/* Playhead */}
      <motion.g
        animate={isActive ? { x: [0, 60, 0] } : {}}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <line x1="25" y1="68" x2="25" y2="92" stroke="#ff0000" strokeWidth="2" />
        <polygon points="25,68 22,62 28,62" fill="#ff0000" />
      </motion.g>
      
      {/* Preview screen */}
      <rect x="20" y="15" width="60" height="45" rx="3" fill="#333" stroke="#555" strokeWidth="2" />
      <rect x="25" y="20" width="50" height="35" fill="#1a1a2e" />
      
      {/* Preview content */}
      <rect x="30" y="25" width="20" height="15" rx="2" fill={colors.primary} opacity="0.6" />
      <rect x="52" y="28" width="18" height="8" rx="1" fill={colors.secondary} opacity="0.4" />
      <rect x="30" y="42" width="40" height="3" rx="1" fill="white" opacity="0.3" />
      <rect x="30" y="47" width="30" height="3" rx="1" fill="white" opacity="0.2" />
      
      {/* Scissors */}
      <g transform="translate(75, 55) rotate(-20)">
        <ellipse cx="0" cy="0" rx="6" ry="3" fill="#888" />
        <ellipse cx="12" cy="0" rx="6" ry="3" fill="#888" />
        <rect x="4" y="-2" width="4" height="4" rx="1" fill="#666" />
        <line x1="0" y1="3" x2="-5" y2="12" stroke="#888" strokeWidth="2" />
        <line x1="12" y1="3" x2="17" y2="12" stroke="#888" strokeWidth="2" />
      </g>
    </g>
  );
};

const ReRecordScene: React.FC<{ segmentType: string; isActive: boolean }> = ({ segmentType, isActive }) => {
  const colors = getSegmentColors(segmentType);
  
  return (
    <g>
      <defs>
        <linearGradient id={`rerecord-bg-${segmentType}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.primary} stopOpacity="0.15" />
          <stop offset="100%" stopColor={colors.secondary} stopOpacity="0.1" />
        </linearGradient>
      </defs>
      
      <rect width="100" height="100" fill={`url(#rerecord-bg-${segmentType})`} rx="12" />
      
      {/* Circular arrow (refresh) */}
      <motion.g
        animate={isActive ? { rotate: 360 } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: '50px 50px' }}
      >
        <path
          d="M50 20 A30 30 0 1 1 20 50"
          fill="none"
          stroke={colors.primary}
          strokeWidth="6"
          strokeLinecap="round"
        />
        <polygon points="20,50 10,45 10,55" fill={colors.primary} />
      </motion.g>
      
      {/* Microphone in center */}
      <g transform="translate(50, 50)">
        <rect x="-6" y="-12" width="12" height="18" rx="6" fill="#333" stroke={colors.secondary} strokeWidth="2" />
        <line x1="0" y1="6" x2="0" y2="15" stroke="#555" strokeWidth="3" />
        <ellipse cx="0" cy="16" rx="8" ry="3" fill="#333" />
      </g>
      
      {/* Sound waves */}
      <motion.g
        animate={isActive ? { opacity: [0.3, 1, 0.3] } : {}}
        transition={{ duration: 0.8, repeat: Infinity }}
      >
        <path d="M30 45 Q25 50 30 55" fill="none" stroke={colors.primary} strokeWidth="2" />
        <path d="M70 45 Q75 50 70 55" fill="none" stroke={colors.secondary} strokeWidth="2" />
      </motion.g>
      
      {/* "Take 2" badge */}
      <g transform="translate(65, 75)">
        <rect width="28" height="16" rx="3" fill={colors.primary} />
        <text x="14" y="12" fill="white" fontSize="8" textAnchor="middle" fontWeight="bold">Take 2</text>
      </g>
    </g>
  );
};

const ScriptAttachScene: React.FC<{ segmentType: string; isActive: boolean }> = ({ segmentType, isActive }) => {
  const colors = getSegmentColors(segmentType);
  
  return (
    <g>
      <rect width="100" height="100" fill="#f5f5f5" rx="12" />
      
      {/* Document */}
      <rect x="25" y="15" width="50" height="60" rx="3" fill="white" stroke="#ddd" strokeWidth="2" />
      
      {/* Text lines */}
      <rect x="32" y="25" width="36" height="3" rx="1" fill={colors.primary} opacity="0.6" />
      <rect x="32" y="32" width="30" height="3" rx="1" fill="#ccc" />
      <rect x="32" y="39" width="36" height="3" rx="1" fill={colors.secondary} opacity="0.5" />
      <rect x="32" y="46" width="25" height="3" rx="1" fill="#ccc" />
      <rect x="32" y="53" width="36" height="3" rx="1" fill={colors.primary} opacity="0.6" />
      <rect x="32" y="60" width="32" height="3" rx="1" fill="#ccc" />
      
      {/* Paperclip */}
      <motion.g
        animate={isActive ? { rotate: [-5, 5, -5] } : {}}
        transition={{ duration: 0.5, repeat: Infinity }}
        style={{ transformOrigin: '72px 30px' }}
      >
        <path
          d="M68 20 L68 45 Q68 50 73 50 Q78 50 78 45 L78 25 Q78 15 70 15 Q62 15 62 25 L62 48"
          fill="none"
          stroke="#888"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </motion.g>
      
      {/* Caption bubble */}
      <g transform="translate(15, 75)">
        <rect width="70" height="18" rx="9" fill={colors.primary} />
        <text x="35" y="13" fill="white" fontSize="8" textAnchor="middle" fontWeight="bold">📝 Captions Added</text>
      </g>
    </g>
  );
};

const PreviewScene: React.FC<{ segmentType: string; isActive: boolean }> = ({ segmentType, isActive }) => {
  const colors = getSegmentColors(segmentType);
  
  return (
    <g>
      <rect width="100" height="100" fill="#2a2a4e" rx="12" />
      
      {/* Multiple device screens */}
      {/* Phone */}
      <g transform="translate(15, 25)">
        <rect width="22" height="40" rx="3" fill="#1a1a2e" stroke={colors.primary} strokeWidth="2" />
        <rect x="3" y="5" width="16" height="25" fill={colors.primary} opacity="0.3" />
        <circle cx="11" cy="35" r="2" fill={colors.secondary} />
      </g>
      
      {/* Tablet */}
      <g transform="translate(40, 30)">
        <rect width="35" height="28" rx="3" fill="#1a1a2e" stroke={colors.secondary} strokeWidth="2" />
        <rect x="3" y="3" width="29" height="19" fill={colors.secondary} opacity="0.3" />
        <circle cx="17" cy="25" r="1.5" fill={colors.primary} />
      </g>
      
      {/* Desktop */}
      <g transform="translate(55, 60)">
        <rect width="35" height="25" rx="2" fill="#1a1a2e" stroke={colors.primary} strokeWidth="2" />
        <rect x="2" y="2" width="31" height="18" fill={colors.primary} opacity="0.3" />
        <rect x="12" y="25" width="11" height="3" fill="#555" />
        <rect x="8" y="28" width="19" height="2" rx="1" fill="#555" />
      </g>
      
      {/* Check marks */}
      <motion.g
        animate={isActive ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.5, repeat: Infinity, staggerChildren: 0.2 }}
      >
        <circle cx="35" cy="50" r="8" fill="#22c55e" />
        <path d="M31 50 L34 53 L40 46" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
        
        <circle cx="70" cy="45" r="6" fill="#22c55e" />
        <path d="M67 45 L69 47 L74 42" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        
        <circle cx="80" cy="75" r="6" fill="#22c55e" />
        <path d="M77 75 L79 77 L84 72" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </motion.g>
      
      {/* "Looking Good!" */}
      <text x="50" y="18" fill="white" fontSize="8" textAnchor="middle" fontWeight="bold" opacity="0.8">👀 Preview</text>
    </g>
  );
};

const PublishScene: React.FC<{ segmentType: string; isActive: boolean }> = ({ segmentType, isActive }) => {
  const colors = getSegmentColors(segmentType);
  
  return (
    <g>
      <defs>
        <radialGradient id={`publish-glow-${segmentType}`}>
          <stop offset="0%" stopColor="#FFD700" stopOpacity="0.6" />
          <stop offset="50%" stopColor={colors.primary} stopOpacity="0.3" />
          <stop offset="100%" stopColor={colors.secondary} stopOpacity="0.1" />
        </radialGradient>
      </defs>
      
      <rect width="100" height="100" fill="#1a1a2e" rx="12" />
      
      {/* Glow effect */}
      <ellipse cx="50" cy="50" rx="45" ry="45" fill={`url(#publish-glow-${segmentType})`} />
      
      {/* Rocket */}
      <motion.g
        animate={isActive ? { y: [-5, -15, -5] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {/* Rocket body */}
        <path
          d="M50 15 L40 45 L45 50 L50 70 L55 50 L60 45 Z"
          fill={colors.primary}
          stroke="white"
          strokeWidth="1"
        />
        {/* Rocket window */}
        <circle cx="50" cy="35" r="6" fill="#87CEEB" stroke="white" strokeWidth="1" />
        {/* Fins */}
        <path d="M40 45 L30 55 L40 50 Z" fill={colors.secondary} />
        <path d="M60 45 L70 55 L60 50 Z" fill={colors.secondary} />
        
        {/* Flames */}
        <motion.g
          animate={isActive ? { opacity: [0.5, 1, 0.5], scaleY: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.3, repeat: Infinity }}
          style={{ transformOrigin: '50px 70px' }}
        >
          <path d="M47 70 L50 90 L53 70 Z" fill="#FF4500" />
          <path d="M45 72 L50 85 L48 72 Z" fill="#FFD700" />
          <path d="M52 72 L50 85 L55 72 Z" fill="#FFD700" />
        </motion.g>
      </motion.g>
      
      {/* Platform icons floating around */}
      <motion.g
        animate={isActive ? { rotate: 360 } : {}}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: '50px 50px' }}
      >
        {/* Instagram */}
        <g transform="translate(12, 35)">
          <rect width="14" height="14" rx="4" fill="#E4405F" />
          <circle cx="7" cy="7" r="3" fill="none" stroke="white" strokeWidth="1.5" />
          <circle cx="11" cy="3" r="1" fill="white" />
        </g>
        
        {/* YouTube */}
        <g transform="translate(75, 30)">
          <rect width="16" height="12" rx="3" fill="#FF0000" />
          <polygon points="6,3 6,9 12,6" fill="white" />
        </g>
        
        {/* TikTok */}
        <g transform="translate(10, 65)">
          <rect width="12" height="14" rx="2" fill="#000" />
          <text x="6" y="11" fill="white" fontSize="8" textAnchor="middle" fontWeight="bold">♪</text>
        </g>
        
        {/* Facebook */}
        <g transform="translate(78, 60)">
          <circle cx="7" cy="7" r="7" fill="#1877F2" />
          <text x="7" y="11" fill="white" fontSize="10" textAnchor="middle" fontWeight="bold">f</text>
        </g>
      </motion.g>
      
      {/* Stars */}
      {[...Array(6)].map((_, i) => (
        <motion.polygon
          key={i}
          points="0,-3 1,-1 3,0 1,1 0,3 -1,1 -3,0 -1,-1"
          fill="#FFD700"
          transform={`translate(${15 + i * 15}, ${10 + (i % 2) * 5})`}
          animate={isActive ? { opacity: [0.3, 1, 0.3] } : {}}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </g>
  );
};

const DefaultScene: React.FC<{ segmentType: string; isActive: boolean }> = ({ segmentType, isActive }) => {
  const colors = getSegmentColors(segmentType);
  
  return (
    <g>
      <rect width="100" height="100" fill={colors.primary} opacity="0.2" rx="12" />
      <circle cx="50" cy="50" r="25" fill={colors.primary} opacity="0.5" />
      <motion.circle
        cx="50"
        cy="50"
        r="15"
        fill="white"
        animate={isActive ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 1, repeat: Infinity }}
      />
    </g>
  );
};

// Helper function to get segment-specific colors
function getSegmentColors(segmentType: string): { primary: string; secondary: string } {
  const colorMap: Record<string, { primary: string; secondary: string }> = {
    creator: { primary: '#8B5CF6', secondary: '#A855F7' },
    traveler: { primary: '#0EA5E9', secondary: '#06B6D4' },
    smb: { primary: '#F59E0B', secondary: '#FB923C' },
    education: { primary: '#10B981', secondary: '#34D399' },
    healthcare: { primary: '#EC4899', secondary: '#F472B6' },
    enterprise: { primary: '#6366F1', secondary: '#818CF8' },
  };
  
  return colorMap[segmentType] || { primary: '#6366F1', secondary: '#818CF8' };
}

export default JourneyStageIllustration;

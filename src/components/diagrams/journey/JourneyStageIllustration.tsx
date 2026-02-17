import React from 'react';
import { motion } from 'framer-motion';

interface JourneyStageIllustrationProps {
  stageType: string;
  segmentType: string;
  isActive?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// Color palettes for different segments
const getSegmentColors = (segmentType: string) => {
  const colorMap: Record<string, { primary: string; secondary: string; accent: string; bg: string }> = {
    creator: { primary: '#8B5CF6', secondary: '#A855F7', accent: '#D946EF', bg: '#FAF5FF' },
    traveler: { primary: '#0EA5E9', secondary: '#06B6D4', accent: '#22D3EE', bg: '#F0F9FF' },
    smb: { primary: '#F59E0B', secondary: '#EAB308', accent: '#FACC15', bg: '#FFFBEB' },
    education: { primary: '#10B981', secondary: '#14B8A6', accent: '#2DD4BF', bg: '#ECFDF5' },
    healthcare: { primary: '#EC4899', secondary: '#F472B6', accent: '#FB7185', bg: '#FDF2F8' },
    enterprise: { primary: '#6366F1', secondary: '#8B5CF6', accent: '#A78BFA', bg: '#EEF2FF' },
  };
  return colorMap[segmentType] || colorMap.creator;
};

// SVG-based illustrated scenes for each journey stage - Infographic style
export const JourneyStageIllustration: React.FC<JourneyStageIllustrationProps> = ({
  stageType,
  segmentType,
  isActive = false,
  size = 'md',
}) => {
  const sizes = {
    sm: { width: 60, height: 60 },
    md: { width: 100, height: 100 },
    lg: { width: 160, height: 160 },
  };

  const { width, height } = sizes[size];

  const renderIllustration = () => {
    switch (stageType.toLowerCase()) {
      case 'inspiration':
      case 'trip inspiration':
      case 'business need':
      case 'lesson planning':
      case 'patient need':
      case 'strategy':
        return <InspirationInfographic segmentType={segmentType} isActive={isActive} />;
      
      case 'decide':
      case 'booking':
      case 'template select':
      case 'script ai':
      case 'project setup':
        return <DecisionInfographic segmentType={segmentType} isActive={isActive} />;
      
      case 'script':
      case 'curriculum':
      case 'script prep':
        return <ScriptInfographic segmentType={segmentType} isActive={isActive} />;
      
      case 'record':
      case 'on location':
      case 'record demo':
      case 'record lecture':
      case 'secure record':
        return <RecordingInfographic segmentType={segmentType} isActive={isActive} />;
      
      case 'voice':
      case 'voice narration':
      case 'brand voice':
      case 'ai voice':
      case 'clear voice':
        return <VoiceInfographic segmentType={segmentType} isActive={isActive} />;
      
      case 'language':
      case 'offline mode':
      case 'global reach':
      case 'global offices':
        return <LanguageInfographic segmentType={segmentType} isActive={isActive} />;
      
      case 'generate':
      case 'auto-edit kit':
      case 'ai quiz gen':
      case 'phi redaction':
        return <AIProcessingInfographic segmentType={segmentType} isActive={isActive} />;
      
      case 'edit':
      case 'team collab':
      case 'interactive':
      case 'collab edit':
        return <EditInfographic segmentType={segmentType} isActive={isActive} />;
      
      case 're-record':
      case 'b-roll library':
      case 'student view':
      case 'accessibility':
      case 'legal review':
        return <RefinementInfographic segmentType={segmentType} isActive={isActive} />;
      
      case 'script attach':
      case 'travel diary':
      case 'brand kit':
      case 'lms export':
      case 'medical review':
      case 'brand check':
        return <BrandingInfographic segmentType={segmentType} isActive={isActive} />;
      
      case 'preview':
      case 'review':
      case 'batch process':
      case 'analytics':
      case 'compliance':
      case 'audit trail':
      case 'sso access':
      case 'multi-tenant':
        return <AnalyticsInfographic segmentType={segmentType} isActive={isActive} />;
      
      case 'publish':
      case 'secure delivery':
      case 'white-label':
        return <PublishInfographic segmentType={segmentType} isActive={isActive} />;
      
      default:
        return <DefaultInfographic segmentType={segmentType} isActive={isActive} />;
    }
  };

  return (
    <motion.div
      className="relative overflow-hidden rounded-xl"
      style={{ width, height }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
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
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)',
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
};

// Character illustration - Person with problem/solution context
const PersonCharacter: React.FC<{ x: number; y: number; emotion: 'stressed' | 'happy' | 'thinking' | 'working'; colors: ReturnType<typeof getSegmentColors> }> = ({ x, y, emotion, colors }) => {
  const faceColor = '#FFE4C4';
  const hairColor = '#4A3728';
  
  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Body */}
      <ellipse cx="0" cy="18" rx="8" ry="10" fill={colors.primary} />
      
      {/* Head */}
      <circle cx="0" cy="0" r="10" fill={faceColor} />
      
      {/* Hair */}
      <path d="M-8,-6 Q-10,-12 -5,-14 Q0,-16 5,-14 Q10,-12 8,-6 L6,-4 Q0,-8 -6,-4 Z" fill={hairColor} />
      
      {/* Face expressions based on emotion */}
      {emotion === 'stressed' && (
        <>
          {/* Stressed eyes */}
          <circle cx="-3" cy="-2" r="1.5" fill="#333" />
          <circle cx="3" cy="-2" r="1.5" fill="#333" />
          {/* Worried eyebrows */}
          <line x1="-5" y1="-5" x2="-1" y2="-4" stroke="#333" strokeWidth="0.8" />
          <line x1="1" y1="-4" x2="5" y2="-5" stroke="#333" strokeWidth="0.8" />
          {/* Frown */}
          <path d="M-3,4 Q0,2 3,4" fill="none" stroke="#333" strokeWidth="0.8" />
          {/* Sweat drop */}
          <ellipse cx="8" cy="-3" rx="1.5" ry="2" fill="#87CEEB" />
        </>
      )}
      {emotion === 'happy' && (
        <>
          {/* Happy eyes */}
          <path d="M-4,-2 Q-3,-4 -2,-2" fill="none" stroke="#333" strokeWidth="1" />
          <path d="M2,-2 Q3,-4 4,-2" fill="none" stroke="#333" strokeWidth="1" />
          {/* Smile */}
          <path d="M-3,3 Q0,7 3,3" fill="none" stroke="#333" strokeWidth="1" />
          {/* Rosy cheeks */}
          <circle cx="-5" cy="1" r="2" fill="#FFB6C1" opacity="0.6" />
          <circle cx="5" cy="1" r="2" fill="#FFB6C1" opacity="0.6" />
        </>
      )}
      {emotion === 'thinking' && (
        <>
          {/* Thinking eyes */}
          <circle cx="-3" cy="-2" r="1.5" fill="#333" />
          <circle cx="3" cy="-2" r="1.5" fill="#333" />
          {/* Raised eyebrow */}
          <line x1="-5" y1="-6" x2="-1" y2="-5" stroke="#333" strokeWidth="0.8" />
          <line x1="1" y1="-5" x2="5" y2="-4" stroke="#333" strokeWidth="0.8" />
          {/* Thinking mouth */}
          <circle cx="0" cy="4" r="1.5" fill="#333" />
        </>
      )}
      {emotion === 'working' && (
        <>
          {/* Focused eyes */}
          <circle cx="-3" cy="-2" r="1.5" fill="#333" />
          <circle cx="3" cy="-2" r="1.5" fill="#333" />
          {/* Slight smile */}
          <path d="M-2,3 Q0,5 2,3" fill="none" stroke="#333" strokeWidth="0.8" />
        </>
      )}
    </g>
  );
};

// Document stack illustration
const DocumentStack: React.FC<{ x: number; y: number; isMessy?: boolean; colors: ReturnType<typeof getSegmentColors> }> = ({ x, y, isMessy = false, colors }) => {
  if (isMessy) {
    return (
      <g transform={`translate(${x}, ${y})`}>
        {/* Scattered messy papers */}
        <rect x="-12" y="-8" width="18" height="22" rx="1" fill="#FFF" stroke="#DDD" transform="rotate(-15)" />
        <rect x="-8" y="-10" width="18" height="22" rx="1" fill="#FFFEF0" stroke="#DDD" transform="rotate(10)" />
        <rect x="-10" y="-6" width="18" height="22" rx="1" fill="#FFF" stroke="#DDD" transform="rotate(-5)" />
        <rect x="-6" y="-4" width="18" height="22" rx="1" fill="#FFFACD" stroke="#DDD" transform="rotate(3)" />
        {/* X marks */}
        <g fill="#EF4444">
          <path d="M-14,8 L-10,12 M-14,12 L-10,8" stroke="#EF4444" strokeWidth="2" />
        </g>
      </g>
    );
  }
  
  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Organized documents */}
      <rect x="-10" y="-10" width="20" height="24" rx="2" fill="#FFF" stroke={colors.primary} strokeWidth="1.5" />
      <rect x="-8" y="-12" width="20" height="24" rx="2" fill="#F0FFF4" stroke={colors.primary} strokeWidth="1" opacity="0.8" />
      <rect x="-6" y="-14" width="20" height="24" rx="2" fill="#ECFDF5" stroke={colors.primary} strokeWidth="0.5" opacity="0.6" />
      {/* Content lines */}
      <rect x="-6" y="-4" width="12" height="2" rx="1" fill={colors.primary} opacity="0.3" />
      <rect x="-6" y="1" width="10" height="2" rx="1" fill={colors.primary} opacity="0.3" />
      <rect x="-6" y="6" width="8" height="2" rx="1" fill={colors.primary} opacity="0.3" />
      {/* Check mark */}
      <path d="M6,8 L9,11 L15,3" stroke="#22C55E" strokeWidth="2" fill="none" />
    </g>
  );
};

// AI Brain illustration
const AIBrain: React.FC<{ x: number; y: number; isActive: boolean; colors: ReturnType<typeof getSegmentColors> }> = ({ x, y, isActive, colors }) => (
  <g transform={`translate(${x}, ${y})`}>
    {/* Glow effect */}
    {isActive && (
      <motion.ellipse
        cx="0" cy="0" rx="18" ry="14"
        fill={colors.primary}
        opacity="0.2"
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    )}
    
    {/* Brain outline */}
    <path
      d="M-10,-8 Q-15,-5 -14,2 Q-15,8 -8,10 Q-4,12 0,10 Q4,12 8,10 Q15,8 14,2 Q15,-5 10,-8 Q8,-12 0,-10 Q-8,-12 -10,-8"
      fill="url(#brainGradient)"
      stroke={colors.primary}
      strokeWidth="1.5"
    />
    
    {/* Brain details */}
    <path d="M-6,-4 Q-2,-6 2,-4" fill="none" stroke={colors.secondary} strokeWidth="1" opacity="0.6" />
    <path d="M-4,0 Q0,-2 4,0" fill="none" stroke={colors.secondary} strokeWidth="1" opacity="0.6" />
    <path d="M-6,4 Q-2,2 2,4" fill="none" stroke={colors.secondary} strokeWidth="1" opacity="0.6" />
    
    {/* Neural connection dots */}
    <motion.circle
      cx="-5" cy="-2" r="1.5"
      fill={colors.accent}
      animate={isActive ? { opacity: [0.5, 1, 0.5] } : {}}
      transition={{ duration: 0.5, repeat: Infinity }}
    />
    <motion.circle
      cx="5" cy="-2" r="1.5"
      fill={colors.accent}
      animate={isActive ? { opacity: [0.5, 1, 0.5] } : {}}
      transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
    />
    <motion.circle
      cx="0" cy="3" r="1.5"
      fill={colors.accent}
      animate={isActive ? { opacity: [0.5, 1, 0.5] } : {}}
      transition={{ duration: 0.5, repeat: Infinity, delay: 0.4 }}
    />
  </g>
);

// Flow Arrow
const FlowArrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; colors: ReturnType<typeof getSegmentColors> }> = ({ x1, y1, x2, y2, colors }) => (
  <g>
    <defs>
      <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor={colors.primary} stopOpacity="0.3" />
        <stop offset="100%" stopColor={colors.secondary} stopOpacity="0.8" />
      </linearGradient>
    </defs>
    <path
      d={`M${x1},${y1} L${x2 - 5},${y2} L${x2 - 8},${y2 - 3} M${x2 - 5},${y2} L${x2 - 8},${y2 + 3}`}
      fill="none"
      stroke="url(#arrowGradient)"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </g>
);

// Infographic Scenes

const InspirationInfographic: React.FC<{ segmentType: string; isActive: boolean }> = ({ segmentType, isActive }) => {
  const colors = getSegmentColors(segmentType);
  
  return (
    <g>
      <defs>
        <linearGradient id="inspireBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.bg} />
          <stop offset="100%" stopColor="#FFF" />
        </linearGradient>
        <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFB6C1" />
          <stop offset="100%" stopColor="#DDA0DD" />
        </linearGradient>
      </defs>
      
      <rect width="100" height="100" fill="url(#inspireBg)" rx="8" />
      
      {/* Problem side - confused person with messy papers */}
      <PersonCharacter x={22} y={45} emotion="thinking" colors={colors} />
      
      {/* Light bulb above head */}
      <motion.g
        animate={isActive ? { y: [-2, 2, -2], opacity: [0.8, 1, 0.8] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <ellipse cx="22" cy="18" rx="8" ry="6" fill="#FFD700" opacity="0.3" />
        <path d="M22,10 Q18,15 18,20 L26,20 Q26,15 22,10" fill="#FFD700" stroke="#FFA500" strokeWidth="1" />
        <rect x="19" y="20" width="6" height="4" fill="#888" rx="1" />
        {/* Light rays */}
        <line x1="22" y1="5" x2="22" y2="2" stroke="#FFD700" strokeWidth="1.5" />
        <line x1="30" y1="12" x2="33" y2="10" stroke="#FFD700" strokeWidth="1.5" />
        <line x1="14" y1="12" x2="11" y2="10" stroke="#FFD700" strokeWidth="1.5" />
      </motion.g>
      
      {/* Idea clouds */}
      <motion.g
        animate={isActive ? { opacity: [0.4, 0.8, 0.4] } : { opacity: 0.6 }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ellipse cx="12" cy="70" rx="8" ry="5" fill="#E0E7FF" />
        <ellipse cx="35" cy="80" rx="10" ry="6" fill="#E0E7FF" />
        <ellipse cx="22" cy="75" rx="6" ry="4" fill="#E0E7FF" />
      </motion.g>
      
      {/* Arrow */}
      <FlowArrow x1={42} y1={50} x2={58} y2={50} colors={colors} />
      
      {/* Solution side - AI brain generating ideas */}
      <AIBrain x={75} y={40} isActive={isActive} colors={colors} />
      
      {/* Generated ideas floating */}
      <motion.g
        animate={isActive ? { y: [0, -5, 0] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <rect x="62" y="60" width="12" height="8" rx="2" fill="#FFF" stroke={colors.primary} strokeWidth="1" />
        <rect x="64" y="63" width="8" height="1" rx="0.5" fill={colors.primary} opacity="0.5" />
        <rect x="64" y="65" width="6" height="1" rx="0.5" fill={colors.primary} opacity="0.5" />
      </motion.g>
      <motion.g
        animate={isActive ? { y: [0, -5, 0] } : {}}
        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
      >
        <rect x="78" y="58" width="12" height="8" rx="2" fill="#FFF" stroke={colors.secondary} strokeWidth="1" />
        <rect x="80" y="61" width="8" height="1" rx="0.5" fill={colors.secondary} opacity="0.5" />
        <rect x="80" y="63" width="6" height="1" rx="0.5" fill={colors.secondary} opacity="0.5" />
      </motion.g>
      <motion.g
        animate={isActive ? { y: [0, -5, 0] } : {}}
        transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
      >
        <rect x="70" y="70" width="12" height="8" rx="2" fill="#FFF" stroke={colors.accent} strokeWidth="1" />
        <rect x="72" y="73" width="8" height="1" rx="0.5" fill={colors.accent} opacity="0.5" />
        <rect x="72" y="75" width="6" height="1" rx="0.5" fill={colors.accent} opacity="0.5" />
      </motion.g>
      
      {/* Sparkles */}
      <motion.polygon
        points="88,25 89,28 92,28 90,30 91,33 88,31 85,33 86,30 84,28 87,28"
        fill="#FFD700"
        animate={isActive ? { scale: [1, 1.3, 1], rotate: [0, 180, 360] } : {}}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </g>
  );
};

const DecisionInfographic: React.FC<{ segmentType: string; isActive: boolean }> = ({ segmentType, isActive }) => {
  const colors = getSegmentColors(segmentType);
  
  return (
    <g>
      <defs>
        <linearGradient id="decideBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.bg} />
          <stop offset="100%" stopColor="#FFF" />
        </linearGradient>
      </defs>
      
      <rect width="100" height="100" fill="url(#decideBg)" rx="8" />
      
      {/* Person at center considering options */}
      <PersonCharacter x={50} y={55} emotion="working" colors={colors} />
      
      {/* Option cards */}
      <motion.g
        animate={isActive ? { y: [0, -3, 0] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <rect x="8" y="20" width="28" height="35" rx="4" fill="#FFF" stroke={colors.primary} strokeWidth="2" />
        <rect x="12" y="26" width="20" height="3" rx="1" fill={colors.primary} opacity="0.7" />
        <rect x="12" y="32" width="16" height="2" rx="1" fill={colors.primary} opacity="0.4" />
        <rect x="12" y="37" width="18" height="2" rx="1" fill={colors.primary} opacity="0.4" />
        <rect x="12" y="42" width="14" height="2" rx="1" fill={colors.primary} opacity="0.4" />
        <text x="22" y="52" fill={colors.primary} fontSize="6" textAnchor="middle" fontWeight="bold">A</text>
      </motion.g>
      
      <motion.g
        animate={isActive ? { y: [0, -3, 0] } : {}}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
      >
        <rect x="64" y="20" width="28" height="35" rx="4" fill="#FFF" stroke={colors.secondary} strokeWidth="2" />
        <rect x="68" y="26" width="20" height="3" rx="1" fill={colors.secondary} opacity="0.7" />
        <rect x="68" y="32" width="16" height="2" rx="1" fill={colors.secondary} opacity="0.4" />
        <rect x="68" y="37" width="18" height="2" rx="1" fill={colors.secondary} opacity="0.4" />
        <rect x="68" y="42" width="14" height="2" rx="1" fill={colors.secondary} opacity="0.4" />
        <text x="78" y="52" fill={colors.secondary} fontSize="6" textAnchor="middle" fontWeight="bold">B</text>
      </motion.g>
      
      {/* Selection indicator */}
      <motion.g
        animate={isActive ? { scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] } : {}}
        transition={{ duration: 1, repeat: Infinity }}
      >
        <circle cx="22" cy="8" r="6" fill="#22C55E" opacity="0.2" />
        <path d="M19,8 L21,10 L25,6" stroke="#22C55E" strokeWidth="2" fill="none" />
      </motion.g>
      
      {/* Connecting lines */}
      <line x1="36" y1="37" x2="45" y2="45" stroke={colors.primary} strokeWidth="1" strokeDasharray="2,2" opacity="0.5" />
      <line x1="64" y1="37" x2="55" y2="45" stroke={colors.secondary} strokeWidth="1" strokeDasharray="2,2" opacity="0.5" />
    </g>
  );
};

const ScriptInfographic: React.FC<{ segmentType: string; isActive: boolean }> = ({ segmentType, isActive }) => {
  const colors = getSegmentColors(segmentType);
  
  return (
    <g>
      <defs>
        <linearGradient id="scriptBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF" />
          <stop offset="100%" stopColor={colors.bg} />
        </linearGradient>
        <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFB6C1" />
          <stop offset="100%" stopColor="#DDA0DD" />
        </linearGradient>
      </defs>
      
      <rect width="100" height="100" fill="url(#scriptBg)" rx="8" />
      
      {/* AI Brain generating script */}
      <AIBrain x={25} y={35} isActive={isActive} colors={colors} />
      
      {/* Magic sparkle connection */}
      <motion.g
        animate={isActive ? { opacity: [0.3, 1, 0.3] } : { opacity: 0.5 }}
        transition={{ duration: 0.5, repeat: Infinity }}
      >
        <line x1="38" y1="40" x2="48" y2="45" stroke={colors.accent} strokeWidth="2" strokeDasharray="3,2" />
        <circle cx="43" cy="42" r="2" fill={colors.accent} />
      </motion.g>
      
      {/* Generated script document */}
      <motion.g
        animate={isActive ? { y: [0, -2, 0] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <rect x="50" y="20" width="40" height="55" rx="3" fill="#FFF" stroke={colors.primary} strokeWidth="1.5" />
        {/* Animated text lines appearing */}
        <motion.rect
          x="55" y="28" width="30" height="3" rx="1"
          fill={colors.primary}
          initial={{ scaleX: 0 }}
          animate={isActive ? { scaleX: 1 } : { scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ transformOrigin: 'left' }}
        />
        <motion.rect
          x="55" y="35" width="25" height="3" rx="1"
          fill={colors.secondary}
          opacity="0.6"
          initial={{ scaleX: 0 }}
          animate={isActive ? { scaleX: 1 } : { scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{ transformOrigin: 'left' }}
        />
        <motion.rect
          x="55" y="42" width="28" height="3" rx="1"
          fill={colors.primary}
          opacity="0.8"
          initial={{ scaleX: 0 }}
          animate={isActive ? { scaleX: 1 } : { scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          style={{ transformOrigin: 'left' }}
        />
        <motion.rect
          x="55" y="49" width="22" height="3" rx="1"
          fill={colors.secondary}
          opacity="0.6"
          initial={{ scaleX: 0 }}
          animate={isActive ? { scaleX: 1 } : { scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          style={{ transformOrigin: 'left' }}
        />
        <motion.rect
          x="55" y="56" width="26" height="3" rx="1"
          fill={colors.primary}
          initial={{ scaleX: 0 }}
          animate={isActive ? { scaleX: 1 } : { scaleX: 1 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          style={{ transformOrigin: 'left' }}
        />
        <motion.rect
          x="55" y="63" width="20" height="3" rx="1"
          fill={colors.secondary}
          opacity="0.6"
          initial={{ scaleX: 0 }}
          animate={isActive ? { scaleX: 1 } : { scaleX: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          style={{ transformOrigin: 'left' }}
        />
      </motion.g>
      
      {/* Typing cursor */}
      <motion.rect
        x="75" y="63" width="2" height="6"
        fill={colors.accent}
        animate={isActive ? { opacity: [1, 0, 1] } : { opacity: 1 }}
        transition={{ duration: 0.8, repeat: Infinity }}
      />
      
      {/* Sparkles */}
      <motion.polygon
        points="92,15 93,18 96,18 94,20 95,23 92,21 89,23 90,20 88,18 91,18"
        fill="#FFD700"
        animate={isActive ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </g>
  );
};

const RecordingInfographic: React.FC<{ segmentType: string; isActive: boolean }> = ({ segmentType, isActive }) => {
  const colors = getSegmentColors(segmentType);
  
  return (
    <g>
      <defs>
        <linearGradient id="recordBg" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#1a1a2e" />
          <stop offset="100%" stopColor="#2d2d44" />
        </linearGradient>
        <radialGradient id="spotlight">
          <stop offset="0%" stopColor="#FFD700" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
        </radialGradient>
      </defs>
      
      <rect width="100" height="100" fill="url(#recordBg)" rx="8" />
      
      {/* Spotlight */}
      <ellipse cx="65" cy="65" rx="30" ry="25" fill="url(#spotlight)" />
      
      {/* Camera on tripod */}
      <g transform="translate(20, 25)">
        {/* Camera body */}
        <rect x="0" y="0" width="24" height="18" rx="3" fill="#333" stroke="#555" strokeWidth="1" />
        <circle cx="12" cy="9" r="6" fill="#1a1a2e" stroke={colors.primary} strokeWidth="2" />
        <circle cx="12" cy="9" r="3" fill={colors.primary} opacity="0.5" />
        
        {/* Recording light */}
        <motion.circle
          cx="22" cy="4" r="2"
          fill="#FF0000"
          animate={isActive ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
        
        {/* Tripod */}
        <line x1="12" y1="18" x2="4" y2="40" stroke="#555" strokeWidth="2" />
        <line x1="12" y1="18" x2="20" y2="40" stroke="#555" strokeWidth="2" />
        <line x1="12" y1="18" x2="12" y2="35" stroke="#555" strokeWidth="2" />
      </g>
      
      {/* Person being recorded */}
      <PersonCharacter x={65} y={55} emotion="happy" colors={colors} />
      
      {/* Sound waves */}
      <motion.g
        animate={isActive ? { opacity: [0.3, 0.8, 0.3] } : { opacity: 0.5 }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        <path d="M80,48 Q88,55 80,62" fill="none" stroke={colors.secondary} strokeWidth="2" />
        <path d="M84,44 Q95,55 84,66" fill="none" stroke={colors.secondary} strokeWidth="1.5" opacity="0.6" />
        <path d="M88,40 Q102,55 88,70" fill="none" stroke={colors.secondary} strokeWidth="1" opacity="0.4" />
      </motion.g>
      
      {/* Microphone */}
      <g transform="translate(55, 35)">
        <rect x="-2" y="-12" width="4" height="10" rx="2" fill="#666" />
        <line x1="0" y1="-2" x2="0" y2="5" stroke="#555" strokeWidth="2" />
        <ellipse cx="0" cy="6" rx="5" ry="2" fill="#444" />
      </g>
      
      {/* Recording indicator */}
      <motion.g
        animate={isActive ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.5, repeat: Infinity }}
      >
        <circle cx="10" cy="90" r="4" fill="#FF0000" />
        <text x="18" y="92" fill="#FFF" fontSize="6" fontWeight="bold">REC</text>
      </motion.g>
    </g>
  );
};

const VoiceInfographic: React.FC<{ segmentType: string; isActive: boolean }> = ({ segmentType, isActive }) => {
  const colors = getSegmentColors(segmentType);
  
  return (
    <g>
      <defs>
        <linearGradient id="voiceBg" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor={colors.bg} />
          <stop offset="100%" stopColor="#FFF" />
        </linearGradient>
      </defs>
      
      <rect width="100" height="100" fill="url(#voiceBg)" rx="8" />
      
      {/* Large microphone */}
      <g transform="translate(50, 45)">
        <rect x="-8" y="-20" width="16" height="30" rx="8" fill="#333" stroke={colors.primary} strokeWidth="2" />
        <rect x="-5" y="-15" width="10" height="20" rx="5" fill={colors.primary} opacity="0.4" />
        <line x1="0" y1="10" x2="0" y2="25" stroke="#444" strokeWidth="4" />
        <ellipse cx="0" cy="27" rx="12" ry="4" fill="#333" />
      </g>
      
      {/* Waveform */}
      <motion.g
        animate={isActive ? { y: [0, -2, 0] } : {}}
        transition={{ duration: 0.3, repeat: Infinity }}
      >
        {[...Array(12)].map((_, i) => (
          <motion.rect
            key={i}
            x={15 + i * 6}
            y={78 - Math.sin(i * 0.7) * 12}
            width="4"
            height={Math.abs(Math.sin(i * 0.7) * 12) + 4}
            rx="2"
            fill={i % 2 === 0 ? colors.primary : colors.secondary}
            opacity="0.7"
            animate={isActive ? { 
              height: [Math.abs(Math.sin(i * 0.7) * 12) + 4, Math.abs(Math.sin(i * 0.7 + 1) * 12) + 4, Math.abs(Math.sin(i * 0.7) * 12) + 4]
            } : {}}
            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.05 }}
          />
        ))}
      </motion.g>
      
      {/* Voice cloning icons */}
      <motion.g
        animate={isActive ? { opacity: [0.5, 1, 0.5] } : { opacity: 0.7 }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <circle cx="20" cy="25" r="8" fill="#FFF" stroke={colors.primary} strokeWidth="1.5" />
        <text x="20" y="28" fill={colors.primary} fontSize="6" textAnchor="middle">AI</text>
        
        <circle cx="80" cy="25" r="8" fill="#FFF" stroke={colors.secondary} strokeWidth="1.5" />
        <text x="80" y="28" fill={colors.secondary} fontSize="5" textAnchor="middle">TTS</text>
      </motion.g>
      
      {/* Sound waves from mic */}
      <motion.g
        animate={isActive ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.5, repeat: Infinity }}
      >
        <path d="M62,35 Q72,45 62,55" fill="none" stroke={colors.primary} strokeWidth="2" opacity="0.6" />
        <path d="M66,30 Q80,45 66,60" fill="none" stroke={colors.primary} strokeWidth="1.5" opacity="0.4" />
      </motion.g>
    </g>
  );
};

const LanguageInfographic: React.FC<{ segmentType: string; isActive: boolean }> = ({ segmentType, isActive }) => {
  const colors = getSegmentColors(segmentType);
  
  return (
    <g>
      <rect width="100" height="100" fill="#E8F4F8" rx="8" />
      
      {/* Globe */}
      <circle cx="50" cy="50" r="30" fill="#4A90D9" stroke={colors.primary} strokeWidth="2" />
      
      {/* Continents */}
      <ellipse cx="38" cy="42" rx="10" ry="12" fill="#2D8659" transform="rotate(-15, 38, 42)" />
      <ellipse cx="58" cy="38" rx="12" ry="10" fill="#2D8659" transform="rotate(10, 58, 38)" />
      <ellipse cx="55" cy="58" rx="8" ry="6" fill="#2D8659" />
      
      {/* Grid lines */}
      <ellipse cx="50" cy="50" rx="30" ry="12" fill="none" stroke="white" strokeWidth="0.5" opacity="0.5" />
      <ellipse cx="50" cy="50" rx="30" ry="22" fill="none" stroke="white" strokeWidth="0.5" opacity="0.5" />
      
      {/* Language bubbles floating around */}
      <motion.g
        animate={isActive ? { y: [0, -3, 0] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <rect x="8" y="18" width="16" height="10" rx="3" fill="#FFF" stroke={colors.primary} strokeWidth="1" />
        <text x="16" y="26" fill={colors.primary} fontSize="5" textAnchor="middle" fontWeight="bold">EN</text>
      </motion.g>
      
      <motion.g
        animate={isActive ? { y: [0, -3, 0] } : {}}
        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
      >
        <rect x="76" y="15" width="16" height="10" rx="3" fill="#FFF" stroke={colors.secondary} strokeWidth="1" />
        <text x="84" y="23" fill={colors.secondary} fontSize="5" textAnchor="middle" fontWeight="bold">ES</text>
      </motion.g>
      
      <motion.g
        animate={isActive ? { y: [0, -3, 0] } : {}}
        transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
      >
        <rect x="5" y="65" width="16" height="10" rx="3" fill="#FFF" stroke={colors.accent} strokeWidth="1" />
        <text x="13" y="73" fill={colors.accent} fontSize="5" textAnchor="middle" fontWeight="bold">FR</text>
      </motion.g>
      
      <motion.g
        animate={isActive ? { y: [0, -3, 0] } : {}}
        transition={{ duration: 2, repeat: Infinity, delay: 0.9 }}
      >
        <rect x="78" y="68" width="16" height="10" rx="3" fill="#FFF" stroke={colors.primary} strokeWidth="1" />
        <text x="86" y="76" fill={colors.primary} fontSize="5" textAnchor="middle" fontWeight="bold">日本</text>
      </motion.g>
      
      {/* 12+ Languages badge */}
      <motion.g
        animate={isActive ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 1, repeat: Infinity }}
      >
        <circle cx="50" cy="88" r="8" fill={colors.primary} />
        <text x="50" y="91" fill="#FFF" fontSize="5" textAnchor="middle" fontWeight="bold">12+</text>
      </motion.g>
    </g>
  );
};

const AIProcessingInfographic: React.FC<{ segmentType: string; isActive: boolean }> = ({ segmentType, isActive }) => {
  const colors = getSegmentColors(segmentType);
  
  return (
    <g>
      <defs>
        <linearGradient id="aiBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.bg} />
          <stop offset="100%" stopColor="#FFF" />
        </linearGradient>
        <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFB6C1" />
          <stop offset="100%" stopColor="#DDA0DD" />
        </linearGradient>
      </defs>
      
      <rect width="100" height="100" fill="url(#aiBg)" rx="8" />
      
      {/* Problem: messy documents */}
      <DocumentStack x={22} y={45} isMessy={true} colors={colors} />
      
      {/* Arrow through AI */}
      <FlowArrow x1={38} y1={45} x2={52} y2={45} colors={colors} />
      
      {/* AI Brain processing */}
      <motion.g
        animate={isActive ? { rotate: [0, 5, -5, 0] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <AIBrain x={58} y={40} isActive={isActive} colors={colors} />
      </motion.g>
      
      <FlowArrow x1={68} y1={45} x2={78} y2={45} colors={colors} />
      
      {/* Solution: organized output */}
      <motion.g
        animate={isActive ? { y: [0, -3, 0] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {/* Multiple organized cards */}
        <rect x="80" y="22" width="15" height="18" rx="2" fill="#FFF" stroke={colors.primary} strokeWidth="1" />
        <rect x="82" y="25" width="10" height="2" rx="1" fill={colors.primary} opacity="0.6" />
        <rect x="82" y="29" width="8" height="2" rx="1" fill={colors.primary} opacity="0.4" />
        <path d="M87,33 L89,35 L93,31" stroke="#22C55E" strokeWidth="1.5" fill="none" />
        
        <rect x="80" y="42" width="15" height="18" rx="2" fill="#FFF" stroke={colors.secondary} strokeWidth="1" />
        <rect x="82" y="45" width="10" height="2" rx="1" fill={colors.secondary} opacity="0.6" />
        <rect x="82" y="49" width="8" height="2" rx="1" fill={colors.secondary} opacity="0.4" />
        <path d="M87,53 L89,55 L93,51" stroke="#22C55E" strokeWidth="1.5" fill="none" />
        
        <rect x="80" y="62" width="15" height="18" rx="2" fill="#FFF" stroke={colors.accent} strokeWidth="1" />
        <rect x="82" y="65" width="10" height="2" rx="1" fill={colors.accent} opacity="0.6" />
        <rect x="82" y="69" width="8" height="2" rx="1" fill={colors.accent} opacity="0.4" />
        <path d="M87,73 L89,75 L93,71" stroke="#22C55E" strokeWidth="1.5" fill="none" />
      </motion.g>
      
      {/* Processing indicators */}
      <motion.g
        animate={isActive ? { opacity: [0.5, 1, 0.5] } : { opacity: 0.7 }}
        transition={{ duration: 0.8, repeat: Infinity }}
      >
        <rect x="52" y="58" width="12" height="6" rx="2" fill={colors.primary} />
        <text x="58" y="63" fill="#FFF" fontSize="4" textAnchor="middle">95%</text>
      </motion.g>
      
      {/* Sparkles */}
      <motion.polygon
        points="10,15 11,18 14,18 12,20 13,23 10,21 7,23 8,20 6,18 9,18"
        fill="#FFD700"
        animate={isActive ? { scale: [1, 1.3, 1], rotate: [0, 180, 360] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </g>
  );
};

const EditInfographic: React.FC<{ segmentType: string; isActive: boolean }> = ({ segmentType, isActive }) => {
  const colors = getSegmentColors(segmentType);
  
  return (
    <g>
      <defs>
        <linearGradient id="editBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF" />
          <stop offset="100%" stopColor={colors.bg} />
        </linearGradient>
      </defs>
      
      <rect width="100" height="100" fill="url(#editBg)" rx="8" />
      
      {/* Video timeline */}
      <rect x="10" y="15" width="80" height="35" rx="4" fill="#1a1a2e" stroke={colors.primary} strokeWidth="1.5" />
      
      {/* Timeline clips */}
      <motion.g
        animate={isActive ? { x: [0, -5, 0] } : {}}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <rect x="15" y="22" width="18" height="8" rx="2" fill={colors.primary} opacity="0.8" />
        <rect x="35" y="22" width="12" height="8" rx="2" fill={colors.secondary} opacity="0.8" />
        <rect x="49" y="22" width="20" height="8" rx="2" fill={colors.primary} opacity="0.8" />
        <rect x="71" y="22" width="14" height="8" rx="2" fill={colors.accent} opacity="0.8" />
      </motion.g>
      
      {/* Audio waveform */}
      <g transform="translate(15, 35)">
        {[...Array(14)].map((_, i) => (
          <motion.rect
            key={i}
            x={i * 5}
            y={-Math.sin(i * 0.6) * 4}
            width="3"
            height={Math.abs(Math.sin(i * 0.6) * 4) + 2}
            rx="1"
            fill="#22C55E"
            opacity="0.7"
            animate={isActive ? {
              height: [Math.abs(Math.sin(i * 0.6) * 4) + 2, Math.abs(Math.sin(i * 0.6 + 1) * 4) + 2, Math.abs(Math.sin(i * 0.6) * 4) + 2]
            } : {}}
            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.05 }}
          />
        ))}
      </g>
      
      {/* Playhead */}
      <motion.line
        x1="50" y1="18" x2="50" y2="47"
        stroke="#FF0000"
        strokeWidth="2"
        animate={isActive ? { x1: [30, 70, 30], x2: [30, 70, 30] } : {}}
        transition={{ duration: 4, repeat: Infinity }}
      />
      
      {/* Editing tools */}
      <g transform="translate(15, 60)">
        {/* Scissors */}
        <motion.g
          animate={isActive ? { rotate: [0, -10, 0] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <circle cx="10" cy="8" r="6" fill="#FFF" stroke={colors.primary} strokeWidth="1.5" />
          <text x="10" y="11" fill={colors.primary} fontSize="7" textAnchor="middle">✂</text>
        </motion.g>
        
        {/* Magic wand */}
        <circle cx="30" cy="8" r="6" fill="#FFF" stroke={colors.secondary} strokeWidth="1.5" />
        <text x="30" y="11" fill={colors.secondary} fontSize="7" textAnchor="middle">✨</text>
        
        {/* Color palette */}
        <circle cx="50" cy="8" r="6" fill="#FFF" stroke={colors.accent} strokeWidth="1.5" />
        <text x="50" y="11" fill={colors.accent} fontSize="7" textAnchor="middle">🎨</text>
        
        {/* Effects */}
        <circle cx="70" cy="8" r="6" fill="#FFF" stroke={colors.primary} strokeWidth="1.5" />
        <text x="70" y="11" fill={colors.primary} fontSize="7" textAnchor="middle">⚡</text>
      </g>
      
      {/* Preview window */}
      <motion.rect
        x="65" y="72" width="28" height="20" rx="3"
        fill="#1a1a2e"
        stroke={colors.primary}
        strokeWidth="1"
        animate={isActive ? { opacity: [0.8, 1, 0.8] } : { opacity: 0.9 }}
        transition={{ duration: 1, repeat: Infinity }}
      />
      <text x="79" y="85" fill="#FFF" fontSize="5" textAnchor="middle">Preview</text>
    </g>
  );
};

const RefinementInfographic: React.FC<{ segmentType: string; isActive: boolean }> = ({ segmentType, isActive }) => {
  const colors = getSegmentColors(segmentType);
  
  return (
    <g>
      <defs>
        <linearGradient id="refineBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.bg} />
          <stop offset="100%" stopColor="#FFF" />
        </linearGradient>
      </defs>
      
      <rect width="100" height="100" fill="url(#refineBg)" rx="8" />
      
      {/* Before/After comparison */}
      <rect x="10" y="15" width="35" height="40" rx="4" fill="#FFF" stroke="#EF4444" strokeWidth="1.5" />
      <text x="27" y="25" fill="#EF4444" fontSize="5" textAnchor="middle" fontWeight="bold">Before</text>
      <rect x="15" y="30" width="25" height="3" rx="1" fill="#666" opacity="0.5" />
      <rect x="15" y="36" width="20" height="3" rx="1" fill="#666" opacity="0.5" />
      <rect x="15" y="42" width="22" height="3" rx="1" fill="#666" opacity="0.5" />
      <path d="M32,48 L34,46 M32,46 L34,48" stroke="#EF4444" strokeWidth="1.5" />
      
      <rect x="55" y="15" width="35" height="40" rx="4" fill="#FFF" stroke="#22C55E" strokeWidth="1.5" />
      <text x="72" y="25" fill="#22C55E" fontSize="5" textAnchor="middle" fontWeight="bold">After</text>
      <rect x="60" y="30" width="25" height="3" rx="1" fill={colors.primary} opacity="0.7" />
      <rect x="60" y="36" width="20" height="3" rx="1" fill={colors.secondary} opacity="0.7" />
      <rect x="60" y="42" width="22" height="3" rx="1" fill={colors.primary} opacity="0.7" />
      <path d="M82,46 L84,48 L88,44" stroke="#22C55E" strokeWidth="1.5" fill="none" />
      
      {/* Arrow between */}
      <FlowArrow x1={45} y1={35} x2={55} y2={35} colors={colors} />
      
      {/* Re-record indicator */}
      <motion.g
        transform="translate(50, 70)"
        animate={isActive ? { rotate: [0, 360] } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <circle cx="0" cy="0" r="12" fill="#FFF" stroke={colors.primary} strokeWidth="2" />
        <path d="M-5,-3 A6,6 0 1,1 5,-3" fill="none" stroke={colors.primary} strokeWidth="2" />
        <polygon points="5,-3 8,-6 8,0" fill={colors.primary} />
      </motion.g>
      
      {/* Improvement metrics */}
      <motion.g
        animate={isActive ? { opacity: [0.5, 1, 0.5] } : { opacity: 0.8 }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <rect x="10" y="80" width="20" height="12" rx="3" fill={colors.primary} />
        <text x="20" y="89" fill="#FFF" fontSize="5" textAnchor="middle">+40%</text>
        
        <rect x="70" y="80" width="20" height="12" rx="3" fill="#22C55E" />
        <text x="80" y="89" fill="#FFF" fontSize="5" textAnchor="middle">✓ QA</text>
      </motion.g>
    </g>
  );
};

const BrandingInfographic: React.FC<{ segmentType: string; isActive: boolean }> = ({ segmentType, isActive }) => {
  const colors = getSegmentColors(segmentType);
  
  return (
    <g>
      <defs>
        <linearGradient id="brandBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF" />
          <stop offset="100%" stopColor={colors.bg} />
        </linearGradient>
      </defs>
      
      <rect width="100" height="100" fill="url(#brandBg)" rx="8" />
      
      {/* Brand kit elements */}
      <motion.g
        animate={isActive ? { y: [0, -2, 0] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {/* Logo placeholder */}
        <rect x="10" y="15" width="30" height="25" rx="4" fill="#FFF" stroke={colors.primary} strokeWidth="1.5" />
        <circle cx="25" cy="27" r="8" fill={colors.primary} opacity="0.3" />
        <text x="25" y="30" fill={colors.primary} fontSize="6" textAnchor="middle" fontWeight="bold">LOGO</text>
      </motion.g>
      
      {/* Color palette */}
      <motion.g
        animate={isActive ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <rect x="50" y="15" width="40" height="25" rx="4" fill="#FFF" stroke={colors.secondary} strokeWidth="1" />
        <rect x="55" y="20" width="8" height="8" rx="2" fill={colors.primary} />
        <rect x="65" y="20" width="8" height="8" rx="2" fill={colors.secondary} />
        <rect x="75" y="20" width="8" height="8" rx="2" fill={colors.accent} />
        <text x="70" y="36" fill="#666" fontSize="4" textAnchor="middle">Brand Colors</text>
      </motion.g>
      
      {/* Font samples */}
      <rect x="10" y="48" width="35" height="20" rx="3" fill="#FFF" stroke={colors.primary} strokeWidth="1" />
      <text x="27" y="56" fill="#333" fontSize="8" textAnchor="middle" fontFamily="serif">Aa</text>
      <text x="27" y="64" fill="#666" fontSize="4" textAnchor="middle">Typography</text>
      
      {/* Applied result */}
      <motion.g
        animate={isActive ? { opacity: [0.8, 1, 0.8] } : { opacity: 0.9 }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        <rect x="50" y="48" width="40" height="44" rx="4" fill="#FFF" stroke={colors.primary} strokeWidth="2" />
        <rect x="55" y="53" width="8" height="8" rx="2" fill={colors.primary} />
        <rect x="55" y="65" width="30" height="3" rx="1" fill={colors.primary} opacity="0.6" />
        <rect x="55" y="71" width="25" height="2" rx="1" fill="#666" opacity="0.4" />
        <rect x="55" y="76" width="28" height="2" rx="1" fill="#666" opacity="0.4" />
        <rect x="55" y="83" width="15" height="6" rx="2" fill={colors.primary} />
        <text x="62" y="88" fill="#FFF" fontSize="4" textAnchor="middle">CTA</text>
      </motion.g>
      
      {/* Connection lines */}
      <motion.g
        animate={isActive ? { opacity: [0.3, 0.7, 0.3] } : { opacity: 0.4 }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        <line x1="40" y1="27" x2="50" y2="27" stroke={colors.primary} strokeWidth="1" strokeDasharray="2,2" />
        <line x1="40" y1="58" x2="50" y2="70" stroke={colors.primary} strokeWidth="1" strokeDasharray="2,2" />
      </motion.g>
    </g>
  );
};

const AnalyticsInfographic: React.FC<{ segmentType: string; isActive: boolean }> = ({ segmentType, isActive }) => {
  const colors = getSegmentColors(segmentType);
  
  return (
    <g>
      <defs>
        <linearGradient id="analyticsBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.bg} />
          <stop offset="100%" stopColor="#FFF" />
        </linearGradient>
      </defs>
      
      <rect width="100" height="100" fill="url(#analyticsBg)" rx="8" />
      
      {/* Chart area */}
      <rect x="10" y="15" width="55" height="45" rx="4" fill="#FFF" stroke={colors.primary} strokeWidth="1.5" />
      
      {/* Bar chart */}
      <motion.g
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{ transformOrigin: 'bottom' }}
      >
        <motion.rect
          x="18" y="35" width="8" height="20" rx="2"
          fill={colors.primary}
          animate={isActive ? { height: [20, 25, 20] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <motion.rect
          x="30" y="28" width="8" height="27" rx="2"
          fill={colors.secondary}
          animate={isActive ? { height: [27, 32, 27] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
        />
        <motion.rect
          x="42" y="22" width="8" height="33" rx="2"
          fill={colors.primary}
          animate={isActive ? { height: [33, 38, 33] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
        />
        <motion.rect
          x="54" y="18" width="8" height="37" rx="2"
          fill={colors.accent}
          animate={isActive ? { height: [37, 42, 37] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
        />
      </motion.g>
      
      {/* Trend line */}
      <motion.path
        d="M18,48 Q30,40 42,32 T66,20"
        fill="none"
        stroke="#22C55E"
        strokeWidth="2"
        strokeDasharray="4,2"
        animate={isActive ? { opacity: [0.5, 1, 0.5] } : { opacity: 0.7 }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      
      {/* Metrics cards */}
      <motion.g
        animate={isActive ? { y: [0, -2, 0] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <rect x="70" y="15" width="25" height="18" rx="3" fill="#FFF" stroke={colors.primary} strokeWidth="1" />
        <text x="82" y="24" fill={colors.primary} fontSize="8" textAnchor="middle" fontWeight="bold">95%</text>
        <text x="82" y="30" fill="#666" fontSize="3" textAnchor="middle">Accuracy</text>
      </motion.g>
      
      <motion.g
        animate={isActive ? { y: [0, -2, 0] } : {}}
        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
      >
        <rect x="70" y="38" width="25" height="18" rx="3" fill="#FFF" stroke="#22C55E" strokeWidth="1" />
        <text x="82" y="47" fill="#22C55E" fontSize="6" textAnchor="middle" fontWeight="bold">↑ 40%</text>
        <text x="82" y="53" fill="#666" fontSize="3" textAnchor="middle">Growth</text>
      </motion.g>
      
      {/* Pie chart */}
      <g transform="translate(30, 78)">
        <circle cx="0" cy="0" r="12" fill={colors.primary} />
        <path d="M0,0 L0,-12 A12,12 0 0,1 10,6 Z" fill={colors.secondary} />
        <path d="M0,0 L10,6 A12,12 0 0,1 -8,9 Z" fill={colors.accent} />
      </g>
      
      {/* Check indicators */}
      <g transform="translate(70, 65)">
        <path d="M5,5 L8,8 L15,1" stroke="#22C55E" strokeWidth="2" fill="none" />
        <text x="20" y="8" fill="#666" fontSize="4">Verified</text>
      </g>
    </g>
  );
};

const PublishInfographic: React.FC<{ segmentType: string; isActive: boolean }> = ({ segmentType, isActive }) => {
  const colors = getSegmentColors(segmentType);
  
  return (
    <g>
      <defs>
        <linearGradient id="publishBg" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#1a1a2e" />
          <stop offset="50%" stopColor="#2d2d44" />
          <stop offset="100%" stopColor={colors.primary} stopOpacity="0.3" />
        </linearGradient>
        <radialGradient id="rocketGlow">
          <stop offset="0%" stopColor={colors.accent} stopOpacity="0.6" />
          <stop offset="100%" stopColor={colors.accent} stopOpacity="0" />
        </radialGradient>
      </defs>
      
      <rect width="100" height="100" fill="url(#publishBg)" rx="8" />
      
      {/* Stars background */}
      {[...Array(20)].map((_, i) => (
        <motion.circle
          key={i}
          cx={10 + (i * 17) % 90}
          cy={10 + (i * 23) % 50}
          r={0.5 + (i % 3) * 0.5}
          fill="#FFF"
          opacity={0.3 + (i % 5) * 0.15}
          animate={isActive ? { opacity: [0.3 + (i % 5) * 0.15, 0.8, 0.3 + (i % 5) * 0.15] } : {}}
          transition={{ duration: 1 + (i % 3), repeat: Infinity, delay: i * 0.1 }}
        />
      ))}
      
      {/* Rocket */}
      <motion.g
        animate={isActive ? { y: [-3, 3, -3], x: [0, 2, 0] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ellipse cx="50" cy="50" rx="20" ry="15" fill="url(#rocketGlow)" />
        
        {/* Rocket body */}
        <path
          d="M50,25 L45,45 L40,55 L50,50 L60,55 L55,45 Z"
          fill="#FFF"
          stroke={colors.primary}
          strokeWidth="1.5"
        />
        <ellipse cx="50" cy="42" rx="3" ry="4" fill={colors.primary} />
        
        {/* Rocket flames */}
        <motion.g
          animate={isActive ? { scaleY: [1, 1.3, 1], opacity: [0.7, 1, 0.7] } : {}}
          transition={{ duration: 0.3, repeat: Infinity }}
        >
          <path d="M45,55 L50,70 L55,55" fill="#FF6B00" />
          <path d="M47,55 L50,65 L53,55" fill="#FFD700" />
        </motion.g>
        
        {/* Rocket windows */}
        <circle cx="50" cy="35" r="3" fill={colors.secondary} />
      </motion.g>
      
      {/* Platform destinations */}
      <motion.g
        animate={isActive ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 1, repeat: Infinity }}
      >
        <circle cx="15" cy="75" r="8" fill="#FFF" />
        <text x="15" y="78" fill="#E4405F" fontSize="8" textAnchor="middle">📸</text>
      </motion.g>
      
      <motion.g
        animate={isActive ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
      >
        <circle cx="35" cy="85" r="8" fill="#FFF" />
        <text x="35" y="88" fill="#FF0000" fontSize="8" textAnchor="middle">▶️</text>
      </motion.g>
      
      <motion.g
        animate={isActive ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
      >
        <circle cx="65" cy="85" r="8" fill="#FFF" />
        <text x="65" y="88" fill="#000" fontSize="8" textAnchor="middle">🎵</text>
      </motion.g>
      
      <motion.g
        animate={isActive ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 1, repeat: Infinity, delay: 0.6 }}
      >
        <circle cx="85" cy="75" r="8" fill="#FFF" />
        <text x="85" y="78" fill="#1877F2" fontSize="8" textAnchor="middle">📘</text>
      </motion.g>
      
      {/* Connection trails */}
      <motion.g
        animate={isActive ? { opacity: [0.3, 0.7, 0.3] } : { opacity: 0.4 }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <line x1="50" y1="55" x2="15" y2="70" stroke={colors.secondary} strokeWidth="1" strokeDasharray="3,3" />
        <line x1="50" y1="55" x2="35" y2="78" stroke={colors.secondary} strokeWidth="1" strokeDasharray="3,3" />
        <line x1="50" y1="55" x2="65" y2="78" stroke={colors.secondary} strokeWidth="1" strokeDasharray="3,3" />
        <line x1="50" y1="55" x2="85" y2="70" stroke={colors.secondary} strokeWidth="1" strokeDasharray="3,3" />
      </motion.g>
      
      {/* Success indicator */}
      <motion.g
        animate={isActive ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.8, repeat: Infinity }}
      >
        <circle cx="50" cy="12" r="6" fill="#22C55E" />
        <path d="M47,12 L49,14 L53,10" stroke="#FFF" strokeWidth="1.5" fill="none" />
      </motion.g>
    </g>
  );
};

const DefaultInfographic: React.FC<{ segmentType: string; isActive: boolean }> = ({ segmentType, isActive }) => {
  const colors = getSegmentColors(segmentType);
  
  return (
    <g>
      <defs>
        <linearGradient id="defaultBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.bg} />
          <stop offset="100%" stopColor="#FFF" />
        </linearGradient>
        <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFB6C1" />
          <stop offset="100%" stopColor="#DDA0DD" />
        </linearGradient>
      </defs>
      
      <rect width="100" height="100" fill="url(#defaultBg)" rx="8" />
      
      {/* Central element */}
      <motion.g
        animate={isActive ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <circle cx="50" cy="50" r="25" fill="#FFF" stroke={colors.primary} strokeWidth="3" />
        <motion.g
          animate={isActive ? { rotate: [0, 360] } : {}}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <circle cx="50" cy="25" r="5" fill={colors.primary} />
          <circle cx="75" cy="50" r="4" fill={colors.secondary} />
          <circle cx="50" cy="75" r="5" fill={colors.accent} />
          <circle cx="25" cy="50" r="4" fill={colors.primary} />
        </motion.g>
      </motion.g>
      
      {/* Central icon */}
      <AIBrain x={50} y={50} isActive={isActive} colors={colors} />
      
      {/* Corner decorations */}
      <motion.polygon
        points="15,15 16,18 19,18 17,20 18,23 15,21 12,23 13,20 11,18 14,18"
        fill="#FFD700"
        animate={isActive ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <motion.polygon
        points="85,85 86,88 89,88 87,90 88,93 85,91 82,93 83,90 81,88 84,88"
        fill="#FFD700"
        animate={isActive ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
      />
    </g>
  );
};

export default JourneyStageIllustration;

/**
 * Feedback Components - Label Studio Integration
 * 
 * User-facing feedback collection for RLHF
 */

export { 
  FeedbackButtons, 
  InlineFeedbackWidget,
  default as LabelStudioFeedbackUI 
} from './LabelStudioFeedbackUI';

export type { FeedbackData, QualityIssue } from './LabelStudioFeedbackUI';

/**
 * Firebase Analytics utilities for Code4U
 * This file contains functions for tracking user interactions and educational metrics
 */

import { logAnalyticsEvent } from './index';

// User engagement events
export const trackLogin = (method) => {
  logAnalyticsEvent('login', { method });
};

export const trackSignUp = (method) => {
  logAnalyticsEvent('sign_up', { method });
};

export const trackProfileUpdate = (fields) => {
  logAnalyticsEvent('profile_update', { fields });
};

// Learning path events
export const trackPathSelected = (path) => {
  logAnalyticsEvent('learning_path_selected', { path });
};

// Level interactions
export const trackLevelStarted = (levelId, levelNumber, category) => {
  logAnalyticsEvent('level_started', {
    level_id: levelId,
    level_number: levelNumber,
    category
  });
};

export const trackLevelCompleted = (levelId, levelNumber, category, timeSpentSeconds) => {
  logAnalyticsEvent('level_completed', {
    level_id: levelId,
    level_number: levelNumber,
    category,
    time_spent_seconds: timeSpentSeconds
  });
};

export const trackCodeSubmitted = (levelId, success) => {
  logAnalyticsEvent('code_submitted', {
    level_id: levelId,
    success
  });
};

export const trackHintViewed = (levelId, hintNumber) => {
  logAnalyticsEvent('hint_viewed', {
    level_id: levelId,
    hint_number: hintNumber
  });
};

// Badge and achievement events
export const trackBadgeEarned = (badgeId, badgeName) => {
  logAnalyticsEvent('badge_earned', {
    badge_id: badgeId,
    badge_name: badgeName
  });
};

// Content interaction events
export const trackContentView = (contentType, contentId) => {
  logAnalyticsEvent('content_view', {
    content_type: contentType,
    content_id: contentId
  });
};

// Legal document events
export const trackLegalDocumentView = (documentType) => {
  logAnalyticsEvent('legal_document_view', {
    document_type: documentType
  });
};

// Feature usage events
export const trackFeatureUsed = (featureName) => {
  logAnalyticsEvent('feature_used', {
    feature_name: featureName
  });
};

// Error tracking
export const trackError = (errorCode, errorMessage, context) => {
  logAnalyticsEvent('app_error', {
    error_code: errorCode,
    error_message: errorMessage,
    context
  });
};

// Custom conversion events
export const trackMilestoneReached = (milestoneName) => {
  logAnalyticsEvent('milestone_reached', {
    milestone_name: milestoneName
  });
};

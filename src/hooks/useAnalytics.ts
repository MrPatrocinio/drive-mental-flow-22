import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { analyticsService, AnalyticsMetrics } from '@/services/analyticsService';

export const useAnalytics = () => {
  const location = useLocation();

  // Auto-track page views
  useEffect(() => {
    analyticsService.trackPageView(location.pathname);
  }, [location.pathname]);

  const trackEvent = (eventType: string, eventData?: Record<string, any>) => {
    analyticsService.trackEvent(eventType, eventData);
  };

  const trackButtonClick = (buttonName: string, location?: string) => {
    analyticsService.trackButtonClick(buttonName, location);
  };

  const trackAudioPlay = (audioId: string, fieldId: string) => {
    analyticsService.trackAudioPlay(audioId, fieldId);
  };

  const trackSubscription = (tier: string, action: 'subscribe' | 'cancel') => {
    analyticsService.trackSubscription(tier, action);
  };

  return {
    trackEvent,
    trackButtonClick,
    trackAudioPlay,
    trackSubscription
  };
};

export const useAnalyticsMetrics = (startDate?: Date, endDate?: Date) => {
  return useQuery<AnalyticsMetrics | null>({
    queryKey: ['analytics-metrics', startDate, endDate],
    queryFn: () => analyticsService.getMetrics(startDate, endDate),
    refetchInterval: 60000, // Refetch every minute
  });
};
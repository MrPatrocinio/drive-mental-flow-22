import { supabase } from "@/integrations/supabase/client";

export interface AnalyticsEvent {
  event_type: string;
  event_data?: Record<string, any>;
  user_id?: string;
  session_id?: string;
}

export interface AnalyticsMetrics {
  totalEvents: number;
  uniqueUsers: number;
  topEvents: Array<{ event_type: string; count: number }>;
  dailyActiveUsers: number;
}

class AnalyticsService {
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async trackEvent(eventType: string, eventData?: Record<string, any>): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('analytics_events').insert({
        event_type: eventType,
        event_data: eventData || {},
        user_id: user?.id || null,
        session_id: this.sessionId,
        user_agent: navigator.userAgent,
      });
    } catch (error) {
      console.error('Error tracking analytics event:', error);
    }
  }

  async getMetrics(startDate?: Date, endDate?: Date): Promise<AnalyticsMetrics | null> {
    try {
      let query = supabase.from('analytics_events').select('*');
      
      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }
      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }

      const { data, error } = await query;
      
      if (error) throw error;

      const totalEvents = data?.length || 0;
      const uniqueUsers = new Set(data?.filter(e => e.user_id).map(e => e.user_id)).size;
      
      // Top events
      const eventCounts = data?.reduce((acc, event) => {
        acc[event.event_type] = (acc[event.event_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
      
      const topEvents = Object.entries(eventCounts)
        .map(([event_type, count]) => ({ event_type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Daily active users (last 24 hours)
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentUsers = data?.filter(e => 
        e.user_id && new Date(e.created_at) > yesterday
      ).map(e => e.user_id) || [];
      const dailyActiveUsers = new Set(recentUsers).size;

      return {
        totalEvents,
        uniqueUsers,
        topEvents,
        dailyActiveUsers
      };
    } catch (error) {
      console.error('Error fetching analytics metrics:', error);
      return null;
    }
  }

  // Common tracking methods
  trackPageView(page: string) {
    this.trackEvent('page_view', { page });
  }

  trackButtonClick(buttonName: string, location?: string) {
    this.trackEvent('button_click', { buttonName, location });
  }

  trackAudioPlay(audioId: string, fieldId: string) {
    this.trackEvent('audio_play', { audioId, fieldId });
  }

  trackSubscription(tier: string, action: 'subscribe' | 'cancel') {
    this.trackEvent('subscription', { tier, action });
  }
}

export const analyticsService = new AnalyticsService();
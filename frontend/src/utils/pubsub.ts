import type { WatchlistItem, WatchlistStatus } from '../api/types';

/**
 * Typed Publisher–Subscriber (Pub/Sub) Event Bus for AnimeSenpai
 * - Decouples state publishers (Watchlist, Preferences, Auth) from UI/analytics subscribers
 * - Supports instant cross-tab synchronization via BroadcastChannel (with safe fallback)
 */
export interface AnimeSenpaiEventMap {
  'watchlist:added': {
    item: WatchlistItem;
    totalCount: number;
  };
  'watchlist:removed': {
    item: WatchlistItem;
    totalCount: number;
  };
  'watchlist:progress': {
    animeId: number;
    title: string;
    previousEpisode: number;
    currentEpisode: number;
    totalEpisodes: number | null;
    autoCompleted: boolean;
  };
  'watchlist:status': {
    animeId: number;
    title: string;
    previousStatus: WatchlistStatus;
    status: WatchlistStatus;
  };
  'watchlist:rated': {
    animeId: number;
    title: string;
    rating: number;
  };
  'watchlist:imported': {
    count: number;
  };
  'watchlist:cleared': {
    previousCount: number;
  };
  'watchlist:synced': {
    items: WatchlistItem[];
    source: 'local' | 'broadcast';
  };
  'preferences:changed': {
    key: string;
    value: unknown;
  };
  'auth:changed': {
    isAuthenticated: boolean;
    userId: string | null;
  };
}

export type EventTopic = keyof AnimeSenpaiEventMap;

export interface PubSubMessage<T extends EventTopic = EventTopic> {
  topic: T;
  payload: AnimeSenpaiEventMap[T];
  timestamp: number;
  originId: string;
}

export type EventSubscriber<T extends EventTopic> = (
  payload: AnimeSenpaiEventMap[T],
  meta: { topic: T; timestamp: number; isRemote: boolean }
) => void;

const CHANNEL_NAME = 'animesenpai_pubsub_v1';

class PubSubBroker {
  private subscribers = new Map<EventTopic, Set<EventSubscriber<any>>>();
  private channel: BroadcastChannel | null = null;
  private readonly tabId: string;

  constructor() {
    this.tabId = `tab_${Math.random().toString(36).slice(2, 10)}`;

    if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event: MessageEvent<PubSubMessage>) => {
          const msg = event.data;
          if (!msg || !msg.topic || msg.originId === this.tabId) return;
          this.dispatch(msg.topic, msg.payload, msg.timestamp, true);
        };
      } catch {
        this.channel = null;
      }
    }
  }

  private dispatch<T extends EventTopic>(
    topic: T,
    payload: AnimeSenpaiEventMap[T],
    timestamp: number,
    isRemote: boolean
  ): void {
    const listeners = this.subscribers.get(topic);
    if (!listeners || listeners.size === 0) return;

    listeners.forEach((listener) => {
      try {
        listener(payload, { topic, timestamp, isRemote });
      } catch (err) {
        console.error(`[PubSub] Subscriber error on topic "${topic}":`, err);
      }
    });
  }

  /** Publish an event to all local subscribers and optionally broadcast to other open tabs */
  publish<T extends EventTopic>(
    topic: T,
    payload: AnimeSenpaiEventMap[T],
    options: { broadcast?: boolean } = {}
  ): void {
    const timestamp = Date.now();
    this.dispatch(topic, payload, timestamp, false);

    if (options.broadcast && this.channel) {
      try {
        const message: PubSubMessage<T> = {
          topic,
          payload,
          timestamp,
          originId: this.tabId,
        };
        this.channel.postMessage(message);
      } catch {
        // Ignore serialization/channel errors in restricted environments
      }
    }
  }

  /** Subscribe to a single topic; returns an unsubscribe cleanup function */
  subscribe<T extends EventTopic>(topic: T, subscriber: EventSubscriber<T>): () => void {
    let topicSet = this.subscribers.get(topic);
    if (!topicSet) {
      topicSet = new Set();
      this.subscribers.set(topic, topicSet);
    }
    topicSet.add(subscriber);

    return () => {
      topicSet?.delete(subscriber);
      if (topicSet && topicSet.size === 0) {
        this.subscribers.delete(topic);
      }
    };
  }

  /** Subscribe to multiple topics with one handler; returns combined unsubscribe function */
  subscribeMany<T extends EventTopic>(
    topics: readonly T[],
    subscriber: EventSubscriber<T>
  ): () => void {
    const unsubs = topics.map((topic) => this.subscribe(topic, subscriber));
    return () => {
      unsubs.forEach((fn) => fn());
    };
  }

  getSubscriberCount(topic?: EventTopic): number {
    if (topic) return this.subscribers.get(topic)?.size ?? 0;
    let total = 0;
    this.subscribers.forEach((set) => {
      total += set.size;
    });
    return total;
  }
}

export const eventBus = new PubSubBroker();

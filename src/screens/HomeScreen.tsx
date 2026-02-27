import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useAppContext } from '../context/AppContext';
import { Article, RootStackParamList } from '../types';
import { summarizeNews } from '../utils/summarizeNews';

type HomeProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
type FeedMode = 'world' | 'philippines';

type RedditListing = {
  data: {
    children: Array<{
      data: {
        id: string;
        title: string;
        selftext: string;
        url: string;
        subreddit_name_prefixed: string;
        created_utc: number;
      };
    }>;
  };
};

const FEED_URLS: Record<FeedMode, string> = {
  world: 'https://www.reddit.com/r/worldnews/new.json?limit=25',
  philippines: 'https://www.reddit.com/r/Philippines/new.json?limit=25',
};

function toRelativeTime(unixSeconds: number) {
  const secondsAgo = Math.max(1, Math.floor(Date.now() / 1000) - unixSeconds);

  if (secondsAgo < 60) {
    return `${secondsAgo}s ago`;
  }

  const minutesAgo = Math.floor(secondsAgo / 60);
  if (minutesAgo < 60) {
    return `${minutesAgo}m ago`;
  }

  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo < 24) {
    return `${hoursAgo}h ago`;
  }

  const daysAgo = Math.floor(hoursAgo / 24);
  return `${daysAgo}d ago`;
}

export default function HomeScreen({ navigation }: HomeProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [feedMode, setFeedMode] = useState<FeedMode>('world');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { favorites, isFavorite } = useAppContext();
  const visibleArticles = showFavoritesOnly
    ? articles.filter((item) => favorites.includes(item.id))
    : articles;

  const fetchArticles = useCallback(async (showLoader: boolean) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError(null);
    try {
      const response = await fetch(FEED_URLS[feedMode], {
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load live news');
      }

      const json: RedditListing = await response.json();
      const mapped: Article[] = json.data.children.map(({ data }) => {
        const rawBody = data.selftext?.trim() || '';

        return {
          id: data.id,
          title: data.title,
          body: rawBody,
          summary: summarizeNews(data.title, rawBody),
          url: data.url,
          source: data.subreddit_name_prefixed,
          publishedAt: data.created_utc,
        };
      });

      setArticles(mapped);
      setLastUpdated(new Date());
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unknown error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [feedMode]);

  useEffect(() => {
    fetchArticles(true);

    const intervalId = setInterval(() => {
      fetchArticles(false);
    }, 60000);

    return () => clearInterval(intervalId);
  }, [fetchArticles]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Live World News</Text>
        <View style={styles.feedRow}>
          <Pressable
            style={[styles.feedButton, feedMode === 'world' && styles.feedButtonActive]}
            onPress={() => setFeedMode('world')}
          >
            <Text style={[styles.feedButtonText, feedMode === 'world' && styles.feedButtonTextActive]}>
              World
            </Text>
          </Pressable>
          <Pressable
            style={[styles.feedButton, feedMode === 'philippines' && styles.feedButtonActive]}
            onPress={() => setFeedMode('philippines')}
          >
            <Text
              style={[
                styles.feedButtonText,
                feedMode === 'philippines' && styles.feedButtonTextActive,
              ]}
            >
              Philippines
            </Text>
          </Pressable>
        </View>
        <Text style={styles.meta}>Favorites: {favorites.length}</Text>
        <Text style={styles.meta}>
          {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Waiting for first update...'}
        </Text>
        <View style={styles.filterRow}>
          <Pressable
            style={[styles.filterButton, !showFavoritesOnly && styles.filterButtonActive]}
            onPress={() => setShowFavoritesOnly(false)}
          >
            <Text style={[styles.filterButtonText, !showFavoritesOnly && styles.filterButtonTextActive]}>
              All
            </Text>
          </Pressable>
          <Pressable
            style={[styles.filterButton, showFavoritesOnly && styles.filterButtonActive]}
            onPress={() => setShowFavoritesOnly(true)}
          >
            <Text style={[styles.filterButtonText, showFavoritesOnly && styles.filterButtonTextActive]}>
              Favorites
            </Text>
          </Pressable>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.statusText}>Loading articles...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={visibleArticles}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={() => fetchArticles(false)}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {showFavoritesOnly
                ? 'No favorite news yet. Tap "Save to favorites" in details first.'
                : 'No news available right now.'}
            </Text>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.navigate('Details', { article: item })}
              style={styles.card}
            >
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text numberOfLines={2} style={styles.cardBody}>
                {item.summary}
              </Text>
              <Text style={styles.cardMeta}>
                {item.source} • {toRelativeTime(item.publishedAt)}
              </Text>
              <Text style={styles.favoriteMark}>
                {isFavorite(item.id) ? '★ Saved' : '☆ Not saved'}
              </Text>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  meta: {
    marginTop: 4,
    color: '#4b5563',
  },
  feedRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
  },
  feedButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
  },
  feedButtonActive: {
    backgroundColor: '#0f766e',
    borderColor: '#0f766e',
  },
  feedButtonText: {
    color: '#334155',
    fontWeight: '600',
    fontSize: 12,
  },
  feedButtonTextActive: {
    color: '#ffffff',
  },
  filterRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
  },
  filterButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterButtonText: {
    color: '#334155',
    fontWeight: '600',
    fontSize: 12,
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    gap: 12,
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 24,
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  cardBody: {
    color: '#374151',
    lineHeight: 20,
  },
  cardMeta: {
    marginTop: 8,
    color: '#6b7280',
    fontSize: 12,
  },
  favoriteMark: {
    marginTop: 10,
    color: '#2563eb',
    fontWeight: '600',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  statusText: {
    marginTop: 12,
    color: '#374151',
  },
  errorText: {
    color: '#dc2626',
    textAlign: 'center',
  },
});

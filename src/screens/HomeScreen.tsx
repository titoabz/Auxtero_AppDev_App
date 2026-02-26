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

type HomeProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

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

const LIVE_NEWS_URL = 'https://www.reddit.com/r/worldnews/new.json?limit=25';

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
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { favorites, isFavorite } = useAppContext();

  const fetchArticles = useCallback(async (showLoader: boolean) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError(null);
    try {
      const response = await fetch(LIVE_NEWS_URL, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load live news');
      }

      const json: RedditListing = await response.json();
      const mapped: Article[] = json.data.children.map(({ data }) => ({
        id: data.id,
        title: data.title,
        body: data.selftext?.trim() || 'No summary provided. Open source link in details.',
        url: data.url,
        source: data.subreddit_name_prefixed,
        publishedAt: data.created_utc,
      }));

      setArticles(mapped);
      setLastUpdated(new Date());
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unknown error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

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
        <Text style={styles.meta}>Favorites: {favorites.length}</Text>
        <Text style={styles.meta}>
          {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Waiting for first update...'}
        </Text>
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
          data={articles}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={() => fetchArticles(false)}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.navigate('Details', { article: item })}
              style={styles.card}
            >
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text numberOfLines={2} style={styles.cardBody}>
                {item.body}
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
  listContent: {
    padding: 16,
    paddingTop: 8,
    gap: 12,
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

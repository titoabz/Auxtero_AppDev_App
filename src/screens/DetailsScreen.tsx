import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';

import { useAppContext } from '../context/AppContext';
import { RootStackParamList } from '../types';
import { summarizeNews } from '../utils/summarizeNews';

type DetailsProps = NativeStackScreenProps<RootStackParamList, 'Details'>;

export default function DetailsScreen({ route }: DetailsProps) {
  const { article } = route.params;
  const { isFavorite, toggleFavorite } = useAppContext();
  const hasDetails = article.body.trim().length > 0;
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewOrigin, setPreviewOrigin] = useState<'source' | 'reddit' | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchPreview = useCallback(
    async (signal: AbortSignal) => {
      setPreviewLoading(true);
      setPreviewError(null);
      setPreviewOrigin(null);

      const fetchRedditFallback = async () => {
        const redditResponse = await fetch(
          `https://www.reddit.com/comments/${article.id}.json?limit=5&sort=top`,
          { signal }
        );

        if (!redditResponse.ok) {
          setSourcePreview(null);
          setPreviewError('Preview unavailable right now. Open source link for full details.');
          return;
        }

        const redditJson = await redditResponse.json();
        const commentsListing = Array.isArray(redditJson) ? redditJson[1] : null;
        const children = commentsListing?.data?.children;

        const commentBodies = Array.isArray(children)
          ? children
              .map((child) => child?.data?.body)
              .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
              .slice(0, 3)
          : [];

        if (commentBodies.length === 0) {
          setSourcePreview(null);
          setPreviewError('Preview unavailable right now. Open source link for full details.');
          return;
        }

        setSourcePreview(summarizeNews(article.title, commentBodies.join(' '), 320));
        setPreviewOrigin('reddit');
      };

      try {
        const normalizedUrl = article.url.replace(/^https?:\/\//, '');
        const previewEndpoint = `https://r.jina.ai/http://${normalizedUrl}`;
        const response = await fetch(previewEndpoint, { signal });

        if (!response.ok) {
          await fetchRedditFallback();
          return;
        }

        const text = await response.text();
        const cleaned = text
          .replace(/\r/g, '\n')
          .replace(/(^|\n)\s*(Title:|URL Source:|Markdown Content:)\s*/g, '\n')
          .replace(/\n{2,}/g, '\n')
          .replace(/\s+/g, ' ')
          .trim();

        const blockedPattern = /just a moment|warning:|forbidden|captcha|access denied|target url returned error/i;

        if (!cleaned || blockedPattern.test(cleaned)) {
          await fetchRedditFallback();
          return;
        }

        setSourcePreview(summarizeNews(article.title, cleaned, 320));
        setPreviewOrigin('source');
      } catch {
        try {
          await fetchRedditFallback();
        } catch {
          setPreviewError('Could not load preview right now. Please try Refresh preview.');
        }
      } finally {
        setPreviewLoading(false);
      }
    },
    [article.id, article.title, article.url]
  );

  useEffect(() => {
    if (hasDetails) {
      setSourcePreview(null);
      setPreviewError(null);
      return;
    }

    const controller = new AbortController();

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 6000);

    fetchPreview(controller.signal);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [fetchPreview, hasDetails, refreshKey]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{article.title}</Text>
        <Text style={styles.meta}>
          {article.source} • {new Date(article.publishedAt * 1000).toLocaleString()}
        </Text>

        <Text style={styles.sectionTitle}>Summary</Text>
        <Text style={styles.body}>{article.summary}</Text>

        <Text style={styles.sectionTitle}>Details</Text>
        {hasDetails ? (
          <Text style={styles.body}>{article.body}</Text>
        ) : sourcePreview ? (
          <>
            {previewOrigin === 'reddit' && (
              <Text style={styles.previewBadge}>Preview from Reddit discussion</Text>
            )}
            <Text style={styles.body}>{sourcePreview}</Text>
          </>
        ) : previewLoading ? (
          <Text style={styles.fallbackText}>Fetching source preview...</Text>
        ) : (
          <Text style={styles.fallbackText}>
            {previewError || 'No additional details available. Open the source link for the full article.'}
          </Text>
        )}

        {!hasDetails && (
          <Pressable style={styles.refreshPreviewButton} onPress={() => setRefreshKey((value) => value + 1)}>
            <Text style={styles.refreshPreviewText}>Refresh preview</Text>
          </Pressable>
        )}

        <Pressable style={styles.button} onPress={() => toggleFavorite(article.id)}>
          <Text style={styles.buttonText}>
            {isFavorite(article.id) ? 'Remove from favorites' : 'Save to favorites'}
          </Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Source Link</Text>
        <Pressable style={styles.linkButton} onPress={() => Linking.openURL(article.url)}>
          <Text style={styles.linkText}>{article.url}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
  },
  meta: {
    color: '#6b7280',
    fontSize: 13,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  sectionTitle: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  linkButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#eef2ff',
  },
  linkText: {
    color: '#1d4ed8',
    lineHeight: 20,
  },
  fallbackText: {
    color: '#6b7280',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  previewBadge: {
    color: '#1d4ed8',
    fontSize: 12,
    fontWeight: '600',
  },
  refreshPreviewButton: {
    borderWidth: 1,
    borderColor: '#93c5fd',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  refreshPreviewText: {
    color: '#1d4ed8',
    fontSize: 12,
    fontWeight: '600',
  },
});

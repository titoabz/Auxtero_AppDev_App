import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';

import { useAppContext } from '../context/AppContext';
import { RootStackParamList } from '../types';

type DetailsProps = NativeStackScreenProps<RootStackParamList, 'Details'>;

export default function DetailsScreen({ route }: DetailsProps) {
  const { article } = route.params;
  const { isFavorite, toggleFavorite } = useAppContext();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{article.title}</Text>
        <Text style={styles.meta}>
          {article.source} • {new Date(article.publishedAt * 1000).toLocaleString()}
        </Text>
        <Text style={styles.body}>{article.body}</Text>

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
    marginTop: 4,
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
});

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';

import { useAppContext } from '../context/AppContext';
import { RootStackParamList } from '../types';

type DetailsProps = NativeStackScreenProps<RootStackParamList, 'Details'>;

type Comment = {
  id: number;
  body: string;
};

export default function DetailsScreen({ route }: DetailsProps) {
  const { article } = route.params;
  const { isFavorite, toggleFavorite } = useAppContext();
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(
          `https://jsonplaceholder.typicode.com/posts/${article.id}/comments?_limit=3`
        );
        if (!response.ok) {
          return;
        }
        const data: Comment[] = await response.json();
        setComments(data);
      } catch {
      }
    };

    fetchComments();
  }, [article.id]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{article.title}</Text>
        <Text style={styles.body}>{article.body}</Text>

        <Pressable style={styles.button} onPress={() => toggleFavorite(article.id)}>
          <Text style={styles.buttonText}>
            {isFavorite(article.id) ? 'Remove from favorites' : 'Save to favorites'}
          </Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Sample Comments from API</Text>
        {comments.length === 0 ? (
          <Text style={styles.commentText}>No comments loaded.</Text>
        ) : (
          comments.map((comment) => (
            <Text key={comment.id} style={styles.commentText}>
              • {comment.body}
            </Text>
          ))
        )}
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
  commentText: {
    color: '#374151',
    lineHeight: 20,
  },
});

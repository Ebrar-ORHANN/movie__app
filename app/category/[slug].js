// app/category/[slug].js
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_KEY, BASE_URL } from '../../constants/api.js';
import { useLanguage } from '../../contex/LanguageContext.js';
import MovieCard from '../../components/MovieCard.js';

const CATEGORY_ENDPOINTS = {
  'top-rated': 'movie/top_rated',
  'upcoming': 'movie/upcoming',
  'now-playing': 'movie/now_playing',
  'popular': 'movie/popular'
};

const CATEGORY_TITLES = {
  'top-rated': 'home.top_rated',
  'upcoming': 'home.upcoming',
  'now-playing': 'home.now_playing',
  'popular': 'home.popular'
};

export default function CategoryPage() {
  const { slug } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchMovies(1, true);
  }, [slug, language]);

  const fetchMovies = async (pageNum, reset = false) => {
    if (loading || loadingMore) return;
    
    const endpoint = CATEGORY_ENDPOINTS[slug];
    if (!endpoint) return;

    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await axios.get(
        `${BASE_URL}/${endpoint}?api_key=${API_KEY}&language=${language}&page=${pageNum}`
      );

      const newMovies = response.data.results;
      
      if (reset) {
        setMovies(newMovies);
        setPage(1);
      } else {
        setMovies(prev => [...prev, ...newMovies]);
      }

      setPage(pageNum);
      setHasMore(pageNum < response.data.total_pages);
      
    } catch (error) {
      console.error('Filmler yüklenemedi:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !loadingMore) {
      fetchMovies(page + 1);
    }
  };

  const renderMovieItem = ({ item }) => (
    <View style={styles.movieItem}>
      <MovieCard movie={item} />
    </View>
  );

  const renderFooter = () => {
    if (!hasMore) {
      return (
        <View style={styles.endMessage}>
          <Text style={styles.endMessageText}>{t('category.no_more_movies')}</Text>
        </View>
      );
    }

    return (
      <View style={styles.footerContainer}>
        {loadingMore ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>{t('home.loading')}</Text>
          </View>
        ) : (
          <Pressable style={styles.loadMoreButton} onPress={loadMore}>
            <Text style={styles.loadMoreText}>{t('home.load_more')}</Text>
          </Pressable>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>{t('home.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </Pressable>
        <Text style={styles.title}>{t(CATEGORY_TITLES[slug])}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Movies Grid */}
      <FlatList
        data={movies}
        renderItem={renderMovieItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.moviesList}
        ListFooterComponent={renderFooter}
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  moviesList: {
    padding: 16,
  },
  movieItem: {
    flex: 1,
    margin: 8,
    alignItems: 'center',
  },
  footerContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  loadMoreButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loadMoreText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  endMessage: {
    padding: 20,
    alignItems: 'center',
  },
  endMessageText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
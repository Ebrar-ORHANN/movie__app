import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Pressable,
} from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons'; // EKLENDİ

import { API_KEY, BASE_URL } from '../../constants/api.js';
import MovieList from '../../components/MovieList.js';
import SearchBar from '../../components/SearchBar.js';

import { useLanguage } from '../../contex/LanguageContext.js';
import { useAuth } from '../../contex/AuthContext.js'; // EKLENDİ

export default function Home() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { user, logout } = useAuth(); // EKLENDİ
  const router = useRouter();

  const [best, setBest] = useState([]);
  const [soon, setSoon] = useState([]);
  const [nowPlaying, setNowPlaying] = useState([]);
  const [popular, setPopular] = useState([]);

  const [bestPage, setBestPage] = useState(1);
  const [soonPage, setSoonPage] = useState(1);
  const [nowPlayingPage, setNowPlayingPage] = useState(1);
  const [popularPage, setPopularPage] = useState(1);

  const [bestLoading, setBestLoading] = useState(false);
  const [soonLoading, setSoonLoading] = useState(false);
  const [nowPlayingLoading, setNowPlayingLoading] = useState(false);
  const [popularLoading, setPopularLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false); // EKLENDİ

  const onRefresh = () => {
    setRefreshing(true);
    fetchMovies(true).then(() => setRefreshing(false));
  };

  const handleLogout = () => {
    Alert.alert('Çıkış Yap', 'Çıkış yapmak istediğinizden emin misiniz?', [
      {
        text: 'İptal',
        style: 'cancel',
      },
      {
        text: 'Çıkış Yap',
        style: 'destructive',
        onPress: performLogout,
      },
    ]);
  };

  const performLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      setBest([]);
      setSoon([]);
      setNowPlaying([]);
      setPopular([]);
      setSearchQuery('');
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout hatası:', error);
      Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoggingOut(false);
    }
  };

  useEffect(() => {
    fetchMovies(true);
  }, [language]);

  useEffect(() => {
    const allMovies = [...best, ...soon];
    const filtered = allMovies.filter((movie) =>
      movie.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.original_title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredMovies(filtered);
  }, [searchQuery, best, soon]);

  const navigateToCategory = (categorySlug) => {
    router.push(`/category/${categorySlug}`);
  };

  const fetchMovies = async (reset = false) => {
    const langParam = language;
    const currentBestPage = reset ? 1 : bestPage;
    const currentSoonPage = reset ? 1 : soonPage;
    const currentNowPlayingPage = reset ? 1 : nowPlayingPage;
    const currentPopularPage = reset ? 1 : popularPage;

    try {
      const res1 = await axios.get(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=${langParam}&page=${currentBestPage}`);
      const res2 = await axios.get(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=${langParam}&page=${currentSoonPage}`);
      const res3 = await axios.get(`${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=${langParam}&page=${currentNowPlayingPage}`);
      const res4 = await axios.get(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=${langParam}&page=${currentPopularPage}`);

      if (reset) {
        setBest(res1.data.results);
        setSoon(res2.data.results);
        setNowPlaying(res3.data.results);
        setPopular(res4.data.results);
      } else {
        setBest(prev => [...prev, ...res1.data.results]);
        setSoon(prev => [...prev, ...res2.data.results]);
        setNowPlaying(prev => [...prev, ...res3.data.results]);
        setPopular(prev => [...prev, ...res4.data.results]);
      }
    } catch (error) {
      console.error('Film verileri alınamadı:', error);
    }
  };

  const loadMoreMovies = async (category) => {
    if (category === 'best' && !bestLoading) {
      setBestLoading(true);
      const nextPage = bestPage + 1;
      try {
        const res = await axios.get(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=${language}&page=${nextPage}`);
        setBest(prev => [...prev, ...res.data.results]);
        setBestPage(nextPage);
      } catch (error) {
        console.error('En iyi filmler yüklenemedi:', error);
      }
      setBestLoading(false);
    }

    if (category === 'soon' && !soonLoading) {
      setSoonLoading(true);
      const nextPage = soonPage + 1;
      try {
        const res = await axios.get(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=${language}&page=${nextPage}`);
        setSoon(prev => [...prev, ...res.data.results]);
        setSoonPage(nextPage);
      } catch (error) {
        console.error('Yakında gelecek filmler yüklenemedi:', error);
      }
      setSoonLoading(false);
    }

    if (category === 'nowPlaying' && !nowPlayingLoading) {
      setNowPlayingLoading(true);
      const nextPage = nowPlayingPage + 1;
      try {
        const res = await axios.get(`${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=${language}&page=${nextPage}`);
        setNowPlaying(prev => [...prev, ...res.data.results]);
        setNowPlayingPage(nextPage);
      } catch (error) {
        console.error('Şu an gösterimde olan filmler yüklenemedi:', error);
      }
      setNowPlayingLoading(false);
    }

    if (category === 'popular' && !popularLoading) {
      setPopularLoading(true);
      const nextPage = popularPage + 1;
      try {
        const res = await axios.get(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=${language}&page=${nextPage}`);
        setPopular(prev => [...prev, ...res.data.results]);
        setPopularPage(nextPage);
      } catch (error) {
        console.error('Popüler filmler yüklenemedi:', error);
      }
      setPopularLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.welcomeText}>
            {t('home.welcome') || 'Hoş geldin'}, {user?.username || user?.fullName || t('common.user') || 'Kullanıcı'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          style={[styles.logoutButton, loggingOut && styles.logoutButtonDisabled]}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <ActivityIndicator size="small" color="#ff4444" />
          ) : (
            <Ionicons name="log-out-outline" size={24} color="gray" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        {searchQuery ? (
          <>
            <Text style={styles.text}>{t('home.search_results')}</Text>
            <MovieList movies={filteredMovies} />
          </>
        ) : (
          <>
            <Pressable onPress={() => navigateToCategory('top-rated')}>
              <Text style={styles.categoryTitle}>{t('home.top_rated')}</Text>
            </Pressable>
            <MovieList
              movies={best.slice(0, 10)}
              onLoadMore={() => loadMoreMovies('best')}
              loading={bestLoading}
              showLoadMoreButton={false}
            />

            <Pressable onPress={() => navigateToCategory('upcoming')}>
              <Text style={styles.categoryTitle}>{t('home.upcoming')}</Text>
            </Pressable>
            <MovieList
              movies={soon.slice(0, 10)}
              onLoadMore={() => loadMoreMovies('soon')}
              loading={soonLoading}
              showLoadMoreButton={false}
            />

            <Pressable onPress={() => navigateToCategory('now-playing')}>
              <Text style={styles.categoryTitle}>{t('home.now_playing')}</Text>
            </Pressable>
            <MovieList
              movies={nowPlaying.slice(0, 10)}
              onLoadMore={() => loadMoreMovies('nowPlaying')}
              loading={nowPlayingLoading}
              showLoadMoreButton={false}
            />

            <Pressable onPress={() => navigateToCategory('popular')}>
              <Text style={styles.categoryTitle}>{t('home.popular')}</Text>
            </Pressable>
            <MovieList
              movies={popular.slice(0, 10)}
              onLoadMore={() => loadMoreMovies('popular')}
              loading={popularLoading}
              showLoadMoreButton={false}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50,
  },
  text: {
    fontSize: 25,
    margin: 10,
  },
  categoryTitle: {
    fontSize: 25,
    margin: 10,
    color: '#007AFF',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '500',
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f2f2f2',
  },
  logoutButtonDisabled: {
    opacity: 0.5,
  },
});

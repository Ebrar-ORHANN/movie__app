import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_KEY, BASE_URL } from '../../constants/api';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../contex/LanguageContext';
import { useTranslation } from 'react-i18next';
import { useFavorites } from '../../contex/FavoritesContext';

export default function MovieDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { favorites, addFavorite, removeFavorite } = useFavorites();
  
  // movie state'i null olabilir, bu yüzden güvenli kontrol
  const isFav = movie ? favorites.some(f => f.id === movie.id) : false;

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        console.log('Fetching movie details for ID:', id);
        
        // TMDB API'sı için doğru dil formatı
        const tmdbLanguage = language === 'tr' ? 'tr-TR' : 
                            language === 'en' ? 'en-US' : 
                            language;
        
        console.log('Fetching movie details with language:', tmdbLanguage);
        
        const res = await axios.get(
          `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=${tmdbLanguage}`
        );
        
        console.log('Movie details fetched:', res.data);
        setMovie(res.data);
      } catch (error) {
        console.error('Film detayları alınamadı:', error);
        // Hata durumunda kullanıcıya bilgi ver
        alert('Film detayları yüklenemedi');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDetails();
  }, [id, language]);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>{t('movieDetail.loading') || 'Yükleniyor...'}</Text>
      </View>
    );
  }

  if (!movie) {
    return (
      <View style={styles.center}>
        <Text>Film bulunamadı</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.button}>
          <Text>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={() => isFav ? removeFavorite(movie.id) : addFavorite(movie)}
        style={styles.favoriteButton}
      >
        <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={24} color="red" />
      </TouchableOpacity>

      <Image 
        source={{ uri: `https://image.tmdb.org/t/p/w500${movie.backdrop_path}` }} 
        style={styles.backdrop} 
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <Image 
            source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }} 
            style={styles.poster} 
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{movie.title}</Text>
            <Text style={styles.subtitle}>
              {t('movieDetail.release_date') || 'Çıkış Tarihi'}: {movie.release_date}  •  {movie.runtime} {t('movieDetail.minutes') || 'dakika'}
            </Text>
            <Text style={styles.rating}>
              <Ionicons name="star" size={16} color="purple" /> {movie.vote_average?.toFixed(1)}
            </Text>
          </View>
        </View>

        <View style={styles.genres}>
          {movie.genres?.map((genre) => (
            <View key={genre.id} style={styles.genreBadge}>
              <Text style={styles.genreText}>{genre.name}</Text>
            </View>
          ))}
        </View>

        {movie.tagline ? (
          <Text style={styles.tagline}>{movie.tagline}</Text>
        ) : null}

        <Text style={styles.sectionTitle}>{t('movieDetail.summary') || 'Özet'}</Text>
        <Text style={styles.overview}>{movie.overview}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 15,
    zIndex: 10,
    backgroundColor: '#ffffffaa',
    padding: 8,
    borderRadius: 20,
  },
  favoriteButton: {
    position: 'absolute',
    top: 40,
    right: 15,
    zIndex: 10,
    backgroundColor: '#ffffffaa',
    padding: 8,
    borderRadius: 20,
  },
  backdrop: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    marginTop: -60,
  },
  poster: {
    width: 100,
    height: 150,
    borderRadius: 10,
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flexWrap: 'wrap',
    marginTop: 50,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 12,
  },
  rating: {
    fontSize: 16,
    marginTop: 8,
    color: 'purple',
  },
  genres: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 15,
    gap: 8,
  },
  genreBadge: {
    backgroundColor: '#eee',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  genreText: {
    fontSize: 12,
    color: '#333',
  },
  tagline: {
    fontStyle: 'italic',
    color: '#666',
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  overview: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
});
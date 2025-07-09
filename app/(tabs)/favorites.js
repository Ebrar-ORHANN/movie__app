import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useFavorites } from '../../contex/FavoritesContext';
import MovieCard from '../../components/MovieCard';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export default function FavoritesScreen() {
  const { favorites, refreshFavorites } = useFavorites();
  const { t, i18n } = useTranslation();

  // Sayfa odaklandığında favorileri yenile
  useFocusEffect(
    useCallback(() => {
      refreshFavorites(i18n.language);
    }, [refreshFavorites, i18n.language])
  );

  // Dil değiştiğinde favorileri yenile
  useEffect(() => {
    
    refreshFavorites(i18n.language);
  }, [i18n.language, refreshFavorites]);

  if (favorites.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          {t('favorites.empty') || 'Henüz favori film yok'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Üst bilgi alanı */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {t('favorites.title') || 'Favorilerim'}
        </Text>
      
      </View>

      {/* Film listesi */}
      <FlatList
        data={favorites}
        renderItem={({ item }) => (
          <View style={styles.movieCardContainer}>
            <MovieCard movie={item} isGrid={true} />
          </View>
        )}
        keyExtractor={item => item.id.toString()}
        numColumns={3}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        key={i18n.language} // Dil değiştiğinde FlatList'i yeniden render et
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
    paddingHorizontal: 20,
    paddingVertical: 25,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 15
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  listContainer: {
    padding: 15,
    paddingTop: 30,
  },
  movieCardContainer: {
    flex: 1,
    margin: 5,
    maxWidth: '31%',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
});
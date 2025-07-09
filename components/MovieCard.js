import { View, Image, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function MovieCard({ movie, isGrid = false }) {
  const router = useRouter();

  const handlePress = () => {
    console.log('Movie card pressed:', movie.id); // Debug için
    try {
      // Expo Router için doğru yol formatı
      router.push(`/movie/${movie.id}`);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const cardStyle = isGrid ? styles.gridCard : styles.listCard;
  const imageStyle = isGrid ? styles.gridImage : styles.listImage;

  if (!movie) {
    return null;
  }

  return (
    <Pressable onPress={handlePress} style={styles.pressable}>
      <View style={[styles.card, cardStyle]}>
        <Image
          source={{ 
            uri: movie.poster_path 
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
              : 'https://via.placeholder.com/300x450?text=No+Image'
          }}
          style={[styles.image, imageStyle]}
          resizeMode="cover"
        />
        <Text numberOfLines={isGrid ? 2 : 1} style={styles.title}>
          {movie.title || 'Başlık Yok'}
        </Text>
        <Text style={styles.rating}>
          ⭐ {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    // Pressable için stil - touch feedback için
  },
  card: {
   
    alignItems: 'center',
   
  },
  listCard: {
    width: 120,
  },
  gridCard: {
    width: (width - 64) / 3, // 3 columns with padding
    maxWidth: 120,
  },
  image: {
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  listImage: {
    width: 120,
    height: 180,
  },
  gridImage: {
    width: '100%',
    height: 160,
    aspectRatio: 2/3,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
    color: '#333',
  },
  rating: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
});
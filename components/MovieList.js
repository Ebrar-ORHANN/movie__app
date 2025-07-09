import { FlatList } from 'react-native';
import MovieCard from './MovieCard';

export default function MovieList({ movies }) {
  return (
    <FlatList
      horizontal
      data={movies}
      renderItem={({ item }) => <MovieCard movie={item} />}
      keyExtractor={(item) => item.id.toString()}
      showsHorizontalScrollIndicator={false}
    />
  );
}

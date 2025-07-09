import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  // Favorileri yükleme fonksiyonu
  const loadFavorites = async () => {
    try {
      const saved = await AsyncStorage.getItem('@favorites');
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Favoriler yüklenirken hata:', error);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const addFavorite = async (movie) => {
    try {
      const exists = favorites.find(m => m.id === movie.id);
      const newList = exists ? favorites : [...favorites, movie];
      setFavorites(newList);
      await AsyncStorage.setItem('@favorites', JSON.stringify(newList));
    } catch (error) {
      console.error('Favori eklenirken hata:', error);
    }
  };

  const removeFavorite = async (id) => {
    try {
      const newList = favorites.filter(m => m.id !== id);
      setFavorites(newList);
      await AsyncStorage.setItem('@favorites', JSON.stringify(newList));
    } catch (error) {
      console.error('Favori silinirken hata:', error);
    }
  };

  // Favorileri yeniden yükleme fonksiyonu (dil değişimi için)
  const refreshFavorites = () => {
    loadFavorites();
  };

  return (
    <FavoritesContext.Provider value={{ 
      favorites, 
      addFavorite, 
      removeFavorite, 
      refreshFavorites 
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../contex/AuthContext';
import { LanguageProvider } from '../contex/LanguageContext';
import { FavoritesProvider } from '../contex/FavoritesContext';
import '../i18n/i18n'; 

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Auth durumu yüklenene kadar bekle

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Kullanıcı giriş yapmamış ve auth sayfalarında değil -> login'e yönlendir
      router.replace('/login');
    } else if (user && inAuthGroup) {
      // Kullanıcı giriş yapmış ve auth sayfalarında -> ana sayfaya yönlendir
      router.replace('/(tabs)');
    }
  }, [user, segments, loading]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="movie/[id]" />
      <Stack.Screen name="category/[categoryId]" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <FavoritesProvider>
          <RootLayoutNav />
        </FavoritesProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
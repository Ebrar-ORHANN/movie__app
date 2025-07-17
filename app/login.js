import {View,Text,TextInput,TouchableOpacity,StyleSheet,Alert,
        KeyboardAvoidingView,Platform,ScrollView,ActivityIndicator} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contex/AuthContext';

export default function Login() {
  const { t } = useTranslation();
  const router = useRouter();
  const { loginWithTMDB } = useAuth();
  
  const [tmdbUsername, setTmdbUsername] = useState('');
  const [tmdbPassword, setTmdbPassword] = useState('');
  const [showTmdbPassword, setShowTmdbPassword] = useState(false);
  const [tmdbLoading, setTmdbLoading] = useState(false);

  // TMDB giriş işlemi
  const handleTMDBLogin = async () => {
    if (!tmdbUsername.trim() || !tmdbPassword.trim()) {
      Alert.alert('Hata', 'TMDB kullanıcı adı ve şifre gerekli');
      return;
    }

    setTmdbLoading(true);
    
    try {
      console.log('TMDB giriş işlemi başlatılıyor...');
      const response = await loginWithTMDB(tmdbUsername, tmdbPassword);
      console.log('TMDB giriş yanıtı:', response);
      
      if (response.success) {
        // Başarılı giriş - direk yönlendir
        console.log('TMDB giriş başarılı, yönlendiriliyor...');
        router.replace('/(tabs)');
      } else {
        Alert.alert('Hata', response.message);
      }
    } catch (error) {
      console.error('TMDB giriş hatası:', error);
      Alert.alert('Hata', 'Ağ hatası oluştu');
    } finally {
      setTmdbLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="film" size={50} color="#007AFF" />
          <Text style={styles.title}>{t('login.welcome')}</Text>
          
        </View>

        {/* TMDB Login Form */}
        <View style={styles.form}>
          {/* TMDB Username Input */}
          <View style={styles.inputContainer}>
            <View style={styles.input}>
              <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder={t('login.username_placeholder')}
                value={tmdbUsername}
                onChangeText={setTmdbUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* TMDB Password Input */}
          <View style={styles.inputContainer}>
            <View style={styles.input}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
               placeholder={t('login.passwordplaceholder')}
                value={tmdbPassword}
                onChangeText={setTmdbPassword}
                secureTextEntry={!showTmdbPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowTmdbPassword(!showTmdbPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showTmdbPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* TMDB Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, tmdbLoading && styles.loginButtonDisabled]}
            onPress={handleTMDBLogin}
            disabled={tmdbLoading}
          >
            {tmdbLoading ? (
              <ActivityIndicator color="#007AFF" />
            ) : (
              <Text style={styles.loginButtonText}>{t('login.tmdb_login_button')}</Text>
            )}
          </TouchableOpacity>

          {/* Info Text */}
          <Text style={styles.infoText}>
            {t('login.tmdb_login_message_bottom')}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 5,
  },
  loginButton: {
    backgroundColor: '#01B4E4',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 15,
    lineHeight: 18,
  },
});
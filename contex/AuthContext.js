import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getRequestToken,
  validateLoginWithToken,
  createSession,
} from '../constants/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  // TMDB ile giriş fonksiyonu - DÜZELTİLMİŞ
  const loginWithTMDB = async (username, password) => {
    try {
      console.log('TMDB giriş başlatılıyor...');
      
      // 1. Request token al
      const token = await getRequestToken();
      console.log('Token alındı:', token);

      if (!token) {
        return { success: false, message: 'Token alınamadı' };
      }

      // 2. Token'ı kullanıcı bilgileri ile doğrula
      const validated = await validateLoginWithToken(username, password, token);
      console.log('Doğrulama sonucu:', validated);

      // TMDB API doğrulama kontrolü düzeltildi
      if (!validated || !validated.success) {
        return { 
          success: false, 
          message: validated?.status_message || 'TMDB kullanıcı adı veya şifre hatalı' 
        };
      }

      // 3. Session oluştur
      const session = await createSession(token);
      console.log('Session sonucu:', session);

      if (session && session.success) {
        const tmdbUser = {
          id: `tmdb_${username}`,
          tmdb: true,
          username,
          sessionId: session.session_id,
          fullName: username,
          email: '', 
          loggedInAt: new Date().toISOString(),
        };
        
        setUser(tmdbUser);
        await AsyncStorage.setItem('user', JSON.stringify(tmdbUser));
        
        console.log('TMDB kullanıcı kaydedildi:', tmdbUser);
        return { success: true, message: 'TMDB ile giriş başarılı' };
      }

      return { 
        success: false, 
        message: session?.status_message || 'Oturum oluşturulamadı' 
      };
    } catch (error) {
      console.error('TMDB giriş hatası:', error);
      return { 
        success: false, 
        message: error.message || 'TMDB giriş hatası' 
      };
    }
  };

  const checkAuthState = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        console.log('Mevcut kullanıcı bulundu:', parsedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Auth state check error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Kullanıcı kayıt işlemi
  const register = async (userData) => {
    try {
      const existingUsers = await getStoredUsers();
      
      const userExists = existingUsers.some(user => user.email === userData.email);
      if (userExists) {
        throw new Error('Bu email adresi zaten kayıtlı');
      }

      const newUser = {
        id: Date.now().toString(), 
        fullName: userData.fullName,
        email: userData.email,
        password: userData.password, 
        createdAt: new Date().toISOString(),
      };

      const updatedUsers = [...existingUsers, newUser];
      await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));

      return { success: true, message: 'Kayıt başarılı' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // Normal kullanıcı giriş işlemi
  const login = async (email, password) => {
    try {
      // Demo hesap kontrolü
      if (email === 'demo@example.com' && password === '123456') {
        const demoUser = {
          id: 'demo',
          fullName: 'Demo User',
          email: 'demo@example.com',
          createdAt: new Date().toISOString(),
        };
        setUser(demoUser);
        await AsyncStorage.setItem('user', JSON.stringify(demoUser));
        return { success: true, message: 'Giriş başarılı' };
      }

      const existingUsers = await getStoredUsers();
      const foundUser = existingUsers.find(
        user => user.email === email && user.password === password
      );

      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        await AsyncStorage.setItem('user', JSON.stringify(userWithoutPassword));
        return { success: true, message: 'Giriş başarılı' };
      } else {
        return { success: false, message: 'Email veya şifre hatalı' };
      }
    } catch (error) {
      return { success: false, message: 'Giriş sırasında hata oluştu' };
    }
  };

  // Kullanıcı çıkış işlemi
  const logout = async () => {
    try {
      setUser(null);
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Kayıtlı kullanıcıları getir
  const getStoredUsers = async () => {
    try {
      const users = await AsyncStorage.getItem('users');
      return users ? JSON.parse(users) : [];
    } catch (error) {
      console.error('Error getting stored users:', error);
      return [];
    }
  };

  // Kullanıcı profil güncelleme
  const updateProfile = async (updatedData) => {
    try {
      const updatedUser = { ...user, ...updatedData };
      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

      // TMDB kullanıcısıysa users listesinde güncelleme yapma
      if (!user.tmdb) {
        const existingUsers = await getStoredUsers();
        const updatedUsers = existingUsers.map(u => 
          u.id === user.id ? { ...u, ...updatedData } : u
        );
        await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
      }

      return { success: true, message: 'Profil güncellendi' };
    } catch (error) {
      return { success: false, message: 'Profil güncellenirken hata oluştu' };
    }
  };

  // Şifre değiştirme
  const changePassword = async (currentPassword, newPassword) => {
    try {
      // TMDB kullanıcıları için şifre değiştirme desteklenmiyor
      if (user.tmdb) {
        return { 
          success: false, 
          message: 'TMDB kullanıcıları şifrelerini TMDB sitesinden değiştirebilir' 
        };
      }

      const existingUsers = await getStoredUsers();
      const userIndex = existingUsers.findIndex(u => u.id === user.id);
      
      if (userIndex === -1) {
        return { success: false, message: 'Kullanıcı bulunamadı' };
      }

      if (existingUsers[userIndex].password !== currentPassword) {
        return { success: false, message: 'Mevcut şifre hatalı' };
      }

      existingUsers[userIndex].password = newPassword;
      await AsyncStorage.setItem('users', JSON.stringify(existingUsers));

      return { success: true, message: 'Şifre başarıyla değiştirildi' };
    } catch (error) {
      return { success: false, message: 'Şifre değiştirilirken hata oluştu' };
    }
  };

  // Debug - tüm kullanıcıları göster
  const getAllUsers = async () => {
    try {
      const users = await getStoredUsers();
      console.log('Stored users:', users);
      return users;
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  };

  // Hesap silme
  const deleteAccount = async () => {
    try {
      // TMDB kullanıcısı değilse users listesinden kaldır
      if (!user.tmdb) {
        const existingUsers = await getStoredUsers();
        const updatedUsers = existingUsers.filter(u => u.id !== user.id);
        await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
      }
      
      await logout();
      return { success: true, message: 'Hesap silindi' };
    } catch (error) {
      return { success: false, message: 'Hesap silinirken hata oluştu' };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    deleteAccount,
    getAllUsers,
    loginWithTMDB, 
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
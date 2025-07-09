import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contex/LanguageContext';

export default function Settings() {
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();

  const handleLanguageChange = async (lang) => {
    console.log('Changing language from', language, 'to', lang);
    
    try {
      await changeLanguage(lang);
      console.log('Language changed successfully to:', lang);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{t('settings.language')}</Text>
      
      {['tr', 'en'].map((lang) => (
        <Pressable
          key={lang}
          onPress={() => handleLanguageChange(lang)}
          style={[
            styles.languageButton,
            {
              backgroundColor: language === lang ? '#007AFF' : '#f0f0f0',
            }
          ]}
        >
          <Text style={[
            styles.languageButtonText,
            {
              color: language === lang ? '#fff' : '#000',
            }
          ]}>
            {t(`settings.${lang}`)}
          </Text>
        </Pressable>
      ))}
      
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  text: {
    fontSize: 20,
    marginTop: 50,
    marginBottom: 20,
    
  },
  languageButton: {
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  languageButtonText: {
    fontSize: 16,
    textAlign: 'center',
  },
  currentLanguage: {
    marginTop: 20,
    fontSize: 14,
    color: '#666',
  },
});
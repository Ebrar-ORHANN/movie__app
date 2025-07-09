import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
export default function SearchBar({ searchQuery, setSearchQuery }) {
   const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={t('search.title')}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      
    </View>
  );
}
"Film Keşfi..🔍"
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  input: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 10,
    fontSize: 16,
  },

 
});

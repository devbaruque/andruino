import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

export default function LibrariesScreen({navigation}) {
  const libraries = [
    {
      id: 1,
      name: 'Servo',
      version: '1.1.8',
      installed: true,
      description: 'Controle de servo motores',
    },
    {
      id: 2,
      name: 'DHT sensor library',
      version: '1.4.4',
      installed: true,
      description: 'Biblioteca para sensores DHT',
    },
    {
      id: 3,
      name: 'LiquidCrystal',
      version: '1.0.7',
      installed: false,
      description: 'Display LCD 16x2',
    },
    {
      id: 4,
      name: 'WiFi',
      version: '1.2.7',
      installed: false,
      description: 'Conectividade WiFi para ESP32',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bibliotecas</Text>
        <TouchableOpacity style={styles.updateButton}>
          <Text style={styles.updateButtonText}>Atualizar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.librariesList}>
        {libraries.map(library => (
          <View key={library.id} style={styles.libraryItem}>
            <View style={styles.libraryInfo}>
              <Text style={styles.libraryName}>{library.name}</Text>
              <Text style={styles.libraryDescription}>
                {library.description}
              </Text>
              <Text style={styles.libraryVersion}>v{library.version}</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.actionButton,
                {backgroundColor: library.installed ? '#e74c3c' : '#27ae60'},
              ]}>
              <Text style={styles.actionButtonText}>
                {library.installed ? 'Remover' : 'Instalar'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c3e50',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#34495e',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ecf0f1',
  },
  updateButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  updateButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  librariesList: {
    flex: 1,
    padding: 20,
  },
  libraryItem: {
    backgroundColor: '#34495e',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  libraryInfo: {
    flex: 1,
  },
  libraryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ecf0f1',
    marginBottom: 5,
  },
  libraryDescription: {
    fontSize: 14,
    color: '#bdc3c7',
    marginBottom: 5,
  },
  libraryVersion: {
    fontSize: 12,
    color: '#95a5a6',
  },
  actionButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    marginLeft: 10,
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

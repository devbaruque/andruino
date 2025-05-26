import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useAuth} from '../../contexts';

export default function SettingsScreen({navigation}) {
  const [autoSave, setAutoSave] = React.useState(true);
  const [showLineNumbers, setShowLineNumbers] = React.useState(true);
  const [autoIndent, setAutoIndent] = React.useState(true);
  const {signOut, user} = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da sua conta?',
      [
        {text: 'Cancelar', style: 'cancel'},
        {text: 'Sair', style: 'destructive', onPress: performLogout}
      ]
    );
  };

  const performLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      Alert.alert('Erro', 'Falha ao fazer logout. Tente novamente.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Configurações</Text>
      </View>

      <ScrollView style={styles.settingsList}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conta</Text>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Email</Text>
            <Text style={styles.settingValue}>{user?.email || 'Não informado'}</Text>
          </View>

          <TouchableOpacity
            style={[styles.settingItem, styles.logoutButton]}
            onPress={handleLogout}>
            <Text style={[styles.settingLabel, styles.logoutText]}>Sair da conta</Text>
            <Text style={styles.settingValue}>🚪</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Editor</Text>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Salvamento automático</Text>
            <Switch
              value={autoSave}
              onValueChange={setAutoSave}
              trackColor={{false: '#34495e', true: '#3498db'}}
              thumbColor={autoSave ? '#ffffff' : '#bdc3c7'}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Mostrar números das linhas</Text>
            <Switch
              value={showLineNumbers}
              onValueChange={setShowLineNumbers}
              trackColor={{false: '#34495e', true: '#3498db'}}
              thumbColor={showLineNumbers ? '#ffffff' : '#bdc3c7'}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Indentação automática</Text>
            <Switch
              value={autoIndent}
              onValueChange={setAutoIndent}
              trackColor={{false: '#34495e', true: '#3498db'}}
              thumbColor={autoIndent ? '#ffffff' : '#bdc3c7'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('Donation')}>
            <Text style={styles.settingLabel}>Apoiar o projeto</Text>
            <Text style={styles.settingValue}>💝</Text>
          </TouchableOpacity>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Versão</Text>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>
        </View>
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#34495e',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ecf0f1',
  },
  settingsList: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 15,
  },
  settingItem: {
    backgroundColor: '#34495e',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    color: '#ecf0f1',
    flex: 1,
  },
  settingValue: {
    fontSize: 16,
    color: '#bdc3c7',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
  },
  logoutText: {
    color: '#ecf0f1',
  },
});

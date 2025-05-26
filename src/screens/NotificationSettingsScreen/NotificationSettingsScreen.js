import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, typography, spacing} from '../../theme';
import {Button} from '../../components';
import NotificationService from '../../services/NotificationService/NotificationService';

export default function NotificationSettingsScreen({navigation}) {
  const [settings, setSettings] = useState({
    compilationNotifications: true,
    uploadNotifications: true,
    errorNotifications: true,
    libraryNotifications: true,
    soundEnabled: true,
    vibrationEnabled: true,
  });
  const [notificationHistory, setNotificationHistory] = useState([]);

  useEffect(() => {
    loadSettings();
    loadNotificationHistory();
  }, []);

  // Carregar configurações
  const loadSettings = async () => {
    try {
      const currentSettings = NotificationService.getSettings();
      setSettings(currentSettings);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  // Carregar histórico de notificações
  const loadNotificationHistory = () => {
    const history = NotificationService.getNotificationHistory();
    setNotificationHistory(history.slice(0, 20)); // Últimas 20 notificações
  };

  // Atualizar configuração
  const updateSetting = async (key, value) => {
    const newSettings = {...settings, [key]: value};
    setSettings(newSettings);
    
    try {
      await NotificationService.updateSettings(newSettings);
      
      // Mostrar notificação de teste se habilitou uma categoria
      if (value) {
        testNotification(key);
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      Alert.alert('Erro', 'Não foi possível salvar as configurações');
    }
  };

  // Testar notificação
  const testNotification = (type) => {
    switch (type) {
      case 'compilationNotifications':
        NotificationService.showCompilationNotification('success', 'Teste de notificação de compilação');
        break;
      case 'uploadNotifications':
        NotificationService.showUploadNotification('success', 'Teste de notificação de upload');
        break;
      case 'errorNotifications':
        NotificationService.showErrorNotification('Teste', 'Esta é uma notificação de erro de teste');
        break;
      case 'libraryNotifications':
        NotificationService.showLibraryNotification('installed', 'BibliotecaTeste');
        break;
    }
  };

  // Limpar histórico
  const clearHistory = () => {
    Alert.alert(
      'Limpar Histórico',
      'Tem certeza que deseja limpar todo o histórico de notificações?',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: () => {
            NotificationService.clearHistory();
            setNotificationHistory([]);
            NotificationService.showInfoNotification('Histórico', 'Histórico de notificações limpo');
          },
        },
      ]
    );
  };

  // Testar todas as notificações
  const testAllNotifications = () => {
    NotificationService.showInfoNotification('Teste', 'Testando sistema de notificações...');
    
    setTimeout(() => {
      NotificationService.showCompilationNotification('start');
    }, 1000);
    
    setTimeout(() => {
      NotificationService.showCompilationNotification('success');
    }, 2000);
    
    setTimeout(() => {
      NotificationService.showUploadNotification('start');
    }, 3000);
    
    setTimeout(() => {
      NotificationService.showUploadNotification('success', 'Teste concluído!');
    }, 4000);
  };

  // Formatar timestamp
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  // Obter ícone do tipo de notificação
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📱';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Configurações de Notificação</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Configurações principais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 Tipos de Notificação</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Compilação</Text>
              <Text style={styles.settingDescription}>
                Notificações sobre compilação de código
              </Text>
            </View>
            <Switch
              value={settings.compilationNotifications}
              onValueChange={(value) => updateSetting('compilationNotifications', value)}
              trackColor={{false: colors.border.primary, true: colors.primary}}
              thumbColor={colors.background.primary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Upload</Text>
              <Text style={styles.settingDescription}>
                Notificações sobre upload para Arduino
              </Text>
            </View>
            <Switch
              value={settings.uploadNotifications}
              onValueChange={(value) => updateSetting('uploadNotifications', value)}
              trackColor={{false: colors.border.primary, true: colors.primary}}
              thumbColor={colors.background.primary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Erros</Text>
              <Text style={styles.settingDescription}>
                Notificações de erro e problemas
              </Text>
            </View>
            <Switch
              value={settings.errorNotifications}
              onValueChange={(value) => updateSetting('errorNotifications', value)}
              trackColor={{false: colors.border.primary, true: colors.primary}}
              thumbColor={colors.background.primary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Bibliotecas</Text>
              <Text style={styles.settingDescription}>
                Notificações sobre instalação de bibliotecas
              </Text>
            </View>
            <Switch
              value={settings.libraryNotifications}
              onValueChange={(value) => updateSetting('libraryNotifications', value)}
              trackColor={{false: colors.border.primary, true: colors.primary}}
              thumbColor={colors.background.primary}
            />
          </View>
        </View>

        {/* Configurações de som e vibração */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔊 Som e Vibração</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Som</Text>
              <Text style={styles.settingDescription}>
                Reproduzir som nas notificações
              </Text>
            </View>
            <Switch
              value={settings.soundEnabled}
              onValueChange={(value) => updateSetting('soundEnabled', value)}
              trackColor={{false: colors.border.primary, true: colors.primary}}
              thumbColor={colors.background.primary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Vibração</Text>
              <Text style={styles.settingDescription}>
                Vibrar o dispositivo nas notificações
              </Text>
            </View>
            <Switch
              value={settings.vibrationEnabled}
              onValueChange={(value) => updateSetting('vibrationEnabled', value)}
              trackColor={{false: colors.border.primary, true: colors.primary}}
              thumbColor={colors.background.primary}
            />
          </View>
        </View>

        {/* Testes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧪 Testes</Text>
          
          <Button
            title="Testar Todas as Notificações"
            onPress={testAllNotifications}
            style={styles.testButton}
          />
          
          <Text style={styles.testDescription}>
            Executa uma sequência de notificações de teste para verificar se estão funcionando corretamente.
          </Text>
        </View>

        {/* Histórico de notificações */}
        <View style={styles.section}>
          <View style={styles.historyHeader}>
            <Text style={styles.sectionTitle}>📋 Histórico Recente</Text>
            <TouchableOpacity onPress={clearHistory}>
              <Text style={styles.clearButton}>Limpar</Text>
            </TouchableOpacity>
          </View>
          
          {notificationHistory.length > 0 ? (
            <View style={styles.historyList}>
              {notificationHistory.map((notification, index) => (
                <View key={notification.id || index} style={styles.historyItem}>
                  <View style={styles.historyIcon}>
                    <Text style={styles.historyIconText}>
                      {getNotificationIcon(notification.type)}
                    </Text>
                  </View>
                  <View style={styles.historyContent}>
                    <Text style={styles.historyTitle}>{notification.title}</Text>
                    <Text style={styles.historyMessage} numberOfLines={2}>
                      {notification.message}
                    </Text>
                    <Text style={styles.historyTime}>
                      {formatTimestamp(notification.timestamp)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyHistory}>
              <Text style={styles.emptyHistoryText}>
                Nenhuma notificação no histórico
              </Text>
            </View>
          )}
        </View>

        {/* Informações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ Informações</Text>
          <Text style={styles.infoText}>
            • As notificações ajudam a acompanhar o progresso das operações
          </Text>
          <Text style={styles.infoText}>
            • Notificações de erro são sempre mostradas, independente das configurações
          </Text>
          <Text style={styles.infoText}>
            • O histórico mantém as últimas 50 notificações
          </Text>
          <Text style={styles.infoText}>
            • As configurações são salvas automaticamente
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: spacing.borderWidth.thin,
    borderBottomColor: colors.border.primary,
    backgroundColor: colors.background.secondary,
  },
  backButton: {
    marginRight: spacing.md,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: spacing.borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: spacing.borderWidth.thin,
    borderColor: colors.border.primary,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  settingDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.tight,
  },
  testButton: {
    marginBottom: spacing.md,
  },
  testDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.relaxed,
    fontStyle: 'italic',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  clearButton: {
    color: colors.accent,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  historyList: {
    backgroundColor: colors.background.secondary,
    borderRadius: spacing.borderRadius.md,
    borderWidth: spacing.borderWidth.thin,
    borderColor: colors.border.primary,
  },
  historyItem: {
    flexDirection: 'row',
    padding: spacing.md,
    borderBottomWidth: spacing.borderWidth.thin,
    borderBottomColor: colors.border.primary,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  historyIconText: {
    fontSize: typography.fontSize.lg,
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  historyMessage: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.tight,
    marginBottom: spacing.xs,
  },
  historyTime: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  emptyHistory: {
    backgroundColor: colors.background.secondary,
    padding: spacing.xl,
    borderRadius: spacing.borderRadius.md,
    borderWidth: spacing.borderWidth.thin,
    borderColor: colors.border.primary,
    alignItems: 'center',
  },
  emptyHistoryText: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.relaxed,
    marginBottom: spacing.xs,
  },
}); 
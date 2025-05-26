import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform, Alert} from 'react-native';

class NotificationService {
  constructor() {
    this.isInitialized = false;
    this.notificationQueue = [];
    this.settings = {
      compilationNotifications: true,
      uploadNotifications: true,
      errorNotifications: true,
      libraryNotifications: true,
      soundEnabled: true,
      vibrationEnabled: true,
    };
  }

  // Inicializar o serviço
  async initialize() {
    try {
      // Carregar configurações salvas
      await this.loadSettings();
      
      // Configurar notificações locais
      if (Platform.OS === 'android') {
        await this.setupAndroidNotifications();
      } else if (Platform.OS === 'ios') {
        await this.setupIOSNotifications();
      }

      this.isInitialized = true;
      console.log('NotificationService inicializado');
      return true;
    } catch (error) {
      console.error('Erro ao inicializar NotificationService:', error);
      return false;
    }
  }

  // Configurar notificações Android
  async setupAndroidNotifications() {
    try {
      // Configuração básica para Android
      // Em um projeto real, seria necessário configurar o react-native-push-notification
      console.log('Configurações Android carregadas');
    } catch (error) {
      console.error('Erro ao configurar notificações Android:', error);
    }
  }

  // Configurar notificações iOS
  async setupIOSNotifications() {
    try {
      // Configuração básica para iOS
      console.log('Configurações iOS carregadas');
    } catch (error) {
      console.error('Erro ao configurar notificações iOS:', error);
    }
  }

  // Carregar configurações
  async loadSettings() {
    try {
      const savedSettings = await AsyncStorage.getItem('notification_settings');
      if (savedSettings) {
        this.settings = {...this.settings, ...JSON.parse(savedSettings)};
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de notificação:', error);
    }
  }

  // Salvar configurações
  async saveSettings() {
    try {
      await AsyncStorage.setItem('notification_settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Erro ao salvar configurações de notificação:', error);
    }
  }

  // Atualizar configurações
  async updateSettings(newSettings) {
    this.settings = {...this.settings, ...newSettings};
    await this.saveSettings();
  }

  // Obter configurações
  getSettings() {
    return {...this.settings};
  }

  // Mostrar notificação de compilação
  showCompilationNotification(type, message, details = null) {
    if (!this.settings.compilationNotifications) return;

    const notifications = {
      start: {
        title: '🔨 Compilando...',
        message: 'Iniciando compilação do código Arduino',
        type: 'info',
      },
      success: {
        title: '✅ Compilação Concluída',
        message: message || 'Código compilado com sucesso!',
        type: 'success',
      },
      error: {
        title: '❌ Erro de Compilação',
        message: message || 'Falha na compilação do código',
        type: 'error',
      },
      warning: {
        title: '⚠️ Aviso de Compilação',
        message: message || 'Compilação concluída com avisos',
        type: 'warning',
      },
    };

    const notification = notifications[type];
    if (notification) {
      this.showNotification(notification.title, notification.message, notification.type, details);
    }
  }

  // Mostrar notificação de upload
  showUploadNotification(type, message, progress = null) {
    if (!this.settings.uploadNotifications) return;

    const notifications = {
      start: {
        title: '📤 Enviando...',
        message: 'Iniciando upload para o Arduino',
        type: 'info',
      },
      progress: {
        title: '📤 Enviando...',
        message: `Upload em progresso: ${progress}%`,
        type: 'info',
      },
      success: {
        title: '✅ Upload Concluído',
        message: message || 'Código enviado com sucesso!',
        type: 'success',
      },
      error: {
        title: '❌ Erro no Upload',
        message: message || 'Falha no envio do código',
        type: 'error',
      },
    };

    const notification = notifications[type];
    if (notification) {
      this.showNotification(notification.title, notification.message, notification.type);
    }
  }

  // Mostrar notificação de biblioteca
  showLibraryNotification(type, libraryName, message = null) {
    if (!this.settings.libraryNotifications) return;

    const notifications = {
      installing: {
        title: '📚 Instalando Biblioteca',
        message: `Instalando ${libraryName}...`,
        type: 'info',
      },
      installed: {
        title: '✅ Biblioteca Instalada',
        message: `${libraryName} instalada com sucesso!`,
        type: 'success',
      },
      uninstalled: {
        title: '🗑️ Biblioteca Removida',
        message: `${libraryName} removida com sucesso!`,
        type: 'info',
      },
      error: {
        title: '❌ Erro na Biblioteca',
        message: message || `Erro ao processar ${libraryName}`,
        type: 'error',
      },
    };

    const notification = notifications[type];
    if (notification) {
      this.showNotification(notification.title, notification.message, notification.type);
    }
  }

  // Mostrar notificação de erro
  showErrorNotification(title, message, details = null) {
    if (!this.settings.errorNotifications) return;
    this.showNotification(`❌ ${title}`, message, 'error', details);
  }

  // Mostrar notificação de sucesso
  showSuccessNotification(title, message) {
    this.showNotification(`✅ ${title}`, message, 'success');
  }

  // Mostrar notificação de informação
  showInfoNotification(title, message) {
    this.showNotification(`ℹ️ ${title}`, message, 'info');
  }

  // Mostrar notificação de aviso
  showWarningNotification(title, message) {
    this.showNotification(`⚠️ ${title}`, message, 'warning');
  }

  // Mostrar notificação genérica
  showNotification(title, message, type = 'info', details = null) {
    if (!this.isInitialized) {
      console.log(`Notificação: ${title} - ${message}`);
      return;
    }

    // Para desenvolvimento, usar Alert simples
    // Em produção, seria usado react-native-push-notification
    const fullMessage = details ? `${message}\n\nDetalhes: ${details}` : message;
    
    // Adicionar à fila de notificações
    const notification = {
      id: Date.now(),
      title,
      message: fullMessage,
      type,
      timestamp: new Date(),
    };

    this.notificationQueue.push(notification);

    // Limitar fila a 50 notificações
    if (this.notificationQueue.length > 50) {
      this.notificationQueue = this.notificationQueue.slice(-50);
    }

    // Mostrar notificação
    this.displayNotification(notification);
  }

  // Exibir notificação
  displayNotification(notification) {
    // Para desenvolvimento, usar Alert
    // Em produção, seria usado sistema de notificação nativo
    if (Platform.OS === 'web') {
      console.log(`${notification.title}: ${notification.message}`);
    } else {
      // Mostrar apenas notificações importantes como Alert
      if (notification.type === 'error') {
        Alert.alert(notification.title, notification.message);
      } else {
        // Para outros tipos, apenas log (em produção seria notificação silenciosa)
        console.log(`${notification.title}: ${notification.message}`);
      }
    }
  }

  // Obter histórico de notificações
  getNotificationHistory() {
    return [...this.notificationQueue].reverse(); // Mais recentes primeiro
  }

  // Limpar histórico
  clearHistory() {
    this.notificationQueue = [];
  }

  // Mostrar notificação de conexão USB
  showUSBNotification(type, deviceInfo = null) {
    const notifications = {
      connected: {
        title: '🔌 Dispositivo Conectado',
        message: deviceInfo ? 
          `${deviceInfo.name || 'Arduino'} conectado na porta ${deviceInfo.port}` :
          'Dispositivo Arduino conectado',
        type: 'success',
      },
      disconnected: {
        title: '🔌 Dispositivo Desconectado',
        message: 'Arduino desconectado',
        type: 'info',
      },
      error: {
        title: '❌ Erro de Conexão',
        message: 'Falha na conexão com o dispositivo',
        type: 'error',
      },
    };

    const notification = notifications[type];
    if (notification) {
      this.showNotification(notification.title, notification.message, notification.type);
    }
  }

  // Mostrar notificação de projeto
  showProjectNotification(type, projectName, message = null) {
    const notifications = {
      saved: {
        title: '💾 Projeto Salvo',
        message: `${projectName} salvo com sucesso!`,
        type: 'success',
      },
      loaded: {
        title: '📂 Projeto Carregado',
        message: `${projectName} carregado com sucesso!`,
        type: 'info',
      },
      created: {
        title: '📝 Projeto Criado',
        message: `${projectName} criado com sucesso!`,
        type: 'success',
      },
      deleted: {
        title: '🗑️ Projeto Removido',
        message: `${projectName} removido com sucesso!`,
        type: 'info',
      },
      error: {
        title: '❌ Erro no Projeto',
        message: message || `Erro ao processar ${projectName}`,
        type: 'error',
      },
    };

    const notification = notifications[type];
    if (notification) {
      this.showNotification(notification.title, notification.message, notification.type);
    }
  }
}

// Instância singleton
const notificationService = new NotificationService();

export default notificationService; 
import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, typography, spacing} from '../../theme';
import {Button, LibraryManager, SerialChart, PerformanceMonitor} from '../../components';

// Importar serviços
import USBService from '../../services/USBService/USBService';
import CompilerService from '../../services/CompilerService/CompilerService';
import BoardService from '../../services/BoardService/BoardService';
import FileService from '../../services/FileService/FileService';
import ProjectService from '../../services/ProjectService/ProjectService';
import NotificationService from '../../services/NotificationService/NotificationService';

export default function EditorScreen() {
  // Estados principais
  const [code, setCode] = useState('');
  const [consoleOutput, setConsoleOutput] = useState('Andruino IDE - Pronto\n');
  const [isConnected, setIsConnected] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [detectedBoard, setDetectedBoard] = useState(null);
  
  // Estados do modal de dispositivos
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [availableDevices, setAvailableDevices] = useState([]);
  const [isScanning, setIsScanning] = useState(false);

  // Estados do monitor serial
  const [serialData, setSerialData] = useState('');
  const [serialInput, setSerialInput] = useState('');
  const [showSerialMonitor, setShowSerialMonitor] = useState(false);
  const [showSerialChart, setShowSerialChart] = useState(false);
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);

  // Estados do gerenciador de bibliotecas
  const [showLibraryManager, setShowLibraryManager] = useState(false);
  const [projectLibraries, setProjectLibraries] = useState([]);

  // Refs
  const consoleRef = useRef(null);
  const serialRef = useRef(null);

  // Inicialização
  useEffect(() => {
    initializeServices();
    setupListeners();
    
    return () => {
      cleanupListeners();
    };
  }, []);

  // Inicializar serviços
  const initializeServices = async () => {
    try {
      // Inicializar NotificationService primeiro
      await NotificationService.initialize();
      NotificationService.showInfoNotification('Sistema', 'Andruino IDE iniciado');
      
      await FileService.initialize();
      
      // Carregar projeto atual se existir
      const project = FileService.getCurrentProject();
      if (project) {
        setCurrentProject(project);
        setCode(project.code);
        addToConsole(`Projeto carregado: ${project.name}`);
        NotificationService.showProjectNotification('loaded', project.name);
        
        // Carregar bibliotecas do projeto
        if (project.libraries) {
          setProjectLibraries(project.libraries);
          addToConsole(`Carregadas ${project.libraries.length} bibliotecas do projeto`);
        }
      } else {
        // Criar projeto padrão com nome único
        const timestamp = new Date().toLocaleString('pt-BR');
        const projectName = `Novo Projeto ${timestamp}`;
        const defaultProject = await FileService.createProject(projectName);
        setCurrentProject(defaultProject);
        setCode(defaultProject.code);
        addToConsole('Novo projeto criado');
        NotificationService.showProjectNotification('created', projectName);
      }
    } catch (error) {
      console.error('Erro ao inicializar serviços:', error);
      addToConsole(`Erro: ${error.message}`);
      NotificationService.showErrorNotification('Inicialização', error.message);
    }
  };

  // Configurar listeners
  const setupListeners = () => {
    // Listeners USB
    USBService.addConnectionListener(handleUSBConnection);
    USBService.addDataListener(handleSerialData);
    USBService.addUploadListener(handleUploadProgress);

    // Listeners de compilação
    CompilerService.addListener(handleCompilationProgress);
  };

  // Limpar listeners
  const cleanupListeners = () => {
    USBService.removeConnectionListener(handleUSBConnection);
    USBService.removeDataListener(handleSerialData);
    USBService.removeUploadListener(handleUploadProgress);
    CompilerService.removeListener(handleCompilationProgress);
  };

  // Manipular conexão USB
  const handleUSBConnection = (event, data) => {
    switch (event) {
      case 'connected':
        setIsConnected(true);
        addToConsole(`Conectado: ${data.devicePath} (${data.baudRate} baud)`);
        NotificationService.showUSBNotification('connected', {
          name: data.deviceName,
          port: data.devicePath
        });
        break;
      case 'disconnected':
        setIsConnected(false);
        addToConsole('Dispositivo desconectado');
        NotificationService.showUSBNotification('disconnected');
        break;
      case 'error':
        addToConsole(`Erro de conexão: ${data.error}`);
        NotificationService.showUSBNotification('error');
        break;
    }
  };

  // Manipular dados seriais
  const handleSerialData = (event, data) => {
    if (event === 'data') {
      setSerialData(prev => prev + data.data);
    } else if (event === 'bufferCleared') {
      setSerialData('');
    }
  };

  // Manipular progresso de upload
  const handleUploadProgress = (event, data) => {
    switch (event) {
      case 'start':
        setIsUploading(true);
        addToConsole('Iniciando upload...');
        NotificationService.showUploadNotification('start');
        break;
      case 'progress':
        addToConsole(`${data.message} (${data.progress}%)`);
        NotificationService.showUploadNotification('progress', data.message, data.progress);
        break;
      case 'complete':
        setIsUploading(false);
        addToConsole(`Upload concluído! (${data.size} bytes)`);
        NotificationService.showUploadNotification('success', `Upload concluído (${data.size} bytes)`);
        break;
      case 'error':
        setIsUploading(false);
        addToConsole(`Erro no upload: ${data.error}`);
        NotificationService.showUploadNotification('error', data.error);
        break;
    }
  };

  // Manipular progresso de compilação
  const handleCompilationProgress = (event, data) => {
    switch (event) {
      case 'start':
        setIsCompiling(true);
        addToConsole('Iniciando compilação...');
        NotificationService.showCompilationNotification('start');
        break;
      case 'progress':
        addToConsole(`${data.message} (${data.progress}%)`);
        break;
      case 'complete':
        setIsCompiling(false);
        addToConsole('Compilação concluída!');
        if (data.warnings && data.warnings.length > 0) {
          data.warnings.forEach(warning => addToConsole(`Aviso: ${warning}`));
          NotificationService.showCompilationNotification('warning', `Compilação concluída com ${data.warnings.length} avisos`);
        } else {
          NotificationService.showCompilationNotification('success');
        }
        break;
      case 'error':
        setIsCompiling(false);
        addToConsole(`Erro de compilação: ${data.error}`);
        NotificationService.showCompilationNotification('error', data.error);
        break;
    }
  };

  // Adicionar texto ao console
  const addToConsole = (text) => {
    const timestamp = new Date().toLocaleTimeString();
    setConsoleOutput(prev => `${prev}[${timestamp}] ${text}\n`);
    
    // Auto-scroll para o final
    setTimeout(() => {
      consoleRef.current?.scrollToEnd({animated: true});
    }, 100);
  };

  // Salvar projeto
  const saveProject = async () => {
    if (!currentProject) return;

    try {
      await FileService.saveCurrentProject(code, detectedBoard?.id);
      addToConsole('Projeto salvo');
      NotificationService.showProjectNotification('saved', currentProject.name);
    } catch (error) {
      addToConsole(`Erro ao salvar: ${error.message}`);
      NotificationService.showProjectNotification('error', currentProject.name, error.message);
    }
  };

  // Compilar código
  const compileCode = async () => {
    if (isCompiling) return;

    try {
      await saveProject();
      const result = await CompilerService.compile(code, detectedBoard?.id);
      
      if (result.success) {
        // Armazenar binário para upload posterior
        currentProject.compiledBinary = result.binary;
        currentProject.boardConfig = result.boardConfig;
      }
    } catch (error) {
      addToConsole(`Erro na compilação: ${error.message}`);
      NotificationService.showCompilationNotification('error', error.message);
    }
  };

  // Upload do código
  const uploadCode = async () => {
    if (!isConnected) {
      const errorMsg = 'Conecte-se a um dispositivo primeiro';
      Alert.alert('Erro', errorMsg);
      NotificationService.showErrorNotification('Upload', errorMsg);
      return;
    }

    if (!currentProject?.compiledBinary) {
      const errorMsg = 'Compile o código primeiro';
      Alert.alert('Erro', errorMsg);
      NotificationService.showErrorNotification('Upload', errorMsg);
      return;
    }

    try {
      await USBService.uploadCode(
        currentProject.compiledBinary,
        currentProject.boardConfig
      );
    } catch (error) {
      Alert.alert('Erro no Upload', error.message);
      NotificationService.showUploadNotification('error', error.message);
    }
  };

  // Compilar e fazer upload
  const compileAndUpload = async () => {
    try {
      await compileCode();
      
      // Aguardar compilação terminar
      const checkCompilation = () => {
        if (!CompilerService.getCompilationStatus()) {
          if (currentProject?.compiledBinary) {
            uploadCode();
          }
        } else {
          setTimeout(checkCompilation, 500);
        }
      };
      
      checkCompilation();
    } catch (error) {
      addToConsole(`Erro: ${error.message}`);
      NotificationService.showErrorNotification('Compilação e Upload', error.message);
    }
  };

  // Escanear dispositivos
  const scanDevices = async () => {
    setIsScanning(true);
    try {
      const devices = await USBService.listDevices();
      setAvailableDevices(devices);
      
      if (devices.length > 0) {
        // Auto-detectar placa
        const board = await BoardService.detectBoard(devices);
        if (board) {
          setDetectedBoard(board);
          addToConsole(`Placa detectada: ${board.name} (${Math.round(board.confidence * 100)}% confiança)`);
          NotificationService.showInfoNotification('Detecção', `Placa detectada: ${board.name}`);
        }
      } else {
        NotificationService.showWarningNotification('Dispositivos', 'Nenhum dispositivo Arduino encontrado');
      }
    } catch (error) {
      addToConsole(`Erro ao escanear dispositivos: ${error.message}`);
      NotificationService.showErrorNotification('Escaneamento', error.message);
    } finally {
      setIsScanning(false);
    }
  };

  // Conectar a dispositivo
  const connectToDevice = async (device) => {
    try {
      await USBService.connect(device.path, device.boardInfo?.uploadSpeed || 9600);
      setShowDeviceModal(false);
    } catch (error) {
      Alert.alert('Erro de Conexão', error.message);
      NotificationService.showUSBNotification('error');
    }
  };

  // Desconectar dispositivo
  const disconnectDevice = async () => {
    try {
      await USBService.disconnect();
    } catch (error) {
      addToConsole(`Erro ao desconectar: ${error.message}`);
      NotificationService.showErrorNotification('Desconexão', error.message);
    }
  };

  // Enviar dados seriais
  const sendSerialData = async () => {
    if (!serialInput.trim()) return;

    try {
      await USBService.sendData(serialInput + '\n');
      setSerialInput('');
    } catch (error) {
      addToConsole(`Erro ao enviar dados: ${error.message}`);
      NotificationService.showErrorNotification('Monitor Serial', error.message);
    }
  };

  // Limpar console
  const clearConsole = () => {
    setConsoleOutput('Andruino IDE - Console limpo\n');
  };

  // Limpar monitor serial
  const clearSerialMonitor = () => {
    USBService.clearBuffer();
    setSerialData('');
  };

  // Gerenciar bibliotecas do projeto
  const handleLibrariesChange = async (newLibraries) => {
    setProjectLibraries(newLibraries);
    
    // Salvar bibliotecas no projeto
    if (currentProject) {
      try {
        await ProjectService.updateProject(currentProject.id, {
          libraries: newLibraries
        });
        addToConsole(`Bibliotecas atualizadas: ${newLibraries.length} bibliotecas`);
        NotificationService.showInfoNotification('Bibliotecas', `${newLibraries.length} bibliotecas configuradas`);
      } catch (error) {
        console.error('Erro ao salvar bibliotecas:', error);
        addToConsole(`Erro ao salvar bibliotecas: ${error.message}`);
        NotificationService.showErrorNotification('Bibliotecas', error.message);
      }
    }
  };

  // Carregar bibliotecas do projeto
  const loadProjectLibraries = async () => {
    if (currentProject && currentProject.libraries) {
      setProjectLibraries(currentProject.libraries);
      addToConsole(`Carregadas ${currentProject.libraries.length} bibliotecas do projeto`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Toolbar */}
      <View style={styles.toolbar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.toolbarButton, isCompiling && styles.toolbarButtonDisabled]}
            onPress={compileCode}
            disabled={isCompiling}>
            <Text style={styles.toolbarButtonText}>
              {isCompiling ? 'Compilando...' : 'Verificar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolbarButton, (!isConnected || isUploading) && styles.toolbarButtonDisabled]}
            onPress={compileAndUpload}
            disabled={!isConnected || isUploading}>
            <Text style={styles.toolbarButtonText}>
              {isUploading ? 'Enviando...' : 'Carregar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={() => setShowDeviceModal(true)}>
            <Text style={styles.toolbarButtonText}>
              {isConnected ? 'Conectado' : 'Conectar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={() => setShowSerialMonitor(!showSerialMonitor)}>
            <Text style={styles.toolbarButtonText}>Monitor Serial</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolbarButton, showSerialChart && styles.toolbarButtonActive]}
            onPress={() => setShowSerialChart(!showSerialChart)}>
            <Text style={[styles.toolbarButtonText, showSerialChart && styles.toolbarButtonTextActive]}>
              📊 Gráfico
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolbarButton, showPerformanceMonitor && styles.toolbarButtonActive]}
            onPress={() => setShowPerformanceMonitor(!showPerformanceMonitor)}>
            <Text style={[styles.toolbarButtonText, showPerformanceMonitor && styles.toolbarButtonTextActive]}>
              ⚡ Performance
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolbarButton} onPress={saveProject}>
            <Text style={styles.toolbarButtonText}>Salvar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.toolbarButton} 
            onPress={() => setShowLibraryManager(true)}
          >
            <Text style={styles.toolbarButtonText}>
              Bibliotecas ({projectLibraries.length})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Informações da placa */}
      {detectedBoard && (
        <View style={styles.boardInfo}>
          <Text style={styles.boardInfoText}>
            Placa: {detectedBoard.name} | MCU: {detectedBoard.mcu}
          </Text>
        </View>
      )}

      {/* Editor de código */}
      <View style={styles.editorContainer}>
        <Text style={styles.sectionTitle}>
          {currentProject?.name || 'Editor'} {currentProject?.size ? `(${currentProject.size} bytes)` : ''}
        </Text>
        <TextInput
          style={styles.codeEditor}
          value={code}
          onChangeText={setCode}
          multiline
          placeholder="Digite seu código Arduino aqui..."
          placeholderTextColor={colors.text.placeholder}
          textAlignVertical="top"
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
        />
      </View>

      {/* Console */}
      <View style={styles.consoleContainer}>
        <View style={styles.consoleHeader}>
          <Text style={styles.sectionTitle}>Console</Text>
          <TouchableOpacity onPress={clearConsole}>
            <Text style={styles.clearButton}>Limpar</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          ref={consoleRef}
          style={styles.console}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.consoleText}>{consoleOutput}</Text>
        </ScrollView>
      </View>

      {/* Monitor Serial */}
      {showSerialMonitor && (
        <View style={styles.serialContainer}>
          <View style={styles.consoleHeader}>
            <Text style={styles.sectionTitle}>Monitor Serial</Text>
            <TouchableOpacity onPress={clearSerialMonitor}>
              <Text style={styles.clearButton}>Limpar</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            ref={serialRef}
            style={styles.serialMonitor}
            showsVerticalScrollIndicator={false}>
            <Text style={styles.consoleText}>{serialData}</Text>
          </ScrollView>
          <View style={styles.serialInputContainer}>
            <TextInput
              style={styles.serialInput}
              value={serialInput}
              onChangeText={setSerialInput}
              placeholder="Digite comando..."
              placeholderTextColor={colors.text.placeholder}
              onSubmitEditing={sendSerialData}
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendSerialData}>
              <Text style={styles.sendButtonText}>Enviar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Performance Monitor */}
      <PerformanceMonitor
        isVisible={showPerformanceMonitor}
        onToggle={() => setShowPerformanceMonitor(!showPerformanceMonitor)}
      />

      {/* Serial Chart */}
      <SerialChart
        isVisible={showSerialChart}
        serialData={serialData}
        onToggle={() => setShowSerialChart(!showSerialChart)}
      />

      {/* Modal de dispositivos */}
      <Modal
        visible={showDeviceModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDeviceModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Dispositivos USB</Text>
            
            <Button
              title={isScanning ? 'Escaneando...' : 'Escanear Dispositivos'}
              onPress={scanDevices}
              disabled={isScanning}
              style={styles.scanButton}
            />

            <ScrollView style={styles.deviceList}>
              {availableDevices.map((device, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.deviceItem}
                  onPress={() => connectToDevice(device)}>
                  <Text style={styles.deviceName}>
                    {device.boardInfo?.name || 'Dispositivo Desconhecido'}
                  </Text>
                  <Text style={styles.deviceDetails}>
                    VID: {device.vendorId.toString(16).toUpperCase()} | 
                    PID: {device.productId.toString(16).toUpperCase()}
                  </Text>
                  <Text style={styles.devicePath}>{device.path}</Text>
                </TouchableOpacity>
              ))}
              
              {availableDevices.length === 0 && !isScanning && (
                <Text style={styles.noDevicesText}>
                  Nenhum dispositivo Arduino encontrado
                </Text>
              )}
            </ScrollView>

            {isConnected && (
              <Button
                title="Desconectar"
                onPress={disconnectDevice}
                variant="danger"
                style={styles.disconnectButton}
              />
            )}

            <Button
              title="Fechar"
              onPress={() => setShowDeviceModal(false)}
              variant="secondary"
            />
          </View>
        </View>
      </Modal>

      {/* Gerenciador de Bibliotecas */}
      <LibraryManager
        visible={showLibraryManager}
        onClose={() => setShowLibraryManager(false)}
        projectLibraries={projectLibraries}
        onLibrariesChange={handleLibrariesChange}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  toolbar: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: spacing.borderWidth.thin,
    borderBottomColor: colors.border.primary,
  },
  toolbarButton: {
    backgroundColor: colors.button.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: spacing.borderRadius.sm,
    borderWidth: spacing.borderWidth.thin,
    borderColor: colors.border.primary,
  },
  toolbarButtonDisabled: {
    opacity: 0.5,
  },
  toolbarButtonText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  boardInfo: {
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderBottomWidth: spacing.borderWidth.thin,
    borderBottomColor: colors.border.primary,
  },
  boardInfoText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
  },
  editorContainer: {
    flex: 2,
    margin: spacing.md,
  },
  sectionTitle: {
    color: colors.text.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  codeEditor: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    color: colors.text.primary,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.mono,
    padding: spacing.md,
    borderRadius: spacing.borderRadius.md,
    borderWidth: spacing.borderWidth.thin,
    borderColor: colors.border.primary,
    textAlignVertical: 'top',
  },
  consoleContainer: {
    flex: 1,
    margin: spacing.md,
    marginTop: 0,
  },
  consoleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  clearButton: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
  },
  console: {
    backgroundColor: colors.background.tertiary,
    padding: spacing.md,
    borderRadius: spacing.borderRadius.md,
    borderWidth: spacing.borderWidth.thin,
    borderColor: colors.border.primary,
    maxHeight: 150,
  },
  consoleText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.mono,
    lineHeight: typography.lineHeight.tight,
  },
  serialContainer: {
    flex: 1,
    margin: spacing.md,
    marginTop: 0,
  },
  serialMonitor: {
    backgroundColor: colors.background.tertiary,
    padding: spacing.md,
    borderRadius: spacing.borderRadius.md,
    borderWidth: spacing.borderWidth.thin,
    borderColor: colors.border.primary,
    maxHeight: 120,
  },
  serialInputContainer: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  serialInput: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    color: colors.text.primary,
    padding: spacing.md,
    borderRadius: spacing.borderRadius.md,
    borderWidth: spacing.borderWidth.thin,
    borderColor: colors.border.primary,
    marginRight: spacing.sm,
  },
  sendButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: spacing.borderRadius.md,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    margin: spacing.xl,
    padding: spacing.xl,
    borderRadius: spacing.borderRadius.lg,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  scanButton: {
    marginBottom: spacing.lg,
  },
  deviceList: {
    maxHeight: 300,
    marginBottom: spacing.lg,
  },
  deviceItem: {
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: spacing.borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: spacing.borderWidth.thin,
    borderColor: colors.border.primary,
  },
  deviceName: {
    color: colors.text.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  deviceDetails: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },
  devicePath: {
    color: colors.text.tertiary,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.mono,
    marginTop: spacing.xs,
  },
  noDevicesText: {
    color: colors.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: spacing.xl,
  },
  disconnectButton: {
    marginBottom: spacing.md,
  },
  toolbarButtonActive: {
    backgroundColor: colors.button.active,
  },
  toolbarButtonTextActive: {
    color: colors.text.active,
  },
});

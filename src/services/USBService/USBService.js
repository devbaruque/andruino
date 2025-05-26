// import {TurboSerialPort} from '@serserm/react-native-turbo-serialport';
import BoardService from '../BoardService/BoardService';

// Mock da biblioteca USB para testes
const TurboSerialPort = {
  getDeviceList: () => Promise.resolve([]),
};

class USBService {
  constructor() {
    this.port = null;
    this.isConnected = false;
    this.isUploading = false;
    this.connectionListeners = [];
    this.dataListeners = [];
    this.uploadListeners = [];
    this.serialBuffer = '';
    this.maxBufferSize = 10000; // Máximo de caracteres no buffer
  }

  // Listar dispositivos USB disponíveis
  async listDevices() {
    try {
      // Simular dispositivos para teste
      const mockDevices = [
        {
          path: '/dev/ttyUSB0',
          vendorId: 0x2341,
          productId: 0x0043,
        },
        {
          path: '/dev/ttyUSB1', 
          vendorId: 0x1A86,
          productId: 0x7523,
        }
      ];
      
      // Filtrar apenas dispositivos Arduino conhecidos
      const arduinoDevices = mockDevices.filter(device => {
        return BoardService.isArduinoDevice(device.vendorId, device.productId);
      });

      return arduinoDevices.map(device => ({
        ...device,
        boardInfo: BoardService.getBoardByIds(device.vendorId, device.productId),
      }));
    } catch (error) {
      console.error('Erro ao listar dispositivos:', error);
      throw new Error('Falha ao listar dispositivos USB');
    }
  }

  // Conectar ao dispositivo
  async connect(devicePath, baudRate = 9600) {
    if (this.isConnected) {
      throw new Error('Já conectado a um dispositivo');
    }

    try {
      // Simular conexão
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.isConnected = true;
      
      this.notifyConnectionListeners('connected', {
        devicePath,
        baudRate,
      });

      return true;
    } catch (error) {
      console.error('Erro ao conectar:', error);
      this.port = null;
      throw new Error(`Falha na conexão: ${error.message}`);
    }
  }

  // Desconectar
  async disconnect() {
    if (!this.isConnected) {
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      this.handleDisconnect();
    } catch (error) {
      console.error('Erro ao desconectar:', error);
      this.handleDisconnect();
    }
  }

  // Enviar dados
  async sendData(data) {
    if (!this.isConnected) {
      throw new Error('Não conectado a nenhum dispositivo');
    }

    try {
      // Simular envio
      console.log('Enviando dados:', data);
      return true;
    } catch (error) {
      console.error('Erro ao enviar dados:', error);
      throw new Error(`Falha ao enviar dados: ${error.message}`);
    }
  }

  // Upload de código compilado
  async uploadCode(binary, boardConfig, progressCallback = null) {
    if (this.isUploading) {
      throw new Error('Upload já em andamento');
    }

    if (!this.isConnected) {
      throw new Error('Dispositivo não conectado');
    }

    this.isUploading = true;
    this.notifyUploadListeners('start', {message: 'Iniciando upload...'});

    try {
      // Simular upload
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        
        if (progressCallback) progressCallback(i);
        this.notifyUploadListeners('progress', {
          message: `Enviando dados... ${i}%`,
          progress: i,
        });
      }

      this.notifyUploadListeners('complete', {
        message: 'Upload concluído com sucesso!',
        progress: 100,
        size: binary.length,
      });

      return true;
    } catch (error) {
      this.notifyUploadListeners('error', {
        error: error.message,
        message: `Erro no upload: ${error.message}`,
      });
      throw error;
    } finally {
      this.isUploading = false;
    }
  }

  // Manipular dados recebidos
  handleSerialData(data) {
    const text = typeof data === 'string' ? data : new TextDecoder().decode(data);
    
    // Adicionar ao buffer
    this.serialBuffer += text;
    
    // Limitar tamanho do buffer
    if (this.serialBuffer.length > this.maxBufferSize) {
      this.serialBuffer = this.serialBuffer.slice(-this.maxBufferSize);
    }
    
    // Notificar listeners
    this.notifyDataListeners('data', {
      data: text,
      buffer: this.serialBuffer,
    });
  }

  // Manipular desconexão
  handleDisconnect() {
    this.isConnected = false;
    this.port = null;
    this.isUploading = false;
    
    this.notifyConnectionListeners('disconnected', {});
  }

  // Limpar buffer serial
  clearBuffer() {
    this.serialBuffer = '';
    this.notifyDataListeners('bufferCleared', {});
  }

  // Obter buffer atual
  getBuffer() {
    return this.serialBuffer;
  }

  // Status da conexão
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      isUploading: this.isUploading,
      hasPort: !!this.port,
    };
  }

  // Listeners para conexão
  addConnectionListener(callback) {
    this.connectionListeners.push(callback);
  }

  removeConnectionListener(callback) {
    this.connectionListeners = this.connectionListeners.filter(
      listener => listener !== callback,
    );
  }

  notifyConnectionListeners(event, data) {
    this.connectionListeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.warn('Erro no listener de conexão:', error);
      }
    });
  }

  // Listeners para dados
  addDataListener(callback) {
    this.dataListeners.push(callback);
  }

  removeDataListener(callback) {
    this.dataListeners = this.dataListeners.filter(
      listener => listener !== callback,
    );
  }

  notifyDataListeners(event, data) {
    this.dataListeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.warn('Erro no listener de dados:', error);
      }
    });
  }

  // Listeners para upload
  addUploadListener(callback) {
    this.uploadListeners.push(callback);
  }

  removeUploadListener(callback) {
    this.uploadListeners = this.uploadListeners.filter(
      listener => listener !== callback,
    );
  }

  notifyUploadListeners(event, data) {
    this.uploadListeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.warn('Erro no listener de upload:', error);
      }
    });
  }
}

export default new USBService();

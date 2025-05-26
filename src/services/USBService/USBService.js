import {TurboSerialPort} from '@serserm/react-native-turbo-serialport';
import BoardService from '../BoardService/BoardService';

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

  // Listar dispositivos USB disponíveis - IMPLEMENTAÇÃO REAL
  async listDevices() {
    try {
      const devices = await TurboSerialPort.getDeviceList();
      
      // Filtrar apenas dispositivos Arduino conhecidos
      const arduinoDevices = devices.filter(device => {
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

  // Conectar ao dispositivo - IMPLEMENTAÇÃO REAL
  async connect(devicePath, baudRate = 9600) {
    if (this.isConnected) {
      throw new Error('Já conectado a um dispositivo');
    }

    try {
      // Solicitar permissão USB
      const hasPermission = await TurboSerialPort.requestPermission(devicePath);
      if (!hasPermission) {
        throw new Error('Permissão USB negada');
      }

      // Abrir porta serial
      this.port = await TurboSerialPort.open(devicePath, {
        baudRate,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        flowControl: false,
      });

      // Configurar listener para dados recebidos
      this.port.onReceived((data) => {
        this.handleSerialData(data);
      });

      // Configurar listener para desconexão
      this.port.onDisconnected(() => {
        this.handleDisconnect();
      });

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

  // Enviar dados - IMPLEMENTAÇÃO REAL
  async sendData(data) {
    if (!this.isConnected || !this.port) {
      throw new Error('Não conectado a nenhum dispositivo');
    }

    try {
      await this.port.write(data);
      return true;
    } catch (error) {
      console.error('Erro ao enviar dados:', error);
      throw new Error(`Falha ao enviar dados: ${error.message}`);
    }
  }

  // Upload de código compilado - IMPLEMENTAÇÃO REAL
  async uploadCode(hexFile, boardConfig, progressCallback = null) {
    if (this.isUploading) {
      throw new Error('Upload já em andamento');
    }

    if (!this.isConnected || !this.port) {
      throw new Error('Dispositivo não conectado');
    }

    this.isUploading = true;
    this.notifyUploadListeners('start', {message: 'Iniciando upload...'});

    try {
      // Reset da placa antes do upload
      await this.resetBoard(boardConfig);
      
      this.notifyUploadListeners('progress', {
        message: 'Placa resetada, iniciando protocolo...',
        progress: 10,
      });

      // Implementar protocolo STK500 para Arduino Uno/Nano
      if (boardConfig.protocol === 'stk500v1' || boardConfig.protocol === 'arduino') {
        await this.uploadSTK500(hexFile, boardConfig, progressCallback);
      }
      // Implementar protocolo para ESP32/ESP8266
      else if (boardConfig.protocol === 'esptool') {
        await this.uploadESP(hexFile, boardConfig, progressCallback);
      }
      else {
        throw new Error(`Protocolo ${boardConfig.protocol} não suportado`);
      }

      this.notifyUploadListeners('complete', {
        message: 'Upload concluído com sucesso!',
        progress: 100,
        size: hexFile.length,
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

  // Reset da placa Arduino
  async resetBoard(boardConfig) {
    try {
      // Para Arduino Uno/Nano - toggle DTR
      if (boardConfig.resetMethod === 'dtr') {
        await this.port.setDTR(false);
        await new Promise(resolve => setTimeout(resolve, 100));
        await this.port.setDTR(true);
        await new Promise(resolve => setTimeout(resolve, 100));
        await this.port.setDTR(false);
      }
      // Para ESP32/ESP8266 - sequência de reset específica
      else if (boardConfig.resetMethod === 'esp') {
        await this.port.setDTR(false);
        await this.port.setRTS(true);
        await new Promise(resolve => setTimeout(resolve, 100));
        await this.port.setDTR(true);
        await this.port.setRTS(false);
        await new Promise(resolve => setTimeout(resolve, 50));
        await this.port.setDTR(false);
      }

      // Aguardar bootloader
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.warn('Erro no reset da placa:', error);
      // Continuar mesmo com erro de reset
    }
  }

  // Upload usando protocolo STK500 (Arduino Uno/Nano)
  async uploadSTK500(hexFile, boardConfig, progressCallback) {
    const STK_OK = 0x10;
    const STK_INSYNC = 0x14;
    const STK_GET_SYNC = 0x30;
    const STK_LOAD_ADDRESS = 0x55;
    const STK_PROG_PAGE = 0x64;
    const STK_LEAVE_PROGMODE = 0x51;

    // Converter HEX para binário
    const binaryData = this.hexToBinary(hexFile);
    const totalBytes = binaryData.length;
    let uploadedBytes = 0;

    // Sincronizar com bootloader
    await this.stk500Sync();
    
    this.notifyUploadListeners('progress', {
      message: 'Sincronizado com bootloader...',
      progress: 20,
    });

    // Upload em páginas de 128 bytes
    const pageSize = 128;
    let address = 0;

    for (let i = 0; i < binaryData.length; i += pageSize) {
      const page = binaryData.slice(i, i + pageSize);
      
      // Definir endereço
      await this.stk500SetAddress(address);
      
      // Programar página
      await this.stk500ProgramPage(page);
      
      address += pageSize / 2; // Endereço em words
      uploadedBytes += page.length;
      
      const progress = 20 + Math.floor((uploadedBytes / totalBytes) * 70);
      
      if (progressCallback) progressCallback(progress);
      this.notifyUploadListeners('progress', {
        message: `Enviando dados... ${Math.floor((uploadedBytes / totalBytes) * 100)}%`,
        progress,
      });
    }

    // Sair do modo de programação
    await this.stk500LeaveProgMode();
    
    this.notifyUploadListeners('progress', {
      message: 'Finalizando upload...',
      progress: 95,
    });
  }

  // Sincronizar com bootloader STK500
  async stk500Sync() {
    const STK_GET_SYNC = 0x30;
    const STK_CRC_EOP = 0x20;
    const STK_INSYNC = 0x14;
    const STK_OK = 0x10;

    for (let attempts = 0; attempts < 10; attempts++) {
      try {
        await this.port.write(Buffer.from([STK_GET_SYNC, STK_CRC_EOP]));
        
        const response = await this.waitForResponse(2, 1000);
        if (response[0] === STK_INSYNC && response[1] === STK_OK) {
          return true;
        }
      } catch (error) {
        // Tentar novamente
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error('Falha na sincronização com bootloader');
  }

  // Definir endereço para programação
  async stk500SetAddress(address) {
    const STK_LOAD_ADDRESS = 0x55;
    const STK_CRC_EOP = 0x20;
    const STK_INSYNC = 0x14;
    const STK_OK = 0x10;

    const addressLow = address & 0xFF;
    const addressHigh = (address >> 8) & 0xFF;

    await this.port.write(Buffer.from([
      STK_LOAD_ADDRESS,
      addressLow,
      addressHigh,
      STK_CRC_EOP
    ]));

    const response = await this.waitForResponse(2, 1000);
    if (response[0] !== STK_INSYNC || response[1] !== STK_OK) {
      throw new Error('Erro ao definir endereço');
    }
  }

  // Programar página de dados
  async stk500ProgramPage(pageData) {
    const STK_PROG_PAGE = 0x64;
    const STK_CRC_EOP = 0x20;
    const STK_INSYNC = 0x14;
    const STK_OK = 0x10;

    const command = Buffer.concat([
      Buffer.from([
        STK_PROG_PAGE,
        (pageData.length >> 8) & 0xFF, // Tamanho high
        pageData.length & 0xFF,         // Tamanho low
        0x46                            // Tipo: Flash
      ]),
      pageData,
      Buffer.from([STK_CRC_EOP])
    ]);

    await this.port.write(command);

    const response = await this.waitForResponse(2, 5000);
    if (response[0] !== STK_INSYNC || response[1] !== STK_OK) {
      throw new Error('Erro ao programar página');
    }
  }

  // Sair do modo de programação
  async stk500LeaveProgMode() {
    const STK_LEAVE_PROGMODE = 0x51;
    const STK_CRC_EOP = 0x20;
    const STK_INSYNC = 0x14;
    const STK_OK = 0x10;

    await this.port.write(Buffer.from([STK_LEAVE_PROGMODE, STK_CRC_EOP]));

    const response = await this.waitForResponse(2, 1000);
    if (response[0] !== STK_INSYNC || response[1] !== STK_OK) {
      throw new Error('Erro ao sair do modo de programação');
    }
  }

  // Aguardar resposta do bootloader
  async waitForResponse(expectedBytes, timeout = 1000) {
    return new Promise((resolve, reject) => {
      let buffer = Buffer.alloc(0);
      let timeoutId;

      const onData = (data) => {
        buffer = Buffer.concat([buffer, Buffer.from(data)]);
        
        if (buffer.length >= expectedBytes) {
          clearTimeout(timeoutId);
          this.port.removeListener('data', onData);
          resolve(buffer.slice(0, expectedBytes));
        }
      };

      timeoutId = setTimeout(() => {
        this.port.removeListener('data', onData);
        reject(new Error('Timeout aguardando resposta do bootloader'));
      }, timeout);

      this.port.on('data', onData);
    });
  }

  // Converter arquivo HEX Intel para binário
  hexToBinary(hexFile) {
    const lines = hexFile.split('\n').filter(line => line.trim().length > 0);
    const binaryData = [];
    let baseAddress = 0;

    for (const line of lines) {
      if (!line.startsWith(':')) continue;

      const byteCount = parseInt(line.substr(1, 2), 16);
      const address = parseInt(line.substr(3, 4), 16) + baseAddress;
      const recordType = parseInt(line.substr(7, 2), 16);
      const data = line.substr(9, byteCount * 2);

      switch (recordType) {
        case 0x00: // Data Record
          for (let i = 0; i < byteCount; i++) {
            const byte = parseInt(data.substr(i * 2, 2), 16);
            binaryData[address + i] = byte;
          }
          break;
        case 0x04: // Extended Linear Address Record
          baseAddress = parseInt(data, 16) << 16;
          break;
        case 0x01: // End of File Record
          break;
      }
    }

    // Converter array esparso para Uint8Array
    const maxAddress = Math.max(...Object.keys(binaryData).map(Number));
    const result = new Uint8Array(maxAddress + 1);
    
    for (let i = 0; i <= maxAddress; i++) {
      result[i] = binaryData[i] || 0xFF; // Preencher com 0xFF (flash apagada)
    }

    return result;
  }

  // Upload para ESP32/ESP8266 (implementação básica)
  async uploadESP(hexFile, boardConfig, progressCallback) {
    // Implementação simplificada do protocolo esptool
    // Na prática, seria necessário implementar o protocolo completo do ESP
    
    this.notifyUploadListeners('progress', {
      message: 'Upload ESP32/ESP8266 não totalmente implementado',
      progress: 50,
    });

    // Simular upload para ESP
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    throw new Error('Upload para ESP32/ESP8266 requer implementação completa do protocolo esptool');
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

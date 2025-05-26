// Configurações das placas Arduino suportadas
const ARDUINO_BOARDS = {
  'arduino_uno': {
    name: 'Arduino Uno',
    board: 'arduino:avr:uno',
    mcu: 'atmega328p',
    fCpu: '16000000L',
    vendorIds: [0x2341, 0x1A86], // Arduino oficial e clones
    productIds: [0x0043, 0x0001, 0x7523],
    resetMethod: 'dtr_only',
    uploadProtocol: 'arduino',
    uploadSpeed: 115200,
    maxSketchSize: 32256,
    maxDataSize: 2048,
  },
  'arduino_nano': {
    name: 'Arduino Nano',
    board: 'arduino:avr:nano',
    mcu: 'atmega328p',
    fCpu: '16000000L',
    vendorIds: [0x2341, 0x1A86, 0x0403],
    productIds: [0x0043, 0x7523, 0x6001],
    resetMethod: 'dtr_only',
    uploadProtocol: 'arduino',
    uploadSpeed: 57600,
    maxSketchSize: 30720,
    maxDataSize: 2048,
  },
  'arduino_mega': {
    name: 'Arduino Mega 2560',
    board: 'arduino:avr:mega',
    mcu: 'atmega2560',
    fCpu: '16000000L',
    vendorIds: [0x2341, 0x1A86],
    productIds: [0x0042, 0x0010, 0x7523],
    resetMethod: 'dtr_only',
    uploadProtocol: 'wiring',
    uploadSpeed: 115200,
    maxSketchSize: 253952,
    maxDataSize: 8192,
  },
  'arduino_leonardo': {
    name: 'Arduino Leonardo',
    board: 'arduino:avr:leonardo',
    mcu: 'atmega32u4',
    fCpu: '16000000L',
    vendorIds: [0x2341, 0x1B4F],
    productIds: [0x8036, 0x9206],
    resetMethod: 'dtr_rts',
    uploadProtocol: 'avr109',
    uploadSpeed: 57600,
    maxSketchSize: 28672,
    maxDataSize: 2560,
  },
  'arduino_micro': {
    name: 'Arduino Micro',
    board: 'arduino:avr:micro',
    mcu: 'atmega32u4',
    fCpu: '16000000L',
    vendorIds: [0x2341, 0x1B4F],
    productIds: [0x8037, 0x9207],
    resetMethod: 'dtr_rts',
    uploadProtocol: 'avr109',
    uploadSpeed: 57600,
    maxSketchSize: 28672,
    maxDataSize: 2560,
  },
  'esp32_dev': {
    name: 'ESP32 Dev Module',
    board: 'esp32:esp32:esp32',
    mcu: 'esp32',
    fCpu: '240000000L',
    vendorIds: [0x10C4, 0x1A86, 0x0403],
    productIds: [0xEA60, 0x7523, 0x6001],
    resetMethod: 'dtr_rts',
    uploadProtocol: 'esptool',
    uploadSpeed: 921600,
    maxSketchSize: 1310720,
    maxDataSize: 327680,
  },
  'esp8266_nodemcu': {
    name: 'NodeMCU 1.0 (ESP-12E)',
    board: 'esp8266:esp8266:nodemcuv2',
    mcu: 'esp8266',
    fCpu: '80000000L',
    vendorIds: [0x10C4, 0x1A86, 0x0403],
    productIds: [0xEA60, 0x7523, 0x6001],
    resetMethod: 'dtr_rts',
    uploadProtocol: 'esptool',
    uploadSpeed: 921600,
    maxSketchSize: 1044464,
    maxDataSize: 81920,
  },
};

class BoardService {
  constructor() {
    this.detectedBoard = null;
    this.selectedBoard = null;
  }

  // Obter todas as placas suportadas
  getSupportedBoards() {
    return Object.entries(ARDUINO_BOARDS).map(([key, board]) => ({
      id: key,
      ...board,
    }));
  }

  // Verificar se um dispositivo é Arduino baseado em VID/PID
  isArduinoDevice(vendorId, productId) {
    return Object.values(ARDUINO_BOARDS).some(board =>
      board.vendorIds.includes(vendorId) && 
      board.productIds.includes(productId)
    );
  }

  // Obter informações da placa baseado em VID/PID
  getBoardByIds(vendorId, productId) {
    const boardEntry = Object.entries(ARDUINO_BOARDS).find(([key, board]) =>
      board.vendorIds.includes(vendorId) && 
      board.productIds.includes(productId)
    );

    if (boardEntry) {
      const [id, board] = boardEntry;
      return {
        id,
        ...board,
        confidence: this.calculateConfidence(vendorId, productId, board),
      };
    }

    return null;
  }

  // Calcular confiança na detecção da placa
  calculateConfidence(vendorId, productId, board) {
    // Arduino oficial tem maior confiança
    if (vendorId === 0x2341) {
      return 0.95;
    }
    
    // Chips conhecidos
    if ([0x1A86, 0x0403, 0x10C4].includes(vendorId)) {
      return 0.85;
    }
    
    return 0.70; // Confiança padrão para outros
  }

  // Detectar placa automaticamente
  async detectBoard(devices) {
    if (!devices || devices.length === 0) {
      this.detectedBoard = null;
      return null;
    }

    // Pegar o primeiro dispositivo Arduino encontrado
    const arduinoDevice = devices.find(device => 
      this.isArduinoDevice(device.vendorId, device.productId)
    );

    if (arduinoDevice) {
      this.detectedBoard = this.getBoardByIds(
        arduinoDevice.vendorId, 
        arduinoDevice.productId
      );
      return this.detectedBoard;
    }

    this.detectedBoard = null;
    return null;
  }

  // Selecionar placa manualmente
  selectBoard(boardId) {
    if (ARDUINO_BOARDS[boardId]) {
      this.selectedBoard = {
        id: boardId,
        ...ARDUINO_BOARDS[boardId],
      };
      return this.selectedBoard;
    }
    
    throw new Error(`Placa não suportada: ${boardId}`);
  }

  // Obter placa atual (detectada ou selecionada)
  getCurrentBoard() {
    return this.selectedBoard || this.detectedBoard;
  }

  // Obter configurações de compilação
  getCompileConfig(boardId = null) {
    const board = boardId ? 
      ARDUINO_BOARDS[boardId] : 
      this.getCurrentBoard();

    if (!board) {
      return null;
    }

    return {
      board: board.board || board.id,
      mcu: board.mcu,
      fCpu: board.fCpu,
      name: board.name,
      maxSketchSize: board.maxSketchSize,
      maxDataSize: board.maxDataSize,
    };
  }

  // Obter configurações de upload
  getUploadConfig(boardId = null) {
    const board = boardId ? 
      ARDUINO_BOARDS[boardId] : 
      this.getCurrentBoard();

    if (!board) {
      return null;
    }

    return {
      protocol: board.uploadProtocol,
      speed: board.uploadSpeed,
      resetMethod: board.resetMethod,
      maxSketchSize: board.maxSketchSize,
      name: board.name,
    };
  }

  // Validar tamanho do sketch
  validateSketchSize(sketchSize, boardId = null) {
    const board = boardId ? 
      ARDUINO_BOARDS[boardId] : 
      this.getCurrentBoard();

    if (!board) {
      return {
        valid: false,
        error: 'Placa não detectada',
      };
    }

    if (sketchSize > board.maxSketchSize) {
      return {
        valid: false,
        error: `Sketch muito grande (${sketchSize} bytes). Máximo: ${board.maxSketchSize} bytes`,
        usage: Math.round((sketchSize / board.maxSketchSize) * 100),
      };
    }

    return {
      valid: true,
      usage: Math.round((sketchSize / board.maxSketchSize) * 100),
      remaining: board.maxSketchSize - sketchSize,
    };
  }

  // Obter informações detalhadas da placa
  getBoardInfo(boardId = null) {
    const board = boardId ? 
      ARDUINO_BOARDS[boardId] : 
      this.getCurrentBoard();

    if (!board) {
      return null;
    }

    return {
      name: board.name,
      mcu: board.mcu,
      frequency: parseInt(board.fCpu) / 1000000 + ' MHz',
      flashSize: Math.round(board.maxSketchSize / 1024) + ' KB',
      ramSize: Math.round(board.maxDataSize / 1024) + ' KB',
      uploadSpeed: board.uploadSpeed + ' baud',
      resetMethod: board.resetMethod,
    };
  }

  // Resetar seleção
  reset() {
    this.detectedBoard = null;
    this.selectedBoard = null;
  }

  // Obter status atual
  getStatus() {
    return {
      hasDetectedBoard: !!this.detectedBoard,
      hasSelectedBoard: !!this.selectedBoard,
      currentBoard: this.getCurrentBoard(),
    };
  }
}

export default new BoardService();

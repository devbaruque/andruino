import BoardService from '../BoardService/BoardService';

// Configuração do compilador remoto
const COMPILER_CONFIG = {
  // Por enquanto usaremos um compilador simulado
  // Na implementação final, isso seria um serviço real
  baseUrl: 'https://api.arduino-compiler.com', // URL fictícia
  timeout: 30000, // 30 segundos
};

class CompilerService {
  constructor() {
    this.isCompiling = false;
    this.compilationListeners = [];
  }

  // Compilar código Arduino
  async compile(code, boardName = null) {
    if (this.isCompiling) {
      throw new Error('Compilação já em andamento');
    }

    if (!code || code.trim().length === 0) {
      throw new Error('Código não pode estar vazio');
    }

    this.isCompiling = true;
    this.notifyListeners('start', {message: 'Iniciando compilação...'});

    try {
      // Obter configurações da placa
      const boardConfig = BoardService.getCompileConfig(boardName);
      if (!boardConfig) {
        throw new Error('Placa não detectada ou não suportada');
      }

      this.notifyListeners('progress', {
        message: `Compilando para ${boardConfig.board}...`,
        progress: 25,
      });

      // Validar sintaxe básica
      const syntaxErrors = this.validateSyntax(code);
      if (syntaxErrors.length > 0) {
        throw new Error(`Erros de sintaxe:\n${syntaxErrors.join('\n')}`);
      }

      this.notifyListeners('progress', {
        message: 'Validando sintaxe...',
        progress: 50,
      });

      // Simular compilação (em produção seria uma chamada real para o compilador)
      const compilationResult = await this.simulateCompilation(
        code,
        boardConfig,
      );

      this.notifyListeners('progress', {
        message: 'Gerando binário...',
        progress: 75,
      });

      // Simular geração do binário
      const binary = await this.generateBinary(code, boardConfig);

      this.notifyListeners('progress', {
        message: 'Compilação concluída!',
        progress: 100,
      });

      const result = {
        success: true,
        binary,
        boardConfig,
        size: binary.length,
        output: compilationResult.output,
        warnings: compilationResult.warnings,
      };

      this.notifyListeners('complete', result);
      return result;
    } catch (error) {
      const errorResult = {
        success: false,
        error: error.message,
        output: `Erro de compilação: ${error.message}`,
      };

      this.notifyListeners('error', errorResult);
      throw error;
    } finally {
      this.isCompiling = false;
    }
  }

  // Validar sintaxe básica do código Arduino
  validateSyntax(code) {
    const errors = [];

    // Verificar se tem setup() e loop()
    if (!code.includes('void setup()') && !code.includes('void setup(')) {
      errors.push('Função setup() não encontrada');
    }

    if (!code.includes('void loop()') && !code.includes('void loop(')) {
      errors.push('Função loop() não encontrada');
    }

    // Verificar balanceamento de chaves
    const openBraces = (code.match(/{/g) || []).length;
    const closeBraces = (code.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
      errors.push('Chaves não balanceadas');
    }

    // Verificar balanceamento de parênteses
    const openParens = (code.match(/\(/g) || []).length;
    const closeParens = (code.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      errors.push('Parênteses não balanceados');
    }

    return errors;
  }

  // Simular processo de compilação
  async simulateCompilation(code, boardConfig) {
    return new Promise(resolve => {
      setTimeout(() => {
        const warnings = [];
        
        // Simular alguns warnings comuns
        if (code.includes('delay(')) {
          warnings.push('Uso de delay() pode bloquear outras operações');
        }
        
        if (!code.includes('Serial.begin')) {
          warnings.push('Serial não inicializado - monitor serial pode não funcionar');
        }

        resolve({
          output: `Compilando sketch para ${boardConfig.board}...\n` +
                  `Usando placa: ${boardConfig.board}\n` +
                  `MCU: ${boardConfig.mcu}\n` +
                  `Frequência: ${boardConfig.fCpu}\n` +
                  `Compilação concluída com sucesso!\n` +
                  `Tamanho do sketch: ${Math.floor(code.length * 1.5)} bytes`,
          warnings,
        });
      }, 2000); // Simular 2 segundos de compilação
    });
  }

  // Gerar binário simulado
  async generateBinary(code, boardConfig) {
    return new Promise(resolve => {
      setTimeout(() => {
        // Simular geração de binário (na realidade seria o hex file)
        const binarySize = Math.floor(code.length * 1.5);
        const binary = new Uint8Array(binarySize);
        
        // Preencher com dados simulados
        for (let i = 0; i < binarySize; i++) {
          binary[i] = Math.floor(Math.random() * 256);
        }
        
        resolve(binary);
      }, 1000);
    });
  }

  // Adicionar listener para eventos de compilação
  addListener(callback) {
    this.compilationListeners.push(callback);
  }

  // Remover listener
  removeListener(callback) {
    this.compilationListeners = this.compilationListeners.filter(
      listener => listener !== callback,
    );
  }

  // Notificar listeners
  notifyListeners(event, data) {
    this.compilationListeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.warn('Erro no listener de compilação:', error);
      }
    });
  }

  // Verificar se está compilando
  getCompilationStatus() {
    return this.isCompiling;
  }

  // Cancelar compilação (se possível)
  cancelCompilation() {
    if (this.isCompiling) {
      this.isCompiling = false;
      this.notifyListeners('cancelled', {message: 'Compilação cancelada'});
    }
  }
}

export default new CompilerService(); 
import USBService from '../services/USBService/USBService';
import CompilerService from '../services/CompilerService/CompilerService';
import BoardService from '../services/BoardService/BoardService';

/**
 * 🧪 Suite de Testes para IDE Arduino
 * 
 * Use estas funções para testar cada componente da IDE
 * Execute no console do React Native Debugger ou adicione botões na interface
 */

export class IDETests {
  
  /**
   * 🔍 Teste 1: Detecção de Dispositivos USB
   */
  static async testUSBDetection() {
    console.log('🔍 === TESTE: Detecção USB ===');
    
    try {
      const devices = await USBService.listDevices();
      
      console.log(`📱 Dispositivos encontrados: ${devices.length}`);
      
      if (devices.length === 0) {
        console.log('❌ Nenhum dispositivo Arduino detectado');
        console.log('📋 Verificações necessárias:');
        console.log('  - Cabo USB OTG conectado ao celular');
        console.log('  - Arduino conectado ao cabo USB');
        console.log('  - Permissões USB concedidas no Android');
        console.log('  - Arduino ligado (LED power aceso)');
        return false;
      }
      
      devices.forEach((device, index) => {
        console.log(`📟 Dispositivo ${index + 1}:`);
        console.log(`  - Nome: ${device.name || 'Desconhecido'}`);
        console.log(`  - Path: ${device.path}`);
        console.log(`  - Vendor ID: ${device.vendorId}`);
        console.log(`  - Product ID: ${device.productId}`);
        console.log(`  - Placa: ${device.boardInfo?.name || 'Não identificada'}`);
      });
      
      console.log('✅ Detecção USB funcionando!');
      return true;
      
    } catch (error) {
      console.error('❌ Erro na detecção USB:', error.message);
      console.log('🔧 Possíveis soluções:');
      console.log('  - Verificar se a biblioteca USB está instalada');
      console.log('  - Verificar permissões no AndroidManifest.xml');
      console.log('  - Testar em dispositivo físico (não emulador)');
      return false;
    }
  }

  /**
   * 🔗 Teste 2: Conexão Serial
   */
  static async testSerialConnection() {
    console.log('🔗 === TESTE: Conexão Serial ===');
    
    try {
      // Primeiro detectar dispositivos
      const devices = await USBService.listDevices();
      if (devices.length === 0) {
        console.log('❌ Nenhum dispositivo para conectar');
        return false;
      }
      
      const device = devices[0];
      console.log(`🔌 Conectando ao dispositivo: ${device.path}`);
      
      // Tentar conectar
      await USBService.connect(device.path, 9600);
      console.log('✅ Conexão serial estabelecida!');
      
      // Testar envio de dados
      console.log('📤 Enviando comando de teste...');
      await USBService.sendData('AT\r\n');
      
      // Aguardar resposta
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const buffer = USBService.getBuffer();
      console.log(`📥 Buffer recebido: "${buffer}"`);
      
      // Desconectar
      await USBService.disconnect();
      console.log('🔌 Desconectado');
      
      return true;
      
    } catch (error) {
      console.error('❌ Erro na conexão serial:', error.message);
      console.log('🔧 Possíveis soluções:');
      console.log('  - Verificar se o Arduino está funcionando');
      console.log('  - Tentar baudrate diferente (115200, 57600)');
      console.log('  - Verificar cabo USB');
      return false;
    }
  }

  /**
   * 🔨 Teste 3: Compilação de Código
   */
  static async testCompilation() {
    console.log('🔨 === TESTE: Compilação ===');
    
    const testCode = `
void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("Arduino Iniciado!");
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  Serial.println("LED Ligado");
  delay(1000);
  
  digitalWrite(LED_BUILTIN, LOW);
  Serial.println("LED Desligado");
  delay(1000);
}`;

    try {
      console.log('📝 Código de teste preparado');
      console.log('🔨 Iniciando compilação...');
      
      const result = await CompilerService.compile(testCode, 'Arduino Uno');
      
      if (result.success) {
        console.log('✅ Compilação bem-sucedida!');
        console.log(`📊 Tamanho: ${result.size} bytes`);
        console.log(`📄 Output: ${result.output}`);
        
        if (result.warnings && result.warnings.length > 0) {
          console.log('⚠️ Avisos:');
          result.warnings.forEach(warning => console.log(`  - ${warning}`));
        }
        
        console.log('📦 Arquivo HEX gerado:', result.hexFile ? 'Sim' : 'Não');
        return result;
      } else {
        console.log('❌ Compilação falhou');
        console.log(`🚫 Erro: ${result.error}`);
        return false;
      }
      
    } catch (error) {
      console.error('❌ Erro na compilação:', error.message);
      console.log('🔧 Possíveis soluções:');
      console.log('  - Verificar conectividade com servidor de compilação');
      console.log('  - Verificar variáveis de ambiente (COMPILER_URL)');
      console.log('  - Testar com código mais simples');
      return false;
    }
  }

  /**
   * 📤 Teste 4: Upload Completo
   */
  static async testCompleteUpload() {
    console.log('📤 === TESTE: Upload Completo ===');
    
    try {
      // 1. Detectar dispositivos
      console.log('1️⃣ Detectando dispositivos...');
      const devices = await USBService.listDevices();
      if (devices.length === 0) {
        throw new Error('Nenhum dispositivo Arduino encontrado');
      }
      
      const device = devices[0];
      console.log(`✅ Dispositivo encontrado: ${device.boardInfo?.name || device.path}`);
      
      // 2. Conectar
      console.log('2️⃣ Conectando...');
      await USBService.connect(device.path, 9600);
      console.log('✅ Conectado');
      
      // 3. Compilar código
      console.log('3️⃣ Compilando código...');
      const testCode = `
void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(500);
  digitalWrite(LED_BUILTIN, LOW);
  delay(500);
}`;
      
      const compiled = await CompilerService.compile(testCode, device.boardInfo?.name || 'Arduino Uno');
      if (!compiled.success) {
        throw new Error(`Compilação falhou: ${compiled.error}`);
      }
      console.log('✅ Código compilado');
      
      // 4. Upload
      console.log('4️⃣ Fazendo upload...');
      const boardConfig = BoardService.getCompileConfig(device.boardInfo?.name || 'Arduino Uno');
      
      await USBService.uploadCode(compiled.hexFile, boardConfig, (progress) => {
        console.log(`📊 Progresso: ${progress}%`);
      });
      
      console.log('🎉 Upload concluído com sucesso!');
      console.log('💡 O LED do Arduino deve estar piscando rapidamente');
      
      return true;
      
    } catch (error) {
      console.error('❌ Erro no upload completo:', error.message);
      console.log('🔧 Verificar:');
      console.log('  - Conexão USB estável');
      console.log('  - Arduino funcionando corretamente');
      console.log('  - Servidor de compilação online');
      return false;
    }
  }

  /**
   * 📺 Teste 5: Monitor Serial
   */
  static async testSerialMonitor() {
    console.log('📺 === TESTE: Monitor Serial ===');
    
    try {
      // Conectar ao dispositivo
      const devices = await USBService.listDevices();
      if (devices.length === 0) {
        throw new Error('Nenhum dispositivo encontrado');
      }
      
      const device = devices[0];
      await USBService.connect(device.path, 9600);
      console.log('✅ Conectado para monitoramento');
      
      // Configurar listener para dados
      let receivedData = '';
      const dataListener = (event, data) => {
        if (event === 'data') {
          receivedData += data.data;
          console.log(`📥 Recebido: "${data.data.trim()}"`);
        }
      };
      
      USBService.addDataListener(dataListener);
      
      console.log('👂 Monitorando por 10 segundos...');
      console.log('💡 Se o Arduino estiver enviando dados, eles aparecerão aqui');
      
      // Monitorar por 10 segundos
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      USBService.removeDataListener(dataListener);
      
      console.log(`📊 Total de dados recebidos: ${receivedData.length} caracteres`);
      console.log('✅ Teste de monitor serial concluído');
      
      return true;
      
    } catch (error) {
      console.error('❌ Erro no monitor serial:', error.message);
      return false;
    }
  }

  /**
   * 🧪 Teste 6: Suite Completa
   */
  static async runAllTests() {
    console.log('🧪 === EXECUTANDO TODOS OS TESTES ===');
    
    const results = {
      usbDetection: false,
      serialConnection: false,
      compilation: false,
      completeUpload: false,
      serialMonitor: false
    };
    
    try {
      // Teste 1: Detecção USB
      results.usbDetection = await this.testUSBDetection();
      
      if (results.usbDetection) {
        // Teste 2: Conexão Serial
        results.serialConnection = await this.testSerialConnection();
        
        // Teste 3: Compilação
        results.compilation = await this.testCompilation();
        
        if (results.compilation && results.serialConnection) {
          // Teste 4: Upload Completo
          results.completeUpload = await this.testCompleteUpload();
          
          if (results.completeUpload) {
            // Teste 5: Monitor Serial
            results.serialMonitor = await this.testSerialMonitor();
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Erro na execução dos testes:', error);
    }
    
    // Relatório final
    console.log('\n📊 === RELATÓRIO FINAL ===');
    console.log(`🔍 Detecção USB: ${results.usbDetection ? '✅' : '❌'}`);
    console.log(`🔗 Conexão Serial: ${results.serialConnection ? '✅' : '❌'}`);
    console.log(`🔨 Compilação: ${results.compilation ? '✅' : '❌'}`);
    console.log(`📤 Upload Completo: ${results.completeUpload ? '✅' : '❌'}`);
    console.log(`📺 Monitor Serial: ${results.serialMonitor ? '✅' : '❌'}`);
    
    const successCount = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`\n🎯 Resultado: ${successCount}/${totalTests} testes passaram`);
    
    if (successCount === totalTests) {
      console.log('🎉 PARABÉNS! Sua IDE Arduino está 100% funcional!');
    } else if (successCount >= 3) {
      console.log('👍 Boa! Sua IDE está quase pronta, apenas alguns ajustes necessários');
    } else {
      console.log('🔧 Ainda há trabalho a fazer, mas você está no caminho certo!');
    }
    
    return results;
  }

  /**
   * 🚀 Teste Rápido - Para usar durante desenvolvimento
   */
  static async quickTest() {
    console.log('🚀 === TESTE RÁPIDO ===');
    
    try {
      // Apenas testar detecção e conexão básica
      const devices = await USBService.listDevices();
      console.log(`📱 Dispositivos: ${devices.length}`);
      
      if (devices.length > 0) {
        const device = devices[0];
        console.log(`🔌 Testando: ${device.path}`);
        
        await USBService.connect(device.path, 9600);
        console.log('✅ Conexão OK');
        
        await USBService.disconnect();
        console.log('✅ Desconexão OK');
        
        console.log('🎯 Teste rápido: SUCESSO');
        return true;
      } else {
        console.log('❌ Nenhum dispositivo encontrado');
        return false;
      }
      
    } catch (error) {
      console.error('❌ Teste rápido falhou:', error.message);
      return false;
    }
  }
}

// Funções de conveniência para usar no console
export const testUSB = () => IDETests.testUSBDetection();
export const testSerial = () => IDETests.testSerialConnection();
export const testCompile = () => IDETests.testCompilation();
export const testUpload = () => IDETests.testCompleteUpload();
export const testMonitor = () => IDETests.testSerialMonitor();
export const testAll = () => IDETests.runAllTests();
export const quickTest = () => IDETests.quickTest();

export default IDETests; 
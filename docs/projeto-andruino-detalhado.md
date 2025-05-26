# Projeto Andruino - IDE Arduino para Android

## Visão Geral

O **Andruino** é uma IDE (Integrated Development Environment) para Arduino desenvolvida especificamente para dispositivos Android. O objetivo é democratizar o acesso à programação Arduino para estudantes de baixa renda que possuem smartphones Android mas não têm acesso a computadores.

## Objetivos do Projeto

- Tornar a programação Arduino acessível via smartphone Android
- Funcionar offline após instalação inicial
- Interface similar ao Arduino IDE oficial
- Suporte a comunicação USB via adaptador OTG
- Detecção automática de placas Arduino
- Gerenciamento completo de bibliotecas Arduino

## Especificações Técnicas

### Requisitos Mínimos

- **Android:** Versão 13 ou superior
- **RAM:** Mínimo 3GB
- **Armazenamento:** 2GB livres para instalação completa
- **Hardware:** Suporte USB OTG
- **Conectividade:** Internet apenas para login inicial e download de bibliotecas

### Placas Arduino Suportadas

- Arduino Uno (ATmega328P)
- Arduino Nano (ATmega328P)
- Arduino Pro Mini (ATmega328P)
- ESP32 (todas as variantes)
- ESP8266 (NodeMCU, Wemos D1)
- Arduino Mega 2560 (ATmega2560)

## Arquitetura do Sistema

### Stack Tecnológico

#### Frontend

- **React Native:** 0.76.7
- **Expo:** ~52.0.38 (para desenvolvimento inicial, migração para bare workflow)
- **Editor de Código:** Monaco Editor ou CodeMirror adaptado para mobile
- **Navegação:** React Navigation 6.x
- **Gerenciamento de Estado:** Context API + AsyncStorage

#### Comunicação USB

- **Biblioteca Principal:** @serserm/react-native-turbo-serialport
- **Versão:** 2.2.2 (mais recente)
- **Dependência Nativa:** felHR85/UsbSerial (biblioteca Java)
- **Requisitos da Biblioteca:**
  - React Native 0.68+ (suporte a Turbo Modules)
  - Android API Level 21+ (Android 5.0)
  - Permissões USB Host
  - Configuração de filtros USB no AndroidManifest.xml
  - Suporte à Nova Arquitetura do React Native
  - Migração obrigatória para bare workflow (não funciona com Expo managed)

#### Backend e Serviços

- **Autenticação:** Supabase Authentication
- **Analytics:** Supabase Analytics (apenas contagem de usuários)
- **Armazenamento Local:** AsyncStorage + React Native FS
- **Compilação:** Toolchain GCC ARM embarcado
- **Plataforma:** Exclusivamente Android (sem suporte iOS)

#### Compilador Arduino

- **Toolchain:** GCC ARM Embedded
- **Arduino Core:** Cores oficiais para cada placa suportada
- **Bibliotecas:** Sistema de cache local das bibliotecas Arduino

### Estrutura de Diretórios

```
andruino/
├── src/
│   ├── components/           # Componentes reutilizáveis
│   │   ├── CodeEditor/      # Editor de código principal
│   │   ├── SerialMonitor/   # Monitor serial
│   │   ├── ProjectTree/     # Árvore de arquivos do projeto
│   │   ├── LibraryManager/  # Gerenciador de bibliotecas
│   │   └── BoardSelector/   # Seletor de placas
│   ├── screens/             # Telas principais
│   │   ├── LoginScreen/     # Tela de login
│   │   ├── EditorScreen/    # Tela principal do editor
│   │   ├── ProjectsScreen/  # Lista de projetos
│   │   ├── LibrariesScreen/ # Gerenciamento de bibliotecas
│   │   ├── SettingsScreen/  # Configurações
│   │   └── DonationScreen/  # Tela de doação
│   ├── services/            # Serviços e APIs
│   │   ├── USBService/      # Comunicação USB
│   │   ├── CompilerService/ # Compilação de código
│   │   ├── FileService/     # Gerenciamento de arquivos
│   │   ├── BoardService/    # Detecção de placas
│   │   └── LibraryService/  # Gerenciamento de bibliotecas
│   ├── utils/               # Utilitários
│   │   ├── ArduinoSyntax/   # Syntax highlighting
│   │   ├── BoardDetection/  # Detecção automática de placas
│   │   └── FileSystem/      # Operações de arquivo
│   └── assets/              # Recursos estáticos
│       ├── arduino-cores/   # Cores Arduino embarcados
│       ├── libraries/       # Bibliotecas pré-instaladas
│       └── examples/        # Projetos exemplo
├── android/                 # Configurações Android específicas
├── docs/                    # Documentação do projeto
└── scripts/                 # Scripts de build e deploy
```

## Fases de Desenvolvimento

### FASE 1: Fundação e Arquitetura (4-6 semanas) ✅ CONCLUÍDA

#### Objetivos

- Configurar estrutura base do projeto React Native
- Implementar sistema de autenticação básico
- Configurar comunicação USB inicial
- Criar interface básica do editor

#### Tarefas Específicas

**Semana 1-2: Setup Inicial**

- [x] Migrar de Expo managed para bare workflow
- [x] Configurar React Navigation
- [x] Implementar Supabase Authentication
- [x] Configurar AsyncStorage para persistência local
- [x] Setup inicial do @serserm/react-native-turbo-serialport

**Semana 3-4: Interface Base**

- [x] Criar layout principal similar ao Arduino IDE
- [x] Implementar tela de login/registro
- [x] Desenvolver estrutura básica do editor de código
- [x] Configurar syntax highlighting para C/C++
- [x] Implementar sistema de arquivos local

**Semana 5-6: Comunicação USB**

- [x] Configurar permissões USB no Android
- [x] Implementar detecção básica de dispositivos USB
- [x] Criar interface para seleção de porta serial
- [x] Testar comunicação básica com Arduino

#### Entregáveis

- [x] App funcional com login
- [x] Editor básico com syntax highlighting
- [x] Detecção de dispositivos USB
- [x] Estrutura de navegação completa

### FASE 2: Core IDE Features (6-8 semanas) 🔄 EM ANDAMENTO

#### Objetivos

- Desenvolver editor de código robusto
- Implementar compilação local do código Arduino
- Sistema de detecção automática de placas
- Upload de código para Arduino

#### Tarefas Específicas

**Semana 1-2: Editor Avançado**

- [x] Implementar editor de código customizado com syntax highlighting
- [ ] Adicionar autocomplete para funções Arduino
- [ ] Implementar indentação automática
- [x] Adicionar numeração de linhas
- [ ] Sistema de busca e substituição

**Semana 3-4: Sistema de Compilação**

- [ ] Integrar GCC ARM toolchain
- [x] Configurar Arduino cores para cada placa
- [x] Implementar processo de compilação (simulado)
- [x] Sistema de tratamento de erros de compilação
- [ ] Cache de compilação para otimização

**Semana 5-6: Detecção de Placas**

- [x] Implementar detecção automática via VID/PID
- [x] Configurar perfis para cada tipo de placa
- [x] Sistema de configuração manual de placas
- [x] Validação de compatibilidade placa/código

**Semana 7-8: Upload e Monitor Serial**

- [x] Implementar upload de sketches via USB
- [x] Desenvolver monitor serial básico
- [x] Sistema de reset automático da placa
- [x] Tratamento de erros de upload

#### Entregáveis

- [x] Editor completo com syntax highlighting
- [x] Sistema de compilação funcional (simulado)
- [x] Upload de código para Arduino
- [x] Monitor serial básico
- [x] Detecção automática de placas

### FASE 3: Gerenciamento de Bibliotecas (4-5 semanas)

#### Objetivos

- Sistema de download e instalação de bibliotecas Arduino
- Gerenciamento offline de bibliotecas
- Interface para busca e instalação

#### Tarefas Específicas

**Semana 1-2: Infraestrutura de Bibliotecas**

- [ ] Criar sistema de cache local de bibliotecas
- [ ] Implementar parser de library.properties
- [ ] Sistema de dependências entre bibliotecas
- [ ] Estrutura de armazenamento otimizada

**Semana 3: Interface de Gerenciamento**

- [ ] Tela de gerenciamento de bibliotecas
- [ ] Sistema de busca e filtros
- [ ] Interface de instalação/remoção
- [ ] Indicadores de status (instalada, atualização disponível)

**Semana 4-5: Integração e Otimização**

- [ ] Integração com Arduino Library Manager
- [ ] Sistema de atualização de bibliotecas
- [ ] Compressão de bibliotecas para economia de espaço
- [ ] Sincronização offline/online

#### Entregáveis

- Gerenciador completo de bibliotecas
- Sistema de cache otimizado
- Interface intuitiva para instalação
- Suporte offline completo

### FASE 4: Interface e Experiência do Usuário (4-5 semanas)

#### Objetivos

- Interface otimizada para mobile similar ao Arduino IDE
- Sistema de projetos e templates
- Otimizações de UX para telas pequenas

#### Tarefas Específicas

**Semana 1-2: Design System**

- [ ] Implementar design similar ao Arduino IDE oficial
- [ ] Adaptar interface para telas móveis
- [ ] Sistema de layout responsivo
- [ ] Componentes de UI consistentes

**Semana 3: Gerenciamento de Projetos**

- [ ] Sistema de criação/abertura de projetos
- [ ] Árvore de arquivos do projeto
- [ ] Templates básicos de projeto
- [ ] Sistema de backup automático

**Semana 4-5: Otimizações UX**

- [ ] Gestos touch otimizados para código
- [ ] Teclado virtual com símbolos de programação
- [ ] Sistema de zoom e navegação
- [ ] Shortcuts e atalhos de teclado

#### Entregáveis

- Interface completa similar ao Arduino IDE
- Sistema de projetos funcional
- UX otimizada para mobile
- Templates de projeto

### FASE 5: Recursos Avançados e Otimização (4-5 semanas)

#### Objetivos

- Monitor serial avançado
- Otimizações de performance
- Sistema de doação
- Funcionalidades complementares

#### Tarefas Específicas

**Semana 1-2: Monitor Serial Avançado**

- [ ] Interface avançada do monitor serial
- [ ] Gráficos em tempo real de dados
- [ ] Filtros e busca no histórico
- [ ] Salvamento de logs

**Semana 3: Otimizações de Performance**

- [ ] Otimização para dispositivos com 3GB RAM
- [ ] Lazy loading de componentes
- [ ] Otimização de bateria
- [ ] Cache inteligente

**Semana 4-5: Funcionalidades Complementares**

- [ ] Tela de doação com PIX/QR Code
- [ ] Sistema de configurações avançadas
- [ ] Exportação/importação de projetos
- [ ] Sistema de logs para debugging

#### Entregáveis

- Monitor serial completo
- App otimizado para performance
- Sistema de doação implementado
- Funcionalidades complementares

### FASE 6: Testes, Polimento e Lançamento (3-4 semanas)

#### Objetivos

- Testes extensivos em diferentes dispositivos
- Correção de bugs
- Preparação para Google Play Store

#### Tarefas Específicas

**Semana 1-2: Testes e QA**

- [ ] Testes em múltiplos dispositivos Android
- [ ] Testes com diferentes placas Arduino
- [ ] Testes de performance e memória
- [ ] Correção de bugs críticos

**Semana 3: Preparação para Lançamento**

- [ ] Documentação completa do usuário
- [ ] Política de privacidade e termos de uso
- [ ] Configuração do Google Play Console
- [ ] Assets da loja (ícones, screenshots, descrição)

**Semana 4: Lançamento**

- [ ] Build de produção
- [ ] Testes finais
- [ ] Publicação na Google Play Store
- [ ] Monitoramento pós-lançamento

#### Entregáveis

- App testado e estável
- Documentação completa
- Publicação na Google Play Store
- Sistema de monitoramento ativo

## Configurações Específicas

### Configuração do @serserm/react-native-turbo-serialport

#### Instalação

```bash
npm install @serserm/react-native-turbo-serialport
```

#### Pré-requisitos Obrigatórios

1. **Migração para Bare Workflow:**

```bash
npx expo eject
# ou criar projeto bare desde o início
npx react-native init AndruinoApp
```

2. **Configuração do Metro (metro.config.js):**

```javascript
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const config = {
  resolver: {
    assetExts: ['bin', 'txt', 'jpg', 'png', 'json', 'woff', 'woff2', 'ttf'],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
```

#### Configuração Android

**1. AndroidManifest.xml (android/app/src/main/AndroidManifest.xml)**

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Permissões USB obrigatórias -->
    <uses-permission android:name="android.permission.USB_PERMISSION" />
    <uses-feature android:name="android.hardware.usb.host" android:required="true" />

    <application>
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@style/AppTheme">

            <!-- Intent filter para detecção automática de dispositivos USB -->
            <intent-filter>
                <action android:name="android.hardware.usb.action.USB_DEVICE_ATTACHED" />
            </intent-filter>

            <!-- Metadados para filtros USB -->
            <meta-data
                android:name="android.hardware.usb.action.USB_DEVICE_ATTACHED"
                android:resource="@xml/device_filter" />
        </activity>
    </application>
</manifest>
```

**2. Filtros USB (android/app/src/main/res/xml/device_filter.xml)**

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- Arduino Uno (ATmega328P) -->
    <usb-device vendor-id="9025" product-id="67" />

    <!-- Arduino Nano (ATmega328P) -->
    <usb-device vendor-id="9025" product-id="7523" />

    <!-- ESP32 DevKit -->
    <usb-device vendor-id="4292" product-id="60000" />

    <!-- ESP8266 NodeMCU -->
    <usb-device vendor-id="4292" product-id="60001" />

    <!-- CH340 (clones Arduino) -->
    <usb-device vendor-id="6790" product-id="29987" />

    <!-- FTDI (Arduino Uno R3) -->
    <usb-device vendor-id="1027" product-id="24577" />

    <!-- CP2102 (ESP32/ESP8266) -->
    <usb-device vendor-id="4292" product-id="60000" />

    <!-- Arduino Mega 2560 -->
    <usb-device vendor-id="9025" product-id="66" />
</resources>
```

**3. Configuração do Gradle (android/app/build.gradle)**

```gradle
android {
    compileSdkVersion 34

    defaultConfig {
        minSdkVersion 21  // Mínimo para a biblioteca
        targetSdkVersion 34
    }
}
```

#### Exemplo de Uso da Biblioteca

```typescript
import TurboSerialPort from '@serserm/react-native-turbo-serialport';

// Interface para configuração da porta serial
interface SerialConfig {
  baudRate: number;
  dataBits: number;
  stopBits: number;
  parity: number;
  flowControl: boolean;
}

// Classe para gerenciar comunicação USB
class USBSerialManager {
  private port: any = null;

  // Listar dispositivos USB disponíveis
  async listDevices() {
    try {
      const devices = await TurboSerialPort.list();
      return devices;
    } catch (error) {
      console.error('Erro ao listar dispositivos:', error);
      return [];
    }
  }

  // Solicitar permissão USB
  async requestPermission(deviceId: string): Promise<boolean> {
    try {
      const granted = await TurboSerialPort.requestPermission(deviceId);
      return granted;
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      return false;
    }
  }

  // Abrir porta serial
  async openPort(deviceId: string, config: SerialConfig) {
    try {
      this.port = await TurboSerialPort.open(deviceId, {
        baudRate: config.baudRate,
        dataBits: config.dataBits,
        stopBits: config.stopBits,
        parity: config.parity,
        flowControl: config.flowControl,
      });

      // Configurar listener para dados recebidos
      this.port.onReceived((data: string) => {
        console.log('Dados recebidos:', data);
      });

      return true;
    } catch (error) {
      console.error('Erro ao abrir porta:', error);
      return false;
    }
  }

  // Enviar dados
  async sendData(data: string) {
    if (!this.port) {
      throw new Error('Porta não está aberta');
    }

    try {
      await this.port.write(data);
    } catch (error) {
      console.error('Erro ao enviar dados:', error);
      throw error;
    }
  }

  // Fechar porta
  async closePort() {
    if (this.port) {
      try {
        await this.port.close();
        this.port = null;
      } catch (error) {
        console.error('Erro ao fechar porta:', error);
      }
    }
  }
}
```

### Estrutura de Dados

#### Projeto Arduino

```typescript
interface ArduinoProject {
  id: string;
  name: string;
  description?: string;
  mainFile: string;
  files: ProjectFile[];
  board: BoardConfig;
  libraries: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectFile {
  name: string;
  content: string;
  type: 'ino' | 'cpp' | 'h' | 'txt';
}

interface BoardConfig {
  type: 'uno' | 'nano' | 'esp32' | 'esp8266' | 'mega';
  port: string;
  baudRate: number;
  programmer: string;
  vid: string; // Vendor ID
  pid: string; // Product ID
}
```

#### Biblioteca Arduino

```typescript
interface ArduinoLibrary {
  name: string;
  version: string;
  author: string;
  description: string;
  category: string;
  url?: string;
  dependencies: string[];
  installed: boolean;
  size: number;
}
```

#### Configuração USB

```typescript
interface USBDevice {
  deviceId: string;
  vendorId: string;
  productId: string;
  deviceName: string;
  manufacturer?: string;
  serialNumber?: string;
  deviceClass: number;
}

interface SerialPortConfig {
  baudRate: 9600 | 19200 | 38400 | 57600 | 115200;
  dataBits: 5 | 6 | 7 | 8;
  stopBits: 1 | 2;
  parity: 'none' | 'odd' | 'even' | 'mark' | 'space';
  flowControl: boolean;
  dtr: boolean;
  rts: boolean;
}
```

## Estimativas e Cronograma

### Cronograma Total

- **Duração:** 25-33 semanas (6-8 meses)
- **Equipe Sugerida:** 2-3 desenvolvedores
- **Esforço:** ~800-1200 horas de desenvolvimento

### Marcos Importantes

1. **Semana 6:** MVP com editor básico e comunicação USB
2. **Semana 14:** Versão Alpha com compilação e upload
3. **Semana 19:** Versão Beta com gerenciamento de bibliotecas
4. **Semana 28:** Versão Release Candidate
5. **Semana 33:** Lançamento na Google Play Store

## Considerações de Implementação

### Performance

- Lazy loading de bibliotecas grandes
- Compilação em background thread
- Cache inteligente de recursos
- Otimização de memória para dispositivos com 3GB RAM

### Segurança

- Validação de código antes da compilação
- Sandbox para execução de bibliotecas
- Criptografia de dados do usuário
- Validação de integridade de bibliotecas

### Acessibilidade

- Interface adaptada para diferentes tamanhos de tela
- Suporte a leitores de tela
- Contraste adequado para visibilidade
- Gestos intuitivos para navegação

### Limitações da Biblioteca USB

- **Apenas Android:** A biblioteca não suporta iOS
- **Bare Workflow Obrigatório:** Não funciona com Expo managed
- **Dependência Nativa:** Requer compilação nativa
- **Permissões USB:** Necessita aprovação manual do usuário
- **Compatibilidade:** Limitada a dispositivos com suporte USB Host

## Monetização e Sustentabilidade

### Modelo Gratuito

- App completamente gratuito
- Sem funcionalidades premium
- Sem anúncios

### Sistema de Doação

- Tela dedicada com informações sobre custos
- QR Code para PIX
- Explicação transparente dos custos:
  - Taxa da Google Play Store (30%)
  - Custos de infraestrutura (Firebase)
  - Manutenção e atualizações
  - Desenvolvimento de novas funcionalidades

### Métricas de Sucesso

- Número de usuários ativos
- Frequência de uso
- Projetos criados por usuário
- Taxa de retenção
- Feedback na Play Store

## Próximos Passos

1. **Aprovação do Plano:** Confirmar escopo e cronograma
2. **Setup do Ambiente:** Configurar repositório e ferramentas
3. **Início da Fase 1:** Começar desenvolvimento da fundação
4. **Definição da Equipe:** Alocar desenvolvedores para o projeto
5. **Configuração de CI/CD:** Automatizar builds e testes

## Riscos e Mitigações

### Riscos Técnicos

- **Compatibilidade USB:** Nem todos os dispositivos Android suportam USB Host
  - _Mitigação:_ Verificação de compatibilidade na instalação
- **Performance em dispositivos antigos:** Compilação pode ser lenta
  - _Mitigação:_ Otimização e compilação em cloud como fallback
- **Fragmentação Android:** Diferentes versões podem ter comportamentos distintos
  - _Mitigação:_ Testes extensivos em múltiplos dispositivos

### Riscos de Projeto

- **Complexidade da compilação:** Integrar GCC ARM pode ser desafiador
  - _Mitigação:_ Usar soluções existentes como base
- **Tamanho do app:** Pode ficar muito grande com todas as bibliotecas
  - _Mitigação:_ Download sob demanda de bibliotecas

---

**Documento criado em:** Janeiro 2025
**Versão:** 1.1
**Status:** Em Planejamento

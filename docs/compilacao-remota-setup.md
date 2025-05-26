# 🔧 Serviço de Compilação Arduino Remoto

## Visão Geral

Para transformar o Andruino em uma IDE real, é necessário implementar um serviço de compilação que converta código Arduino em binários executáveis. Existem várias abordagens possíveis:

## 🎯 Opções de Implementação

### 1. **Arduino CLI + Servidor Node.js (RECOMENDADO)**

**Vantagens:**
- Compilação oficial Arduino
- Suporte completo a todas as placas
- Gerenciamento de bibliotecas
- Relativamente simples de implementar

**Implementação:**

```bash
# Servidor de compilação (Node.js + Express)
mkdir arduino-compiler-service
cd arduino-compiler-service
npm init -y
npm install express multer fs-extra arduino-cli
```

```javascript
// server.js
const express = require('express');
const multer = require('multer');
const fs = require('fs-extra');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.json());

// Endpoint de compilação
app.post('/compile', upload.single('sketch'), async (req, res) => {
  try {
    const { board, libraries = [] } = req.body;
    const sketchPath = req.file.path;
    
    // Criar diretório temporário
    const tempDir = path.join(__dirname, 'temp', Date.now().toString());
    await fs.ensureDir(tempDir);
    
    // Copiar sketch
    const sketchFile = path.join(tempDir, 'sketch.ino');
    await fs.copy(sketchPath, sketchFile);
    
    // Instalar bibliotecas se necessário
    for (const lib of libraries) {
      await execCommand(`arduino-cli lib install "${lib}"`);
    }
    
    // Compilar
    const outputDir = path.join(tempDir, 'build');
    const compileCmd = `arduino-cli compile --fqbn ${board} --output-dir ${outputDir} ${sketchFile}`;
    
    const result = await execCommand(compileCmd);
    
    // Ler arquivo HEX
    const hexFile = path.join(outputDir, 'sketch.ino.hex');
    const hexContent = await fs.readFile(hexFile, 'utf8');
    
    // Obter informações de tamanho
    const sizeInfo = await getSketchSize(outputDir, board);
    
    res.json({
      success: true,
      hexFile: hexContent,
      size: sizeInfo,
      output: result.stdout,
      warnings: parseWarnings(result.stderr)
    });
    
    // Limpar arquivos temporários
    await fs.remove(tempDir);
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

function execCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

async function getSketchSize(buildDir, board) {
  // Implementar análise de tamanho do sketch
  const elfFile = path.join(buildDir, 'sketch.ino.elf');
  const sizeCmd = `arduino-cli compile --fqbn ${board} --show-properties | grep upload.maximum`;
  // ... implementar lógica de tamanho
}

app.listen(3001, () => {
  console.log('Servidor de compilação rodando na porta 3001');
});
```

### 2. **Arduino Web Editor API**

**Vantagens:**
- Serviço oficial Arduino
- Sem necessidade de manter servidor próprio
- Sempre atualizado

**Desvantagens:**
- Requer autenticação Arduino
- Limitações de uso
- Dependência externa

```javascript
// Integração com Arduino Web Editor
const ARDUINO_API_BASE = 'https://api.arduino.cc/v2';

async function compileWithArduinoAPI(code, board, apiKey) {
  const response = await fetch(`${ARDUINO_API_BASE}/sketches/compile`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sketch: {
        name: 'temp_sketch',
        files: [{
          name: 'temp_sketch.ino',
          content: code
        }]
      },
      board: {
        fqbn: board
      }
    })
  });
  
  return await response.json();
}
```

### 3. **Compilação Local com WASM**

**Vantagens:**
- Compilação offline
- Sem dependência de servidor
- Privacidade total

**Desvantagens:**
- Complexo de implementar
- Tamanho do app aumenta significativamente
- Performance limitada

```javascript
// Exemplo conceitual com WASM
import { ArduinoCompiler } from './arduino-compiler.wasm';

async function compileLocally(code, board) {
  const compiler = await ArduinoCompiler.init();
  
  const result = await compiler.compile({
    code,
    board,
    libraries: []
  });
  
  return result;
}
```

## 🚀 Implementação Recomendada

### Passo 1: Configurar Servidor de Compilação

```bash
# Em um servidor (VPS, AWS, etc.)
curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh
arduino-cli core update-index
arduino-cli core install arduino:avr
arduino-cli core install esp32:esp32
arduino-cli core install esp8266:esp8266
```

### Passo 2: Configurar Docker (Opcional)

```dockerfile
# Dockerfile
FROM node:18-alpine

RUN apk add --no-cache curl bash
RUN curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh
RUN mv bin/arduino-cli /usr/local/bin/

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001
CMD ["node", "server.js"]
```

### Passo 3: Integrar no App React Native

```javascript
// src/services/CompilerService/CompilerService.js
const COMPILER_CONFIG = {
  baseUrl: process.env.EXPO_PUBLIC_COMPILER_URL || 'https://seu-servidor.com',
  apiKey: process.env.EXPO_PUBLIC_COMPILER_API_KEY,
  timeout: 60000
};

async function compileRemote(code, boardConfig) {
  const formData = new FormData();
  
  // Criar arquivo temporário
  const blob = new Blob([code], { type: 'text/plain' });
  formData.append('sketch', blob, 'sketch.ino');
  formData.append('board', boardConfig.fqbn);
  formData.append('libraries', JSON.stringify([]));
  
  const response = await fetch(`${COMPILER_CONFIG.baseUrl}/compile`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${COMPILER_CONFIG.apiKey}`,
    },
    body: formData,
    timeout: COMPILER_CONFIG.timeout
  });
  
  if (!response.ok) {
    throw new Error(`Erro na compilação: ${response.statusText}`);
  }
  
  return await response.json();
}
```

## 🔒 Segurança e Limitações

### Medidas de Segurança:

1. **Rate Limiting**: Limitar compilações por usuário
2. **Timeout**: Limitar tempo de compilação
3. **Sandbox**: Executar em ambiente isolado
4. **Validação**: Validar código antes da compilação
5. **Autenticação**: Requer API key válida

```javascript
// Middleware de rate limiting
const rateLimit = require('express-rate-limit');

const compileLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 compilações por IP
  message: 'Muitas tentativas de compilação. Tente novamente em 15 minutos.'
});

app.use('/compile', compileLimit);
```

### Limitações:

1. **Tamanho do código**: Máximo 64KB por sketch
2. **Bibliotecas**: Lista pré-aprovada de bibliotecas
3. **Tempo**: Máximo 60 segundos por compilação
4. **Recursos**: Limite de CPU e memória

## 📊 Monitoramento

```javascript
// Métricas de compilação
const metrics = {
  totalCompilations: 0,
  successfulCompilations: 0,
  failedCompilations: 0,
  averageCompileTime: 0
};

// Endpoint de status
app.get('/status', (req, res) => {
  res.json({
    status: 'online',
    metrics,
    uptime: process.uptime(),
    version: '1.0.0'
  });
});
```

## 🔄 Fallback Local

Para casos onde o serviço remoto está indisponível:

```javascript
async function compileWithFallback(code, boardConfig) {
  try {
    // Tentar compilação remota primeiro
    return await compileRemote(code, boardConfig);
  } catch (error) {
    console.warn('Compilação remota falhou, usando fallback local');
    
    // Fallback para validação local + simulação
    const validation = validateCodeLocally(code);
    if (!validation.valid) {
      throw new Error(validation.errors.join('\n'));
    }
    
    // Simular compilação bem-sucedida
    return {
      success: true,
      hexFile: generateMockHex(code),
      size: estimateCodeSize(code),
      output: 'Compilação simulada (modo offline)',
      warnings: []
    };
  }
}
```

## 🎯 Próximos Passos

1. **Implementar servidor de compilação**
2. **Configurar infraestrutura (Docker + Cloud)**
3. **Integrar no app React Native**
4. **Implementar cache de compilação**
5. **Adicionar suporte a bibliotecas customizadas**
6. **Implementar análise estática de código**
7. **Adicionar métricas e monitoramento**

Com essa implementação, o Andruino terá capacidade real de compilação Arduino, transformando-o em uma IDE verdadeiramente funcional. 
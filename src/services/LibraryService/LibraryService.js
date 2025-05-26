import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';

// Configurações do serviço de bibliotecas
const LIBRARIES_STORAGE_KEY = '@andruino_libraries';
const LIBRARIES_CACHE_KEY = '@andruino_libraries_cache';
const LIBRARIES_DIR = `${RNFS.DocumentDirectoryPath}/libraries`;
const ARDUINO_LIBRARY_INDEX_URL = 'https://downloads.arduino.cc/libraries/library_index.json';

class LibraryService {
  constructor() {
    this.libraries = [];
    this.installedLibraries = [];
    this.libraryIndex = null;
    this.isInitialized = false;
  }

  // Inicializar o serviço
  async initialize() {
    try {
      console.log('Inicializando LibraryService...');
      
      // Criar diretório de bibliotecas se não existir
      await this.ensureLibrariesDirectory();
      
      // Carregar bibliotecas instaladas do cache local
      await this.loadInstalledLibraries();
      
      // Carregar índice de bibliotecas (cache ou download)
      await this.loadLibraryIndex();
      
      this.isInitialized = true;
      console.log('LibraryService inicializado com sucesso');
      
      return true;
    } catch (error) {
      console.error('Erro ao inicializar LibraryService:', error);
      return false;
    }
  }

  // Garantir que o diretório de bibliotecas existe
  async ensureLibrariesDirectory() {
    try {
      const exists = await RNFS.exists(LIBRARIES_DIR);
      if (!exists) {
        await RNFS.mkdir(LIBRARIES_DIR);
        console.log('Diretório de bibliotecas criado:', LIBRARIES_DIR);
      }
    } catch (error) {
      console.error('Erro ao criar diretório de bibliotecas:', error);
      throw error;
    }
  }

  // Carregar bibliotecas instaladas do AsyncStorage
  async loadInstalledLibraries() {
    try {
      const stored = await AsyncStorage.getItem(LIBRARIES_STORAGE_KEY);
      if (stored) {
        this.installedLibraries = JSON.parse(stored);
        console.log(`${this.installedLibraries.length} bibliotecas instaladas carregadas`);
      } else {
        // Bibliotecas pré-instaladas (simuladas)
        this.installedLibraries = [
          {
            name: 'Servo',
            version: '1.1.8',
            author: 'Michael Margolis, Arduino',
            description: 'Allows Arduino boards to control a variety of servo motors.',
            category: 'Device Control',
            architectures: ['avr', 'esp32', 'esp8266'],
            dependencies: [],
            installed: true,
            installedAt: new Date().toISOString(),
            size: 15420,
            path: `${LIBRARIES_DIR}/Servo`
          },
          {
            name: 'DHT sensor library',
            version: '1.4.4',
            author: 'Adafruit',
            description: 'Arduino library for DHT11, DHT22, etc Temp & Humidity Sensors',
            category: 'Sensors',
            architectures: ['*'],
            dependencies: ['Adafruit Unified Sensor'],
            installed: true,
            installedAt: new Date().toISOString(),
            size: 8960,
            path: `${LIBRARIES_DIR}/DHT_sensor_library`
          }
        ];
        await this.saveInstalledLibraries();
      }
    } catch (error) {
      console.error('Erro ao carregar bibliotecas instaladas:', error);
      this.installedLibraries = [];
    }
  }

  // Salvar bibliotecas instaladas no AsyncStorage
  async saveInstalledLibraries() {
    try {
      await AsyncStorage.setItem(LIBRARIES_STORAGE_KEY, JSON.stringify(this.installedLibraries));
    } catch (error) {
      console.error('Erro ao salvar bibliotecas instaladas:', error);
    }
  }

  // Carregar índice de bibliotecas Arduino
  async loadLibraryIndex() {
    try {
      // Tentar carregar do cache primeiro
      const cached = await AsyncStorage.getItem(LIBRARIES_CACHE_KEY);
      const cacheTime = await AsyncStorage.getItem(`${LIBRARIES_CACHE_KEY}_time`);
      
      // Verificar se o cache é válido (menos de 24 horas)
      const isValidCache = cacheTime && (Date.now() - parseInt(cacheTime)) < 24 * 60 * 60 * 1000;
      
      if (cached && isValidCache) {
        this.libraryIndex = JSON.parse(cached);
        console.log('Índice de bibliotecas carregado do cache');
      } else {
        // Usar índice simulado para desenvolvimento
        this.libraryIndex = this.getSimulatedLibraryIndex();
        console.log('Usando índice simulado de bibliotecas');
        
        // Salvar no cache
        await AsyncStorage.setItem(LIBRARIES_CACHE_KEY, JSON.stringify(this.libraryIndex));
        await AsyncStorage.setItem(`${LIBRARIES_CACHE_KEY}_time`, Date.now().toString());
      }
      
      this.libraries = this.libraryIndex.libraries || [];
    } catch (error) {
      console.error('Erro ao carregar índice de bibliotecas:', error);
      // Fallback para índice simulado
      this.libraryIndex = this.getSimulatedLibraryIndex();
      this.libraries = this.libraryIndex.libraries || [];
    }
  }

  // Índice simulado de bibliotecas para desenvolvimento
  getSimulatedLibraryIndex() {
    return {
      libraries: [
        {
          name: 'Servo',
          version: '1.1.8',
          author: 'Michael Margolis, Arduino',
          maintainer: 'Arduino <info@arduino.cc>',
          sentence: 'Allows Arduino boards to control a variety of servo motors.',
          paragraph: 'This library can control a great number of servos. It makes careful use of timers: the library can control 12 servos using only 1 timer.',
          website: 'http://www.arduino.cc/en/Reference/Servo',
          category: 'Device Control',
          architectures: ['avr', 'esp32', 'esp8266'],
          types: ['Arduino'],
          repository: 'https://github.com/arduino-libraries/Servo.git',
          dependencies: [],
          url: 'https://downloads.arduino.cc/libraries/github.com/arduino-libraries/Servo-1.1.8.zip',
          archiveFileName: 'Servo-1.1.8.zip',
          size: 15420,
          checksum: 'SHA-256:...'
        },
        {
          name: 'DHT sensor library',
          version: '1.4.4',
          author: 'Adafruit',
          maintainer: 'Adafruit <info@adafruit.com>',
          sentence: 'Arduino library for DHT11, DHT22, etc Temp & Humidity Sensors',
          paragraph: 'Arduino library for DHT11, DHT22, etc Temp & Humidity Sensors',
          website: 'https://github.com/adafruit/DHT-sensor-library',
          category: 'Sensors',
          architectures: ['*'],
          types: ['Arduino'],
          repository: 'https://github.com/adafruit/DHT-sensor-library.git',
          dependencies: [
            {
              name: 'Adafruit Unified Sensor',
              version: '>=1.1.0'
            }
          ],
          url: 'https://downloads.arduino.cc/libraries/github.com/adafruit/DHT_sensor_library-1.4.4.zip',
          archiveFileName: 'DHT_sensor_library-1.4.4.zip',
          size: 8960,
          checksum: 'SHA-256:...'
        },
        {
          name: 'LiquidCrystal',
          version: '1.0.7',
          author: 'Arduino, Adafruit',
          maintainer: 'Arduino <info@arduino.cc>',
          sentence: 'Allows communication with alphanumerical liquid crystal displays (LCDs).',
          paragraph: 'This library allows an Arduino board to control LiquidCrystal displays (LCDs) based on the Hitachi HD44780 (or a compatible) chipset, which is found on most text-based LCDs.',
          website: 'http://www.arduino.cc/en/Reference/LiquidCrystal',
          category: 'Display',
          architectures: ['*'],
          types: ['Arduino'],
          repository: 'https://github.com/arduino-libraries/LiquidCrystal.git',
          dependencies: [],
          url: 'https://downloads.arduino.cc/libraries/github.com/arduino-libraries/LiquidCrystal-1.0.7.zip',
          archiveFileName: 'LiquidCrystal-1.0.7.zip',
          size: 12340,
          checksum: 'SHA-256:...'
        },
        {
          name: 'WiFi',
          version: '1.2.7',
          author: 'Arduino',
          maintainer: 'Arduino <info@arduino.cc>',
          sentence: 'Enables network connection (local and Internet) using the Arduino WiFi Shield.',
          paragraph: 'With this library you can instantiate Servers, Clients and send/receive UDP packets through WiFi.',
          website: 'http://www.arduino.cc/en/Reference/WiFi',
          category: 'Communication',
          architectures: ['esp32', 'esp8266'],
          types: ['Arduino'],
          repository: 'https://github.com/arduino-libraries/WiFi.git',
          dependencies: [],
          url: 'https://downloads.arduino.cc/libraries/github.com/arduino-libraries/WiFi-1.2.7.zip',
          archiveFileName: 'WiFi-1.2.7.zip',
          size: 45680,
          checksum: 'SHA-256:...'
        },
        {
          name: 'Adafruit NeoPixel',
          version: '1.10.7',
          author: 'Adafruit',
          maintainer: 'Adafruit <info@adafruit.com>',
          sentence: 'Arduino library for controlling single-wire-based LED pixels and strip.',
          paragraph: 'Arduino library for controlling single-wire-based LED pixels and strip such as those in Adafruit NeoPixel strip or ring.',
          website: 'https://github.com/adafruit/Adafruit_NeoPixel',
          category: 'Display',
          architectures: ['*'],
          types: ['Arduino'],
          repository: 'https://github.com/adafruit/Adafruit_NeoPixel.git',
          dependencies: [],
          url: 'https://downloads.arduino.cc/libraries/github.com/adafruit/Adafruit_NeoPixel-1.10.7.zip',
          archiveFileName: 'Adafruit_NeoPixel-1.10.7.zip',
          size: 67890,
          checksum: 'SHA-256:...'
        },
        {
          name: 'ArduinoJson',
          version: '6.19.4',
          author: 'Benoit Blanchon',
          maintainer: 'Benoit Blanchon <blog@benoitblanchon.fr>',
          sentence: 'An efficient and elegant JSON library for embedded systems.',
          paragraph: 'ArduinoJson supports serialization, deserialization, MessagePack, streams, filtering, and more.',
          website: 'https://arduinojson.org/',
          category: 'Data Processing',
          architectures: ['*'],
          types: ['Arduino'],
          repository: 'https://github.com/bblanchon/ArduinoJson.git',
          dependencies: [],
          url: 'https://downloads.arduino.cc/libraries/github.com/bblanchon/ArduinoJson-6.19.4.zip',
          archiveFileName: 'ArduinoJson-6.19.4.zip',
          size: 234567,
          checksum: 'SHA-256:...'
        }
      ]
    };
  }

  // Buscar bibliotecas por nome ou categoria
  searchLibraries(query, category = null) {
    if (!this.libraries) return [];
    
    let filtered = this.libraries;
    
    // Filtrar por categoria se especificada
    if (category && category !== 'all') {
      filtered = filtered.filter(lib => 
        lib.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Filtrar por query de busca
    if (query && query.trim()) {
      const searchTerm = query.toLowerCase().trim();
      filtered = filtered.filter(lib =>
        lib.name.toLowerCase().includes(searchTerm) ||
        lib.sentence.toLowerCase().includes(searchTerm) ||
        lib.author.toLowerCase().includes(searchTerm) ||
        lib.category.toLowerCase().includes(searchTerm)
      );
    }
    
    // Marcar bibliotecas instaladas
    return filtered.map(lib => ({
      ...lib,
      installed: this.isLibraryInstalled(lib.name),
      installedVersion: this.getInstalledVersion(lib.name)
    }));
  }

  // Verificar se uma biblioteca está instalada
  isLibraryInstalled(libraryName) {
    return this.installedLibraries.some(lib => lib.name === libraryName);
  }

  // Obter versão instalada de uma biblioteca
  getInstalledVersion(libraryName) {
    const installed = this.installedLibraries.find(lib => lib.name === libraryName);
    return installed ? installed.version : null;
  }

  // Obter todas as bibliotecas instaladas
  getInstalledLibraries() {
    return this.installedLibraries;
  }

  // Obter categorias disponíveis
  getCategories() {
    if (!this.libraries) return [];
    
    const categories = [...new Set(this.libraries.map(lib => lib.category))];
    return categories.sort();
  }

  // Instalar uma biblioteca (simulado)
  async installLibrary(library) {
    try {
      console.log(`Instalando biblioteca: ${library.name} v${library.version}`);
      
      // Verificar se já está instalada
      if (this.isLibraryInstalled(library.name)) {
        throw new Error('Biblioteca já está instalada');
      }
      
      // Verificar dependências
      const missingDeps = await this.checkDependencies(library);
      if (missingDeps.length > 0) {
        console.log('Instalando dependências:', missingDeps.map(dep => dep.name));
        // Em uma implementação real, instalaria as dependências automaticamente
      }
      
      // Simular download e instalação
      await this.simulateDownload(library);
      
      // Criar estrutura da biblioteca
      const libraryPath = `${LIBRARIES_DIR}/${library.name.replace(/\s+/g, '_')}`;
      await RNFS.mkdir(libraryPath);
      
      // Criar arquivo library.properties simulado
      const libraryProperties = this.generateLibraryProperties(library);
      await RNFS.writeFile(`${libraryPath}/library.properties`, libraryProperties);
      
      // Adicionar à lista de instaladas
      const installedLibrary = {
        ...library,
        installed: true,
        installedAt: new Date().toISOString(),
        path: libraryPath
      };
      
      this.installedLibraries.push(installedLibrary);
      await this.saveInstalledLibraries();
      
      console.log(`Biblioteca ${library.name} instalada com sucesso`);
      return { success: true, library: installedLibrary };
      
    } catch (error) {
      console.error(`Erro ao instalar biblioteca ${library.name}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Remover uma biblioteca
  async uninstallLibrary(libraryName) {
    try {
      console.log(`Removendo biblioteca: ${libraryName}`);
      
      const libraryIndex = this.installedLibraries.findIndex(lib => lib.name === libraryName);
      if (libraryIndex === -1) {
        throw new Error('Biblioteca não está instalada');
      }
      
      const library = this.installedLibraries[libraryIndex];
      
      // Verificar se outras bibliotecas dependem desta
      const dependents = this.findDependentLibraries(libraryName);
      if (dependents.length > 0) {
        throw new Error(`Não é possível remover. Bibliotecas dependentes: ${dependents.map(dep => dep.name).join(', ')}`);
      }
      
      // Remover arquivos da biblioteca
      if (library.path && await RNFS.exists(library.path)) {
        await RNFS.unlink(library.path);
      }
      
      // Remover da lista
      this.installedLibraries.splice(libraryIndex, 1);
      await this.saveInstalledLibraries();
      
      console.log(`Biblioteca ${libraryName} removida com sucesso`);
      return { success: true };
      
    } catch (error) {
      console.error(`Erro ao remover biblioteca ${libraryName}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Verificar dependências de uma biblioteca
  async checkDependencies(library) {
    const missingDeps = [];
    
    if (library.dependencies && library.dependencies.length > 0) {
      for (const dep of library.dependencies) {
        const depName = typeof dep === 'string' ? dep : dep.name;
        if (!this.isLibraryInstalled(depName)) {
          missingDeps.push(dep);
        }
      }
    }
    
    return missingDeps;
  }

  // Encontrar bibliotecas que dependem de uma biblioteca específica
  findDependentLibraries(libraryName) {
    return this.installedLibraries.filter(lib => {
      if (!lib.dependencies) return false;
      return lib.dependencies.some(dep => {
        const depName = typeof dep === 'string' ? dep : dep.name;
        return depName === libraryName;
      });
    });
  }

  // Simular download de biblioteca
  async simulateDownload(library) {
    return new Promise((resolve) => {
      // Simular tempo de download baseado no tamanho
      const downloadTime = Math.min(library.size / 1000, 3000); // Max 3 segundos
      setTimeout(resolve, downloadTime);
    });
  }

  // Gerar arquivo library.properties
  generateLibraryProperties(library) {
    return `name=${library.name}
version=${library.version}
author=${library.author}
maintainer=${library.maintainer || library.author}
sentence=${library.sentence}
paragraph=${library.paragraph || library.sentence}
category=${library.category}
url=${library.website || ''}
architectures=${library.architectures ? library.architectures.join(',') : '*'}
depends=${library.dependencies ? library.dependencies.map(dep => typeof dep === 'string' ? dep : dep.name).join(',') : ''}
`;
  }

  // Atualizar índice de bibliotecas
  async updateLibraryIndex() {
    try {
      console.log('Atualizando índice de bibliotecas...');
      
      // Limpar cache
      await AsyncStorage.removeItem(LIBRARIES_CACHE_KEY);
      await AsyncStorage.removeItem(`${LIBRARIES_CACHE_KEY}_time`);
      
      // Recarregar índice
      await this.loadLibraryIndex();
      
      console.log('Índice de bibliotecas atualizado');
      return { success: true };
      
    } catch (error) {
      console.error('Erro ao atualizar índice:', error);
      return { success: false, error: error.message };
    }
  }

  // Obter estatísticas das bibliotecas
  getLibraryStats() {
    const totalLibraries = this.libraries ? this.libraries.length : 0;
    const installedCount = this.installedLibraries.length;
    const totalSize = this.installedLibraries.reduce((sum, lib) => sum + (lib.size || 0), 0);
    
    const categories = {};
    this.installedLibraries.forEach(lib => {
      categories[lib.category] = (categories[lib.category] || 0) + 1;
    });
    
    return {
      totalLibraries,
      installedCount,
      totalSize,
      categoriesInstalled: Object.keys(categories).length,
      categoryBreakdown: categories
    };
  }
}

// Singleton instance
const libraryService = new LibraryService();

export default libraryService; 
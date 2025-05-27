# Andruino

Uma IDE (Ambiente de Desenvolvimento Integrado) para programação Arduino desenvolvida em React Native com Expo.

## 📱 Sobre o Projeto

O Andruino IDE é uma aplicação mobile que permite programar placas Arduino diretamente do seu dispositivo Android. Com uma interface moderna e intuitiva, oferece todas as funcionalidades necessárias para desenvolvimento Arduino.

## ✨ Funcionalidades

### 🔐 Autenticação
- Sistema completo de login/registro
- Integração com Supabase
- Recuperação de senha
- Persistência de sessão

### 📝 Editor de Código
- Editor de código Arduino com syntax highlighting
- Templates de código pré-definidos
- Auto-completar e validação
- Console de saída em tempo real

### 📁 Gerenciamento de Projetos
- Criar, editar e excluir projetos
- Duplicar projetos existentes
- Histórico de arquivos recentes
- Sincronização na nuvem

### 🔌 Conectividade USB
- Detecção automática de placas Arduino
- Suporte a múltiplas placas (Uno, Nano, ESP32, etc.)
- Upload de código via USB
- Monitor serial integrado

### ⚙️ Compilação
- Compilação de código Arduino
- Detecção de erros e warnings
- Otimização automática
- Suporte a bibliotecas externas

### 📚 Bibliotecas
- Gerenciador de bibliotecas Arduino
- Instalação automática de dependências
- Biblioteca de exemplos
- Documentação integrada

## 🛠️ Tecnologias Utilizadas

- **React Native** - Framework principal
- **Expo** - Plataforma de desenvolvimento
- **Supabase** - Backend e autenticação
- **React Navigation** - Navegação entre telas
- **AsyncStorage** - Armazenamento local
- **Metro Bundler** - Bundler customizado

## 📋 Pré-requisitos

- Node.js 18+
- Expo CLI
- Android Studio (para emulador)
- Dispositivo Android com USB OTG (para conexão física)

## 🚀 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/[seu-usuario]/andruino.git
cd andruino
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
# Crie um arquivo .env na raiz do projeto
EXPO_PUBLIC_SUPABASE_URL=sua_url_do_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

4. Execute o projeto:
```bash
npx expo start --dev-client
```

## 📱 Como Usar

### Primeiro Acesso
1. Abra o app e crie uma conta
2. Faça login com suas credenciais
3. Crie seu primeiro projeto

### Programando Arduino
1. Conecte sua placa Arduino via USB OTG
2. Escreva seu código no editor
3. Compile o código (botão "Verificar")
4. Faça upload para a placa (botão "Carregar")
5. Use o monitor serial para debug

### Gerenciando Projetos
- **Criar**: Toque em "+" na tela de projetos
- **Editar**: Toque no projeto desejado
- **Duplicar**: Mantenha pressionado e selecione "Duplicar"
- **Excluir**: Mantenha pressionado e selecione "Excluir"

## 🏗️ Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── Button/
│   └── Input/
├── contexts/           # Contextos React
│   └── AuthContext/
├── navigation/         # Configuração de navegação
├── screens/           # Telas da aplicação
│   ├── LoginScreen/
│   ├── EditorScreen/
│   ├── ProjectsScreen/
│   └── SettingsScreen/
├── services/          # Serviços e APIs
│   ├── AuthService/
│   ├── USBService/
│   ├── CompilerService/
│   └── FileService/
└── theme/            # Tema e estilos
    ├── colors.js
    ├── typography.js
    └── spacing.js
```

## 🔧 Configuração de Desenvolvimento

### Metro Bundler
O projeto usa configurações customizadas do Metro para resolver problemas de compatibilidade com bibliotecas Node.js:

```javascript
// metro.config.js
config.resolver.alias = {
  'crypto': require.resolve('react-native-crypto'),
  'stream': require.resolve('readable-stream'),
  'events': require.resolve('events'),
  'util': require.resolve('util'),
};
```

### Supabase
Configure seu projeto Supabase com as seguintes tabelas:
- `projects` - Armazenamento de projetos
- `user_settings` - Configurações do usuário
- `libraries` - Bibliotecas instaladas
- `usage_stats` - Estatísticas de uso

## 🐛 Problemas Conhecidos

### WebSocket/ws Library
Se encontrar erros relacionados à biblioteca `ws`, certifique-se de que:
- As dependências de polyfill estão instaladas
- O metro.config.js está configurado corretamente
- O realtime do Supabase está desabilitado

### Conexão USB
- Certifique-se de que o dispositivo suporta USB OTG
- Habilite as permissões USB no Android
- Use cabos USB de qualidade

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

- **Desenvolvedor Principal** - *Trabalho inicial* - [Luiz Rocha](https://github.com/devbaruque)

## 🙏 Agradecimentos

- Comunidade Arduino
- Equipe do Expo
- Contribuidores do Supabase
- Comunidade React Native

## 📞 Suporte

Se você encontrar algum problema ou tiver dúvidas:

1. Verifique as [Issues](https://github.com/[seu-usuario]/andruino/issues) existentes
2. Crie uma nova issue se necessário
3. Entre em contato através do email: [seu-email]

---

**Desenvolvido com ❤️ para a comunidade Arduino** 

// Sistema de cores baseado no Arduino IDE
export const colors = {
  // Cores principais
  primary: '#3498db', // Azul principal
  secondary: '#2c3e50', // Azul escuro
  accent: '#f39c12', // Laranja/amarelo

  // Backgrounds
  background: {
    primary: '#2c3e50', // Fundo principal
    secondary: '#34495e', // Fundo secundário
    tertiary: '#1a252f', // Fundo console
    card: '#34495e', // Fundo de cards
  },

  // Textos
  text: {
    primary: '#ecf0f1', // Texto principal (branco)
    secondary: '#bdc3c7', // Texto secundário
    tertiary: '#95a5a6', // Texto terciário
    placeholder: '#7f8c8d', // Placeholder
    active: '#ffffff', // Texto ativo
  },

  // Estados
  success: '#27ae60', // Verde
  error: '#e74c3c', // Vermelho
  warning: '#f39c12', // Laranja
  info: '#3498db', // Azul

  // Bordas
  border: {
    primary: '#4a5f7a',
    secondary: '#34495e',
  },

  // Botões
  button: {
    primary: '#3498db',
    secondary: '#34495e',
    success: '#27ae60',
    danger: '#e74c3c',
    disabled: '#7fb3d3',
    active: '#2980b9', // Botão ativo
  },

  // Syntax Highlighting para o editor de código
  syntax: {
    keyword: '#e74c3c', // Vermelho para palavras-chave (void, int, if, etc.)
    function: '#3498db', // Azul para funções (setup, loop, pinMode, etc.)
    string: '#27ae60', // Verde para strings
    number: '#f39c12', // Laranja para números
    comment: '#95a5a6', // Cinza para comentários
    constant: '#9b59b6', // Roxo para constantes (HIGH, LOW, etc.)
    preprocessor: '#e67e22', // Laranja escuro para preprocessor (#include, #define)
    operator: '#ecf0f1', // Branco para operadores (+, -, =, etc.)
    bracket: '#f1c40f', // Amarelo para chaves, parênteses
    variable: '#ecf0f1', // Branco para variáveis
    type: '#e74c3c', // Vermelho para tipos de dados
  },

  // Transparências
  overlay: 'rgba(0, 0, 0, 0.5)',
  transparent: 'transparent',
};

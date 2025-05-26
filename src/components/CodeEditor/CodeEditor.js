import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import {colors, typography, spacing} from '../../theme';

const {width: screenWidth} = Dimensions.get('window');

// Palavras-chave do Arduino/C++
const ARDUINO_KEYWORDS = {
  types: ['void', 'int', 'float', 'double', 'char', 'byte', 'boolean', 'String', 'long', 'unsigned', 'const'],
  functions: ['setup', 'loop', 'pinMode', 'digitalWrite', 'digitalRead', 'analogRead', 'analogWrite', 'delay', 'Serial.begin', 'Serial.print', 'Serial.println'],
  constants: ['HIGH', 'LOW', 'INPUT', 'OUTPUT', 'INPUT_PULLUP', 'true', 'false', 'LED_BUILTIN'],
  control: ['if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'return'],
  preprocessor: ['#include', '#define', '#ifdef', '#ifndef', '#endif'],
};

// Snippets de código comum
const CODE_SNIPPETS = {
  'setup': 'void setup() {\n  // Código de inicialização\n  \n}',
  'loop': 'void loop() {\n  // Código principal\n  \n}',
  'serial': 'Serial.begin(9600);\nSerial.println("Hello World!");',
  'led': 'pinMode(LED_BUILTIN, OUTPUT);\ndigitalWrite(LED_BUILTIN, HIGH);',
  'button': 'int buttonPin = 2;\npinMode(buttonPin, INPUT_PULLUP);\nif (digitalRead(buttonPin) == LOW) {\n  // Botão pressionado\n}',
  'analog': 'int sensorValue = analogRead(A0);\nfloat voltage = sensorValue * (5.0 / 1023.0);',
};

const CodeEditor = ({
  value = '',
  onChangeText,
  placeholder = 'Digite seu código Arduino aqui...',
  style,
  editable = true,
}) => {
  const [code, setCode] = useState(value);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteOptions, setAutocompleteOptions] = useState([]);
  const [currentWord, setCurrentWord] = useState('');
  const [showSnippets, setShowSnippets] = useState(false);
  const [lineNumbers, setLineNumbers] = useState(['1']);
  
  const textInputRef = useRef(null);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    setCode(value);
    updateLineNumbers(value);
  }, [value]);

  // Atualizar numeração de linhas
  const updateLineNumbers = (text) => {
    const lines = text.split('\n');
    const numbers = lines.map((_, index) => (index + 1).toString());
    setLineNumbers(numbers);
  };

  // Manipular mudança de texto
  const handleTextChange = (text) => {
    setCode(text);
    updateLineNumbers(text);
    
    if (onChangeText) {
      onChangeText(text);
    }

    // Verificar autocomplete
    checkAutocomplete(text);
  };

  // Verificar se deve mostrar autocomplete
  const checkAutocomplete = (text) => {
    const lines = text.split('\n');
    const currentLineIndex = text.substring(0, cursorPosition).split('\n').length - 1;
    const currentLine = lines[currentLineIndex] || '';
    const cursorInLine = cursorPosition - text.substring(0, text.lastIndexOf('\n', cursorPosition - 1) + 1).length;
    
    // Encontrar palavra atual
    const beforeCursor = currentLine.substring(0, cursorInLine);
    const wordMatch = beforeCursor.match(/\w+$/);
    const word = wordMatch ? wordMatch[0] : '';
    
    setCurrentWord(word);

    if (word.length >= 2) {
      const options = findAutocompleteOptions(word);
      if (options.length > 0) {
        setAutocompleteOptions(options);
        setShowAutocomplete(true);
      } else {
        setShowAutocomplete(false);
      }
    } else {
      setShowAutocomplete(false);
    }
  };

  // Encontrar opções de autocomplete
  const findAutocompleteOptions = (word) => {
    const allKeywords = [
      ...ARDUINO_KEYWORDS.types,
      ...ARDUINO_KEYWORDS.functions,
      ...ARDUINO_KEYWORDS.constants,
      ...ARDUINO_KEYWORDS.control,
      ...ARDUINO_KEYWORDS.preprocessor,
    ];

    return allKeywords
      .filter(keyword => keyword.toLowerCase().startsWith(word.toLowerCase()))
      .slice(0, 8); // Limitar a 8 opções
  };

  // Aplicar autocomplete
  const applyAutocomplete = (option) => {
    const lines = code.split('\n');
    const currentLineIndex = code.substring(0, cursorPosition).split('\n').length - 1;
    const currentLine = lines[currentLineIndex] || '';
    const cursorInLine = cursorPosition - code.substring(0, code.lastIndexOf('\n', cursorPosition - 1) + 1).length;
    
    const beforeWord = currentLine.substring(0, cursorInLine - currentWord.length);
    const afterWord = currentLine.substring(cursorInLine);
    
    const newLine = beforeWord + option + afterWord;
    lines[currentLineIndex] = newLine;
    
    const newCode = lines.join('\n');
    const newCursorPosition = cursorPosition - currentWord.length + option.length;
    
    setCode(newCode);
    updateLineNumbers(newCode);
    setShowAutocomplete(false);
    
    if (onChangeText) {
      onChangeText(newCode);
    }

    // Focar no TextInput e posicionar cursor
    setTimeout(() => {
      textInputRef.current?.focus();
      textInputRef.current?.setNativeProps({
        selection: {start: newCursorPosition, end: newCursorPosition}
      });
    }, 100);
  };

  // Inserir snippet
  const insertSnippet = (snippetKey) => {
    const snippet = CODE_SNIPPETS[snippetKey];
    if (!snippet) return;

    const newCode = code + '\n\n' + snippet;
    setCode(newCode);
    updateLineNumbers(newCode);
    setShowSnippets(false);
    
    if (onChangeText) {
      onChangeText(newCode);
    }
  };

  // Formatar código (indentação básica)
  const formatCode = () => {
    const lines = code.split('\n');
    let indentLevel = 0;
    const indentSize = 2;
    
    const formattedLines = lines.map(line => {
      const trimmed = line.trim();
      
      // Diminuir indentação para fechamento de blocos
      if (trimmed.includes('}')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      
      const indentedLine = ' '.repeat(indentLevel * indentSize) + trimmed;
      
      // Aumentar indentação para abertura de blocos
      if (trimmed.includes('{')) {
        indentLevel++;
      }
      
      return indentedLine;
    });
    
    const formattedCode = formattedLines.join('\n');
    setCode(formattedCode);
    updateLineNumbers(formattedCode);
    
    if (onChangeText) {
      onChangeText(formattedCode);
    }
  };

  // Renderizar texto com syntax highlighting (simplificado)
  const renderHighlightedText = () => {
    const lines = code.split('\n');
    
    return lines.map((line, lineIndex) => {
      const highlightedLine = highlightSyntax(line);
      
      return (
        <View key={lineIndex} style={styles.codeLine}>
          <Text style={styles.lineNumber}>{lineIndex + 1}</Text>
          <Text style={styles.codeText}>{highlightedLine}</Text>
        </View>
      );
    });
  };

  // Highlight de sintaxe básico
  const highlightSyntax = (line) => {
    // Esta é uma implementação simplificada
    // Em uma IDE real, seria usado um parser mais sofisticado
    let highlightedLine = line;
    
    // Comentários
    if (line.trim().startsWith('//')) {
      return <Text style={styles.comment}>{line}</Text>;
    }
    
    // Strings
    const stringRegex = /"[^"]*"/g;
    const strings = line.match(stringRegex);
    if (strings) {
      strings.forEach(str => {
        highlightedLine = highlightedLine.replace(str, `<STRING>${str}</STRING>`);
      });
    }
    
    // Números
    const numberRegex = /\b\d+\.?\d*\b/g;
    const numbers = line.match(numberRegex);
    if (numbers) {
      numbers.forEach(num => {
        highlightedLine = highlightedLine.replace(new RegExp(`\\b${num}\\b`), `<NUMBER>${num}</NUMBER>`);
      });
    }
    
    // Palavras-chave
    Object.values(ARDUINO_KEYWORDS).flat().forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      highlightedLine = highlightedLine.replace(regex, `<KEYWORD>${keyword}</KEYWORD>`);
    });
    
    return highlightedLine;
  };

  return (
    <View style={[styles.container, style]}>
      {/* Toolbar do editor */}
      <View style={styles.toolbar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={styles.toolButton}
            onPress={() => setShowSnippets(!showSnippets)}>
            <Text style={styles.toolButtonText}>📝 Snippets</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.toolButton}
            onPress={formatCode}>
            <Text style={styles.toolButtonText}>🎨 Formatar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.toolButton}
            onPress={() => Alert.alert('Info', `Linhas: ${lineNumbers.length}\nCaracteres: ${code.length}`)}>
            <Text style={styles.toolButtonText}>📊 Info</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Painel de snippets */}
      {showSnippets && (
        <View style={styles.snippetsPanel}>
          <Text style={styles.snippetsTitle}>Snippets de Código:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {Object.keys(CODE_SNIPPETS).map(key => (
              <TouchableOpacity
                key={key}
                style={styles.snippetButton}
                onPress={() => insertSnippet(key)}>
                <Text style={styles.snippetButtonText}>{key}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Editor principal */}
      <View style={styles.editorContainer}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}>
          
          {/* TextInput invisível para capturar entrada */}
          <TextInput
            ref={textInputRef}
            style={styles.hiddenInput}
            value={code}
            onChangeText={handleTextChange}
            onSelectionChange={(event) => {
              setCursorPosition(event.nativeEvent.selection.start);
            }}
            multiline
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            editable={editable}
            placeholder={placeholder}
            placeholderTextColor={colors.text.placeholder}
          />
          
          {/* Overlay com syntax highlighting */}
          <View style={styles.syntaxOverlay} pointerEvents="none">
            {renderHighlightedText()}
          </View>
        </ScrollView>
      </View>

      {/* Autocomplete */}
      {showAutocomplete && (
        <View style={styles.autocompleteContainer}>
          <Text style={styles.autocompleteTitle}>Sugestões:</Text>
          {autocompleteOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.autocompleteOption}
              onPress={() => applyAutocomplete(option)}>
              <Text style={styles.autocompleteText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: spacing.borderRadius.md,
    borderWidth: spacing.borderWidth.thin,
    borderColor: colors.border.primary,
  },
  toolbar: {
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: spacing.borderWidth.thin,
    borderBottomColor: colors.border.primary,
  },
  toolButton: {
    backgroundColor: colors.button.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginRight: spacing.sm,
    borderRadius: spacing.borderRadius.sm,
  },
  toolButtonText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.sm,
  },
  snippetsPanel: {
    backgroundColor: colors.background.tertiary,
    padding: spacing.md,
    borderBottomWidth: spacing.borderWidth.thin,
    borderBottomColor: colors.border.primary,
  },
  snippetsTitle: {
    color: colors.text.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  snippetButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginRight: spacing.sm,
    borderRadius: spacing.borderRadius.sm,
  },
  snippetButtonText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.sm,
  },
  editorContainer: {
    flex: 1,
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  hiddenInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    color: 'transparent',
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.mono,
    padding: spacing.md,
    textAlignVertical: 'top',
    zIndex: 1,
  },
  syntaxOverlay: {
    padding: spacing.md,
    zIndex: 0,
  },
  codeLine: {
    flexDirection: 'row',
    minHeight: typography.lineHeight.base * typography.fontSize.base,
  },
  lineNumber: {
    color: colors.text.placeholder,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.mono,
    width: 40,
    textAlign: 'right',
    marginRight: spacing.md,
    paddingTop: 2,
  },
  codeText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.mono,
    flex: 1,
    lineHeight: typography.lineHeight.base * typography.fontSize.base,
  },
  comment: {
    color: colors.syntax.comment,
    fontStyle: 'italic',
  },
  keyword: {
    color: colors.syntax.keyword,
    fontWeight: typography.fontWeight.semibold,
  },
  string: {
    color: colors.syntax.string,
  },
  number: {
    color: colors.syntax.number,
  },
  autocompleteContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background.primary,
    borderTopWidth: spacing.borderWidth.thin,
    borderTopColor: colors.border.primary,
    maxHeight: 150,
    padding: spacing.md,
  },
  autocompleteTitle: {
    color: colors.text.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  autocompleteOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.secondary,
    marginBottom: spacing.xs,
    borderRadius: spacing.borderRadius.sm,
  },
  autocompleteText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.mono,
  },
});

export default CodeEditor; 
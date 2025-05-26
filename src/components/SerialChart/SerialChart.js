import React, {useState, useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Dimensions, TouchableOpacity} from 'react-native';
import {LineChart} from 'react-native-chart-kit';
import {colors, typography, spacing} from '../../theme';

const {width: screenWidth} = Dimensions.get('window');

const SerialChart = ({
  serialData,
  isVisible = false,
  onToggle,
  maxDataPoints = 50,
}) => {
  const [chartData, setChartData] = useState([]);
  const [labels, setLabels] = useState([]);
  const [isEnabled, setIsEnabled] = useState(false);
  const [dataType, setDataType] = useState('single'); // 'single' ou 'multiple'
  const [datasets, setDatasets] = useState([]);
  const dataBuffer = useRef([]);
  const timeRef = useRef(0);

  // Processar dados seriais em tempo real
  useEffect(() => {
    if (!isEnabled || !serialData) return;

    const lines = serialData.split('\n');
    const lastLine = lines[lines.length - 2]; // Pegar a penúltima linha (última pode estar incompleta)
    
    if (lastLine && lastLine.trim()) {
      processSerialLine(lastLine.trim());
    }
  }, [serialData, isEnabled]);

  // Processar linha de dados serial
  const processSerialLine = (line) => {
    try {
      // Tentar detectar formato dos dados
      const numbers = extractNumbers(line);
      
      if (numbers.length === 0) return;

      const timestamp = timeRef.current++;
      
      if (numbers.length === 1) {
        // Dados únicos
        setDataType('single');
        updateSingleDataset(numbers[0], timestamp);
      } else {
        // Múltiplos valores
        setDataType('multiple');
        updateMultipleDatasets(numbers, timestamp);
      }
    } catch (error) {
      console.warn('Erro ao processar dados do gráfico:', error);
    }
  };

  // Extrair números de uma linha
  const extractNumbers = (line) => {
    // Remover caracteres não numéricos exceto pontos, vírgulas e sinais
    const cleanLine = line.replace(/[^\d\.\,\-\s]/g, ' ');
    
    // Encontrar todos os números (incluindo decimais)
    const matches = cleanLine.match(/-?\d+(?:[.,]\d+)?/g);
    
    if (!matches) return [];
    
    return matches.map(match => {
      // Converter vírgula para ponto se necessário
      const normalized = match.replace(',', '.');
      return parseFloat(normalized);
    }).filter(num => !isNaN(num));
  };

  // Atualizar dataset único
  const updateSingleDataset = (value, timestamp) => {
    setChartData(prev => {
      const newData = [...prev, value];
      return newData.slice(-maxDataPoints);
    });
    
    setLabels(prev => {
      const newLabels = [...prev, timestamp.toString()];
      return newLabels.slice(-maxDataPoints);
    });
  };

  // Atualizar múltiplos datasets
  const updateMultipleDatasets = (values, timestamp) => {
    setDatasets(prev => {
      const newDatasets = [...prev];
      
      values.forEach((value, index) => {
        if (!newDatasets[index]) {
          newDatasets[index] = {
            data: [],
            color: getColorForIndex(index),
            strokeWidth: 2,
          };
        }
        
        newDatasets[index].data = [...newDatasets[index].data, value].slice(-maxDataPoints);
      });
      
      return newDatasets;
    });
    
    setLabels(prev => {
      const newLabels = [...prev, timestamp.toString()];
      return newLabels.slice(-maxDataPoints);
    });
  };

  // Obter cor para índice do dataset
  const getColorForIndex = (index) => {
    const colors = [
      '#3498db', // Azul
      '#e74c3c', // Vermelho
      '#2ecc71', // Verde
      '#f39c12', // Laranja
      '#9b59b6', // Roxo
      '#1abc9c', // Turquesa
    ];
    return () => colors[index % colors.length];
  };

  // Limpar dados
  const clearData = () => {
    setChartData([]);
    setLabels([]);
    setDatasets([]);
    dataBuffer.current = [];
    timeRef.current = 0;
  };

  // Alternar habilitação do gráfico
  const toggleChart = () => {
    const newEnabled = !isEnabled;
    setIsEnabled(newEnabled);
    
    if (!newEnabled) {
      clearData();
    }
  };

  // Preparar dados para o gráfico
  const getChartData = () => {
    if (dataType === 'single' && chartData.length > 0) {
      return {
        labels: labels.map((_, index) => index % 5 === 0 ? index.toString() : ''),
        datasets: [{
          data: chartData,
          color: () => colors.primary,
          strokeWidth: 2,
        }],
      };
    }
    
    if (dataType === 'multiple' && datasets.length > 0) {
      return {
        labels: labels.map((_, index) => index % 5 === 0 ? index.toString() : ''),
        datasets: datasets.filter(dataset => dataset.data.length > 0),
      };
    }
    
    // Dados padrão quando não há dados
    return {
      labels: ['0'],
      datasets: [{
        data: [0],
        color: () => colors.text.tertiary,
        strokeWidth: 1,
      }],
    };
  };

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      {/* Header do gráfico */}
      <View style={styles.header}>
        <Text style={styles.title}>Gráfico Serial</Text>
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlButton, isEnabled && styles.controlButtonActive]}
            onPress={toggleChart}>
            <Text style={[styles.controlButtonText, isEnabled && styles.controlButtonTextActive]}>
              {isEnabled ? 'Ativo' : 'Inativo'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton} onPress={clearData}>
            <Text style={styles.controlButtonText}>Limpar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Informações do gráfico */}
      <View style={styles.info}>
        <Text style={styles.infoText}>
          Tipo: {dataType === 'single' ? 'Valor único' : `${datasets.length} valores`} | 
          Pontos: {dataType === 'single' ? chartData.length : Math.max(...datasets.map(d => d.data.length))} | 
          Status: {isEnabled ? 'Coletando' : 'Pausado'}
        </Text>
      </View>

      {/* Gráfico */}
      <View style={styles.chartContainer}>
        {isEnabled && (chartData.length > 0 || datasets.length > 0) ? (
          <LineChart
            data={getChartData()}
            width={screenWidth - 32}
            height={200}
            chartConfig={{
              backgroundColor: colors.background.secondary,
              backgroundGradientFrom: colors.background.secondary,
              backgroundGradientTo: colors.background.secondary,
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(189, 195, 199, ${opacity})`,
              style: {
                borderRadius: 8,
              },
              propsForDots: {
                r: '2',
                strokeWidth: '1',
              },
              propsForLabels: {
                fontSize: 10,
              },
            }}
            bezier
            style={styles.chart}
            withInnerLines={false}
            withOuterLines={true}
            withVerticalLines={false}
            withHorizontalLines={true}
            segments={4}
          />
        ) : (
          <View style={styles.emptyChart}>
            <Text style={styles.emptyChartText}>
              {isEnabled ? 'Aguardando dados numéricos...' : 'Gráfico desabilitado'}
            </Text>
            <Text style={styles.emptyChartSubtext}>
              {isEnabled ? 'Envie dados numéricos pelo serial para visualizar' : 'Ative o gráfico para começar a coletar dados'}
            </Text>
          </View>
        )}
      </View>

      {/* Legenda para múltiplos datasets */}
      {dataType === 'multiple' && datasets.length > 1 && (
        <View style={styles.legend}>
          {datasets.map((dataset, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, {backgroundColor: dataset.color()}]} />
              <Text style={styles.legendText}>Valor {index + 1}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
    margin: spacing.md,
    borderRadius: spacing.borderRadius.md,
    borderWidth: spacing.borderWidth.thin,
    borderColor: colors.border.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: spacing.borderWidth.thin,
    borderBottomColor: colors.border.primary,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  controls: {
    flexDirection: 'row',
  },
  controlButton: {
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius.sm,
    marginLeft: spacing.xs,
    borderWidth: spacing.borderWidth.thin,
    borderColor: colors.border.primary,
  },
  controlButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  controlButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  controlButtonTextActive: {
    color: colors.text.primary,
  },
  info: {
    padding: spacing.sm,
    backgroundColor: colors.background.tertiary,
  },
  infoText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  chartContainer: {
    padding: spacing.md,
    alignItems: 'center',
  },
  chart: {
    borderRadius: spacing.borderRadius.md,
  },
  emptyChart: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: spacing.borderRadius.md,
    width: screenWidth - 64,
  },
  emptyChartText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  emptyChartSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.md,
    borderTopWidth: spacing.borderWidth.thin,
    borderTopColor: colors.border.primary,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
    marginBottom: spacing.xs,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.xs,
  },
  legendText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
});

export default SerialChart; 
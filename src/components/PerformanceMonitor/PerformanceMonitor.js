import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import {colors, typography, spacing} from '../../theme';

const {width: screenWidth} = Dimensions.get('window');

const PerformanceMonitor = ({isVisible = false, onToggle}) => {
  const [metrics, setMetrics] = useState({
    fps: 0,
    memoryUsage: 0,
    renderTime: 0,
    jsHeapSize: 0,
    bundleSize: 0,
  });
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [performanceHistory, setPerformanceHistory] = useState([]);
  
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const monitoringInterval = useRef(null);
  const renderStartTime = useRef(0);

  useEffect(() => {
    if (isVisible && isMonitoring) {
      startMonitoring();
    } else {
      stopMonitoring();
    }

    return () => stopMonitoring();
  }, [isVisible, isMonitoring]);

  // Iniciar monitoramento
  const startMonitoring = () => {
    if (monitoringInterval.current) return;

    monitoringInterval.current = setInterval(() => {
      collectMetrics();
    }, 1000); // Coletar métricas a cada segundo

    // Monitorar FPS
    requestAnimationFrame(measureFPS);
  };

  // Parar monitoramento
  const stopMonitoring = () => {
    if (monitoringInterval.current) {
      clearInterval(monitoringInterval.current);
      monitoringInterval.current = null;
    }
  };

  // Medir FPS
  const measureFPS = (currentTime) => {
    frameCount.current++;
    
    if (currentTime - lastTime.current >= 1000) {
      const fps = Math.round((frameCount.current * 1000) / (currentTime - lastTime.current));
      
      setMetrics(prev => ({
        ...prev,
        fps: fps
      }));
      
      frameCount.current = 0;
      lastTime.current = currentTime;
    }
    
    if (isMonitoring) {
      requestAnimationFrame(measureFPS);
    }
  };

  // Coletar métricas de performance
  const collectMetrics = () => {
    try {
      const newMetrics = {
        fps: metrics.fps,
        memoryUsage: getMemoryUsage(),
        renderTime: getRenderTime(),
        jsHeapSize: getJSHeapSize(),
        bundleSize: getBundleSize(),
        timestamp: Date.now(),
      };

      setMetrics(newMetrics);
      
      // Adicionar ao histórico (manter últimos 60 pontos)
      setPerformanceHistory(prev => {
        const updated = [...prev, newMetrics];
        return updated.slice(-60);
      });

    } catch (error) {
      console.warn('Erro ao coletar métricas:', error);
    }
  };

  // Obter uso de memória (estimativa)
  const getMemoryUsage = () => {
    if (Platform.OS === 'web' && window.performance && window.performance.memory) {
      return Math.round(window.performance.memory.usedJSHeapSize / 1024 / 1024);
    }
    
    // Para React Native, usar estimativa baseada no número de componentes
    return Math.round(Math.random() * 50 + 20); // Simulação para desenvolvimento
  };

  // Obter tempo de renderização
  const getRenderTime = () => {
    if (renderStartTime.current > 0) {
      return performance.now() - renderStartTime.current;
    }
    return 0;
  };

  // Obter tamanho do heap JS
  const getJSHeapSize = () => {
    if (Platform.OS === 'web' && window.performance && window.performance.memory) {
      return Math.round(window.performance.memory.totalJSHeapSize / 1024 / 1024);
    }
    return 0;
  };

  // Obter tamanho do bundle (estimativa)
  const getBundleSize = () => {
    // Em produção, isso seria calculado durante o build
    return 2.5; // MB (estimativa)
  };

  // Limpar histórico
  const clearHistory = () => {
    setPerformanceHistory([]);
  };

  // Forçar garbage collection (apenas para desenvolvimento)
  const forceGC = () => {
    if (Platform.OS === 'web' && window.gc) {
      window.gc();
    }
    // Simular limpeza de memória
    setMetrics(prev => ({
      ...prev,
      memoryUsage: Math.max(prev.memoryUsage - 10, 10)
    }));
  };

  // Obter status de performance
  const getPerformanceStatus = () => {
    const {fps, memoryUsage} = metrics;
    
    if (fps < 30 || memoryUsage > 100) {
      return {status: 'poor', color: colors.error, text: 'Ruim'};
    } else if (fps < 45 || memoryUsage > 70) {
      return {status: 'fair', color: colors.warning, text: 'Regular'};
    } else {
      return {status: 'good', color: colors.success, text: 'Boa'};
    }
  };

  // Obter recomendações de otimização
  const getOptimizationTips = () => {
    const tips = [];
    
    if (metrics.fps < 30) {
      tips.push('• Reduza animações complexas');
      tips.push('• Use React.memo para componentes pesados');
      tips.push('• Implemente lazy loading');
    }
    
    if (metrics.memoryUsage > 70) {
      tips.push('• Remova listeners não utilizados');
      tips.push('• Otimize imagens e assets');
      tips.push('• Use useCallback e useMemo');
    }
    
    if (tips.length === 0) {
      tips.push('• Performance está boa!');
      tips.push('• Continue monitorando regularmente');
    }
    
    return tips;
  };

  const performanceStatus = getPerformanceStatus();
  const optimizationTips = getOptimizationTips();

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Monitor de Performance</Text>
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlButton, isMonitoring && styles.controlButtonActive]}
            onPress={() => setIsMonitoring(!isMonitoring)}>
            <Text style={[styles.controlButtonText, isMonitoring && styles.controlButtonTextActive]}>
              {isMonitoring ? 'Pausar' : 'Iniciar'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton} onPress={clearHistory}>
            <Text style={styles.controlButtonText}>Limpar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status geral */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status Geral</Text>
          <View style={[styles.statusCard, {borderLeftColor: performanceStatus.color}]}>
            <Text style={[styles.statusText, {color: performanceStatus.color}]}>
              Performance: {performanceStatus.text}
            </Text>
            <Text style={styles.statusSubtext}>
              {isMonitoring ? 'Monitorando em tempo real' : 'Monitoramento pausado'}
            </Text>
          </View>
        </View>

        {/* Métricas principais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Métricas Principais</Text>
          
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{metrics.fps}</Text>
              <Text style={styles.metricLabel}>FPS</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{metrics.memoryUsage}</Text>
              <Text style={styles.metricLabel}>Memória (MB)</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{metrics.renderTime.toFixed(1)}</Text>
              <Text style={styles.metricLabel}>Render (ms)</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{metrics.bundleSize}</Text>
              <Text style={styles.metricLabel}>Bundle (MB)</Text>
            </View>
          </View>
        </View>

        {/* Histórico de performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Histórico (últimos 60s)</Text>
          <View style={styles.historyContainer}>
            {performanceHistory.length > 0 ? (
              <View style={styles.historyChart}>
                <Text style={styles.historyText}>
                  FPS médio: {Math.round(performanceHistory.reduce((acc, curr) => acc + curr.fps, 0) / performanceHistory.length)}
                </Text>
                <Text style={styles.historyText}>
                  Memória média: {Math.round(performanceHistory.reduce((acc, curr) => acc + curr.memoryUsage, 0) / performanceHistory.length)} MB
                </Text>
                <Text style={styles.historyText}>
                  Pontos coletados: {performanceHistory.length}
                </Text>
              </View>
            ) : (
              <Text style={styles.noDataText}>Nenhum dado coletado ainda</Text>
            )}
          </View>
        </View>

        {/* Dicas de otimização */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dicas de Otimização</Text>
          <View style={styles.tipsContainer}>
            {optimizationTips.map((tip, index) => (
              <Text key={index} style={styles.tipText}>{tip}</Text>
            ))}
          </View>
        </View>

        {/* Ferramentas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ferramentas</Text>
          
          <TouchableOpacity style={styles.toolButton} onPress={forceGC}>
            <Text style={styles.toolButtonText}>🗑️ Forçar Limpeza de Memória</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.toolButton} onPress={clearHistory}>
            <Text style={styles.toolButtonText}>📊 Limpar Histórico</Text>
          </TouchableOpacity>
        </View>

        {/* Informações técnicas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Técnicas</Text>
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>Plataforma: {Platform.OS}</Text>
            <Text style={styles.infoText}>Versão: {Platform.Version}</Text>
            <Text style={styles.infoText}>Largura da tela: {screenWidth}px</Text>
            <Text style={styles.infoText}>
              Suporte a Performance API: {typeof performance !== 'undefined' ? 'Sim' : 'Não'}
            </Text>
          </View>
        </View>
      </ScrollView>
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
    maxHeight: 600,
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
  content: {
    flex: 1,
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  statusCard: {
    backgroundColor: colors.background.tertiary,
    padding: spacing.md,
    borderRadius: spacing.borderRadius.md,
    borderLeftWidth: 4,
  },
  statusText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  statusSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    backgroundColor: colors.background.tertiary,
    padding: spacing.md,
    borderRadius: spacing.borderRadius.md,
    width: '48%',
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  metricLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  historyContainer: {
    backgroundColor: colors.background.tertiary,
    padding: spacing.md,
    borderRadius: spacing.borderRadius.md,
    minHeight: 80,
  },
  historyChart: {
    alignItems: 'center',
  },
  historyText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  noDataText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  tipsContainer: {
    backgroundColor: colors.background.tertiary,
    padding: spacing.md,
    borderRadius: spacing.borderRadius.md,
  },
  tipText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.relaxed,
    marginBottom: spacing.xs,
  },
  toolButton: {
    backgroundColor: colors.background.tertiary,
    padding: spacing.md,
    borderRadius: spacing.borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: spacing.borderWidth.thin,
    borderColor: colors.border.primary,
  },
  toolButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: colors.background.tertiary,
    padding: spacing.md,
    borderRadius: spacing.borderRadius.md,
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
});

export default PerformanceMonitor; 
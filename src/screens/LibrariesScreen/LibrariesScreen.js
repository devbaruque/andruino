import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LibraryService from '../../services/LibraryService';
import {colors, typography, spacing} from '../../theme';

export default function LibrariesScreen({navigation}) {
  const [libraries, setLibraries] = useState([]);
  const [filteredLibraries, setFilteredLibraries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    initializeLibraries();
  }, []);

  useEffect(() => {
    filterLibraries();
  }, [searchQuery, selectedCategory, libraries]);

  const initializeLibraries = async () => {
    try {
      setIsLoading(true);
      
      // Inicializar o serviço se necessário
      if (!LibraryService.isInitialized) {
        await LibraryService.initialize();
      }
      
      // Carregar bibliotecas e categorias
      await loadLibraries();
      
    } catch (error) {
      console.error('Erro ao inicializar bibliotecas:', error);
      Alert.alert('Erro', 'Não foi possível carregar as bibliotecas');
    } finally {
      setIsLoading(false);
    }
  };

  const loadLibraries = async () => {
    try {
      // Buscar todas as bibliotecas
      const allLibraries = LibraryService.searchLibraries('', 'all');
      setLibraries(allLibraries);
      
      // Carregar categorias
      const availableCategories = LibraryService.getCategories();
      setCategories(['all', ...availableCategories]);
      
      // Carregar estatísticas
      const libraryStats = LibraryService.getLibraryStats();
      setStats(libraryStats);
      
    } catch (error) {
      console.error('Erro ao carregar bibliotecas:', error);
    }
  };

  const filterLibraries = () => {
    const filtered = LibraryService.searchLibraries(searchQuery, selectedCategory);
    setFilteredLibraries(filtered);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await LibraryService.updateLibraryIndex();
      await loadLibraries();
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      Alert.alert('Erro', 'Não foi possível atualizar as bibliotecas');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleInstallLibrary = async (library) => {
    try {
      Alert.alert(
        'Instalar Biblioteca',
        `Deseja instalar a biblioteca "${library.name}" v${library.version}?`,
        [
          {text: 'Cancelar', style: 'cancel'},
          {
            text: 'Instalar',
            onPress: async () => {
              setIsLoading(true);
              const result = await LibraryService.installLibrary(library);
              
              if (result.success) {
                Alert.alert('Sucesso', `Biblioteca "${library.name}" instalada com sucesso!`);
                await loadLibraries();
              } else {
                Alert.alert('Erro', result.error || 'Erro ao instalar biblioteca');
              }
              setIsLoading(false);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao instalar biblioteca:', error);
      Alert.alert('Erro', 'Erro ao instalar biblioteca');
    }
  };

  const handleUninstallLibrary = async (library) => {
    try {
      Alert.alert(
        'Remover Biblioteca',
        `Deseja remover a biblioteca "${library.name}"?`,
        [
          {text: 'Cancelar', style: 'cancel'},
          {
            text: 'Remover',
            style: 'destructive',
            onPress: async () => {
              setIsLoading(true);
              const result = await LibraryService.uninstallLibrary(library.name);
              
              if (result.success) {
                Alert.alert('Sucesso', `Biblioteca "${library.name}" removida com sucesso!`);
                await loadLibraries();
              } else {
                Alert.alert('Erro', result.error || 'Erro ao remover biblioteca');
              }
              setIsLoading(false);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao remover biblioteca:', error);
      Alert.alert('Erro', 'Erro ao remover biblioteca');
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading && !isRefreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Carregando bibliotecas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Bibliotecas</Text>
        <TouchableOpacity style={styles.updateButton} onPress={handleRefresh}>
          <Text style={styles.updateButtonText}>Atualizar</Text>
        </TouchableOpacity>
      </View>

      {/* Estatísticas */}
      {stats && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {stats.installedCount} instaladas • {stats.totalLibraries} disponíveis • {formatSize(stats.totalSize)}
          </Text>
        </View>
      )}

      {/* Busca */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar bibliotecas..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filtro de Categorias */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === category && styles.categoryButtonTextActive
            ]}>
              {category === 'all' ? 'Todas' : category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Lista de Bibliotecas */}
      <ScrollView 
        style={styles.librariesList}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {filteredLibraries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery || selectedCategory !== 'all' 
                ? 'Nenhuma biblioteca encontrada' 
                : 'Nenhuma biblioteca disponível'
              }
            </Text>
          </View>
        ) : (
          filteredLibraries.map((library, index) => (
            <View key={`${library.name}-${index}`} style={styles.libraryItem}>
              <View style={styles.libraryInfo}>
                <View style={styles.libraryHeader}>
                  <Text style={styles.libraryName}>{library.name}</Text>
                  {library.installed && (
                    <View style={styles.installedBadge}>
                      <Text style={styles.installedBadgeText}>Instalada</Text>
                    </View>
                  )}
                </View>
                
                <Text style={styles.libraryDescription} numberOfLines={2}>
                  {library.sentence || library.description}
                </Text>
                
                <View style={styles.libraryMeta}>
                  <Text style={styles.libraryVersion}>v{library.version}</Text>
                  <Text style={styles.libraryAuthor}>por {library.author}</Text>
                  <Text style={styles.libraryCategory}>{library.category}</Text>
                </View>
                
                <Text style={styles.librarySize}>{formatSize(library.size)}</Text>
              </View>
              
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {backgroundColor: library.installed ? colors.error : colors.success}
                ]}
                onPress={() => library.installed 
                  ? handleUninstallLibrary(library) 
                  : handleInstallLibrary(library)
                }
              >
                <Text style={styles.actionButtonText}>
                  {library.installed ? 'Remover' : 'Instalar'}
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  updateButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.xs,
  },
  updateButtonText: {
    color: colors.white,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.sm,
  },
  statsContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  statsText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  searchInput: {
    backgroundColor: colors.surface,
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoriesContainer: {
    paddingLeft: spacing.lg,
    marginBottom: spacing.sm,
  },
  categoriesContent: {
    paddingRight: spacing.lg,
  },
  categoryButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.sm,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  categoryButtonTextActive: {
    color: colors.white,
  },
  librariesList: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  libraryItem: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: spacing.sm,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: colors.border,
  },
  libraryInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  libraryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  libraryName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    flex: 1,
  },
  installedBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: spacing.xs,
  },
  installedBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.white,
    fontWeight: typography.fontWeight.bold,
  },
  libraryDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    lineHeight: 18,
  },
  libraryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  libraryVersion: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  libraryAuthor: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginRight: spacing.sm,
    flex: 1,
  },
  libraryCategory: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  librarySize: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  actionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.xs,
    minWidth: 80,
    alignItems: 'center',
  },
  actionButtonText: {
    color: colors.white,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.sm,
  },
});

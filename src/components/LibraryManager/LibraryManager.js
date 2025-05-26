import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import LibraryService from '../../services/LibraryService';
import NotificationService from '../../services/NotificationService/NotificationService';
import {colors, typography, spacing} from '../../theme';

const LibraryManager = ({
  visible,
  onClose,
  projectLibraries = [],
  onLibrariesChange,
}) => {
  const [libraries, setLibraries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadLibraries();
    }
  }, [visible]);

  useEffect(() => {
    filterLibraries();
  }, [searchQuery, selectedCategory]);

  const loadLibraries = async () => {
    try {
      setIsLoading(true);
      
      // Inicializar o serviço se necessário
      if (!LibraryService.isInitialized) {
        await LibraryService.initialize();
      }
      
      // Carregar todas as bibliotecas instaladas
      const installedLibraries = LibraryService.getInstalledLibraries();
      setLibraries(installedLibraries);
      
      // Carregar categorias
      const availableCategories = LibraryService.getCategories();
      setCategories(['all', ...availableCategories]);
      
    } catch (error) {
      console.error('Erro ao carregar bibliotecas:', error);
      Alert.alert('Erro', 'Não foi possível carregar as bibliotecas');
    } finally {
      setIsLoading(false);
    }
  };

  const filterLibraries = () => {
    let filtered = libraries;
    
    // Filtrar por categoria
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(lib => 
        lib.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    // Filtrar por busca
    if (searchQuery && searchQuery.trim()) {
      const searchTerm = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(lib =>
        lib.name.toLowerCase().includes(searchTerm) ||
        lib.description.toLowerCase().includes(searchTerm) ||
        lib.author.toLowerCase().includes(searchTerm)
      );
    }
    
    return filtered;
  };

  const isLibraryInProject = (libraryName) => {
    return projectLibraries.includes(libraryName);
  };

  const handleToggleLibrary = (library) => {
    const isInProject = isLibraryInProject(library.name);
    let updatedLibraries;
    
    if (isInProject) {
      // Remover biblioteca do projeto
      updatedLibraries = projectLibraries.filter(name => name !== library.name);
      NotificationService.showLibraryNotification('uninstalled', library.name);
    } else {
      // Adicionar biblioteca ao projeto
      updatedLibraries = [...projectLibraries, library.name];
      NotificationService.showLibraryNotification('installed', library.name);
    }
    
    onLibrariesChange(updatedLibraries);
  };

  const handleAddAllDependencies = (library) => {
    if (!library.dependencies || library.dependencies.length === 0) {
      handleToggleLibrary(library);
      return;
    }
    
    Alert.alert(
      'Adicionar Dependências',
      `A biblioteca "${library.name}" possui dependências. Deseja adicionar todas as dependências também?`,
      [
        {
          text: 'Apenas esta biblioteca',
          onPress: () => handleToggleLibrary(library)
        },
        {
          text: 'Com dependências',
          onPress: () => {
            let updatedLibraries = [...projectLibraries];
            let addedCount = 0;
            
            // Adicionar biblioteca principal
            if (!updatedLibraries.includes(library.name)) {
              updatedLibraries.push(library.name);
              addedCount++;
            }
            
            // Adicionar dependências
            library.dependencies.forEach(dep => {
              const depName = typeof dep === 'string' ? dep : dep.name;
              if (!updatedLibraries.includes(depName)) {
                updatedLibraries.push(depName);
                addedCount++;
              }
            });
            
            onLibrariesChange(updatedLibraries);
            
            // Notificar sobre as bibliotecas adicionadas
            if (addedCount > 1) {
              NotificationService.showLibraryNotification(
                'installed', 
                library.name, 
                `${library.name} e ${addedCount - 1} dependências adicionadas`
              );
            } else {
              NotificationService.showLibraryNotification('installed', library.name);
            }
          }
        }
      ]
    );
  };

  const filteredLibraries = filterLibraries();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Gerenciar Bibliotecas</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Fechar</Text>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            {projectLibraries.length} bibliotecas no projeto
          </Text>
        </View>

        {/* Busca */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar bibliotecas instaladas..."
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
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Carregando bibliotecas...</Text>
          </View>
        ) : (
          <ScrollView style={styles.librariesList}>
            {filteredLibraries.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {searchQuery || selectedCategory !== 'all' 
                    ? 'Nenhuma biblioteca encontrada' 
                    : 'Nenhuma biblioteca instalada'
                  }
                </Text>
                <Text style={styles.emptySubtext}>
                  Vá para a tela de Bibliotecas para instalar novas bibliotecas
                </Text>
              </View>
            ) : (
              filteredLibraries.map((library, index) => {
                const isInProject = isLibraryInProject(library.name);
                
                return (
                  <View key={`${library.name}-${index}`} style={styles.libraryItem}>
                    <View style={styles.libraryInfo}>
                      <View style={styles.libraryHeader}>
                        <Text style={styles.libraryName}>{library.name}</Text>
                        {isInProject && (
                          <View style={styles.inProjectBadge}>
                            <Text style={styles.inProjectBadgeText}>No projeto</Text>
                          </View>
                        )}
                      </View>
                      
                      <Text style={styles.libraryDescription} numberOfLines={2}>
                        {library.description}
                      </Text>
                      
                      <View style={styles.libraryMeta}>
                        <Text style={styles.libraryVersion}>v{library.version}</Text>
                        <Text style={styles.libraryAuthor}>por {library.author}</Text>
                        <Text style={styles.libraryCategory}>{library.category}</Text>
                      </View>
                      
                      {library.dependencies && library.dependencies.length > 0 && (
                        <Text style={styles.dependenciesText}>
                          Dependências: {library.dependencies.map(dep => 
                            typeof dep === 'string' ? dep : dep.name
                          ).join(', ')}
                        </Text>
                      )}
                    </View>
                    
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        {backgroundColor: isInProject ? colors.error : colors.primary}
                      ]}
                      onPress={() => {
                        if (isInProject) {
                          handleToggleLibrary(library);
                        } else {
                          handleAddAllDependencies(library);
                        }
                      }}
                    >
                      <Text style={styles.actionButtonText}>
                        {isInProject ? 'Remover' : 'Adicionar'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </ScrollView>
        )}

        {/* Bibliotecas do Projeto */}
        {projectLibraries.length > 0 && (
          <View style={styles.projectLibrariesContainer}>
            <Text style={styles.projectLibrariesTitle}>
              Bibliotecas no Projeto ({projectLibraries.length})
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.projectLibrariesScroll}
            >
              {projectLibraries.map((libraryName, index) => (
                <View key={`project-${libraryName}-${index}`} style={styles.projectLibraryTag}>
                  <Text style={styles.projectLibraryTagText}>{libraryName}</Text>
                  <TouchableOpacity
                    style={styles.removeTagButton}
                    onPress={() => {
                      const updatedLibraries = projectLibraries.filter(name => name !== libraryName);
                      onLibrariesChange(updatedLibraries);
                    }}
                  >
                    <Text style={styles.removeTagButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  closeButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.xs,
  },
  closeButtonText: {
    color: colors.white,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.sm,
  },
  infoContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  infoText: {
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
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
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
  inProjectBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: spacing.xs,
  },
  inProjectBadgeText: {
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
  dependenciesText: {
    fontSize: typography.fontSize.xs,
    color: colors.warning,
    fontStyle: 'italic',
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
  projectLibrariesContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: colors.surface,
  },
  projectLibrariesTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  projectLibrariesScroll: {
    flexDirection: 'row',
  },
  projectLibraryTag: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.sm,
    marginRight: spacing.sm,
  },
  projectLibraryTagText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  removeTagButton: {
    marginLeft: spacing.xs,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeTagButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
});

export default LibraryManager; 
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ProjectService} from '../../services';
import {useAuth} from '../../contexts';

export default function ProjectsScreen({navigation}) {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const {user} = useAuth();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const userProjects = await ProjectService.getUserProjects();
      setProjects(userProjects);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
      Alert.alert('Erro', 'Falha ao carregar projetos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await loadProjects();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCreateProject = () => {
    Alert.prompt(
      'Novo Projeto',
      'Digite o nome do projeto:',
      [
        {text: 'Cancelar', style: 'cancel'},
        {text: 'Criar', onPress: createProject}
      ],
      'plain-text',
      '',
      'default'
    );
  };

  const createProject = async (projectName) => {
    if (!projectName || !projectName.trim()) {
      Alert.alert('Erro', 'Nome do projeto é obrigatório');
      return;
    }

    try {
      setIsLoading(true);
      await ProjectService.createProject({
        name: projectName.trim(),
        description: 'Novo projeto Arduino',
      });
      
      Alert.alert('Sucesso', 'Projeto criado com sucesso!');
      await loadProjects();
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      Alert.alert('Erro', 'Falha ao criar projeto');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectPress = (project) => {
    // Navegar para o editor com o projeto selecionado
    navigation.navigate('Editor', {projectId: project.id});
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  if (isLoading && projects.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Carregando projetos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus Projetos</Text>
        <TouchableOpacity style={styles.newButton} onPress={handleCreateProject}>
          <Text style={styles.newButtonText}>+ Novo</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.projectsList}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#3498db']}
            tintColor="#3498db"
          />
        }>
        {projects.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum projeto encontrado</Text>
            <Text style={styles.emptySubtext}>
              Toque em "+ Novo" para criar seu primeiro projeto
            </Text>
          </View>
        ) : (
          projects.map(project => (
            <TouchableOpacity 
              key={project.id} 
              style={styles.projectItem}
              onPress={() => handleProjectPress(project)}>
              <View style={styles.projectInfo}>
                <Text style={styles.projectName}>{project.name}</Text>
                <Text style={styles.projectDescription}>
                  {project.description || 'Sem descrição'}
                </Text>
                <Text style={styles.projectDate}>
                  Atualizado em: {formatDate(project.updated_at)}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c3e50',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#34495e',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ecf0f1',
  },
  newButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  newButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  projectsList: {
    flex: 1,
    padding: 20,
  },
  projectItem: {
    backgroundColor: '#34495e',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ecf0f1',
    marginBottom: 5,
  },
  projectDescription: {
    fontSize: 14,
    color: '#bdc3c7',
    marginBottom: 5,
  },
  projectDate: {
    fontSize: 12,
    color: '#95a5a6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ecf0f1',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#ecf0f1',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  emptySubtext: {
    color: '#bdc3c7',
    fontSize: 14,
  },
});

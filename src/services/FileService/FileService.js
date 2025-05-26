import AsyncStorage from '@react-native-async-storage/async-storage';

// Chaves para AsyncStorage
const STORAGE_KEYS = {
  PROJECTS: '@andruino_projects',
  CURRENT_PROJECT: '@andruino_current_project',
  SETTINGS: '@andruino_settings',
  RECENT_FILES: '@andruino_recent_files',
};

// Template padrão para novos projetos
const DEFAULT_SKETCH_TEMPLATE = `void setup() {
  // Inicialização - executa uma vez
  Serial.begin(9600);
}

void loop() {
  // Código principal - executa continuamente
  
}`;

class FileService {
  constructor() {
    this.currentProject = null;
    this.projects = [];
    this.recentFiles = [];
    this.isInitialized = false;
  }

  // Inicializar serviço
  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      await this.loadProjects();
      await this.loadCurrentProject();
      await this.loadRecentFiles();
      this.isInitialized = true;
    } catch (error) {
      console.error('Erro ao inicializar FileService:', error);
      throw new Error('Falha ao inicializar sistema de arquivos');
    }
  }

  // Criar novo projeto
  async createProject(name, description = '') {
    if (!name || name.trim().length === 0) {
      throw new Error('Nome do projeto é obrigatório');
    }

    // Verificar se já existe projeto com esse nome
    if (this.projects.find(p => p.name === name.trim())) {
      throw new Error('Já existe um projeto com esse nome');
    }

    const project = {
      id: this.generateId(),
      name: name.trim(),
      description: description.trim(),
      code: DEFAULT_SKETCH_TEMPLATE,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      size: DEFAULT_SKETCH_TEMPLATE.length,
      board: null, // Será definido quando detectar/selecionar placa
    };

    this.projects.push(project);
    await this.saveProjects();
    await this.addToRecentFiles(project);

    return project;
  }

  // Carregar projeto
  async loadProject(projectId) {
    const project = this.projects.find(p => p.id === projectId);
    
    if (!project) {
      throw new Error('Projeto não encontrado');
    }

    this.currentProject = project;
    await this.saveCurrentProject();
    await this.addToRecentFiles(project);

    return project;
  }

  // Salvar projeto atual
  async saveCurrentProject(code = null, board = null) {
    if (!this.currentProject) {
      throw new Error('Nenhum projeto carregado');
    }

    if (code !== null) {
      this.currentProject.code = code;
      this.currentProject.size = code.length;
    }

    if (board !== null) {
      this.currentProject.board = board;
    }

    this.currentProject.updatedAt = new Date().toISOString();

    // Atualizar na lista de projetos
    const index = this.projects.findIndex(p => p.id === this.currentProject.id);
    if (index !== -1) {
      this.projects[index] = {...this.currentProject};
    }

    await this.saveProjects();
    await this.saveCurrentProject();

    return this.currentProject;
  }

  // Duplicar projeto
  async duplicateProject(projectId, newName = null) {
    const originalProject = this.projects.find(p => p.id === projectId);
    
    if (!originalProject) {
      throw new Error('Projeto não encontrado');
    }

    const name = newName || `${originalProject.name} (Cópia)`;
    
    // Verificar se já existe projeto com esse nome
    if (this.projects.find(p => p.name === name)) {
      throw new Error('Já existe um projeto com esse nome');
    }

    const duplicatedProject = {
      ...originalProject,
      id: this.generateId(),
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.projects.push(duplicatedProject);
    await this.saveProjects();

    return duplicatedProject;
  }

  // Renomear projeto
  async renameProject(projectId, newName) {
    if (!newName || newName.trim().length === 0) {
      throw new Error('Nome do projeto é obrigatório');
    }

    const project = this.projects.find(p => p.id === projectId);
    
    if (!project) {
      throw new Error('Projeto não encontrado');
    }

    // Verificar se já existe projeto com esse nome
    if (this.projects.find(p => p.name === newName.trim() && p.id !== projectId)) {
      throw new Error('Já existe um projeto com esse nome');
    }

    project.name = newName.trim();
    project.updatedAt = new Date().toISOString();

    // Atualizar projeto atual se for o mesmo
    if (this.currentProject && this.currentProject.id === projectId) {
      this.currentProject.name = newName.trim();
      await this.saveCurrentProject();
    }

    await this.saveProjects();
    return project;
  }

  // Excluir projeto
  async deleteProject(projectId) {
    const index = this.projects.findIndex(p => p.id === projectId);
    
    if (index === -1) {
      throw new Error('Projeto não encontrado');
    }

    const deletedProject = this.projects[index];
    this.projects.splice(index, 1);

    // Se for o projeto atual, limpar
    if (this.currentProject && this.currentProject.id === projectId) {
      this.currentProject = null;
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_PROJECT);
    }

    // Remover dos arquivos recentes
    this.recentFiles = this.recentFiles.filter(f => f.id !== projectId);
    await this.saveRecentFiles();

    await this.saveProjects();
    return deletedProject;
  }

  // Obter todos os projetos
  getProjects() {
    return [...this.projects].sort((a, b) => 
      new Date(b.updatedAt) - new Date(a.updatedAt)
    );
  }

  // Obter projeto atual
  getCurrentProject() {
    return this.currentProject;
  }

  // Obter arquivos recentes
  getRecentFiles() {
    return this.recentFiles.slice(0, 10); // Máximo 10 arquivos recentes
  }

  // Buscar projetos
  searchProjects(query) {
    if (!query || query.trim().length === 0) {
      return this.getProjects();
    }

    const searchTerm = query.toLowerCase().trim();
    
    return this.projects.filter(project =>
      project.name.toLowerCase().includes(searchTerm) ||
      project.description.toLowerCase().includes(searchTerm) ||
      project.code.toLowerCase().includes(searchTerm)
    ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  // Exportar projeto como texto
  exportProject(projectId) {
    const project = this.projects.find(p => p.id === projectId);
    
    if (!project) {
      throw new Error('Projeto não encontrado');
    }

    const exportData = {
      name: project.name,
      description: project.description,
      code: project.code,
      board: project.board,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      exportedAt: new Date().toISOString(),
      exportedBy: 'Andruino IDE',
    };

    return JSON.stringify(exportData, null, 2);
  }

  // Importar projeto de texto
  async importProject(jsonData) {
    try {
      const projectData = JSON.parse(jsonData);
      
      if (!projectData.name || !projectData.code) {
        throw new Error('Dados do projeto inválidos');
      }

      // Verificar se já existe projeto com esse nome
      let name = projectData.name;
      let counter = 1;
      
      while (this.projects.find(p => p.name === name)) {
        name = `${projectData.name} (${counter})`;
        counter++;
      }

      const project = {
        id: this.generateId(),
        name,
        description: projectData.description || '',
        code: projectData.code,
        board: projectData.board || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        size: projectData.code.length,
      };

      this.projects.push(project);
      await this.saveProjects();

      return project;
    } catch (error) {
      throw new Error('Falha ao importar projeto: ' + error.message);
    }
  }

  // Obter estatísticas
  getStatistics() {
    const totalProjects = this.projects.length;
    const totalLines = this.projects.reduce((sum, project) => {
      return sum + (project.code.split('\n').length || 0);
    }, 0);
    const totalSize = this.projects.reduce((sum, project) => sum + project.size, 0);
    
    const boardUsage = {};
    this.projects.forEach(project => {
      if (project.board) {
        boardUsage[project.board] = (boardUsage[project.board] || 0) + 1;
      }
    });

    return {
      totalProjects,
      totalLines,
      totalSize,
      boardUsage,
      averageProjectSize: totalProjects > 0 ? Math.round(totalSize / totalProjects) : 0,
    };
  }

  // Métodos privados para persistência
  async saveProjects() {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(this.projects));
    } catch (error) {
      console.error('Erro ao salvar projetos:', error);
      throw new Error('Falha ao salvar projetos');
    }
  }

  async loadProjects() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PROJECTS);
      this.projects = data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
      this.projects = [];
    }
  }

  async saveCurrentProject() {
    try {
      if (this.currentProject) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.CURRENT_PROJECT, 
          JSON.stringify(this.currentProject)
        );
      }
    } catch (error) {
      console.error('Erro ao salvar projeto atual:', error);
    }
  }

  async loadCurrentProject() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_PROJECT);
      this.currentProject = data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Erro ao carregar projeto atual:', error);
      this.currentProject = null;
    }
  }

  async addToRecentFiles(project) {
    // Remover se já existe
    this.recentFiles = this.recentFiles.filter(f => f.id !== project.id);
    
    // Adicionar no início
    this.recentFiles.unshift({
      id: project.id,
      name: project.name,
      updatedAt: project.updatedAt,
    });

    // Manter apenas os 10 mais recentes
    this.recentFiles = this.recentFiles.slice(0, 10);
    
    await this.saveRecentFiles();
  }

  async saveRecentFiles() {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.RECENT_FILES, JSON.stringify(this.recentFiles));
    } catch (error) {
      console.error('Erro ao salvar arquivos recentes:', error);
    }
  }

  async loadRecentFiles() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.RECENT_FILES);
      this.recentFiles = data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao carregar arquivos recentes:', error);
      this.recentFiles = [];
    }
  }

  // Gerar ID único
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Limpar todos os dados (para reset/debug)
  async clearAllData() {
    this.projects = [];
    this.currentProject = null;
    this.recentFiles = [];
    
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.PROJECTS,
      STORAGE_KEYS.CURRENT_PROJECT,
      STORAGE_KEYS.RECENT_FILES,
    ]);
  }
}

export default new FileService(); 
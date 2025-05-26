import {AuthService} from '../AuthService/AuthService';
import CacheService from '../CacheService/CacheService';

class ProjectService {
  constructor() {
    this.supabase = null;
    this.cacheNamespace = 'projects';
    this.cacheTTL = 10 * 60 * 1000; // 10 minutos
  }

  // Inicializar serviço
  initialize() {
    this.supabase = AuthService.getSupabaseClient();
  }

  // Obter chave de cache para usuário
  getUserCacheKey(suffix = '') {
    const user = AuthService.getCurrentUser();
    return `user_${user?.id || 'anonymous'}${suffix ? `_${suffix}` : ''}`;
  }

  // Obter todos os projetos do usuário
  async getUserProjects() {
    try {
      if (!this.supabase) this.initialize();

      const user = AuthService.getCurrentUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const cacheKey = this.getUserCacheKey('all_projects');
      
      // Tentar obter do cache primeiro
      const cachedProjects = await CacheService.get(this.cacheNamespace, cacheKey);
      if (cachedProjects) {
        return cachedProjects;
      }

      const {data, error} = await this.supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', {ascending: false});

      if (error) {
        throw error;
      }

      const projects = data || [];
      
      // Armazenar no cache
      await CacheService.set(this.cacheNamespace, cacheKey, projects, {
        ttl: this.cacheTTL
      });

      return projects;
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
      throw new Error('Falha ao carregar projetos');
    }
  }

  // Criar novo projeto
  async createProject(projectData) {
    try {
      if (!this.supabase) this.initialize();

      const user = AuthService.getCurrentUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const newProject = {
        user_id: user.id,
        name: projectData.name,
        description: projectData.description || '',
        main_file: projectData.main_file || 'main.ino',
        files: projectData.files || [
          {
            name: 'main.ino',
            content: '// Código principal do projeto\nvoid setup() {\n  // Inicialização\n}\n\nvoid loop() {\n  // Loop principal\n}',
            type: 'ino'
          }
        ],
        board_config: projectData.board_config || {},
        libraries: projectData.libraries || [],
      };

      const {data, error} = await this.supabase
        .from('projects')
        .insert([newProject])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Invalidar cache de projetos do usuário
      await this.invalidateUserCache();
      
      // Armazenar projeto individual no cache
      const projectCacheKey = this.getUserCacheKey(`project_${data.id}`);
      await CacheService.set(this.cacheNamespace, projectCacheKey, data, {
        ttl: this.cacheTTL
      });

      return data;
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      throw new Error('Falha ao criar projeto');
    }
  }

  // Atualizar projeto
  async updateProject(projectId, updates) {
    try {
      if (!this.supabase) this.initialize();

      const user = AuthService.getCurrentUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const {data, error} = await this.supabase
        .from('projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Invalidar caches relacionados
      await this.invalidateUserCache();
      await this.invalidateProjectCache(projectId);
      
      // Atualizar cache do projeto
      const projectCacheKey = this.getUserCacheKey(`project_${projectId}`);
      await CacheService.set(this.cacheNamespace, projectCacheKey, data, {
        ttl: this.cacheTTL
      });

      return data;
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error);
      throw new Error('Falha ao atualizar projeto');
    }
  }

  // Deletar projeto
  async deleteProject(projectId) {
    try {
      if (!this.supabase) this.initialize();

      const user = AuthService.getCurrentUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const {error} = await this.supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      // Invalidar caches relacionados
      await this.invalidateUserCache();
      await this.invalidateProjectCache(projectId);

      return true;
    } catch (error) {
      console.error('Erro ao deletar projeto:', error);
      throw new Error('Falha ao deletar projeto');
    }
  }

  // Obter projeto específico
  async getProject(projectId) {
    try {
      if (!this.supabase) this.initialize();

      const user = AuthService.getCurrentUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const projectCacheKey = this.getUserCacheKey(`project_${projectId}`);
      
      // Tentar obter do cache primeiro
      const cachedProject = await CacheService.get(this.cacheNamespace, projectCacheKey);
      if (cachedProject) {
        return cachedProject;
      }

      const {data, error} = await this.supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        throw error;
      }

      // Armazenar no cache
      await CacheService.set(this.cacheNamespace, projectCacheKey, data, {
        ttl: this.cacheTTL
      });

      return data;
    } catch (error) {
      console.error('Erro ao buscar projeto:', error);
      throw new Error('Falha ao carregar projeto');
    }
  }

  // Duplicar projeto
  async duplicateProject(projectId, newName) {
    try {
      const originalProject = await this.getProject(projectId);
      
      const duplicatedProject = {
        name: newName || `${originalProject.name} (Cópia)`,
        description: originalProject.description,
        main_file: originalProject.main_file,
        files: originalProject.files,
        board_config: originalProject.board_config,
        libraries: originalProject.libraries,
      };

      return await this.createProject(duplicatedProject);
    } catch (error) {
      console.error('Erro ao duplicar projeto:', error);
      throw new Error('Falha ao duplicar projeto');
    }
  }

  // Invalidar cache do usuário
  async invalidateUserCache() {
    const user = AuthService.getCurrentUser();
    if (user) {
      const cacheKey = this.getUserCacheKey('all_projects');
      await CacheService.remove(this.cacheNamespace, cacheKey);
    }
  }

  // Invalidar cache de projeto específico
  async invalidateProjectCache(projectId) {
    const projectCacheKey = this.getUserCacheKey(`project_${projectId}`);
    await CacheService.remove(this.cacheNamespace, projectCacheKey);
  }

  // Pré-carregar projetos importantes
  async preloadUserProjects() {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) return;

      await CacheService.preload(this.cacheNamespace, [
        {
          key: this.getUserCacheKey('all_projects'),
          loader: () => this.getUserProjects(),
          ttl: this.cacheTTL
        }
      ]);
    } catch (error) {
      console.warn('Erro ao pré-carregar projetos:', error);
    }
  }

  // Limpar cache de projetos
  async clearCache() {
    await CacheService.clearNamespace(this.cacheNamespace);
  }

  // Obter estatísticas do cache
  getCacheStats() {
    return CacheService.getStats();
  }
}

export default new ProjectService(); 
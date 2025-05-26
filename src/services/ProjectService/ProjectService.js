import {AuthService} from '../AuthService/AuthService';

class ProjectService {
  constructor() {
    this.supabase = null;
  }

  // Inicializar serviço
  initialize() {
    this.supabase = AuthService.getSupabaseClient();
  }

  // Obter todos os projetos do usuário
  async getUserProjects() {
    try {
      if (!this.supabase) this.initialize();

      const user = AuthService.getCurrentUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const {data, error} = await this.supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', {ascending: false});

      if (error) {
        throw error;
      }

      return data || [];
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

      const {data, error} = await this.supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        throw error;
      }

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
}

export default new ProjectService(); 
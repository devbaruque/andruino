import {createClient} from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuração do Supabase
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://incfwytbpktqnjejnjtt.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImluY2Z3eXRicGt0cW5qZWpuanR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyNjYwMTAsImV4cCI6MjA2Mzg0MjAxMH0.6PDNEjAcmdetyfS19CYEUnwDiHYVatq7Hb5jqTpewlw';

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  // Desabilitar realtime completamente para evitar problemas com WebSocket
  realtime: {
    disabled: true,
  },
});

class AuthService {
  constructor() {
    this.currentUser = null;
    this.isInitialized = false;
    this.authListeners = [];
  }

  // Inicializar serviço de autenticação
  async initialize() {
    if (this.isInitialized) {
      return this.currentUser;
    }

    try {
      // Verificar se há uma sessão ativa
      const {data: {session}, error} = await supabase.auth.getSession();
      
      if (error) {
        console.error('Erro ao obter sessão:', error);
        throw error;
      }

      if (session?.user) {
        this.currentUser = session.user;
        this.notifyAuthListeners('signIn', this.currentUser);
      }

      // Configurar listener para mudanças de autenticação
      supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        switch (event) {
          case 'SIGNED_IN':
            this.currentUser = session?.user || null;
            this.notifyAuthListeners('signIn', this.currentUser);
            break;
          case 'SIGNED_OUT':
            this.currentUser = null;
            this.notifyAuthListeners('signOut', null);
            break;
          case 'TOKEN_REFRESHED':
            this.currentUser = session?.user || null;
            this.notifyAuthListeners('tokenRefresh', this.currentUser);
            break;
          case 'USER_UPDATED':
            this.currentUser = session?.user || null;
            this.notifyAuthListeners('userUpdate', this.currentUser);
            break;
        }
      });

      this.isInitialized = true;
      return this.currentUser;
    } catch (error) {
      console.error('Erro ao inicializar AuthService:', error);
      throw new Error('Falha ao inicializar autenticação');
    }
  }

  // Fazer login com email e senha
  async signIn(email, password) {
    try {
      const {data, error} = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        throw error;
      }

      this.currentUser = data.user;
      return {
        user: data.user,
        session: data.session,
      };
    } catch (error) {
      console.error('Erro no login:', error);
      throw this.handleAuthError(error);
    }
  }

  // Registrar novo usuário
  async signUp(email, password, metadata = {}) {
    try {
      const {data, error} = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            name: metadata.name || '',
            ...metadata,
          },
        },
      });

      if (error) {
        throw error;
      }

      // Se o usuário foi criado mas precisa confirmar email
      if (data.user && !data.session) {
        return {
          user: data.user,
          needsConfirmation: true,
          message: 'Verifique seu email para confirmar a conta',
        };
      }

      this.currentUser = data.user;
      return {
        user: data.user,
        session: data.session,
        needsConfirmation: false,
      };
    } catch (error) {
      console.error('Erro no registro:', error);
      throw this.handleAuthError(error);
    }
  }

  // Fazer logout
  async signOut() {
    try {
      const {error} = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      this.currentUser = null;
      return true;
    } catch (error) {
      console.error('Erro no logout:', error);
      throw new Error('Falha ao fazer logout');
    }
  }

  // Recuperar senha
  async resetPassword(email) {
    try {
      const {error} = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: `${supabaseUrl}/auth/callback`,
        }
      );

      if (error) {
        throw error;
      }

      return {
        message: 'Email de recuperação enviado com sucesso',
      };
    } catch (error) {
      console.error('Erro ao recuperar senha:', error);
      throw this.handleAuthError(error);
    }
  }

  // Atualizar perfil do usuário
  async updateProfile(updates) {
    try {
      if (!this.currentUser) {
        throw new Error('Usuário não autenticado');
      }

      const {data, error} = await supabase.auth.updateUser({
        data: updates,
      });

      if (error) {
        throw error;
      }

      this.currentUser = data.user;
      return data.user;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw this.handleAuthError(error);
    }
  }

  // Atualizar senha
  async updatePassword(newPassword) {
    try {
      if (!this.currentUser) {
        throw new Error('Usuário não autenticado');
      }

      const {error} = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      return {
        message: 'Senha atualizada com sucesso',
      };
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      throw this.handleAuthError(error);
    }
  }

  // Obter usuário atual
  getCurrentUser() {
    return this.currentUser;
  }

  // Verificar se está autenticado
  isAuthenticated() {
    return !!this.currentUser;
  }

  // Obter token de acesso
  async getAccessToken() {
    try {
      const {data: {session}} = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error('Erro ao obter token:', error);
      return null;
    }
  }

  // Adicionar listener para mudanças de autenticação
  addAuthListener(callback) {
    this.authListeners.push(callback);
  }

  // Remover listener
  removeAuthListener(callback) {
    this.authListeners = this.authListeners.filter(
      listener => listener !== callback
    );
  }

  // Notificar listeners
  notifyAuthListeners(event, user) {
    this.authListeners.forEach(listener => {
      try {
        listener(event, user);
      } catch (error) {
        console.warn('Erro no listener de autenticação:', error);
      }
    });
  }

  // Tratar erros de autenticação
  handleAuthError(error) {
    const errorMessages = {
      'Invalid login credentials': 'Email ou senha incorretos',
      'Email not confirmed': 'Email não confirmado. Verifique sua caixa de entrada',
      'User already registered': 'Este email já está cadastrado',
      'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres',
      'Invalid email': 'Email inválido',
      'Signup is disabled': 'Cadastro desabilitado temporariamente',
      'Email rate limit exceeded': 'Muitas tentativas. Tente novamente em alguns minutos',
    };

    const message = errorMessages[error.message] || error.message || 'Erro desconhecido';
    
    return new Error(message);
  }

  // Obter cliente Supabase (para operações avançadas)
  getSupabaseClient() {
    return supabase;
  }

  // Verificar status da conexão
  async checkConnection() {
    try {
      const {data, error} = await supabase.from('_health').select('*').limit(1);
      return !error;
    } catch (error) {
      console.error('Erro de conexão com Supabase:', error);
      return false;
    }
  }
}

export default new AuthService(); 
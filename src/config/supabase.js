// Configuração do Supabase para desenvolvimento
export const supabaseConfig = {
  // Para desenvolvimento, usando configuração local ou demo
  url: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co',
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'demo-key',
  
  // Configurações para desenvolvimento
  options: {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    realtime: {
      disabled: true, // Desabilitar realtime para evitar problemas
    },
  },
};

// Verificar se as configurações estão válidas
export const isSupabaseConfigured = () => {
  return supabaseConfig.url !== 'https://demo.supabase.co' && 
         supabaseConfig.anonKey !== 'demo-key';
}; 
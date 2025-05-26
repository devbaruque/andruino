import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, typography, spacing} from '../../theme';
import {Button, Input} from '../../components';
import {AuthService} from '../../services';

export default function LoginScreen({navigation}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);

  // Verificar se já está autenticado
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      await AuthService.initialize();
      const user = AuthService.getCurrentUser();
      
      if (user) {
        console.log('Usuário já autenticado:', user.email);
      }
    } catch (error) {
      console.error('Erro ao verificar status de autenticação:', error);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    setIsLoading(true);

    try {
      const result = await AuthService.signIn(email, password);
      
      if (result.user) {
        console.log('Login realizado com sucesso:', result.user.email);
      }
    } catch (error) {
      console.error('Erro no login:', error);
      Alert.alert('Erro', error.message || 'Falha no login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const result = await AuthService.signUp(email, password);
      
      if (result.needsConfirmation) {
        Alert.alert(
          'Confirmação necessária', 
          result.message || 'Verifique seu email para confirmar a conta',
          [
            {text: 'OK', onPress: () => setIsLoginMode(true)}
          ]
        );
      } else if (result.user) {
        Alert.alert('Sucesso', 'Conta criada com sucesso!');
      }
    } catch (error) {
      console.error('Erro no registro:', error);
      Alert.alert('Erro', error.message || 'Falha no registro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      Alert.alert('Erro', 'Por favor, digite seu email primeiro');
      return;
    }

    Alert.alert(
      'Recuperar senha',
      `Enviar email de recuperação para ${email}?`,
      [
        {text: 'Cancelar', style: 'cancel'},
        {text: 'Enviar', onPress: sendPasswordReset}
      ]
    );
  };

  const sendPasswordReset = async () => {
    setIsLoading(true);
    
    try {
      await AuthService.resetPassword(email);
      Alert.alert(
        'Email enviado', 
        'Verifique sua caixa de entrada para redefinir sua senha'
      );
    } catch (error) {
      Alert.alert('Erro', error.message || 'Falha ao enviar email de recuperação');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setEmail('');
    setPassword('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled">
          
          {/* Logo e título */}
          <View style={styles.header}>
            <Image 
              source={require('../../../assets/andruino.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Andruino</Text>
            <Text style={styles.subtitle}>
              {isLoginMode ? 'Entre na sua conta' : 'Crie sua conta'}
            </Text>
          </View>

          {/* Formulário */}
          <View style={styles.form}>
            <Input
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />

            <Input
              placeholder="Senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
            />

            <Button
              title={isLoginMode ? 'Entrar' : 'Criar Conta'}
              onPress={isLoginMode ? handleLogin : handleRegister}
              loading={isLoading}
              style={styles.primaryButton}
            />


            <Button
              title={isLoginMode ? 'Criar nova conta' : 'Já tenho uma conta'}
              onPress={toggleMode}
              variant="outline"
              style={styles.secondaryButton}
            />

            {isLoginMode && (
              <Button
                title="Esqueci minha senha"
                onPress={handleForgotPassword}
                variant="text"
                style={styles.forgotButton}
              />
            )}

          </View>

          {/* Informações adicionais */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Desenvolvido para programação Arduino
            </Text>
            <Text style={styles.versionText}>v1.0.0</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  form: {
    marginBottom: spacing.xxl,
  },
  input: {
    marginBottom: spacing.lg,
  },
  primaryButton: {
    marginBottom: spacing.md,
  },
  forgotButton: {
    marginBottom: spacing.md,
  },
  secondaryButton: {
    marginBottom: spacing.lg,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  versionText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.tertiary,
  },
});

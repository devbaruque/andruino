import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, typography, spacing} from '../../theme';
import {Button, Input} from '../../components';
import {AuthService} from '../../services';

export default function RegisterScreen({navigation}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const result = await AuthService.signUp(email, password, {
        name: name.trim(),
      });
      
      if (result.needsConfirmation) {
        Alert.alert(
          'Confirmação necessária', 
          result.message || 'Verifique seu email para confirmar a conta',
          [
            {text: 'OK', onPress: () => navigation.navigate('Login')}
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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled">
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>A</Text>
            </View>
            <Text style={styles.title}>Criar Conta</Text>
            <Text style={styles.subtitle}>
              Junte-se à comunidade Andruino
            </Text>
          </View>

          {/* Formulário */}
          <View style={styles.form}>
            <Input
              placeholder="Nome completo"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              style={styles.input}
            />

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

            <Input
              placeholder="Confirmar senha"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              style={styles.input}
            />

            <Button
              title="Criar Conta"
              onPress={handleRegister}
              loading={isLoading}
              style={styles.primaryButton}
            />

            <Button
              title="Já tenho uma conta"
              onPress={() => navigation.navigate('Login')}
              variant="outline"
              style={styles.secondaryButton}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Ao criar uma conta, você concorda com nossos{'\n'}
              Termos de Uso e Política de Privacidade
            </Text>
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
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  logoText: {
    fontSize: 36,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
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
    lineHeight: 20,
  },
});

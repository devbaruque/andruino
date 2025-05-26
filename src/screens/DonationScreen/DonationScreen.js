import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

export default function DonationScreen({navigation}) {
  const pixKey = 'andruino@exemplo.com'; // Substituir pela chave PIX real

  const copyPixKey = () => {
    // TODO: Implementar cópia para clipboard
    Alert.alert('PIX', 'Chave PIX copiada para a área de transferência!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Apoiar o Projeto</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            💝 Ajude a manter o Andruino gratuito
          </Text>
          <Text style={styles.description}>
            O Andruino é um projeto 100% gratuito e open-source criado para
            democratizar o acesso à programação Arduino para estudantes de baixa
            renda.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Custos do projeto</Text>
          <View style={styles.costItem}>
            <Text style={styles.costLabel}>Google Play Store (taxa anual)</Text>
            <Text style={styles.costValue}>R$ 25,00</Text>
          </View>
          <View style={styles.costItem}>
            <Text style={styles.costLabel}>Firebase (hosting e analytics)</Text>
            <Text style={styles.costValue}>R$ 30,00/mês</Text>
          </View>
          <View style={styles.costItem}>
            <Text style={styles.costLabel}>Desenvolvimento e manutenção</Text>
            <Text style={styles.costValue}>Voluntário</Text>
          </View>
          <View style={styles.costItem}>
            <Text style={styles.costLabel}>Testes em dispositivos</Text>
            <Text style={styles.costValue}>R$ 50,00/mês</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 PIX para doação</Text>

          {/* QR Code Placeholder */}
          <View style={styles.qrCodeContainer}>
            <View style={styles.qrCodePlaceholder}>
              <Text style={styles.qrCodeText}>QR CODE PIX</Text>
              <Text style={styles.qrCodeSubtext}>
                Escaneie com seu app bancário
              </Text>
            </View>
          </View>

          <View style={styles.pixKeyContainer}>
            <Text style={styles.pixKeyLabel}>Chave PIX:</Text>
            <TouchableOpacity style={styles.pixKeyButton} onPress={copyPixKey}>
              <Text style={styles.pixKeyText}>{pixKey}</Text>
              <Text style={styles.copyText}>Tocar para copiar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            🙏 Sua contribuição faz a diferença
          </Text>
          <Text style={styles.description}>
            Qualquer valor ajuda a manter o projeto funcionando e permite que
            mais estudantes tenham acesso a uma ferramenta de programação
            Arduino gratuita e de qualidade.
          </Text>
          <Text style={styles.description}>
            Obrigado por apoiar a educação tecnológica no Brasil! 🇧🇷
          </Text>
        </View>
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
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#34495e',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: '#3498db',
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ecf0f1',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#bdc3c7',
    lineHeight: 24,
    marginBottom: 10,
  },
  costItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#34495e',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  costLabel: {
    fontSize: 14,
    color: '#ecf0f1',
    flex: 1,
  },
  costValue: {
    fontSize: 14,
    color: '#f39c12',
    fontWeight: 'bold',
  },
  qrCodeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  qrCodePlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#34495e',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3498db',
  },
  qrCodeText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  qrCodeSubtext: {
    color: '#95a5a6',
    fontSize: 12,
    textAlign: 'center',
  },
  pixKeyContainer: {
    backgroundColor: '#34495e',
    padding: 15,
    borderRadius: 8,
  },
  pixKeyLabel: {
    color: '#ecf0f1',
    fontSize: 14,
    marginBottom: 8,
  },
  pixKeyButton: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  pixKeyText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  copyText: {
    color: '#ecf0f1',
    fontSize: 12,
  },
});

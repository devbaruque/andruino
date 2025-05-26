import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import Clipboard from '@react-native-clipboard/clipboard';
import {colors, typography, spacing} from '../../theme';

const {width: screenWidth} = Dimensions.get('window');

export default function DonationScreen({navigation}) {
  const [selectedAmount, setSelectedAmount] = useState(null);
  
  // Dados PIX reais (substitua pelos dados reais)
  const pixData = {
    key: 'andruino@exemplo.com', // Substitua pela chave PIX real
    name: 'Projeto Andruino',
    city: 'São Paulo',
    description: 'Doação para o Projeto Andruino IDE',
  };

  // Valores sugeridos para doação
  const suggestedAmounts = [5, 10, 25, 50, 100];

  // Gerar string PIX para QR Code
  const generatePixString = (amount = null) => {
    // Formato simplificado do PIX (para um QR Code real, seria necessário implementar o padrão EMV)
    const pixString = `PIX|${pixData.key}|${pixData.name}|${amount || ''}|${pixData.description}`;
    return pixString;
  };

  // Copiar chave PIX
  const copyPixKey = async () => {
    try {
      await Clipboard.setString(pixData.key);
      Alert.alert('✅ Copiado!', 'Chave PIX copiada para a área de transferência');
    } catch (error) {
      Alert.alert('❌ Erro', 'Não foi possível copiar a chave PIX');
    }
  };

  // Copiar código PIX completo
  const copyPixCode = async () => {
    try {
      const pixString = generatePixString(selectedAmount);
      await Clipboard.setString(pixString);
      Alert.alert('✅ Copiado!', 'Código PIX copiado para a área de transferência');
    } catch (error) {
      Alert.alert('❌ Erro', 'Não foi possível copiar o código PIX');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Apoiar o Projeto</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Introdução */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            💝 Ajude a manter o Andruino gratuito
          </Text>
          <Text style={styles.description}>
            O Andruino é um projeto 100% gratuito e open-source criado para
            democratizar o acesso à programação Arduino para estudantes brasileiros.
          </Text>
          <Text style={styles.description}>
            Sua doação ajuda a manter o projeto funcionando e permite que mais
            pessoas tenham acesso a uma ferramenta de programação Arduino gratuita.
          </Text>
        </View>

        {/* Valores sugeridos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Valores sugeridos</Text>
          <View style={styles.amountGrid}>
            {suggestedAmounts.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.amountButton,
                  selectedAmount === amount && styles.amountButtonSelected,
                ]}
                onPress={() => setSelectedAmount(amount)}>
                <Text
                  style={[
                    styles.amountButtonText,
                    selectedAmount === amount && styles.amountButtonTextSelected,
                  ]}>
                  R$ {amount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity
            style={[styles.amountButton, styles.customAmountButton]}
            onPress={() => setSelectedAmount(null)}>
            <Text style={styles.amountButtonText}>Outro valor</Text>
          </TouchableOpacity>
        </View>

        {/* QR Code PIX */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 QR Code PIX</Text>
          
          <View style={styles.qrCodeContainer}>
            <View style={styles.qrCodeWrapper}>
              <QRCode
                value={generatePixString(selectedAmount)}
                size={200}
                backgroundColor={colors.background.primary}
                color={colors.text.primary}
                logoSize={30}
                logoBackgroundColor={colors.background.primary}
              />
            </View>
            
            <Text style={styles.qrCodeInstructions}>
              Escaneie com seu app bancário ou PIX
            </Text>
            
            {selectedAmount && (
              <Text style={styles.selectedAmountText}>
                Valor selecionado: R$ {selectedAmount}
              </Text>
            )}
            
            <TouchableOpacity style={styles.copyQrButton} onPress={copyPixCode}>
              <Text style={styles.copyQrButtonText}>📋 Copiar código PIX</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Chave PIX manual */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔑 Chave PIX manual</Text>
          
          <View style={styles.pixKeyContainer}>
            <Text style={styles.pixKeyLabel}>Chave PIX (E-mail):</Text>
            <TouchableOpacity style={styles.pixKeyButton} onPress={copyPixKey}>
              <Text style={styles.pixKeyText}>{pixData.key}</Text>
              <Text style={styles.copyText}>Tocar para copiar</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.pixInfoContainer}>
            <Text style={styles.pixInfoLabel}>Favorecido:</Text>
            <Text style={styles.pixInfoValue}>{pixData.name}</Text>
          </View>
        </View>

        {/* Custos do projeto */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Custos mensais do projeto</Text>
          
          <View style={styles.costItem}>
            <Text style={styles.costLabel}>Google Play Store (taxa anual)</Text>
            <Text style={styles.costValue}>R$ 25,00</Text>
          </View>
          
          <View style={styles.costItem}>
            <Text style={styles.costLabel}>Supabase (banco de dados)</Text>
            <Text style={styles.costValue}>R$ 30,00</Text>
          </View>
          
          <View style={styles.costItem}>
            <Text style={styles.costLabel}>Testes em dispositivos</Text>
            <Text style={styles.costValue}>R$ 50,00</Text>
          </View>
          
          <View style={styles.costItem}>
            <Text style={styles.costLabel}>Desenvolvimento e manutenção</Text>
            <Text style={styles.costValue}>Voluntário ❤️</Text>
          </View>
          
          <View style={[styles.costItem, styles.totalCostItem]}>
            <Text style={[styles.costLabel, styles.totalCostLabel]}>Total mensal</Text>
            <Text style={[styles.costValue, styles.totalCostValue]}>R$ 80,00</Text>
          </View>
        </View>

        {/* Agradecimento */}
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

        {/* Transparência */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔍 Transparência</Text>
          <Text style={styles.description}>
            • Todas as doações são usadas exclusivamente para manter o projeto
          </Text>
          <Text style={styles.description}>
            • O código-fonte é 100% open-source e auditável
          </Text>
          <Text style={styles.description}>
            • Relatórios de gastos disponíveis mediante solicitação
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: spacing.borderWidth.thin,
    borderBottomColor: colors.border.primary,
    backgroundColor: colors.background.secondary,
  },
  backButton: {
    marginRight: spacing.md,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.relaxed,
    marginBottom: spacing.sm,
  },
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  amountButton: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.md,
    borderWidth: spacing.borderWidth.thin,
    borderColor: colors.border.primary,
    minWidth: (screenWidth - spacing.lg * 2 - spacing.sm * 4) / 5,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  amountButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  amountButtonText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  amountButtonTextSelected: {
    color: colors.text.inverse,
  },
  customAmountButton: {
    width: '100%',
    backgroundColor: colors.background.tertiary,
  },
  qrCodeContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  qrCodeWrapper: {
    backgroundColor: colors.background.inverse,
    padding: spacing.md,
    borderRadius: spacing.borderRadius.lg,
    marginBottom: spacing.md,
  },
  qrCodeInstructions: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  selectedAmountText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  copyQrButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: spacing.borderRadius.md,
    alignItems: 'center',
  },
  copyQrButtonText: {
    color: colors.text.inverse,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  pixKeyContainer: {
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: spacing.borderRadius.md,
    borderWidth: spacing.borderWidth.thin,
    borderColor: colors.border.primary,
    marginBottom: spacing.sm,
  },
  pixKeyLabel: {
    color: colors.text.primary,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xs,
    fontWeight: typography.fontWeight.medium,
  },
  pixKeyButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: spacing.borderRadius.sm,
    alignItems: 'center',
  },
  pixKeyText: {
    color: colors.text.inverse,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  copyText: {
    color: colors.text.inverse,
    fontSize: typography.fontSize.xs,
    opacity: 0.8,
  },
  pixInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: spacing.borderRadius.md,
    borderWidth: spacing.borderWidth.thin,
    borderColor: colors.border.primary,
  },
  pixInfoLabel: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
  },
  pixInfoValue: {
    color: colors.text.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  costItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: spacing.borderRadius.sm,
    marginBottom: spacing.xs,
    borderWidth: spacing.borderWidth.thin,
    borderColor: colors.border.primary,
  },
  costLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    flex: 1,
  },
  costValue: {
    fontSize: typography.fontSize.sm,
    color: colors.accent,
    fontWeight: typography.fontWeight.semibold,
  },
  totalCostItem: {
    backgroundColor: colors.background.tertiary,
    marginTop: spacing.sm,
    borderColor: colors.primary,
  },
  totalCostLabel: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
  },
  totalCostValue: {
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.base,
  },
});

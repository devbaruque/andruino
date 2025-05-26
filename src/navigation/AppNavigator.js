import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {View, Text, ActivityIndicator, StyleSheet} from 'react-native';
import {useAuth} from '../contexts';

// Importar telas
import LoginScreen from '../screens/LoginScreen/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen/RegisterScreen';
import EditorScreen from '../screens/EditorScreen/EditorScreen';
import ProjectsScreen from '../screens/ProjectsScreen/ProjectsScreen';
import LibrariesScreen from '../screens/LibrariesScreen/LibrariesScreen';
import SettingsScreen from '../screens/SettingsScreen/SettingsScreen';
import DonationScreen from '../screens/DonationScreen/DonationScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tela de carregamento
function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#3498db" />
      <Text style={styles.loadingText}>Carregando...</Text>
    </View>
  );
}

// Navegador de autenticação (Login/Register)
function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Navegador principal com tabs (após login)
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#2c3e50',
          borderTopColor: '#34495e',
        },
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: '#95a5a6',
      }}>
      <Tab.Screen
        name="Editor"
        component={EditorScreen}
        options={{
          tabBarLabel: 'Editor',
        }}
      />
      <Tab.Screen
        name="Projects"
        component={ProjectsScreen}
        options={{
          tabBarLabel: 'Projetos',
        }}
      />
      <Tab.Screen
        name="Libraries"
        component={LibrariesScreen}
        options={{
          tabBarLabel: 'Bibliotecas',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Configurações',
        }}
      />
    </Tab.Navigator>
  );
}

// Navegador principal do app
export default function AppNavigator() {
  const {isAuthenticated, isLoading, isInitialized} = useAuth();

  // Mostrar tela de carregamento enquanto inicializa
  if (isLoading || !isInitialized) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        {isAuthenticated ? (
          // Usuário autenticado - mostrar telas principais
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen name="Donation" component={DonationScreen} />
          </>
        ) : (
          // Usuário não autenticado - mostrar telas de login
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ecf0f1',
  },
});

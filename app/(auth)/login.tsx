import { useState, useEffect } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Surface,
  Text,
  TextInput,
  Button,
  Card,
  Avatar,
  Snackbar,
  ActivityIndicator,
} from 'react-native-paper';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/contexts/AuthContext';

interface LoginResponse {
  user_id: string;
  email: string;
  access_token: string;
  token_type: string;
  message: string;
}

interface LoginError {
  detail: string;
}

export default function LoginScreen() {
  const { signIn } = useAuth();
  const params = useLocalSearchParams();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    // Check if we're coming from successful signup
    if (params.signupSuccess === 'true' && params.message) {
      setSnackbarMessage(params.message as string);
      setSnackbarVisible(true);
    }
  }, [params]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://arif194-skincheck.hf.space/auth/?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
        {
          method: 'POST',
          headers: {
            'accept': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        const loginData: LoginResponse = data;
        console.log('Login successful:', loginData);
        
        // Store authentication data using AuthContext
        await signIn({
          user_id: loginData.user_id,
          email: loginData.email,
          access_token: loginData.access_token,
        });
        
        router.replace('/(tabs)');
      } else {
        const errorData: LoginError = data;
        Alert.alert('Login Failed', errorData.detail || 'Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Network error. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    router.push('/(auth)/signup');
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Surface style={styles.logoContainer} elevation={0}>
            <Avatar.Icon size={80} icon="medical-bag" style={styles.logo} />
          </Surface>
          <ThemedText type="title" style={styles.title}>
            SkinCheck
          </ThemedText>
          <Text variant="bodyMedium" style={styles.subtitle}>
            AI-powered skin analysis for early detection
          </Text>
        </View>

        {/* Login Form */}
        <Card style={styles.formCard}>
          <Card.Content style={styles.formContent}>
            <Text variant="headlineSmall" style={styles.formTitle}>
              Welcome Back
            </Text>
            <Text variant="bodyMedium" style={styles.formSubtitle}>
              Sign in to continue your health journey
            </Text>

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              style={styles.input}
              left={<TextInput.Icon icon="email" />}
              disabled={loading}
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry={!showPassword}
              style={styles.input}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              disabled={loading}
            />

            <Button
              mode="contained"
              onPress={handleLogin}
              style={styles.loginButton}
              disabled={loading}
              loading={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>

            <View style={styles.divider}>
              <Text variant="bodySmall" style={styles.dividerText}>
                Don't have an account?
              </Text>
            </View>

            <Button
              mode="outlined"
              onPress={handleSignUp}
              style={styles.signupButton}
              disabled={loading}
            >
              Create Account
            </Button>
          </Card.Content>
        </Card>
      </View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
      >
        {snackbarMessage}
      </Snackbar>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    backgroundColor: 'transparent',
    marginBottom: 16,
  },
  logo: {
    backgroundColor: '#4caf50',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  formCard: {
    borderRadius: 16,
    elevation: 4,
  },
  formContent: {
    padding: 24,
  },
  formTitle: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  formSubtitle: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 8,
    paddingVertical: 6,
  },
  divider: {
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerText: {
    opacity: 0.7,
  },
  signupButton: {
    paddingVertical: 6,
  },
});

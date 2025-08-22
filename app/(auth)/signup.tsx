import { useState } from 'react';
import { StyleSheet, View, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import {
  Surface,
  Text,
  TextInput,
  Button,
  Card,
  Avatar,
  Snackbar,
} from 'react-native-paper';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

interface SignupRequest {
  username: string;
  password: string;
  email: string;
  age: number;
}

interface SignupResponse {
  uuid: string;
  username: string;
  message: string;
}

interface SignupError {
  detail: string;
}

export default function SignupScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Username is required');
      return false;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Email is required');
      return false;
    }
    if (!password) {
      Alert.alert('Error', 'Password is required');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    if (!age || parseInt(age) < 1) {
      Alert.alert('Error', 'Please enter a valid age');
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    // Basic password validation
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const signupData: SignupRequest = {
        username: username.trim(),
        password,
        email: email.trim().toLowerCase(),
        age: parseInt(age),
      };

      const response = await fetch('https://arif194-skincheck.hf.space/signup/', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      });

      const data = await response.json();

      if (response.ok) {
        const signupResponse: SignupResponse = data;
        console.log('Signup successful:', signupResponse);
        
        // Navigate to login with success message
        router.replace({
          pathname: '/(auth)/login',
          params: { signupSuccess: 'true', message: signupResponse.message }
        });
      } else {
        const errorData: SignupError = data;
        Alert.alert('Signup Failed', errorData.detail || 'An error occurred during signup');
      }
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Error', 'Network error. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Surface style={styles.logoContainer} elevation={0}>
              <Avatar.Icon size={80} icon="medical-bag" style={styles.logo} />
            </Surface>
            <ThemedText type="title" style={styles.title}>
              Join SkinCheck
            </ThemedText>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Create your account to start monitoring your skin health
            </Text>
          </View>

          {/* Signup Form */}
          <Card style={styles.formCard}>
            <Card.Content style={styles.formContent}>
              <Text variant="headlineSmall" style={styles.formTitle}>
                Create Account
              </Text>
              <Text variant="bodyMedium" style={styles.formSubtitle}>
                Fill in your details to get started
              </Text>

              <TextInput
                label="Username"
                value={username}
                onChangeText={setUsername}
                mode="outlined"
                autoCapitalize="none"
                style={styles.input}
                left={<TextInput.Icon icon="account" />}
                disabled={loading}
              />

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
                label="Age"
                value={age}
                onChangeText={setAge}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
                left={<TextInput.Icon icon="calendar" />}
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

              <TextInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                mode="outlined"
                secureTextEntry={!showConfirmPassword}
                style={styles.input}
                left={<TextInput.Icon icon="lock-check" />}
                right={
                  <TextInput.Icon
                    icon={showConfirmPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                }
                disabled={loading}
              />

              <Button
                mode="contained"
                onPress={handleSignup}
                style={styles.signupButton}
                disabled={loading}
                loading={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>

              <View style={styles.divider}>
                <Text variant="bodySmall" style={styles.dividerText}>
                  Already have an account?
                </Text>
              </View>

              <Button
                mode="outlined"
                onPress={handleBackToLogin}
                style={styles.loginButton}
                disabled={loading}
              >
                Sign In Instead
              </Button>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 40,
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
    marginBottom: 40,
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
  signupButton: {
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
  loginButton: {
    paddingVertical: 6,
  },
});

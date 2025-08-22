import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { getTheme } from '@/constants/PaperTheme';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function AuthLayout() {
  const colorScheme = useColorScheme();

  return (
    <PaperProvider theme={getTheme(colorScheme)}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen 
          name="login" 
          options={{
            title: 'Sign In',
          }}
        />
        <Stack.Screen 
          name="signup" 
          options={{
            title: 'Sign Up',
          }}
        />
      </Stack>
    </PaperProvider>
  );
}

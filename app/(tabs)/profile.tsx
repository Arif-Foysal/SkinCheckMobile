import { StyleSheet, Alert } from 'react-native';
import {
  Surface,
  Card,
  Text,
  Button,
  Avatar,
  List,
  Divider,
  IconButton,
} from 'react-native-paper';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your scan history will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // TODO: Implement account deletion API call
            console.log('Delete account requested');
          }
        }
      ]
    );
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <Surface style={styles.headerImageContainer} elevation={0}>
          <Avatar.Icon size={120} icon="account" style={styles.headerIcon} />
        </Surface>
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Profile</ThemedText>
      </ThemedView>

      {/* User Info Card */}
      <Surface style={styles.userCard} elevation={2}>
        <Card.Content style={styles.userContent}>
          <Avatar.Icon size={60} icon="account" style={styles.userAvatar} />
          <ThemedView style={styles.userInfo}>
            <Text variant="headlineSmall" style={styles.userName}>
              {user?.email || 'User'}
            </Text>
            <Text variant="bodyMedium" style={styles.userSubtitle}>
              SkinCheck Member
            </Text>
          </ThemedView>
        </Card.Content>
      </Surface>

      {/* Settings Section */}
      <Surface style={styles.settingsCard} elevation={1}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Account Settings
        </Text>
        
        <List.Item
          title="Privacy & Security"
          description="Manage your privacy settings"
          left={(props) => <List.Icon {...props} icon="shield-account" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => console.log('Privacy settings')}
        />
        
        <Divider />
        
        <List.Item
          title="Notifications"
          description="Control your notification preferences"
          left={(props) => <List.Icon {...props} icon="bell" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => console.log('Notification settings')}
        />
        
        <Divider />
        
        <List.Item
          title="Data & Storage"
          description="Manage your scan history and data"
          left={(props) => <List.Icon {...props} icon="database" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => console.log('Data settings')}
        />
      </Surface>

      {/* Support Section */}
      <Surface style={styles.supportCard} elevation={1}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Support & Information
        </Text>
        
        <List.Item
          title="Help & FAQ"
          description="Get answers to common questions"
          left={(props) => <List.Icon {...props} icon="help-circle" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => console.log('Help & FAQ')}
        />
        
        <Divider />
        
        <List.Item
          title="Medical Disclaimer"
          description="Important medical information"
          left={(props) => <List.Icon {...props} icon="alert-circle" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => console.log('Medical disclaimer')}
        />
        
        <Divider />
        
        <List.Item
          title="About SkinCheck"
          description="Version 1.0.0"
          left={(props) => <List.Icon {...props} icon="information" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => console.log('About')}
        />
      </Surface>

      {/* Danger Zone */}
      <Surface style={styles.dangerCard} elevation={1}>
        <Text variant="titleMedium" style={[styles.sectionTitle, styles.dangerTitle]}>
          Danger Zone
        </Text>
        
        <List.Item
          title="Delete Account"
          description="Permanently delete your account and all data"
          left={(props) => <List.Icon {...props} icon="delete" color="#f44336" />}
          titleStyle={styles.dangerText}
          onPress={handleDeleteAccount}
        />
      </Surface>

      {/* Logout Button */}
      <ThemedView style={styles.logoutContainer}>
        <Button
          mode="contained"
          buttonColor="#f44336"
          onPress={handleLogout}
          style={styles.logoutButton}
          icon="logout"
        >
          Sign Out
        </Button>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  // Header styles matching other screens
  headerImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  headerIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },

  // User Info Card
  userCard: {
    margin: 16,
    borderRadius: 12,
  },
  userContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  userAvatar: {
    backgroundColor: '#4caf50',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userSubtitle: {
    opacity: 0.7,
  },

  // Settings Cards
  settingsCard: {
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 8,
  },
  supportCard: {
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 8,
  },
  dangerCard: {
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 8,
    backgroundColor: '#fff3e0',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    marginLeft: 16,
    marginTop: 8,
  },
  dangerTitle: {
    color: '#f44336',
  },
  dangerText: {
    color: '#f44336',
  },

  // Logout
  logoutContainer: {
    margin: 16,
    marginTop: 24,
  },
  logoutButton: {
    paddingVertical: 6,
  },
});

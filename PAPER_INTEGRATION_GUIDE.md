# React Native Paper Integration Guide

## Overview
React Native Paper is now successfully integrated into your SkinCheckMobile app! This guide shows you how to use the various components and features.

## What's Set Up

### 1. **PaperProvider Configuration**
- Added to `app/_layout.tsx` with custom theme support
- Supports both light and dark modes
- Custom theme defined in `constants/PaperTheme.ts`

### 2. **Custom Theme**
- Medical/health-focused color palette
- Consistent with Material Design 3
- Automatic dark/light mode switching

## Using React Native Paper Components

### Basic Components

```tsx
import { Button, Text, Surface, Card } from 'react-native-paper';

// Buttons
<Button mode="contained">Primary Action</Button>
<Button mode="outlined">Secondary Action</Button>
<Button mode="text">Text Button</Button>

// Text with built-in typography
<Text variant="headlineLarge">Large Headline</Text>
<Text variant="bodyMedium">Body text</Text>

// Surface for elevated content
<Surface elevation={4} style={styles.surface}>
  <Text>Elevated content</Text>
</Surface>
```

### Input Components

```tsx
import { TextInput, Checkbox, Switch, RadioButton } from 'react-native-paper';

// Text Input
<TextInput
  label="Email"
  value={email}
  onChangeText={setEmail}
  mode="outlined"
  left={<TextInput.Icon icon="email" />}
/>

// Switch
<Switch value={isEnabled} onValueChange={setIsEnabled} />

// Checkbox
<Checkbox
  status={checked ? 'checked' : 'unchecked'}
  onPress={() => setChecked(!checked)}
/>
```

### Layout Components

```tsx
import { Card, Divider, List } from 'react-native-paper';

// Card with sections
<Card>
  <Card.Title title="Card Title" subtitle="Subtitle" />
  <Card.Content>
    <Text>Card content</Text>
  </Card.Content>
  <Card.Actions>
    <Button>Cancel</Button>
    <Button mode="contained">Save</Button>
  </Card.Actions>
</Card>

// Divider
<Divider />

// List items
<List.Item
  title="First Item"
  description="Item description"
  left={props => <List.Icon {...props} icon="folder" />}
/>
```

### Feedback Components

```tsx
import { Snackbar, Dialog, Portal, ProgressBar } from 'react-native-paper';

// Snackbar for notifications
<Snackbar
  visible={visible}
  onDismiss={() => setVisible(false)}
  action={{
    label: 'Undo',
    onPress: () => {
      // Handle action
    },
  }}
>
  Message sent successfully!
</Snackbar>

// Dialog
<Portal>
  <Dialog visible={visible} onDismiss={hideDialog}>
    <Dialog.Title>Alert</Dialog.Title>
    <Dialog.Content>
      <Text>This is simple dialog</Text>
    </Dialog.Content>
    <Dialog.Actions>
      <Button onPress={hideDialog}>Done</Button>
    </Dialog.Actions>
  </Dialog>
</Portal>

// Progress indicators
<ProgressBar progress={0.5} />
<ProgressBar indeterminate />
```

### Navigation Components

```tsx
import { FAB, IconButton, Chip } from 'react-native-paper';

// Floating Action Button
<FAB
  icon="camera"
  style={styles.fab}
  onPress={() => console.log('Pressed')}
/>

// Icon buttons
<IconButton icon="heart" size={20} onPress={() => console.log('Pressed')} />

// Chips for tags/filters
<Chip icon="tag" onPress={() => console.log('Pressed')}>
  Health
</Chip>
```

## Theming

### Using Custom Colors
```tsx
import { useTheme } from 'react-native-paper';

function MyComponent() {
  const theme = useTheme();
  
  return (
    <View style={{ backgroundColor: theme.colors.primary }}>
      <Text style={{ color: theme.colors.onPrimary }}>
        Themed text
      </Text>
    </View>
  );
}
```

### Customizing Theme
Edit `constants/PaperTheme.ts` to modify colors:

```tsx
const customColors = {
  primary: '#6200EE',
  secondary: '#03DAC6',
  // ... other colors
};
```

## Examples in Your App

### 1. **Home Screen (`app/(tabs)/index.tsx`)**
- Demonstrates basic Paper components
- Shows Card, Button, Surface, and Text components
- Material Design principles applied

### 2. **Scan Screen (`app/(tabs)/scan.tsx`)**
- Camera interface with Paper components
- Progress indicators during analysis
- Modal dialogs for results
- Card-based image preview

### 3. **Components Demo (`components/PaperComponents.tsx`)**
- Comprehensive showcase of all Paper components
- Interactive examples
- Best practices for form layouts

## Best Practices

### 1. **Consistent Component Usage**
- Use Paper components consistently throughout your app
- Stick to the design system for better UX
- Leverage built-in accessibility features

### 2. **Theming**
- Use theme colors instead of hardcoded values
- Ensure proper contrast ratios
- Test in both light and dark modes

### 3. **Typography**
- Use Paper's text variants for consistent typography
- Follow Material Design type scale
- Ensure readability on all screen sizes

### 4. **Spacing and Layout**
- Use consistent spacing with theme values
- Follow Material Design layout principles
- Ensure touch targets are appropriately sized

## Next Steps

1. **Explore More Components**: Check out [React Native Paper documentation](https://reactnativepaper.com/) for additional components
2. **Customize Your Theme**: Modify the theme to match your brand colors
3. **Add Icons**: Install `react-native-vector-icons` for more icon options
4. **Accessibility**: Ensure all components have proper accessibility labels

## Available Scripts

Run your app to see the Paper components in action:

```bash
npm run start      # Start Expo development server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on web
```

Your app now has a beautiful, consistent Material Design interface powered by React Native Paper!

import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import {
  Button,
  Card,
  Text,
  TextInput,
  Switch,
  Checkbox,
  RadioButton,
  FAB,
  Chip,
  Avatar,
  Surface,
  Divider,
  IconButton,
  ProgressBar,
  Snackbar,
} from 'react-native-paper';

export default function PaperComponents() {
  const [text, setText] = useState('');
  const [isSwitchOn, setIsSwitchOn] = useState(false);
  const [checked, setChecked] = useState(false);
  const [value, setValue] = useState('first');
  const [visible, setVisible] = useState(false);

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.surface} elevation={4}>
        <Text variant="headlineMedium" style={styles.title}>
          React Native Paper Components
        </Text>
        
        {/* Text Input */}
        <TextInput
          label="Email"
          value={text}
          onChangeText={setText}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="email" />}
        />
        
        {/* Buttons */}
        <Button mode="contained" style={styles.button}>
          Contained Button
        </Button>
        <Button mode="outlined" style={styles.button}>
          Outlined Button
        </Button>
        <Button mode="text" style={styles.button}>
          Text Button
        </Button>
        
        <Divider style={styles.divider} />
        
        {/* Switch and Checkbox */}
        <Surface style={styles.row}>
          <Text>Enable notifications</Text>
          <Switch value={isSwitchOn} onValueChange={setIsSwitchOn} />
        </Surface>
        
        <Surface style={styles.row}>
          <Text>Accept terms</Text>
          <Checkbox
            status={checked ? 'checked' : 'unchecked'}
            onPress={() => setChecked(!checked)}
          />
        </Surface>
        
        {/* Radio Buttons */}
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Choose option:
        </Text>
        <RadioButton.Group onValueChange={setValue} value={value}>
          <Surface style={styles.row}>
            <Text>First option</Text>
            <RadioButton value="first" />
          </Surface>
          <Surface style={styles.row}>
            <Text>Second option</Text>
            <RadioButton value="second" />
          </Surface>
        </RadioButton.Group>
        
        <Divider style={styles.divider} />
        
        {/* Chips */}
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Tags:
        </Text>
        <Surface style={styles.chipContainer}>
          <Chip icon="tag" style={styles.chip}>Health</Chip>
          <Chip icon="tag" style={styles.chip}>Medical</Chip>
          <Chip icon="tag" style={styles.chip}>Scan</Chip>
        </Surface>
        
        {/* Card with Avatar */}
        <Card style={styles.card}>
          <Card.Title
            title="Dr. Smith"
            subtitle="Dermatologist"
            left={(props) => <Avatar.Icon {...props} icon="doctor" />}
            right={(props) => <IconButton {...props} icon="dots-vertical" />}
          />
          <Card.Content>
            <Text variant="bodyMedium">
              Professional skin analysis and consultation available.
            </Text>
          </Card.Content>
          <Card.Actions>
            <Button>Contact</Button>
            <Button mode="contained">Book Appointment</Button>
          </Card.Actions>
        </Card>
        
        {/* Progress Bar */}
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Analysis Progress:
        </Text>
        <ProgressBar progress={0.7} style={styles.progressBar} />
        
        {/* Button to show Snackbar */}
        <Button
          mode="outlined"
          onPress={() => setVisible(true)}
          style={styles.button}
        >
          Show Snackbar
        </Button>
      </Surface>
      
      {/* Floating Action Button */}
      <FAB
        icon="camera"
        style={styles.fab}
        onPress={() => console.log('FAB pressed')}
      />
      
      {/* Snackbar */}
      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        action={{
          label: 'Undo',
          onPress: () => {
            // Do something
          },
        }}
      >
        Analysis completed successfully!
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  surface: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginVertical: 4,
  },
  divider: {
    marginVertical: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  chip: {
    margin: 4,
  },
  card: {
    marginVertical: 16,
  },
  progressBar: {
    marginVertical: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

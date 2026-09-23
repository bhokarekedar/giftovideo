import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { theme } from '../core/theme';
import { Button } from '../components/Button';

export default function GalleryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Projects</Text>
      
      <Link href="/editor/new_project_123" asChild>
        <Button title="Create New Project" onPress={() => {}} />
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    marginBottom: theme.spacing.xl,
  },
});

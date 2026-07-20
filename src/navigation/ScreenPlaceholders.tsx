import { StyleSheet, Text } from 'react-native';

import { ScreenContainer } from '../components';
import { typography } from '../theme';

type PlaceholderScreenProps = {
  title: string;
};

function PlaceholderScreen({ title }: PlaceholderScreenProps) {
  return (
    <ScreenContainer>
      <Text style={styles.title}>{title}</Text>
    </ScreenContainer>
  );
}

export function TimelineScreen() {
  return <PlaceholderScreen title="Timeline" />;
}

export function AIChatScreen() {
  return <PlaceholderScreen title="AI Chat" />;
}

const styles = StyleSheet.create({
  title: {
    ...typography.title,
  },
});

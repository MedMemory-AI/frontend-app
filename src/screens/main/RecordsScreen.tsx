import { StyleSheet, Text } from 'react-native';

import { ScreenContainer } from '../../components';
import { typography } from '../../theme';

export function RecordsScreen() {
  return (
    <ScreenContainer>
      <Text style={styles.title}>Medical Records</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.title,
  },
});

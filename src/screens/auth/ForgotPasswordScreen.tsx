import { StyleSheet, Text } from 'react-native';

import { ScreenContainer } from '../../components';
import { typography } from '../../theme';

export function ForgotPasswordScreen() {
  return (
    <ScreenContainer centered>
      <Text style={styles.title}>Forgot Password</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.title,
  },
});

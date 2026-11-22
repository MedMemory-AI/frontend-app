import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FormInput, PrimaryButton, ScreenContainer } from '../../components';
import type { AppStackNavigationProp } from '../../navigation/createStackNavigator';
import type { AuthStackParamList } from '../../navigation/types';
import { verifyOtpSchema, type VerifyOtpFormValues } from '../../schemas/auth';
import { useAuthStore } from '../../stores';
import { colors, spacing, textStyles } from '../../theme';

type VerifyOtpNavigationProp = AppStackNavigationProp<AuthStackParamList, 'VerifyOtp'>;

export function VerifyOtpScreen() {
  const navigation = useNavigation<VerifyOtpNavigationProp>();
  const user = useAuthStore((state) => state.user);
  const verifyOtp = useAuthStore((state) => state.verifyOtp);
  const logout = useAuthStore((state) => state.logout);
  const isLoading = useAuthStore((state) => state.isLoading);
  const authError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const { control, handleSubmit } = useForm<VerifyOtpFormValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      otp: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    clearError();

    try {
      await verifyOtp(values.otp.trim());
    } catch {
      // Error state is handled in the auth store.
    }
  });

  return (
    <ScreenContainer scrollable>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Verify your email</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit OTP sent to {user?.email ?? 'your email'}
          </Text>
        </View>

        <View style={styles.form}>
          <FormInput
            autoCapitalize="none"
            autoComplete="one-time-code"
            control={control}
            keyboardType="number-pad"
            label="OTP"
            maxLength={6}
            name="otp"
            placeholder="123456"
            textContentType="oneTimeCode"
          />

          {authError ? <Text style={styles.authError}>{authError}</Text> : null}

          <PrimaryButton label="Verify OTP" loading={isLoading} onPress={onSubmit} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Wrong account?</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              clearError();
              void logout().then(() => {
                navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
              });
            }}
          >
            <Text style={styles.footerLink}>Sign in again</Text>
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: spacing.xl,
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  header: {
    gap: spacing.sm,
  },
  title: {
    ...textStyles.h1,
  },
  subtitle: {
    ...textStyles.body,
    color: colors.textSecondary,
  },
  form: {
    gap: spacing.md,
  },
  authError: {
    ...textStyles.error,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
  },
  footerText: {
    ...textStyles.body,
    color: colors.textSecondary,
  },
  footerLink: {
    ...textStyles.body,
    color: colors.textLink,
    fontWeight: textStyles.label.fontWeight,
  },
});

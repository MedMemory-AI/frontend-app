import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FormInput, PrimaryButton, ScreenContainer } from '../../components';
import type { AppStackNavigationProp } from '../../navigation/createStackNavigator';
import type { AuthStackParamList } from '../../navigation/types';
import { loginSchema, type LoginFormValues } from '../../schemas/auth';
import { useAuthStore } from '../../stores';
import { colors, layout, radius, spacing, textStyles } from '../../theme';

type LoginNavigationProp = AppStackNavigationProp<AuthStackParamList, 'Login'>;

export function LoginScreen() {
  const navigation = useNavigation<LoginNavigationProp>();
  const login = useAuthStore((state) => state.login);
  const loginAsGuest = useAuthStore((state) => state.loginAsGuest);
  const isLoading = useAuthStore((state) => state.isLoading);
  const authError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const { control, handleSubmit } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    clearError();

    try {
      await login(values.email.trim(), values.password);
    } catch {
      // Error state is handled in the auth store.
    }
  });

  return (
    <ScreenContainer scrollable>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to access your medical memory</Text>
        </View>

        <View style={styles.form}>
          <FormInput
            autoCapitalize="none"
            autoComplete="email"
            control={control}
            keyboardType="email-address"
            label="Email"
            name="email"
            placeholder="you@example.com"
            textContentType="emailAddress"
          />
          <FormInput
            autoCapitalize="none"
            autoComplete="password"
            control={control}
            label="Password"
            name="password"
            placeholder="Enter your password"
            secureTextEntry
            textContentType="password"
          />

          {authError ? <Text style={styles.authError}>{authError}</Text> : null}

          <PrimaryButton label="Sign In" loading={isLoading} onPress={onSubmit} />

          <Pressable
            accessibilityRole="button"
            onPress={() => {
              clearError();
              loginAsGuest();
            }}
            style={({ pressed }) => [
              styles.guestButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.guestButtonText}>Explore as Guest</Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don&apos;t have an account?</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              clearError();
              navigation.navigate('Register');
            }}
          >
            <Text style={styles.footerLink}>Create account</Text>
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
  guestButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: radius.md,
    minHeight: layout.minTouchTarget,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  guestButtonText: {
    ...textStyles.button,
    color: colors.primary,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.8,
  },
});

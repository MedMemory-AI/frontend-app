import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FormInput, PrimaryButton, ScreenContainer } from '../../components';
import type { AppStackNavigationProp } from '../../navigation/createStackNavigator';
import type { AuthStackParamList } from '../../navigation/types';
import { registerSchema, type RegisterFormValues } from '../../schemas/auth';
import { useAuthStore } from '../../stores';
import { colors, layout, radius, spacing, textStyles } from '../../theme';

type RegisterNavigationProp = AppStackNavigationProp<AuthStackParamList, 'Register'>;

export function RegisterScreen() {
  const navigation = useNavigation<RegisterNavigationProp>();
  const register = useAuthStore((state) => state.register);
  const loginAsGuest = useAuthStore((state) => state.loginAsGuest);
  const isLoading = useAuthStore((state) => state.isLoading);
  const authError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);
  const insets = useSafeAreaInsets();

  const { control, handleSubmit } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    clearError();

    try {
      await register({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        password: values.password,
      });
    } catch {
      // Error state is handled in the auth store.
    }
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardContainer}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
    >
      <ScreenContainer scrollable>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Start building your personal medical memory</Text>
          </View>

          <View style={styles.form}>
            <FormInput
              autoCapitalize="words"
              autoComplete="name"
              control={control}
              label="Full name"
              name="fullName"
              placeholder="John Doe"
              textContentType="name"
            />
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
              autoComplete="password-new"
              control={control}
              label="Password"
              name="password"
              placeholder="At least 8 characters"
              secureTextEntry
              textContentType="newPassword"
            />

            {authError ? <Text style={styles.authError}>{authError}</Text> : null}

            <PrimaryButton label="Create Account" loading={isLoading} onPress={onSubmit} />

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
            <Text style={styles.footerText}>Already have an account?</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                clearError();
                navigation.navigate('Login');
              }}
            >
              <Text style={styles.footerLink}>Sign in</Text>
            </Pressable>
          </View>
        </View>
      </ScreenContainer>
    </KeyboardAvoidingView>
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
  keyboardContainer: {
    flex: 1,
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

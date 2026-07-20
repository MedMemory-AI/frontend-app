import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import { colors, radius, spacing, textStyles } from '../theme';

type FormInputProps<T extends FieldValues> = Omit<TextInputProps, 'value' | 'onChangeText'> & {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
};

export function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  style,
  ...props
}: FormInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View style={styles.container}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            onBlur={onBlur}
            onChangeText={onChange}
            placeholderTextColor={colors.textTertiary}
            style={[styles.input, error && styles.inputError, style]}
            value={value ?? ''}
            {...props}
          />
          {error?.message ? <Text style={styles.error}>{error.message}</Text> : null}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    ...textStyles.label,
  },
  input: {
    ...textStyles.body,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.text,
    minHeight: 52,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputError: {
    borderColor: colors.error,
  },
  error: {
    ...textStyles.error,
  },
});

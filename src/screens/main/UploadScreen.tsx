import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { AlertCircle, CheckCircle2, FilePlus, FileText, Upload, X } from 'lucide-react-native';

import { uploadFiles } from '../../api';
import { GlobalHeader, PrimaryButton, ScreenContainer } from '../../components';
import { colors, radius, spacing, textStyles } from '../../theme';
import { useAuthStore } from '../../stores';

type UploadStatus = 'idle' | 'loading' | 'success' | 'error';

type UploadResponseData = {
  status: "processing";
  estimatedTime: string;
};

type SelectedFile = {
  uri: string;
  name: string;
  type: string;
  size?: number;
  previewType: 'image' | 'pdf' | 'doc';
};

export function UploadScreen() {
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [docType, setDocType] = useState<'prescription' | 'report'>('prescription');
  const [status, setStatus] = useState<{ type: UploadStatus; message: string }>({
    type: 'idle',
    message: '',
  });

  async function pickDocument() {
    if (useAuthStore.getState().isGuest) {
      Alert.alert('Please login to continue.', '', [
        {
          text: 'OK',
          onPress: () => {
            useAuthStore.getState().exitGuestMode();
          },
        },
      ]);
      return;
    }
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'image/*',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      const asset = result.assets[0];
      const mime = asset.mimeType ?? 'application/octet-stream';
      
      let previewType: 'image' | 'pdf' | 'doc' = 'doc';
      if (mime.startsWith('image/')) {
        previewType = 'image';
      } else if (mime === 'application/pdf') {
        previewType = 'pdf';
      }

      setSelectedFile({
        uri: asset.uri,
        name: asset.name ?? 'document',
        type: mime,
        size: asset.size,
        previewType,
      });
      setStatus({ type: 'idle', message: 'Document ready to upload.' });
    } catch (error) {
      setStatus({ type: 'error', message: 'Could not pick the medical document.' });
      console.error(error);
    }
  }

  async function uploadFile() {
    if (useAuthStore.getState().isGuest) {
      Alert.alert('Please login to continue.', '', [
        {
          text: 'OK',
          onPress: () => {
            useAuthStore.getState().exitGuestMode();
          },
        },
      ]);
      return;
    }
    if (!selectedFile) {
      setStatus({
        type: "error",
        message: "Please choose a file first.",
      });
      return;
    }

    setStatus({
      type: "loading",
      message: "Uploading document...",
    });

    try {
      const response = await uploadFiles<UploadResponseData>(
        "/ingestion/upload",
        {
          file: {
            uri: selectedFile.uri,
            name: selectedFile.name,
            type: selectedFile.type,
          },
        },
        {
          headers: {
            "x-doc-type": docType,
          },
        }
      );

      setStatus({
        type: "success",
        message:
          "Upload successful.\n\nYour document is now being processed.\n\nPlease refresh the Timeline page after 1–2 minutes.",
      });

      Alert.alert(
        "Processing Started",
        "Your document has been uploaded successfully.\n\nProcessing usually takes 1–2 minutes.\n\nPlease refresh Timeline after that."
      );

      setSelectedFile(null);

    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Upload failed.";

      setStatus({
        type: "error",
        message,
      });

      Alert.alert(
        "Upload Failed",
        message,
      );
    }
  }

  return (
    <ScreenContainer scrollable safeAreaTop={false} padded={false}>
      <GlobalHeader />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Upload records</Text>
          <Text style={styles.subtitle}>
            Select a prescription or lab report to add to your AI medical memory.
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [
              styles.chooseBtn,
              pressed && styles.pressed,
            ]}
            onPress={pickDocument}
          >
            <FilePlus color={colors.textInverse} size={20} strokeWidth={2.25} />
            <Text style={styles.chooseBtnText}>Choose Medical Document</Text>
          </Pressable>
        </View>

        <View style={styles.typeSelectorContainer}>
          <Text style={styles.typeSelectorLabel}>Document Category</Text>
          <View style={styles.typeButtonsRow}>
            <Pressable
              style={[
                styles.typeButton,
                docType === 'prescription' && styles.typeButtonActive,
              ]}
              onPress={() => setDocType('prescription')}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  docType === 'prescription' && styles.typeButtonTextActive,
                ]}
              >
                Prescription
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.typeButton,
                docType === 'report' && styles.typeButtonActive,
              ]}
              onPress={() => setDocType('report')}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  docType === 'report' && styles.typeButtonTextActive,
                ]}
              >
                Lab Report
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Selected File / File Preview Card */}
        <View style={styles.cardOutline}>
          <Text style={styles.sectionTitle}>Document Preview</Text>
          <Pressable
            onPress={selectedFile ? undefined : pickDocument}
            style={({ pressed }) => [
              styles.previewContainer,
              !selectedFile && styles.previewContainerDashed,
              !selectedFile && pressed && styles.pressed,
            ]}
          >
            {selectedFile ? (
              <View style={styles.selectedFileBox}>
                <View style={styles.fileInfoRow}>
                  {selectedFile.previewType === 'image' ? (
                    <Image source={{ uri: selectedFile.uri }} style={styles.imageThumbnail} />
                  ) : (
                    <View style={[styles.fileIconBox, selectedFile.previewType === 'pdf' ? styles.iconPdfBg : styles.iconDocBg]}>
                      <FileText color={selectedFile.previewType === 'pdf' ? '#EF4444' : '#3B82F6'} size={24} />
                    </View>
                  )}

                  <View style={styles.fileDetails}>
                    <Text style={styles.fileName} numberOfLines={1}>
                      {selectedFile.name}
                    </Text>
                    <Text style={styles.fileMeta}>
                      {selectedFile.type.split('/')[1]?.toUpperCase() || 'DOCUMENT'} • {selectedFile.size ? `${Math.round(selectedFile.size / 1024)} KB` : 'Unknown size'}
                    </Text>
                  </View>

                  <Pressable
                    onPress={() => {
                      setSelectedFile(null);
                      setStatus({ type: 'idle', message: '' });
                    }}
                    style={({ pressed }) => [
                      styles.removeBtn,
                      pressed && styles.pressed,
                    ]}
                    accessibilityLabel="Remove selected file"
                  >
                    <X size={20} color={colors.textSecondary} />
                  </Pressable>
                </View>

                <View style={styles.successBadge}>
                  <CheckCircle2 color={colors.success} size={14} />
                  <Text style={styles.successBadgeText}>Ready to Upload</Text>
                </View>
              </View>
            ) : (
              <View style={styles.emptyPreview}>
                <View style={styles.emptyIconCircle}>
                  <Upload color={colors.primary} size={28} />
                </View>
                <Text style={styles.emptyTitle}>No medical document selected</Text>
                <Text style={styles.emptySubtitle}>
                  Supported formats: PDF, DOC, DOCX, JPG, PNG
                </Text>
                <Text style={styles.emptyTapMessage}>Tap here to browse files</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Status Colored Info Cards */}
        {status.type !== 'idle' && status.message ? (
          <View
            style={[
              styles.statusCard,
              status.type === 'success' && styles.statusCardSuccess,
              status.type === 'error' && styles.statusCardError,
              status.type === 'loading' && styles.statusCardLoading,
            ]}
          >
            <View style={styles.statusHeaderRow}>
              {status.type === 'loading' ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : status.type === 'success' ? (
                <CheckCircle2 color={colors.success} size={22} />
              ) : (
                <AlertCircle color={colors.error} size={22} />
              )}
              <Text
                style={[
                  styles.statusTitle,
                  status.type === 'success' && styles.statusTextSuccess,
                  status.type === 'error' && styles.statusTextError,
                  status.type === 'loading' && styles.statusTextLoading,
                ]}
              >
                {status.type === 'loading'
                  ? 'Uploading Document...'
                  : status.type === 'success'
                  ? 'Document Uploaded Successfully'
                  : 'Upload Failed'}
              </Text>
            </View>

            {status.type === 'success' ? (
              <View style={styles.successDetails}>
                <Text style={styles.successDetailsText}>
                  Processing has started.
                </Text>
                <View style={styles.timeInfoRow}>
                  <Text style={styles.successDetailsLabel}>Estimated processing time:</Text>
                  <Text style={styles.successDetailsValue}>1–2 minutes</Text>
                </View>
                <Text style={styles.successInstructions}>
                  Please refresh the Timeline tab after processing completes to view your updated health logs.
                </Text>
              </View>
            ) : (
              <Text style={styles.statusBodyText}>{status.message}</Text>
            )}
          </View>
        ) : null}

        <PrimaryButton
          label="Upload Document"
          loading={status.type === 'loading'}
          disabled={status.type === "loading" || !selectedFile}
          onPress={uploadFile}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  header: {
    gap: spacing.xs,
  },
  title: {
    ...textStyles.h2,
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  actions: {
    gap: spacing.sm,
  },
  chooseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  chooseBtnText: {
    ...textStyles.button,
    color: colors.textInverse,
  },
  typeSelectorContainer: {
    gap: spacing.xs,
  },
  typeSelectorLabel: {
    ...textStyles.label,
    color: colors.text,
  },
  typeButtonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  typeButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  typeButtonText: {
    ...textStyles.label,
    color: colors.textSecondary,
  },
  typeButtonTextActive: {
    color: colors.primary,
  },
  cardOutline: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 16,
    gap: spacing.sm,
  },
  sectionTitle: {
    ...textStyles.label,
    fontSize: 14,
    color: colors.textSecondary,
  },
  previewContainer: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  previewContainerDashed: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    backgroundColor: colors.background,
  },
  selectedFileBox: {
    gap: spacing.md,
  },
  fileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  imageThumbnail: {
    width: 52,
    height: 52,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
  },
  fileIconBox: {
    width: 52,
    height: 52,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPdfBg: {
    backgroundColor: '#FEE2E2',
  },
  iconDocBg: {
    backgroundColor: '#DBEAFE',
  },
  fileDetails: {
    flex: 1,
    gap: spacing.xxs,
  },
  fileName: {
    ...textStyles.label,
    fontSize: 14,
    color: colors.text,
  },
  fileMeta: {
    ...textStyles.caption,
    fontSize: 12,
    color: colors.textSecondary,
  },
  removeBtn: {
    padding: spacing.xs,
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    gap: 4,
  },
  successBadgeText: {
    ...textStyles.caption,
    fontSize: 11,
    fontWeight: '600',
    color: colors.success,
  },
  emptyPreview: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: spacing.xs,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxs,
  },
  emptyTitle: {
    ...textStyles.label,
    fontSize: 14,
    color: colors.text,
  },
  emptySubtitle: {
    ...textStyles.caption,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  emptyTapMessage: {
    ...textStyles.caption,
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginTop: spacing.xxs,
  },
  statusCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 16,
    gap: spacing.sm,
  },
  statusCardSuccess: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  statusCardError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  statusCardLoading: {
    backgroundColor: '#F8FAFC',
    borderColor: colors.border,
  },
  statusHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusTitle: {
    ...textStyles.label,
    fontSize: 15,
    fontWeight: '700',
  },
  statusTextSuccess: {
    color: colors.success,
  },
  statusTextError: {
    color: colors.error,
  },
  statusTextLoading: {
    color: colors.text,
  },
  statusBodyText: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  successDetails: {
    gap: spacing.xs,
  },
  successDetailsText: {
    ...textStyles.bodySmall,
    color: colors.text,
  },
  timeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  successDetailsLabel: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
  },
  successDetailsValue: {
    ...textStyles.bodySmall,
    fontWeight: '600',
    color: colors.text,
  },
  successInstructions: {
    ...textStyles.caption,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
  pressed: {
    opacity: 0.82,
  },
});

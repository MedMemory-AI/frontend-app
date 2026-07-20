import { RouteProp, useRoute } from '@react-navigation/native';
import {
  Activity,
  AlertCircle,
  CalendarDays,
  ClipboardList,
  FileText,
  HeartPulse,
  Pill,
  Sparkles,
  Stethoscope,
} from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Card, ScreenContainer } from '../../components';
import type { RootStackParamList } from '../../navigation/types';
import { colors, radius, spacing, textStyles, typography } from '../../theme';

type TimelineDetailRouteProp = RouteProp<RootStackParamList, 'TimelineDetails'>;

function getDateLabel(value?: string): string {
  if (!value) {
    return 'Recorded recently';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Recorded recently';
  }

  return parsed.toLocaleString(undefined, {
    dateStyle: 'full',
    timeStyle: 'short',
  });
}

function isValidValue(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return (
      trimmed !== '' &&
      trimmed.toLowerCase() !== 'n/a' &&
      trimmed.toLowerCase() !== 'not provided' &&
      trimmed.toLowerCase() !== 'not_provided'
    );
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  if (typeof value === 'object') {
    return Object.keys(value).length > 0;
  }
  return true;
}

function formatFindingKey(key: string): string {
  return key
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function TimelineDetailScreen() {
  const route = useRoute<TimelineDetailRouteProp>();
  const entry = route.params?.entry;

  if (!entry) {
    return (
      <ScreenContainer>
        <View style={styles.content}>
          <Text style={styles.title}>Entry unavailable</Text>
          <Text style={styles.subtitle}>No timeline entry was provided.</Text>
        </View>
      </ScreenContainer>
    );
  }

  const renderFindingsTable = (findings: any) => {
    if (!findings) return null;

    let parsedFindings: Record<string, any> = {};
    if (typeof findings === 'string') {
      try {
        parsedFindings = JSON.parse(findings);
      } catch {
        return <Text style={styles.bodyText}>{findings}</Text>;
      }
    } else if (typeof findings === 'object') {
      parsedFindings = findings;
    }

    const entries = Object.entries(parsedFindings).filter(([_, val]) => isValidValue(val));
    if (entries.length === 0) return null;

    return (
      <View style={styles.findingsTable}>
        {entries.map(([key, value]) => (
          <View key={key} style={styles.findingRow}>
            <Text style={styles.findingKey}>{formatFindingKey(key)}</Text>
            <Text style={styles.findingValue}>{String(value)}</Text>
          </View>
        ))}
      </View>
    );
  };

  // Parse conditions/diseases
  let diseasesList: string[] = [];
  if (Array.isArray(entry.diseases)) {
    diseasesList = entry.diseases;
  } else if (typeof entry.diseases === 'string') {
    diseasesList = entry.diseases.split(',').map((d) => d.trim()).filter(Boolean);
  }

  const showClinicalSummary = isValidValue(entry.highlights);
  const showDoctor = isValidValue(entry.doctor);
  const showDiagnosis = isValidValue(entry.preDiagnosis) || diseasesList.length > 0;
  const showTreatment = isValidValue(entry.treatment);
  const showFindings = isValidValue(entry.findings);
  const showHighlights = isValidValue(entry.highlights);

  return (
    <ScreenContainer scrollable>
      <View style={styles.content}>
        {/* Document type and meta details */}
        <View style={styles.header}>
          <View style={styles.docTypeBadge}>
            <HeartPulse color={colors.primary} size={16} />
            <Text style={styles.docTypeBadgeText}>
              {typeof entry.docType === 'string' ? entry.docType.toUpperCase() : 'MEDICAL RECORD'}
            </Text>
          </View>
          <Text style={styles.title}>Clinical Report Details</Text>
          <Text style={styles.subtitle}>{getDateLabel(entry.createdAt as string ?? entry.date as string)}</Text>
        </View>

        {/* Clinical Summary section */}
        {showClinicalSummary && (
          <Card padding="none" style={styles.detailCard}>
            <View style={styles.cardHeaderRow}>
              <Sparkles color="#F59E0B" size={18} />
              <Text style={styles.sectionLabel}>Clinical Summary</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.bodyText}>{entry.highlights as string}</Text>
            </View>
          </Card>
        )}

        {/* Doctor section */}
        {showDoctor && (
          <Card padding="none" style={styles.detailCard}>
            <View style={styles.cardHeaderRow}>
              <Stethoscope color={colors.primary} size={18} />
              <Text style={styles.sectionLabel}>Consulting Doctor</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.bodyText}>{entry.doctor as string}</Text>
            </View>
          </Card>
        )}

        {/* Diagnosis section */}
        {showDiagnosis && (
          <Card padding="none" style={styles.detailCard}>
            <View style={styles.cardHeaderRow}>
              <AlertCircle color={colors.secondary} size={18} />
              <Text style={styles.sectionLabel}>Diagnosis & Conditions</Text>
            </View>
            <View style={styles.cardBody}>
              {isValidValue(entry.preDiagnosis) && (
                <View style={styles.subField}>
                  <Text style={styles.subFieldLabel}>Pre Diagnosis</Text>
                  <Text style={styles.bodyText}>{entry.preDiagnosis as string}</Text>
                </View>
              )}
              {diseasesList.length > 0 && (
                <View style={[styles.subField, isValidValue(entry.preDiagnosis) && { marginTop: 12 }]}>
                  <Text style={styles.subFieldLabel}>Detected Conditions</Text>
                  <View style={styles.chipsRow}>
                    {diseasesList.map((disease, idx) => (
                      <View key={idx} style={styles.diseaseChip}>
                        <Text style={styles.diseaseChipText}>{disease}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </Card>
        )}

        {/* Treatment plan section */}
        {showTreatment && (
          <Card padding="none" style={styles.detailCard}>
            <View style={styles.cardHeaderRow}>
              <Pill color={colors.info} size={18} />
              <Text style={styles.sectionLabel}>Treatment & Prescription</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.bodyText}>{entry.treatment as string}</Text>
            </View>
          </Card>
        )}

        {/* Findings section */}
        {showFindings && (
          <Card padding="none" style={styles.detailCard}>
            <View style={styles.cardHeaderRow}>
              <FileText color={colors.success} size={18} />
              <Text style={styles.sectionLabel}>Clinical Observations & Findings</Text>
            </View>
            <View style={styles.cardBody}>
              {renderFindingsTable(entry.findings)}
            </View>
          </Card>
        )}

        {/* Highlights section */}
        {showHighlights && (
          <Card padding="none" style={styles.detailCard}>
            <View style={styles.cardHeaderRow}>
              <Sparkles color="#D946EF" size={18} />
              <Text style={styles.sectionLabel}>Key Highlights</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.bodyText}>{entry.highlights as string}</Text>
            </View>
          </Card>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  docTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryMuted,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  docTypeBadgeText: {
    ...textStyles.overline,
    color: colors.primary,
    fontWeight: '700',
  },
  title: {
    ...textStyles.h2,
    color: colors.text,
    fontWeight: '700',
  },
  subtitle: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
  },
  detailCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
  },
  cardBody: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 18,
  },
  sectionLabel: {
    ...textStyles.label,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  bodyText: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  subField: {
    gap: spacing.xxs,
    marginTop: spacing.xxs,
  },
  subFieldLabel: {
    ...textStyles.caption,
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xxs,
  },
  diseaseChip: {
    backgroundColor: '#FAF5FF',
    borderColor: '#F3E8FF',
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  diseaseChipText: {
    ...typography.caption,
    fontSize: 12,
    color: '#7C3AED',
    fontWeight: '600',
  },
  findingsTable: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  findingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 6,
  },
  findingKey: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  findingValue: {
    ...textStyles.bodySmall,
    fontWeight: '700',
    color: colors.text,
  },
});

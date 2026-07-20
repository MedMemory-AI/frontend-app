import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  FileText,
  Pill,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { api } from '../../api';
import { EmptyState, ErrorState, GlobalHeader, LoadingSpinner, ScreenContainer } from '../../components';
import type { AppStackNavigationProp } from '../../navigation/createStackNavigator';
import type { RootStackParamList, TimelineEntry } from '../../navigation/types';
import { useAuthStore } from '../../stores';
import { colors, radius, spacing, textStyles, typography } from '../../theme';

type TimelineItem = TimelineEntry;

type TimelineGroup = {
  key: string;
  label: string;
  items: TimelineItem[];
};

function normalizeTimelineItems(payload: unknown): TimelineItem[] {
  if (Array.isArray(payload)) {
    return payload.filter((item): item is TimelineItem => Boolean(item));
  }

  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const candidate = payload as Record<string, unknown>;
  const nested = candidate.items ?? candidate.data ?? candidate.timeline ?? candidate.records;

  if (Array.isArray(nested)) {
    return nested.filter((item): item is TimelineItem => Boolean(item));
  }

  return [];
}

function getDateLabel(value?: string): string {
  if (!value) {
    return 'Unscheduled';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Unscheduled';
  }

  return parsed.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getTimeLabel(value?: string): string {
  if (!value) {
    return '';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return parsed.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

const MOCK_TIMELINE_ENTRIES: TimelineItem[] = [
  {
    id: 'demo-timeline-1',
    docType: 'report',
    createdAt: '2026-06-15T10:00:00.000Z',
    date: '2026-06-15T10:00:00.000Z',
    doctor: 'Dr. Sarah Jenkins (Cardiologist)',
    diseases: ['Hyperlipidemia', 'Vitamin D Deficiency'],
    preDiagnosis: 'Routine screening for cardiovascular health and lipid profile analysis.',
    treatment: '1. Atorvastatin 20mg daily at bedtime.\n2. Cholecalciferol (Vitamin D3) 50,000 IU weekly for 8 weeks.\n3. Low-sodium, Mediterranean diet and 150 minutes of moderate aerobic exercise weekly.',
    findings: JSON.stringify({
      total_cholesterol: '245 mg/dL (High)',
      ldl_cholesterol: '162 mg/dL (High)',
      hdl_cholesterol: '42 mg/dL (Borderline)',
      triglycerides: '205 mg/dL (High)',
      vitamin_d_total: '18 ng/mL (Deficient)',
    }),
    highlights: 'Patient exhibits elevated total cholesterol, LDL-C, and triglycerides, suggesting hyperlipidemia. Total Vitamin D levels are deficient. Prescribed statin therapy and high-dose Vitamin D supplementation with dietary counseling.',
  },
  {
    id: 'demo-timeline-2',
    docType: 'prescription',
    createdAt: '2026-05-10T14:30:00.000Z',
    date: '2026-05-10T14:30:00.000Z',
    doctor: 'Dr. Robert Chen (Pulmonologist)',
    diseases: ['Acute Bronchitis', 'Allergic Rhinitis'],
    preDiagnosis: 'Presenting with persistent dry cough, chest congestion, wheezing, and nasal drip for 7 days.',
    treatment: '1. Amoxicillin-Clavulanate (Augmentin) 875/125mg orally twice daily for 7 days.\n2. Albuterol HFA Inhaler - 2 puffs every 4-6 hours as needed for wheezing.\n3. Fluticasone Propionate (Flonase) Nasal Spray - 2 sprays in each nostril daily.',
    findings: JSON.stringify({
      blood_pressure: '120/80 mmHg',
      heart_rate: '78 bpm',
      respiratory_rate: '18 breaths/min',
      oxygen_saturation: '98% on room air',
      lung_sounds: 'Bilateral expiratory wheezing in lower lobes',
    }),
    highlights: 'Acute bronchitis diagnosed based on clinical symptoms and chest auscultation. Lung fields clear of consolidations. Initiated oral antibiotics, bronchodilator inhaler, and intranasal steroid spray.',
  },
  {
    id: 'demo-timeline-3',
    docType: 'report',
    createdAt: '2026-03-05T08:15:00.000Z',
    date: '2026-03-05T08:15:00.000Z',
    doctor: 'Dr. Emily Ross (Endocrinologist)',
    diseases: ['Prediabetes'],
    preDiagnosis: 'Annual metabolic screen for patient with family history of Type 2 Diabetes.',
    treatment: '1. Metformin 500mg orally daily with breakfast (low-dose prophylaxis).\n2. Regular home glucose tracking (fasting levels).\n3. Carbohydrate-controlled diet and weight management consultation.',
    findings: JSON.stringify({
      hba1c: '5.9% (Prediabetes range: 5.7%-6.4%)',
      fasting_glucose: '108 mg/dL (Elevated)',
      creatinine: '0.9 mg/dL (Normal)',
      egfr: '>90 mL/min/1.73m2 (Normal)',
    }),
    highlights: 'Patient meets criteria for prediabetes with HbA1c of 5.9% and impaired fasting glucose of 108 mg/dL. Renal function remains normal. Initiated lifestyle intervention and low-dose Metformin.',
  },
];

async function fetchTimeline(): Promise<TimelineItem[]> {
  if (useAuthStore.getState().isGuest) {
    return MOCK_TIMELINE_ENTRIES;
  }

  const candidates = ['/timeline', '/records', '/ingestion/timeline'];
  let lastError: unknown;

  for (const endpoint of candidates) {
    try {
      const payload = await api.get<unknown>(endpoint);
      const normalized = normalizeTimelineItems(payload);
      if (Array.isArray(normalized)) {
        return normalized.sort((left, right) => {
          const leftTime = new Date(left.createdAt ?? left.date ?? 0).getTime();
          const rightTime = new Date(right.createdAt ?? right.date ?? 0).getTime();
          return rightTime - leftTime; // Newest first
        });
      }
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Unable to load the timeline.');
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

export function TimelineScreen() {
  const navigation = useNavigation<AppStackNavigationProp<RootStackParamList>>();
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['timeline'],
    queryFn: fetchTimeline,
    staleTime: 30_000,
  });

  const groupedTimeline = useMemo<TimelineGroup[]>(() => {
    const items = data ?? [];
    const groups = new Map<string, TimelineItem[]>();

    items.forEach((item) => {
      const dateKey = getDateLabel(item.createdAt ?? item.date);
      const entries = groups.get(dateKey) ?? [];
      entries.push(item);
      groups.set(dateKey, entries);
    });

    return Array.from(groups.entries()).map(([key, itemsForDay]) => ({
      key,
      label: key,
      items: itemsForDay,
    }));
  }, [data]);

  const toggleCard = (id: string) => {
    setExpandedCards((current) => ({
      ...current,
      [id]: !current[id],
    }));
  };

  const getRecordIcon = (docType?: string) => {
    const type = docType?.toLowerCase() || '';
    if (type.includes('prescription')) {
      return <Stethoscope color={colors.primary} size={16} />;
    }
    if (type.includes('report') || type.includes('lab')) {
      return <ClipboardList color={colors.secondary} size={16} />;
    }
    return <FileText color={colors.info} size={16} />;
  };

  const getIconBgColor = (docType?: string) => {
    const type = docType?.toLowerCase() || '';
    if (type.includes('prescription')) {
      return colors.primaryMuted;
    }
    if (type.includes('report') || type.includes('lab')) {
      return '#E6FFFA';
    }
    return '#E0F2FE';
  };

  const renderFindingsTable = (findings: any) => {
    if (!findings) return null;

    let parsedFindings: Record<string, any> = {};
    if (typeof findings === 'string') {
      try {
        parsedFindings = JSON.parse(findings);
      } catch {
        return <Text style={styles.expandedText}>{findings}</Text>;
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

  const renderState = () => {
    if (isLoading) {
      return <LoadingSpinner message="Preparing your timeline..." />;
    }

    if (isError) {
      return (
        <ErrorState
          title="We couldn’t load the timeline"
          message="Please check your connection and try again."
          onRetry={() => void refetch()}
        />
      );
    }

    if (!groupedTimeline.length) {
      return (
        <EmptyState
          title="No records yet"
          description="Upload a document and refresh this page after 1–2 minutes once processing completes."
          icon={<CalendarDays color={colors.secondary} size={28} />}
        />
      );
    }

    return null;
  };

  return (
    <ScreenContainer safeAreaTop={false} padded={false}>
      <GlobalHeader />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={() => void refetch()} tintColor={colors.primary} />}
      >
        <View style={styles.header}>
          <View style={styles.headerBadge}>
            <ShieldCheck color={colors.primary} size={18} />
            <Text style={styles.headerBadgeText}>Secure medical timeline</Text>
          </View>
          <Text style={styles.title}>Health timeline</Text>
          <Text style={styles.subtitle}>
            Review your lifelong medical history in a clean, chronological view.
          </Text>
        </View>

        {renderState() ?? null}

        {!isLoading && !isError && groupedTimeline.length > 0 ? (
          <View style={styles.timelineList}>
            {/* Continuous Vertical Timeline Line */}
            <View style={styles.verticalTimelineLine} />

            {groupedTimeline.map((group) => (
              <View key={group.key} style={styles.groupContainer}>
                {/* Date Divider */}
                <View style={styles.dateHeaderRow}>
                  <Text style={styles.dateHeaderText}>{group.label}</Text>
                  <View style={styles.itemCountBadge}>
                    <Text style={styles.itemCountText}>
                      {group.items.length} {group.items.length === 1 ? 'record' : 'records'}
                    </Text>
                  </View>
                </View>

                {group.items.map((item, itemIdx) => {
                  const itemId = item.id ?? `${group.key}-${itemIdx}`;
                  const isExpanded = expandedCards[itemId] ?? false;
                  const timeLabel = getTimeLabel(item.createdAt ?? item.date);

                  // Extract diseases array
                  let diseasesList: string[] = [];
                  if (Array.isArray(item.diseases)) {
                    diseasesList = item.diseases;
                  } else if (typeof item.diseases === 'string') {
                    diseasesList = item.diseases.split(',').map((d) => d.trim()).filter(Boolean);
                  }

                  return (
                    <View key={itemId} style={styles.timelineItemRow}>
                      {/* Left Circular Medical Icon sitting on the timeline line */}
                      <View style={[styles.timelineDotWrap, { backgroundColor: getIconBgColor(item.docType as string) }]}>
                        {getRecordIcon(item.docType as string)}
                      </View>

                      {/* Right Timeline Card */}
                      <View style={styles.cardWrapper}>
                        <Pressable
                          style={[
                            styles.timelineCard,
                            isExpanded && styles.timelineCardExpanded,
                          ]}
                          onPress={() => toggleCard(itemId)}
                        >
                          {/* Card Header (Collapsed view always visible) */}
                          <View style={styles.cardHeader}>
                            <View style={styles.headerInfo}>
                              <Text style={styles.docTypeTag}>
                                {typeof item.docType === 'string' ? item.docType.toUpperCase() : 'MEDICAL RECORD'}
                              </Text>
                              <Text style={styles.recordDate}>
                                {timeLabel || 'Recorded'}
                              </Text>
                              {isValidValue(item.doctor) && (
                                <Text style={styles.doctorText}>
                                  Doctor: {item.doctor as string}
                                </Text>
                              )}
                            </View>
                            <View style={styles.chevronWrap}>
                              {isExpanded ? (
                                <ChevronUp color={colors.textSecondary} size={20} />
                              ) : (
                                <ChevronDown color={colors.textSecondary} size={20} />
                              )}
                            </View>
                          </View>

                          {/* Collapsed view disease chips */}
                          {!isExpanded && diseasesList.length > 0 && (
                            <View style={styles.chipsRow}>
                              {diseasesList.slice(0, 3).map((disease, idx) => (
                                <View key={idx} style={styles.diseaseChip}>
                                  <Text style={styles.diseaseChipText} numberOfLines={1}>{disease}</Text>
                                </View>
                              ))}
                              {diseasesList.length > 3 && (
                                <Text style={styles.extraChipsText}>+{diseasesList.length - 3} more</Text>
                              )}
                            </View>
                          )}

                          {/* Collapsed view highlight line */}
                          {!isExpanded && isValidValue(item.highlights) && (
                            <Text style={styles.oneLineHighlight} numberOfLines={1}>
                              {item.highlights as string}
                            </Text>
                          )}

                          {/* Expanded Detailed Sections */}
                          {isExpanded && (
                            <View style={styles.expandedDetails}>
                              <View style={styles.divider} />

                              {/* Doctor info */}
                              {isValidValue(item.doctor) && (
                                <View style={styles.expandedSection}>
                                  <View style={styles.sectionHeaderRow}>
                                    <Stethoscope color={colors.primary} size={16} />
                                    <Text style={styles.expandedSectionTitle}>Doctor</Text>
                                  </View>
                                  <Text style={styles.expandedText}>{item.doctor as string}</Text>
                                </View>
                              )}

                              {/* Pre Diagnosis */}
                              {isValidValue(item.preDiagnosis) && (
                                <View style={styles.expandedSection}>
                                  <View style={styles.sectionHeaderRow}>
                                    <AlertCircle color={colors.secondary} size={16} />
                                    <Text style={styles.expandedSectionTitle}>Pre Diagnosis</Text>
                                  </View>
                                  <Text style={styles.expandedText}>{item.preDiagnosis as string}</Text>
                                </View>
                              )}

                              {/* Treatment */}
                              {isValidValue(item.treatment) && (
                                <View style={styles.expandedSection}>
                                  <View style={styles.sectionHeaderRow}>
                                    <Pill color={colors.info} size={16} />
                                    <Text style={styles.expandedSectionTitle}>Treatment Plan</Text>
                                  </View>
                                  <Text style={styles.expandedText}>{item.treatment as string}</Text>
                                </View>
                              )}

                              {/* Findings */}
                              {isValidValue(item.findings) && (
                                <View style={styles.expandedSection}>
                                  <View style={styles.sectionHeaderRow}>
                                    <FileText color={colors.success} size={16} />
                                    <Text style={styles.expandedSectionTitle}>Clinical Findings</Text>
                                  </View>
                                  {renderFindingsTable(item.findings)}
                                </View>
                              )}

                              {/* Highlights */}
                              {isValidValue(item.highlights) && (
                                <View style={styles.expandedSection}>
                                  <View style={styles.sectionHeaderRow}>
                                    <Sparkles color="#F59E0B" size={16} />
                                    <Text style={styles.expandedSectionTitle}>Summary Highlights</Text>
                                  </View>
                                  <Text style={styles.expandedText}>{item.highlights as string}</Text>
                                </View>
                              )}

                              {/* Diseases */}
                              {diseasesList.length > 0 && (
                                <View style={styles.expandedSection}>
                                  <View style={styles.sectionHeaderRow}>
                                    <Activity color="#D946EF" size={16} />
                                    <Text style={styles.expandedSectionTitle}>Conditions</Text>
                                  </View>
                                  <View style={styles.expandedChipsRow}>
                                    {diseasesList.map((disease, idx) => (
                                      <View key={idx} style={styles.diseaseChipExpanded}>
                                        <Text style={styles.diseaseChipTextExpanded}>{disease}</Text>
                                      </View>
                                    ))}
                                  </View>
                                </View>
                              )}

                              {/* View details action */}
                              <Pressable
                                onPress={() => navigation.navigate('TimelineDetails', { entry: item })}
                                style={({ pressed }) => [
                                  styles.viewDetailsBtn,
                                  pressed && styles.pressed,
                                ]}
                              >
                                <Text style={styles.viewDetailsBtnText}>View Full Report</Text>
                                <ArrowRight size={14} color={colors.primary} />
                              </Pressable>
                            </View>
                          )}
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
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
    gap: spacing.sm,
  },
  headerBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryMuted,
    borderRadius: radius.full,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  headerBadgeText: {
    ...textStyles.overline,
    color: colors.primary,
  },
  title: {
    ...textStyles.h2,
    color: colors.text,
    fontWeight: '700',
  },
  subtitle: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  timelineList: {
    position: 'relative',
    paddingLeft: 42,
    gap: spacing.lg,
  },
  verticalTimelineLine: {
    position: 'absolute',
    left: 17,
    top: 12,
    bottom: 24,
    width: 2,
    backgroundColor: colors.border,
  },
  groupContainer: {
    gap: spacing.md,
  },
  dateHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xxs,
  },
  dateHeaderText: {
    ...textStyles.label,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  itemCountBadge: {
    backgroundColor: colors.background,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemCountText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
  },
  timelineItemRow: {
    flexDirection: 'row',
    position: 'relative',
    marginBottom: spacing.xs,
  },
  timelineDotWrap: {
    position: 'absolute',
    left: -39,
    top: 6,
    width: 28,
    height: 28,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  cardWrapper: {
    flex: 1,
  },
  timelineCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 16,
    gap: spacing.xs,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  timelineCardExpanded: {
    borderColor: colors.primaryLight,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  docTypeTag: {
    ...textStyles.overline,
    color: colors.primary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  recordDate: {
    ...textStyles.caption,
    fontSize: 12,
    color: colors.textSecondary,
  },
  doctorText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  chevronWrap: {
    padding: spacing.xxs,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  diseaseChip: {
    backgroundColor: '#EFF6FF',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    maxWidth: 110,
  },
  diseaseChipText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  extraChipsText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textTertiary,
    alignSelf: 'center',
    fontWeight: '500',
  },
  oneLineHighlight: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  expandedDetails: {
    marginTop: spacing.xs,
    gap: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xxs,
  },
  expandedSection: {
    gap: spacing.xxs,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  expandedSectionTitle: {
    ...textStyles.label,
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  expandedText: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    lineHeight: 18,
    paddingLeft: 24,
  },
  expandedChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingLeft: 24,
    marginTop: 2,
  },
  diseaseChipExpanded: {
    backgroundColor: '#FAF5FF',
    borderColor: '#F3E8FF',
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  diseaseChipTextExpanded: {
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
    marginLeft: 24,
    marginTop: 4,
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
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryMuted,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  viewDetailsBtnText: {
    ...textStyles.label,
    fontSize: 13,
    color: colors.primary,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.85,
  },
});

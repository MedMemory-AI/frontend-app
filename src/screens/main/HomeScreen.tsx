import { useNavigation } from '@react-navigation/native';
import {
  Activity,
  ArrowRight,
  Bot,
  Brain,
  Check,
  ChevronRight,
  Clock,
  Cpu,
  FileText,
  ExternalLink,
  Heart,
  Layers,
  Shield,
  ShieldCheck,
  Sparkles,
  Upload,
} from 'lucide-react-native';
import React, { ReactNode, useMemo } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, GlobalHeader, ScreenContainer } from '../../components';
import { APP_NAME } from '../../constants';
import type { AppTabNavigationProp } from '../../navigation/createTabNavigator';
import type { MainTabParamList } from '../../navigation/types';
import { useAuthStore } from '../../stores';
import { colors, radius, spacing, textStyles, typography } from '../../theme';

type HomeNavigationProp = AppTabNavigationProp<MainTabParamList, 'Home'>;

type ShortcutRoute = Extract<keyof MainTabParamList, 'Upload' | 'Timeline' | 'AIChat'>;

type ShortcutItem = {
  route: ShortcutRoute;
  title: string;
  description: string;
  icon: ReactNode;
  accent: string;
  accentMuted: string;
};

type FeatureItem = {
  title: string;
  description: string;
  icon: ReactNode;
};

const GITHUB_REPO_URL = 'https://github.com/MedMemory-AI/frontend-app';

const GUIDE_STEPS = [
  'Upload lab reports, prescriptions, and medical documents securely.',
  'Browse your health timeline to review records chronologically.',
  'Ask the AI assistant questions about your medical history.',
  'Manage your account and preferences from your profile.',
] as const;

export function HomeScreen() {
  const navigation = useNavigation<HomeNavigationProp>();
  const user = useAuthStore((state) => state.user);
  const firstName = useMemo(() => user?.fullName.split(' ')[0] ?? 'there', [user?.fullName]);

  const SHORTCUTS: ShortcutItem[] = useMemo(
    () => [
      {
        route: 'Upload',
        title: 'Upload Records',
        description: 'Add new medical documents and reports',
        icon: <Upload color={colors.primary} size={22} strokeWidth={2.25} />,
        accent: colors.primary,
        accentMuted: colors.primaryMuted,
      },
      {
        route: 'Timeline',
        title: 'Health Timeline',
        description: 'View your records in chronological order',
        icon: <Clock color={colors.secondary} size={22} strokeWidth={2.25} />,
        accent: colors.secondary,
        accentMuted: colors.secondaryLight,
      },
      {
        route: 'AIChat',
        title: 'AI Assistant',
        description: 'Get answers from your medical memory',
        icon: <Bot color={colors.info} size={22} strokeWidth={2.25} />,
        accent: colors.info,
        accentMuted: colors.infoLight,
      },
    ],
    []
  );

  const FEATURES: FeatureItem[] = useMemo(
    () => [
      {
        title: 'Secure by Design',
        description: 'Your health data is encrypted and stored with care.',
        icon: <Shield color={colors.secondary} size={20} strokeWidth={2} />,
      },
      {
        title: 'Intelligent Memory',
        description: 'AI organizes records so you can find what matters fast.',
        icon: <Sparkles color={colors.primary} size={20} strokeWidth={2} />,
      },
    ],
    []
  );

  const handleOpenGithub = async () => {
    try {
      const supported = await Linking.canOpenURL(GITHUB_REPO_URL);
      if (supported) {
        await Linking.openURL(GITHUB_REPO_URL);
      }
    } catch (err) {
      console.error('Failed to open GitHub URL:', err);
    }
  };

  return (
    <ScreenContainer safeAreaTop={false} padded={false}>
      <GlobalHeader />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Premium Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroLeft}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>Personal Medical AI</Text>
            </View>
            <Text style={styles.greeting}>Welcome back, {firstName}</Text>
            <Text style={styles.heroTitle}>Your Personal Medical AI</Text>
            <Text style={styles.heroSubtitle}>
              Securely organize medical records, track your health journey and ask AI-powered questions.
            </Text>
          </View>
          <View style={styles.heroRight}>
            <View style={styles.heroArtGlow}>
              <Brain color={colors.primary} size={36} strokeWidth={1.5} />
              <Activity color={colors.secondary} size={20} style={styles.activityOverlap} />
            </View>
          </View>
        </View>

        {/* Health Workspace Dashboard Card */}
        <Card padding="none" style={styles.workspaceCard}>
          <Text style={styles.sectionLabel}>Dashboard</Text>
          <Text style={styles.workspaceTitle}>Your Health Workspace</Text>
          <Text style={styles.workspaceBody}>
            MedMemory AI consolidates clinical records into a single secure place. Use the tabs below to manage files, view chronological insights, or ask your assistant for detailed logs.
          </Text>
          <View style={styles.chipsContainer}>
            <View style={styles.chip}>
              <Check size={14} color={colors.success} style={styles.chipCheck} />
              <Text style={styles.chipText}>Secure Storage</Text>
            </View>
            <View style={styles.chip}>
              <Check size={14} color={colors.success} style={styles.chipCheck} />
              <Text style={styles.chipText}>AI Powered</Text>
            </View>
            <View style={styles.chip}>
              <Check size={14} color={colors.success} style={styles.chipCheck} />
              <Text style={styles.chipText}>Timeline Ready</Text>
            </View>
          </View>
        </Card>

        {/* Quick Actions (Main Focus) */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Quick Actions</Text>
          <Text style={styles.sectionTitle}>Jump to a feature</Text>
          <View style={styles.shortcutList}>
            {SHORTCUTS.map((item) => (
              <Pressable
                key={item.route}
                onPress={() => navigation.navigate(item.route)}
                style={({ pressed }) => [
                  styles.shortcutItemCard,
                  pressed && styles.pressed,
                ]}
              >
                <View style={[styles.shortcutAccent, { backgroundColor: item.accent }]} />
                <View style={[styles.shortcutIconWrap, { backgroundColor: item.accentMuted }]}>
                  {item.icon}
                </View>
                <View style={styles.shortcutTextContainer}>
                  <Text style={styles.shortcutTitle}>{item.title}</Text>
                  <Text style={styles.shortcutDescription}>{item.description}</Text>
                </View>
                <ChevronRight color={colors.textTertiary} size={20} />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Getting Started Guide */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Getting Started</Text>
          <Text style={styles.sectionTitle}>How to use the app</Text>
          <Card bordered elevated={false} padding="none" style={styles.guideCard}>
            <View style={styles.guideTimeline}>
              <View style={styles.timelineLine} />
              {GUIDE_STEPS.map((step, index) => (
                <View key={index} style={styles.guideStepRow}>
                  <View style={styles.timelineCircle}>
                    <Text style={styles.timelineNumber}>{index + 1}</Text>
                  </View>
                  <View style={styles.guideStepTextContainer}>
                    <Text style={styles.guideStepText}>{step}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>
        </View>

        {/* Highlights */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Highlights</Text>
          <Text style={styles.sectionTitle}>Built for your health journey</Text>
          <View style={styles.featureGrid}>
            {FEATURES.map((item) => (
              <Card key={item.title} bordered elevated={false} padding="none" style={styles.featureCard}>
                <View style={styles.featureIconWrap}>{item.icon}</View>
                <Text style={styles.featureTitle}>{item.title}</Text>
                <Text style={styles.featureDescription}>{item.description}</Text>
              </Card>
            ))}
          </View>
        </View>

        {/* New "Why MedMemory?" Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Benefits</Text>
          <Text style={styles.sectionTitle}>Why MedMemory AI?</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.whyScrollContainer}
          >
            <View style={styles.whyCard}>
              <ShieldCheck color={colors.primary} size={22} />
              <Text style={styles.whyCardTitle}>Privacy First</Text>
              <Text style={styles.whyCardDesc}>Your health logs are locally encrypted and secure.</Text>
            </View>
            <View style={styles.whyCard}>
              <Cpu color={colors.secondary} size={22} />
              <Text style={styles.whyCardTitle}>AI Assisted</Text>
              <Text style={styles.whyCardDesc}>Synthesize doctor findings with clinical intelligence.</Text>
            </View>
            <View style={styles.whyCard}>
              <Layers color={colors.info} size={22} />
              <Text style={styles.whyCardTitle}>Organized Records</Text>
              <Text style={styles.whyCardDesc}>Index and search records chronologically.</Text>
            </View>
          </ScrollView>
        </View>

        {/* Open Source Footer */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerHeart}>Open Source ❤️</Text>
          <Pressable onPress={handleOpenGithub} style={styles.githubLinkWrap}>
            <ExternalLink size={16} color={colors.textLink} />
            <Text style={styles.githubLinkText}>GitHub Repository</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    gap: spacing.xl,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  heroCard: {
    backgroundColor: '#EFF6FF',
    borderColor: '#DBEAFE',
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  heroLeft: {
    flex: 1,
    gap: spacing.xs,
  },
  heroRight: {
    marginLeft: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.secondaryLight,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.xxs,
  },
  heroBadgeText: {
    ...textStyles.overline,
    color: colors.secondaryDark,
  },
  greeting: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  heroTitle: {
    ...textStyles.h2,
    fontSize: 24,
    lineHeight: 30,
    color: colors.text,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: spacing.xxs,
  },
  heroArtGlow: {
    width: 68,
    height: 68,
    borderRadius: radius.full,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    position: 'relative',
  },
  activityOverlap: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    padding: 2,
  },
  workspaceCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  workspaceTitle: {
    ...textStyles.h3,
    fontSize: 18,
    lineHeight: 24,
    color: colors.text,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginTop: spacing.xxs,
    marginBottom: spacing.xs,
  },
  workspaceBody: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chipCheck: {
    marginRight: 4,
  },
  chipText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.success,
    fontWeight: '600',
  },
  section: {
    gap: spacing.sm,
  },
  sectionLabel: {
    ...textStyles.overline,
    color: colors.secondary,
  },
  sectionTitle: {
    ...textStyles.h3,
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.1,
    marginBottom: spacing.xxs,
  },
  shortcutList: {
    gap: spacing.md,
  },
  shortcutItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  shortcutAccent: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 4,
  },
  shortcutIconWrap: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  shortcutTextContainer: {
    flex: 1,
    gap: spacing.xxs,
  },
  shortcutTitle: {
    ...textStyles.label,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  shortcutDescription: {
    ...textStyles.caption,
    fontSize: 12,
    color: colors.textSecondary,
  },
  pressed: {
    opacity: 0.8,
  },
  guideCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    padding: 24,
  },
  guideTimeline: {
    position: 'relative',
    gap: spacing.lg,
  },
  timelineLine: {
    position: 'absolute',
    top: 14,
    bottom: 14,
    left: 14,
    width: 1.5,
    backgroundColor: colors.border,
  },
  guideStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineCircle: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    marginRight: spacing.md,
  },
  timelineNumber: {
    ...typography.caption,
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
  },
  guideStepTextContainer: {
    flex: 1,
  },
  guideStepText: {
    ...textStyles.bodySmall,
    color: colors.text,
    lineHeight: 18,
  },
  featureGrid: {
    gap: spacing.md,
  },
  featureCard: {
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    padding: 20,
  },
  featureIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxs,
  },
  featureTitle: {
    ...textStyles.label,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  featureDescription: {
    ...textStyles.caption,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  whyScrollContainer: {
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
  whyCard: {
    width: 150,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  whyCardTitle: {
    ...textStyles.label,
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  whyCardDesc: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 14,
  },
  footerContainer: {
    marginTop: spacing.xl,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
    gap: spacing.xs,
  },
  footerHeart: {
    ...textStyles.caption,
    fontSize: 12,
    color: colors.textSecondary,
  },
  githubLinkWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  githubLinkText: {
    ...textStyles.caption,
    fontSize: 12,
    color: colors.textLink,
    fontWeight: '600',
  },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { colors, radius, spacing, typography } from '../theme';

interface MarkdownProps {
  content: string;
}

export function Markdown({ content }: MarkdownProps) {
  const blocks = content.split('\n');
  const renderedElements: React.ReactNode[] = [];

  let inCodeBlock = false;
  let codeBlockLines: string[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const line = blocks[i];

    // Toggle code block
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        const codeText = codeBlockLines.join('\n');
        renderedElements.push(
          <View key={`code-${i}`} style={styles.codeBlock}>
            <Text style={styles.codeText}>{codeText}</Text>
          </View>
        );
        codeBlockLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // Headers
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const text = headerMatch[2];
      const headerStyle = level === 1 ? styles.h1 : level === 2 ? styles.h2 : styles.h3;
      renderedElements.push(
        <Text key={`header-${i}`} style={[headerStyle, styles.blockSpacing]}>
          {renderInlineMarkdown(text)}
        </Text>
      );
      continue;
    }

    // Bullet list item
    const bulletMatch = line.match(/^[\*\-]\s+(.+)$/);
    if (bulletMatch) {
      const text = bulletMatch[1];
      renderedElements.push(
        <View key={`bullet-${i}`} style={[styles.listItemRow, styles.blockSpacing]}>
          <Text style={styles.bulletPoint}>•</Text>
          <Text style={styles.listItemText}>{renderInlineMarkdown(text)}</Text>
        </View>
      );
      continue;
    }

    // Numbered list item
    const numberMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (numberMatch) {
      const num = numberMatch[1];
      const text = numberMatch[2];
      renderedElements.push(
        <View key={`number-${i}`} style={[styles.listItemRow, styles.blockSpacing]}>
          <Text style={styles.numberPoint}>{num}.</Text>
          <Text style={styles.listItemText}>{renderInlineMarkdown(text)}</Text>
        </View>
      );
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      renderedElements.push(<View key={`empty-${i}`} style={styles.emptyLine} />);
      continue;
    }

    // Paragraph text
    renderedElements.push(
      <Text key={`paragraph-${i}`} style={[styles.paragraph, styles.blockSpacing]}>
        {renderInlineMarkdown(line)}
      </Text>
    );
  }

  // Handle unterminated code blocks
  if (inCodeBlock && codeBlockLines.length > 0) {
    renderedElements.push(
      <View key="code-ended" style={styles.codeBlock}>
        <Text style={styles.codeText}>{codeBlockLines.join('\n')}</Text>
      </View>
    );
  }

  return <View style={styles.container}>{renderedElements}</View>;
}

function renderInlineMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Match bold (**text**), italic (*text*), and inline code (`code`)
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  const segments = text.split(regex);

  segments.forEach((segment, idx) => {
    if (segment.startsWith('**') && segment.endsWith('**')) {
      parts.push(
        <Text key={idx} style={styles.boldText}>
          {segment.slice(2, -2)}
        </Text>
      );
    } else if (segment.startsWith('*') && segment.endsWith('*')) {
      parts.push(
        <Text key={idx} style={styles.italicText}>
          {segment.slice(1, -1)}
        </Text>
      );
    } else if (segment.startsWith('`') && segment.endsWith('`')) {
      parts.push(
        <Text key={idx} style={styles.inlineCode}>
          {segment.slice(1, -1)}
        </Text>
      );
    } else {
      parts.push(segment);
    }
  });

  return parts;
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  blockSpacing: {
    marginBottom: spacing.xs,
  },
  h1: {
    ...typography.h1,
    color: colors.text,
    marginTop: spacing.sm,
    fontSize: 22,
    lineHeight: 28,
  },
  h2: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.sm,
    fontSize: 18,
    lineHeight: 24,
  },
  h3: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.xs,
    fontSize: 16,
    lineHeight: 22,
  },
  paragraph: {
    ...typography.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  boldText: {
    fontWeight: '700',
  },
  italicText: {
    fontStyle: 'italic',
  },
  inlineCode: {
    fontFamily: 'System',
    backgroundColor: 'rgba(9, 30, 66, 0.08)',
    color: colors.error,
    paddingHorizontal: spacing.xxs,
    borderRadius: radius.xs,
    fontSize: 13,
    fontWeight: '500',
  },
  codeBlock: {
    backgroundColor: '#0F172A',
    padding: spacing.md,
    borderRadius: radius.md,
    marginVertical: spacing.xs,
  },
  codeText: {
    fontFamily: 'System',
    fontSize: 13,
    lineHeight: 18,
    color: '#F8FAFC',
  },
  listItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: spacing.sm,
  },
  bulletPoint: {
    marginRight: spacing.xs,
    fontSize: 16,
    color: colors.primary,
    lineHeight: 22,
  },
  numberPoint: {
    marginRight: spacing.xs,
    fontSize: 14,
    color: colors.primary,
    fontWeight: 'bold',
    lineHeight: 22,
  },
  listItemText: {
    ...typography.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
    flex: 1,
  },
  emptyLine: {
    height: spacing.sm,
  },
});

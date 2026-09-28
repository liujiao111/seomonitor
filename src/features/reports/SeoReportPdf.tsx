import type { SeoReportResult } from '@/types/SeoReport';
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11 },
  title: { fontSize: 20, marginBottom: 4 },
  subtitle: { fontSize: 11, color: '#666', marginBottom: 16 },
  category: { marginBottom: 12 },
  categoryTitle: { fontSize: 14, marginBottom: 4 },
  issue: { marginBottom: 6, paddingLeft: 8 },
  issueTitle: { fontSize: 11, fontWeight: 700 },
  issueText: { fontSize: 10, color: '#333' },
});

export const SeoReportPdf = (props: { report: SeoReportResult }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>
        SEO Report —
        {' '}
        {props.report.domain}
      </Text>
      <Text style={styles.subtitle}>
        Overall score:
        {' '}
        {props.report.score}
        {' '}
        / 100 · Scanned at
        {' '}
        {props.report.scannedAt}
      </Text>

      {props.report.categories.map(category => (
        <View key={category.name} style={styles.category}>
          <Text style={styles.categoryTitle}>
            {category.name}
            {' '}
            (
            {category.score}
            /100)
          </Text>

          {category.issues.map(issue => (
            <View key={issue.id} style={styles.issue}>
              <Text style={styles.issueTitle}>
                [
                {issue.severity}
                ]
                {' '}
                {issue.title}
              </Text>
              <Text style={styles.issueText}>{issue.description}</Text>
              <Text style={styles.issueText}>
                Recommendation:
                {' '}
                {issue.recommendation}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </Page>
  </Document>
);

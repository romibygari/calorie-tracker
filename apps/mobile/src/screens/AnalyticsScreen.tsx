import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Text, Card, SegmentedButtons } from 'react-native-paper';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryLine, VictoryTheme } from 'victory-native';
import { useHistoryAnalytics, useUser } from '../api/hooks';
import { useAppStore } from '../store';

const W = Dimensions.get('window').width - 64;

export default function AnalyticsScreen() {
  const userId = useAppStore((s) => s.selectedUserId)!;
  const [range, setRange] = useState('7');
  const { data: history = [] } = useHistoryAnalytics(userId, Number(range));
  const { data: user } = useUser(userId);

  const chartData = history.map((e, i) => ({
    x: i + 1,
    y: Math.round(e.calories),
    label: e.date.slice(5), // MM-DD
  }));

  const avgCalories =
    history.length > 0
      ? Math.round(history.reduce((s, e) => s + e.calories, 0) / history.length)
      : 0;

  const totalProtein = Math.round(history.reduce((s, e) => s + e.protein, 0));
  const totalCarbs = Math.round(history.reduce((s, e) => s + e.carbs, 0));
  const totalFat = Math.round(history.reduce((s, e) => s + e.fat, 0));
  const totalMacros = totalProtein + totalCarbs + totalFat;

  const pieData = totalMacros > 0 ? [
    { label: 'Protein', value: totalProtein, color: '#2196F3' },
    { label: 'Carbs', value: totalCarbs, color: '#FF9800' },
    { label: 'Fat', value: totalFat, color: '#E91E63' },
  ] : [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SegmentedButtons
        value={range}
        onValueChange={setRange}
        buttons={[
          { value: '7', label: '7 days' },
          { value: '14', label: '14 days' },
          { value: '30', label: '30 days' },
        ]}
        style={styles.rangeToggle}
      />

      {/* Average callout */}
      <Card style={styles.card}>
        <Card.Content style={styles.avgRow}>
          <View style={styles.avgBox}>
            <Text variant="headlineMedium" style={styles.avgValue}>{avgCalories}</Text>
            <Text variant="bodySmall" style={styles.avgLabel}>avg kcal/day</Text>
          </View>
          {user && (
            <View style={styles.avgBox}>
              <Text variant="headlineMedium" style={{ color: avgCalories > user.calorieTarget ? '#F44336' : '#4CAF50' }}>
                {user.calorieTarget}
              </Text>
              <Text variant="bodySmall" style={styles.avgLabel}>target kcal</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Calorie bar chart */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="labelLarge" style={styles.chartTitle}>Daily Calories</Text>
          {chartData.length > 0 ? (
            <VictoryChart
              width={W}
              height={200}
              theme={VictoryTheme.material}
              domainPadding={{ x: 10 }}
            >
              <VictoryAxis
                tickFormat={(t) => {
                  const entry = history[t - 1];
                  return entry ? entry.date.slice(5) : '';
                }}
                style={{ tickLabels: { fontSize: 9, angle: -45 } }}
              />
              <VictoryAxis dependentAxis style={{ tickLabels: { fontSize: 9 } }} />
              <VictoryBar
                data={chartData}
                style={{ data: { fill: '#4CAF50' } }}
              />
              {user && (
                <VictoryLine
                  data={[{ x: 0.5, y: user.calorieTarget }, { x: chartData.length + 0.5, y: user.calorieTarget }]}
                  style={{ data: { stroke: '#F44336', strokeDasharray: '4,4', strokeWidth: 1.5 } }}
                />
              )}
            </VictoryChart>
          ) : (
            <Text style={styles.noData}>No data for this period</Text>
          )}
        </Card.Content>
      </Card>

      {/* Macro breakdown */}
      {pieData.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="labelLarge" style={styles.chartTitle}>Macro Breakdown (total)</Text>
            <View style={styles.macroLegend}>
              {pieData.map(({ label, value, color }) => {
                const pct = Math.round((value / totalMacros) * 100);
                return (
                  <View key={label} style={styles.legendItem}>
                    <View style={[styles.dot, { backgroundColor: color }]} />
                    <Text variant="bodySmall">
                      {label}: {value}g ({pct}%)
                    </Text>
                  </View>
                );
              })}
            </View>
            <View style={styles.macroBar}>
              {pieData.map(({ label, value, color }) => (
                <View
                  key={label}
                  style={[
                    styles.macroSegment,
                    { flex: value, backgroundColor: color },
                  ]}
                />
              ))}
            </View>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { padding: 16, gap: 12 },
  rangeToggle: { marginBottom: 4 },
  card: { borderRadius: 12 },
  avgRow: { flexDirection: 'row', justifyContent: 'space-around' },
  avgBox: { alignItems: 'center' },
  avgValue: { fontWeight: 'bold', color: '#4CAF50' },
  avgLabel: { color: '#999' },
  chartTitle: { color: '#555', marginBottom: 8 },
  noData: { textAlign: 'center', color: '#999', paddingVertical: 24 },
  macroLegend: { gap: 6, marginBottom: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  macroBar: { flexDirection: 'row', height: 20, borderRadius: 10, overflow: 'hidden' },
  macroSegment: { height: '100%' },
});

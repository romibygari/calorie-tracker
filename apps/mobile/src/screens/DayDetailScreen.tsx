import React from 'react';
import { View, SectionList, StyleSheet } from 'react-native';
import { Text, Card, Divider } from 'react-native-paper';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useDayLogs, useDailyAnalytics, useUser } from '../api/hooks';
import { useAppStore } from '../store';
import { formatDateLong } from '../utils/date';
import type { FoodLog, MealType } from '../types';
import type { RootStackParamList } from '../navigation';

type DayDetailRoute = RouteProp<RootStackParamList, 'DayDetail'>;

const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];
const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

export default function DayDetailScreen() {
  const route = useRoute<DayDetailRoute>();
  const { date } = route.params;
  const userId = useAppStore((s) => s.selectedUserId)!;

  const { data: logs = [] } = useDayLogs(userId, date);
  const { data: summary } = useDailyAnalytics(userId, date);
  const { data: user } = useUser(userId);

  const sections = MEAL_ORDER.map((meal) => ({
    title: MEAL_LABELS[meal],
    meal,
    data: logs.filter((l: FoodLog) => l.meal === meal),
  })).filter((s) => s.data.length > 0);

  return (
    <View style={styles.container}>
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.dateText}>{formatDateLong(date)}</Text>
          <View style={styles.totalsRow}>
            {[
              { label: 'Calories', value: Math.round(summary?.calories ?? 0), unit: 'kcal', color: '#4CAF50' },
              { label: 'Protein', value: Math.round(summary?.protein ?? 0), unit: 'g', color: '#2196F3' },
              { label: 'Carbs', value: Math.round(summary?.carbs ?? 0), unit: 'g', color: '#FF9800' },
              { label: 'Fat', value: Math.round(summary?.fat ?? 0), unit: 'g', color: '#E91E63' },
            ].map(({ label, value, unit, color }) => (
              <View key={label} style={styles.totalBox}>
                <Text style={[styles.totalValue, { color }]}>{value}</Text>
                <Text style={styles.totalUnit}>{unit}</Text>
                <Text style={styles.totalLabel}>{label}</Text>
              </View>
            ))}
          </View>
          {user && (
            <Text variant="bodySmall" style={styles.targetNote}>
              Target: {user.calorieTarget} kcal
            </Text>
          )}
        </Card.Content>
      </Card>

      <SectionList
        sections={sections}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderSectionHeader={({ section }) => (
          <Text variant="labelLarge" style={styles.sectionHeader}>{section.title}</Text>
        )}
        renderItem={({ item }: { item: FoodLog }) => (
          <Card style={styles.logCard}>
            <Card.Content style={styles.logRow}>
              <View style={{ flex: 1 }}>
                <Text variant="bodyMedium">{item.foodItem.name}</Text>
                <Text variant="bodySmall" style={styles.qty}>
                  {item.quantity}{item.foodItem.servingUnit}
                </Text>
              </View>
              <View style={styles.logMacros}>
                <Text variant="bodyMedium" style={styles.logCal}>
                  {Math.round(item.caloriesConsumed)} kcal
                </Text>
                <Text variant="bodySmall" style={styles.logMacroDetail}>
                  P:{Math.round(item.proteinConsumed)}g C:{Math.round(item.carbsConsumed)}g F:{Math.round(item.fatConsumed)}g
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No food logged this day.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  summaryCard: { margin: 16, borderRadius: 12 },
  dateText: { fontWeight: 'bold', marginBottom: 12 },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
  totalBox: { alignItems: 'center', gap: 2 },
  totalValue: { fontSize: 20, fontWeight: 'bold' },
  totalUnit: { fontSize: 11, color: '#888' },
  totalLabel: { fontSize: 11, color: '#555' },
  targetNote: { color: '#999', textAlign: 'right' },
  list: { paddingHorizontal: 16 },
  sectionHeader: { color: '#555', marginTop: 12, marginBottom: 6 },
  logCard: { marginBottom: 8, borderRadius: 10 },
  logRow: { flexDirection: 'row', alignItems: 'center' },
  qty: { color: '#888' },
  logMacros: { alignItems: 'flex-end' },
  logCal: { fontWeight: 'bold', color: '#4CAF50' },
  logMacroDetail: { color: '#888' },
  empty: { textAlign: 'center', color: '#999', marginTop: 40 },
});

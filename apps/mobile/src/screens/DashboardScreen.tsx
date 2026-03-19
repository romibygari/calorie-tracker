import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, ProgressBar, FAB, IconButton, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppStore } from '../store';
import { useDailyAnalytics, useDayLogs } from '../api/hooks';
import { today, formatDateLong } from '../utils/date';
import type { FoodLog, MealType } from '../types';
import type { RootStackParamList } from '../navigation';

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

const MEALS: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export default function DashboardScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const userId = useAppStore((s) => s.selectedUserId)!;
  const dateStr = today();

  const { data: summary } = useDailyAnalytics(userId, dateStr);
  const { data: logs = [] } = useDayLogs(userId, dateStr);

  const calPercent = Math.min((summary?.percentages.calories ?? 0) / 100, 1);

  const logsByMeal = (meal: MealType) => logs.filter((l: FoodLog) => l.meal === meal);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="titleMedium" style={styles.dateLabel}>
        {formatDateLong(dateStr)}
      </Text>

      {/* Calorie summary card */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.row}>
            <View>
              <Text variant="headlineLarge" style={styles.calNumber}>
                {Math.round(summary?.calories ?? 0)}
              </Text>
              <Text variant="bodySmall" style={styles.calLabel}>
                kcal consumed
              </Text>
            </View>
            <View style={styles.remaining}>
              <Text variant="titleMedium" style={{ color: '#4CAF50' }}>
                {Math.max(0, (summary?.targets.calories ?? 2000) - Math.round(summary?.calories ?? 0))}
              </Text>
              <Text variant="bodySmall" style={styles.calLabel}>
                remaining
              </Text>
            </View>
          </View>
          <ProgressBar
            progress={calPercent}
            color="#4CAF50"
            style={styles.progressBar}
          />
          <Text variant="bodySmall" style={styles.targetText}>
            Target: {summary?.targets.calories ?? 2000} kcal
          </Text>
        </Card.Content>
      </Card>

      {/* Macro bars */}
      <Card style={styles.card}>
        <Card.Content style={styles.macroGrid}>
          {(['protein', 'carbs', 'fat'] as const).map((macro) => {
            const value = summary?.[macro] ?? 0;
            const target = summary?.targets[macro === 'carbs' ? 'carbs' : macro] ?? 1;
            const pct = Math.min(value / target, 1);
            const colors = { protein: '#2196F3', carbs: '#FF9800', fat: '#E91E63' };
            return (
              <View key={macro} style={styles.macroItem}>
                <Text variant="labelSmall" style={{ color: colors[macro], fontWeight: 'bold' }}>
                  {macro.toUpperCase()}
                </Text>
                <Text variant="titleMedium">{Math.round(value)}g</Text>
                <ProgressBar progress={pct} color={colors[macro]} style={styles.macroBar} />
                <Text variant="bodySmall" style={styles.calLabel}>
                  / {target}g
                </Text>
              </View>
            );
          })}
        </Card.Content>
      </Card>

      {/* Meal sections */}
      {MEALS.map((meal) => {
        const mealLogs = logsByMeal(meal);
        const mealCalories = mealLogs.reduce((s, l) => s + l.caloriesConsumed, 0);
        return (
          <Card key={meal} style={styles.card}>
            <Card.Title
              title={MEAL_LABELS[meal]}
              subtitle={`${Math.round(mealCalories)} kcal`}
              right={(props) => (
                <IconButton
                  {...props}
                  icon="plus"
                  onPress={() => nav.navigate('Search')}
                />
              )}
            />
            {mealLogs.length > 0 && (
              <>
                <Divider />
                <Card.Content style={styles.logList}>
                  {mealLogs.map((log: FoodLog) => (
                    <View key={log.id} style={styles.logRow}>
                      <View style={{ flex: 1 }}>
                        <Text variant="bodyMedium">{log.foodItem.name}</Text>
                        <Text variant="bodySmall" style={styles.calLabel}>
                          {log.quantity}{log.foodItem.servingUnit} · {Math.round(log.caloriesConsumed)} kcal
                        </Text>
                      </View>
                    </View>
                  ))}
                </Card.Content>
              </>
            )}
          </Card>
        );
      })}

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { padding: 16 },
  dateLabel: { marginBottom: 12, color: '#666' },
  card: { marginBottom: 12, borderRadius: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  calNumber: { fontWeight: 'bold' },
  calLabel: { color: '#999' },
  remaining: { alignItems: 'flex-end' },
  progressBar: { height: 10, borderRadius: 5 },
  targetText: { color: '#999', marginTop: 4 },
  macroGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  macroItem: { flex: 1, alignItems: 'center', gap: 4 },
  macroBar: { width: '100%', height: 6, borderRadius: 3 },
  logList: { paddingTop: 8 },
  logRow: { flexDirection: 'row', paddingVertical: 6 },
});

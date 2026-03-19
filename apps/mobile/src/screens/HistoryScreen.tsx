import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, Card, ProgressBar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useHistoryAnalytics, useUser } from '../api/hooks';
import { useAppStore } from '../store';
import { formatDate } from '../utils/date';
import type { HistoryEntry } from '../types';
import type { RootStackParamList } from '../navigation';

export default function HistoryScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const userId = useAppStore((s) => s.selectedUserId)!;

  const { data: history = [], isLoading } = useHistoryAnalytics(userId, 30);
  const { data: user } = useUser(userId);

  // Show most recent first
  const sorted = [...history].reverse().filter((e) => e.calories > 0);

  const renderItem = ({ item }: { item: HistoryEntry }) => {
    const pct = Math.min(item.calories / (user?.calorieTarget ?? 2000), 1);
    return (
      <Card
        style={styles.card}
        onPress={() => nav.navigate('DayDetail', { date: item.date })}
      >
        <Card.Content>
          <View style={styles.row}>
            <Text variant="titleSmall">{formatDate(item.date)}</Text>
            <Text variant="titleSmall" style={styles.cal}>
              {Math.round(item.calories)} kcal
            </Text>
          </View>
          <ProgressBar progress={pct} color="#4CAF50" style={styles.bar} />
          <View style={styles.macros}>
            <Text variant="bodySmall" style={{ color: '#2196F3' }}>P: {Math.round(item.protein)}g</Text>
            <Text variant="bodySmall" style={{ color: '#FF9800' }}>C: {Math.round(item.carbs)}g</Text>
            <Text variant="bodySmall" style={{ color: '#E91E63' }}>F: {Math.round(item.fat)}g</Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.header}>Past 30 Days</Text>
      {sorted.length === 0 && !isLoading && (
        <Text style={styles.empty}>No logs yet. Start tracking today!</Text>
      )}
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.date}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { padding: 16, paddingBottom: 4, color: '#333' },
  list: { padding: 16, paddingTop: 4 },
  card: { marginBottom: 10, borderRadius: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cal: { fontWeight: 'bold', color: '#4CAF50' },
  bar: { height: 6, borderRadius: 3, marginBottom: 8 },
  macros: { flexDirection: 'row', gap: 16 },
  empty: { textAlign: 'center', color: '#999', marginTop: 64 },
});

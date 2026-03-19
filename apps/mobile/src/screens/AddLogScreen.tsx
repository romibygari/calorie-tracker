import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, TextInput, SegmentedButtons } from 'react-native-paper';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { useCreateLog } from '../api/hooks';
import { useAppStore } from '../store';
import { today } from '../utils/date';
import type { FoodItem, MealType } from '../types';
import type { RootStackParamList } from '../navigation';

type AddLogRoute = RouteProp<RootStackParamList, 'AddLog'>;

export default function AddLogScreen() {
  const route = useRoute<AddLogRoute>();
  const nav = useNavigation();
  const userId = useAppStore((s) => s.selectedUserId)!;

  const { foodItemId, defaultMeal } = route.params;
  const [meal, setMeal] = useState<MealType>((defaultMeal as MealType) ?? 'lunch');
  const [quantity, setQuantity] = useState('100');

  const { data: food } = useQuery<FoodItem>({
    queryKey: ['foods', foodItemId],
    queryFn: () => api.get(`/foods/${foodItemId}`).then((r) => r.data),
  });

  const createLog = useCreateLog();

  const qty = parseFloat(quantity) || 0;
  const ratio = food ? qty / food.servingSize : 0;
  const preview = food
    ? {
        calories: +(food.calories * ratio).toFixed(1),
        protein: +(food.protein * ratio).toFixed(1),
        carbs: +(food.carbs * ratio).toFixed(1),
        fat: +(food.fat * ratio).toFixed(1),
      }
    : null;

  const handleSave = async () => {
    if (!food || qty <= 0) return;
    try {
      await createLog.mutateAsync({
        userId,
        foodItemId: food.id,
        logDate: today(),
        meal,
        quantity: qty,
      });
      nav.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to log food. Please try again.');
    }
  };

  if (!food) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.foodCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.foodName}>{food.name}</Text>
          {food.brand && <Text variant="bodySmall" style={styles.brand}>{food.brand}</Text>}
          <Text variant="bodySmall" style={styles.per}>
            Per {food.servingSize}{food.servingUnit}: {food.calories} kcal
          </Text>
        </Card.Content>
      </Card>

      <Text variant="labelLarge" style={styles.label}>Meal</Text>
      <SegmentedButtons
        value={meal}
        onValueChange={(v) => setMeal(v as MealType)}
        buttons={[
          { value: 'breakfast', label: 'Breakfast' },
          { value: 'lunch', label: 'Lunch' },
          { value: 'dinner', label: 'Dinner' },
          { value: 'snack', label: 'Snack' },
        ]}
        style={styles.segmented}
      />

      <Text variant="labelLarge" style={styles.label}>Quantity ({food.servingUnit})</Text>
      <TextInput
        mode="outlined"
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
        style={styles.input}
        right={<TextInput.Affix text={food.servingUnit} />}
      />

      {preview && (
        <Card style={styles.previewCard}>
          <Card.Content>
            <Text variant="labelMedium" style={styles.previewTitle}>Nutritional Preview</Text>
            <View style={styles.macroRow}>
              {[
                { label: 'Calories', value: preview.calories, unit: 'kcal', color: '#4CAF50' },
                { label: 'Protein', value: preview.protein, unit: 'g', color: '#2196F3' },
                { label: 'Carbs', value: preview.carbs, unit: 'g', color: '#FF9800' },
                { label: 'Fat', value: preview.fat, unit: 'g', color: '#E91E63' },
              ].map(({ label, value, unit, color }) => (
                <View key={label} style={styles.macroBox}>
                  <Text style={[styles.macroValue, { color }]}>{value}</Text>
                  <Text style={styles.macroUnit}>{unit}</Text>
                  <Text style={styles.macroLabel}>{label}</Text>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}

      <Button
        mode="contained"
        onPress={handleSave}
        loading={createLog.isPending}
        disabled={createLog.isPending || qty <= 0}
        buttonColor="#4CAF50"
        style={styles.saveBtn}
      >
        Add to Log
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { padding: 16, gap: 12 },
  foodCard: { borderRadius: 12 },
  foodName: { fontWeight: 'bold' },
  brand: { color: '#888' },
  per: { color: '#666', marginTop: 4 },
  label: { color: '#333', marginTop: 8 },
  segmented: { marginTop: 4 },
  input: { marginTop: 4, backgroundColor: '#fff' },
  previewCard: { borderRadius: 12, marginTop: 8 },
  previewTitle: { color: '#666', marginBottom: 12 },
  macroRow: { flexDirection: 'row', justifyContent: 'space-around' },
  macroBox: { alignItems: 'center', gap: 2 },
  macroValue: { fontSize: 20, fontWeight: 'bold' },
  macroUnit: { fontSize: 11, color: '#888' },
  macroLabel: { fontSize: 11, color: '#555' },
  saveBtn: { marginTop: 16, borderRadius: 12 },
});

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useCreateFood } from '../api/hooks';
import { useAppStore } from '../store';

interface Field {
  key: string;
  label: string;
  unit?: string;
  required?: boolean;
}

const FIELDS: Field[] = [
  { key: 'name', label: 'Food Name', required: true },
  { key: 'brand', label: 'Brand (optional)' },
  { key: 'calories', label: 'Calories', unit: 'kcal', required: true },
  { key: 'protein', label: 'Protein', unit: 'g', required: true },
  { key: 'carbs', label: 'Carbohydrates', unit: 'g', required: true },
  { key: 'fat', label: 'Fat', unit: 'g', required: true },
  { key: 'fiber', label: 'Fiber', unit: 'g' },
  { key: 'servingSize', label: 'Serving Size' },
  { key: 'servingUnit', label: 'Serving Unit (g / ml / piece)' },
];

export default function CustomFoodScreen() {
  const nav = useNavigation();
  const userId = useAppStore((s) => s.selectedUserId)!;
  const createFood = useCreateFood();

  const [form, setForm] = useState<Record<string, string>>({
    servingSize: '100',
    servingUnit: 'g',
    fiber: '0',
  });

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    const required = FIELDS.filter((f) => f.required);
    for (const f of required) {
      if (!form[f.key]?.trim()) {
        Alert.alert('Missing field', `${f.label} is required`);
        return;
      }
    }

    try {
      await createFood.mutateAsync({
        name: form.name,
        brand: form.brand || undefined,
        calories: parseFloat(form.calories),
        protein: parseFloat(form.protein),
        carbs: parseFloat(form.carbs),
        fat: parseFloat(form.fat),
        fiber: parseFloat(form.fiber ?? '0'),
        servingSize: parseFloat(form.servingSize ?? '100'),
        servingUnit: form.servingUnit ?? 'g',
        createdBy: userId,
      });
      Alert.alert('Saved', 'Custom food added!', [{ text: 'OK', onPress: () => nav.goBack() }]);
    } catch {
      Alert.alert('Error', 'Failed to save. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="bodyMedium" style={styles.hint}>
        All values are per serving size (default: per 100g)
      </Text>

      {FIELDS.map((field) => (
        <TextInput
          key={field.key}
          mode="outlined"
          label={`${field.label}${field.required ? ' *' : ''}`}
          value={form[field.key] ?? ''}
          onChangeText={(v) => set(field.key, v)}
          keyboardType={field.unit ? 'numeric' : 'default'}
          right={field.unit ? <TextInput.Affix text={field.unit} /> : undefined}
          style={styles.input}
          backgroundColor="#fff"
        />
      ))}

      <Button
        mode="contained"
        onPress={handleSave}
        loading={createFood.isPending}
        disabled={createFood.isPending}
        buttonColor="#4CAF50"
        style={styles.saveBtn}
      >
        Save Food
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { padding: 16, gap: 10 },
  hint: { color: '#666', marginBottom: 8 },
  input: { backgroundColor: '#fff' },
  saveBtn: { marginTop: 16, borderRadius: 12 },
});

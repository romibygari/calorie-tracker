import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, Searchbar, Card, Button, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFoods } from '../api/hooks';
import type { FoodItem } from '../types';
import type { RootStackParamList } from '../navigation';

export default function SearchFoodScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setDebouncedQuery(query), 300);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [query]);

  const { data: foods = [], isLoading } = useFoods(debouncedQuery);

  const renderItem = ({ item }: { item: FoodItem }) => (
    <Card style={styles.item} onPress={() => nav.navigate('AddLog', { foodItemId: item.id })}>
      <Card.Content style={styles.itemContent}>
        <View style={{ flex: 1 }}>
          <Text variant="bodyLarge">{item.name}</Text>
          {item.brand && <Text variant="bodySmall" style={styles.brand}>{item.brand}</Text>}
          <Text variant="bodySmall" style={styles.macros}>
            {item.calories} kcal · P: {item.protein}g · C: {item.carbs}g · F: {item.fat}g
          </Text>
          <Text variant="bodySmall" style={styles.serving}>
            per {item.servingSize}{item.servingUnit}
          </Text>
        </View>
        <Button
          mode="contained-tonal"
          compact
          onPress={() => nav.navigate('AddLog', { foodItemId: item.id })}
        >
          Add
        </Button>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search foods..."
        value={query}
        onChangeText={setQuery}
        style={styles.searchbar}
        autoFocus
      />

      <View style={styles.actions}>
        <Button
          mode="outlined"
          icon="plus"
          onPress={() => nav.navigate('CustomFood')}
          style={styles.customBtn}
        >
          Add Custom Food
        </Button>
      </View>

      {isLoading && debouncedQuery.length > 0 && (
        <ActivityIndicator style={styles.loader} color="#4CAF50" />
      )}

      {debouncedQuery.length === 0 && (
        <Text style={styles.hint}>Type to search your food list</Text>
      )}

      <FlatList
        data={foods}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          debouncedQuery.length > 0 && !isLoading ? (
            <Text style={styles.empty}>No results for "{debouncedQuery}"</Text>
          ) : null
        }
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  searchbar: { margin: 16, borderRadius: 12 },
  actions: { paddingHorizontal: 16, marginBottom: 8 },
  customBtn: { borderColor: '#4CAF50' },
  loader: { marginTop: 32 },
  hint: { textAlign: 'center', color: '#999', marginTop: 32 },
  list: { padding: 16, paddingTop: 4 },
  item: { marginBottom: 10, borderRadius: 10 },
  itemContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  brand: { color: '#888' },
  macros: { color: '#555', marginTop: 2 },
  serving: { color: '#aaa' },
  empty: { textAlign: 'center', color: '#999', marginTop: 32 },
});

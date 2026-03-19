import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Card, Divider } from 'react-native-paper';
import { useUser, useUpdateUser } from '../api/hooks';
import { useAppStore } from '../store';

export default function SettingsScreen() {
  const userId = useAppStore((s) => s.selectedUserId)!;
  const setSelectedUserId = useAppStore((s) => s.setSelectedUserId);
  const { data: user } = useUser(userId);
  const updateUser = useUpdateUser();

  const [name, setName] = useState('');
  const [calTarget, setCalTarget] = useState('');
  const [proteinTarget, setProteinTarget] = useState('');
  const [carbTarget, setCarbTarget] = useState('');
  const [fatTarget, setFatTarget] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setCalTarget(String(user.calorieTarget));
      setProteinTarget(String(user.proteinTarget));
      setCarbTarget(String(user.carbTarget));
      setFatTarget(String(user.fatTarget));
    }
  }, [user]);

  const handleSave = async () => {
    try {
      await updateUser.mutateAsync({
        id: userId,
        data: {
          name,
          calorieTarget: parseInt(calTarget),
          proteinTarget: parseInt(proteinTarget),
          carbTarget: parseInt(carbTarget),
          fatTarget: parseInt(fatTarget),
        },
      });
      Alert.alert('Saved', 'Your targets have been updated.');
    } catch {
      Alert.alert('Error', 'Failed to save. Please try again.');
    }
  };

  const handleSwitchProfile = () => {
    Alert.alert('Switch Profile', 'Go back to profile selection?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Switch',
        onPress: async () => {
          // Set to the other user (1 → 2, 2 → 1)
          const otherId = userId === 1 ? 2 : 1;
          await setSelectedUserId(otherId);
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="titleMedium" style={styles.sectionTitle}>Profile</Text>
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <TextInput
            mode="outlined"
            label="Your Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
        </Card.Content>
      </Card>

      <Text variant="titleMedium" style={styles.sectionTitle}>Daily Targets</Text>
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          {[
            { label: 'Calories', unit: 'kcal', value: calTarget, set: setCalTarget },
            { label: 'Protein', unit: 'g', value: proteinTarget, set: setProteinTarget },
            { label: 'Carbohydrates', unit: 'g', value: carbTarget, set: setCarbTarget },
            { label: 'Fat', unit: 'g', value: fatTarget, set: setFatTarget },
          ].map(({ label, unit, value, set }, i, arr) => (
            <View key={label}>
              <TextInput
                mode="outlined"
                label={label}
                value={value}
                onChangeText={set}
                keyboardType="numeric"
                right={<TextInput.Affix text={unit} />}
                style={styles.input}
              />
              {i < arr.length - 1 && <View style={{ height: 8 }} />}
            </View>
          ))}
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handleSave}
        loading={updateUser.isPending}
        disabled={updateUser.isPending}
        buttonColor="#4CAF50"
        style={styles.saveBtn}
      >
        Save Changes
      </Button>

      <Divider style={styles.divider} />

      <Button
        mode="outlined"
        onPress={handleSwitchProfile}
        style={styles.switchBtn}
        textColor="#666"
      >
        Switch Profile
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { padding: 16, gap: 8 },
  sectionTitle: { fontWeight: 'bold', color: '#333', marginTop: 8 },
  card: { borderRadius: 12 },
  cardContent: { gap: 4 },
  input: { backgroundColor: '#fff' },
  saveBtn: { marginTop: 16, borderRadius: 12 },
  divider: { marginVertical: 24 },
  switchBtn: { borderColor: '#ccc' },
});

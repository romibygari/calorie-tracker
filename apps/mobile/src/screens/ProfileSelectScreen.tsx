import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { useUsers } from '../api/hooks';
import { useAppStore } from '../store';

export default function ProfileSelectScreen() {
  const { data: users, isLoading } = useUsers();
  const { setSelectedUserId, loadStoredUser, selectedUserId } = useAppStore();

  useEffect(() => {
    loadStoredUser();
  }, []);

  if (isLoading || selectedUserId) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Who are you?
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Pick your profile to continue
      </Text>

      <View style={styles.cards}>
        {(users ?? []).map((user) => (
          <Card key={user.id} style={styles.card} onPress={() => setSelectedUserId(user.id)}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user.name[0].toUpperCase()}</Text>
              </View>
              <Text variant="titleLarge" style={styles.userName}>
                {user.name}
              </Text>
              <Text variant="bodySmall" style={styles.target}>
                Target: {user.calorieTarget} kcal/day
              </Text>
              <Button
                mode="contained"
                onPress={() => setSelectedUserId(user.id)}
                style={styles.btn}
                buttonColor="#4CAF50"
              >
                Select
              </Button>
            </Card.Content>
          </Card>
        ))}
      </View>

      {!isLoading && (!users || users.length === 0) && (
        <Text style={styles.error}>
          Cannot connect to server. Make sure the backend is running.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 24, justifyContent: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { textAlign: 'center', fontWeight: 'bold', marginBottom: 8 },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: 40 },
  cards: { gap: 16 },
  card: { borderRadius: 16 },
  cardContent: { alignItems: 'center', gap: 12, paddingVertical: 24 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  userName: { fontWeight: 'bold' },
  target: { color: '#666' },
  btn: { marginTop: 8, width: '80%' },
  error: { textAlign: 'center', color: '#F44336', marginTop: 24 },
});

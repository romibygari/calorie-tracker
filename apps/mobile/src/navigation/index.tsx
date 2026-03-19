import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store';

import ProfileSelectScreen from '../screens/ProfileSelectScreen';
import DashboardScreen from '../screens/DashboardScreen';
import SearchFoodScreen from '../screens/SearchFoodScreen';
import AddLogScreen from '../screens/AddLogScreen';
import CustomFoodScreen from '../screens/CustomFoodScreen';
import HistoryScreen from '../screens/HistoryScreen';
import DayDetailScreen from '../screens/DayDetailScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import SettingsScreen from '../screens/SettingsScreen';

export type RootStackParamList = {
  ProfileSelect: undefined;
  Main: undefined;
  AddLog: { foodItemId: number; defaultMeal?: string };
  DayDetail: { date: string };
  CustomFood: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  Search: undefined;
  History: undefined;
  Analytics: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            Dashboard: 'home',
            Search: 'search',
            History: 'calendar',
            Analytics: 'bar-chart',
            Settings: 'settings',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#9E9E9E',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Search" component={SearchFoodScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  const selectedUserId = useAppStore((s) => s.selectedUserId);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!selectedUserId ? (
          <Stack.Screen name="ProfileSelect" component={ProfileSelectScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="AddLog"
              component={AddLogScreen}
              options={{ headerShown: true, title: 'Log Food', presentation: 'modal' }}
            />
            <Stack.Screen
              name="DayDetail"
              component={DayDetailScreen}
              options={{ headerShown: true, title: 'Day Detail' }}
            />
            <Stack.Screen
              name="CustomFood"
              component={CustomFoodScreen}
              options={{ headerShown: true, title: 'Add Custom Food', presentation: 'modal' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

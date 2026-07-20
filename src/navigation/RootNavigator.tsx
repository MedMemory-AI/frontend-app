import { NavigationContainer } from '@react-navigation/native';
import { useEffect, useState } from 'react';

import { LoadingSpinner } from '../components';
import { TimelineDetailScreen } from '../screens/main';
import { useAuthStore } from '../stores';
import { navigationTheme } from '../theme';

import { AuthNavigator } from './AuthNavigator';
import { createAppStackNavigator } from './createStackNavigator';
import { MainNavigator } from './MainNavigator';
import type { RootStackParamList } from './types';

const RootStack = createAppStackNavigator<RootStackParamList>();

// TEMP: Test credentials — remove bypass block before production.
export function RootNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isGuest = useAuthStore((state) => state.isGuest);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  if (!isHydrated) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }

  const showMainApp = isAuthenticated || isGuest;

  return (
    <NavigationContainer theme={navigationTheme}>
      <RootStack.Navigator
        key={showMainApp ? 'main-flow' : 'auth-flow'}
        screenOptions={{ headerShown: false }}
      >
        {showMainApp ? (
          <>
            <RootStack.Screen name="Main" component={MainNavigator} />
            <RootStack.Screen name="TimelineDetails" component={TimelineDetailScreen} />
          </>
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

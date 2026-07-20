import { LoginScreen, RegisterScreen } from '../screens/auth';

import { createAppStackNavigator } from './createStackNavigator';
import type { AuthStackParamList } from './types';

const AuthStack = createAppStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

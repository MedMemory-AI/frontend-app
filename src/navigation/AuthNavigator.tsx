import { LoginScreen, RegisterScreen, VerifyOtpScreen } from '../screens/auth';
import { useAuthStore } from '../stores';

import { createAppStackNavigator } from './createStackNavigator';
import type { AuthStackParamList } from './types';

const AuthStack = createAppStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  const isAwaitingOtp = useAuthStore((state) => state.isAwaitingOtp);

  return (
    <AuthStack.Navigator
      initialRouteName={isAwaitingOtp ? 'VerifyOtp' : 'Login'}
      screenOptions={{ headerShown: false }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
    </AuthStack.Navigator>
  );
}

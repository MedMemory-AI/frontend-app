import { StatusBar } from 'expo-status-bar';

import { RootNavigator } from './src/navigation';
import { AppProviders } from './src/providers';

export default function App() {
  return (
    <AppProviders>
      <RootNavigator />
      <StatusBar style="auto" />
    </AppProviders>
  );
}

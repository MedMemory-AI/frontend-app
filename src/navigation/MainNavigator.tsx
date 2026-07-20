import { AIChatScreen, HomeScreen, ProfileScreen, TimelineScreen, UploadScreen } from '../screens/main';

import { createAppTabNavigator } from './createTabNavigator';
import { renderTabIcon, renderTabLabel } from './tabIcons';
import type { MainTabParamList } from './types';

const Tab = createAppTabNavigator<MainTabParamList>();

export function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      renderTabIcon={renderTabIcon}
      renderTabLabel={(routeName) => renderTabLabel(routeName)}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Upload" component={UploadScreen} options={{ title: 'Upload' }} />
      <Tab.Screen name="Timeline" component={TimelineScreen} options={{ title: 'Timeline' }} />
      <Tab.Screen name="AIChat" component={AIChatScreen} options={{ title: 'AI Chat' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

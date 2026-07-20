import {
  CommonActions,
  createNavigatorFactory,
  type DefaultNavigatorOptions,
  type NavigationProp,
  type NavigatorTypeBagBase,
  type ParamListBase,
  type RouteProp,
  type StaticConfig,
  type TabActionHelpers,
  type TabNavigationState,
  TabRouter,
  type TabRouterOptions,
  type TypedNavigator,
  useNavigationBuilder,
} from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, typography } from '../theme';

type TabNavigationOptions = {
  headerShown?: boolean;
  title?: string;
};

type TabNavigationEventMap = {
  tabPress: {
    data: { isAlreadyFocused: boolean };
    canPreventDefault: true;
  };
};

export type AppTabNavigationProp<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = keyof ParamList,
  NavigatorID extends string | undefined = undefined,
> = NavigationProp<
  ParamList,
  RouteName,
  NavigatorID,
  TabNavigationState<ParamList>,
  TabNavigationOptions,
  TabNavigationEventMap
> &
  TabActionHelpers<ParamList>;

export type AppTabScreenProps<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = keyof ParamList,
  NavigatorID extends string | undefined = undefined,
> = {
  navigation: AppTabNavigationProp<ParamList, RouteName, NavigatorID>;
  route: RouteProp<ParamList, RouteName>;
};

type TabNavigatorConfig = {
  tabBarStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  renderTabIcon?: (routeName: string, isFocused: boolean) => React.ReactNode;
  renderTabLabel?: (routeName: string, isFocused: boolean) => string;
};

type TabNavigatorProps = DefaultNavigatorOptions<
  ParamListBase,
  string | undefined,
  TabNavigationState<ParamListBase>,
  TabNavigationOptions,
  TabNavigationEventMap,
  AppTabNavigationProp<ParamListBase>
> &
  TabRouterOptions &
  TabNavigatorConfig;

function TabNavigator({
  tabBarStyle,
  contentStyle,
  renderTabIcon,
  renderTabLabel,
  ...rest
}: TabNavigatorProps) {
  const insets = useSafeAreaInsets();
  const { state, navigation, descriptors, NavigationContent } = useNavigationBuilder<
    TabNavigationState<ParamListBase>,
    TabRouterOptions,
    TabActionHelpers<ParamListBase>,
    TabNavigationOptions,
    TabNavigationEventMap
  >(TabRouter, rest);

  return (
    <NavigationContent>
      <View style={styles.container}>
        <View style={[styles.content, contentStyle]}>
          {state.routes.map((route, index) => (
            <View
              key={route.key}
              style={[
                StyleSheet.absoluteFill,
                { display: index === state.index ? 'flex' : 'none' },
              ]}
            >
              {descriptors[route.key].render()}
            </View>
          ))}
        </View>
        <View
          style={[
            styles.tabBar,
            { paddingBottom: Math.max(insets.bottom, spacing.sm) },
            tabBarStyle,
          ]}
        >
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            const label =
              renderTabLabel?.(route.name, isFocused) ??
              descriptors[route.key].options.title ??
              route.name;

            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={{ selected: isFocused }}
                onPress={() => {
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                    data: {
                      isAlreadyFocused: isFocused,
                    },
                  });

                  if (!isFocused && !event.defaultPrevented) {
                    navigation.dispatch({
                      ...CommonActions.navigate(route.name, route.params),
                      target: state.key,
                    });
                  }
                }}
                style={[styles.tabItem, isFocused && styles.tabItemActive]}
              >
                {renderTabIcon?.(route.name, isFocused)}
                <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </NavigationContent>
  );
}

export type AppTabTypeBag<
  ParamList extends ParamListBase = ParamListBase,
  NavigatorID extends string | undefined = string | undefined,
> = {
  ParamList: ParamList;
  NavigatorID: NavigatorID;
  State: TabNavigationState<ParamList>;
  ScreenOptions: TabNavigationOptions;
  EventMap: TabNavigationEventMap;
  NavigationList: {
    [RouteName in keyof ParamList]: AppTabNavigationProp<
      ParamList,
      RouteName,
      NavigatorID
    >;
  };
  Navigator: typeof TabNavigator;
};

export function createAppTabNavigator<
  const ParamList extends ParamListBase,
  const NavigatorID extends string | undefined = string | undefined,
  const TypeBag extends NavigatorTypeBagBase = AppTabTypeBag<
    ParamList,
    NavigatorID
  >,
  const Config extends StaticConfig<TypeBag> = StaticConfig<TypeBag>,
>(config?: Config): TypedNavigator<TypeBag, Config> {
  return createNavigatorFactory(TabNavigator)(config);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.sm,
  },
  tabItem: {
    alignItems: 'center',
    borderRadius: spacing.sm,
    flex: 1,
    gap: spacing.xs,
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  tabItemActive: {
    backgroundColor: colors.primaryLight,
  },
  tabLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: typography.label.fontWeight,
  },
});

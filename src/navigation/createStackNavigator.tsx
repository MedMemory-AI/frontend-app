import { StyleSheet, View } from 'react-native';
import {
  createNavigatorFactory,
  type DefaultNavigatorOptions,
  type NavigationAction,
  type NavigationProp,
  type NavigatorTypeBagBase,
  type ParamListBase,
  type RouteProp,
  type StackActionHelpers,
  type StackNavigationState,
  StackRouter,
  type StackRouterOptions,
  type StaticConfig,
  type TypedNavigator,
  useNavigationBuilder,
} from '@react-navigation/native';

type StackNavigationOptions = {
  headerShown?: boolean;
  title?: string;
};

type StackNavigationEventMap = {
  focus: { data: undefined };
  blur: { data: undefined };
  beforeRemove: {
    data: { action: NavigationAction };
    canPreventDefault: true;
  };
  state: {
    data: { state: StackNavigationState<ParamListBase> };
  };
};

export type AppStackNavigationProp<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = keyof ParamList,
  NavigatorID extends string | undefined = undefined,
> = NavigationProp<
  ParamList,
  RouteName,
  NavigatorID,
  StackNavigationState<ParamList>,
  StackNavigationOptions,
  StackNavigationEventMap
> &
  StackActionHelpers<ParamList>;

export type AppStackScreenProps<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = keyof ParamList,
  NavigatorID extends string | undefined = undefined,
> = {
  navigation: AppStackNavigationProp<ParamList, RouteName, NavigatorID>;
  route: RouteProp<ParamList, RouteName>;
};

type StackNavigatorProps = DefaultNavigatorOptions<
  ParamListBase,
  string | undefined,
  StackNavigationState<ParamListBase>,
  StackNavigationOptions,
  StackNavigationEventMap,
  AppStackNavigationProp<ParamListBase>
> &
  StackRouterOptions;

function StackNavigator(props: StackNavigatorProps) {
  const { state, descriptors, NavigationContent } = useNavigationBuilder<
    StackNavigationState<ParamListBase>,
    StackRouterOptions,
    StackActionHelpers<ParamListBase>,
    StackNavigationOptions,
    StackNavigationEventMap
  >(StackRouter, props);

  const focusedRoute = state.routes[state.index];
  const descriptor = descriptors[focusedRoute.key];

  return (
    <NavigationContent>
      <View style={styles.container}>{descriptor.render()}</View>
    </NavigationContent>
  );
}

export type AppStackTypeBag<
  ParamList extends ParamListBase = ParamListBase,
  NavigatorID extends string | undefined = string | undefined,
> = {
  ParamList: ParamList;
  NavigatorID: NavigatorID;
  State: StackNavigationState<ParamList>;
  ScreenOptions: StackNavigationOptions;
  EventMap: StackNavigationEventMap;
  NavigationList: {
    [RouteName in keyof ParamList]: AppStackNavigationProp<
      ParamList,
      RouteName,
      NavigatorID
    >;
  };
  Navigator: typeof StackNavigator;
};

export function createAppStackNavigator<
  const ParamList extends ParamListBase,
  const NavigatorID extends string | undefined = string | undefined,
  const TypeBag extends NavigatorTypeBagBase = AppStackTypeBag<
    ParamList,
    NavigatorID
  >,
  const Config extends StaticConfig<TypeBag> = StaticConfig<TypeBag>,
>(config?: Config): TypedNavigator<TypeBag, Config> {
  return createNavigatorFactory(StackNavigator)(config);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

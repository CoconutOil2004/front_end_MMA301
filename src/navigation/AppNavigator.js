import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { ActivityIndicator, View, Text } from "react-native";
import { StatusBar } from "expo-status-bar";

// Import các màn hình
import HomeScreen from "../screens/HomeScreen";
import SearchScreen from "../screens/SearchScreen";
import CreatePostScreen from "../screens/CreatePostScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import MessagesScreen from "../screens/MessagesScreen";
import ChatDetailScreen from "../screens/ChatDetailScreen";
import SettingsScreen from "../screens/SettingsScreen";
import PostDetailScreen from "../screens/PostDetailScreen";
import AdminReportsScreen from "../screens/AdminReportsScreen";
import EditProfileScreen from "../screens/EditProfileScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs({ role }) {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Home")
            iconName = focused ? "home" : "home-outline";
          else if (route.name === "CreatePost")
            iconName = focused ? "add-circle" : "add-circle-outline";
          else if (route.name === "Notifications")
            iconName = focused ? "notifications" : "notifications-outline";
          else if (route.name === "Profile")
            iconName = focused ? "person" : "person-outline";
          else if (route.name === "AdminReports")
            iconName = focused ? "analytics" : "analytics-outline";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.placeholder,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      {role === "admin" && (
        <Tab.Screen
          name="AdminReports"
          component={AdminReportsScreen}
          options={{ tabBarLabel: "Reports" }}
        />
      )}
      <Tab.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{ tabBarLabel: "Tạo bài" }}
      />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AppStack({ role }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs">
        {(props) => <MainTabs {...props} role={role} />}
      </Stack.Screen>

      <Stack.Screen name="Messages" component={MessagesScreen} />
      <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </Stack.Navigator>
  );
}


function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { isLoggedIn, loading, role } = useContext(AuthContext);
  const { theme, themeName } = useTheme();

  if (loading || (isLoggedIn && !role)) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ color: theme.colors.text, marginTop: 10 }}>
          Đang tải thông tin người dùng...
        </Text>
        <StatusBar style={themeName === "dark" ? "light" : "dark"} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={theme}>
      <StatusBar style={themeName === "dark" ? "light" : "dark"} />
      {/* 👇 ép Navigation reload khi role đổi */}
      {isLoggedIn ? (
        <AppStack key={role || "user"} role={role} />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}

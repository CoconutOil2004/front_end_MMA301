import React from "react";
import { ThemeProvider } from "./src/context/ThemeContext";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </AuthProvider>
  );
}

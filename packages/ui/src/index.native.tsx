import { Pressable, Text } from "react-native";
import React from "react";

export function Button({ children }: { children: React.ReactNode }) {
  return (
    <Pressable className="rounded-lg bg-blue-600 px-4 py-2 active:bg-blue-800">
      <Text className="text-white font-medium text-center">
        {children}
      </Text>
    </Pressable>
  );
}
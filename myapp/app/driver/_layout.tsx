import { Stack } from 'expo-router';

export default function DriverLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          title: 'Driver Login',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="tracking"
        options={{
          title: 'Driver Tracking',
          headerShown: true,
        }}
      />
    </Stack>
  );
}


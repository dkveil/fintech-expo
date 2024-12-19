import { Button, View, Text } from 'react-native';
import React from 'react';
import { defaultStyles } from '@/constants/Styles';
import { useClerk } from '@clerk/clerk-expo';

export default function Home() {
  const { signOut } = useClerk();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      // console.error('Błąd podczas wylogowywania:', error);
    }
  };

  return (
    <View style={defaultStyles.container}>
      <Text>Home</Text>
      <Button title='Wyloguj się' onPress={handleLogout} />
    </View>
  );
}

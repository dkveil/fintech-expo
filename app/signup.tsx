import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { defaultStyles } from '@/constants/Styles';
import Colors from '@/constants/Colors';
import { Link, useRouter } from 'expo-router';
import { useSignUp } from '@clerk/clerk-expo';

const SignupScreen = () => {
  const [countryCode, setCountryCode] = useState('+49');
  const [phoneNumber, setPhoneNumber] = useState('');
  const router = useRouter();
  const { signUp } = useSignUp();

  const onSignup = async () => {
    const fullPhoneNumber = `${countryCode}${phoneNumber}`;

    try {
      await signUp!.create({
        phoneNumber: fullPhoneNumber,
      });
      router.push({ pathname: '/verify/[phone]', params: { phone: fullPhoneNumber } });
    } catch (error) {
      console.error('Error signing up:', error);
    }
  };

  const keyboardVerticalOffset = Platform.OS === 'ios' ? 90 : 0;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior='padding' keyboardVerticalOffset={keyboardVerticalOffset}>
      <View style={defaultStyles.container}>
        <Text style={defaultStyles.header}>Let's get started!</Text>
        <Text style={defaultStyles.descriptionText}>Enter your phone number. We will sen you a confirmation code there</Text>
        <View style={styles.inputContainer}>
          <TextInput style={styles.input} placeholder='Country code' keyboardType='numeric' placeholderTextColor={Colors.light.gray} value={countryCode} onChangeText={setCountryCode} maxLength={3} />
          <TextInput style={[styles.input, { flex: 1, marginRight: 0 }]} placeholder='Phone number' keyboardType='numeric' placeholderTextColor={Colors.light.gray} value={phoneNumber} onChangeText={setPhoneNumber} />
        </View>

        <Link href='/login' replace asChild>
          <TouchableOpacity>
            <Text style={defaultStyles.textLink}>Already have an acccount? Log in</Text>
          </TouchableOpacity>
        </Link>

        <View style={{ flex: 1 }} />

        <TouchableOpacity style={[defaultStyles.pillButton, phoneNumber !== '' ? styles.enabled : styles.disabled, { marginBottom: 20 }]}>
          <Text style={defaultStyles.buttonText} onPress={onSignup}>
            Sign Up
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginVertical: 40,
    flexDirection: 'row',
  },
  input: {
    backgroundColor: Colors.light.lightGray,
    padding: 20,
    borderRadius: 16,
    fontSize: 20,
    marginRight: 10,
  },
  enabled: {
    backgroundColor: Colors.light.primary,
  },
  disabled: {
    backgroundColor: Colors.light.primaryMuted,
  },
});

export default SignupScreen;

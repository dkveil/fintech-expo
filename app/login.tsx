import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { defaultStyles } from '@/constants/Styles';
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSignIn } from '@clerk/clerk-expo';

enum SignInType {
  Phone,
  Email,
  Google,
  Apple,
}

const LoginScreen = () => {
  const [countryCode, setCountryCode] = useState('+49');
  const [phoneNumber, setPhoneNumber] = useState('');

  const router = useRouter();
  const { signIn } = useSignIn();

  const onLogin = async (type: SignInType) => {
    if (type === SignInType.Phone) {
      try {
        const fullPhoneNumber = `${countryCode}${phoneNumber}`;

        const { supportedFirstFactor } = await signIn!.create({
          identifier: fullPhoneNumber,
        });

        router.push({ pathname: '/verify/[phone]', params: { phone: fullPhoneNumber } });
      } catch (error) {
        console.error('Error signing in:', error);
      }
    }

    if (type === SignInType.Email) {
      console.log('Email login');
    }
  };

  const keyboardVerticalOffset = Platform.OS === 'ios' ? 90 : 0;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior='padding' keyboardVerticalOffset={keyboardVerticalOffset}>
      <View style={defaultStyles.container}>
        <Text style={defaultStyles.header}>Welcome back!</Text>
        <Text style={defaultStyles.descriptionText}>Enter your phone number. We will sen you a confirmation code there</Text>
        <View style={styles.inputContainer}>
          <TextInput style={styles.input} placeholder='Country code' keyboardType='numeric' placeholderTextColor={Colors.light.gray} value={countryCode} onChangeText={setCountryCode} maxLength={3} />
          <TextInput style={[styles.input, { flex: 1, marginRight: 0 }]} placeholder='Phone number' keyboardType='numeric' placeholderTextColor={Colors.light.gray} value={phoneNumber} onChangeText={setPhoneNumber} />
        </View>

        <TouchableOpacity style={[defaultStyles.pillButton, phoneNumber !== '' ? styles.enabled : styles.disabled, { marginBottom: 20 }]} onPress={() => onLogin(SignInType.Phone)}>
          <Text style={defaultStyles.buttonText}>Continue</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <View style={{ flex: 1, backgroundColor: Colors.light.gray, height: StyleSheet.hairlineWidth }}></View>
          <Text style={{ color: Colors.light.gray }}>OR</Text>
          <View style={{ flex: 1, backgroundColor: Colors.light.gray, height: StyleSheet.hairlineWidth }}></View>
        </View>

        <TouchableOpacity style={[defaultStyles.pillButton, { flexDirection: 'row', gap: 12, marginTop: 20, backgroundColor: 'white' }]} onPress={() => onLogin(SignInType.Email)}>
          <Ionicons name='mail' size={24} color={Colors.light.dark} />
          <Text style={[defaultStyles.buttonText, { color: Colors.light.dark }]}>Continue with email</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[defaultStyles.pillButton, { flexDirection: 'row', gap: 12, marginTop: 20, backgroundColor: 'white' }]} onPress={() => onLogin(SignInType.Email)}>
          <Ionicons name='logo-google' size={24} color={Colors.light.dark} />
          <Text style={[defaultStyles.buttonText, { color: Colors.light.dark }]}>Continue with G-mail</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[defaultStyles.pillButton, { flexDirection: 'row', gap: 12, marginTop: 20, backgroundColor: 'white' }]} onPress={() => onLogin(SignInType.Email)}>
          <Ionicons name='logo-apple' size={24} color={Colors.light.dark} />
          <Text style={[defaultStyles.buttonText, { color: Colors.light.dark }]}>Continue with Apple</Text>
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

export default LoginScreen;

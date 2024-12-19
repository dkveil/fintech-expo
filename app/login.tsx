import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useState, useRef } from 'react';
import { defaultStyles } from '@/constants/Styles';
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSignIn, isClerkAPIResponseError } from '@clerk/clerk-expo';
import { phoneSchema, type PhoneFormData, type ValidationErrors } from './signup';

enum SignInType {
  Phone,
  Email,
  Google,
  Apple,
}

export default function LoginScreen() {
  const countryCodeRef = useRef<string>('+48');
  const phoneNumberRef = useRef<string>('');

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isValid, setIsValid] = useState<boolean>(false);

  const router = useRouter();
  const { signIn } = useSignIn();

  const keyboardVerticalOffset = Platform.OS === 'ios' ? 90 : 0;

  const validateInputs = () => {
    const data = {
      countryCode: countryCodeRef.current,
      phoneNumber: phoneNumberRef.current,
    };

    const result = phoneSchema.safeParse(data);

    if (result.success) {
      setErrors({});
      setIsValid(true);
    } else {
      const fieldErrors: ValidationErrors = {};
      result.error.errors.forEach(err => {
        const field = err.path[0] as keyof PhoneFormData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      setIsValid(false);
    }
  };

  const onLogin = async (type: SignInType) => {
    if (type === SignInType.Phone) {
      validateInputs();

      if (!isValid) {
        Alert.alert('Error', 'Please correct the errors in the form');
        return;
      }

      try {
        const fullPhoneNumber = `${countryCodeRef.current}${phoneNumberRef.current}`.trim();

        const { supportedFirstFactors } = await signIn!.create({
          identifier: fullPhoneNumber,
        });

        const firstPhoneFactor: any = supportedFirstFactors!.find((factor: any) => factor.type === 'phone_number');

        const { phoneNumberId } = firstPhoneFactor;

        await signIn!.prepareFirstFactor({
          strategy: 'phone_code',
          phoneNumberId,
        });

        router.push({ pathname: '/verify/[phone]', params: { phone: fullPhoneNumber, login: 'true' } });
      } catch (error) {
        if (isClerkAPIResponseError(error)) {
          Alert.alert('Error', error.errors[0].message);
          return;
        }

        console.error('Error signing in:', error);
      }
    }

    if (type === SignInType.Email) {
      console.log('Email login');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior='padding' keyboardVerticalOffset={keyboardVerticalOffset}>
      <View style={defaultStyles.container}>
        <Text style={defaultStyles.header}>Welcome back!</Text>
        <Text style={defaultStyles.descriptionText}>Enter your phone number. We will sen you a confirmation code there</Text>
        <View style={{ marginVertical: 15 }}>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { width: 80 }]}
              placeholder='+00'
              keyboardType='phone-pad'
              placeholderTextColor={Colors.light.gray}
              defaultValue={countryCodeRef.current}
              onChangeText={text => {
                countryCodeRef.current = text;
                validateInputs();
              }}
              maxLength={3}
            />
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 0 }]}
              placeholder='Phone number'
              keyboardType='phone-pad'
              placeholderTextColor={Colors.light.gray}
              defaultValue={phoneNumberRef.current}
              onChangeText={text => {
                phoneNumberRef.current = text;
                validateInputs();
              }}
              maxLength={14}
            />
          </View>
          <View>
            <Text style={styles.errorText}>{errors.countryCode ? errors.countryCode : errors.phoneNumber}</Text>
          </View>
        </View>

        <TouchableOpacity style={[defaultStyles.pillButton, isValid ? styles.enabled : styles.disabled, { marginBottom: 20 }]} onPress={() => onLogin(SignInType.Phone)}>
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
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
  },
  input: {
    backgroundColor: Colors.light.lightGray,
    padding: 20,
    borderRadius: 16,
    fontSize: 20,
    marginRight: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 5,
    marginLeft: 5,
  },
  enabled: {
    backgroundColor: Colors.light.primary,
  },
  disabled: {
    backgroundColor: Colors.light.primaryMuted,
  },
});

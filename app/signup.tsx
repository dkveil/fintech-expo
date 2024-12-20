import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useState, useRef } from 'react';
import { defaultStyles } from '@/constants/Styles';
import Colors from '@/constants/Colors';
import { Link, useRouter } from 'expo-router';
import { isClerkAPIResponseError, useSignUp } from '@clerk/clerk-expo';
import { z } from 'zod';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface PhoneFormData {
  countryCode: string;
  phoneNumber: string;
}

export const phoneSchema = z
  .object({
    countryCode: z.string().regex(/^\+\d{1,3}$/, 'Country code must start with + followed by 1 to 3 digits'),
    phoneNumber: z.string().regex(/^\d{4,14}$/, 'Phone number must be between 4 and 14 digits'),
  })
  .refine(
    data => {
      const totalDigits = data.countryCode.length - 1 + data.phoneNumber.length; // -1, ponieważ '+' nie jest cyfrą
      return totalDigits <= 15;
    },
    {
      message: 'Full phone number must be a valid E.164 format',
      path: ['phoneNumber'],
    }
  );

export type ValidationErrors = Partial<Record<keyof PhoneFormData, string>>;

export default function SignUpScreen() {
  const countryCodeRef = useRef<string>('+48');
  const phoneNumberRef = useRef<string>('');

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isValid, setIsValid] = useState<boolean>(false);

  const router = useRouter();
  const { signUp } = useSignUp();

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

  const onSignup = async (): Promise<void> => {
    validateInputs();

    if (!isValid) {
      Alert.alert('Error', 'Please correct the errors in the form');
      return;
    }

    try {
      const fullPhoneNumber = `${countryCodeRef.current}${phoneNumberRef.current}`.trim();

      await signUp!.create({
        phoneNumber: fullPhoneNumber,
      });
      signUp!.prepareVerification({
        strategy: 'phone_code',
      });

      router.push({ pathname: '/verify/[identifier]', params: { identifier: fullPhoneNumber, strategy: 'phone_code' } });
    } catch (error) {
      if (isClerkAPIResponseError(error)) {
        Alert.alert('Error', error.errors[0].message);
        return;
      }

      Alert.alert('Error', 'An error occurred during sign up. Please try again later.');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior='padding' keyboardVerticalOffset={keyboardVerticalOffset}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={defaultStyles.container}>
          <Text style={defaultStyles.header}>Let's get started!</Text>
          <Text style={defaultStyles.descriptionText}>Enter your phone number. We will sen you a confirmation code there</Text>
          <View style={{ marginVertical: 25 }}>
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
            <Link href='/(email)/signup' replace asChild>
              <TouchableOpacity>
                <Text style={defaultStyles.textLink}>Sign up with email</Text>
              </TouchableOpacity>
            </Link>
          </View>

          <Link style={{ marginBottom: 15 }} href='/login' replace asChild>
            <TouchableOpacity>
              <Text style={defaultStyles.textLink}>Already have an acccount? Log in</Text>
            </TouchableOpacity>
          </Link>

          <View style={{ flex: 1 }} />

          <TouchableOpacity style={[defaultStyles.pillButton, isValid ? styles.enabled : styles.disabled, { marginBottom: 20 }]} onPress={onSignup}>
            <Text style={defaultStyles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </TouchableWithoutFeedback>
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

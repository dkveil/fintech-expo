import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useState, useRef } from 'react';
import { defaultStyles } from '@/constants/Styles';
import Colors from '@/constants/Colors';
import { Link, useRouter } from 'expo-router';
import { useSignUp } from '@clerk/clerk-expo';
import { z } from 'zod';

interface PhoneFormData {
  countryCode: string;
  phoneNumber: string;
}

const phoneSchema = z
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

type ValidationErrors = Partial<Record<keyof PhoneFormData, string>>;

const SignupScreen = () => {
  const countryCodeRef = useRef<string>('+48');
  const phoneNumberRef = useRef<string>('');

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isValid, setIsValid] = useState<boolean>(false);

  const router = useRouter();
  const { signUp } = useSignUp();

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
      console.error('Formularz zawiera błędy.');
      return;
    }
    const fullPhoneNumber = `${countryCodeRef.current}${phoneNumberRef.current}`.trim();

    try {
      await signUp!.create({
        phoneNumber: fullPhoneNumber,
      });
      signUp!.preparePhoneNumberVerification();

      router.push({ pathname: '/verify/[phone]', params: { phone: fullPhoneNumber } });
    } catch (error) {
      console.log('Error during sign up:', error);
      Alert.alert('Error', 'An error occurred. Please try again later');
    }
  };

  const keyboardVerticalOffset = Platform.OS === 'ios' ? 90 : 0;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior='padding' keyboardVerticalOffset={keyboardVerticalOffset}>
      <View style={defaultStyles.container}>
        <Text style={defaultStyles.header}>Let's get started!</Text>
        <Text style={defaultStyles.descriptionText}>Enter your phone number. We will sen you a confirmation code there</Text>
        <View style={{ marginVertical: 40 }}>
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
          <View> {errors.countryCode ? <Text style={styles.errorText}>{errors.countryCode}</Text> : errors.phoneNumber ? <Text style={styles.errorText}>{errors.phoneNumber}</Text> : null}</View>
        </View>

        <Link href='/login' replace asChild>
          <TouchableOpacity>
            <Text style={defaultStyles.textLink}>Already have an acccount? Log in</Text>
          </TouchableOpacity>
        </Link>

        <View style={{ flex: 1 }} />

        <TouchableOpacity style={[defaultStyles.pillButton, isValid ? styles.enabled : styles.disabled, { marginBottom: 20 }]} onPress={onSignup}>
          <Text style={defaultStyles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

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

export default SignupScreen;

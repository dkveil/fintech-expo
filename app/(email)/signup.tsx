import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useState, useRef } from 'react';
import { defaultStyles } from '@/constants/Styles';
import Colors from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { useSignUp, isClerkAPIResponseError } from '@clerk/clerk-expo';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

export interface EmailFormData {
  emailAddress: string;
  password: string;
  confirmPassword: string;
}

export const emailSchema = z
  .object({
    emailAddress: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
  });

export type ValidationErrors = Partial<Record<keyof EmailFormData, string>>;

export default function EmailSignUpScreen() {
  const emailRef = useRef<string>('');
  const passwordRef = useRef<string>('');
  const confirmPasswordRef = useRef<string>('');

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isValid, setIsValid] = useState<boolean>(false);

  const router = useRouter();
  const { signUp } = useSignUp();

  const keyboardVerticalOffset = Platform.OS === 'ios' ? 90 : 0;

  const validateInputs = () => {
    const data = {
      emailAddress: emailRef.current,
      password: passwordRef.current,
      confirmPassword: confirmPasswordRef.current,
    };

    const result = emailSchema.safeParse(data);

    if (result.success) {
      setErrors({});
      setIsValid(true);
    } else {
      const fieldErrors: ValidationErrors = {};
      result.error.errors.forEach(err => {
        const field = err.path[0] as keyof EmailFormData;
        fieldErrors[field] = err.message;
      });

      setErrors(fieldErrors);
      setIsValid(false);
    }
  };

  const onSignup = async () => {
    validateInputs();

    if (!isValid) {
      Alert.alert('Error', 'Please correct the errors in the form');
      return;
    }

    try {
      await signUp!.create({
        emailAddress: emailRef.current,
        password: passwordRef.current,
      });

      await signUp!.prepareVerification({
        strategy: 'email_code',
      });

      router.push({ pathname: '/verify/[identifier]', params: { identifier: emailRef.current, strategy: 'phone_code' } });
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
          <Text style={defaultStyles.header}>Register</Text>
          <Text style={defaultStyles.descriptionText}>Enter your email and password</Text>
          <View style={{ marginVertical: 25 }}>
            <TextInput
              style={styles.input}
              placeholder='Email'
              placeholderTextColor={Colors.light.gray}
              keyboardType='email-address'
              autoCapitalize='none'
              defaultValue={emailRef.current}
              onChangeText={text => {
                emailRef.current = text;
                validateInputs();
              }}
            />
            <TextInput
              style={styles.input}
              placeholder='Password'
              placeholderTextColor={Colors.light.gray}
              secureTextEntry
              defaultValue={passwordRef.current}
              onChangeText={text => {
                passwordRef.current = text;
                validateInputs();
              }}
            />
            <TextInput
              style={styles.input}
              placeholder='Confirm Password'
              placeholderTextColor={Colors.light.gray}
              secureTextEntry
              defaultValue={confirmPasswordRef.current}
              onChangeText={text => {
                confirmPasswordRef.current = text;
                validateInputs();
              }}
            />
            <View>
              <Text style={styles.errorText}>{errors.emailAddress ? errors.emailAddress : errors.password ? errors.password : errors.confirmPassword}</Text>
            </View>
          </View>
          <TouchableOpacity style={[defaultStyles.pillButton, isValid ? styles.enabled : styles.disabled, { marginBottom: 20 }]} onPress={onSignup}>
            <Text style={defaultStyles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: Colors.light.lightGray,
    padding: 20,
    borderRadius: 16,
    fontSize: 20,
    marginBottom: 10,
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

import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useState, useRef } from 'react';
import { defaultStyles } from '@/constants/Styles';
import Colors from '@/constants/Colors';
import { useSignIn, isClerkAPIResponseError } from '@clerk/clerk-expo';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';
import { useRouter } from 'expo-router';

export interface EmailFormData {
  emailAddress: string;
  password: string;
}

export const emailSchema = z.object({
  emailAddress: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type ValidationErrors = Partial<Record<keyof EmailFormData, string>>;

export default function EmailLoginScreen() {
  const emailRef = useRef<string>('');
  const passwordRef = useRef<string>('');

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isValid, setIsValid] = useState<boolean>(false);

  const router = useRouter();
  const { signIn } = useSignIn();

  const keyboardVerticalOffset = Platform.OS === 'ios' ? 90 : 0;

  const validateInputs = () => {
    const data = {
      emailAddress: emailRef.current,
      password: passwordRef.current,
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

  const onLogin = async () => {
    validateInputs();

    if (!isValid) {
      Alert.alert('Error', 'Please correct the errors in the form');
      return;
    }

    try {
      const { supportedFirstFactors } = await signIn!.create({
        identifier: emailRef.current,
      });

      const firstPhoneFactor: any = supportedFirstFactors!.find((factor: any) => factor.strategy === 'email_code');

      const { emailAddressId } = firstPhoneFactor;

      await signIn!.prepareFirstFactor({
        strategy: 'email_code',
        emailAddressId,
      });

      router.push({ pathname: '/verify/[identifier]', params: { identifier: emailRef.current, strategy: 'email_code', login: 'true' } });
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
          <Text style={defaultStyles.header}>Login</Text>
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

            <View>
              <Text style={styles.errorText}>{errors.emailAddress ? errors.emailAddress : errors.password}</Text>
            </View>
          </View>
          <TouchableOpacity style={[defaultStyles.pillButton, isValid ? styles.enabled : styles.disabled, { marginBottom: 20 }]} onPress={onLogin}>
            <Text style={defaultStyles.buttonText}>Log in</Text>
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

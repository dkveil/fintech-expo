import { View, Text, Alert, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { Fragment, useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { isClerkAPIResponseError, useSignUp } from '@clerk/clerk-expo';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field';
import { defaultStyles } from '@/constants/Styles';
import Colors from '@/constants/Colors';

const CELL_COUNT = 6;

export default function PhoneVerifyScreen() {
  const { phone, login } = useLocalSearchParams<{ phone: string; login: string }>();
  const [code, setCode] = useState<string>('');
  const { signUp, setActive } = useSignUp();

  const ref = useBlurOnFulfill({ value: code, cellCount: CELL_COUNT });
  const [props, getCellOnLayout] = useClearByFocusCell({
    value: code,
    setValue: setCode,
  });

  const keyboardVerticalOffset = Platform.OS === 'ios' ? 90 : 0;

  useEffect(() => {
    if (code.length === 6) {
      if (login === 'true') {
        verifyLogin();
        return;
      }
      verifyCode();
    }
  }, [code]); // eslint-disable-line react-hooks/exhaustive-deps

  const verifyCode = async () => {
    try {
      await signUp!.attemptVerification({
        strategy: 'phone_code',
        code,
      });
      await setActive!({
        session: signUp!.createdSessionId,
      });
    } catch (error) {
      if (isClerkAPIResponseError(error)) {
        Alert.alert('Error', error.errors[0].message);
        return;
      }

      console.error('Error verifying code:', error);
    }
  };

  const verifyLogin = async () => {};

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior='padding' keyboardVerticalOffset={keyboardVerticalOffset}>
      <SafeAreaView style={defaultStyles.container}>
        <Text style={defaultStyles.header}>6-digit code</Text>
        <Text style={defaultStyles.descriptionText}>Code sent to {phone} unless you already have an account</Text>
        <CodeField
          ref={ref}
          {...props}
          value={code}
          onChangeText={setCode}
          cellCount={CELL_COUNT}
          rootStyle={styles.codeFieldRoot}
          textContentType='oneTimeCode'
          renderCell={({ index, symbol, isFocused }) => (
            <Fragment key={index}>
              <View onLayout={getCellOnLayout(index)} style={[styles.cell, isFocused && styles.focusCell]}>
                <Text style={styles.cellText}>{symbol || (isFocused ? <Cursor /> : null)}</Text>
              </View>
              {index === 2 && <View key={`seperator-${index}`} style={styles.separator}></View>}
            </Fragment>
          )}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  codeFieldRoot: {
    marginTop: 20,
    marginLeft: 'auto',
    marginRight: 'auto',
    gap: 12,
  },
  cell: {
    width: 45,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: Colors.light.lightGray,
  },
  cellText: {
    color: '#000',
    fontSize: 36,
    textAlign: 'center',
  },
  focusCell: {
    borderColor: '#000',
  },
  separator: {
    height: 2,
    width: 10,
    backgroundColor: Colors.light.gray,
    alignSelf: 'center',
  },
});

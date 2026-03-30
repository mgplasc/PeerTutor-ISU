import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { forgotPassword } from '../services/authService';

type ForgotPasswordScreenProps = {
  navigation: {
    goBack: () => void;
    navigate: (screen: string) => void;
  };
};

type Step = 'email' | 'sent';

function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>('email');

  async function handleSubmit() {
    if (email === '') {
      Alert.alert('Missing Email', 'Please enter your @ilstu.edu email address.');
      return;
    }
    if (!email.endsWith('@ilstu.edu')) {
      Alert.alert('Invalid Email', 'You must use an @ilstu.edu email address.');
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      setStep('sent');
    } catch (err) {
      // Still show the success screen — don't reveal if email exists
      setStep('sent');
    }
    setLoading(false);
  }

  if (step === 'sent') {
    return (
      <View style={styles.screen}>
        <View style={styles.card}>
          <Text style={styles.checkmark}>✓</Text>
          <Text style={styles.title}>Check Your Email</Text>
          <Text style={styles.body}>
            If <Text style={styles.emailHighlight}>{email}</Text> is registered,
            you'll receive a password reset link shortly. The link expires in 1 hour.
          </Text>
          <Text style={styles.hint}>
            Don't see it? Check your spam folder.
          </Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={function() { navigation.goBack(); }}
          >
            <Text style={styles.primaryBtnText}>Back to Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.body}>
          Enter your @ilstu.edu email address and we'll send you a link to reset your password.
        </Text>

        <Text style={styles.fieldLabel}>ISU Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="you@ilstu.edu"
          placeholderTextColor={COLORS.darkGray}
          keyboardType="email-address"
          autoCapitalize="none"
          autoFocus={true}
        />

        {loading ? (
          <ActivityIndicator color={COLORS.red} style={styles.spinner} />
        ) : (
          <TouchableOpacity style={styles.primaryBtn} onPress={handleSubmit}>
            <Text style={styles.primaryBtnText}>Send Reset Link</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.backLink}
          onPress={function() { navigation.goBack(); }}
        >
          <Text style={styles.backLinkText}>Back to Log In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  checkmark: {
    fontSize: 48,
    color: COLORS.green,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.black,
    marginBottom: 12,
    textAlign: 'center',
  },
  body: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  emailHighlight: {
    fontWeight: '700',
    color: COLORS.black,
  },
  hint: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 6,
    marginTop: 4,
    alignSelf: 'flex-start',
    width: '100%',
  },
  input: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.black,
    borderWidth: 1,
    borderColor: COLORS.medGray,
    width: '100%',
    marginBottom: 4,
  },
  primaryBtn: {
    backgroundColor: COLORS.red,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    width: '100%',
    marginTop: 16,
  },
  primaryBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  backLink: {
    marginTop: 16,
    paddingVertical: 8,
  },
  backLinkText: {
    fontSize: 14,
    color: COLORS.red,
    fontWeight: '600',
  },
  spinner: {
    marginTop: 16,
  },
});

export default ForgotPasswordScreen;

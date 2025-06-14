import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CheckBox from 'react-native-check-box';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // ✅ 추가된 부분
import { globalStyles } from '../styles/globalStyles';

const SignUpScreen = () => {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  const handleSignUp = async () => {
    setIsLoading(true);
    if (!nickname || !email || !password || !confirmPassword || !isChecked) {
      Alert.alert('input error', 'Please check all input values');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password error', 'Passwords do not match.');
      setIsLoading(false);
      return;
    }

    // ✅ 패스워드 유효성 검사
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (password.length < 7) {
      Alert.alert('Password error', 'Password must be at least 7 characters long.');
      setIsLoading(false);
      return;
    }
    if (!specialCharRegex.test(password)) {
      Alert.alert('Password error', 'Password must contain at least one special character.');
      setIsLoading(false);
      return;
    }

    try {
      const signupRes = await axios.post('https://mycarering.loca.lt/signup', {
        nickname,
        email,
        password,
      });

      if (signupRes.status === 200) {
        const loginRes = await axios.post('https://mycarering.loca.lt/auth/login', {
          email,
          password,
        });

        const { access_token } = loginRes.data;
        await AsyncStorage.setItem('token', access_token);

        console.log("🎟️ Token after signup:", access_token);
        navigation.navigate('BasicInfo');
      }
    } catch (error: any) {
      const msg = error.response?.data?.detail || '';

      if (msg.includes('Email already exists')) {
        Alert.alert('Duplicate error', 'This email address is already in use.');
      } else if (msg.includes('Nickname already exists')) {
        Alert.alert('Duplicate error', 'This nickname is already in use.');
      } else {
        console.error('Signup/Login failed:', msg || error.message);
        Alert.alert('error', 'Sign up or auto login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={globalStyles.container} showsVerticalScrollIndicator={false}>
        <Text style={globalStyles.title}>Create Account</Text>
        <Text style={globalStyles.subtitle}>
          Fill your information below or register with your social account
        </Text>

        <View style={globalStyles.inputContainer}>
          <Text style={globalStyles.label}>Nickname</Text>
          <TextInput
            style={globalStyles.input}
            placeholder="Nickname"
            value={nickname}
            onChangeText={setNickname}
          />
        </View>

        <View style={globalStyles.inputContainer}>
          <Text style={globalStyles.label}>Email</Text>
          <TextInput
            style={globalStyles.input}
            placeholder="Email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={globalStyles.inputContainer}>
          <Text style={globalStyles.label}>Password</Text>
          <TextInput
            style={globalStyles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <View style={globalStyles.inputContainer}>
          <Text style={globalStyles.label}>Confirm Password</Text>
          <TextInput
            style={globalStyles.input}
            placeholder="Confirm Password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <CheckBox
            isChecked={isChecked}
            onClick={() => setIsChecked(!isChecked)}
          />
          <Text style={{ marginLeft: 8, color: '#4B5563' }}>
            Agree with <Text style={globalStyles.linkText}>Terms & Conditions</Text>
          </Text>
        </View>

        <TouchableOpacity style={globalStyles.button} onPress={handleSignUp}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={globalStyles.buttonText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        <View style={globalStyles.socialSignInContainer}>
          <View style={globalStyles.divider} />
          <Text style={globalStyles.socialSignInText}>Or sign Up with</Text>
          <View style={globalStyles.divider} />
        </View>

        <View style={globalStyles.socialButtonsContainer}>
          <TouchableOpacity>
            <Image source={require('../../assets/apple.png')} style={globalStyles.socialIcon} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image source={require('../../assets/google.png')} style={globalStyles.socialIcon} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image source={require('../../assets/facebook.png')} style={globalStyles.socialIcon} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={globalStyles.footerText}>
            Already have an account? <Text style={globalStyles.linkText}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUpScreen;
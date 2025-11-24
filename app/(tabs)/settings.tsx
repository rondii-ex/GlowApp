import AsyncStorage from '@react-native-async-storage/async-storage';

import React, { useEffect, useState } from 'react';

import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';


export default function SettingsPage() {

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const [darkMode, setDarkMode] = useState(false);

  const [reminders, setReminders] = useState(true);


  

  useEffect(() => {

    const loadSettings = async () => {

      const stored = await AsyncStorage.getItem('appSettings');

      if (stored) {

        const s = JSON.parse(stored);

        setNotificationsEnabled(s.notificationsEnabled);

        setDarkMode(s.darkMode);

        setReminders(s.reminders);

      }

    };

    loadSettings();

  }, []);


  const saveSettings = async () => {

    await AsyncStorage.setItem(

      'appSettings',

      JSON.stringify({ notificationsEnabled, darkMode, reminders })

    );

  };


  

  const styles = StyleSheet.create({

    container: { flex: 1, backgroundColor: darkMode ? '#000' : '#F4DCE7' },

    header: {

      fontSize: 32,

      fontWeight: '700',

      color: darkMode ? '#FFF' : '#8B4A62',

      textAlign: 'center',

      marginVertical: 20,

    },

    section: {

      backgroundColor: darkMode ? '#1A1A1A' : '#FFEFE4',

      padding: 22,

      borderRadius: 22,

      marginBottom: 20,

      width: '90%',

      alignSelf: 'center',

      flexDirection: 'row',

      justifyContent: 'space-between',

      alignItems: 'center',

    },

    label: { fontSize: 18, fontWeight: '600', color: darkMode ? '#FFF' : '#6A3A47' },

    button: {

      marginTop: 30,

      backgroundColor: darkMode ? '#333' : '#8B4A62',

      padding: 15,

      borderRadius: 25,

      width: '70%',

      alignSelf: 'center',

    },

    buttonText: { textAlign: 'center', color: '#FFF', fontSize: 18, fontWeight: 'bold' },

  });


  return (

    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>

      <Text style={styles.header}>Settings</Text>


      <View style={styles.section}>

        <Text style={styles.label}>Notifications</Text>

        <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />

      </View>


      <View style={styles.section}>

        <Text style={styles.label}>Dark Mode</Text>

        <Switch value={darkMode} onValueChange={setDarkMode} />

      </View>


      <View style={styles.section}>

        <Text style={styles.label}>Daily Reminders</Text>

        <Switch value={reminders} onValueChange={setReminders} />

      </View>


      <TouchableOpacity style={styles.button} onPress={saveSettings}>

        <Text style={styles.buttonText}>Save Changes</Text>

      </TouchableOpacity>

    </ScrollView>

  );

}

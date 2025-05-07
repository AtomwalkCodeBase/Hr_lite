// dbConfig.js
import AsyncStorage from '@react-native-async-storage/async-storage';

let db_name = null;

export const loadDbName = async () => {
  db_name = await AsyncStorage.getItem('dbName');
  console.log("Loaded db_name:", db_name);
};

export const getDbName = () => db_name;

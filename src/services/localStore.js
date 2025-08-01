import AsyncStorage from '@react-native-async-storage/async-storage';

export const persistData = async (token) => {
    await AsyncStorage.setItem('userToken', token);
  };

export const getData = async () => {
    let token = await AsyncStorage.getItem('userToken');
    return token;
};

export const checkToken = async () => {
  let token = await AsyncStorage.getItem('userToken');
  if (token){
      return true;
  };
  return false
};
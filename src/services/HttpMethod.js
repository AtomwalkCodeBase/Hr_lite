import axios from "axios";
// import { endpoint } from "../constants";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addEmpLeave, endpoint, getEmpLeavedata, newendpoint } from "../services/ConstantServies";

export const authAxios = async (url, data) => {
    let token = await AsyncStorage.getItem('userToken');
    return axios.create({
        baseURL: newendpoint,
        params: data,
        headers: {
            Authorization: `Token ${token}`
        }
    }).get(url)
};

export const authAxiosGET = async (url, data) => {
  // let token = await AsyncStorage.getItem('userToken');
  return axios.create({
      baseURL: newendpoint,
      params: data,
      // headers: {
      //     // Authorization: `Token ${token}`
      // }
  }).get(url)
};

export const authAxiosPost = async (url, data) => {
  let token = await AsyncStorage.getItem('userToken');
  return axios.create({
      baseURL: newendpoint,
      headers: {
          Authorization: `Token ${token}`
      }
  }).post(url, data)
};



export const authAxiosFilePost = async (url, data) => {
  let token = await AsyncStorage.getItem('userToken');

  // Check if the data is FormData
  if (!(data instanceof FormData)) {
    console.error('Data is not FormData!');
    return;
  }


  return axios.create({
          baseURL: newendpoint,
          headers: {
              Authorization: `Token ${token}`,
              'Content-Type': 'multipart/form-data',
          }
      }).post(url, data)

};


export const publicAxiosRequest = axios.create({
  baseURL: newendpoint,
});




export default {
  get: axios.get,
  post: axios.post,
  put: axios.put,
  delete: axios.delete,  
};

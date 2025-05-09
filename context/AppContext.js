import React, { createContext, useState, useEffect } from 'react';
import { publicAxiosRequest } from "../src/services/HttpMethod";
import { empLoginURL } from "../src/services/ConstantServies";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCompanyInfo } from '../src/services/authServices';
import { useRouter } from 'expo-router';
import NetInfo from '@react-native-community/netinfo';
import NetworkErrorModal from '../src/components/NetworkErrorModal';

const AppContext = createContext();

const AppProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [userToken, setUserToken] = useState(null);
    const [companyInfo, setCompanyInfo] = useState(null);
    const [dbName, setDbName] = useState(null);
    const [isConnected, setIsConnected] = useState(true);

    const router = useRouter();

    const checkNetwork = async () => {
        const netState = await NetInfo.fetch();
        setIsConnected(netState.isConnected);
        return netState.isConnected;
    };

    const onRetry = async () => {
        const networkStatus = await checkNetwork();
        if (networkStatus) {
            setIsConnected(true);
        }
    };
    
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected);
        });

        return () => unsubscribe();
    }, []);

    const login = async (username, password) => {
        setIsLoading(true);
        if (!isConnected) {
            setIsLoading(false);
            return;
        }

        try {
            // Determine if the input is a mobile number (10 digits) or employee ID
            const isMobileNumber = /^\d{10}$/.test(username);
            
            const payload = isMobileNumber 
                ? {
                    mobile_number: username,
                    pin: parseInt(password, 10),
                  }
                : {
                    emp_id: username,
                    pin: parseInt(password, 10),
                  };

            console.log('Sending payload:', payload);
          
            const url = await empLoginURL();
            const response = await publicAxiosRequest.post(url, payload, {
                headers: { 'Content-Type': 'application/json' },
            });
          
            console.log('API Response:', response);
          
            if (response.status === 200) {
                const { token, emp_id, e_id } = response.data;
              console.log('Token ====', e_id);
              await AsyncStorage.setItem('userToken', token);
              await AsyncStorage.setItem('empId', emp_id);
              await AsyncStorage.setItem('eId', String(e_id));
              await AsyncStorage.setItem('mobileNumber', username);
              await AsyncStorage.setItem('userPin', password);
                }

                router.replace({ pathname: 'home' });
        } catch (err) {
            console.log('Login error:', err);
          }
          
        // try {
        //     if (!username.includes("@")) {
        //         const userDetailResponse = await axios.get(`https://www.atomwalk.com/api/get_user_detail/?user_id=${username}`);
        //         username = userDetailResponse.data.username;
        //     }
        //     const res = await publicAxiosRequest.post(loginURL, { username, password });
        //     const userToken = res.data['key'];
        //     await AsyncStorage.multiSet([
        //         ['userToken', userToken],
        //         ['Password', password],
        //         ['username', username],
        //     ]);
        //     setUserToken(userToken);
        //     router.replace({ pathname: 'home' });
        // } catch (err) {
        //     console.log('Login error:', err);
        // }

        // try {
        //     const res = await getCompanyInfo();
        //     const companyInfo = res.data;
        //     const db_name = companyInfo.db_name.substr(3);
        //     await AsyncStorage.multiSet([
        //         ['companyInfo', JSON.stringify(companyInfo)],
        //         ['dbName', db_name],
        //     ]);
        //     setCompanyInfo(companyInfo);
        //     setDbName(db_name);
        // } catch (error) {
        //     console.log('Company Info Fetch Error:', error);
        // }

        setIsLoading(false);
    };

    const logout = () => {
        setIsLoading(true);
        AsyncStorage.removeItem('userToken');
        AsyncStorage.removeItem('companyInfo');
        // AsyncStorage.removeItem('dbName');
            setUserToken(null);
        setCompanyInfo([]);
        // setDbName(null);
            setIsLoading(false);
        // setError('')
        router.replace('AuthScreen');
    };

    const isLoggedIn = async () => {
            const networkStatus = await checkNetwork();
            if (!networkStatus) {
                return;
            }

        try {
            setIsLoading(true);
            const userToken = await AsyncStorage.getItem('userToken');
            if (!userToken) {
                router.replace('AuthScreen');
                return;
            }

            setUserToken(userToken);

            // Retrieve all stored data
            const [
                companyInfo,
                dbName,
                loginType,
                identifier
            ] = await Promise.all([
                AsyncStorage.getItem('companyInfo'),
                AsyncStorage.getItem('dbName'),
                AsyncStorage.getItem('loginType'),
                AsyncStorage.getItem(loginType === 'mobile' ? 'mobileNumber' : 'empId')
            ]);

            if (companyInfo) {
                setCompanyInfo(JSON.parse(companyInfo));
            }
            if (dbName) {
                setDbName(dbName);
            }
        } catch (e) {
            console.log('Login Status Error:', e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        isLoggedIn();
    }, []);

    return (
        <AppContext.Provider value={{
            login,
            logout,
            isLoading,
            userToken,
            companyInfo,
            dbName,
            isConnected,
            checkNetwork,
            setIsLoading
        }}>
            {children}
            <NetworkErrorModal 
                visible={!isConnected} 
                onRetry={onRetry} 
                onNetworkRestore={() => setIsConnected(true)} 
            />
        </AppContext.Provider>
    );
};

export { AppContext, AppProvider };
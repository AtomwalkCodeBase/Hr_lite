import React, { createContext, useState, useEffect } from 'react';
import { publicAxiosRequest } from "../src/services/HttpMethod";
import { empLoginURL } from "../src/services/ConstantServies";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getEmployeeInfo } from '../src/services/authServices';
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
    const [profile, setProfile] = useState({});
    const [reLoad, setReload] = useState(false);
    const [pisLoading, setPIsLoading] = useState(true);
    

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

//     useEffect(() => {
//     const fetchFingerprintSetting = async () => {
//         const value = await AsyncStorage.getItem('useFingerprint');
//         setIsFingerprint(value === 'true'); // optional: convert string to boolean
//     };

//     fetchFingerprintSetting();
// }, []);


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
                    pin: password,
                  }
                : {
                    emp_id: username,
                    pin: password,
                  };

            console.log("Login Payload---",payload)
            const url = await empLoginURL();
            const response = await publicAxiosRequest.post(url, payload, {
                headers: { 'Content-Type': 'application/json' },
            });
          
          
            if (response.status === 200) {
                const { token, emp_id, e_id } = response.data;
              await AsyncStorage.setItem('userToken', token);
              await AsyncStorage.setItem('empId', emp_id);
              await AsyncStorage.setItem('eId', String(e_id));
              await AsyncStorage.setItem('mobileNumber', username);
              await AsyncStorage.setItem('userPin', password);
                }
                setReload(true);

                router.replace({ pathname: 'home' });
        } catch (err) {
            console.log('Login error:', err);
          }

        setIsLoading(false);
    };

    // const logout = () => {
    //     setIsLoading(true);
    //     AsyncStorage.removeItem('userToken');
    //     AsyncStorage.removeItem('companyInfo');        
    //     // AsyncStorage.removeItem('dbName');
    //         setUserToken(null);
    //     setCompanyInfo([]);
    //     // setDbName(null);
    //         setIsLoading(false);
    //     // setError('')
    //     router.replace('AuthScreen');
    // };

   const logout = async () => {
  setIsLoading(true);
  
  try {
    // Navigate first to prevent any API calls from Home screen
    router.replace('AuthScreen');
    
    // Then clear storage and state
    await AsyncStorage.multiRemove([
      'userToken',
    //   'eId',
    //   'mobileNumber',
    //   'userPin',
    //   'empId'
    ]);

    setUserToken(null);
    setProfile({});
    setReload(false);
    console.log("1")
  } catch (err) {
    console.log("Logout error:", err);
  } finally {
    setIsLoading(false);
  }
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

    useEffect(() => {
          if(reLoad){
    const fetchProfile = async () => {
    try {
      const res = await getEmployeeInfo();
      setProfile(res?.data[0]);
      router.replace({ pathname: 'home' });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setPIsLoading(false);
    }
    };
      fetchProfile();
}
}, [reLoad]);

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
            setIsLoading,
            profile,
            setReload,
            pisLoading
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
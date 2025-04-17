import Toast from 'react-native-toast-message';

const ToastMsg = (
    message1,
    message2='',
    msgType='success') => {
  
    Toast.show({
        type: msgType,
        text1: message1,
        text2: message2
    });
}

export default ToastMsg
import {React} from 'react';
import {TouchableOpacity, View, Text} from 'react-native';
import {colors} from '../../Styles/appStyle';
import { MaterialIcons } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';


const NewButton = ({title, icon, onPress = () => {}}) => {
  return (
    <View style={{flexDirection: 'row'}}>
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        height: 55,
        width: '100%',
        backgroundColor: '#4491FE',
        marginVertical: 20,
        justifyContent: 'center',
        flexDirection:'row',
        alignItems: 'center',
        borderRadius: 6,
      }}>
       <Ionicons name="bag-check" size={24} color="white"/>
      {icon && (
            <MaterialIcons name={icon} size={30} color={(icon=='delete')? colors.white: colors.black} />
      )}  
      <Text style={{color: colors.white, fontWeight: 'bold', marginLeft: 5, fontSize: 18}}>
        {title}
      </Text>
    </TouchableOpacity>
    </View>
  );
};

export default NewButton;
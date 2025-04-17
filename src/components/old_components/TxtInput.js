import {React, useState} from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import { colors } from '../../Styles/appStyle';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
const TxtInput = ({
  label,
  iconName,
  error,
  password,
  onFocus = () => {},
  ...props
}) => {
  const [hidePassword, setHidePassword] = useState(password);
  const [isFocused, setIsFocused] = useState(false);
  return (
    <View style={{marginBottom: 10}}>
      {label && (
        <Text style={style.label}>{label}</Text>
      )}  
      
      <View
        style={[
          style.inputContainer,
          {
            borderColor: error
              ? colors.red
              : isFocused
              ? colors.darkBlue
              : colors.light,
            alignItems: 'center',
          },
        ]}>
        <Icon
          name={iconName}
          style={{color: colors.darkBlue, fontSize: 22, marginRight: 10}}
        />
        <TextInput
          autoCorrect={false}
          onFocus={() => {
            onFocus();
            setIsFocused(true);
          }}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={hidePassword}
          style={{color: colors.navyblue, flex: 1, fontSize: 16}}
          {...props}
        />
        {password && (
          <Icon
            onPress={() => setHidePassword(!hidePassword)}
            name={hidePassword ? 'eye-outline' : 'eye-off-outline'}
            style={{color: colors.darkBlue, fontSize: 22}}
          />
        )}
      </View>
      {error && (
        <Text style={{marginTop: 7, color: colors.red, fontSize: 12}}>
          {error}
        </Text>
      )}
    </View>
  );
};

const style = StyleSheet.create({
  label: {
    marginVertical: 3,
    fontSize: 15,
    fontWeight: '400',
    marginLeft: 5,
    color: colors.black,
  },
  inputContainer: {
    height: 50,
    width: '100%',
    backgroundColor: colors.light,
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderWidth: 0,
    borderRadius: 8,
    borderColor: colors.grey,
  },
});

export default TxtInput;
import {View } from 'react-native'
import { useRoute } from '@react-navigation/native';
import EventDetailsScreen from '../../src/screens/EventDetailsScreen';
const index = () => {
  const route = useRoute();
  const event_data = route?.params

  return (
    <View style={{ flex: 1,
        
        }}>
            <EventDetailsScreen event_data={event_data} />
    </View>
  )
}

export default index
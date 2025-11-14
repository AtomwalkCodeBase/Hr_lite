import { StyleSheet, View } from 'react-native';
import ManagerDashboard from '../../src/screens/ManagerDashboard';

const Index = () => {
  return (
    <View style={styles.container}>
      <ManagerDashboard />
    </View>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

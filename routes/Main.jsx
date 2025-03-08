import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from "./StackNavigator";
const Main = () => {
  return (
    <NavigationContainer>
      <StackNavigator />
    </NavigationContainer>
  );
};

export default Main;

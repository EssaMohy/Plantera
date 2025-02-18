import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const SearchBar = (props) => {
  return (
    <View style={styles.container}>
      <Ionicons
        name="search-outline"
        size={20}
        color="#A0A0A0"
        style={styles.icon}
      />
      <TextInput
        style={styles.input}
        placeholder={props.name}
        placeholderTextColor="#A0A0A0"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    borderWidth: 0.4,
    paddingHorizontal: 15,
    height: 50,
    marginVertical: 10,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
});

export default SearchBar;

import { StatusBar, StyleSheet, Text, View } from "react-native";
import React from "react";
import Home from "../screens/Home";

const index = () => {
  return (
    <>
      <Home />
      <StatusBar barStyle={"dark-content"} />
    </>
  );
};

export default index;

const styles = StyleSheet.create({});

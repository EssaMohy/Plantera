import React from "react";
import { View, Text, Image, ScrollView, StyleSheet } from "react-native";
import { DETAILED_ARTICLES } from "../data/detailedData";

const ArticleDetailsScreen = ({ route }) => {

  if (!route.params?.articleId) {
    return <Text style={styles.errorText}>No article selected.</Text>; // Handle missing ID
  }

  const { articleId } = route.params;
  const article = DETAILED_ARTICLES[articleId];

  if (!article) {
    return <Text style={styles.errorText}>Article not found.</Text>; // Handle invalid ID
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: article.image }} style={styles.mainImage} />
      <Text style={styles.title}>{article.title}</Text>

      {article.content.map((section, index) => {
        if (section.type === "paragraph") {
          return <Text key={index} style={styles.paragraph}>{section.text}</Text>;
        }
        if (section.type === "header") {
          return <Text key={index} style={styles.header}>{section.text}</Text>;
        }
        if (section.type === "bullet") {
          return <Text key={index} style={styles.bullet}>• {section.text}</Text>;
        }
        if (section.type === "image") {
          return <Image key={index} source={{ uri: section.url }} style={styles.sectionImage} />;
        }
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 15, backgroundColor: "#fff" },
  mainImage: { width: "100%", height: 200, borderRadius: 10, marginBottom: 10 },
  sectionImage: { width: "100%", height: 150, borderRadius: 10, marginVertical: 10 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  paragraph: { fontSize: 16, marginBottom: 10, lineHeight: 24 },
  header: { fontSize: 18, fontWeight: "bold", marginTop: 15, marginBottom: 5, color: "#228B22" },
  bullet: { fontSize: 16, marginBottom: 5, paddingLeft: 10 },
  errorText: { textAlign: "center", fontSize: 18, color: "red", marginTop: 20 },
});

export default ArticleDetailsScreen;

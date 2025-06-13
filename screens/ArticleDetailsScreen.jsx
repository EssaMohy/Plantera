// import React from "react";
// import { View, Text, Image, ScrollView, StyleSheet } from "react-native";
// import { DETAILED_ARTICLES } from "../data/detailedData";

// const ArticleDetailsScreen = ({ route }) => {
//   if (!route.params?.articleId) {
//     return <Text style={styles.errorText}>No article selected.</Text>; // Handle missing ID
//   }

//   const { articleId } = route.params;
//   const article = DETAILED_ARTICLES[articleId];

//   if (!article) {
//     return <Text style={styles.errorText}>Article not found.</Text>; // Handle invalid ID
//   }

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Image source={{ uri: article.image }} style={styles.mainImage} />
//       <Text style={styles.title}>{article.title}</Text>

//       {article.content.map((section, index) => {
//         if (section.type === "paragraph") {
//           return (
//             <Text key={index} style={styles.paragraph}>
//               {section.text}
//             </Text>
//           );
//         }
//         if (section.type === "header") {
//           return (
//             <Text key={index} style={styles.header}>
//               {section.text}
//             </Text>
//           );
//         }
//         if (section.type === "bullet") {
//           return (
//             <Text key={index} style={styles.bullet}>
//               • {section.text}
//             </Text>
//           );
//         }
//         if (section.type === "image") {
//           return (
//             <Image
//               key={index}
//               source={{ uri: section.url }}
//               style={styles.sectionImage}
//             />
//           );
//         }
//       })}
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flexGrow: 1, padding: 15, backgroundColor: "#fff" },
//   mainImage: { width: "100%", height: 200, borderRadius: 10, marginBottom: 10 },
//   sectionImage: {
//     width: "100%",
//     height: 150,
//     borderRadius: 10,
//     marginVertical: 10,
//   },
//   title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
//   paragraph: { fontSize: 16, marginBottom: 10, lineHeight: 24 },
//   header: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginTop: 15,
//     marginBottom: 5,
//     color: "#2E7D32",
//   },
//   bullet: { fontSize: 16, marginBottom: 5, paddingLeft: 10 },
//   errorText: { textAlign: "center", fontSize: 18, color: "red", marginTop: 20 },
// });

// export default ArticleDetailsScreen;
// import React from "react";
// import { View, Text, Image, ScrollView, StyleSheet } from "react-native";
// import { DETAILED_ARTICLES } from "../data/detailedData";

// const ArticleDetailsScreen = ({ route }) => {
//   if (!route.params?.articleId) {
//     return <Text style={styles.errorText}>No article selected.</Text>;
//   }

//   const { articleId } = route.params;
//   const article = DETAILED_ARTICLES[articleId];

//   if (!article) {
//     return <Text style={styles.errorText}>Article not found.</Text>;
//   }

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Image source={{ uri: article.image }} style={styles.mainImage} />
//       <Text style={styles.title}>{article.title}</Text>

//       {article.content.map((section, index) => {
//         if (section.type === "paragraph") {
//           return (
//             <Text key={index} style={styles.paragraph}>
//               {section.text}
//             </Text>
//           );
//         }
//         if (section.type === "header") {
//           return (
//             <Text key={index} style={styles.header}>
//               {section.text}
//             </Text>
//           );
//         }
//         if (section.type === "bullet") {
//           return (
//             <Text key={index} style={styles.bullet}>
//               • {section.text}
//             </Text>
//           );
//         }
//         if (section.type === "image") {
//           return (
//             <Image
//               key={index}
//               source={{ uri: section.url }}
//               style={styles.sectionImage}
//             />
//           );
//         }
//       })}
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     padding: 20,
//     backgroundColor: "#F0F4EF", // خلفية خضراء فاتحة مريحة
//   },

//   mainImage: {
//     width: "100%",
//     height: 220,
//     borderRadius: 15,
//     marginBottom: 20,
//   },

//   sectionImage: {
//     width: "100%",
//     height: 180,
//     borderRadius: 15,
//     marginVertical: 15,
//   },

//   title: {
//     fontSize: 28,
//     fontWeight: "bold",
//     marginBottom: 20,
//     color: "#2E7D32", // أخضر جذاب
//     fontFamily: "Cairo-Bold",
//     textAlign: "center",
//     textShadowColor: "#C8E6C9",
//     textShadowOffset: { width: 1, height: 1 },
//     textShadowRadius: 2,
//   },

//   paragraph: {
//     fontSize: 18,
//     marginBottom: 15,
//     lineHeight: 28,
//     color: "#333",
//     fontFamily: "Cairo-Regular",
//     textAlign: "justify",
//     backgroundColor: "#FFFFFF",
//     padding: 12,
//     borderRadius: 10,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 2,
//   },

//   header: {
//     fontSize: 22,
//     fontWeight: "bold",
//     marginTop: 20,
//     marginBottom: 10,
//     color: "#388E3C", // أخضر غامق
//     fontFamily: "Cairo-Bold",
//     borderBottomWidth: 2,
//     borderBottomColor: "#AED581",
//     paddingBottom: 5,
//   },

//   bullet: {
//     fontSize: 17,
//     marginBottom: 8,
//     paddingLeft: 15,
//     color: "#4E342E",
//     fontFamily: "Cairo-Regular",
//   },

//   bulletIcon: {
//     fontSize: 18,
//     marginRight: 8,
//     color: "#81C784",
//   },

//   bulletRow: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     marginBottom: 8,
//   },

//   errorText: {
//     textAlign: "center",
//     fontSize: 18,
//     color: "red",
//     marginTop: 20,
//   },
// });
// export default ArticleDetailsScreen;
// import React from "react";
// import { View, Text, Image, ScrollView, StyleSheet } from "react-native";
// import { DETAILED_ARTICLES } from "../data/detailedData";

// const ArticleDetailsScreen = ({ route }) => {
//   if (!route.params?.articleId) {
//     return <Text style={styles.errorText}>No article selected.</Text>;
//   }

//   const { articleId } = route.params;
//   const article = DETAILED_ARTICLES[articleId];

//   if (!article) {
//     return <Text style={styles.errorText}>Article not found.</Text>;
//   }

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Image source={{ uri: article.image }} style={styles.mainImage} />
//       <Text style={styles.title}>{article.title}</Text>

//       {article.content.map((section, index) => {
//         if (section.type === "paragraph") {
//           return (
//             <Text key={index} style={styles.paragraph}>
//               {section.text}
//             </Text>
//           );
//         }
//         if (section.type === "header") {
//           return (
//             <Text key={index} style={styles.header}>
//               {section.text}
//             </Text>
//           );
//         }
//         if (section.type === "bullet") {
//           return (
//             <View key={index} style={styles.bulletCard}>
//               <View style={styles.bulletRow}>
//                 <Text style={styles.bulletIcon}>•</Text>
//                 <Text style={styles.bulletText}>{section.text}</Text>
//               </View>
//             </View>
//           );
//         }
//         if (section.type === "image") {
//           return (
//             <Image
//               key={index}
//               source={{ uri: section.url }}
//               style={styles.sectionImage}
//             />
//           );
//         }
//       })}
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     padding: 20,
//     backgroundColor: "#F0F4EF",
//   },
//   mainImage: {
//     width: "100%",
//     height: 220,
//     borderRadius: 15,
//     marginBottom: 20,
//   },
//   sectionImage: {
//     width: "100%",
//     height: 180,
//     borderRadius: 15,
//     marginVertical: 15,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: "bold",
//     marginBottom: 20,
//     color: "#2E7D32",
//     fontFamily: "Cairo-Bold",
//     textAlign: "center",
//     textShadowColor: "#C8E6C9",
//     textShadowOffset: { width: 1, height: 1 },
//     textShadowRadius: 2,
//   },
//   paragraph: {
//     fontSize: 18,
//     marginBottom: 15,
//     lineHeight: 28,
//     color: "#333",
//     fontFamily: "Cairo-Regular",
//     textAlign: "justify",
//     backgroundColor: "#FFFFFF",
//     padding: 12,
//     borderRadius: 10,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   header: {
//     fontSize: 22,
//     fontWeight: "bold",
//     marginTop: 20,
//     marginBottom: 10,
//     color: "#388E3C",
//     fontFamily: "Cairo-Bold",
//     borderBottomWidth: 2,
//     borderBottomColor: "#AED581",
//     paddingBottom: 5,
//   },
//   bulletCard: {
//      backgroundColor: "#E8F5E9",
//     borderRadius: 12,
//     padding: 10,
//     marginBottom: 10,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   bulletRow: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//   },
//   bulletIcon: {
//     fontSize: 20,
//     marginRight: 10,
//     color: "#66BB6A",
//     marginTop: 3,
//   },
//   bulletText: {
//     fontSize: 17,
//     color: "#333",
//     fontFamily: "Cairo-Regular",
//     flexShrink: 1,
//   },
//   errorText: {
//     textAlign: "center",
//     fontSize: 18,
//     color: "red",
//     marginTop: 20,
//   },
// });

// export default ArticleDetailsScreen;
import React from "react";
import { View, Text, Image, ScrollView, StyleSheet } from "react-native";
import { DETAILED_ARTICLES } from "../data/detailedData";

const ArticleDetailsScreen = ({ route }) => {
  if (!route.params?.articleId) {
    return <Text style={styles.errorText}>No article selected.</Text>;
  }

  const { articleId } = route.params;
  const article = DETAILED_ARTICLES[articleId];

  if (!article) {
    return <Text style={styles.errorText}>Article not found.</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={{ uri: article.image }}
        style={styles.mainImage}
        resizeMode="contain"
      />
      <Text style={styles.title}>{article.title}</Text>

      {article.content.map((section, index) => {
        if (section.type === "paragraph") {
          return (
            <Text key={index} style={styles.paragraph}>
              {section.text}
            </Text>
          );
        }
        if (section.type === "header") {
          return (
            <Text key={index} style={styles.header}>
              {section.text}
            </Text>
          );
        }
        if (section.type === "bullet") {
          return (
            <View key={index} style={styles.bulletCard}>
              <View style={styles.bulletRow}>
                <Text style={styles.bulletIcon}>•</Text>
                <Text style={styles.bulletText}>{section.text}</Text>
              </View>
            </View>
          );
        }
        if (section.type === "image") {
          return (
            <Image
              key={index}
              source={{ uri: section.url }}
              style={styles.sectionImage}
              resizeMode="contain"
            />
          );
        }
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#F0F4EF",
  },
  mainImage: {
    width: "100%",
    height: 300,
    borderRadius: 15,
    marginBottom: 20,
  },
  sectionImage: {
    width: "100%",
    height: 250,
    borderRadius: 15,
    marginVertical: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#2E7D32",
    fontFamily: "Cairo-Bold",
    textAlign: "center",
    textShadowColor: "#C8E6C9",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  paragraph: {
    fontSize: 18,
    marginBottom: 15,
    lineHeight: 28,
    color: "#333",
    fontFamily: "Cairo-Regular",
    textAlign: "justify",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "#388E3C",
    fontFamily: "Cairo-Bold",
    borderBottomWidth: 2,
    borderBottomColor: "#AED581",
    paddingBottom: 5,
  },
  bulletCard: {
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  bulletIcon: {
    fontSize: 20,
    marginRight: 10,
    color: "#66BB6A",
    marginTop: 3,
  },
  bulletText: {
    fontSize: 17,
    color: "#333",
    fontFamily: "Cairo-Regular",
    flexShrink: 1,
  },
  errorText: {
    textAlign: "center",
    fontSize: 18,
    color: "red",
    marginTop: 20,
  },
});

export default ArticleDetailsScreen;

import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { useAuth } from "../hooks/useAuth";
import { usePostComments } from "../hooks/community";

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

const initials = (firstName, lastName) =>
  `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();

const PostDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { post } = route.params;
  const { userInfo } = useAuth();
  const {
    comments,
    meta,
    isLoading,
    isLoadingMore,
    error,
    loadMore,
    addComment,
    deleteComment,
  } = usePostComments(post.id);

  const [commentText, setCommentText] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    const content = commentText.trim();
    if (!content) return;
    setSending(true);
    try {
      await addComment(content);
      setCommentText("");
    } catch (err) {
      Alert.alert("Error", err.message || "Could not add comment.");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = (commentId) => {
    Alert.alert("Delete Comment", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteComment(commentId).catch(() => {}),
      },
    ]);
  };

  const renderPostHeader = () => (
    <View style={styles.postCard}>
      <View style={styles.authorRow}>
        {post.author.avatarUrl ? (
          <Image
            source={{ uri: post.author.avatarUrl }}
            style={styles.avatar}
          />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarInitials}>
              {initials(post.author.firstName, post.author.lastName)}
            </Text>
          </View>
        )}
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text style={styles.authorName}>
            {post.author.firstName} {post.author.lastName}
          </Text>
          <Text style={styles.postMeta}>
            @{post.author.userName} · {timeAgo(post.createdAt)}
          </Text>
        </View>
      </View>

      {post.title && post.title !== "Untitled" && (
        <Text style={styles.postTitle}>{post.title}</Text>
      )}
      {!!post.content && <Text style={styles.postContent}>{post.content}</Text>}
      {post.imageUrl && (
        <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
      )}

      <Text style={styles.commentsHeading}>
        {post.commentCount} {post.commentCount === 1 ? "Comment" : "Comments"}
      </Text>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );

  const renderComment = ({ item }) => (
    <View style={styles.commentCard}>
      {item.author.avatarUrl ? (
        <Image
          source={{ uri: item.author.avatarUrl }}
          style={styles.commentAvatar}
        />
      ) : (
        <View style={[styles.commentAvatar, styles.avatarFallback]}>
          <Text style={styles.commentAvatarInitials}>
            {initials(item.author.firstName, item.author.lastName)}
          </Text>
        </View>
      )}
      <View style={{ flex: 1, marginLeft: 10 }}>
        <View style={styles.commentHeaderRow}>
          <Text style={styles.commentAuthor}>
            {item.author.firstName} {item.author.lastName}
          </Text>
          <Text style={styles.commentTime}>{timeAgo(item.createdAt)}</Text>
        </View>
        <Text style={styles.commentText}>{item.content}</Text>
      </View>
      {userInfo && item.author.id === userInfo.id && (
        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          style={{ padding: 4 }}
        >
          <Icon name="trash-outline" size={16} color="#BBB" />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderFooter = () => {
    if (isLoading && comments.length === 0) {
      return (
        <View style={{ paddingVertical: 20 }}>
          <ActivityIndicator size="small" color="#2E7D32" />
        </View>
      );
    }
    if (!meta.hasMore) return null;
    return (
      <TouchableOpacity
        style={styles.loadMoreButton}
        onPress={loadMore}
        disabled={isLoadingMore}
      >
        {isLoadingMore ? (
          <ActivityIndicator size="small" color="#2E7D32" />
        ) : (
          <Text style={styles.loadMoreText}>Load more comments</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="chevron-back" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        <View style={{ width: 32 }} />
      </View>

      <FlatList
        data={comments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderComment}
        ListHeaderComponent={renderPostHeader}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContainer}
      />

      <View style={styles.composerRow}>
        {userInfo?.avatar ? (
          <Image
            source={{ uri: userInfo.avatar }}
            style={styles.commentAvatar}
          />
        ) : (
          <View style={[styles.commentAvatar, styles.avatarFallback]}>
            <Text style={styles.commentAvatarInitials}>
              {initials(userInfo?.firstName, userInfo?.lastName)}
            </Text>
          </View>
        )}
        <TextInput
          value={commentText}
          onChangeText={setCommentText}
          placeholder="Write a comment..."
          style={styles.commentInput}
          multiline
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!commentText.trim() || sending}
          style={styles.sendButton}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#2E7D32" />
          ) : (
            <Icon
              name="send"
              size={18}
              color={commentText.trim() ? "#2E7D32" : "#CCC"}
            />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7F5" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: "#FFFFFF",
  },
  backButton: { padding: 6 },
  headerTitle: { fontSize: 16, fontWeight: "700", color: "#222" },
  listContainer: { padding: 16, paddingBottom: 20 },
  postCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  authorRow: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E0E0E0",
  },
  avatarFallback: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
  },
  avatarInitials: { color: "#2E7D32", fontWeight: "700", fontSize: 15 },
  authorName: { fontSize: 14, fontWeight: "700", color: "#222" },
  postMeta: { fontSize: 12, color: "#999", marginTop: 1 },
  postTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1a1a1a",
    marginTop: 14,
  },
  postContent: { fontSize: 14, color: "#444", marginTop: 8, lineHeight: 20 },
  postImage: {
    width: "100%",
    height: 220,
    borderRadius: 14,
    marginTop: 12,
    backgroundColor: "#F0F0F0",
  },
  commentsHeading: {
    fontSize: 13,
    fontWeight: "700",
    color: "#888",
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  errorBanner: {
    backgroundColor: "#FFEBEE",
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  errorText: { color: "#D32F2F", fontSize: 12 },
  commentCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E0E0E0",
  },
  commentAvatarInitials: { color: "#2E7D32", fontWeight: "700", fontSize: 11 },
  commentHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  commentAuthor: { fontSize: 13, fontWeight: "700", color: "#222" },
  commentTime: { fontSize: 11, color: "#AAA" },
  commentText: { fontSize: 13, color: "#444", marginTop: 3, lineHeight: 18 },
  loadMoreButton: {
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#2E7D32",
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginVertical: 8,
  },
  loadMoreText: { color: "#2E7D32", fontWeight: "600", fontSize: 13 },
  composerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },
  commentInput: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    maxHeight: 100,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default PostDetailScreen;

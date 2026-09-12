import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../hooks/useAuth";
import { useCommunityPosts } from "../hooks/community";
import { useFollowGraph } from "../hooks/useFollowGraph";
import CommunityPostCard from "../components/CommunityPostCard";

const TABS = [
  { key: "all", label: "All Posts", icon: "grid-outline" },
  { key: "mine", label: "My Posts", icon: "person-circle-outline" },
  { key: "following", label: "Following", icon: "people-outline" },
];

/**
 * PostComposer owns its own title/content/imageUri state.
 * Keeping this state local (instead of in CommunityScreen) means typing
 * a letter only re-renders this small component, not the whole screen
 * (and therefore not the FlatList's ListHeaderComponent). That's what
 * was causing the keyboard to close on every keystroke: the header was
 * being recreated as a "new" component and remounted, which unmounts
 * the focused TextInput.
 */
const PostComposer = React.memo(({ onSubmit }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [posting, setPosting] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission Required", "We need access to your photos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const handleCreatePost = async () => {
    if (!title.trim() && !content.trim()) return;
    setPosting(true);
    try {
      await onSubmit({ title, content, imageUri });
      setTitle("");
      setContent("");
      setImageUri(null);
    } catch (err) {
      Alert.alert("Error", err.message || "Could not create post.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <View style={styles.composerCard}>
      <Text style={styles.composerTitle}>Create Post</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Post title..."
        style={styles.titleInput}
      />
      <TextInput
        value={content}
        onChangeText={setContent}
        placeholder="Share your plant experience..."
        multiline
        style={styles.contentInput}
      />

      {imageUri && (
        <View style={styles.imagePreviewWrapper}>
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          <TouchableOpacity
            style={styles.removeImageButton}
            onPress={() => setImageUri(null)}
          >
            <Icon name="close" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.composerActionsRow}>
        <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
          <Icon name="image-outline" size={18} color="#2E7D32" />
          <Text style={styles.addPhotoText}>Add Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.postButton}
          onPress={handleCreatePost}
          disabled={posting || (!title.trim() && !content.trim())}
        >
          {posting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Icon name="send" size={16} color="#FFFFFF" />
          )}
          <Text style={styles.postButtonText}>Post</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

/**
 * CommunityTabs is also split out and memoized so that switching tabs
 * (which changes activeTab, owned by the parent) doesn't need to touch
 * the composer, and vice versa.
 */
const CommunityTabs = React.memo(({ activeTab, onChangeTab }) => (
  <View style={styles.tabsRow}>
    {TABS.map((tab) => (
      <TouchableOpacity
        key={tab.key}
        style={[
          styles.tabButton,
          activeTab === tab.key && styles.tabButtonActive,
        ]}
        onPress={() => onChangeTab(tab.key)}
      >
        <Icon
          name={tab.icon}
          size={15}
          color={activeTab === tab.key ? "#FFFFFF" : "#777"}
        />
        <Text
          style={[
            styles.tabButtonText,
            activeTab === tab.key && styles.tabButtonTextActive,
          ]}
        >
          {tab.label}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
));

const CommunityScreen = () => {
  const navigation = useNavigation();
  const { userInfo } = useAuth();
  const {
    posts,
    meta,
    isLoading,
    isLoadingMore,
    error,
    refresh,
    loadMore,
    createPost,
    updatePost,
    deletePost,
    toggleLike,
  } = useCommunityPosts();
  const { followingIds, toggleFollow } = useFollowGraph(userInfo?.id);

  const [activeTab, setActiveTab] = useState("all");

  const displayedPosts = useMemo(() => {
    if (activeTab === "mine") {
      return userInfo ? posts.filter((p) => p.author.id === userInfo.id) : [];
    }
    if (activeTab === "following") {
      return posts.filter((p) => followingIds.has(p.author.id));
    }
    return posts;
  }, [activeTab, posts, userInfo, followingIds]);

  const handleUpdate = async (postId, payload) => {
    await updatePost(postId, payload);
  };

  const handleDelete = async (postId) => {
    try {
      await deletePost(postId);
    } catch (err) {
      Alert.alert("Error", err.message || "Could not delete post.");
    }
  };

  const renderHeader = () => (
    <View>
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <PostComposer onSubmit={createPost} />

      <CommunityTabs activeTab={activeTab} onChangeTab={setActiveTab} />
    </View>
  );

  const renderEmpty = () => {
    if (isLoading) return null;
    const copy =
      activeTab === "mine"
        ? {
            title: "You haven't posted anything yet",
            sub: "Share something above and it'll show up here.",
          }
        : activeTab === "following"
          ? {
              title: "You're not following anyone yet",
              sub: "Follow someone from their post to see it here.",
            }
          : {
              title: "No posts yet",
              sub: "Be the first to share something with the community!",
            };

    return (
      <View style={styles.emptyState}>
        <Icon name="leaf-outline" size={48} color="#C8E6C9" />
        <Text style={styles.emptyTitle}>{copy.title}</Text>
        <Text style={styles.emptySubtitle}>{copy.sub}</Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (activeTab !== "all" || !meta.hasMore) return null;
    return (
      <TouchableOpacity
        style={styles.loadMoreButton}
        onPress={loadMore}
        disabled={isLoadingMore}
      >
        {isLoadingMore ? (
          <ActivityIndicator size="small" color="#2E7D32" />
        ) : (
          <Text style={styles.loadMoreText}>Load more posts</Text>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={displayedPosts}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <CommunityPostCard
          post={item}
          currentUserId={userInfo?.id}
          isFollowing={followingIds.has(item.author.id)}
          onToggleFollow={toggleFollow}
          onToggleLike={toggleLike}
          onPressComments={(post) =>
            navigation.navigate("PostDetail", { post })
          }
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmpty}
      ListFooterComponent={renderFooter}
      contentContainerStyle={styles.listContainer}
      refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} />}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7F5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  errorBanner: {
    backgroundColor: "#FFEBEE",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 13,
  },
  composerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  composerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#222",
    marginBottom: 12,
  },
  titleInput: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
  },
  contentInput: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: "top",
  },
  imagePreviewWrapper: {
    marginTop: 12,
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: 180,
    borderRadius: 14,
    backgroundColor: "#F0F0F0",
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 14,
    padding: 6,
  },
  composerActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
  },
  addPhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  addPhotoText: {
    color: "#2E7D32",
    fontWeight: "600",
    fontSize: 13,
  },
  postButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#2E7D32",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  postButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  tabsRow: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 5,
    gap: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 9,
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: "#2E7D32",
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#777",
  },
  tabButtonTextActive: {
    color: "#FFFFFF",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#444",
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#888",
    marginTop: 4,
    textAlign: "center",
    paddingHorizontal: 30,
  },
  loadMoreButton: {
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#2E7D32",
    borderRadius: 18,
    paddingVertical: 9,
    paddingHorizontal: 20,
    marginTop: 4,
  },
  loadMoreText: {
    color: "#2E7D32",
    fontWeight: "600",
    fontSize: 13,
  },
});

export default CommunityScreen;

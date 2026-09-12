import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

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

const CommunityPostCard = ({
  post,
  currentUserId,
  isFollowing,
  onToggleFollow,
  onToggleLike,
  onPressComments,
  onUpdate,
  onDelete,
  onPressAuthor,
}) => {
  const isOwnPost = currentUserId != null && post.author.id === currentUserId;
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(
    post.title === "Untitled" ? "" : post.title,
  );
  const [editContent, setEditContent] = useState(post.content);
  const [savingEdit, setSavingEdit] = useState(false);

  const startEdit = () => {
    setEditTitle(post.title === "Untitled" ? "" : post.title);
    setEditContent(post.content);
    setIsEditing(true);
  };

  const saveEdit = async () => {
    if (!editTitle.trim() && !editContent.trim()) return;
    setSavingEdit(true);
    try {
      await onUpdate(post.id, { title: editTitle, content: editContent });
      setIsEditing(false);
    } catch (err) {
      Alert.alert("Error", err.message || "Could not update post.");
    } finally {
      setSavingEdit(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert("Delete Post", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => onDelete(post.id),
      },
    ]);
  };

  return (
    <View style={styles.card}>
      <View style={styles.authorRow}>
        <TouchableOpacity onPress={() => onPressAuthor?.(post.author)}>
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
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.authorInfo}
          onPress={() => onPressAuthor?.(post.author)}
        >
          <Text style={styles.authorName} numberOfLines={1}>
            {post.author.firstName} {post.author.lastName}
          </Text>
          <Text style={styles.postMeta} numberOfLines={1}>
            @{post.author.userName} · {timeAgo(post.createdAt)}
          </Text>
        </TouchableOpacity>

        {isOwnPost ? (
          <View style={styles.ownActions}>
            {!isEditing && (
              <TouchableOpacity onPress={startEdit} style={styles.iconButton}>
                <Icon name="pencil-outline" size={18} color="#777" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={confirmDelete} style={styles.iconButton}>
              <Icon name="trash-outline" size={18} color="#D32F2F" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.followButton, isFollowing && styles.followingButton]}
            onPress={() => onToggleFollow(post.author.id)}
          >
            <Text
              style={[
                styles.followButtonText,
                isFollowing && styles.followingButtonText,
              ]}
            >
              {isFollowing ? "Following" : "Follow"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {isEditing ? (
        <View style={styles.editBlock}>
          <TextInput
            value={editTitle}
            onChangeText={setEditTitle}
            placeholder="Post title..."
            style={styles.editTitleInput}
          />
          <TextInput
            value={editContent}
            onChangeText={setEditContent}
            multiline
            style={styles.editContentInput}
          />
          <View style={styles.editButtonsRow}>
            <TouchableOpacity
              style={styles.cancelEditButton}
              onPress={() => setIsEditing(false)}
              disabled={savingEdit}
            >
              <Text style={styles.cancelEditText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveEditButton}
              onPress={saveEdit}
              disabled={savingEdit}
            >
              {savingEdit ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveEditText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          {post.title && post.title !== "Untitled" && (
            <Text style={styles.postTitle}>{post.title}</Text>
          )}
          {!!post.content && (
            <Text style={styles.postContent}>{post.content}</Text>
          )}
          {post.imageUrl && (
            <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
          )}
        </>
      )}

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onToggleLike(post.id)}
        >
          <Icon
            name={post._liked ? "heart" : "heart-outline"}
            size={20}
            color={post._liked ? "#E53935" : "#666"}
          />
          <Text style={styles.actionText}>{post.likesCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onPressComments(post)}
        >
          <Icon name="chatbubble-outline" size={19} color="#666" />
          <Text style={styles.actionText}>{post.commentCount}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
  },
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
  avatarInitials: {
    color: "#2E7D32",
    fontWeight: "700",
    fontSize: 15,
  },
  authorInfo: {
    flex: 1,
    marginLeft: 10,
  },
  authorName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#222",
  },
  postMeta: {
    fontSize: 12,
    color: "#999",
    marginTop: 1,
  },
  ownActions: {
    flexDirection: "row",
    gap: 4,
  },
  iconButton: {
    padding: 6,
  },
  followButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "#2E7D32",
  },
  followingButton: {
    backgroundColor: "#E8F5E9",
    borderWidth: 1,
    borderColor: "#A5D6A7",
  },
  followButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  followingButtonText: {
    color: "#2E7D32",
  },
  postTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginTop: 12,
  },
  postContent: {
    fontSize: 14,
    color: "#444",
    marginTop: 8,
    lineHeight: 20,
  },
  postImage: {
    width: "100%",
    height: 220,
    borderRadius: 14,
    marginTop: 12,
    backgroundColor: "#F0F0F0",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 24,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
  },
  editBlock: {
    marginTop: 12,
  },
  editTitleInput: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  editContentInput: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    minHeight: 70,
    textAlignVertical: "top",
  },
  editButtonsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 10,
  },
  cancelEditButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  cancelEditText: {
    color: "#888",
    fontWeight: "600",
    fontSize: 13,
  },
  saveEditButton: {
    backgroundColor: "#2E7D32",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    minWidth: 60,
    alignItems: "center",
  },
  saveEditText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
});

export default CommunityPostCard;

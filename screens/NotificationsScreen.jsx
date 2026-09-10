import React, { useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import {
  useNotifications,
  useNotificationSocket,
} from "../hooks/notifications";
import { presentLocalNotification } from "../utils/notifcation";

const TYPE_ICON = {
  watering_reminder: { name: "water", color: "#2196F3" },
  fertilizing_reminder: { name: "nutrition", color: "#2E7D32" },
  comment: { name: "chatbubble", color: "#8E24AA" },
  like: { name: "heart", color: "#E91E63" },
};

const relativeTime = (iso) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) return "Just now";
  if (diffMs < hour) return `${Math.floor(diffMs / minute)}m ago`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)}h ago`;
  if (diffMs < 2 * day) return "Yesterday";
  if (diffMs < 7 * day) return `${Math.floor(diffMs / day)}d ago`;
  return new Date(iso).toLocaleDateString();
};

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const {
    notifications,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    refresh,
    markRead,
    markAllRead,
    prependLive,
  } = useNotifications();

  // Live updates: when the server pushes a "notification" socket event,
  // drop it straight into the list and surface it as a local OS banner
  // (see utils/notifcation.js for why this — not true background push —
  // is the mobile equivalent of DEPI-Front's live toast today).
  const handleLiveNotification = useCallback(
    (data) => {
      const notification = {
        id: data.id ?? Date.now(),
        type: data.type,
        title: data.title,
        body: data.body,
        isRead: false,
        plantId: data.plantId ?? null,
        createdAt: new Date().toISOString(),
      };
      prependLive(notification);
      presentLocalNotification({
        title: data.title,
        body: data.body,
        data: { plantId: data.plantId },
      });
    },
    [prependLive],
  );

  useNotificationSocket({ onNotification: handleLiveNotification });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handlePressNotification = (notification) => {
    if (!notification.isRead) markRead(notification.id);
    if (notification.plantId) {
      navigation.navigate("SinglePlant", {
        plant: { id: notification.plantId },
      });
    }
  };

  const renderItem = ({ item }) => {
    const icon = TYPE_ICON[item.type] || {
      name: "notifications",
      color: "#999",
    };

    return (
      <TouchableOpacity
        style={[styles.card, !item.isRead && styles.cardUnread]}
        onPress={() => handlePressNotification(item)}
        activeOpacity={0.8}
      >
        <View style={styles.iconWrapper}>
          <Icon name={icon.name} size={20} color={icon.color} />
        </View>

        <View style={styles.textWrapper}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.body} numberOfLines={2}>
            {item.body}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.time}>{relativeTime(item.createdAt)}</Text>
            {item.plantId && <Text style={styles.viewPlant}>View Plant</Text>}
          </View>
        </View>

        {!item.isRead && (
          <TouchableOpacity
            style={styles.readButton}
            onPress={() => markRead(item.id)}
          >
            <Icon name="checkmark" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Icon name="notifications-outline" size={64} color="#C8E6C9" />
        <Text style={styles.emptyText}>You're all caught up</Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <TouchableOpacity
        style={styles.loadMoreButton}
        onPress={loadMore}
        disabled={isLoadingMore}
      >
        {isLoadingMore ? (
          <ActivityIndicator size="small" color="#2E7D32" />
        ) : (
          <Text style={styles.loadMoreText}>Load more</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSubtitle}>
            Stay updated with your plant care
          </Text>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllButton} onPress={markAllRead}>
            <Icon name="checkmark-done" size={16} color="#FFFFFF" />
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={refresh} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7F5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1B5E20",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },
  markAllButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E7D32",
    borderRadius: 18,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  markAllText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 5,
  },
  errorBanner: {
    backgroundColor: "#FFEBEE",
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 10,
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 13,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 16,
    paddingTop: 4,
    flexGrow: 1,
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F1F4F1",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  cardUnread: {
    backgroundColor: "#E8F5E9",
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#222",
  },
  body: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 12,
  },
  time: {
    fontSize: 11,
    color: "#999",
  },
  viewPlant: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2E7D32",
  },
  readButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#2E7D32",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 15,
    color: "#888",
    marginTop: 12,
  },
  loadMoreButton: {
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#2E7D32",
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginTop: 8,
  },
  loadMoreText: {
    color: "#2E7D32",
    fontWeight: "600",
    fontSize: 13,
  },
});

export default NotificationsScreen;

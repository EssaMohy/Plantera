import AsyncStorage from "@react-native-async-storage/async-storage";

const FOLLOW_EDGES_KEY = "plantera_follow_edges";

export async function getFollowEdges() {
  try {
    const raw = await AsyncStorage.getItem(FOLLOW_EDGES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveFollowEdges(edges) {
  try {
    await AsyncStorage.setItem(FOLLOW_EDGES_KEY, JSON.stringify(edges));
  } catch {
    // ignore storage failures
  }
}

export async function isFollowingLocal(followerId, followingId) {
  const edges = await getFollowEdges();
  return edges.some(
    (e) => e.followerId === followerId && e.followingId === followingId,
  );
}

export async function toggleFollowLocal(followerId, followingId) {
  const edges = await getFollowEdges();
  const idx = edges.findIndex(
    (e) => e.followerId === followerId && e.followingId === followingId,
  );

  if (idx >= 0) {
    edges.splice(idx, 1);
    await saveFollowEdges(edges);
    return false;
  }

  edges.push({ followerId, followingId });
  await saveFollowEdges(edges);
  return true;
}

export async function followersCountLocal(userId) {
  const edges = await getFollowEdges();
  return edges.filter((e) => e.followingId === userId).length;
}

export async function followingCountLocal(userId) {
  const edges = await getFollowEdges();
  return edges.filter((e) => e.followerId === userId).length;
}

export async function getFollowingIds(followerId) {
  const edges = await getFollowEdges();
  return new Set(
    edges.filter((e) => e.followerId === followerId).map((e) => e.followingId),
  );
}

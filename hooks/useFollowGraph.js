import { useCallback, useEffect, useState } from "react";
import { getFollowingIds, toggleFollowLocal } from "../utils/followGraph";

export const useFollowGraph = (currentUserId) => {
  const [followingIds, setFollowingIds] = useState(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!currentUserId) {
      setFollowingIds(new Set());
      setLoaded(true);
      return undefined;
    }

    getFollowingIds(currentUserId).then((ids) => {
      if (!cancelled) {
        setFollowingIds(ids);
        setLoaded(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [currentUserId]);

  const toggleFollow = useCallback(
    async (authorId) => {
      if (!currentUserId || authorId === currentUserId) return;

      const nowFollowing = await toggleFollowLocal(currentUserId, authorId);
      setFollowingIds((prev) => {
        const next = new Set(prev);
        nowFollowing ? next.add(authorId) : next.delete(authorId);
        return next;
      });
    },
    [currentUserId],
  );

  return { followingIds, loaded, toggleFollow };
};

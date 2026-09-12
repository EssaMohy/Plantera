import { useCallback, useEffect, useRef, useState } from "react";
import axiosInstance from "../api/axiosInstance";

export const useCommunityPosts = () => {
  const [posts, setPosts] = useState([]);
  const [meta, setMeta] = useState({ nextCursor: undefined, hasMore: true });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const loadingRef = useRef(false);

  const fetchPosts = useCallback(async (cursor) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    cursor ? setIsLoadingMore(true) : setIsLoading(true);
    setError(null);

    try {
      const { data } = await axiosInstance.get("/posts", {
        params: { ...(cursor ? { cursor } : {}), limit: 20 },
      });
      setPosts((prev) => (cursor ? [...prev, ...data.data] : data.data));
      setMeta(data.meta);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Could not load posts.",
      );
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = useCallback(() => fetchPosts(), [fetchPosts]);
  const loadMore = useCallback(() => {
    if (meta.hasMore && !loadingRef.current) fetchPosts(meta.nextCursor);
  }, [meta, fetchPosts]);

  const createPost = useCallback(async ({ title, content, imageUri }) => {
    const { data } = await axiosInstance.post("/posts", {
      title: title.trim() || "Untitled",
      content: content.trim(),
      published: true,
    });
    let post = data.data;

    if (imageUri) {
      try {
        const formData = new FormData();
        formData.append("image", {
          uri: imageUri,
          type: "image/jpeg",
          name: "post.jpg",
        });
        const uploaded = await axiosInstance.post(
          `/posts/${post.id}/image`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } },
        );
        post = uploaded.data.data;
      } catch {
        // Post was created but the image failed — still show the post,
        // same as DEPI-Front does.
      }
    }

    setPosts((prev) => [post, ...prev]);
    return post;
  }, []);

  const updatePost = useCallback(async (postId, { title, content }) => {
    const { data } = await axiosInstance.patch(`/posts/${postId}`, {
      title: title.trim() || "Untitled",
      content: content.trim(),
    });
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, ...data.data } : p)),
    );
    return data.data;
  }, []);

  const deletePost = useCallback(async (postId) => {
    await axiosInstance.delete(`/posts/${postId}`);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }, []);

  const toggleLike = useCallback(async (postId) => {
    // Optimistic update, synced with the server's actual `liked` value
    // once the response comes back (more accurate than assuming the
    // toggle succeeded exactly as requested).
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              _liked: !p._liked,
              likesCount: p.likesCount + (p._liked ? -1 : 1),
            }
          : p,
      ),
    );

    try {
      const { data } = await axiosInstance.post(`/posts/${postId}/like`);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, _liked: data.data.liked } : p,
        ),
      );
    } catch {
      // Revert on error
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                _liked: !p._liked,
                likesCount: p.likesCount + (p._liked ? -1 : 1),
              }
            : p,
        ),
      );
    }
  }, []);

  const bumpCommentCount = useCallback((postId, delta) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, commentCount: Math.max(0, p.commentCount + delta) }
          : p,
      ),
    );
  }, []);

  return {
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
    bumpCommentCount,
  };
};

/**
 * Comments for a single post — cursor-paginated, plus add/delete. Kept
 * separate from useCommunityPosts since only one post's comments are ever
 * open at a time on mobile (see PostDetailScreen), unlike DEPI-Front's
 * inline-expand-in-feed pattern which tracks every post's comments at once.
 */
export const usePostComments = (postId) => {
  const [comments, setComments] = useState([]);
  const [meta, setMeta] = useState({ nextCursor: undefined, hasMore: true });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const loadingRef = useRef(false);

  const fetchComments = useCallback(
    async (cursor) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      cursor ? setIsLoadingMore(true) : setIsLoading(true);
      setError(null);

      try {
        const { data } = await axiosInstance.get(`/posts/${postId}/comments`, {
          params: { ...(cursor ? { cursor } : {}), limit: 20 },
        });
        setComments((prev) => (cursor ? [...prev, ...data.data] : data.data));
        setMeta(data.meta);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Could not load comments.",
        );
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
        loadingRef.current = false;
      }
    },
    [postId],
  );

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const loadMore = useCallback(() => {
    if (meta.hasMore && !loadingRef.current) fetchComments(meta.nextCursor);
  }, [meta, fetchComments]);

  const addComment = useCallback(
    async (content) => {
      const { data } = await axiosInstance.post(`/posts/${postId}/comments`, {
        content,
      });
      setComments((prev) => [data.data, ...prev]);
      return data.data;
    },
    [postId],
  );

  const deleteComment = useCallback(async (commentId) => {
    await axiosInstance.delete(`/posts/comments/${commentId}`);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }, []);

  return {
    comments,
    meta,
    isLoading,
    isLoadingMore,
    error,
    loadMore,
    addComment,
    deleteComment,
  };
};

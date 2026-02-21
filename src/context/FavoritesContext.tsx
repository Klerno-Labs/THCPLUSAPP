"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface FavoritesContextValue {
  favoriteIds: Set<string>;
  isFavorited: (productId: string) => boolean;
  toggleFavorite: (productId: string) => Promise<void>;
  isLoaded: boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  // Fetch favorites on mount (only works if user is authenticated)
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/favorites");
        if (!res.ok) {
          // Not authenticated or other error — just leave empty
          setIsLoaded(true);
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          setFavoriteIds(new Set(data.map((f: { productId: string }) => f.productId)));
        }
      } catch {
        // Network error — leave empty
      } finally {
        if (!cancelled) setIsLoaded(true);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const isFavorited = useCallback(
    (productId: string) => favoriteIds.has(productId),
    [favoriteIds]
  );

  const toggleFavorite = useCallback(
    async (productId: string) => {
      const wasFavorited = favoriteIds.has(productId);

      // Optimistic update
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (wasFavorited) {
          next.delete(productId);
        } else {
          next.add(productId);
        }
        return next;
      });

      try {
        const res = await fetch("/api/favorites", {
          method: wasFavorited ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });

        if (!res.ok) {
          // Revert on failure
          setFavoriteIds((prev) => {
            const next = new Set(prev);
            if (wasFavorited) {
              next.add(productId);
            } else {
              next.delete(productId);
            }
            return next;
          });
        }
      } catch {
        // Revert on network error
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          if (wasFavorited) {
            next.add(productId);
          } else {
            next.delete(productId);
          }
          return next;
        });
      }
    },
    [favoriteIds]
  );

  return (
    <FavoritesContext.Provider value={{ favoriteIds, isFavorited, toggleFavorite, isLoaded }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return ctx;
}

import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';

type AppContextValue = {
  favorites: number[];
  isFavorite: (id: number) => boolean;
  toggleFavorite: (id: number) => void;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: PropsWithChildren) {
  const [favorites, setFavorites] = useState<number[]>([]);

  const value = useMemo<AppContextValue>(
    () => ({
      favorites,
      isFavorite: (id) => favorites.includes(id),
      toggleFavorite: (id) => {
        setFavorites((current) =>
          current.includes(id)
            ? current.filter((itemId) => itemId !== id)
            : [...current, id]
        );
      },
    }),
    [favorites]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used inside AppProvider');
  }

  return context;
}

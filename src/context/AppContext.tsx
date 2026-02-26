import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';

type AppContextValue = {
  favorites: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: PropsWithChildren) {
  const [favorites, setFavorites] = useState<string[]>([]);

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

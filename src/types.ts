export type Article = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

export type RootStackParamList = {
  Home: undefined;
  Details: { article: Article };
};

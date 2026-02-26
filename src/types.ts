export type Article = {
  id: string;
  title: string;
  body: string;
  url: string;
  source: string;
  publishedAt: number;
};

export type RootStackParamList = {
  Home: undefined;
  Details: { article: Article };
};

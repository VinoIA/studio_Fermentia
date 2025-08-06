export type Vineyard = {
  id: string;
  name: string;
  location: string;
  grapeVarietals: string;
  totalPlots: number;
  iotData: {
    pests: boolean;
  };
  imageUrl: string;
  imageHint: string;
};

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

import type { Vineyard } from "@/types";

export const initialVineyards: Vineyard[] = [
  {
    id: "1",
    name: "Oak Ridge Estate",
    location: "Napa Valley, California",
    grapeVarietals: "Cabernet Sauvignon, Merlot",
    totalPlots: 12,
    iotData: {
      pests: false,
    },
    imageUrl: "https://placehold.co/400x300.png",
    imageHint: "vineyard aerial"
  },
  {
    id: "2",
    name: "Willow Creek Vineyards",
    location: "Burgundy, France",
    grapeVarietals: "Chardonnay, Pinot Noir",
    totalPlots: 8,
     iotData: {
      pests: true,
    },
    imageUrl: "https://placehold.co/400x300.png",
    imageHint: "grapes vine"
  },
  {
    id: "3",
    name: "Sunset Valley Farms",
    location: "Tuscany, Italy",
    grapeVarietals: "Zinfandel, Syrah",
    totalPlots: 15,
     iotData: {
      pests: false,
    },
    imageUrl: "https://placehold.co/400x300.png",
    imageHint: "vineyard sunset"
  },
   {
    id: "4",
    name: "Misty Mountain Vines",
    location: "Sonoma, California",
    grapeVarietals: "Sauvignon Blanc",
    totalPlots: 10,
     iotData: {
      pests: false,
    },
    imageUrl: "https://placehold.co/400x300.png",
    imageHint: "vineyard mountain"
  },
];

export function getVineyardData(vineyardName?: string) {
    if (vineyardName) {
        const vineyard = initialVineyards.find(v => v.name.toLowerCase() === vineyardName.toLowerCase());
        return vineyard || { error: "Vineyard not found" };
    }
    return initialVineyards;
}

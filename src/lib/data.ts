import type { Vineyard } from "@/types";

export const initialVineyards: Vineyard[] = [
  {
    id: "1",
    name: "Finca Roble Alto",
    location: "Valle de Napa, California",
    grapeVarietals: "Cabernet Sauvignon, Merlot",
    totalPlots: 12,
    iotData: {
      pests: false,
    },
    imageUrl: "/imgs/1.jpg",
    imageHint: "vineyard aerial"
  },
  {
    id: "2",
    name: "Viñedos Arroyo Sauce",
    location: "Borgoña, Francia",
    grapeVarietals: "Chardonnay, Pinot Noir",
    totalPlots: 8,
     iotData: {
      pests: true,
    },
    imageUrl: "/imgs/2.png",
    imageHint: "grapes vine"
  },
  {
    id: "3",
    name: "Hacienda del Valle del Sol",
    location: "Toscana, Italia",
    grapeVarietals: "Zinfandel, Syrah",
    totalPlots: 15,
     iotData: {
      pests: false,
    },
    imageUrl: "/imgs/3.jpeg",
    imageHint: "vineyard sunset"
  },
   {
    id: "4",
    name: "Vides de la Montaña Nublada",
    location: "Sonoma, California",
    grapeVarietals: "Sauvignon Blanc",
    totalPlots: 10,
     iotData: {
      pests: false,
    },
    imageUrl: "/imgs/4.png",
    imageHint: "vineyard mountain"
  },
];

// Mantenemos un estado en memoria para simular una base de datos.
let vineyardsDB = [...initialVineyards];

export function getVineyards() {
  // En una aplicación real, esto consultaría una base de datos.
  return vineyardsDB;
}

export function getVineyardById(id: string) {
    return vineyardsDB.find(v => v.id === id);
}

export function addVineyard(vineyardData: Omit<Vineyard, 'id' | 'iotData'>) {
    const newVineyard: Vineyard = {
        ...vineyardData,
        id: (vineyardsDB.length + 1).toString(), // ID simple para el ejemplo
        iotData: {
            pests: Math.random() < 0.2, // 20% de probabilidad de tener plagas
        },
    };
    vineyardsDB.push(newVineyard);
    return newVineyard;
}


// Función para la IA
export function getVineyardData(vineyardName?: string) {
    if (vineyardName) {
        const vineyard = vineyardsDB.find(v => v.name.toLowerCase().includes(vineyardName.toLowerCase()));
        return vineyard || { error: "Viñedo no encontrado" };
    }
    // Devuelve un resumen de todos los viñedos si no se especifica uno
    return vineyardsDB.map(v => ({
        nombre: v.name,
        ubicacion: v.location,
        alerta_plagas: v.iotData.pests,
    }));
}

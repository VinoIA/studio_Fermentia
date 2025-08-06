"use client";

import { useState, useMemo, type FC } from "react";
import { Plus, Search, Grape, Wine, Pencil, Trash2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import type { Vineyard } from "@/types";
import { VineyardForm } from "@/components/vineyard-form";

const initialVineyards: Vineyard[] = [
  {
    id: "1",
    name: "Napa Valley Sunsets",
    location: "Napa Valley, California",
    grapeVarietals: "Cabernet Sauvignon, Chardonnay, Merlot",
    notableWines: "2018 Reserve Cabernet Sauvignon",
    description: "Nestled in the heart of Napa Valley, our vineyard boasts sun-drenched slopes perfect for cultivating world-class Cabernet Sauvignon. Experience the rich flavors and breathtaking sunsets that make our wines unforgettable.",
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "vineyard sunset"
  },
  {
    id: "2",
    name: "Domaine de la Romanée-Conti",
    location: "Burgundy, France",
    grapeVarietals: "Pinot Noir",
    notableWines: "Romanée-Conti Grand Cru",
    description: "An iconic estate in Burgundy, Domaine de la Romanée-Conti is synonymous with the world's finest Pinot Noir. Its mythical grand cru, Romanée-Conti, is one of the most sought-after wines globally, a testament to its exceptional terroir and meticulous winemaking.",
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "burgundy chateau"
  },
  {
    id: "3",
    name: "Tuscan Hills Estate",
    location: "Tuscany, Italy",
    grapeVarietals: "Sangiovese, Merlot",
    notableWines: "Chianti Classico Riserva",
    description: "Overlooking the rolling hills of Tuscany, our estate is dedicated to producing exceptional Sangiovese. Our Chianti Classico Riserva embodies the spirit of Italy with its rustic charm and elegant structure.",
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "tuscan hills"
  },
];

const Logo: FC = () => (
  <div className="flex items-center gap-2">
    <div className="relative">
      <Wine className="h-8 w-8 text-primary" />
      <Grape className="absolute -bottom-1 -right-2 h-5 w-5 text-accent" />
    </div>
    <h1 className="text-2xl font-headline font-bold tracking-tight">
      Elixir Line
    </h1>
  </div>
);

export default function Home() {
  const [vineyards, setVineyards] = useState<Vineyard[]>(initialVineyards);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVineyard, setEditingVineyard] = useState<Vineyard | null>(null);
  const [deletingVineyard, setDeletingVineyard] = useState<Vineyard | null>(null);

  const { toast } = useToast();

  const filteredVineyards = useMemo(() =>
    vineyards.filter((v) =>
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.grapeVarietals.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [vineyards, searchTerm]
  );

  const handleAddNew = () => {
    setEditingVineyard(null);
    setIsFormOpen(true);
  };

  const handleEdit = (vineyard: Vineyard) => {
    setEditingVineyard(vineyard);
    setIsFormOpen(true);
  };

  const handleDeleteConfirm = (vineyard: Vineyard) => {
    setDeletingVineyard(vineyard);
  };

  const handleDelete = () => {
    if (!deletingVineyard) return;
    setVineyards((prev) => prev.filter((v) => v.id !== deletingVineyard.id));
    toast({
      title: "Vineyard Deleted",
      description: `"${deletingVineyard.name}" has been removed.`,
    });
    setDeletingVineyard(null);
  };

  const handleFormSubmit = (data: Omit<Vineyard, "id" | "imageUrl" | "imageHint">, id?: string) => {
    if (id) {
      // Update
      const updatedVineyard: Vineyard = { ...vineyards.find(v => v.id === id)!, ...data };
      setVineyards((prev) => prev.map((v) => (v.id === id ? updatedVineyard : v)));
      toast({
        title: "Vineyard Updated",
        description: `"${data.name}" has been successfully updated.`,
      });
    } else {
      // Create
      const newVineyard: Vineyard = {
        id: Date.now().toString(),
        ...data,
        imageUrl: `https://placehold.co/600x400.png`,
        imageHint: "vineyard landscape"
      };
      setVineyards((prev) => [newVineyard, ...prev]);
      toast({
        title: "Vineyard Created",
        description: `"${data.name}" has been successfully added.`,
      });
    }
    setIsFormOpen(false);
    setEditingVineyard(null);
  };
  

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Logo />
          <Button onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            Add Vineyard
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="mb-8 space-y-4">
          <h2 className="text-3xl font-headline font-bold tracking-tight">
            Vineyard Explorer
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by name, location, or grape..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {filteredVineyards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVineyards.map((vineyard) => (
              <Card key={vineyard.id} className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <img src={vineyard.imageUrl} alt={vineyard.name} data-ai-hint={vineyard.imageHint} className="w-full h-48 object-cover" />
                <CardHeader>
                  <CardTitle className="font-headline">{vineyard.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1.5 pt-1">
                    <MapPin className="h-4 w-4 text-accent" /> {vineyard.location}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                  <p className="text-sm">{vineyard.description}</p>
                  <div>
                    <h4 className="font-bold text-sm mb-1">Grape Varietals:</h4>
                    <p className="text-sm text-muted-foreground">{vineyard.grapeVarietals}</p>
                  </div>
                   {vineyard.notableWines && (
                    <div>
                      <h4 className="font-bold text-sm mb-1">Notable Wines:</h4>
                      <p className="text-sm text-muted-foreground">{vineyard.notableWines}</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="bg-muted/50 p-3 flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(vineyard)}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteConfirm(vineyard)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold">No Vineyards Found</h3>
            <p className="text-muted-foreground mt-2">Try adjusting your search or add a new vineyard.</p>
          </div>
        )}
      </main>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle className="font-headline">
              {editingVineyard ? "Edit Vineyard" : "Add New Vineyard"}
            </DialogTitle>
          </DialogHeader>
          <VineyardForm
            vineyardToEdit={editingVineyard}
            onSubmit={handleFormSubmit}
          />
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!deletingVineyard} onOpenChange={() => setDeletingVineyard(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              vineyard "{deletingVineyard?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

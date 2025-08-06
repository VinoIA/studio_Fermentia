"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Wand2, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Vineyard } from "@/types";
import { generateDescriptionAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  location: z.string().min(3, "Location must be at least 3 characters."),
  grapeVarietals: z.string().min(3, "Please list at least one grape varietal."),
  notableWines: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters."),
});

type VineyardFormValues = z.infer<typeof formSchema>;

interface VineyardFormProps {
  vineyardToEdit: Vineyard | null;
  onSubmit: (data: VineyardFormValues, id?: string) => void;
}

export function VineyardForm({ vineyardToEdit, onSubmit }: VineyardFormProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<VineyardFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      location: "",
      grapeVarietals: "",
      notableWines: "",
      description: "",
    },
  });

  useEffect(() => {
    if (vineyardToEdit) {
      form.reset(vineyardToEdit);
    } else {
      form.reset({
        name: "",
        location: "",
        grapeVarietals: "",
        notableWines: "",
        description: "",
      });
    }
  }, [vineyardToEdit, form]);

  const handleGenerateDescription = async () => {
    const { name, location, grapeVarietals, notableWines } = form.getValues();
    if (!name || !location || !grapeVarietals) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill out Name, Location, and Grape Varietals to generate a description.",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateDescriptionAction({ name, location, grapeVarietals, notableWines });
      if (result.description) {
        form.setValue("description", result.description, { shouldValidate: true });
        toast({
          title: "Description Generated!",
          description: "The AI-powered description has been added.",
        });
      } else {
        throw new Error("Failed to generate description.");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Could not generate a description at this time. Please try again later.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const nameValue = form.watch("name");
  const locationValue = form.watch("location");
  const grapeVarietalsValue = form.watch("grapeVarietals");
  const canGenerate = nameValue && locationValue && grapeVarietalsValue;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(data => onSubmit(data, vineyardToEdit?.id))} className="space-y-4 py-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vineyard Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Napa Valley Sunsets" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Napa Valley, California" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="grapeVarietals"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grape Varietals</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Cabernet Sauvignon, Chardonnay" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notableWines"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notable Wines (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 2018 Reserve Cabernet" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center">
                <FormLabel>Description</FormLabel>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleGenerateDescription}
                  disabled={isGenerating || !canGenerate}
                  className="text-primary hover:text-primary"
                >
                  {isGenerating ? (
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                  )}
                  Generate with AI
                </Button>
              </div>
              <FormControl>
                <Textarea
                  placeholder="A compelling description of the vineyard..."
                  className="resize-none"
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
               <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {vineyardToEdit ? "Save Changes" : "Create Vineyard"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema } from "@/lib/validation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Product } from "@/utils/types";

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSaved: () => void;
}

// Default fallback categories
const DEFAULT_CATEGORIES = [
  { id: "shoes", name: "Shoes" },
  { id: "slippers", name: "Slippers" },
  { id: "sandals", name: "Sandals" },
  { id: "boots", name: "Boots" },
];

const AddProductDialog: React.FC<AddProductDialogProps> = ({
  open,
  onOpenChange,
  product,
  onSaved,
}) => {
  const isEditing = !!product;
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(DEFAULT_CATEGORIES);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: isEditing
      ? {
          name: product?.name || "",
          price: product?.price || 0,
          description: product?.description || "",
          category: product?.category || "",
          stock: product?.stock || 0,
          featured: product?.featured || false,
          newArrival: product?.newArrival || product?.new_arrival || false,
          discount: product?.discount || 0,
          images: product?.images || [],
          sizes: product?.sizes || [40],
          colors: product?.colors || ["Black"],
        }
      : {
          name: "",
          price: 0,
          description: "",
          category: "",
          stock: 0,
          featured: false,
          newArrival: false,
          discount: 0,
          images: [],
          sizes: [40],
          colors: ["Black"],
        },
  });

  // Fetch unique categories from products in DB
  useEffect(() => {
    async function fetchCategories() {
      setLoadingCategories(true);
      const { data, error } = await supabase
        .from("products")
        .select("category");
      if (!error && data) {
        // Extract unique categories
        const uniqueCats = Array.from(
          new Set(
            data
              .map((prod) => prod.category)
              .filter((cat: string | null) => typeof cat === "string" && cat.trim() !== "")
          )
        );
        // Merge with default categories for friendly names if possible
        const merged = uniqueCats.map((cat) => {
          const defaultCat = DEFAULT_CATEGORIES.find((d) => d.id === cat);
          return { id: cat, name: defaultCat?.name || cat };
        });
        setCategories(merged.length > 0 ? merged : DEFAULT_CATEGORIES);
      } else {
        setCategories(DEFAULT_CATEGORIES);
      }
      setLoadingCategories(false);
    }
    fetchCategories();
  }, [open]);

  const onSubmit = async (values: any) => {
    try {
      // Create storage bucket if it doesn't exist
      const { error: bucketError } = await supabase.storage.getBucket("product-images");
      if (bucketError && bucketError.message.includes("not found")) {
        await supabase.storage.createBucket("product-images", {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        });
        console.log("Created product-images bucket");
      }

      // Process image uploads if there are File objects
      const imageURLs = await Promise.all(
        values.images.map(async (image: File | string) => {
          if (typeof image === "string") {
            return image;
          }
          if (image instanceof File) {
            const fileName = `${Date.now()}-${image.name}`;
            const { error } = await supabase.storage
              .from("product-images")
              .upload(`products/${fileName}`, image);
            if (error) {
              console.error("Upload error:", error);
              throw error;
            }
            const { data: publicURL } = supabase.storage
              .from("product-images")
              .getPublicUrl(`products/${fileName}`);
            return publicURL.publicUrl;
          }
          return "";
        })
      );
      const filteredImageURLs = imageURLs.filter((url) => url);

      if (isEditing) {
        // Update existing product
        const { error } = await supabase
          .from("products")
          .update({
            name: values.name,
            price: values.price,
            description: values.description,
            category: values.category,
            stock: values.stock,
            featured: values.featured,
            new_arrival: values.newArrival,
            discount: values.discount || null,
            images: filteredImageURLs,
            sizes: values.sizes,
            colors: values.colors,
          })
          .eq("id", product!.id);

        if (error) throw error;
        toast.success("Product updated successfully");
      } else {
        // Create new product
        const { error } = await supabase
          .from("products")
          .insert({
            name: values.name,
            price: values.price,
            description: values.description,
            category: values.category,
            stock: values.stock,
            featured: values.featured,
            new_arrival: values.newArrival,
            discount: values.discount || null,
            images: filteredImageURLs,
            sizes: values.sizes,
            colors: values.colors,
          });
        if (error) throw error;
        toast.success("Product created successfully");
      }
      onSaved();
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Failed to save product: " + error.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Name</label>
            <Input {...form.register("name")} />
          </div>
          <div>
            <label className="block mb-1 font-medium">Price</label>
            <Input type="number" step="0.01" {...form.register("price", { valueAsNumber: true })} />
          </div>
          <div>
            <label className="block mb-1 font-medium">Description</label>
            <Input {...form.register("description")} />
          </div>
          <div>
            <label className="block mb-1 font-medium">Category</label>
            <Select
              value={form.watch("category")}
              onValueChange={(val) => form.setValue("category", val)}
              disabled={loadingCategories}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Stock</label>
            <Input type="number" {...form.register("stock", { valueAsNumber: true })} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" {...form.register("featured")} id="featured" />
            <label htmlFor="featured" className="font-medium">Featured</label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" {...form.register("newArrival")} id="newArrival" />
            <label htmlFor="newArrival" className="font-medium">New Arrival</label>
          </div>
          <div>
            <label className="block mb-1 font-medium">Discount (%)</label>
            <Input type="number" {...form.register("discount", { valueAsNumber: true })} min={0} max={100} />
          </div>
          {/* You likely have custom inputs for images, sizes, colors -- keep those as is */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEditing ? "Update" : "Add"} Product</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductDialog;

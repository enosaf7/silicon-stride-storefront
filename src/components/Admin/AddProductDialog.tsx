
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Product } from '@/utils/types';

const productSchema = z.object({
  name: z.string().min(2, { message: 'Product name must be at least 2 characters.' }),
  price: z.coerce.number().positive({ message: 'Price must be a positive number.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  category: z.string().min(1, { message: 'Category is required.' }),
  stock: z.coerce.number().int().nonnegative({ message: 'Stock must be a non-negative number.' }),
  featured: z.boolean().default(false),
  newArrival: z.boolean().default(false),
  discount: z.coerce.number().min(0).max(100).optional().default(0),
  images: z.string().array().min(1, { message: 'At least one image URL is required.' }),
  sizes: z.coerce.number().array().min(1, { message: 'At least one size is required.' }),
  colors: z.string().array().min(1, { message: 'At least one color is required.' }),
});

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSaved: () => void;
}

const AddProductDialog: React.FC<AddProductDialogProps> = ({
  open,
  onOpenChange,
  product,
  onSaved,
}) => {
  const isEditing = !!product;
  
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: isEditing
      ? {
          name: product?.name || '',
          price: product?.price || 0,
          description: product?.description || '',
          category: product?.category || '',
          stock: product?.stock || 0,
          featured: product?.featured || false,
          newArrival: product?.newArrival || product?.new_arrival || false,
          discount: product?.discount || 0,
          images: product?.images || [''],
          sizes: product?.sizes || [40],
          colors: product?.colors || ['Black'],
        }
      : {
          name: '',
          price: 0,
          description: '',
          category: '',
          stock: 0,
          featured: false,
          newArrival: false,
          discount: 0,
          images: [''],
          sizes: [40],
          colors: ['Black'],
        },
  });
  
  const onSubmit = async (values: z.infer<typeof productSchema>) => {
    try {
      if (isEditing) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update({
            name: values.name,
            price: values.price,
            description: values.description,
            category: values.category,
            stock: values.stock,
            featured: values.featured,
            new_arrival: values.newArrival,
            discount: values.discount || null,
            images: values.images,
            sizes: values.sizes,
            colors: values.colors,
          })
          .eq('id', product.id);
          
        if (error) throw error;
        
        toast.success('Product updated successfully');
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert({
            name: values.name,
            price: values.price,
            description: values.description,
            category: values.category,
            stock: values.stock,
            featured: values.featured,
            new_arrival: values.newArrival,
            discount: values.discount || null,
            images: values.images,
            sizes: values.sizes,
            colors: values.colors,
          });
          
        if (error) throw error;
        
        toast.success('Product created successfully');
      }
      
      onSaved();
    } catch (error: any) {
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} product: ${error.message}`);
    }
  };
  
  // Manage image URLs
  const [imageInputs, setImageInputs] = React.useState<string[]>(
    form.getValues().images.length ? form.getValues().images : ['']
  );
  
  const addImageInput = () => {
    setImageInputs([...imageInputs, '']);
  };
  
  const removeImageInput = (index: number) => {
    const newInputs = [...imageInputs];
    newInputs.splice(index, 1);
    setImageInputs(newInputs);
    form.setValue('images', newInputs.filter(Boolean));
  };
  
  const updateImageInput = (index: number, value: string) => {
    const newInputs = [...imageInputs];
    newInputs[index] = value;
    setImageInputs(newInputs);
    form.setValue('images', newInputs.filter(Boolean));
  };
  
  // Manage size inputs
  const [sizeInputs, setSizeInputs] = React.useState<number[]>(
    form.getValues().sizes.length ? form.getValues().sizes : [40]
  );
  
  const addSizeInput = () => {
    setSizeInputs([...sizeInputs, 0]);
  };
  
  const removeSizeInput = (index: number) => {
    const newInputs = [...sizeInputs];
    newInputs.splice(index, 1);
    setSizeInputs(newInputs);
    form.setValue('sizes', newInputs.filter((size) => size > 0));
  };
  
  const updateSizeInput = (index: number, value: number) => {
    const newInputs = [...sizeInputs];
    newInputs[index] = value;
    setSizeInputs(newInputs);
    form.setValue('sizes', newInputs.filter((size) => size > 0));
  };
  
  // Manage color inputs
  const [colorInputs, setColorInputs] = React.useState<string[]>(
    form.getValues().colors.length ? form.getValues().colors : ['Black']
  );
  
  const addColorInput = () => {
    setColorInputs([...colorInputs, '']);
  };
  
  const removeColorInput = (index: number) => {
    const newInputs = [...colorInputs];
    newInputs.splice(index, 1);
    setColorInputs(newInputs);
    form.setValue('colors', newInputs.filter(Boolean));
  };
  
  const updateColorInput = (index: number, value: string) => {
    const newInputs = [...colorInputs];
    newInputs[index] = value;
    setColorInputs(newInputs);
    form.setValue('colors', newInputs.filter(Boolean));
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Product Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Price */}
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. shoes, slippers, boots" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter product description"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Stock */}
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Discount */}
              <FormField
                control={form.control}
                name="discount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount (%)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex flex-wrap gap-4">
              {/* Featured */}
              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">Featured Product</FormLabel>
                  </FormItem>
                )}
              />
              
              {/* New Arrival */}
              <FormField
                control={form.control}
                name="newArrival"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">New Arrival</FormLabel>
                  </FormItem>
                )}
              />
            </div>
            
            {/* Image URLs */}
            <div>
              <FormLabel>Product Images</FormLabel>
              <div className="space-y-2 mt-2">
                {imageInputs.map((imageUrl, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Enter image URL"
                      value={imageUrl}
                      onChange={(e) => updateImageInput(index, e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeImageInput(index)}
                      disabled={imageInputs.length === 1}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                className="mt-2"
                onClick={addImageInput}
              >
                Add Another Image
              </Button>
              {form.formState.errors.images && (
                <p className="text-sm font-medium text-destructive mt-2">
                  {form.formState.errors.images.message}
                </p>
              )}
            </div>
            
            {/* Sizes */}
            <div>
              <FormLabel>Available Sizes</FormLabel>
              <div className="space-y-2 mt-2">
                {sizeInputs.map((size, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Enter size (e.g. 40, 41, 42)"
                      value={size || ''}
                      onChange={(e) => updateSizeInput(index, parseInt(e.target.value, 10))}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeSizeInput(index)}
                      disabled={sizeInputs.length === 1}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                className="mt-2"
                onClick={addSizeInput}
              >
                Add Another Size
              </Button>
              {form.formState.errors.sizes && (
                <p className="text-sm font-medium text-destructive mt-2">
                  {form.formState.errors.sizes.message}
                </p>
              )}
            </div>
            
            {/* Colors */}
            <div>
              <FormLabel>Available Colors</FormLabel>
              <div className="space-y-2 mt-2">
                {colorInputs.map((color, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Enter color (e.g. Black, White, Red)"
                      value={color}
                      onChange={(e) => updateColorInput(index, e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeColorInput(index)}
                      disabled={colorInputs.length === 1}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                className="mt-2"
                onClick={addColorInput}
              >
                Add Another Color
              </Button>
              {form.formState.errors.colors && (
                <p className="text-sm font-medium text-destructive mt-2">
                  {form.formState.errors.colors.message}
                </p>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-brand-orange hover:bg-brand-orange/90">
                {isEditing ? 'Update Product' : 'Create Product'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductDialog;

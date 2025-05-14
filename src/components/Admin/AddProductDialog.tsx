
import React, { useCallback } from 'react';
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
import { FileImage, Upload, X } from 'lucide-react';

const productSchema = z.object({
  name: z.string().min(2, { message: 'Product name must be at least 2 characters.' }),
  price: z.coerce.number().positive({ message: 'Price must be a positive number.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  category: z.string().min(1, { message: 'Category is required.' }),
  stock: z.coerce.number().int().nonnegative({ message: 'Stock must be a non-negative number.' }),
  featured: z.boolean().default(false),
  newArrival: z.boolean().default(false),
  discount: z.coerce.number().min(0).max(100).optional().default(0),
  images: z.any().array().min(1, { message: 'At least one image is required.' }),
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
          images: product?.images || [],
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
          images: [],
          sizes: [40],
          colors: ['Black'],
        },
  });
  
  const onSubmit = async (values: z.infer<typeof productSchema>) => {
    try {
      // Create storage bucket if it doesn't exist
      const { error: bucketError } = await supabase.storage.getBucket('product-images');
      if (bucketError && bucketError.message.includes('not found')) {
        await supabase.storage.createBucket('product-images', {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        });
        console.log('Created product-images bucket');
      }
      
      // Process image uploads if there are File objects
      const imageURLs = await Promise.all(
        values.images.map(async (image: File | string) => {
          // If image is already a URL string, return it
          if (typeof image === 'string') {
            return image;
          }
          
          // If it's a File object, upload it to Supabase Storage
          if (image instanceof File) {
            const fileName = `${Date.now()}-${image.name}`;
            const { data, error } = await supabase.storage
              .from('product-images')
              .upload(`products/${fileName}`, image);
              
            if (error) {
              console.error('Upload error:', error);
              throw error;
            }
            
            // Get the public URL
            const { data: publicURL } = supabase.storage
              .from('product-images')
              .getPublicUrl(`products/${fileName}`);
              
            return publicURL.publicUrl;
          }
          
          return '';
        })
      );
      
      // Filter out any empty strings
      const filteredImageURLs = imageURLs.filter(url => url);
      
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
            images: filteredImageURLs,
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
            images: filteredImageURLs,
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
  
  // Handle file upload
  const [uploadedFiles, setUploadedFiles] = React.useState<(File | string)[]>(
    form.getValues().images || []
  );
  
  const handleFileDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const newFiles = Array.from(e.dataTransfer.files);
        const updatedFiles = [...uploadedFiles, ...newFiles];
        setUploadedFiles(updatedFiles);
        form.setValue('images', updatedFiles, { shouldValidate: true });
      }
    },
    [uploadedFiles, form]
  );
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const updatedFiles = [...uploadedFiles, ...newFiles];
      setUploadedFiles(updatedFiles);
      form.setValue('images', updatedFiles, { shouldValidate: true });
    }
  };
  
  const removeFile = (indexToRemove: number) => {
    const updatedFiles = uploadedFiles.filter((_, index) => index !== indexToRemove);
    setUploadedFiles(updatedFiles);
    form.setValue('images', updatedFiles, { shouldValidate: true });
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
    form.setValue('sizes', newInputs.filter((size) => size > 0), { shouldValidate: true });
  };
  
  const updateSizeInput = (index: number, value: number) => {
    const newInputs = [...sizeInputs];
    newInputs[index] = value;
    setSizeInputs(newInputs);
    form.setValue('sizes', newInputs.filter((size) => size > 0), { shouldValidate: true });
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
    form.setValue('colors', newInputs.filter(Boolean), { shouldValidate: true });
  };
  
  const updateColorInput = (index: number, value: string) => {
    const newInputs = [...colorInputs];
    newInputs[index] = value;
    setColorInputs(newInputs);
    form.setValue('colors', newInputs.filter(Boolean), { shouldValidate: true });
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
                    <FormLabel>Price (₵)</FormLabel>
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
            
            {/* Image Upload */}
            <FormField
              control={form.control}
              name="images"
              render={() => (
                <FormItem>
                  <FormLabel>Product Images</FormLabel>
                  <FormControl>
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleFileDrop}
                    >
                      <FileImage className="h-10 w-10 text-gray-400 mb-3" />
                      <p className="text-sm text-gray-600 mb-1">
                        Drag and drop product images here or
                      </p>
                      <div className="relative">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                        >
                          <Upload className="h-4 w-4 mr-2" /> Browse Files
                        </Button>
                        <input
                          type="file"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          accept="image/*"
                          multiple
                          onChange={handleFileChange}
                        />
                      </div>
                    </div>
                  </FormControl>
                  
                  {/* Display uploaded files */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      {uploadedFiles.map((file, index) => (
                        <div 
                          key={index} 
                          className="relative bg-gray-100 rounded-md p-2 flex items-center"
                        >
                          <div className="h-16 w-16 overflow-hidden rounded-md mr-2">
                            {typeof file === 'string' ? (
                              <img 
                                src={file} 
                                alt={`Image ${index + 1}`}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <img 
                                src={URL.createObjectURL(file)} 
                                alt={`Image ${index + 1}`}
                                className="h-full w-full object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {typeof file === 'string' 
                                ? file.split('/').pop() 
                                : file.name
                              }
                            </p>
                            <p className="text-xs text-gray-500">
                              {typeof file !== 'string' && (file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <button 
                            type="button"
                            className="text-gray-500 hover:text-red-500"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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
                  {form.formState.errors.sizes.message as string}
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
                  {form.formState.errors.colors.message as string}
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

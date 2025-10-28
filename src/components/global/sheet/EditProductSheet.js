"use client";

import { useState, useCallback } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
  SheetContent,
} from "@/components/ui/sheet";

import CategorySelector from "@/components/product/category-selector";

// ✅ Validation Schema
const ProductSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  base_price: Yup.number()
    .min(0, "Base price cannot be negative")
    .required("Base price is required"),
  img: Yup.string().nullable(),
});

export default function EditProductForm({ product, onSave, onClose }) {
  const [isDragging, setIsDragging] = useState(false);

  // ✅ Initialize Formik
  const formik = useFormik({
    initialValues: {
      name: product?.name || "",
      description: product?.description || "",
      food_type: product?.food_type || "Veg",
      item_type: product?.item_type || "",
      variants: product?.variants?.join(", ") || "",
      base_price: product?.base_price || 0,
      category: product?.category || "",
      sub_category: product?.sub_category || "",
      img: product?.img || "",
    },
    validationSchema: ProductSchema,
    onSubmit: (values) => {
      const updated = {
        ...values,
        variants:
          typeof values.variants === "string"
            ? values.variants
                .split(",")
                .map((v) => v.trim())
                .filter(Boolean)
            : [],
      };
      onSave(updated);
      toast.success("✅ Product updated successfully!");
      onClose?.();
    },
  });

  const { values, errors, touched, handleChange, handleSubmit, setFieldValue } =
    formik;

  // ✅ Example static categories
  const Categories = [
    {
      _id: "cat123",
      name: "Beverages",
      subcategories: [
        { _id: "sub1", name: "Soft Drinks" },
        { _id: "sub2", name: "Juices" },
      ],
    },
    {
      _id: "cat456",
      name: "Snacks",
      subcategories: [{ _id: "sub3", name: "Chips" }],
    },
  ];

  // ✅ File handling
  const handleFile = useCallback(
    (file) => {
      const reader = new FileReader();
      reader.onload = () => setFieldValue("img", reader.result);
      reader.readAsDataURL(file);
    },
    [setFieldValue]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file?.type.startsWith("image/")) handleFile(file);
      else toast.error("Please upload a valid image file");
    },
    [handleFile]
  );

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file?.type.startsWith("image/")) handleFile(file);
  };

  return (
    <SheetContent className="w-full sm:max-w-md overflow-hidden">
      <form onSubmit={handleSubmit}>
        <SheetHeader>
          <SheetTitle>Edit Product</SheetTitle>
          <SheetDescription>
            Update details and click “Save Changes” to apply.
          </SheetDescription>
        </SheetHeader>

        <Separator className="my-3" />

        <div className="h-[70vh] overflow-y-scroll px-5">
          <div className="space-y-5  gap-5 py-3">
            
            <div
              className={`relative border-2 border-dashed rounded-xl p-4 text-center transition cursor-pointer
                ${
                  isDragging
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() =>
                document.getElementById("img-upload-input")?.click()
              }
            >
              <input
                id="img-upload-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileInput}
              />

              <img
                src={
                  values.img ||
                  "https://via.placeholder.com/150?text=No+Image+Selected"
                }
                alt="Preview"
                className="mx-auto w-full max-w-[200px] h-[150px] rounded-md object-cover border mb-2"
              />
              <p className="text-sm text-gray-600">
                {isDragging
                  ? "Drop your image here..."
                  : "Drag & drop or click to upload"}
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                value={values.name}
                onChange={handleChange}
                placeholder="Enter product name"
              />
              {errors.name && touched.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={values.description}
                onChange={handleChange}
                placeholder="Enter description..."
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Food Type</Label>
              <div className="flex gap-2">
                {["Veg", "Non-Veg", "Egg"].map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={values.food_type === type ? "default" : "outline"}
                    onClick={() => setFieldValue("food_type", type)}
                    className="flex-1"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="item_type">Item Type</Label>
              <Input
                id="item_type"
                name="item_type"
                value={values.item_type}
                onChange={handleChange}
                placeholder="e.g., Beverage, Snack"
              />
            </div>

      
            <div className="grid gap-2">
              <Label htmlFor="variants">Variants (comma separated)</Label>
              <Input
                id="variants"
                name="variants"
                value={values.variants}
                onChange={handleChange}
                placeholder="e.g., Small, Medium, Large"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="base_price">Base Price *</Label>
              <Input
                id="base_price"
                name="base_price"
                type="number"
                min="0"
                value={values.base_price}
                onChange={handleChange}
              />
              {errors.base_price && touched.base_price && (
                <p className="text-sm text-red-500">{errors.base_price}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Category & Subcategory</Label>
              <CategorySelector
                categories={Categories}
                value={{
                  category: values.category,
                  sub: values.sub_category,
                }}
                onChange={({ category, sub }) => {
                  setFieldValue("category", category);
                  setFieldValue("sub_category", sub);
                }}
              />
            </div>
          </div>
        </div>

        <SheetFooter className="mt-4 flex justify-between">
          <SheetClose asChild>
            <Button variant="secondary" type="button">
              Cancel
            </Button>
          </SheetClose>
          <Button type="submit">Save Changes</Button>
        </SheetFooter>
      </form>
    </SheetContent>
  );
}

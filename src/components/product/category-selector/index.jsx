"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Plus } from "lucide-react";
import useCategory from "@/store/hooks/useCategory";
import { Input } from "@/components/ui/input";

// ─── Category Selector Component ────────────────────────────────────────────────
export default function CategorySelector({
  value,
  onChange,
  userId,
  projectId,
}) {
  const [selected, setSelected] = useState(value || { category: "", sub: "" });
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSubCategoryName, setNewSubCategoryName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const { categories, addCategory, addSubCategory } = useCategory(
    userId,
    projectId
  );

  // Update selected when parent value changes
  useEffect(() => {
    setSelected(value || { category: "", sub: "" });
  }, [value]);

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const handleSelect = useCallback(
    (category, sub) => {
      const newValue = { category, sub };
      setSelected(newValue);
      onChange(newValue);
    },
    [onChange]
  );

  const handleAddCategory = useCallback(async () => {
    if (!newCategoryName.trim()) return;
    await addCategory(newCategoryName.trim());
    setNewCategoryName("");
  }, [newCategoryName, addCategory]);

  const handleAddSubCategory = useCallback(async () => {
    if (!newSubCategoryName.trim() || !selectedCategoryId) return;
    await addSubCategory(selectedCategoryId, newSubCategoryName.trim());
    setNewSubCategoryName("");
  }, [newSubCategoryName, selectedCategoryId, addSubCategory]);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {selected.sub
            ? `${selected.category?.name} → ${selected.sub?.name}`
            : selected.category?.name || "Select Category"}
          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-72">
        <DropdownMenuLabel>Select Category</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <CategoryList
          categories={categories}
          onSelect={handleSelect}
          onAddSubClick={(catId) => setSelectedCategoryId(catId)}
        />

        <DropdownMenuSeparator />

        <AddCategoryButton
          newCategoryName={newCategoryName}
          setNewCategoryName={setNewCategoryName}
          onAdd={handleAddCategory}
        />

        {selectedCategoryId && (
          <>
            <DropdownMenuSeparator />
            <AddSubCategoryButton
              newSubCategoryName={newSubCategoryName}
              setNewSubCategoryName={setNewSubCategoryName}
              onAdd={handleAddSubCategory}
            />
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CategoryList({ categories, onSelect, onAddSubClick }) {
  if (!categories?.length) {
    return <DropdownMenuItem disabled>No categories found</DropdownMenuItem>;
  }

  return categories.map((cat) => (
    <DropdownMenuSub key={cat._id}>
      <DropdownMenuSubTrigger>{cat.name}</DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        {cat.subcategories?.length ? (
          cat.subcategories.map((sub) => (
            <DropdownMenuItem key={sub._id} onClick={() => onSelect(cat, sub)}>
              {sub.name}
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>No subcategories</DropdownMenuItem>
        )}

        <DropdownMenuSeparator />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddSubClick(cat._id)}
          className="flex w-full items-center justify-start gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-all hover:bg-accent/50 px-3 py-2 rounded-lg"
        >
          <Plus className="w-4 h-4" />
          Add Subcategory
        </Button>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  ));
}

function AddCategoryButton({ newCategoryName, setNewCategoryName, onAdd }) {
  return (
    <div className="px-3 py-2 flex items-center gap-2">
      <Input
        placeholder="New Category"
        value={newCategoryName}
        onChange={(e) => setNewCategoryName(e.target.value)}
        className="flex-1 h-8 text-sm"
      />
      <Button size="sm" onClick={onAdd} variant="ghost">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}

function AddSubCategoryButton({
  newSubCategoryName,
  setNewSubCategoryName,
  onAdd,
}) {
  return (
    <div className="px-3 py-2 flex items-center gap-2">
      <Input
        placeholder="New Subcategory"
        value={newSubCategoryName}
        onChange={(e) => setNewSubCategoryName(e.target.value)}
        className="flex-1 h-8 text-sm"
      />
      <Button size="sm" onClick={onAdd} variant="ghost">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}

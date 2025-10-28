"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ImageIcon,
  IndianRupee,
  Loader2,
  PackageSearch,
  Trash2,
} from "lucide-react";
import ZomatoImportPopover from "../scrape/zomato-import-popover";
import EditProductSheet from "../sheet/EditProductSheet";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const COLUMNS = [
  { key: "index", label: "#" },
  { key: "img", label: "Image" },
  { key: "name", label: "Name" },
  { key: "category", label: "Category" },
  { key: "sub_category", label: "Subcategory" },
  { key: "food_type", label: "Food Type" },
  { key: "base_price", label: "Price" },
  { key: "item_type", label: "Type" },
  { key: "action", label: "Action" },
];

export default function ProductTable({ products, isLoading, page }) {
  const [search, setSearch] = React.useState("");

  const filtered = products?.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  const showEmpty = !isLoading && (!products || products.length === 0);
  const showNoMatch =
    !isLoading && filtered.length === 0 && products.length > 0;

  const renderCell = (product, key, index) => {
    switch (key) {
      case "index":
        return (
          <span className="text-gray-700 text-center">
            {" "}
            {(page - 1) * 10 + index + 1}
          </span>
        );

      case "img":
        return product.img ? (
          <img
            src={product.img}
            alt={product.name}
            className="w-12 h-12 rounded-md object-cover shadow-sm"
          />
        ) : (
          <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center text-gray-400">
            <ImageIcon className="w-5 h-5" />
          </div>
        );

      case "category":
        return (
          <Badge variant="secondary" className="capitalize">
            {product.category?.name || "-"}
          </Badge>
        );

      case "sub_category":
        return (
          <Badge variant="outline" className="capitalize">
            {product.sub_category?.name || "-"}
          </Badge>
        );

      case "base_price":
        return (
          <span className="font-semibold flex items-center gap-1">
            <IndianRupee className="w-4 h-4" />
            {product.base_price.toFixed(2)}
          </span>
        );

      case "item_type":
        return (
          <Badge
            className={`${
              product.food_type?.toLowerCase() === "veg"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {product.food_type}
          </Badge>
        );

      case "name":
        return (
          <span className="capitalize text-gray-800 block truncate max-w-[150px]">
            {product.name}
          </span>
        );

      case "action":
        return (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteProductById(product.id)}
            className="hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        );

      default:
        return (
          <span className="capitalize text-gray-800">
            {product[key] ?? "-"}
          </span>
        );
    }
  };

  return (
    <Card className="">
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            <p className="text-gray-600 text-sm font-medium">
              Fetching your latest product list...
            </p>
          </div>
        ) : showEmpty ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
            <PackageSearch className="w-16 h-16 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-800">
              No products yet
            </h3>
            <p className="text-gray-500 text-sm">
              Once you import from Zomato or Swiggy, your items will appear
              here.
            </p>
            <ZomatoImportPopover />
          </div>
        ) : showNoMatch ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
            <PackageSearch className="w-14 h-14 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-800">
              No results found
            </h3>
            <p className="text-gray-500 text-sm">
              Try a different name or keyword.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full border rounded-md">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  {COLUMNS.map((col) => (
                    <TableHead
                      key={col.key}
                      className={
                        col.key === "index" ? "w-[50px] text-center" : ""
                      }
                    >
                      {col.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((product, i) => (
                  <Sheet key={product._id}>
                    <SheetTrigger asChild>
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: i * 0.02 }}
                        className="border-b cursor-pointer hover:bg-gray-50/60 transition-colors"
                      >
                        {COLUMNS.map((col) => (
                          <TableCell key={col.key}>
                            {renderCell(product, col.key, i)}
                          </TableCell>
                        ))}
                      </motion.tr>
                    </SheetTrigger>
                    <SheetContent>
                      <EditProductSheet product={product} onSave={() => {}} />
                    </SheetContent>
                  </Sheet>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

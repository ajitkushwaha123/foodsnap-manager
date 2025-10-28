"use client";

import * as React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useTransition, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { useProject } from "@/store/hooks/useProject";
import { useClientAuthData } from "@/lib/auth/client-auth";
import { toast } from "sonner";

const ProjectPopover = () => {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { userId } = useClientAuthData();
  const { addProject } = useProject();

  const formik = useFormik({
    initialValues: { title: "" },
    validationSchema: Yup.object({
      title: Yup.string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .required("Project name is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      if (!userId) return toast.error("User not authenticated!");

      startTransition(async () => {
        try {
          await addProject({
            projectData: { title: values.title },
            userId,
          });
          toast.success("Project created successfully!");
          resetForm();
          setOpen(false);
        } catch (err) {
          console.error("Error creating project:", err);
          toast.error("Failed to create project");
        }
      });
    },
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex w-full items-center justify-start gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-all hover:bg-accent/50 px-3 py-2 rounded-lg"
        >
          <Plus className="w-4 h-4" />
          New Project
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[280px] m-4 p-4 rounded-xl border border-border/60 bg-background/95 backdrop-blur-sm shadow-xl"
      >
        <form
          onSubmit={formik.handleSubmit}
          className="flex flex-col gap-3 animate-in fade-in-50 duration-200"
        >
          <div className="space-y-1">
            <label
              htmlFor="title"
              className="text-xs mb-2 font-medium text-muted-foreground"
            >
              Project Name
            </label>
            <Input
              id="title"
              name="title"
              placeholder="e.g. Henxs Café"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="h-9 text-sm rounded-lg border-input bg-background focus:ring-2 focus:ring-primary/40 transition-all"
            />
            {formik.touched.title && formik.errors.title && (
              <p className="text-xs text-destructive">{formik.errors.title}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="text-xs font-medium"
              disabled={isPending || formik.isSubmitting}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                  Saving...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
};

export default ProjectPopover;

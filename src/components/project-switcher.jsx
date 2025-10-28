"use client";

import * as React from "react";
import {
  ChevronsUpDown,
  Plus,
  FolderOpen,
  Trash,
  Loader2,
  Folder,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useClientAuthData } from "@/lib/auth/client-auth";
import { useProject } from "@/store/hooks/useProject";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ProjectPopover from "./global/project/add-project";
import { useActiveProjectId } from "@/store/hooks/useActiveProjectId";

function ProjectSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3 py-2 animate-pulse">
      <Skeleton className="h-6 w-6 rounded-md" />
      <div className="flex flex-col gap-1 flex-1">
        <Skeleton className="h-3 w-24 rounded" />
        <Skeleton className="h-2 w-16 rounded" />
      </div>
    </div>
  );
}

function renderLogo(project) {
  if (project?.icon) {
    const Icon = project.icon;
    return <Icon className="size-3.5 shrink-0" />;
  }
  return <Folder className="size-3.5 shrink-0 text-muted-foreground" />;
}

export function ProjectSwitcher() {
  const { isMobile } = useSidebar();
  const { userId } = useClientAuthData();
  const {
    projects,
    getAllProjects,
    deleteProjectById,
    activeProjectId,
    setAsActiveProjectId,
  } = useProject();

  const [isFetching, setIsFetching] = React.useState(true);
  const [deletingId, setDeletingId] = React.useState(null);

  React.useEffect(() => {
    if (!userId) return;
    const fetchProjects = async () => {
      try {
        setIsFetching(true);
        await getAllProjects({ userId });
      } catch (err) {
        toast.error("Failed to load projects");
      } finally {
        setIsFetching(false);
      }
    };
    fetchProjects();
  }, [userId]);

  const activeProject = projects.find((p) => p._id === activeProjectId);

  const handleSelectProject = (project) => {
    setAsActiveProjectId(project._id);
  };

  const handleDelete = async (projectId) => {
    setDeletingId(projectId);
    try {
      await deleteProjectById({ userId, projectId });
      toast.success("Project deleted successfully");

      if (activeProjectId === projectId) {
        const nextProject = projects.find((p) => p._id !== projectId);
        setAsActiveProjectId(nextProject ? nextProject._id : null);
      }
    } catch {
      toast.error("Failed to delete project");
    } finally {
      setDeletingId(null);
    }
  };

  const renderProjectItem = React.useCallback(
    (project, index) => (
      <DropdownMenuItem
        key={project._id || index}
        onClick={() => handleSelectProject(project)}
        className={`relative flex items-center gap-2 p-2 cursor-pointer rounded-md transition-all duration-200 truncate ${
          activeProjectId === project._id
            ? "bg-accent text-accent-foreground"
            : "hover:bg-muted/50"
        }`}
      >
        <div className="flex size-6 items-center justify-center rounded-md border bg-background shrink-0">
          {renderLogo(project)}
        </div>

        <span className="truncate flex-1 max-w-[160px]">{project.title}</span>

        <Button
          size="icon"
          variant="ghost"
          className="ml-auto text-destructive hover:text-destructive/80 h-6 w-6"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(project._id);
          }}
          disabled={deletingId === project._id}
        >
          {deletingId === project._id ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Trash className="size-3" />
          )}
        </Button>
      </DropdownMenuItem>
    ),
    [activeProjectId, deletingId]
  );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              disabled={isFetching}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {isFetching ? (
                <div className="flex items-center gap-3 w-full">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <div className="flex flex-col flex-1 gap-1">
                    <Skeleton className="h-3 w-24 rounded" />
                    <Skeleton className="h-2 w-16 rounded" />
                  </div>
                </div>
              ) : activeProject ? (
                <>
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    {renderLogo(activeProject)}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                    <span className="truncate font-medium max-w-[120px]">
                      {activeProject?.title}
                    </span>
                    <span className="truncate text-xs text-muted-foreground max-w-[140px]">
                      {activeProject?.url
                        ? new URL(activeProject.url).hostname
                        : "Project Workspace"}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 opacity-50 shrink-0" />
                </>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground truncate">
                  <FolderOpen className="size-4 shrink-0" />
                  <span className="truncate max-w-[150px]">No projects</span>
                </div>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs px-3">
              Projects
            </DropdownMenuLabel>

            {isFetching && (
              <div className="flex flex-col gap-2 py-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <ProjectSkeleton key={i} />
                ))}
              </div>
            )}

            {!isFetching && projects.map((p, idx) => renderProjectItem(p, idx))}

            {!isFetching && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 p-2 w-full cursor-pointer hover:bg-transparent"
                  asChild
                >
                  <ProjectPopover />
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

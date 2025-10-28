"use client";

import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import {
  deleteProject,
  fetchProjects,
  newProject,
  setActiveProjectId,
} from "../slices/projectSlice";

export const useProject = () => {
  const dispatch = useDispatch();
  const { projects, loading, error, activeProjectId } = useSelector(
    (state) => state.project
  );

  // Add a new project
  const addProject = useCallback(
    async ({ projectData, userId }) => {
      try {
        return await dispatch(newProject({ projectData, userId })).unwrap();
      } catch (err) {
        console.error("Failed to add project:", err);
        throw err;
      }
    },
    [dispatch]
  );

  // Fetch all projects
  const getAllProjects = useCallback(
    async ({ userId }) => {
      try {
        return await dispatch(fetchProjects({ userId })).unwrap();
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        throw err;
      }
    },
    [dispatch]
  );

  // Delete a project by ID
  const deleteProjectById = useCallback(
    async ({ userId, projectId }) => {
      try {
        return await dispatch(deleteProject({ userId, projectId })).unwrap();
      } catch (err) {
        console.error("Failed to delete project:", err);
        throw err;
      }
    },
    [dispatch]
  );

  // Set active project ID
  const setAsActiveProjectId = useCallback(
    (projectId) => {
      dispatch(setActiveProjectId(projectId));
    },
    [dispatch]
  );

  return {
    projects,
    activeProjectId,
    loading,
    error,
    addProject,
    getAllProjects,
    deleteProjectById,
    setAsActiveProjectId,
  };
};

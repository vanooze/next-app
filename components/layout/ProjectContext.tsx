"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { Projects } from "@/helpers/acumatica";

interface ProjectContextType {
  project: Projects | null;
  isLoading: boolean;
  error: any;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

interface ProjectProviderProps {
  children: ReactNode;
  project: Projects | null;
  isLoading: boolean;
  error: any;
}

export function ProjectProvider({ 
  children, 
  project, 
  isLoading, 
  error 
}: ProjectProviderProps) {
  return (
    <ProjectContext.Provider value={{ project, isLoading, error }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjectContext() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProjectContext must be used within a ProjectProvider");
  }
  return context;
}

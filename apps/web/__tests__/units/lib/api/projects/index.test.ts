import {
  PROJECT_KEYS,
  projectApi,
  useCreateProject,
  useDeleteProject,
  useProject,
  useProjects,
  useUpdateProject
} from '@/lib/api/projects'
import { describe, expect, it } from 'vitest'

describe('projects/index exports', () => {
  it('should export projectApi', () => {
    expect(projectApi).toBeDefined()
    expect(projectApi.getProjects).toBeDefined()
    expect(projectApi.getProjectById).toBeDefined()
    expect(projectApi.createProject).toBeDefined()
    expect(projectApi.updateProject).toBeDefined()
    expect(projectApi.deleteProject).toBeDefined()
  })

  it('should export PROJECT_KEYS', () => {
    expect(PROJECT_KEYS).toBeDefined()
    expect(PROJECT_KEYS.all).toBeDefined()
    expect(PROJECT_KEYS.lists).toBeDefined()
    expect(PROJECT_KEYS.detail).toBeDefined()
  })

  it('should export useProjects hook', () => {
    expect(useProjects).toBeDefined()
    expect(typeof useProjects).toBe('function')
  })

  it('should export useProject hook', () => {
    expect(useProject).toBeDefined()
    expect(typeof useProject).toBe('function')
  })

  it('should export useCreateProject hook', () => {
    expect(useCreateProject).toBeDefined()
    expect(typeof useCreateProject).toBe('function')
  })

  it('should export useUpdateProject hook', () => {
    expect(useUpdateProject).toBeDefined()
    expect(typeof useUpdateProject).toBe('function')
  })

  it('should export useDeleteProject hook', () => {
    expect(useDeleteProject).toBeDefined()
    expect(typeof useDeleteProject).toBe('function')
  })
})

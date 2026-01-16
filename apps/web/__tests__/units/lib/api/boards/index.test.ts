import { describe, expect, it } from "vitest"

import {
  BOARD_KEYS,
  boardApi,
  useAddBoardMember,
  useBoard,
  useBoards,
  useCreateBoard,
  useDeleteBoard,
  useUpdateBoard
} from "@/lib/api/boards"

describe("boards/index exports", () => {
  it("should export boardApi", () => {
    expect(boardApi).toBeDefined()
    expect(boardApi.getBoards).toBeDefined()
    expect(boardApi.getBoardById).toBeDefined()
    expect(boardApi.createBoard).toBeDefined()
    expect(boardApi.updateBoard).toBeDefined()
    expect(boardApi.deleteBoard).toBeDefined()
    expect(boardApi.addBoardMember).toBeDefined()
  })

  it("should export BOARD_KEYS", () => {
    expect(BOARD_KEYS).toBeDefined()
    expect(BOARD_KEYS.all).toBeDefined()
    expect(BOARD_KEYS.lists).toBeDefined()
    expect(BOARD_KEYS.detail).toBeDefined()
  })

  it("should export useBoards hook", () => {
    expect(useBoards).toBeDefined()
    expect(typeof useBoards).toBe("function")
  })

  it("should export useBoard hook", () => {
    expect(useBoard).toBeDefined()
    expect(typeof useBoard).toBe("function")
  })

  it("should export useCreateBoard hook", () => {
    expect(useCreateBoard).toBeDefined()
    expect(typeof useCreateBoard).toBe("function")
  })

  it("should export useUpdateBoard hook", () => {
    expect(useUpdateBoard).toBeDefined()
    expect(typeof useUpdateBoard).toBe("function")
  })

  it("should export useDeleteBoard hook", () => {
    expect(useDeleteBoard).toBeDefined()
    expect(typeof useDeleteBoard).toBe("function")
  })

  it("should export useAddBoardMember hook", () => {
    expect(useAddBoardMember).toBeDefined()
    expect(typeof useAddBoardMember).toBe("function")
  })
})

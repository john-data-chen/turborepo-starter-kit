import { describe, expect, it } from "vitest"

import { Board, BoardSchema } from "../../../../src/modules/boards/schemas/boards.schema"

describe("BoardSchema", () => {
  it("should be defined", () => {
    expect(BoardSchema).toBeDefined()
  })

  it("should have timestamps option enabled", () => {
    expect(BoardSchema.options.timestamps).toBe(true)
  })

  it("should have required fields defined", () => {
    const paths = BoardSchema.paths
    expect(paths.title).toBeDefined()
    expect(paths.title.options.required).toBe(true)
    expect(paths.owner).toBeDefined()
    expect(paths.owner.options.required).toBe(true)
  })

  it("should have optional fields defined", () => {
    const paths = BoardSchema.paths
    expect(paths.description).toBeDefined()
    expect(paths.description.options.required).not.toBe(true)
  })

  it("should have array fields defined", () => {
    const paths = BoardSchema.paths
    expect(paths.members).toBeDefined()
    expect(paths.projects).toBeDefined()
  })

  it("should have reference fields", () => {
    const paths = BoardSchema.paths
    expect(paths.owner.options.ref).toBe("User")
  })

  it("should have indexes defined", () => {
    const indexes = BoardSchema.indexes()
    expect(indexes.length).toBeGreaterThan(0)
    const ownerIndex = indexes.find((index) => index[0].owner === 1)
    const membersIndex = indexes.find((index) => index[0].members === 1)
    expect(ownerIndex).toBeDefined()
    expect(membersIndex).toBeDefined()
  })

  it("should create Board class instance", () => {
    const board = new Board()
    expect(board).toBeDefined()
    expect(board).toBeInstanceOf(Board)
  })
})

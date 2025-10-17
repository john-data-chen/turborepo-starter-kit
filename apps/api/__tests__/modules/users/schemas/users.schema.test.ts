import { describe, expect, it } from 'vitest'
import { User, UserSchema } from '../../../../src/modules/users/schemas/users.schema'

describe('UserSchema', () => {
  it('should be defined', () => {
    expect(UserSchema).toBeDefined()
  })

  it('should have timestamps option enabled', () => {
    expect(UserSchema.options.timestamps).toBe(true)
  })

  it('should have required fields defined', () => {
    const paths = UserSchema.paths
    expect(paths.email).toBeDefined()
    expect(paths.email.options.required).toBe(true)
    expect(paths.email.options.unique).toBe(true)
    expect(paths.name).toBeDefined()
    expect(paths.name.options.required).toBe(true)
  })

  it('should have optional fields defined', () => {
    const paths = UserSchema.paths
    expect(paths._id).toBeDefined()
    expect(paths.createdAt).toBeDefined()
    expect(paths.updatedAt).toBeDefined()
  })

  it('should have email field with index', () => {
    const emailPath = UserSchema.paths.email
    expect(emailPath).toBeDefined()
    expect(emailPath.options.index).toBe(true)
  })

  it('should have createdAt and updatedAt with default values', () => {
    const paths = UserSchema.paths
    expect(paths.createdAt.options.default).toBeDefined()
    expect(paths.updatedAt.options.default).toBeDefined()
  })

  it('should create User class instance', () => {
    const user = new User()
    expect(user).toBeDefined()
    expect(user).toBeInstanceOf(User)
  })
})

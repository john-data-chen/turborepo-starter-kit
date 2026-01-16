import { resolve } from "path"

import { config } from "dotenv"
import mongoose, { Types } from "mongoose"

import { demoBoards, demoProjects, demoTasks, demoUsers } from "@/constants/demoData"
import { Board, BoardSchema } from "@/modules/boards/schemas/boards.schema"
import { Project, ProjectSchema } from "@/modules/projects/schemas/projects.schema"
import { Task, TaskSchema } from "@/modules/tasks/schemas/tasks.schema"
import { User, UserSchema } from "@/modules/users/schemas/users.schema"

// This script should only run in a Node.js environment
if (typeof process === "undefined") {
  throw new Error("This script must be run in a Node.js environment")
}

const isProduction = process.env.NODE_ENV === "production"

// Load .env file for local development
if (!isProduction) {
  const envPath = resolve(process.cwd(), "../../.env")
  const envConfig = config({ path: envPath })
  if (envConfig.error) {
    const fallbackPath = resolve(process.cwd(), ".env")
    if (fallbackPath !== envPath) {
      config({ path: fallbackPath })
    } else {
      console.warn("Warning: No .env file found at", envPath)
      console.warn("Falling back to process environment variables")
    }
  }
}

// Validate required environment variables
const requiredEnvVars = ["DATABASE_URL"]
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar])

if (missingEnvVars.length > 0) {
  console.error(
    "\x1b[31mError: The following environment variables are required but missing:\x1b[0m"
  )
  missingEnvVars.forEach((envVar) =>{  console.error(`- ${envVar}`); })
  if (!isProduction) {
    console.error(
      "\nFor local development, please create a .env file in the project root with the required variables."
    )
  }
  process.exit(1)
}

// Extract and validate database name from DATABASE_URL
function getDatabaseNameFromUrl(url: string): string | null {
  try {
    // MongoDB URL format: mongodb://[username:password@]host[:port]/[database][?options]
    // Extract database name from the URL
    const match = url.match(/\/\/[^/]+\/([^?]+)/)
    return match && match[1] ? match[1] : null
  } catch {
    return null
  }
}

const databaseUrl = process.env.DATABASE_URL
const dbName = getDatabaseNameFromUrl(databaseUrl)
const expectedDbName = "next-project-manager"

console.log("Environment:", {
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: databaseUrl ? "***" + databaseUrl.split("@").pop() : "Not set",
  Database_Name: dbName || "test (default)"
})

// Warn if database name is missing or incorrect
if (!dbName || dbName === "test") {
  console.warn("\n\x1b[33m⚠️  WARNING: No database name specified in DATABASE_URL!\x1b[0m")
  console.warn('\x1b[33mMongoDB will use the default "test" database.\x1b[0m')
  console.warn("\x1b[33m\nExpected format:\x1b[0m")
  console.warn(
    `\x1b[36mmongodb://user:password@host:port/${expectedDbName}?authSource=admin\x1b[0m`
  )
  console.warn("\n\x1b[33mPlease update your DATABASE_URL to include the database name.\x1b[0m\n")
} else if (dbName !== expectedDbName) {
  console.warn(
    `\n\x1b[33m⚠️  WARNING: Database name is "${dbName}" but expected "${expectedDbName}"\x1b[0m`
  )
  console.warn("\x1b[33mProceeding with the specified database name...\x1b[0m\n")
}

async function main() {
  // Non-interactive check for CI/Vercel or --force flag
  const isForced = process.argv.includes("--force")
  const isCI = process.env.CI === "true" || process.env.VERCEL === "true"

  if (!isForced && !isCI) {
    console.log(
      "\x1b[33mThis script will reset the database. To run it, use the --force flag.\x1b[0m"
    )
    process.exit(0)
  }

  try {
    // Connect to MongoDB directly
    console.log("Connecting to database...")
    await mongoose.connect(process.env.DATABASE_URL, {
      serverSelectionTimeoutMS: 10000
    })
    console.log("Database connected successfully.")

    const connection = mongoose.connection

    // Get models from the connection
    const boardModel = connection.model(Board.name, BoardSchema)
    const projectModel = connection.model(Project.name, ProjectSchema)
    const taskModel = connection.model(Task.name, TaskSchema)
    const userModel = connection.model(User.name, UserSchema)

    console.log("\x1b[36mInitializing database...\x1b[0m")

    // Clear existing data
    console.log("\x1b[36mClearing existing data...\x1b[0m")
    await Promise.all([
      boardModel.deleteMany({}),
      projectModel.deleteMany({}),
      taskModel.deleteMany({}),
      userModel.deleteMany({})
    ])

    // Insert demo users with explicit _id
    const usersToInsert = demoUsers.map((user) => ({
      _id: new Types.ObjectId(),
      ...user,
      createdAt: new Date(),
      updatedAt: new Date()
    }))
    const users = await userModel.insertMany(usersToInsert)
    if (!users || users.length === 0) {
      throw new Error("No users were created. Cannot proceed without users.")
    }
    console.log(`Created ${users.length} users`)

    const boards = await boardModel.insertMany([
      {
        ...demoBoards[0], // Mark's Kanban
        owner: users[2]._id, // Mark S
        members: [users[2]._id],
        projects: []
      },
      {
        ...demoBoards[1], // John's Kanban
        owner: users[0]._id, // John
        members: [users[0]._id],
        projects: []
      },
      {
        ...demoBoards[2], // Jane's Kanban
        owner: users[1]._id, // Jane
        members: [users[1]._id],
        projects: []
      },
      {
        ...demoBoards[3], // Dev Team Board
        owner: users[1]._id, // John
        members: [users[0]._id, users[1]._id, users[2]._id], // All developers
        projects: []
      }
    ])
    console.log(`Created ${boards.length} boards`)

    const projects = await projectModel.insertMany([
      {
        ...demoProjects[0], // Mark's Todo List
        owner: users[2]._id, // Mark S
        members: [users[2]._id],
        board: boards[0]._id // Mark's Kanban
      },
      {
        ...demoProjects[1], // Demo Project 2
        owner: users[0]._id, // John
        members: [users[0]._id, users[2]._id],
        board: boards[3]._id // Dev Team Board
      },
      {
        ...demoProjects[2], // Demo Project 3
        owner: users[1]._id, // Jane
        members: [users[1]._id, users[2]._id],
        board: boards[3]._id // Dev Team Board
      }
    ])
    console.log(`Created ${projects.length} projects`)

    // Update boards with project references
    await Promise.all([
      boardModel.findByIdAndUpdate(boards[0]._id, {
        $push: { projects: projects[0]._id }
      }),
      boardModel.findByIdAndUpdate(boards[3]._id, {
        $push: { projects: { $each: [projects[1]._id, projects[2]._id] } }
      })
    ])
    // Create tasks
    const tasks = await taskModel.insertMany([
      {
        ...demoTasks[0],
        board: boards[0]._id,
        project: projects[0]._id,
        assignee: users[2]._id, // Mark S
        creator: users[2]._id,
        lastModifier: users[2]._id,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
      },
      {
        ...demoTasks[1],
        board: boards[1]._id,
        project: projects[1]._id,
        assignee: users[2]._id, // Mark
        creator: users[1]._id, // Jane
        lastModifier: users[1]._id,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
      },
      {
        ...demoTasks[2],
        board: boards[2]._id,
        project: projects[2]._id,
        assignee: users[1]._id, // Jane
        creator: users[0]._id, // John
        lastModifier: users[1]._id, // Jane
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
      }
    ])
    console.log(`Created ${tasks.length} tasks`)
    console.log("\x1b[32mDatabase initialized successfully!\x1b[0m")
    console.log("\x1b[33mYou can now log in with the following test accounts:\x1b[0m")
    users.forEach((user) => {
      console.log({
        name: user.name,
        email: user.email
      })
    })

    await mongoose.connection.close()
    process.exit(0)
  } catch (error) {
    console.error("Error during database initialization:", error)
    await mongoose.connection.close().catch((err) => {
      console.error("Failed to close connection:", err)
    })
    process.exit(1)
  }
}

main()

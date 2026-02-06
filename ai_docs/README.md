# AI Documentation

This directory contains AI context files and reusable skills for AI-assisted development.

## Quick Start

### Using PROMPTS.md as AI Context

Copy or symlink `PROMPTS.md` to your AI tool's context file location:

| AI Tool     | Target Path         |
| ----------- | ------------------- |
| Claude Code | `.claude/CLAUDE.md` |
| Gemini CLI  | `.gemini/GEMINI.md` |

**Claude Code example:**

```bash
mkdir -p .claude
ln -s ../ai_docs/PROMPTS.md .claude/CLAUDE.md
```

### Skills Installation

Skills extend AI capabilities with domain-specific knowledge.

**For Claude Code**, copy skill directories to:

```
.claude/skills/
├── vercel-composition-patterns/
├── vercel-react-best-practices/
├── vercel-react-native-best-practices/
└── web-design-guidelines/
```

**Example:**

```bash
cp -r ai_docs/skills/* .claude/skills/
```

> [!NOTE]
> For other AI tools, refer to their respective documentation for custom instructions and skills configuration.

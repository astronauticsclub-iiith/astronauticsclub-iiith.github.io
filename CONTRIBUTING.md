## Getting Started

### Prerequisites

- **Node.js** 21+ and npm
- **MongoDB** database (local or cloud instance like MongoDB Atlas)
- **Git** for version control

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Development Workflow

1. **Fork the repository**

   Click the "Fork" button on GitHub.

   ```bash
   git clone <your-fork-url>
   cd astronauticsclub-iiith.github.io
   ```

2. **Do local build**

   ```bash
   make build-dev
   ```

   Navigate to [http://localhost:3000](http://localhost:3000) to view the website and ensure it's working.

3. **Create a feature branch**

   ```bash
   git checkout -b your-feature-name
   # or
   git checkout -b your-bug-fix
   ```

4. **Make your changes**
   - Write clean, readable code
   - Add comments for complex logic
   - Follow existing code style
      - PascalCase for components, camelCase for functions/variables
      - Group imports (external, internal, relative)
      - Run `npm run format` to automatically format your code

5. **Test your changes**

   ```bash
   npm run lint        # Check for linting errors
   make build-dev      # Ensure dev build succeeds and test locally
   make build          # Ensure that production build succeeds
   ```

6. **Commit your changes**

   ```bash
   git add .
   git commit -m "feat: add new feature description"
   # or
   git commit -m "fix: fix bug description"
   ```

   Use conventional commit messages:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation
   - `style:` for formatting
   - `refactor:` for code refactoring
   - `test:` for tests
   - `chore:` for maintenance

7. **Push to your fork**

   ```bash
   git push -u origin your-feature-name
   # or
   git push -u origin your-bug-fix
   ```

8. **Create a Pull Request**
   - Go to the original repository on GitHub
   - Click "New Pull Request"
   - Select your branch
   - Fill out the PR template
   - Submit for review

### Testing Checklist

Before submitting a PR, ensure:

- [ ] Code compiles without errors
- [ ] Properly formatted and no linting errors (`npm run format`, `npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Tested in development mode
- [ ] Tested on different screen sizes (responsive)
- [ ] No console errors in browser
- [ ] API endpoints work correctly


## Project Structure

We follow a fixed directory structure for better organization and maintainability. It shall also help you to navigate the project.

### 📁 Directory Structure

```
astronauticsclub-iiith.github.io/
├── public/                     # Static assets
│   ├── data/                   # JSON data files
│   ├── icons/                  # Icon assets
│   ├── landing/                # Landing page images
│   └── gravitational-lensing/  # Special effect assets
│
├── scripts/                    # Utility scripts
│
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/                # API routes
│   │   │   ├── admin-blogs/    # Admin blog management
│   │   │   ├── auth/           # NextAuth configuration
│   │   │   ├── blogs/          # Blog CRUD API
│   │   │   ├── events/         # Event management API
│   │   │   ├── gallery/        # Gallery management
│   │   │   ├── inventory/      # Inventory management
│   │   │   ├── logs/           # Logging endpoints API
│   │   │   ├── my-blogs/       # User (club member's) own blogs
│   │   │   ├── team/           # Club member API
│   │   │   ├── upload/         # File upload endpoints
│   │   │   └── users/          # Club member profile management API
│   │   │
│   │   ├── about/              # About page
│   │   ├── blogs/              # Blog pages
│   │   │   └── [slug]/         # Individual blog post
│   │   ├── clickity-clackity-blogs-are-my-property/  # Markdown-based blog writer (protected)
│   │   ├── events/             # Events page
│   │   ├── gallery/            # Gallery page
│   │   ├── imtheboss/          # Admin dashboard (protected)
│   │   ├── let-me-innn/        # Login page
│   │   ├── stay-away-snooper/  # Unauthorized access page
│   │   ├── team/               # Team page
│   │   ├── why-is-my-profile-so-trash/  # Club member profile editor (protected)
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   └── globals.css         # Global styles
│   │
│   ├── components/             # Reusable React components
│   │   ├── admin/              # Admin-specific components
│   │   ├── common/             # Shared components
│   │   ├── features/           # Feature components
│   │   ├── layout/             # Layout components
│   │   │   ├── Footer.tsx
│   │   │   └── Navbar.tsx
│   │   │
│   │   ├── ui/                 # UI components
│   │   │   ├── CustomAlert.tsx
│   │   │   ├── CustomConfirm.tsx
│   │   │   ├── Loader.tsx
│   │   │   ├── Separator.tsx
│   │   │   └── *.css           # Component styles
│   │   │
│   │   ├── AuthProvider.tsx    # Authentication context
│   │
│   ├── context/                # React contexts
│   ├── data/                   # Data files
│   ├── hooks/                  # Custom React hooks
│   ├── lib/
│   │   ├── admin_api.ts        # Admin API functions
│   │   ├── api.ts              # API client functions
│   │   ├── auth.ts             # Authentication utilities
│   │   ├── logger.ts           # Logging utilities
│   │   └── mongodb.ts          # MongoDB connection
│   │
│   ├── models/                 # Mongoose models
│   │   ├── Blog.ts             # Blog schema
│   │   ├── Event.ts            # Event schema
│   │   ├── Inventory.ts        # Inventory schema
│   │   └── User.ts             # User schema
│   │
│   ├── types/                  # TypeScript type definitions
│   │   ├── blog.ts
│   │   ├── event.ts
│   │   ├── gallery-image.ts
│   │   ├── inventory-items.ts
│   │   ├── log-entry.ts
│   │   ├── next-auth.d.ts      # NextAuth type extensions
│   │   └── user.ts
│   │
│   └── middleware.ts           # Next.js middleware for auth
│
├── Docker-deployment/          # Docker configuration files along with utility scripts
├── nginx/                      # Nginx configuration
│
├── .env.example                # Environment variables example file
├── .env.local                  # Actual environment variables (not in repo)
├── .gitignore                  # Git ignore file
├── .prettierrc                 # Prettier configuration (formatting)
├── .prettierignore             # Prettier ignore file
│
├── ecosystem.config.js         # PM2 configuration
├── next.config.ts              # Next.js configuration
├── package.json                # Dependencies and scripts
├── tailwind.config.ts          # Tailwind CSS configuration
├── postcss.config.mjs          # Exporting CSS configuration
├── tsconfig.json               # TypeScript configuration

├── makefile                    # Makefile for build tasks
├── README.md                   # Project overview
└── CONTRIBUTING.md             # This file
```

Please follow the below guidlines when adding new pages, features or api routes:

- **API Routes**: Add API endpoints in `src/app/api/`
- **Pages**: Add new pages in `src/app/`
- **Components**: Reusable components in `src/components/`
- **Models**: Database models in `src/models/`
- **Types**: Define TypeScript types in `src/types/`
- **Utilities**: Helper functions in `src/lib/`


## 🔐 Authentication & Authorization

The website uses CAS for club member authentication in production. Unfortunately, CAS is not available in local/dev setup. Each club member has a role that determines their access level. The roles are defined as `admin`, `writer`, and `none`.

### User Roles

- **`none`**: Regular club members, can only edit their profile.
- **`writer`**: Above and also can create and edit their own blogs.
- **`admin`**: All the above and full access to admin dashboard (manage blogs, events, gallery, inventory, users).

### Protected Routes (can only be accessed by club members)

- `/let-me-innn` - Login page
- `/why-is-my-profile-so-trash` - Club member profile editor (all roles)
- `/clickity-clackity-blogs-are-my-property` - Writer dashboard (admin/writer)
- `/imtheboss` - Admin dashboard (admin only)

### Authentication Flow

1. Users authenticate via NextAuth (configure your provider in `src/app/api/auth/[...nextauth]/route.ts`)
2. Session is stored as JWT
3. Middleware (`src/middleware.ts`) protects routes based on roles
4. API routes use `requireAuth()`, `requireAdmin()`, or `requireWriter()` from `src/lib/auth.ts`


## 🔌 API Endpoints

Below is a list of available API endpoints along with their methods and access levels. We use RESTful conventions for endpoint design. Soon we will adding tests for these endpoints as well.

### Authentication

- `GET/POST /api/auth/[...nextauth]` - NextAuth endpoints

### Blogs

- `GET /api/blogs` - Get all approved blogs
- `GET /api/blogs/[slug]` - Get blog by slug
- `POST /api/blogs` - Create new blog (writer/admin)
- `PUT /api/blogs/[slug]` - Update blog (writer/admin)
- `DELETE /api/blogs/[slug]` - Delete blog (writer/admin)
- `GET /api/my-blogs` - Get current user's blogs
- `GET /api/admin-blogs` - Get all blogs including unapproved (admin)

### Events

- `GET /api/events` - Get all events
- `GET /api/events/admin` - Admin event management (admin)
- `POST /api/events` - Create event (admin)
- `PUT /api/events/[id]` - Update event (admin)
- `DELETE /api/events/[id]` - Delete event (admin)

### Gallery

- `GET /api/gallery` - Get all gallery images
- `GET /api/gallery/admin` - Admin gallery management (admin)
- `POST /api/gallery` - Upload image (admin)
- `DELETE /api/gallery/[id]` - Delete image (admin)

### Inventory

- `GET /api/inventory/admin` - Get all the inventory items (admin)
- `POST /api/inventory/admin` - Add inventory item (admin)
- `PUT /api/inventory/admin/[id]` - Update inventory item (admin)
- `DELETE /api/inventory/admin/[id]` - Delete inventory item (admin)

### Team

- `GET /api/team` - Get all the club members
- `POST /api/team` - Add club member (admin)
- `PUT /api/team/[id]` - Update club member (admin)
- `DELETE /api/team/[id]` - Remove club member (admin)

### Users (Club Members profiles)

- `GET /api/users/me` - Get current user profile
- `GET /api/users/[id]` - Get user by ID
- `GET /api/users` - Get all users (admin)
- `PUT /api/users/me` - Update current user profile
- `PUT /api/users/[id]` - Update user (admin)

### Upload

- `POST /api/upload` - Upload file
- `GET /api/upload` - List uploaded files
- `POST /api/upload/avatar` - Upload avatar image

### Logs

- `GET /api/logs` - Get application logs (admin)


## Deployment

Below are the guidelines to deploy via PM2 (a Node Project manager). For deployment using `Docker`, refer to the `Docker-deployment/README.md` file.`

1. **Build the application**

   ```bash
   make build
   ```

2. **Start with PM2**

   ```bash
   pm2 start ecosystem.config.js
   ```

3. **Manage PM2**

   ```bash
   pm2 status          # Check status
   pm2 logs            # View logs
   pm2 restart all     # Restart
   pm2 stop all        # Stop
   ```

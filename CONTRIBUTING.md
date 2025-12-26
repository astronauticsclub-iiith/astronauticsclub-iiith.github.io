## 🚀 Getting Started

### Prerequisites

- **Node.js** 21+ and npm/yarn/pnpm
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
   make build
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
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation if needed

5. **Test your changes**

   ```bash
   npm run lint        # Check for linting errors
   npm run build       # Ensure build succeeds
   npm run dev         # Test locally
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

Note: CAS is not available in local/dev setup.

## Project Structure Guidelines

- **Pages**: Add new pages in `src/app/`
- **Components**: Reusable components in `src/components/`
- **API Routes**: Add API endpoints in `src/app/api/`
- **Types**: Define TypeScript types in `src/types/`
- **Models**: Database models in `src/models/`
- **Utilities**: Helper functions in `src/lib/`

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
│   │   │   ├── logs/           # Logging endpoints API
│   │   │   ├── my-blogs/       # User (club member's) own blogs
│   │   │   ├── team/           # Team member API
│   │   │   ├── upload/         # File upload endpoints
│   │   │   └── users/          # User profile management API
│   │   │
│   │   ├── blogs/              # Blog pages
│   │   │   └── [slug]/         # Individual blog post
│   │   ├── events/             # Events page
│   │   ├── gallery/            # Gallery page
│   │   ├── team/               # Team page
│   │   ├── about/              # About page
│   │   ├── imtheboss/          # Admin dashboard (protected)
│   │   ├── clickity-clackity-blogs-are-my-property/  # Markdown-based blog writer (protected)
│   │   ├── let-me-innn/        # Login page
│   │   ├── stay-away-snooper/  # Unauthorized access page
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   └── globals.css         # Global styles
│   │
│   ├── components/             # React components
│   │   ├── admin/              # Admin-specific components
│   │   ├── common/             # Shared components
│   │   ├── features/           # Feature components
│   │   │   ├── Blog/           # Blog-related components
│   │   │   ├── Landing/        # Landing page components
│   │   │   ├── AboutUsSection.tsx
│   │   │   ├── EventTimeline.tsx
│   │   │   ├── FAQSection.tsx
│   │   │   ├── GalleryIcon.tsx
│   │   │   ├── GravitationalLensing.tsx
│   │   │   ├── ProfileEditor.tsx
│   │   │   ├── TeamCard.tsx
│   │   │   └── WhimsicalEventsIcon.tsx
│   │   │
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
│   │   └── MarkdownEditor.tsx  # Markdown editor component
│   │
│   ├── context/                # React contexts
│   │   ├── ImagePreviewContext.tsx
│   │   └── WhimsyContext.tsx
│   │
│   ├── hooks/                  # Custom React hooks
│   │   └── useAlert.ts
│   │
│   ├── lib/                    # Utility libraries
│   │   ├── api.ts              # API client functions
│   │   ├── auth.ts             # Authentication utilities
│   │   ├── logger.ts           # Logging utilities
│   │   └── mongodb.ts          # MongoDB connection
│   │
│   ├── models/                 # Mongoose models
│   │   ├── Blog.ts             # Blog schema
│   │   ├── Event.ts            # Event schema
│   │   └── User.ts             # User schema
│   │
│   ├── types/                  # TypeScript type definitions
│   │   ├── blog.ts
│   │   ├── event.ts
│   │   ├── gallery-image.ts
│   │   ├── log-entry.ts
│   │   ├── next-auth.d.ts      # NextAuth type extensions
│   │   └── user.ts
│   │
│   ├── data/                   # Data files
│   │   └── blogs.json          # Blog seed data
│   │
│   └── middleware.ts           # Next.js middleware for auth
│
├── Docker-deployment/          # Docker configuration files
│   ├── docker-compose.yml      # Production Docker Compose config
│   ├── docker-compose.dev.yml  # Development Docker Compose config
│   ├── Dockerfile              # Production Dockerfile
│   ├── Dockerfile.dev          # Development Dockerfile
│   ├── Makefile                # Docker management commands
│   ├── nginx/                  # Nginx configuration
│   │   ├── nginx.conf          # Main Nginx config
│   │   └── conf.d/             # Nginx server configs
│   └── scripts/                # Docker utility scripts
│       ├── backup-*.sh         # Backup scripts
│       ├── restore-*.sh        # Restore scripts
│       └── test-docker-setup.sh
│
├── .env.example                # Environment variables (in repo)
├── .env.local                  # Environment variables (not in repo)
├── ecosystem.config.js         # PM2 configuration
├── next.config.ts              # Next.js configuration
├── package.json                # Dependencies and scripts
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── README.md                   # Project overview
└── CONTRIBUTING.md             # This file
```

## 🔐 Authentication & Authorization

The application uses **NextAuth.js** for authentication with role-based access control.

### User Roles

- **`admin`**: Full access to admin dashboard, can manage all content and users
- **`writer`**: Can create and edit their own blogs, access writer dashboard
- **`none`**: Regular user, can view public content

### Protected Routes (can only be accessed by club members)

- `/imtheboss` - Admin dashboard (admin only)
- `/clickity-clackity-blogs-are-my-property` - Writer dashboard (admin/writer)
- `/let-me-innn` - Login page

### Authentication Flow

1. Users authenticate via NextAuth (configure your provider in `src/app/api/auth/[...nextauth]/route.ts`)
2. Session is stored as JWT
3. Middleware (`src/middleware.ts`) protects routes based on roles
4. API routes use `requireAuth()`, `requireAdmin()`, or `requireWriter()` from `src/lib/auth.ts`

### Creating Users

Users are stored in MongoDB. To create an admin user:

```bash
node scripts/add-admin-user.js
```

Or manually insert into MongoDB:

```javascript
{
  email: "admin@example.com",
  name: "Admin User",
  role: "admin",
  designations: ["President"],
  createdAt: new Date(),
  updatedAt: new Date()
}
```

## 🗄️ Database Models

### User Model

```typescript
{
  email: string;              // Unique, required
  name?: string;
  role: 'admin' | 'writer' | 'none';  // Required, default: 'none'
  designations?: string[];    // Array of role titles
  avatar?: string;            // URL to avatar image
  bio?: string;
  linkedin?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Blog Model

```typescript
{
  id: string;                 // Unique identifier
  title: string;              // Required
  slug: string;               // Unique, indexed
  excerpt: string;            // Required
  content: string;            // Markdown content
  author: { email: string };  // Required
  publishedAt: string;        // ISO date string
  readTime: number;           // Minutes
  tags: string[];             // Array of tags
  approved: boolean;          // Default: false
  images: string[];           // Array of image URLs
  views: number;              // Default: 0
  likes: number;              // Default: 0
  likedBy: string[];          // Array of user emails
  createdAt: Date;
  updatedAt: Date;
}
```

### Event Model

```typescript
{
  id: string;                 // Unique identifier
  title: string;              // Required
  description: string;        // Required
  date: string;               // ISO date string
  time?: string;              // Optional time (e.g., "19:00")
  location?: string;
  type: 'stargazing' | 'starparty' | 'astrophotography' |
        'theory' | 'competition' | 'workshop' | 'project' | 'other';
  image?: string;             // URL to event image
  participants?: number;
  organizer?: string;
  registrationLink?: string;  // Optional registration URL
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}
```

## 🔌 API Endpoints

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
- `POST /api/events` - Create event (admin)
- `PUT /api/events/[id]` - Update event (admin)
- `DELETE /api/events/[id]` - Delete event (admin)
- `GET /api/events/admin` - Admin event management (admin)

### Gallery

- `GET /api/gallery` - Get all gallery images
- `POST /api/gallery` - Upload image (admin)
- `DELETE /api/gallery/[id]` - Delete image (admin)
- `GET /api/gallery/admin` - Admin gallery management (admin)

### Users

- `GET /api/users/me` - Get current user profile
- `GET /api/users/[id]` - Get user by ID
- `PUT /api/users/me` - Update current user profile
- `PUT /api/users/[id]` - Update user (admin)
- `GET /api/users` - Get all users (admin)

### Team

- `GET /api/team` - Get all team members
- `POST /api/team` - Add team member (admin)
- `PUT /api/team/[id]` - Update team member (admin)
- `DELETE /api/team/[id]` - Remove team member (admin)

### Upload

- `POST /api/upload` - Upload file
- `GET /api/upload` - List uploaded files
- `POST /api/upload/avatar` - Upload avatar image

### Logs

- `GET /api/logs` - Get application logs (admin)

## 🎨 Key Components

### Landing Page Components

- **Hero**: Main landing section with gravitational lensing effect
- **WhoWeAre**: Club introduction section
- **BlogsShowcase**: Featured blogs display

### Blog Components

- **BlogCard**: Blog preview card
- **BlogsShowcase**: Grid/list view of blogs
- **MarkdownEditor**: Rich markdown editor with preview
- **BlogPreview**: Blog content renderer with syntax highlighting

### Event Components

- **EventTimeline**: Timeline view of events
- **WhimsicalEventsIcon**: Animated events icon

### Admin Components

- **AdminEventCard**: Event management card
- **AdminPhotoCard**: Gallery image management card
- **DesignationCombobox**: Team designation selector
- **ImageSelector**: Image picker component

### UI Components

- **AstroLoader**: Custom loading spinner
- **ClickableImage**: Image with click-to-preview
- **CustomAlert**: Custom alert dialog
- **CustomConfirm**: Custom confirmation dialog
- **Separator**: Visual separators (Wave, Cloud)

## 🚢 Deployment

### Docker Production Deployment

1. **Navigate to Docker directory**

   ```bash
   cd Docker-deployment
   ```

2. **Configure environment**

   Create `.env.local` with production values:

   ```env
   MONGODB_URI=your-production-mongodb-uri
   NEXTAUTH_SECRET=your-production-secret
   NEXTAUTH_URL=https://your-domain.com/astronautics
   NEXT_PUBLIC_BASE_PATH=/astronautics
   ```

3. **Build and start**

   ```bash
   docker-compose up -d --build
   ```

   Or use Makefile:

   ```bash
   make build
   make start
   ```

4. **View logs**

   ```bash
   docker-compose logs -f
   # or
   make logs
   ```

5. **Stop services**

   ```bash
   docker-compose down
   # or
   make stop
   ```

### PM2 Deployment

1. **Build the application**

   ```bash
   npm run build
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

### Data Management

#### Backup Uploads

```bash
cd Docker-deployment
make backup-uploads
# Creates uploads_backup_YYYYMMDD_HHMMSS.zip
```

#### Restore Uploads

```bash
make restore-uploads FILE=path/to/backup.zip
```

#### Backup Logs

```bash
make backup-logs
```

#### Download Uploads

```bash
make download-uploads
# Downloads uploads as ZIP file
```

### Code Style & Quality

We use **ESLint** for linting, **Prettier** for code formatting, and **TypeScript** for static type checking.

- **TypeScript**: Use TypeScript for all new code
- **Components**: Use functional components with hooks
- **Naming**: Use PascalCase for components, camelCase for functions/variables
- **Imports**: Group imports (external, internal, relative)
- **Formatting**: Run `npm run format` to automatically format your code
- **Comments**: Add JSDoc comments for complex functions

#### Commands

- **Format Code**: `npm run format`
- **Check Format**: `npm run check-format`
- **Lint Code**: `npm run lint`
- **Type Check**: `npm run type-check`

Please ensure all checks pass before submitting a Pull Request.

### Testing Checklist

Before submitting a PR, ensure:

- [ ] Code compiles without errors
- [ ] No linting errors (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Tested in development mode
- [ ] Tested on different screen sizes (responsive)
- [ ] No console errors in browser
- [ ] API endpoints work correctly
- [ ] Authentication/authorization works as expected

## 📚 Additional Resources

### Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [MongoDB Documentation](https://docs.mongodb.com)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### External Links

- [IIIT Hyderabad](https://www.iiit.ac.in)
- [Astronautics Club](https://clubs.iiit.ac.in/astronautics)

### Docker Development Setup

1. **Navigate to Docker directory**

   ```bash
   cd Docker-deployment
   ```

2. **Create `.env.local` file** (same as above)
3. **Build and start containers**

   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

   Or use the Makefile:

   ```bash
   make build-dev
   make start-dev
   ```

4. **View logs**

   ```bash
   make logs-dev
   ```

5. **Stop containers**

   ```bash
   make stop-dev
   ```

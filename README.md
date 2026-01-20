# Taskorium

A modern, full-stack project management application built with Next.js and Express, designed to streamline team collaboration and task management.

![Project Management](https://img.shields.io/badge/Project-Management-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)

## 🚀 Features

- **📊 Project Management** - Create, organize, and track projects with ease
- **✅ Task Tracking** - Comprehensive task management with priorities, statuses, and assignments
- **👥 Team Collaboration** - Manage teams, assign roles, and coordinate work
- **🔍 Advanced Search** - Quickly find projects, tasks, and team members
- **📈 Timeline View** - Visualize project timelines and deadlines
- **💬 Comments & Attachments** - Collaborate with comments and file attachments
- **📱 Responsive Design** - Beautiful UI that works on all devices
- **🎨 Modern UI** - Built with Material-UI, Tailwind CSS, and Framer Motion

## 🛠️ Tech Stack

### Frontend

- **Framework:** Next.js 16 (React 19)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, Material-UI, Styled Components
- **State Management:** Redux Toolkit with Redux Persist
- **UI Components:**
  - Material-UI (MUI) for data grids and core components
  - Lucide React for icons
  - Recharts for data visualization
  - Framer Motion for animations
- **Additional Libraries:**
  - React DnD for drag-and-drop functionality
  - Gantt Task React for project timeline visualization
  - React Scroll Parallax for smooth scrolling effects

### Backend

- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Security:** Helmet, CORS
- **Logging:** Morgan
- **Development:** Nodemon, tsx for hot reloading

## 📁 Project Structure

```
Taskorium/
├── client/                 # Next.js frontend application
│   ├── app/               # Next.js app directory
│   │   ├── (components)/  # Shared components
│   │   ├── home/          # Home page
│   │   ├── projects/      # Projects management
│   │   ├── priority/      # Priority view
│   │   ├── timeline/      # Timeline view
│   │   ├── teams/         # Team management
│   │   ├── users/         # User management
│   │   ├── search/        # Search functionality
│   │   └── settings/      # Settings page
│   ├── components/        # Reusable components
│   ├── state/             # Redux state management
│   ├── lib/               # Utility functions
│   └── public/            # Static assets
│
└── server/                # Express backend application
    ├── src/
    │   ├── routes/        # API routes
    │   │   ├── projectRoutes.ts
    │   │   ├── taskRoutes.ts
    │   │   ├── userRoutes.ts
    │   │   ├── teamsRoutes.ts
    │   │   └── searchRoutes.ts
    │   └── index.ts       # Server entry point
    ├── prisma/
    │   ├── schema.prisma  # Database schema
    │   └── seed.ts        # Database seeding
    └── lib/               # Utility functions
```

## 📊 Database Schema

The application uses Prisma ORM with PostgreSQL and includes the following models:

- **User** - User accounts with profile information
- **Team** - Team organization with product owners and project managers
- **Project** - Projects with descriptions and timelines
- **Task** - Tasks with priorities, statuses, and assignments
- **ProjectTeam** - Many-to-many relationship between projects and teams
- **TaskAssignment** - Task assignments to users
- **Comment** - Task comments
- **Attachment** - File attachments for tasks

## 🚦 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Taskorium
   ```

2. **Install dependencies**

   For the client:

   ```bash
   cd client
   npm install
   ```

   For the server:

   ```bash
   cd server
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the `server` directory:

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/taskorium"
   PORT=8000
   ```

   Create a `.env.local` file in the `client` directory:

   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   ```

4. **Set up the database**
   ```bash
   cd server
   npx prisma generate
   npx prisma migrate dev
   npm run seed  # Optional: seed with sample data
   ```

### Running the Application

1. **Start the backend server**

   ```bash
   cd server
   npm run dev
   ```

   The server will run on `http://localhost:8000`

2. **Start the frontend application**

   ```bash
   cd client
   npm run dev
   ```

   The application will run on `http://localhost:3000`

3. **Open your browser**
   Navigate to `http://localhost:3000` to see the application

## 📝 Available Scripts

### Client

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Server

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm run seed` - Seed the database with sample data

## 🔌 API Endpoints

The backend provides the following API routes:

- `/projects` - Project management endpoints
- `/tasks` - Task management endpoints
- `/users` - User management endpoints
- `/teams` - Team management endpoints
- `/search` - Search functionality endpoints

## 🎨 UI Features

- **Responsive Dashboard** - Adaptive layout for all screen sizes
- **Data Grids** - Powerful data tables with sorting and filtering
- **Gantt Charts** - Visual project timeline representation
- **Drag & Drop** - Intuitive task organization
- **Dark Mode Support** - Eye-friendly dark theme
- **Smooth Animations** - Polished user experience with Framer Motion

## 🔒 Security

- **Helmet.js** - Secure HTTP headers
- **CORS** - Cross-origin resource sharing configuration
- **Input Validation** - Request validation and sanitization

## 🚀 Deployment

### Frontend (Vercel)

The Next.js application can be easily deployed to Vercel:

```bash
cd client
vercel
```

### Backend (Railway/Render/Heroku)

The Express server can be deployed to any Node.js hosting platform:

```bash
cd server
npm run build
npm start
```

Make sure to:

- Set up environment variables on your hosting platform
- Configure PostgreSQL database
- Update CORS settings for production domains

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Pratik Patil**

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Prisma team for the excellent ORM
- Material-UI for beautiful components
- All open-source contributors

---

**Built with ❤️ using Next.js and Express**

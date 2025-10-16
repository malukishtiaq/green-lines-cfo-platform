# Green Lines CFO Platform - HQ Console

This is the admin dashboard for the Green Lines CFO Platform, built with Next.js 14, TypeScript, and Ant Design Pro.

## Features

- **Modern Dashboard**: Clean, responsive admin interface with sidebar navigation
- **Authentication**: Secure login system with NextAuth.js
- **Database Integration**: PostgreSQL with Prisma ORM
- **Real-time Updates**: Live data updates and notifications
- **Task Management**: Comprehensive task assignment and tracking
- **Customer Management**: Complete customer lifecycle management
- **Service Plans**: Flexible service plan configuration
- **Analytics**: Business intelligence and reporting

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Ant Design Pro, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **Styling**: Ant Design Pro Components, Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/malukishtiaq/green-lines-cfo-platform.git
   cd green-lines-cfo-platform/apps/hq-console
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update the `.env.local` file with your database credentials:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/green_lines_cfo"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Create a demo admin user**
   ```bash
   npx prisma db seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Demo Credentials

- **Email**: admin@greenlines.com
- **Password**: password123

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── DashboardLayout.tsx
│   ├── DashboardPage.tsx
│   └── Providers.tsx
├── lib/                   # Utility libraries
│   ├── auth.ts            # NextAuth configuration
│   └── prisma.ts          # Prisma client
└── types/                 # TypeScript type definitions
```

## Database Schema

The application uses a comprehensive database schema with the following main entities:

- **Users**: Admin users, managers, and agents
- **Customers**: Client companies and contacts
- **Service Plans**: Different CFO service offerings
- **Tasks**: Work items and assignments
- **Communications**: Customer interaction logs
- **Settings**: System configuration

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Database Management

- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma generate` - Generate Prisma client
- `npx prisma db push` - Push schema changes to database
- `npx prisma migrate dev` - Create and apply migrations

## Deployment

The application is configured for deployment on Vercel:

1. **Connect your GitHub repository to Vercel**
2. **Set environment variables in Vercel dashboard**
3. **Deploy automatically on every push to main branch**

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.
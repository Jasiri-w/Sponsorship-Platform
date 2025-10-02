# Sponsorship Platform

A modern web application built with Next.js, Tailwind CSS and Supabase for managing sponsorships, events, and user profiles. This platform facilitates connections between event organizers and potential sponsors.

## Features

- **User Authentication**: Secure sign-up and login functionality
- **Role-Based Access**: Different user roles including Admin, Sponsor, and Organizer
- **Profile Management**: Users can view and edit their profile information
- **Sponsorship Management**: Create, view, and manage sponsorship opportunities
- **Event Management**: Organize and manage events with sponsor tracking
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **State Management**: React Context API
- **Form Handling**: React Hook Form
- **UI Components**: Custom component library

## Prerequisites

- Node.js 18.0.0 or later
- npm or yarn
- Supabase account and project

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/sponsorship-platform.git
   cd sponsorship-platform
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
sponsorship-platform/
├── src/
│   ├── app/                    # App router and pages
│   ├── components/             # Reusable UI components
│   ├── context/                # React context providers
│   ├── lib/                    # Utility functions and helpers
│   ├── styles/                 # Global styles and Tailwind config
│   └── types/                  # TypeScript type definitions
├── public/                     # Static assets
└── .env.local                  # Environment variables (not versioned)
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Environment Variables

Create a `.env.local` file with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Deployment

The easiest way to deploy this application is using [Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

1. Push your code to a GitHub repository
2. Import the repository into Vercel
3. Add your environment variables in the Vercel project settings
4. Deploy!

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

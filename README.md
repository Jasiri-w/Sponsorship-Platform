# Sponsorship Platform

A comprehensive web application for managing sponsorship partnerships, tiers, and events.

<img width="1860" height="359" alt="image" src="https://github.com/user-attachments/assets/b5a0f6f3-22d4-4baf-b8f8-ce1aa57b72bd" />

## Features

- **Dashboard**: Overview of sponsors, total sponsorship amounts, and upcoming events
- **Sponsor Management**: Add, edit, view, and manage sponsor profiles with logos and contact information
- **Tier System**: Flexible sponsorship tiers with custom pricing
- **Event Management**: Create and manage sponsorship events
- **File Upload**: Logo and document management with Supabase storage
- **Responsive Design**: Mobile-friendly interface matching Figma mockups

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS with custom salmon/pink theme
- **Database**: PostgreSQL via Supabase
- **Storage**: Supabase Storage for file uploads
- **Icons**: Lucide React

## Database Schema

The application uses three main tables:

- **tiers**: Sponsorship tiers with pricing and descriptions
- **sponsors**: Sponsor information linked to tiers with fulfillment status
- **events**: Events that can be associated with sponsors

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- A Supabase project with PostgreSQL database

### 1. Clone and Install

```bash
git clone <repository-url>
cd Sponsorship-Platform
npm install
```

### 2. Environment Configuration

Update the `.env.local` file with your Supabase credentials:

```env
# Your Supabase project URL (found in Project Settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Your Supabase anon/public key (found in Project Settings > API)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Database Setup

Run these SQL commands in your Supabase SQL editor to create the required tables:

```sql
-- Create tiers table
CREATE TABLE tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('Standard', 'Custom')) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sponsors table
CREATE TABLE sponsors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    tier_id UUID REFERENCES tiers(id) ON DELETE SET NULL,
    fulfilled BOOLEAN DEFAULT FALSE,
    logo_url TEXT,
    sponsorship_agreement_url TEXT,
    invoice_url TEXT,
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    description TEXT,
    sponsor_id UUID REFERENCES sponsors(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for sponsor files (run in Supabase Storage)
INSERT INTO storage.buckets (id, name, public) VALUES ('sponsor-files', 'sponsor-files', true);
```

### 4. Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Image Handling Fix

The application includes robust image handling that resolves Next.js image configuration issues:

- **ImageWithFallback Component**: Handles broken URLs, invalid URLs, and loading states
- **Next.js Config**: Configured to allow common image hosting domains
- **Graceful Degradation**: Shows fallback icons when images fail to load

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

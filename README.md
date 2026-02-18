
# BFI: Bharath Film Industry Platform

A secure, scalable investment platform connecting common investors with cinematic productions.

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Open Application**
   Navigate to `http://localhost:5173`

## 🔐 Credentials & Roles

The application uses Supabase Authentication. You can sign up with any email.

- **Investor**: Can view Active projects and make investments (Bank Transfer).
- **Director**: Can submit project synopses (Status: PENDING by default).
- **Admin**: Can view Pending projects and Approve/Reject them.

## 🗄️ Database Setup (Supabase)

If the application shows no data or errors, run the SQL commands in `supabase_schema.sql` in your Supabase SQL Editor.

## 📱 Features Implemented

1. **Marketplace (Explore)**: Lists only APPROVED projects.
2. **Admin Dashboard**: Approves/Rejects project submissions.
3. **BFI Escrow**: Secure bank transfer instruction modal for investments.
4. **Director Studio**: Submission portal for new film projects.
5. **AI Intellect**: Integrated Gemini AI advisor (requires `VITE_GOOGLE_API_KEY` in `.env`).

## 🛠️ Tech Stack

- **Frontend**: React (Vite) + TypeScript
- **Styling**: Tailwind CSS (CDN for rapid prototyping, Config ready for build)
- **Backend**: Supabase (Auth + Database)
- **AI**: Google Gemini API

## 📱 Mobile Build

To build for Android/iOS:
1. Initialize Capacitor: `npx cap init`
2. Add Platform: `npx cap add android`
3. Build App: `npm run build`
4. Sync: `npx cap sync`

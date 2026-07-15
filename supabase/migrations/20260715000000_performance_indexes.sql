-- Performance Optimization Indexes

-- Profiles table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Projects table indexes
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_director_id ON public.projects("directorId");

-- Investments table indexes
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON public.investments("userId");
CREATE INDEX IF NOT EXISTS idx_investments_project_id ON public.investments("projectId");
CREATE INDEX IF NOT EXISTS idx_investments_status ON public.investments(status);

-- Movie Bookings table indexes
CREATE INDEX IF NOT EXISTS idx_movie_bookings_user_id ON public.movie_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_movie_bookings_movie_id ON public.movie_bookings(movie_id);
CREATE INDEX IF NOT EXISTS idx_movie_bookings_status ON public.movie_bookings(status);
CREATE INDEX IF NOT EXISTS idx_movie_bookings_payment_status ON public.movie_bookings(payment_status);

-- Payments table indexes
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_status ON public.payments(payment_status);

-- Notifications table indexes
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- Date sorting indexes
CREATE INDEX IF NOT EXISTS idx_investments_date ON public.investments(date);
CREATE INDEX IF NOT EXISTS idx_movie_bookings_created_at ON public.movie_bookings(created_at);

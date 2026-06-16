import React, { useState } from 'react';
import { User } from '../types';
import { GraduationCap, Award, BookOpen, UserCheck, Play, ArrowRight, ShieldCheck, Heart } from 'lucide-react';

interface StudentDashboardProps {
  user: User;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user }) => {
  const [activeCourse, setActiveCourse] = useState<string | null>(null);
  const [grantApplied, setGrantApplied] = useState(false);

  const courses = [
    { id: '1', title: 'Independent Filmmaking: Zero to Hero', instructor: 'Prathapaneni Roopchandu', duration: '8 Hours (Self-paced)', lessons: 12, rating: '5.0 ★' },
    { id: '2', title: 'Cinematography Masterclass: Lighting the Scene', instructor: 'S. Raj', duration: '6 Hours (Video Course)', lessons: 10, rating: '4.9 ★' },
    { id: '3', title: 'Introduction to Film Finance & Escrow Models', instructor: 'BFI Compliance Team', duration: '3 Hours', lessons: 5, rating: '4.8 ★' }
  ];

  const handleApplyGrant = () => {
    setGrantApplied(true);
    alert("Grant Application Submitted: Your proposal has been sent to the BFI Community Fund review board.");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-slate-200">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Active Courses', val: courses.length, icon: '🎓', color: 'text-amber-500' },
          { label: 'Community Grants', val: grantApplied ? '1 Applied' : '₹50K Available', icon: '❤️', color: 'text-red-500' },
          { label: 'Assigned Mentor', val: 'Director P. Roopchandu', icon: '🤝', color: 'text-blue-500' },
          { label: 'Masterclass Certificates', val: '0 Earned', icon: '🏆', color: 'text-yellow-400' }
        ].map((m, i) => (
          <div key={i} className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl shadow-xl flex items-center justify-between">
            <div>
              <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest">{m.label}</p>
              <h3 className="text-sm font-black text-white mt-1 leading-snug">{m.val}</h3>
            </div>
            <span className="text-3xl">{m.icon}</span>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Course Catalog */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/30 border border-slate-850 rounded-[2rem] p-8 space-y-6">
            <div>
              <h3 className="text-xl font-serif text-white">Film Education &amp; Workshops</h3>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Learn directly from Pan-India blockbusters instructors</p>
            </div>

            <div className="space-y-4">
              {courses.map(course => (
                <div key={course.id} className="p-6 bg-zinc-950/60 border border-zinc-900 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="p-2.5 bg-yellow-500/10 text-yellow-500 rounded-xl"><BookOpen size={16} /></span>
                      <h4 className="text-sm font-bold text-white">{course.title}</h4>
                    </div>
                    <p className="text-xs text-slate-400">Instructor: <strong className="text-white">{course.instructor}</strong> • {course.duration}</p>
                    <p className="text-[10px] text-zinc-500 uppercase font-black tracking-wider">{course.lessons} Lectures &nbsp;|&nbsp; Rating: {course.rating}</p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveCourse(course.title);
                      alert(`Access Granted: Welcome to "${course.title}". Start learning now.`);
                    }}
                    className="px-5 py-2.5 bg-yellow-500 text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-yellow-400 transition-all flex items-center gap-1 shrink-0"
                  >
                    Start Class <Play size={10} fill="black" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BFI Community Fund Card */}
        <div className="space-y-6">
          <div className="bg-slate-900/30 border border-slate-850 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="space-y-2">
              <h3 className="text-lg font-serif text-white flex items-center gap-2">
                <Heart className="text-red-500" size={20} /> BFI Community Fund
              </h3>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Supporting student &amp; experimental films</p>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              A portion of profits from successful BFI projects is automatically pooled back to fund new, emerging, and experimental film student creators.
            </p>

            <div className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800 space-y-2">
              <p className="text-[9px] font-black uppercase text-white tracking-widest">Active Grants Program</p>
              <p className="text-xs text-slate-400">Up to ₹1,00,000 for thesis films &amp; short film projects. Submission requires active student certification.</p>
            </div>

            <button
              onClick={handleApplyGrant}
              disabled={grantApplied}
              className="w-full py-4 bg-red-500 hover:bg-red-600 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-white font-black uppercase text-xs tracking-widest rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {grantApplied ? 'Application Pending' : <>Apply for Student Grant <ArrowRight size={14} /></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

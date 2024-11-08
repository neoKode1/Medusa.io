import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { 
  BarChart, 
  Image as ImageIcon, 
  Video, 
  MessageSquare,
  Plus,
  TrendingUp,
  LogOut
} from 'lucide-react';

const Dashboard = () => {
  const router = useRouter();
  const [stats] = useState({
    images: {
      total: 156,
      trend: '+12%',
      recent: 24
    },
    videos: {
      total: 43,
      trend: '+8%',
      recent: 7
    },
    prompts: {
      total: 289,
      trend: '+15%',
      recent: 45
    }
  });

  const handleLogout = () => {
    router.push('/');
  };

  const StatCard = ({ title, icon: Icon, data }) => (
    <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg border border-white/20 
      transition-all duration-300 hover:scale-105 hover:bg-white/15 hover:border-white/30 
      hover:shadow-xl cursor-pointer group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Icon className="w-6 h-6 text-blue-400 group-hover:text-blue-300" />
          <h3 className="text-lg font-semibold text-white group-hover:text-white/90">{title}</h3>
        </div>
        <span className="text-green-400 group-hover:text-green-300">{data.trend}</span>
      </div>
      <div className="space-y-2">
        <p className="text-3xl font-bold text-white group-hover:text-white/90">{data.total}</p>
        <p className="text-sm text-gray-300 group-hover:text-gray-200">
          {data.recent} new in last 7 days
        </p>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/generated-image (40).png"
          alt="Cyberpunk background"
          fill
          className="object-cover"
          priority
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Dashboard</h1>
          <Link 
            href="/create"
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Create New</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            title="Generated Images" 
            icon={ImageIcon}
            data={stats.images}
          />
          <StatCard 
            title="Generated Videos" 
            icon={Video}
            data={stats.videos}
          />
          <StatCard 
            title="Generated Prompts" 
            icon={MessageSquare}
            data={stats.prompts}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg border border-white/20">
            <h3 className="text-lg font-semibold mb-4 text-white">Generation Activity</h3>
            <div className="h-64">
              <BarChart className="w-full h-full text-gray-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg border border-white/20">
            <h3 className="text-lg font-semibold mb-4 text-white">Recent Generations</h3>
            {/* Add your recent generations list here */}
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-white px-6 py-3 rounded-full 
              border-2 border-white/20 hover:border-white/40 
              backdrop-blur-sm bg-white/10 hover:bg-white/20 
              transition-all duration-300 transform hover:scale-105"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const AdminHome = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("https://true-deals.vercel.app/api/admin/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        setStats(data);
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const quickActions = [
    {
      title: "Manage Products",
      desc: "Add, edit, or remove auction items.",
      path: "/admin/products",
      icon: "📦",
    },
    {
      title: "Manage Users",
      desc: "Oversee user accounts and permissions.",
      path: "/admin/users",
      icon: "👥",
    },
    {
      title: "Manage Bids",
      desc: "Monitor active bids and history.",
      path: "/admin/bids",
      icon: "🔨",
    },
    {
      title: "Manage Orders",
      desc: "Review order processing.",
      path: "/admin/orders",
      icon: "🛒",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 font-sans selection:bg-teal-500 selection:text-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="bg-gray-900 rounded-3xl p-8 md:p-12 mb-10 overflow-hidden relative shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-teal-500 opacity-20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">
              Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400">{user?.username || "Admin"}</span> 👋
            </h1>
            <p className="text-gray-400 text-lg">System overview & platform insights</p>
          </div>

          <div className="relative z-10 bg-gray-800/80 backdrop-blur border border-gray-700 rounded-2xl p-4 inline-flex items-center gap-3">
             <div className="bg-gray-900 p-2 rounded-lg text-teal-400">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
             </div>
             <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Today's Date</p>
                <div className="text-white font-medium">
                  {new Date().toLocaleDateString("en-IN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
             </div>
          </div>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6 relative overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-green-50 to-green-100 rounded-bl-full -mr-2 -mt-2 z-0 transition-transform group-hover:scale-110"></div>
              <div className="p-4 bg-green-50 rounded-xl text-green-600 relative z-10">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div className="relative z-10">
                <p className="text-sm font-bold text-gray-400 tracking-wide uppercase mb-1">Total Sales</p>
                <p className="text-3xl font-black text-gray-900">₹{stats.totalSales?.toLocaleString() || 0}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6 relative overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-bl-full -mr-2 -mt-2 z-0 transition-transform group-hover:scale-110"></div>
              <div className="p-4 bg-blue-50 rounded-xl text-blue-600 relative z-10">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>
              </div>
              <div className="relative z-10">
                <p className="text-sm font-bold text-gray-400 tracking-wide uppercase mb-1">Active Auctions</p>
                <p className="text-3xl font-black text-gray-900">{stats.activeAuctions || 0}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6 relative overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-50 to-purple-100 rounded-bl-full -mr-2 -mt-2 z-0 transition-transform group-hover:scale-110"></div>
              <div className="p-4 bg-purple-50 rounded-xl text-purple-600 relative z-10">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              </div>
              <div className="relative z-10">
                <p className="text-sm font-bold text-gray-400 tracking-wide uppercase mb-1">Total Users</p>
                <p className="text-3xl font-black text-gray-900">{stats.totalUsers || 0}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6 relative overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-orange-50 to-orange-100 rounded-bl-full -mr-2 -mt-2 z-0 transition-transform group-hover:scale-110"></div>
              <div className="p-4 bg-orange-50 rounded-xl text-orange-600 relative z-10">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
              </div>
              <div className="relative z-10">
                <p className="text-sm font-bold text-gray-400 tracking-wide uppercase mb-1">Pending Orders</p>
                <p className="text-3xl font-black text-gray-900">{stats.pendingOrders || 0}</p>
              </div>
            </div>

          </div>
        ) : (
          <div className="bg-white p-10 rounded-2xl text-center shadow-sm border border-gray-100">
            <p className="text-gray-500">Unable to load dashboard data.</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <div
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 p-6 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full group"
                key={index}
                onClick={() => navigate(action.path)}
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">{action.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-gray-500 text-sm flex-grow">{action.desc}</p>
                
                <div className="mt-6 flex items-center text-teal-600 font-bold text-sm">
                  <span>Manage</span>
                  <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </div>
              </div>
            ))}
          </div>
        </div>
        
      </main>
    </div>
  );
};

export default AdminHome;

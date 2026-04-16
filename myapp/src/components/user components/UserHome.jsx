import { useNavigate } from "react-router-dom";

function UserHome() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      {/* HERO SECTION */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-16 relative">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-brand-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 z-0"></div>
        <div className="absolute top-0 left-0 -mt-10 -ml-10 w-72 h-72 bg-brand-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 z-0"></div>
        
        <div className="bg-white rounded-3xl p-10 md:p-16 shadow-xl border border-gray-100 relative z-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-50 to-transparent"></div>
          
          <div className="relative z-20 max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-700">{user?.username || "Bidder"}</span> 👋
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed">
              Discover rare finds, place competitive bids, and win exclusive
              auctions — all in one secure marketplace.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                className="px-8 py-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 text-center"
                onClick={() => navigate("/products")}
              >
                Browse Auctions
              </button>

              <button 
                className="px-8 py-4 bg-white text-gray-800 font-bold rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all text-center" 
                onClick={() => navigate("/sell")}
              >
                Start Selling
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* TRUST STATS SECTION */}
      {/* <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="bg-gray-900 rounded-3xl p-8 shadow-2xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-x divide-gray-800 text-center">
            <div className="px-4 py-2 transform hover:scale-105 transition-transform">
              <h2 className="text-4xl font-black text-white mb-1">10K+</h2>
              <p className="text-brand-300 font-medium text-sm md:text-base uppercase tracking-wider">Active Users</p>
            </div>
            <div className="px-4 py-2 transform hover:scale-105 transition-transform">
              <h2 className="text-4xl font-black text-white mb-1">5K+</h2>
              <p className="text-brand-300 font-medium text-sm md:text-base uppercase tracking-wider">Live Auctions</p>
            </div>
            <div className="px-4 py-2 transform hover:scale-105 transition-transform">
              <h2 className="text-4xl font-black text-white mb-1">₹1Cr+</h2>
              <p className="text-brand-300 font-medium text-sm md:text-base uppercase tracking-wider">Transactions</p>
            </div>
            <div className="px-4 py-2 transform hover:scale-105 transition-transform">
              <h2 className="text-4xl font-black text-white mb-1">100%</h2>
              <p className="text-brand-300 font-medium text-sm md:text-base uppercase tracking-wider">Secure</p>
            </div>
          </div>
        </div>
      </section> */}

      {/* FEATURES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div
            className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl border border-gray-100 transition-all cursor-pointer group hover:-translate-y-1"
            onClick={() => handleCardClick("/products")}
          >
            <div className="w-14 h-14 bg-brand-50 rounded-xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 group-hover:bg-brand-100 transition-all">
              🔨
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Bid Smart</h2>
            <p className="text-gray-600 leading-relaxed">
              Compete in real-time auctions and grab products at the best prices.
            </p>
          </div>

          <div 
            className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl border border-gray-100 transition-all cursor-pointer group hover:-translate-y-1" 
            onClick={() => handleCardClick("/sell")}
          >
            <div className="w-14 h-14 bg-brand-50 rounded-xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 group-hover:bg-brand-100 transition-all">
              📦
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Sell Easily</h2>
            <p className="text-gray-600 leading-relaxed">
              List your items in minutes and connect with thousands of buyers.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl border border-gray-100 transition-all group hover:-translate-y-1">
            <div className="w-14 h-14 bg-brand-50 rounded-xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 group-hover:bg-brand-100 transition-all">
              🔐
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Secure & Reliable</h2>
            <p className="text-gray-600 leading-relaxed">
              End-to-end protection for payments, bids, and transactions.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default UserHome;

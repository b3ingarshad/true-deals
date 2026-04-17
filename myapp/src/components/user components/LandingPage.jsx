import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-white">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-brand-100 opacity-50 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-brand-200 opacity-40 blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-8 leading-tight">
              Your Ultimate <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-700">Deal Destination.</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              Join thousands of collectors and sellers in a secure, real-time
              auction marketplace. Discover rare finds, compete live, and win
              exclusive deals.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <button 
                className="w-full sm:w-auto px-8 py-4 rounded-full text-lg font-bold text-white bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 shadow-xl shadow-brand-500/30 hover:shadow-2xl hover:shadow-brand-500/50 hover:-translate-y-1 transition-all duration-300"
                onClick={() => navigate("/signup")}
              >
                Create Free Account
              </button>

              <button
                className="w-full sm:w-auto px-8 py-4 rounded-full text-lg font-bold text-gray-700 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                onClick={() => navigate("/login")}
              >
                Login to Your Account
              </button>
            </div>
            
            <div className="mt-10 flex items-center justify-center gap-2 text-sm text-gray-500">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>No credit card required for signup</span>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="bg-gray-900 text-white py-10 relative z-20 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x divide-gray-800">
            <div className="flex flex-col items-center justify-center p-4 transform hover:scale-105 transition-transform">
              <span className="text-3xl mb-2">🔐</span>
              <span className="font-semibold text-gray-300">Secure Payments</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 transform hover:scale-105 transition-transform border-l border-gray-800 md:border-l-0">
              <span className="text-3xl mb-2">⚡</span>
              <span className="font-semibold text-gray-300">Real-Time Bidding</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 transform hover:scale-105 transition-transform">
              <span className="text-3xl mb-2">📦</span>
              <span className="font-semibold text-gray-300">Verified Sellers</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 transform hover:scale-105 transition-transform">
              <span className="text-3xl mb-2">🌍</span>
              <span className="font-semibold text-gray-300">Nationwide Access</span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-brand-600 uppercase tracking-wider mb-2">Simple Process</h2>
            <h3 className="text-3xl md:text-5xl font-extrabold text-gray-900">How TrueDeals Works</h3>
            <div className="mt-4 w-24 h-1 bg-brand-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Step 1 */}
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-shadow duration-300 relative overflow-hidden group border border-gray-100">
              <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-brand-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative text-brand-600 font-black text-6xl opacity-20 mb-6 group-hover:opacity-40 transition-opacity">01</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 relative z-10">Create Account</h3>
              <p className="text-gray-600 text-lg relative z-10 leading-relaxed">
                Sign up in minutes and unlock access to thousands of live
                auctions and exclusive deals.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-shadow duration-300 relative overflow-hidden group border border-gray-100">
              <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-brand-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative text-brand-600 font-black text-6xl opacity-20 mb-6 group-hover:opacity-40 transition-opacity">02</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 relative z-10">Place Smart Bids</h3>
              <p className="text-gray-600 text-lg relative z-10 leading-relaxed">
                Compete with other buyers in real-time, track your bids easily, and outsmart the competition.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-shadow duration-300 relative overflow-hidden group border border-gray-100">
              <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-brand-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative text-brand-600 font-black text-6xl opacity-20 mb-6 group-hover:opacity-40 transition-opacity">03</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 relative z-10">Win & Checkout</h3>
              <p className="text-gray-600 text-lg relative z-10 leading-relaxed">
                Secure your winning item and complete payment through our 100% protected checkout system.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PLATFORM STATS */}
      <section className="py-20 bg-brand-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)"/>
          </svg>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <div className="text-center">
              <h3 className="text-5xl md:text-6xl font-black text-white mb-2 tracking-tight">15K+</h3>
              <p className="text-brand-100 font-medium text-lg uppercase tracking-wide">Registered Users</p>
            </div>

            <div className="text-center">
              <h3 className="text-5xl md:text-6xl font-black text-white mb-2 tracking-tight">8K+</h3>
              <p className="text-brand-100 font-medium text-lg uppercase tracking-wide">Live Auctions</p>
            </div>

            <div className="text-center">
              <h3 className="text-5xl md:text-6xl font-black text-white mb-2 tracking-tight">₹2Cr+</h3>
              <p className="text-brand-100 font-medium text-lg uppercase tracking-wide">Transactions</p>
            </div>

            <div className="text-center">
              <h3 className="text-5xl md:text-6xl font-black text-white mb-2 tracking-tight">4.9<span className="text-3xl ml-1 text-yellow-300">★</span></h3>
              <p className="text-brand-100 font-medium text-lg uppercase tracking-wide">User Rating</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../../components/user components/Navbar";
import Footer from "../../components/user components/Footer";

const BASE_URL = "https://true-deals.vercel.app";

const AuctionBuyPage = () => {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const username = storedUser?.username;
  const [bids, setBids] = useState([]);

  useEffect(() => {
    const fetchMyBids = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${BASE_URL}/api/bids/my-bids`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (res.ok) {
          setBids(data);
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error("Error fetching bids:", error);
      }
    };

    if (username) {
      fetchMyBids();
    }
  }, [username]);

  const handlePayment = async (bid) => {
    const token = localStorage.getItem("token");

    // 1️⃣ Create order from backend
    const orderRes = await fetch(`${BASE_URL}/api/payments/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        bidId: bid._id,
      }),
    });

    const orderData = await orderRes.json();

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID, // from dashboard
      amount: orderData.amount,
      currency: "INR",
      name: "TrueDeals",
      description: "Auction Winning Payment",
      order_id: orderData.razorpayOrderId,

      handler: async function (response) {
        // 2️⃣ Verify payment
        const verifyRes = await fetch(
          `${BASE_URL}/api/payments/verify-payment`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(response),
          },
        );

        const verifyData = await verifyRes.json();

        if (verifyRes.ok) {
          toast.success("Payment Successful!");
          navigate("/orders");
        } else {
          toast.error(`Payment verification failed: ${verifyData.message}`);
        }
      },

      theme: {
        color: "#14b8a6", // Tailwind teal-500
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  if (!username) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-md w-full border border-gray-100">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-500 mb-8">Please login to view your bids.</p>
            <button
              className="w-full px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              onClick={() => navigate("/login")}
            >
              Login Now
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">My Bids</h1>
            <p className="text-gray-500 mt-2">Track your auction activity and payments.</p>
          </div>
        </div>

        {bids.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center max-w-2xl mx-auto mt-10">
            <div className="text-6xl mb-6">🛍️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">No Bids Yet</h2>
            <p className="text-gray-500 mb-8 text-lg">
              You haven&apos;t placed any bids yet. Explore active auctions to get started!
            </p>
            <button
              className="px-8 py-3 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              onClick={() => navigate("/products")}
            >
              Explore Auctions
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bids.map((bid) => {
              const product = bid.product;

              if (!product) return null;

              const isEnded =
                product.status === "ended" ||
                new Date(product.auctionEndTime) < new Date();

              let statusText = "";
              let statusClasses = "";

              if (bid.status === "Accepted") {
                statusText = "Won";
                statusClasses = "bg-green-500 text-white";
              } else if (bid.status === "Rejected") {
                statusText = "Lost";
                statusClasses = "bg-red-500 text-white";
              } else if (!isEnded && bid.status === "Pending") {
                if (Number(product.currentBid) === Number(bid.amount)) {
                  statusText = "Winning";
                  statusClasses = "bg-blue-500 text-white";
                } else {
                  statusText = "Outbid";
                  statusClasses = "bg-orange-500 text-white";
                }
              } else if (isEnded && bid.status === "Pending") {
                statusText = "Lost";
                statusClasses = "bg-red-500 text-white";
              }

              return (
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col group" key={bid._id}>
                  <div className="relative h-56 bg-gray-100 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.target.src = "https://via.placeholder.com/400x300?text=No+Image" }}
                    />
                    <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm backdrop-blur-md ${statusClasses}`}>
                      {statusText}
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <div className="mb-4">
                      <span className="text-xs font-bold text-brand-600 uppercase tracking-wider block mb-1">
                        {product.category || "General"}
                      </span>
                      <h2 className="text-xl font-bold text-gray-900 line-clamp-1 group-hover:text-brand-600 transition-colors">{product.title}</h2>
                    </div>

                    <div className="space-y-3 bg-gray-50 rounded-xl p-4 mb-6">
                      <div className="flex justify-between items-center bg-brand-50 p-2 -mx-2 rounded-lg font-bold text-brand-800">
                        <span>Your Bid</span>
                        <span>₹{bid.amount.toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Current Top Bid</span>
                        <span className="font-semibold text-gray-800">₹{product.currentBid.toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Bid Placed</span>
                        <span className="font-medium text-gray-700">
                          {new Date(bid.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="mt-auto">
                      {bid.status === "Accepted" && !bid.isPaid && (
                        <button
                          className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                          onClick={() => handlePayment(bid)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                          Proceed to Payment
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AuctionBuyPage;

import { useEffect, useState } from "react";

const BASE_URL = "https://true-deals.vercel.app";

const BidManagement = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBids();
  }, []);

  const fetchBids = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/api/bids`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setBids(data);
      }
    } catch (error) {
      console.error("Error fetching bids:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bidId, newStatus) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/api/bids/${bidId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchBids();
      }
    } catch (error) {
      console.error("Error updating bid:", error);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Accepted":
        return "bg-green-100 text-green-700 border-green-200";
      case "Rejected":
        return "bg-red-100 text-red-700 border-red-200";
      case "Pending":
      default:
        return "bg-amber-100 text-amber-700 border-amber-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12 font-sans selection:bg-teal-500 selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8 pl-2 border-l-4 border-teal-500">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Bid Management</h1>
          <p className="text-gray-500 font-medium mt-1">Monitor and manage all incoming auction bids</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
          
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              All Bids <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-xs ml-2">{bids.length}</span>
            </h2>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-500"></div>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Product Info</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Bidder</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bids.length > 0 ? (
                    bids.map((bid) => (
                      <tr key={bid._id} className="hover:bg-gray-50/80 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-1">
                            {bid.product?.title || "Unknown Product"}
                          </div>
                          <div className="text-xs text-gray-400 mt-1 font-mono">{bid.product?._id?.slice(-8)}</div>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-700">
                          {bid.bidder?.username || "Unknown"}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-black text-gray-900 text-lg">₹{bid.amount}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusStyle(bid.status)}`}>
                            {bid.status === "Pending" && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse"></span>}
                            {bid.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            className={`block w-full text-sm font-semibold rounded-lg border-gray-200 focus:ring-teal-500 focus:border-teal-500 shadow-sm ${bid.status !== "Pending" ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-gray-800"}`}
                            disabled={bid.status !== "Pending"}
                            value={bid.status}
                            onChange={(e) => handleStatusChange(bid._id, e.target.value)}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Accepted">Accept</option>
                            <option value="Rejected">Reject</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="text-gray-300 mb-3">
                          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                        </div>
                        <p className="text-gray-500 text-lg font-medium">No active bids found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BidManagement;

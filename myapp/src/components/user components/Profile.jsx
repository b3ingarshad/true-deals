import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Profile = () => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [user, setUser] = React.useState(null);
  const [editForm, setEditForm] = React.useState(user);

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("https://true-deals.vercel.app/api/users/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.success) {
          setUser(data.user);
          setEditForm(data.user);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchProfile();
  }, []);

  const handleEditClick = () => {
    setEditForm(user);
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
  };

  const handleSaveClick = async () => {
    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("username", editForm.username);
      formData.append("email", editForm.email);

      if (editForm.profilePic) {
        formData.append("profilePic", editForm.profilePic);
      }

      const res = await fetch("https://true-deals.vercel.app/api/users/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setUser(data.user);
        setIsEditing(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      
      <div className="flex-grow py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative">
          
          <div className="h-40 bg-gradient-to-r from-brand-500 to-brand-700 relative overflow-hidden">
             <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
             <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
          </div>
          
          <div className="px-8 pb-10">
            <div className="relative flex justify-center -mt-20 mb-6">
              <div className="relative">
                <img
                  src={user.profilePicUrl}
                  alt="Profile"
                  className="w-40 h-40 rounded-full border-4 border-white shadow-lg object-cover bg-white"
                  onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${user.username}&background=0D8ABC&color=fff&size=128` }}
                />
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
            </div>

            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-gray-900">{user.username}</h2>
              <p className="text-gray-500 font-medium">{user.email}</p>
              <span className="inline-block mt-3 px-4 py-1.5 bg-brand-50 text-brand-700 rounded-full text-sm font-bold uppercase tracking-widest">
                {user.role}
              </span>
            </div>

            <div className="max-w-xl mx-auto border-t border-gray-100 pt-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Account Details</h3>
                {!isEditing && (
                  <button 
                    className="flex items-center gap-2 text-brand-600 hover:text-brand-800 font-bold transition-colors"
                    onClick={handleEditClick}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    Edit Profile
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-6 bg-gray-50 p-8 rounded-2xl border border-gray-100 shadow-inner">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">User Name</label>
                    <input
                      type="text"
                      name="username"
                      value={editForm.username}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={editForm.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Update Profile Image</label>
                    <input
                      type="file"
                      name="profilePic"
                      onChange={(e) =>
                        setEditForm({ ...editForm, profilePic: e.target.files[0] })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"
                    />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button 
                      className="flex-1 px-4 py-3 bg-white text-gray-700 font-bold border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
                      onClick={handleCancelClick}
                    >
                      Cancel
                    </button>
                    <button 
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                      onClick={handleSaveClick}
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-4 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">Username</span>
                    <span className="font-bold text-gray-900">{user.username}</span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">Email Address</span>
                    <span className="font-bold text-gray-900">{user.email}</span>
                  </div>
                  <div className="flex justify-between items-center py-4">
                    <span className="text-gray-500 font-medium">Account Type</span>
                    <span className="font-bold text-gray-900 capitalize">{user.role} Account</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Profile;

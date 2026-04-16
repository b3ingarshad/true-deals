import React from "react";
import toast from "react-hot-toast";

const AdminProfile = () => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [admin, setAdmin] = React.useState(null);

  const [editForm, setEditForm] = React.useState({
    username: "",
    email: "",
    profilePic: null,
  });

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:5000/api/users/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.success) {
          setAdmin(data.user);
          setEditForm({
            username: data.user.username,
            email: data.user.email,
          });
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchProfile();
  }, []);

  const handleEditClick = () => {
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

      const res = await fetch("http://localhost:5000/api/users/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setAdmin(data.user);
        setIsEditing(false);
        toast.success("Admin profile updated successfully!");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  if (!admin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative">
          
          <div className="h-48 bg-gray-900 relative overflow-hidden">
             <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-teal-500 opacity-20 rounded-full blur-3xl"></div>
             <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-blue-500 opacity-20 rounded-full blur-3xl"></div>
             <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-gray-900 to-transparent"></div>
          </div>
          
          <div className="px-8 pb-10">
            <div className="relative flex justify-center -mt-24 mb-6">
              <div className="relative">
                <img
                  src={admin.profilePicUrl}
                  alt="Profile"
                  className="w-40 h-40 rounded-full border-4 border-gray-900 shadow-xl object-cover bg-white"
                  onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${admin.username}&background=0D8ABC&color=fff&size=128` }}
                />
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-teal-400 border-2 border-white rounded-full shadow-sm"></div>
              </div>
            </div>

            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-gray-900">{admin.username}</h2>
              <p className="text-gray-500 font-medium">{admin.email}</p>
              <span className="inline-block mt-3 px-5 py-2 bg-gray-900 text-teal-400 rounded-lg text-sm font-bold uppercase tracking-widest shadow-sm">
                System {admin.role}
              </span>
            </div>

            <div className="max-w-xl mx-auto border-t border-gray-200 pt-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Admin Details</h3>
                {!isEditing && (
                  <button 
                    className="flex items-center gap-2 text-teal-600 hover:text-teal-800 font-bold transition-colors"
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
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={editForm.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all bg-white"
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
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-gray-900 file:text-white hover:file:bg-gray-800 cursor-pointer"
                    />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button 
                      className="flex-1 px-4 py-3 bg-white text-gray-700 font-bold border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                      onClick={handleCancelClick}
                    >
                      Cancel
                    </button>
                    <button 
                      className="flex-1 px-4 py-3 bg-gray-900 text-white hover:bg-black font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
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
                    <span className="font-bold text-gray-900">{admin.username}</span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">Email Address</span>
                    <span className="font-bold text-gray-900">{admin.email}</span>
                  </div>
                  <div className="flex justify-between items-center py-4">
                    <span className="text-gray-500 font-medium">Permissions</span>
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm font-bold border border-green-200">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      Full Administrative Access
                    </span>
                    <span className="sm:hidden font-bold text-green-600">Full Access</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;

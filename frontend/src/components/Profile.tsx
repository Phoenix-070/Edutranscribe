import React from 'react';
import { useUser } from "@clerk/clerk-react";
import { motion } from "framer-motion";

const Profile = () => {
  const { user } = useUser();

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="page-transition min-h-screen py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-3xl mx-auto">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass-morphism p-8"
        >
          <div className="flex flex-col md:flex-row items-center md:space-x-6 space-y-4 md:space-y-0">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="relative"
            >
              <motion.img
                whileHover={{ rotate: 5 }}
                src={user.imageUrl}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-indigo-500 shadow-lg"
              />
              <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-2 border-white"></div>
            </motion.div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">{user.fullName}</h1>
              <p className="text-lg">{user.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>

          <div className="mt-12 space-y-8">
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-2xl font-semibold mb-6">Profile Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="glass-morphism p-4"
                >
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <p className="text-lg font-medium">{user.fullName}</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="glass-morphism p-4"
                >
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <p className="text-lg font-medium">{user.primaryEmailAddress?.emailAddress}</p>
                </motion.div>
                {user.createdAt && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="glass-morphism p-4"
                  >
                    <label className="block text-sm font-medium mb-2">Member Since</label>
                    <p className="text-lg font-medium">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </motion.div>
                )}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = "https://accounts.clerk.dev/user"}
              className="interactive-button w-full"
            >
              Manage Profile Settings
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Profile; 
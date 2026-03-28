use client;

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AiOutlineSave } from 'react-icons/ai';
import {MdDarkMode, MdLightMode} from 'react-icons/md';

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [emailNotifications, setEmailNotifications] = useState(() => localStorage.getItem('emailNotifications') === 'true');
  const [weeklyDigest, setWeeklyDigest] = useState(() => localStorage.getItem('weeklyDigest') === 'true');
  const router = useRouter();

  const handleSaveChanges = () => {
    localStorage.setItem('darkMode', darkMode.toString());
    localStorage.setItem('emailNotifications', emailNotifications.toString());
    localStorage.setItem('weeklyDigest', weeklyDigest.toString());
    router.push('/dashboard');
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8 mt-10 mb-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-4">Settings</h1>
      <div className="flex flex-col mb-4">
        <label className="text-lg font-medium mb-2">Dark Mode</label>
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
            className="mr-2"
          />
          {darkMode ? <MdDarkMode size={20} /> : <MdLightMode size={20} />}
        </div>
      </div>
      <div className="flex flex-col mb-4">
        <label className="text-lg font-medium mb-2">Email Notifications</label>
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={emailNotifications}
            onChange={() => setEmailNotifications(!emailNotifications)}
            className="mr-2"
          />
        </div>
      </div>
      <div className="flex flex-col mb-4">
        <label className="text-lg font-medium mb-2">Weekly Digest</label>
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={weeklyDigest}
            onChange={() => setWeeklyDigest(!weeklyDigest)}
            className="mr-2"
          />
        </div>
      </div>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleSaveChanges}
      >
        <AiOutlineSave size={20} className="mr-2" />
        Save Changes
      </button>
    </div>
  );
}
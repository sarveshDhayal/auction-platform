import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Bell, Shield, Key, Camera } from 'lucide-react';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('profile');
  
  // Form states
  const [name, setName] = useState<string>(user?.name || '');
  const [email, setEmail] = useState<string>(user?.email || '');

  return (
    <div className="flex gap-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-20">
      <Sidebar />
      <div className="flex-1">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Account Settings</h1>
          <p className="text-text-secondary">Manage your profile, notifications, and security preferences.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Settings Navigation */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <GlassCard className="p-2 flex flex-row lg:flex-col gap-1 overflow-x-auto">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === 'profile' ? 'bg-primary/20 text-white border border-primary/30' : 'text-text-secondary hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <User className="w-4 h-4" /> Profile Details
              </button>
              <button 
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === 'notifications' ? 'bg-primary/20 text-white border border-primary/30' : 'text-text-secondary hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Bell className="w-4 h-4" /> Notifications
              </button>
              <button 
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === 'security' ? 'bg-primary/20 text-white border border-primary/30' : 'text-text-secondary hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Shield className="w-4 h-4" /> Security
              </button>
            </GlassCard>
          </div>

          {/* Settings Content */}
          <div className="flex-1">
            {activeTab === 'profile' && (
              <GlassCard className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                  <div>
                    <h3 className="text-xl font-bold text-white">Profile Information</h3>
                    <p className="text-sm text-text-secondary">Update your personal details and how others see you.</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-8 mb-10 p-6 rounded-2xl bg-white/5 border border-white/5">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <img 
                      src={user?.avatar || 'https://ui-avatars.com/api/?name=' + (user?.name || 'User')} 
                      alt="Profile" 
                      className="relative w-28 h-28 rounded-full border-2 border-background object-cover shadow-2xl"
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h4 className="text-lg font-semibold text-white mb-1">Avatar Image</h4>
                    <p className="text-sm text-text-secondary mb-5 max-w-xs">Update your profile picture. High-res JPG, GIF or PNG works best (Max 5MB).</p>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                      <button className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-primary/20">
                        Upload New
                      </button>
                      <button className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold rounded-xl border border-white/10 transition-all">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input 
                      label="Full Name" 
                      placeholder="Enter your full name"
                      value={name} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} 
                      icon={User}
                    />
                    <Input 
                      label="Email Address" 
                      type="email"
                      placeholder="your@email.com"
                      value={email} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} 
                      icon={Mail}
                      disabled
                    />
                  </div>
                  <div className="pt-6 border-t border-white/10 flex justify-end gap-4">
                    <Button variant="outline" type="button" onClick={() => {
                      setName(user?.name || '');
                      setEmail(user?.email || '');
                    }} className="px-6 py-2.5" isLoading={false}>Cancel</Button>
                    <Button type="submit" className="px-8 py-2.5" isLoading={false}>Save Changes</Button>
                  </div>
                </form>
              </GlassCard>
            )}

            {activeTab === 'notifications' && (
              <GlassCard className="p-8">
                <h3 className="text-xl font-bold text-white mb-6">Notification Preferences</h3>
                <div className="space-y-6">
                  {[
                    { title: 'Outbid Alerts', desc: 'Get notified immediately when someone outbids you.', defaultChecked: true },
                    { title: 'Auction Ending Soon', desc: 'Alerts for when an auction on your watchlist is about to end.', defaultChecked: true },
                    { title: 'Marketing Emails', desc: 'Receive weekly digests of recommended auctions.', defaultChecked: false },
                  ].map((notif, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                      <div>
                        <p className="text-white font-medium text-sm mb-1">{notif.title}</p>
                        <p className="text-text-secondary text-xs">{notif.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked={notif.defaultChecked} />
                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}
                  <div className="pt-4 flex justify-end">
                    <Button type="button" className="px-6 py-2" isLoading={false}>Save Preferences</Button>
                  </div>
                </div>
              </GlassCard>
            )}

            {activeTab === 'security' && (
              <GlassCard className="p-8">
                <h3 className="text-xl font-bold text-white mb-6">Security Settings</h3>
                <form className="space-y-5 max-w-md" onSubmit={(e) => e.preventDefault()}>
                  <Input 
                    label="Current Password" 
                    type="password"
                    placeholder="••••••••" 
                    icon={Key}
                  />
                  <Input 
                    label="New Password" 
                    type="password"
                    placeholder="••••••••" 
                    icon={Key}
                  />
                  <Input 
                    label="Confirm New Password" 
                    type="password"
                    placeholder="••••••••" 
                    icon={Key}
                  />
                  <div className="pt-4 border-t border-white/10">
                    <Button type="submit" className="px-6 py-2" isLoading={false}>Update Password</Button>
                  </div>
                </form>
              </GlassCard>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;

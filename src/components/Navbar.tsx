import React, { useState } from 'react';
import {
  Flower2,
  Users,
  LayoutDashboard,
  ArrowRightLeft,
  RefreshCw,
  Cloud,
  CheckCircle2,
  LogIn,
  LogOut,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Search,
} from 'lucide-react';
import { GoogleDriveUser, SyncStatus } from '../types';

export type ActiveTab = 'dashboard' | 'members' | 'flowers' | 'member-to-flower' | 'flower-to-member';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  syncStatus: SyncStatus;
  onRefreshNow: () => void;
  onUpdateAutoRefresh: (seconds: number) => void;
  googleUser: GoogleDriveUser | null;
  onGoogleSignIn: () => void;
  onGoogleLogout: () => void;
  onOpenQuickSearch: () => void;
  onExportBackup: () => void;
  onImportBackup: (file: File) => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  syncStatus,
  onRefreshNow,
  onUpdateAutoRefresh,
  googleUser,
  onGoogleSignIn,
  onGoogleLogout,
  onOpenQuickSearch,
  onExportBackup,
  onImportBackup,
  onResetData,
}) => {
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'members', label: 'สมาชิก', icon: Users },
    { id: 'flowers', label: 'ดอกไม้', icon: Flower2 },
    { id: 'member-to-flower', label: 'ดู สมาชิก → ดอกไม้', icon: ArrowRightLeft },
    { id: 'flower-to-member', label: 'ดู ดอกไม้ → สมาชิก', icon: Sparkles },
  ] as const;

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImportBackup(e.target.files[0]);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-pink-500/20 group-hover:scale-105 transition">
                <Flower2 className="w-5 h-5" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
                  ระบบสมาชิกและดอกไม้
                </h1>
                <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                  แยกตามสีพื้น (ม่วง • ส้ม • แดง) & Drive Sync
                </p>
              </div>
            </button>
          </div>

          {/* Center Navigation Tabs (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 bg-zinc-100/80 dark:bg-zinc-800/60 p-1 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white/40'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Tools: Real-time Sync & Google Drive Account */}
          <div className="flex items-center gap-2">
            {/* Quick Search Shortcut */}
            <button
              onClick={onOpenQuickSearch}
              title="ค้นหาด่วน (สมาชิก / ดอกไม้)"
              className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Real-time Indicator & Manual Refresh */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800/90 rounded-xl text-xs border border-zinc-200 dark:border-zinc-700">
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    syncStatus.autoRefreshInterval > 0 ? 'bg-emerald-400' : 'bg-zinc-400'
                  }`}
                ></span>
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    syncStatus.autoRefreshInterval > 0 ? 'bg-emerald-500' : 'bg-zinc-400'
                  }`}
                ></span>
              </span>

              <button
                onClick={onRefreshNow}
                title="รีเฟรชข้อมูลทันที"
                disabled={syncStatus.isSyncing}
                className="flex items-center gap-1 text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 transition"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${syncStatus.isSyncing ? 'animate-spin text-indigo-600' : ''}`}
                />
                <span className="hidden md:inline font-medium">
                  {syncStatus.isSyncing ? 'กำลังซิงก์...' : 'เรียลไทม์'}
                </span>
              </button>

              {/* Interval selector */}
              <select
                value={syncStatus.autoRefreshInterval}
                onChange={(e) => onUpdateAutoRefresh(Number(e.target.value))}
                className="bg-transparent text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 focus:outline-hidden cursor-pointer"
                title="ตั้งค่าความถี่รีเฟรชอัตโนมัติ"
              >
                <option value={5}>5วิ</option>
                <option value={10}>10วิ</option>
                <option value={30}>30วิ</option>
                <option value={0}>ปิดออโต้</option>
              </select>
            </div>

            {/* Google Drive Status Pill */}
            {googleUser ? (
              <div className="flex items-center gap-2 pl-1 pr-2 py-1 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl text-xs">
                {googleUser.photoURL ? (
                  <img
                    src={googleUser.photoURL}
                    alt={googleUser.displayName || 'Google User'}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                    {googleUser.displayName?.charAt(0) || 'G'}
                  </div>
                )}
                <span className="hidden sm:inline font-medium text-blue-800 dark:text-blue-300 max-w-[110px] truncate">
                  {googleUser.displayName || googleUser.email}
                </span>
                <button
                  onClick={onGoogleLogout}
                  title="ออกจากระบบ Google"
                  className="text-blue-600 hover:text-rose-600 dark:text-blue-400 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onGoogleSignIn}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold rounded-xl shadow-xs transition"
              >
                <Cloud className="w-3.5 h-3.5 text-blue-400 dark:text-blue-600" />
                <span className="hidden sm:inline">เชื่อมต่อ Google Drive</span>
                <span className="sm:hidden">Drive</span>
              </button>
            )}

            {/* Data options dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
                title="เมนูสำรองข้อมูล"
              >
                <Download className="w-4 h-4" />
              </button>

              {showSettingsMenu && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowSettingsMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 py-1.5 z-40 text-xs">
                    <button
                      onClick={() => {
                        setShowSettingsMenu(false);
                        onExportBackup();
                      }}
                      className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                    >
                      <Download className="w-4 h-4 text-indigo-500" />
                      ส่งออกสำรองข้อมูล (Export JSON)
                    </button>
                    <button
                      onClick={() => {
                        setShowSettingsMenu(false);
                        fileInputRef.current?.click();
                      }}
                      className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                    >
                      <Upload className="w-4 h-4 text-emerald-500" />
                      นำเข้าข้อมูลสำรอง (Import JSON)
                    </button>
                    <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />
                    <button
                      onClick={() => {
                        setShowSettingsMenu(false);
                        onResetData();
                      }}
                      className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                    >
                      <RotateCcw className="w-4 h-4" />
                      รีเซ็ตข้อมูลเริ่มต้น (190 ดอกไม้)
                    </button>
                  </div>
                </>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileImport}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>

        {/* Mobile Sub Navigation Tabs */}
        <div className="flex lg:hidden items-center gap-1 pb-2 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

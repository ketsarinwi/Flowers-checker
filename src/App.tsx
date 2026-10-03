import React, { useState, useEffect, useCallback } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { MembersView } from './components/MembersView';
import { FlowersView } from './components/FlowersView';
import { MemberToFlowerView } from './components/MemberToFlowerView';
import { FlowerToMemberView } from './components/FlowerToMemberView';
import { AssignFlowersModal } from './components/AssignFlowersModal';
import { MemberModal } from './components/MemberModal';
import { FlowerModal } from './components/FlowerModal';
import { UploadImageModal } from './components/UploadImageModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';

import { Flower, Member, GoogleDriveUser, SyncStatus, FlowerTier } from './types';
import {
  getFlowers,
  getMembers,
  saveFlowers,
  saveMembers,
  addMember,
  updateMember,
  deleteMember,
  addFlower,
  updateFlower,
  deleteFlower,
  assignFlowersToMember,
  toggleMemberFlower,
  subscribeToSync,
  resetAllDataToDefault,
  exportBackupJSON,
  importBackupJSON,
} from './services/storage';
import {
  initAuth,
  googleSignIn,
  logout,
  getCurrentDriveUser,
} from './services/googleDrive';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Core Data State
  const [flowers, setFlowers] = useState<Flower[]>(() => getFlowers());
  const [members, setMembers] = useState<Member[]>(() => getMembers());

  // Real-time Sync State
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastUpdated: Date.now(),
    isSyncing: false,
    autoRefreshInterval: 10, // 10s auto-refresh by default
    isLive: true,
  });

  // Google Drive Auth State
  const [googleUser, setGoogleUser] = useState<GoogleDriveUser | null>(() => getCurrentDriveUser());

  // Modal States
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignTargetMember, setAssignTargetMember] = useState<Member | null>(null);

  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const [isFlowerModalOpen, setIsFlowerModalOpen] = useState(false);
  const [editingFlower, setEditingFlower] = useState<Flower | null>(null);

  const [isUploadImageModalOpen, setIsUploadImageModalOpen] = useState(false);
  const [uploadTargetFlower, setUploadTargetFlower] = useState<Flower | null>(null);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void;
  }>({
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);

  // Selected entities for drill-down views
  const [selectedMemberIdForView, setSelectedMemberIdForView] = useState<string | null>(null);
  const [selectedFlowerIdForView, setSelectedFlowerIdForView] = useState<string | null>(null);

  // Load and reload data
  const refreshData = useCallback(() => {
    setSyncStatus((prev) => ({ ...prev, isSyncing: true }));
    const f = getFlowers();
    const m = getMembers();
    setFlowers(f);
    setMembers(m);

    setTimeout(() => {
      setSyncStatus((prev) => ({
        ...prev,
        isSyncing: false,
        lastUpdated: Date.now(),
      }));
    }, 300);
  }, []);

  // Multi-tab real-time sync subscription
  useEffect(() => {
    const unsubscribe = subscribeToSync(() => {
      refreshData();
    });
    return () => unsubscribe();
  }, [refreshData]);

  // Auto-refresh timer interval
  useEffect(() => {
    if (syncStatus.autoRefreshInterval <= 0) return;

    const timer = setInterval(() => {
      refreshData();
    }, syncStatus.autoRefreshInterval * 1000);

    return () => clearInterval(timer);
  }, [syncStatus.autoRefreshInterval, refreshData]);

  // Initialize Google Auth
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setGoogleUser({
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        });
      },
      () => {
        setGoogleUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Keyboard shortcut for Quick Search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsQuickSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Google Sign-in Handlers
  const handleGoogleSignIn = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser({
          displayName: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
        });
      }
    } catch (err) {
      console.error('Sign in failed:', err);
    }
  };

  const handleGoogleLogout = async () => {
    setConfirmConfig({
      title: 'ออกจากระบบ Google Drive',
      message: 'คุณต้องการออกจากระบบบัญชี Google บนอุปกรณ์นี้ใช่หรือไม่?',
      confirmText: 'ออกจากระบบ',
      onConfirm: async () => {
        await logout();
        setGoogleUser(null);
      },
    });
    setIsConfirmModalOpen(true);
  };

  // Member CRUD
  const handleSaveMember = (data: { guildName: string; lineName: string; avatarColor?: string }) => {
    if (editingMember) {
      updateMember(editingMember.id, {
        guildName: data.guildName,
        lineName: data.lineName,
        name: data.guildName, // sync fallback
        avatarColor: data.avatarColor,
      });
    } else {
      addMember({
        guildName: data.guildName,
        lineName: data.lineName,
        name: data.guildName,
        avatarColor: data.avatarColor,
        flowerIds: [],
      });
    }
    refreshData();
  };

  const handleDeleteMember = (member: Member) => {
    const displayName = member.guildName || member.name;
    setConfirmConfig({
      title: `ลบสมาชิก: ${displayName}`,
      message: `คุณแน่ใจหรือไม่ว่าต้องการลบสมาชิก "${displayName}" (LINE: ${member.lineName || '-'}) ออกจากระบบ? ข้อมูลการถือครองดอกไม้ของสมาชิกท่านนี้จะถูกนำออก`,
      confirmText: 'ยืนยันลบสมาชิก',
      onConfirm: () => {
        deleteMember(member.id);
        refreshData();
      },
    });
    setIsConfirmModalOpen(true);
  };

  // Flower CRUD
  const handleSaveFlower = (data: { name: string; tier: FlowerTier; notes?: string }) => {
    if (editingFlower) {
      updateFlower(editingFlower.id, {
        name: data.name,
        tier: data.tier,
        notes: data.notes,
      });
    } else {
      addFlower({
        name: data.name,
        tier: data.tier,
        notes: data.notes,
      });
    }
    refreshData();
  };

  const handleDeleteFlower = (flower: Flower) => {
    const ownerCount = members.filter((m) => m.flowerIds.includes(flower.id)).length;
    setConfirmConfig({
      title: `ลบดอกไม้: ${flower.name}`,
      message: `คุณแน่ใจหรือไม่ว่าต้องการลบดอกไม้ "${flower.name}" (พื้นสี${flower.tier})? ${
        ownerCount > 0
          ? `ขณะนี้มีสมาชิก ${ownerCount} คนครอบครองดอกไม้นี้อยู่ ดอกไม้จะถูกนำออกจากสมาชิกทุกคนด้วย`
          : ''
      }`,
      confirmText: 'ยืนยันลบดอกไม้',
      onConfirm: () => {
        deleteFlower(flower.id);
        refreshData();
      },
    });
    setIsConfirmModalOpen(true);
  };

  // Image Upload / Removal
  const handleSaveFlowerImage = (
    flowerId: string,
    imageUrl: string,
    driveFileId?: string,
    driveLink?: string
  ) => {
    updateFlower(flowerId, {
      imageUrl,
      driveFileId,
      driveWebViewLink: driveLink,
    });
    refreshData();
  };

  const handleRemoveFlowerImage = (flowerId: string) => {
    setConfirmConfig({
      title: 'ลบรูปภาพดอกไม้',
      message: 'คุณแน่ใจหรือไม่ว่าต้องการลบรูปภาพออกจากดอกไม้นี้?',
      confirmText: 'ยืนยันลบรูปภาพ',
      onConfirm: () => {
        updateFlower(flowerId, {
          imageUrl: undefined,
          driveFileId: undefined,
          driveWebViewLink: undefined,
        });
        refreshData();
      },
    });
    setIsConfirmModalOpen(true);
  };

  // Flower Assignment (Checkbox by Tier)
  const handleSaveAssignedFlowers = (memberId: string, flowerIds: string[]) => {
    assignFlowersToMember(memberId, flowerIds);
    refreshData();
  };

  const handleToggleMemberFlower = (memberId: string, flowerId: string) => {
    toggleMemberFlower(memberId, flowerId);
    refreshData();
  };

  // Reset & Backup Handlers
  const handleResetData = () => {
    setConfirmConfig({
      title: 'รีเซ็ตข้อมูลเริ่มต้น',
      message: 'การดำเนินการนี้จะล้างข้อมูลที่บันทึกไว้ และโหลดรายชื่อดอกไม้เริ่มต้นทั้ง 190 ชนิด (พื้นม่วง, ส้ม, แดง) กลับคืนมา',
      confirmText: 'ยืนยันการรีเซ็ต',
      onConfirm: () => {
        resetAllDataToDefault();
        refreshData();
      },
    });
    setIsConfirmModalOpen(true);
  };

  const handleExportBackup = () => {
    const jsonStr = exportBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flower_tracker_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const success = importBackupJSON(content);
      if (success) {
        refreshData();
      } else {
        alert('รูปแบบไฟล์ JSON ไม่ถูกต้อง');
      }
    };
    reader.readAsText(file);
  };

  // Navigation helpers from cards
  const handleSelectMemberForFlowers = (member: Member) => {
    setSelectedMemberIdForView(member.id);
    setActiveTab('member-to-flower');
  };

  const handleSelectFlowerForMembers = (flower: Flower) => {
    setSelectedFlowerIdForView(flower.id);
    setActiveTab('flower-to-member');
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        syncStatus={syncStatus}
        onRefreshNow={refreshData}
        onUpdateAutoRefresh={(sec) =>
          setSyncStatus((prev) => ({ ...prev, autoRefreshInterval: sec }))
        }
        googleUser={googleUser}
        onGoogleSignIn={handleGoogleSignIn}
        onGoogleLogout={handleGoogleLogout}
        onOpenQuickSearch={() => setIsQuickSearchOpen(true)}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onResetData={handleResetData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            flowers={flowers}
            members={members}
            onNavigate={setActiveTab}
            onOpenAddMember={() => {
              setEditingMember(null);
              setIsMemberModalOpen(true);
            }}
            onOpenAddFlower={() => {
              setEditingFlower(null);
              setIsFlowerModalOpen(true);
            }}
            onSelectMemberForFlowers={handleSelectMemberForFlowers}
            onSelectFlowerForMembers={handleSelectFlowerForMembers}
          />
        )}

        {activeTab === 'members' && (
          <MembersView
            members={members}
            flowers={flowers}
            onOpenAddMember={() => {
              setEditingMember(null);
              setIsMemberModalOpen(true);
            }}
            onEditMember={(m) => {
              setEditingMember(m);
              setIsMemberModalOpen(true);
            }}
            onDeleteMember={handleDeleteMember}
            onAssignFlowers={(m) => {
              setAssignTargetMember(m);
              setIsAssignModalOpen(true);
            }}
            onViewMemberFlowers={handleSelectMemberForFlowers}
          />
        )}

        {activeTab === 'flowers' && (
          <FlowersView
            flowers={flowers}
            members={members}
            onOpenAddFlower={() => {
              setEditingFlower(null);
              setIsFlowerModalOpen(true);
            }}
            onEditFlower={(f) => {
              setEditingFlower(f);
              setIsFlowerModalOpen(true);
            }}
            onDeleteFlower={handleDeleteFlower}
            onOpenUploadImage={(f) => {
              setUploadTargetFlower(f);
              setIsUploadImageModalOpen(true);
            }}
            onSelectFlowerForMembers={handleSelectFlowerForMembers}
          />
        )}

        {activeTab === 'member-to-flower' && (
          <MemberToFlowerView
            members={members}
            flowers={flowers}
            selectedMemberId={selectedMemberIdForView}
            onSelectMember={setSelectedMemberIdForView}
            onOpenAssignFlowers={(m) => {
              setAssignTargetMember(m);
              setIsAssignModalOpen(true);
            }}
            onViewFlowerMembers={handleSelectFlowerForMembers}
            onOpenUploadImage={(f) => {
              setUploadTargetFlower(f);
              setIsUploadImageModalOpen(true);
            }}
          />
        )}

        {activeTab === 'flower-to-member' && (
          <FlowerToMemberView
            flowers={flowers}
            members={members}
            selectedFlowerId={selectedFlowerIdForView}
            onSelectFlower={setSelectedFlowerIdForView}
            onOpenUploadImage={(f) => {
              setUploadTargetFlower(f);
              setIsUploadImageModalOpen(true);
            }}
            onToggleMemberFlower={handleToggleMemberFlower}
            onViewMemberFlowers={handleSelectMemberForFlowers}
          />
        )}
      </main>

      {/* Checkbox Flower Assignment Modal (By Tier: ม่วง, ส้ม, แดง) */}
      <AssignFlowersModal
        isOpen={isAssignModalOpen}
        member={assignTargetMember}
        flowers={flowers}
        allMembers={members}
        onClose={() => {
          setIsAssignModalOpen(false);
          setAssignTargetMember(null);
        }}
        onSave={handleSaveAssignedFlowers}
      />

      {/* Member Modal (Add / Edit) */}
      <MemberModal
        isOpen={isMemberModalOpen}
        member={editingMember}
        onClose={() => {
          setIsMemberModalOpen(false);
          setEditingMember(null);
        }}
        onSave={handleSaveMember}
      />

      {/* Flower Modal (Add / Edit Name & Tier) */}
      <FlowerModal
        isOpen={isFlowerModalOpen}
        flower={editingFlower}
        onClose={() => {
          setIsFlowerModalOpen(false);
          setEditingFlower(null);
        }}
        onSave={handleSaveFlower}
      />

      {/* Upload Image Modal (Google Drive & Preview) */}
      <UploadImageModal
        isOpen={isUploadImageModalOpen}
        flower={uploadTargetFlower}
        onClose={() => {
          setIsUploadImageModalOpen(false);
          setUploadTargetFlower(null);
        }}
        onSaveImage={handleSaveFlowerImage}
        onRemoveImage={handleRemoveFlowerImage}
      />

      {/* Reusable Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setIsConfirmModalOpen(false)}
      />

      {/* Global Quick Search Modal (Ctrl+K) */}
      <GlobalSearchModal
        isOpen={isQuickSearchOpen}
        flowers={flowers}
        members={members}
        onClose={() => setIsQuickSearchOpen(false)}
        onSelectMember={handleSelectMemberForFlowers}
        onSelectFlower={handleSelectFlowerForMembers}
      />
    </div>
  );
}

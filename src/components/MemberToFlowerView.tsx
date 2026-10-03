import React, { useState, useMemo } from 'react';
import {
  Users,
  Flower2,
  CheckSquare,
  Search,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Cloud,
} from 'lucide-react';
import { Member, Flower, FlowerTier } from '../types';

interface MemberToFlowerViewProps {
  members: Member[];
  flowers: Flower[];
  selectedMemberId: string | null;
  onSelectMember: (memberId: string) => void;
  onOpenAssignFlowers: (member: Member) => void;
  onViewFlowerMembers: (flower: Flower) => void;
  onOpenUploadImage: (flower: Flower) => void;
}

export const MemberToFlowerView: React.FC<MemberToFlowerViewProps> = ({
  members,
  flowers,
  selectedMemberId,
  onSelectMember,
  onOpenAssignFlowers,
  onViewFlowerMembers,
  onOpenUploadImage,
}) => {
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [flowerSearchQuery, setFlowerSearchQuery] = useState('');

  // Current selected member
  const currentMember = useMemo(() => {
    if (selectedMemberId) {
      return members.find((m) => m.id === selectedMemberId) || members[0] || null;
    }
    return members[0] || null;
  }, [members, selectedMemberId]);

  // Lookup map for flowers
  const flowerMap = useMemo(() => {
    const map = new Map<string, Flower>();
    flowers.forEach((f) => map.set(f.id, f));
    return map;
  }, [flowers]);

  // Flowers owned by the current member
  const memberFlowers = useMemo(() => {
    if (!currentMember) return [];
    return currentMember.flowerIds
      .map((fid) => flowerMap.get(fid))
      .filter((f): f is Flower => !!f);
  }, [currentMember, flowerMap]);

  // Filtered flowers of the member
  const filteredMemberFlowers = useMemo(() => {
    if (!flowerSearchQuery.trim()) return memberFlowers;
    const q = flowerSearchQuery.toLowerCase().trim();
    return memberFlowers.filter((f) => f.name.toLowerCase().includes(q));
  }, [memberFlowers, flowerSearchQuery]);

  // Group by tier
  const flowersByTier = useMemo(() => {
    return {
      ม่วง: filteredMemberFlowers.filter((f) => f.tier === 'ม่วง'),
      ส้ม: filteredMemberFlowers.filter((f) => f.tier === 'ส้ม'),
      แดง: filteredMemberFlowers.filter((f) => f.tier === 'แดง'),
    };
  }, [filteredMemberFlowers]);

  // Filtered members for selector
  const filteredMembersList = useMemo(() => {
    if (!memberSearchQuery.trim()) return members;
    const q = memberSearchQuery.toLowerCase().trim();
    return members.filter(
      (m) =>
        (m.guildName && m.guildName.toLowerCase().includes(q)) ||
        (m.lineName && m.lineName.toLowerCase().includes(q)) ||
        (m.name && m.name.toLowerCase().includes(q))
    );
  }, [members, memberSearchQuery]);

  if (members.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 text-center">
        <Users className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
          ยังไม่มีสมาชิกในระบบ
        </h3>
        <p className="text-xs text-zinc-500 mt-1">กรุณาเพิ่มสมาชิกใหม่ก่อนดูรายการดอกไม้</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
          <Users className="w-6 h-6 text-indigo-600" />
          ดู สมาชิก → ดอกไม้ (Member's Flowers)
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          เลือกสมาชิกเพื่อตรวจสอบรายชื่อดอกไม้ทั้งหมดที่ครอบครอง แยกตามหมวดหมู่สีพื้น (ม่วง • ส้ม • แดง)
        </p>
      </div>

      {/* Member Selector Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 shrink-0">
            <span>เลือกสมาชิกที่ต้องการดู:</span>
          </label>

          <div className="flex-1 max-w-md relative">
            <select
              value={currentMember?.id || ''}
              onChange={(e) => onSelectMember(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.guildName || m.name} (LINE: {m.lineName || '-'}) — มี {m.flowerIds.length} ดอก
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Member horizontal pill scroller */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {filteredMembersList.map((m) => {
            const isSelected = currentMember?.id === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onSelectMember(m.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-gradient-to-tr ${
                    m.avatarColor || 'from-indigo-500 to-purple-600'
                  } flex items-center justify-center text-[10px] text-white font-bold`}
                >
                  {(m.guildName || m.name || 'G').charAt(0)}
                </div>
                <span>{m.guildName || m.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {m.flowerIds.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Member Details Hero & Management */}
      {currentMember && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${
                currentMember.avatarColor || 'from-indigo-500 to-purple-600'
              } flex items-center justify-center text-white font-black text-2xl shadow-md`}
            >
              {(currentMember.guildName || currentMember.name || 'G').charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {currentMember.guildName || currentMember.name}
                </h3>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg font-medium">
                  ชื่อในไลน์: {currentMember.lineName || 'ยังไม่ระบุ'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 py-1.5 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-bold">
                ม่วง {flowersByTier.ม่วง.length}
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 font-bold">
                ส้ม {flowersByTier.ส้ม.length}
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold">
                แดง {flowersByTier.แดง.length}
              </span>
            </div>

            <button
              onClick={() => onOpenAssignFlowers(currentMember)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition"
            >
              <CheckSquare className="w-4 h-4" />
              แก้ไขดอกไม้ (Checkbox)
            </button>
          </div>
        </div>
      )}

      {/* Filter inside member flowers */}
      {memberFlowers.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={flowerSearchQuery}
            onChange={(e) => setFlowerSearchQuery(e.target.value)}
            placeholder={`ค้นหาในดอกไม้ของ ${currentMember?.name}...`}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100"
          />
        </div>
      )}

      {/* 3 Tier Sections: ม่วง, ส้ม, แดง */}
      {memberFlowers.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 text-center">
          <Flower2 className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
            สมาชิกท่านนี้ยังไม่มีดอกไม้ในครอบครอง
          </h3>
          <p className="text-xs text-zinc-500 mt-1 mb-4">
            กดปุ่มด้านล่างเพื่อเลือกมอบดอกไม้ด้วย Checkbox แยกตามสีพื้น
          </p>
          {currentMember && (
            <button
              onClick={() => onOpenAssignFlowers(currentMember)}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 active:scale-95 transition"
            >
              + มอบดอกไม้ให้สมาชิกตอนนี้
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Section: ม่วง */}
          {flowersByTier.ม่วง.length > 0 && (
            <div className="bg-purple-50/30 dark:bg-purple-950/10 border border-purple-200/80 dark:border-purple-900/40 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-purple-500"></span>
                  <h3 className="text-sm font-bold text-purple-950 dark:text-purple-200">
                    หมวดพื้นสีม่วง ({flowersByTier.ม่วง.length} ดอก)
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {flowersByTier.ม่วง.map((flower) => (
                  <FlowerItemCard
                    key={flower.id}
                    flower={flower}
                    onViewFlowerMembers={onViewFlowerMembers}
                    onOpenUploadImage={onOpenUploadImage}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Section: ส้ม */}
          {flowersByTier.ส้ม.length > 0 && (
            <div className="bg-amber-50/30 dark:bg-amber-950/10 border border-amber-200/80 dark:border-amber-900/40 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-500"></span>
                  <h3 className="text-sm font-bold text-amber-950 dark:text-amber-200">
                    หมวดพื้นสีส้ม ({flowersByTier.ส้ม.length} ดอก)
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {flowersByTier.ส้ม.map((flower) => (
                  <FlowerItemCard
                    key={flower.id}
                    flower={flower}
                    onViewFlowerMembers={onViewFlowerMembers}
                    onOpenUploadImage={onOpenUploadImage}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Section: แดง */}
          {flowersByTier.แดง.length > 0 && (
            <div className="bg-rose-50/30 dark:bg-rose-950/10 border border-rose-200/80 dark:border-rose-900/40 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-rose-500"></span>
                  <h3 className="text-sm font-bold text-rose-950 dark:text-rose-200">
                    หมวดพื้นสีแดง ({flowersByTier.แดง.length} ดอก)
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {flowersByTier.แดง.map((flower) => (
                  <FlowerItemCard
                    key={flower.id}
                    flower={flower}
                    onViewFlowerMembers={onViewFlowerMembers}
                    onOpenUploadImage={onOpenUploadImage}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Sub-component for individual flower card
const FlowerItemCard: React.FC<{
  flower: Flower;
  onViewFlowerMembers: (flower: Flower) => void;
  onOpenUploadImage: (flower: Flower) => void;
}> = ({ flower, onViewFlowerMembers, onOpenUploadImage }) => {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden p-2.5 shadow-2xs hover:border-zinc-300 transition flex flex-col justify-between group">
      <div
        onClick={() => onOpenUploadImage(flower)}
        className="relative aspect-square rounded-xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden cursor-pointer flex items-center justify-center mb-2"
        title="คลิกเพื่อดูรูปภาพหรืออัปโหลดเข้า Google Drive"
      >
        {flower.imageUrl ? (
          <img
            src={flower.imageUrl}
            alt={flower.name}
            className="w-full h-full object-cover group-hover:scale-105 transition"
          />
        ) : (
          <Flower2 className="w-6 h-6 text-zinc-400" />
        )}
        {flower.driveFileId && (
          <div className="absolute top-1.5 left-1.5 px-1 py-0.5 rounded bg-blue-600/90 text-white text-[8px] font-bold flex items-center gap-0.5">
            <Cloud className="w-2 h-2" />
            Drive
          </div>
        )}
      </div>

      <div>
        <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">
          {flower.name}
        </div>
        <button
          onClick={() => onViewFlowerMembers(flower)}
          className="mt-1.5 text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
        >
          <span>ดูคนที่มีดอกนี้</span>
          <ArrowRight className="w-2.5 h-2.5" />
        </button>
      </div>
    </div>
  );
};

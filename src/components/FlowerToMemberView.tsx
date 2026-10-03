import React, { useState, useMemo } from 'react';
import {
  Flower2,
  Users,
  Search,
  Cloud,
  ExternalLink,
  Plus,
  Check,
  UserMinus,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Flower, Member, FlowerTier } from '../types';

interface FlowerToMemberViewProps {
  flowers: Flower[];
  members: Member[];
  selectedFlowerId: string | null;
  onSelectFlower: (flowerId: string) => void;
  onOpenUploadImage: (flower: Flower) => void;
  onToggleMemberFlower: (memberId: string, flowerId: string) => void;
  onViewMemberFlowers: (member: Member) => void;
}

export const FlowerToMemberView: React.FC<FlowerToMemberViewProps> = ({
  flowers,
  members,
  selectedFlowerId,
  onSelectFlower,
  onOpenUploadImage,
  onToggleMemberFlower,
  onViewMemberFlowers,
}) => {
  const [flowerSearchQuery, setFlowerSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<FlowerTier | 'all'>('all');
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

  // Current selected flower
  const currentFlower = useMemo(() => {
    if (selectedFlowerId) {
      return flowers.find((f) => f.id === selectedFlowerId) || flowers[0] || null;
    }
    return flowers[0] || null;
  }, [flowers, selectedFlowerId]);

  // Members who own the selected flower
  const owners = useMemo(() => {
    if (!currentFlower) return [];
    return members.filter((m) => m.flowerIds.includes(currentFlower.id));
  }, [members, currentFlower]);

  // Non-owners (can be quickly added)
  const nonOwners = useMemo(() => {
    if (!currentFlower) return [];
    return members.filter((m) => !m.flowerIds.includes(currentFlower.id));
  }, [members, currentFlower]);

  // Filtered flowers list for picker
  const filteredFlowersList = useMemo(() => {
    let list = flowers;
    if (tierFilter !== 'all') {
      list = list.filter((f) => f.tier === tierFilter);
    }
    if (flowerSearchQuery.trim()) {
      const q = flowerSearchQuery.toLowerCase().trim();
      list = list.filter((f) => f.name.toLowerCase().includes(q));
    }
    return list;
  }, [flowers, tierFilter, flowerSearchQuery]);

  // Filtered owners
  const filteredOwners = useMemo(() => {
    if (!memberSearchQuery.trim()) return owners;
    const q = memberSearchQuery.toLowerCase().trim();
    return owners.filter(
      (m) =>
        (m.guildName && m.guildName.toLowerCase().includes(q)) ||
        (m.lineName && m.lineName.toLowerCase().includes(q)) ||
        (m.name && m.name.toLowerCase().includes(q))
    );
  }, [owners, memberSearchQuery]);

  if (flowers.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 text-center">
        <Flower2 className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
          ยังไม่มีดอกไม้ในระบบ
        </h3>
      </div>
    );
  }

  const tierBadgeStyle =
    currentFlower?.tier === 'ม่วง'
      ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
      : currentFlower?.tier === 'ส้ม'
      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
      : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300';

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
          <Sparkles className="w-6 h-6 text-indigo-600" />
          ดู ดอกไม้ → สมาชิก (Flower's Owners)
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          เลือกดอกไม้เพื่อดูรายชื่อสมาชิกทุกคนที่ครอบครองดอกนี้ (สมาชิกหลายคนสามารถมีดอกเดียวกันได้)
        </p>
      </div>

      {/* Flower Selector Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto text-xs">
            <span className="font-bold text-zinc-700 dark:text-zinc-300 shrink-0">
              ตัวกรองพื้นสี:
            </span>
            <button
              onClick={() => setTierFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                tierFilter === 'all'
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setTierFilter('ม่วง')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                tierFilter === 'ม่วง' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700'
              }`}
            >
              ม่วง
            </button>
            <button
              onClick={() => setTierFilter('ส้ม')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                tierFilter === 'ส้ม' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700'
              }`}
            >
              ส้ม
            </button>
            <button
              onClick={() => setTierFilter('แดง')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                tierFilter === 'แดง' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700'
              }`}
            >
              แดง
            </button>
          </div>

          <div className="flex-1 max-w-md relative">
            <select
              value={currentFlower?.id || ''}
              onChange={(e) => onSelectFlower(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              {filteredFlowersList.map((f) => {
                const ownerCount = members.filter((m) => m.flowerIds.includes(f.id)).length;
                return (
                  <option key={f.id} value={f.id}>
                    [{f.tier}] {f.name} — มีสมาชิก {ownerCount} คน
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Quick pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {filteredFlowersList.slice(0, 25).map((f) => {
            const isSelected = currentFlower?.id === f.id;
            return (
              <button
                key={f.id}
                onClick={() => onSelectFlower(f.id)}
                className={`px-3 py-1 rounded-xl whitespace-nowrap transition text-xs ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
                }`}
              >
                {f.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Flower Banner Card */}
      {currentFlower && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5 w-full md:w-auto">
            {/* Flower Photo (1 flower = 1 picture) */}
            <div
              onClick={() => onOpenUploadImage(currentFlower)}
              className="relative w-20 h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden cursor-pointer flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-700 group shadow-xs"
              title="คลิกเพื่อจัดการรูปภาพดอกไม้นี้"
            >
              {currentFlower.imageUrl ? (
                <img
                  src={currentFlower.imageUrl}
                  alt={currentFlower.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
              ) : (
                <Flower2 className="w-8 h-8 text-zinc-400 group-hover:scale-110 transition" />
              )}
              {currentFlower.driveFileId && (
                <div className="absolute top-1 left-1 px-1 py-0.5 rounded bg-blue-600/90 text-white text-[8px] font-bold flex items-center gap-0.5">
                  <Cloud className="w-2.5 h-2.5" />
                  Drive
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tierBadgeStyle}`}>
                  พื้นสี{currentFlower.tier}
                </span>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {currentFlower.name}
                </h3>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-2">
                <span>มีสมาชิกครอบครองอยู่ทั้งหมด:</span>
                <strong className="text-indigo-600 dark:text-indigo-400 text-sm font-extrabold">
                  {owners.length} คน
                </strong>
              </p>
              {currentFlower.driveWebViewLink && (
                <a
                  href={currentFlower.driveWebViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline mt-1"
                >
                  <Cloud className="w-3 h-3" />
                  เปิดไฟล์รูปภาพใน Google Drive
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={() => onOpenUploadImage(currentFlower)}
              className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition"
            >
              <Cloud className="w-4 h-4 text-blue-500" />
              {currentFlower.imageUrl ? 'จัดการรูปภาพ (Drive)' : '+ อัปโหลดรูปภาพ (Drive)'}
            </button>
          </div>
        </div>
      )}

      {/* Owners List Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            รายชื่อสมาชิกที่ครอบครองดอก "{currentFlower?.name}" ({owners.length} คน)
          </h3>

          {owners.length > 0 && (
            <div className="relative max-w-xs">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={memberSearchQuery}
                onChange={(e) => setMemberSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อสมาชิกในหน้านี้..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-hidden text-zinc-900 dark:text-zinc-100"
              />
            </div>
          )}
        </div>

        {filteredOwners.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-10 text-center">
            <Users className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
              ยังไม่มีสมาชิกครอบครองดอกไม้นี้
            </h4>
            <p className="text-xs text-zinc-500 mt-1">
              คุณสามารถกดเลือกสมาชิกจากรายการด้านล่างเพื่อมอบดอกไม้นี้ได้ทันที
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {filteredOwners.map((member) => (
              <div
                key={member.id}
                className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs hover:border-zinc-300 transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${
                      member.avatarColor || 'from-indigo-500 to-purple-600'
                    } flex items-center justify-center text-white font-bold text-sm shadow-xs`}
                  >
                    {(member.guildName || member.name || 'G').charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {member.guildName || member.name}
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      LINE: {member.lineName || '-'} • มี {member.flowerIds.length} ดอก
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onViewMemberFlowers(member)}
                    className="p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition"
                    title="ดูดอกไม้ทั้งหมดของสมาชิกท่านนี้"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  {currentFlower && (
                    <button
                      onClick={() => onToggleMemberFlower(member.id, currentFlower.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                      title="ยกเลิกดอกไม้นี้ออกจากสมาชิก"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Add other members to this flower */}
        {nonOwners.length > 0 && currentFlower && (
          <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <h4 className="text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-3 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              เพิ่มสมาชิกที่ครอบครองดอก "{currentFlower.name}" ได้ทันที ({nonOwners.length} คนที่ยังไม่มี):
            </h4>

            <div className="flex flex-wrap items-center gap-2">
              {nonOwners.slice(0, 15).map((m) => (
                <button
                  key={m.id}
                  onClick={() => onToggleMemberFlower(m.id, currentFlower.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-xs text-zinc-700 dark:text-zinc-300 transition group"
                >
                  <Plus className="w-3 h-3 text-zinc-400 group-hover:text-indigo-600" />
                  <span>{m.guildName || m.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

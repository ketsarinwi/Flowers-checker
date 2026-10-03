import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  CheckSquare,
  ArrowRight,
  Edit2,
  Trash2,
  Flower2,
  MoreVertical,
  X,
} from 'lucide-react';
import { Member, Flower, FlowerTier } from '../types';

interface MembersViewProps {
  members: Member[];
  flowers: Flower[];
  onOpenAddMember: () => void;
  onEditMember: (member: Member) => void;
  onDeleteMember: (member: Member) => void;
  onAssignFlowers: (member: Member) => void;
  onViewMemberFlowers: (member: Member) => void;
}

export const MembersView: React.FC<MembersViewProps> = ({
  members,
  flowers,
  onOpenAddMember,
  onEditMember,
  onDeleteMember,
  onAssignFlowers,
  onViewMemberFlowers,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<FlowerTier | 'all'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'flowers-desc' | 'flowers-asc' | 'newest'>('newest');

  // Map flowers for fast lookup
  const flowerMap = useMemo(() => {
    const map = new Map<string, Flower>();
    flowers.forEach((f) => map.set(f.id, f));
    return map;
  }, [flowers]);

  // Filter and sort members
  const filteredMembers = useMemo(() => {
    let list = [...members];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (m) =>
          (m.guildName && m.guildName.toLowerCase().includes(q)) ||
          (m.lineName && m.lineName.toLowerCase().includes(q)) ||
          (m.name && m.name.toLowerCase().includes(q))
      );
    }

    if (tierFilter !== 'all') {
      list = list.filter((m) =>
        m.flowerIds.some((fid) => {
          const flower = flowerMap.get(fid);
          return flower?.tier === tierFilter;
        })
      );
    }

    // Sort
    list.sort((a, b) => {
      const aName = a.guildName || a.name || '';
      const bName = b.guildName || b.name || '';
      if (sortBy === 'name') return aName.localeCompare(bName, 'th');
      if (sortBy === 'flowers-desc') return b.flowerIds.length - a.flowerIds.length;
      if (sortBy === 'flowers-asc') return a.flowerIds.length - b.flowerIds.length;
      if (sortBy === 'newest') return b.createdAt - a.createdAt;
      return 0;
    });

    return list;
  }, [members, searchQuery, tierFilter, sortBy, flowerMap]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-600" />
            จัดการสมาชิก (Members)
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            เพิ่ม/แก้ไข/ลบสมาชิก และจัดการมอบดอกไม้ด้วย Checkbox แยกตามสีพื้น
          </p>
        </div>

        <button
          onClick={onOpenAddMember}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition"
        >
          <UserPlus className="w-4 h-4" />
          เพิ่มสมาชิกใหม่
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อสมาชิก, รหัส, หรือหมายเหตุ..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Tier Filter Tabs */}
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl overflow-x-auto text-xs">
            <button
              onClick={() => setTierFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                tierFilter === 'all'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setTierFilter('ม่วง')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                tierFilter === 'ม่วง'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-purple-700 dark:text-purple-300'
              }`}
            >
              มีพื้นม่วง
            </button>
            <button
              onClick={() => setTierFilter('ส้ม')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                tierFilter === 'ส้ม'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-700 dark:text-amber-300'
              }`}
            >
              มีพื้นส้ม
            </button>
            <button
              onClick={() => setTierFilter('แดง')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                tierFilter === 'แดง'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-700 dark:text-rose-300'
              }`}
            >
              มีพื้นแดง
            </button>
          </div>

          {/* Sort selection */}
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden text-zinc-700 dark:text-zinc-300 font-medium"
          >
            <option value="newest">เพิ่มล่าสุด</option>
            <option value="flowers-desc">ดอกไม้มากที่สุด</option>
            <option value="flowers-asc">ดอกไม้น้อยที่สุด</option>
            <option value="name">เรียงตามชื่อ ก-ฮ</option>
          </select>
        </div>

        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pt-1">
          <span>
            พบสมาชิก <strong className="text-zinc-900 dark:text-zinc-100">{filteredMembers.length}</strong> คน
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-indigo-600 hover:underline"
            >
              ล้างคำค้นหา
            </button>
          )}
        </div>
      </div>

      {/* Members Grid */}
      {filteredMembers.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mx-auto mb-3">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
            ไม่พบสมาชิกที่ค้นหา
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            ลองเปลี่ยนคำค้นหา หรือกดปุ่ม "เพิ่มสมาชิกใหม่" เพื่อเริ่มต้น
          </p>
          <button
            onClick={onOpenAddMember}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
          >
            + เพิ่มสมาชิกใหม่ทันที
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => {
            // Count tier breakdown
            let purpleCount = 0;
            let orangeCount = 0;
            let redCount = 0;

            member.flowerIds.forEach((fid) => {
              const flower = flowerMap.get(fid);
              if (flower?.tier === 'ม่วง') purpleCount++;
              else if (flower?.tier === 'ส้ม') orangeCount++;
              else if (flower?.tier === 'แดง') redCount++;
            });

            return (
              <div
                key={member.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition flex flex-col justify-between"
              >
                {/* Top info */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${
                          member.avatarColor || 'from-indigo-500 to-purple-600'
                        } flex items-center justify-center text-white font-extrabold text-base shadow-sm`}
                      >
                        {(member.guildName || member.name || 'G').charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                          {member.guildName || member.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] font-medium px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 rounded-md">
                            LINE: {member.lineName || 'ยังไม่ระบุ'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditMember(member)}
                        title="แก้ไขข้อมูลสมาชิก"
                        className="p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteMember(member)}
                        title="ลบสมาชิก"
                        className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Flower Badges by Tier */}
                  <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-100 dark:border-zinc-800/80">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                        <Flower2 className="w-3.5 h-3.5 text-indigo-500" />
                        ดอกไม้ที่ครอบครอง:
                      </span>
                      <strong className="text-indigo-600 dark:text-indigo-400 font-extrabold">
                        {member.flowerIds.length} ดอก
                      </strong>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-center">
                      <div className="p-1.5 rounded-xl bg-purple-100/70 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-[11px] font-semibold">
                        ม่วง {purpleCount}
                      </div>
                      <div className="p-1.5 rounded-xl bg-amber-100/70 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[11px] font-semibold">
                        ส้ม {orangeCount}
                      </div>
                      <div className="p-1.5 rounded-xl bg-rose-100/70 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-[11px] font-semibold">
                        แดง {redCount}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                  <button
                    onClick={() => onAssignFlowers(member)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold transition active:scale-95"
                    title="เปิดกล่อง Checkbox แยกตามสีพื้น"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    จัดการดอกไม้ (Checkbox)
                  </button>

                  <button
                    onClick={() => onViewMemberFlowers(member)}
                    className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
                    title="ดูรายละเอียด สมาชิก → ดอกไม้"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

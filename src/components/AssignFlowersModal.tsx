import React, { useState, useMemo } from 'react';
import { X, Search, CheckSquare, Square, Flower2, Check, Sparkles, Filter } from 'lucide-react';
import { Flower, Member, FlowerTier } from '../types';

interface AssignFlowersModalProps {
  isOpen: boolean;
  member: Member | null;
  flowers: Flower[];
  allMembers: Member[];
  onClose: () => void;
  onSave: (memberId: string, flowerIds: string[]) => void;
}

export const AssignFlowersModal: React.FC<AssignFlowersModalProps> = ({
  isOpen,
  member,
  flowers,
  allMembers,
  onClose,
  onSave,
}) => {
  if (!isOpen || !member) return null;

  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(member.flowerIds || [])
  );
  const [activeTierTab, setActiveTierTab] = useState<FlowerTier | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Group flowers by tier
  const flowersByTier = useMemo(() => {
    return {
      ม่วง: flowers.filter((f) => f.tier === 'ม่วง'),
      ส้ม: flowers.filter((f) => f.tier === 'ส้ม'),
      แดง: flowers.filter((f) => f.tier === 'แดง'),
    };
  }, [flowers]);

  // Filtered flowers based on search and active tab
  const displayedFlowers = useMemo(() => {
    let list = flowers;
    if (activeTierTab !== 'all') {
      list = list.filter((f) => f.tier === activeTierTab);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((f) => f.name.toLowerCase().includes(q));
    }
    return list;
  }, [flowers, activeTierTab, searchQuery]);

  // Counts of selected per tier
  const tierCounts = useMemo(() => {
    let purple = 0;
    let orange = 0;
    let red = 0;

    flowers.forEach((f) => {
      if (selectedIds.has(f.id)) {
        if (f.tier === 'ม่วง') purple++;
        else if (f.tier === 'ส้ม') orange++;
        else if (f.tier === 'แดง') red++;
      }
    });

    return {
      ม่วง: purple,
      ส้ม: orange,
      แดง: red,
      total: selectedIds.size,
    };
  }, [flowers, selectedIds]);

  const handleToggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAllInTier = (tier: FlowerTier) => {
    const tierFlowers = flowersByTier[tier];
    setSelectedIds((prev) => {
      const next = new Set(prev);
      tierFlowers.forEach((f) => next.add(f.id));
      return next;
    });
  };

  const handleDeselectAllInTier = (tier: FlowerTier) => {
    const tierFlowers = flowersByTier[tier];
    setSelectedIds((prev) => {
      const next = new Set(prev);
      tierFlowers.forEach((f) => next.delete(f.id));
      return next;
    });
  };

  const handleSelectAllVisible = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      displayedFlowers.forEach((f) => next.add(f.id));
      return next;
    });
  };

  const handleDeselectAllVisible = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      displayedFlowers.forEach((f) => next.delete(f.id));
      return next;
    });
  };

  const handleSave = () => {
    onSave(member.id, Array.from(selectedIds));
    onClose();
  };

  // Helper map for member counts on each flower
  const flowerMemberCount = useMemo(() => {
    const map = new Map<string, number>();
    allMembers.forEach((m) => {
      m.flowerIds.forEach((fid) => {
        map.set(fid, (map.get(fid) || 0) + 1);
      });
    });
    return map;
  }, [allMembers]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-4xl w-full h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-start justify-between bg-zinc-50/70 dark:bg-zinc-900/70">
          <div>
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${
                  member.avatarColor || 'from-indigo-500 to-purple-600'
                } flex items-center justify-center text-white font-bold text-sm shadow-xs`}
              >
                {(member.guildName || member.name || 'G').charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  เพิ่ม/แก้ไขดอกไม้ให้สมาชิก: {member.guildName || member.name}
                  {member.lineName && (
                    <span className="text-xs px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-md font-medium border border-emerald-200 dark:border-emerald-800">
                      LINE: {member.lineName}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  เลือกดอกไม้ด้วย Checkbox แยกตามสีพื้น (สมาชิกหลายคนสามารถมีดอกเดียวกันได้)
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1.5 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tier Tabs & Action Toolbar */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Tier Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTierTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  activeTierTab === 'all'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                ทั้งหมด ({tierCounts.total}/{flowers.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTierTab('ม่วง')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                  activeTierTab === 'ม่วง'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-purple-700 dark:text-purple-300 hover:bg-purple-100/60 dark:hover:bg-purple-950/40'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-purple-300"></span>
                พื้นสีม่วง ({tierCounts.ม่วง}/{flowersByTier.ม่วง.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTierTab('ส้ม')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                  activeTierTab === 'ส้ม'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-amber-700 dark:text-amber-300 hover:bg-amber-100/60 dark:hover:bg-amber-950/40'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-300"></span>
                พื้นสีส้ม ({tierCounts.ส้ม}/{flowersByTier.ส้ม.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTierTab('แดง')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                  activeTierTab === 'แดง'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-rose-700 dark:text-rose-300 hover:bg-rose-100/60 dark:hover:bg-rose-950/40'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-300"></span>
                พื้นสีแดง ({tierCounts.แดง}/{flowersByTier.แดง.length})
              </button>
            </div>

            {/* In-Modal Search */}
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อดอกไม้ในหน้านี้..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Select Buttons */}
          <div className="flex flex-wrap items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pt-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">จัดการกลุ่ม {activeTierTab === 'all' ? 'ที่แสดง' : `พื้นสี${activeTierTab}`}:</span>
              {activeTierTab !== 'all' ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleSelectAllInTier(activeTierTab)}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                  >
                    + เลือกทั้งหมดในสีนี้
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => handleDeselectAllInTier(activeTierTab)}
                    className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  >
                    ยกเลิกทั้งหมดในสีนี้
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleSelectAllVisible}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                  >
                    + เลือกทั้งหมดที่แสดง ({displayedFlowers.length})
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={handleDeselectAllVisible}
                    className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  >
                    ยกเลิกทั้งหมดที่แสดง
                  </button>
                </>
              )}
            </div>

            <div className="text-xs">
              แสดงอยู่ <strong className="text-zinc-800 dark:text-zinc-200">{displayedFlowers.length}</strong> ดอก
            </div>
          </div>
        </div>

        {/* Checkbox Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-zinc-50/50 dark:bg-zinc-950/40">
          {displayedFlowers.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6">
              <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mb-2">
                <Flower2 className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                ไม่พบดอกไม้ที่ค้นหา "{searchQuery}"
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveTierTab('all');
                }}
                className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                ล้างการค้นหา
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {displayedFlowers.map((flower) => {
                const isSelected = selectedIds.has(flower.id);
                const countOfOtherOwners = flowerMemberCount.get(flower.id) || 0;

                const tierStyles =
                  flower.tier === 'ม่วง'
                    ? {
                        borderActive: 'border-purple-500 bg-purple-50/80 dark:bg-purple-950/30',
                        badge: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
                        checkColor: 'text-purple-600',
                      }
                    : flower.tier === 'ส้ม'
                    ? {
                        borderActive: 'border-amber-500 bg-amber-50/80 dark:bg-amber-950/30',
                        badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
                        checkColor: 'text-amber-600',
                      }
                    : {
                        borderActive: 'border-rose-500 bg-rose-50/80 dark:bg-rose-950/30',
                        badge: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
                        checkColor: 'text-rose-600',
                      };

                return (
                  <label
                    key={flower.id}
                    onClick={() => handleToggle(flower.id)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                      isSelected
                        ? `${tierStyles.borderActive} shadow-xs font-medium`
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    {/* Checkbox Icon */}
                    <div className="shrink-0">
                      {isSelected ? (
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center ${
                            flower.tier === 'ม่วง'
                              ? 'bg-purple-600 text-white'
                              : flower.tier === 'ส้ม'
                              ? 'bg-amber-600 text-white'
                              : 'bg-rose-600 text-white'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800"></div>
                      )}
                    </div>

                    {/* Flower Thumbnail or Icon */}
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                      {flower.imageUrl ? (
                        <img
                          src={flower.imageUrl}
                          alt={flower.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Flower2 className="w-4 h-4 text-zinc-400" />
                      )}
                    </div>

                    {/* Flower Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
                          {flower.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${tierStyles.badge}`}>
                          {flower.tier}
                        </span>
                        {countOfOtherOwners > 0 && (
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">
                            {countOfOtherOwners} คนมีดอกนี้
                          </span>
                        )}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Summary & Save */}
        <div className="p-4 sm:p-5 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-300">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              รวมที่เลือก: {selectedIds.size} ดอก
            </span>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-semibold">
                ม่วง {tierCounts.ม่วง}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 font-semibold">
                ส้ม {tierCounts.ส้ม}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-semibold">
                แดง {tierCounts.แดง}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 sm:flex-none px-6 py-2 text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              บันทึกข้อมูลดอกไม้
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

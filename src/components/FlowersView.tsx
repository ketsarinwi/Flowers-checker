import React, { useState, useMemo } from 'react';
import {
  Flower2,
  PlusCircle,
  Search,
  Filter,
  Cloud,
  Image as ImageIcon,
  Edit3,
  Trash2,
  Users,
  ExternalLink,
  X,
  UploadCloud,
} from 'lucide-react';
import { Flower, Member, FlowerTier } from '../types';

interface FlowersViewProps {
  flowers: Flower[];
  members: Member[];
  onOpenAddFlower: () => void;
  onEditFlower: (flower: Flower) => void;
  onDeleteFlower: (flower: Flower) => void;
  onOpenUploadImage: (flower: Flower) => void;
  onSelectFlowerForMembers: (flower: Flower) => void;
}

export const FlowersView: React.FC<FlowersViewProps> = ({
  flowers,
  members,
  onOpenAddFlower,
  onEditFlower,
  onDeleteFlower,
  onOpenUploadImage,
  onSelectFlowerForMembers,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<FlowerTier | 'all'>('all');
  const [imageFilter, setImageFilter] = useState<'all' | 'with-image' | 'no-image'>('all');
  const [ownerFilter, setOwnerFilter] = useState<'all' | 'owned' | 'unowned'>('all');

  // Count how many members own each flower
  const flowerOwnersMap = useMemo(() => {
    const map = new Map<string, Member[]>();
    members.forEach((m) => {
      m.flowerIds.forEach((fid) => {
        const list = map.get(fid) || [];
        list.push(m);
        map.set(fid, list);
      });
    });
    return map;
  }, [members]);

  // Filtered flowers
  const filteredFlowers = useMemo(() => {
    let list = [...flowers];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((f) => f.name.toLowerCase().includes(q));
    }

    if (tierFilter !== 'all') {
      list = list.filter((f) => f.tier === tierFilter);
    }

    if (imageFilter === 'with-image') {
      list = list.filter((f) => !!f.imageUrl);
    } else if (imageFilter === 'no-image') {
      list = list.filter((f) => !f.imageUrl);
    }

    if (ownerFilter === 'owned') {
      list = list.filter((f) => (flowerOwnersMap.get(f.id)?.length || 0) > 0);
    } else if (ownerFilter === 'unowned') {
      list = list.filter((f) => (flowerOwnersMap.get(f.id)?.length || 0) === 0);
    }

    return list;
  }, [flowers, searchQuery, tierFilter, imageFilter, ownerFilter, flowerOwnersMap]);

  // Tier counts
  const tierSummary = useMemo(() => {
    return {
      total: flowers.length,
      ม่วง: flowers.filter((f) => f.tier === 'ม่วง').length,
      ส้ม: flowers.filter((f) => f.tier === 'ส้ม').length,
      แดง: flowers.filter((f) => f.tier === 'แดง').length,
    };
  }, [flowers]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <Flower2 className="w-6 h-6 text-purple-600" />
            คลังดอกไม้ (Flowers Catalog)
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            ดอกไม้ 1 ชนิดมีรูปได้ 1 รูป • อัปโหลดเก็บเข้า Google Drive • แก้ไขชื่อและลบดอกไม้
          </p>
        </div>

        <button
          onClick={onOpenAddFlower}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-md shadow-purple-600/20 active:scale-95 transition"
        >
          <PlusCircle className="w-4 h-4" />
          เพิ่มดอกไม้ใหม่
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อดอกไม้ (เช่น เดลฟิเนียม, โบตั๋น, กาแลกซี)..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-zinc-900 dark:text-zinc-100"
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

          {/* Tier Tabs */}
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl overflow-x-auto text-xs">
            <button
              onClick={() => setTierFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition ${
                tierFilter === 'all'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              ทั้งหมด ({tierSummary.total})
            </button>
            <button
              onClick={() => setTierFilter('ม่วง')}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                tierFilter === 'ม่วง'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-purple-700 dark:text-purple-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-purple-300"></span>
              พื้นสีม่วง ({tierSummary.ม่วง})
            </button>
            <button
              onClick={() => setTierFilter('ส้ม')}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                tierFilter === 'ส้ม'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-700 dark:text-amber-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-300"></span>
              พื้นสีส้ม ({tierSummary.ส้ม})
            </button>
            <button
              onClick={() => setTierFilter('แดง')}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                tierFilter === 'แดง'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-700 dark:text-rose-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-300"></span>
              พื้นสีแดง ({tierSummary.แดง})
            </button>
          </div>

          {/* Sub Filters */}
          <div className="flex items-center gap-2">
            <select
              value={imageFilter}
              onChange={(e: any) => setImageFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden text-zinc-700 dark:text-zinc-300 font-medium"
            >
              <option value="all">รูปภาพ: ทั้งหมด</option>
              <option value="with-image">มีรูปภาพแล้ว</option>
              <option value="no-image">ยังไม่มีรูปภาพ</option>
            </select>

            <select
              value={ownerFilter}
              onChange={(e: any) => setOwnerFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden text-zinc-700 dark:text-zinc-300 font-medium"
            >
              <option value="all">การครอบครอง: ทั้งหมด</option>
              <option value="owned">มีสมาชิกครอบครอง</option>
              <option value="unowned">ยังไม่มีผู้ครอบครอง</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pt-1">
          <span>
            แสดงผล <strong className="text-zinc-900 dark:text-zinc-100">{filteredFlowers.length}</strong> จากทั้งหมด {flowers.length} ชนิด
          </span>
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-purple-600 hover:underline">
              ล้างคำค้นหา
            </button>
          )}
        </div>
      </div>

      {/* Flower Grid */}
      {filteredFlowers.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mx-auto mb-3">
            <Flower2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
            ไม่พบดอกไม้ตามเงื่อนไขที่เลือก
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            ลองปรับเปลี่ยนคำค้นหาหรือตัวกรองระดับสีพื้น
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {filteredFlowers.map((flower) => {
            const owners = flowerOwnersMap.get(flower.id) || [];

            const tierStyle =
              flower.tier === 'ม่วง'
                ? {
                    badge: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
                    border: 'hover:border-purple-300 dark:hover:border-purple-800',
                    accent: 'text-purple-600',
                  }
                : flower.tier === 'ส้ม'
                ? {
                    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
                    border: 'hover:border-amber-300 dark:hover:border-amber-800',
                    accent: 'text-amber-600',
                  }
                : {
                    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
                    border: 'hover:border-rose-300 dark:hover:border-rose-800',
                    accent: 'text-rose-600',
                  };

            return (
              <div
                key={flower.id}
                className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs ${tierStyle.border} transition flex flex-col justify-between group`}
              >
                {/* Image Section (1 รูปต่อ 1 ดอกไม้) */}
                <div
                  onClick={() => onOpenUploadImage(flower)}
                  className="relative aspect-4/3 bg-zinc-100 dark:bg-zinc-800/80 cursor-pointer overflow-hidden flex items-center justify-center"
                  title="คลิกเพื่อจัดการ/อัปโหลดรูปภาพเข้า Google Drive"
                >
                  {flower.imageUrl ? (
                    <img
                      src={flower.imageUrl}
                      alt={flower.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-3 text-center text-zinc-400 hover:text-zinc-600 transition">
                      <ImageIcon className="w-8 h-8 stroke-1 mb-1" />
                      <span className="text-[10px] font-medium">+ เพิ่มรูปภาพ</span>
                    </div>
                  )}

                  {/* Drive Badge if saved to Google Drive */}
                  {flower.driveFileId && (
                    <div
                      className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-blue-600/90 text-white text-[9px] font-bold flex items-center gap-1 shadow-xs backdrop-blur-xs"
                      title="รูปภาพนี้ถูกอัปโหลดเก็บใน Google Drive"
                    >
                      <Cloud className="w-2.5 h-2.5" />
                      Drive
                    </div>
                  )}

                  {/* Tier Badge */}
                  <div
                    className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${tierStyle.badge}`}
                  >
                    {flower.tier}
                  </div>
                </div>

                {/* Info & Member Ownership */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2 min-h-8">
                      {flower.name}
                    </h4>

                    {/* Ownership pill: click to view flower -> members */}
                    <button
                      onClick={() => onSelectFlowerForMembers(flower)}
                      className="mt-2 w-full flex items-center justify-between px-2 py-1 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-[10px] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700/80 transition"
                      title="ดูสมาชิกที่ครอบครองดอกนี้ (ดู ดอกไม้ → สมาชิก)"
                    >
                      <span className="flex items-center gap-1 font-medium">
                        <Users className="w-3 h-3 text-indigo-500" />
                        สมาชิก:
                      </span>
                      <strong className="text-indigo-600 dark:text-indigo-400 font-bold">
                        {owners.length} คน
                      </strong>
                    </button>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                    <button
                      onClick={() => onOpenUploadImage(flower)}
                      className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      title="อัปโหลดรูปภาพเข้า Google Drive"
                    >
                      <UploadCloud className="w-3 h-3" />
                      รูปภาพ
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditFlower(flower)}
                        title="แก้ไขชื่อดอกไม้"
                        className="p-1 text-zinc-400 hover:text-indigo-600 rounded-md transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteFlower(flower)}
                        title="ลบดอกไม้นี้"
                        className="p-1 text-zinc-400 hover:text-rose-600 rounded-md transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

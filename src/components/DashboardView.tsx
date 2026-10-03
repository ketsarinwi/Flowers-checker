import React, { useMemo } from 'react';
import {
  Users,
  Flower2,
  Image as ImageIcon,
  CheckCircle,
  TrendingUp,
  Award,
  Sparkles,
  ArrowRight,
  PlusCircle,
  UserPlus,
  Cloud,
} from 'lucide-react';
import { Flower, Member, FlowerTier } from '../types';
import { ActiveTab } from './Navbar';

interface DashboardViewProps {
  flowers: Flower[];
  members: Member[];
  onNavigate: (tab: ActiveTab) => void;
  onOpenAddMember: () => void;
  onOpenAddFlower: () => void;
  onSelectMemberForFlowers: (member: Member) => void;
  onSelectFlowerForMembers: (flower: Flower) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  flowers,
  members,
  onNavigate,
  onOpenAddMember,
  onOpenAddFlower,
  onSelectMemberForFlowers,
  onSelectFlowerForMembers,
}) => {
  // Statistics calculations
  const stats = useMemo(() => {
    const totalFlowers = flowers.length;
    const totalMembers = members.length;

    const purpleFlowers = flowers.filter((f) => f.tier === 'ม่วง');
    const orangeFlowers = flowers.filter((f) => f.tier === 'ส้ม');
    const redFlowers = flowers.filter((f) => f.tier === 'แดง');

    const flowersWithImages = flowers.filter((f) => !!f.imageUrl);
    const driveImages = flowers.filter((f) => !!f.driveFileId);

    // Count which flowers are owned by at least 1 member
    const ownedFlowerIds = new Set<string>();
    members.forEach((m) => {
      m.flowerIds.forEach((fid) => ownedFlowerIds.add(fid));
    });

    // Popular flowers ranking
    const flowerPopularityMap = new Map<string, number>();
    members.forEach((m) => {
      m.flowerIds.forEach((fid) => {
        flowerPopularityMap.set(fid, (flowerPopularityMap.get(fid) || 0) + 1);
      });
    });

    const popularFlowers = [...flowers]
      .filter((f) => (flowerPopularityMap.get(f.id) || 0) > 0)
      .sort((a, b) => (flowerPopularityMap.get(b.id) || 0) - (flowerPopularityMap.get(a.id) || 0))
      .slice(0, 6);

    // Top collectors (members with most flowers)
    const topMembers = [...members]
      .sort((a, b) => b.flowerIds.length - a.flowerIds.length)
      .slice(0, 5);

    return {
      totalFlowers,
      totalMembers,
      purpleCount: purpleFlowers.length,
      orangeCount: orangeFlowers.length,
      redCount: redFlowers.length,
      withImagesCount: flowersWithImages.length,
      driveImagesCount: driveImages.length,
      ownedCount: ownedFlowerIds.size,
      unownedCount: Math.max(0, totalFlowers - ownedFlowerIds.size),
      popularFlowers,
      flowerPopularityMap,
      topMembers,
    };
  }, [flowers, members]);

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome & Quick Actions Hero */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-12 translate-y-8 pointer-events-none">
          <Flower2 className="w-96 h-96" />
        </div>

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            ระบบจัดการคลังดอกไม้และสมาชิกเรียลไทม์
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            ภาพรวมคลังดอกไม้ & สมาชิก
          </h2>
          <p className="text-white/80 text-sm leading-relaxed">
            ติดตามการครอบครองดอกไม้ของสมาชิก จัดหมวดหมู่แยกตามสีพื้น (ม่วง • ส้ม • แดง)
            พร้อมการอัปโหลดรูปภาพเก็บลง Google Drive และซิงก์ข้อมูลอัปเดตแบบเรียลไทม์
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onOpenAddMember}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-indigo-700 hover:bg-zinc-100 rounded-xl font-bold text-xs shadow-md transition active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              เพิ่มสมาชิกใหม่
            </button>
            <button
              onClick={onOpenAddFlower}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-xs border border-white/30 backdrop-blur-sm transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              เพิ่มดอกไม้ใหม่
            </button>
            <button
              onClick={() => onNavigate('member-to-flower')}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-black/20 hover:bg-black/30 text-white rounded-xl font-semibold text-xs transition"
            >
              ดู สมาชิก → ดอกไม้
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Members */}
        <div
          onClick={() => onNavigate('members')}
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-500 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              สมาชิกทั้งหมด
            </span>
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {stats.totalMembers}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">พร้อมใช้งาน</span>
            ในระบบ
          </p>
        </div>

        {/* Total Flowers */}
        <div
          onClick={() => onNavigate('flowers')}
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs hover:border-purple-400 dark:hover:border-purple-500 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              ดอกไม้ทั้งหมดในระบบ
            </span>
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition">
              <Flower2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {stats.totalFlowers}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            ม่วง {stats.purpleCount} • ส้ม {stats.orangeCount} • แดง {stats.redCount}
          </p>
        </div>

        {/* Owned Flowers Coverage */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              ครอบครองแล้ว
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {stats.ownedCount}{' '}
            <span className="text-sm font-normal text-zinc-400">
              / {stats.totalFlowers}
            </span>
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{
                width: `${stats.totalFlowers > 0 ? (stats.ownedCount / stats.totalFlowers) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Images Uploaded to Drive / Local */}
        <div
          onClick={() => onNavigate('flowers')}
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs hover:border-blue-400 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              รูปภาพดอกไม้
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition">
              <Cloud className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {stats.withImagesCount}{' '}
            <span className="text-sm font-normal text-zinc-400">
              / {stats.totalFlowers}
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1">
            <Cloud className="w-3.5 h-3.5 text-blue-500" />
            <span>Google Drive: {stats.driveImagesCount} รูป</span>
          </p>
        </div>
      </div>

      {/* Tier Category Cards (ม่วง, ส้ม, แดง) */}
      <div>
        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
          <span>แยกตามระดับสีพื้น</span>
          <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">
            (Purple, Orange, Red Tier)
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Purple Tier */}
          <div
            onClick={() => onNavigate('flowers')}
            className="p-5 rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-gradient-to-b from-purple-50/50 to-white dark:from-purple-950/20 dark:to-zinc-900 shadow-xs hover:border-purple-400 cursor-pointer transition group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-purple-500"></span>
                <span className="font-bold text-sm text-purple-900 dark:text-purple-200">
                  พื้นสีม่วง
                </span>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                Tier ม่วง
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black text-purple-950 dark:text-purple-100">
                {stats.purpleCount}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">ชนิดดอกไม้</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2">
              รวบรวมดอกไม้ระดับพื้นม่วง เช่น เดลฟิเนียม, ออนซีเดียม, กุหลาบแชมเปญ, อัลเลี่ยม ฯลฯ
            </p>
          </div>

          {/* Orange Tier */}
          <div
            onClick={() => onNavigate('flowers')}
            className="p-5 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-gradient-to-b from-amber-50/50 to-white dark:from-amber-950/20 dark:to-zinc-900 shadow-xs hover:border-amber-400 cursor-pointer transition group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500"></span>
                <span className="font-bold text-sm text-amber-900 dark:text-amber-200">
                  พื้นสีส้ม
                </span>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                Tier ส้ม
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-950 dark:text-amber-100">
                {stats.orangeCount}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">ชนิดดอกไม้</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2">
              รวบรวมดอกไม้ระดับพื้นส้ม เช่น แมกโนเลียเพิร์ล, เรือล่องดาว, กุหลาบผีเสื้อ, คิงโพรเทีย ฯลฯ
            </p>
          </div>

          {/* Red Tier */}
          <div
            onClick={() => onNavigate('flowers')}
            className="p-5 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-gradient-to-b from-rose-50/50 to-white dark:from-rose-950/20 dark:to-zinc-900 shadow-xs hover:border-rose-400 cursor-pointer transition group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-500"></span>
                <span className="font-bold text-sm text-rose-900 dark:text-rose-200">
                  พื้นสีแดง
                </span>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                Tier แดง (หายาก)
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black text-rose-950 dark:text-rose-100">
                {stats.redCount}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">ชนิดดอกไม้</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2">
              รวบรวมดอกไม้ระดับพื้นแดง เช่น กาแลกซีทอประกาย, สัตตบงกช, งานเลี้ยงบุปผา, หมึกหนึ่งในใต้หล้า ฯลฯ
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Section: Popular Flowers & Top Collectors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Flowers (หลายคนมีดอกเดียวกันได้) */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  ดอกไม้ยอดนิยมที่สมาชิกครอบครองมากที่สุด
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  (สมาชิกหลายคนมีดอกเดียวกันได้)
                </p>
              </div>
              <button
                onClick={() => onNavigate('flower-to-member')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                ดูทั้งหมด
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {stats.popularFlowers.map((flower, idx) => {
                const count = stats.flowerPopularityMap.get(flower.id) || 0;
                return (
                  <div
                    key={flower.id}
                    onClick={() => onSelectFlowerForMembers(flower)}
                    className="flex items-center justify-between p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center font-bold text-xs text-zinc-400">
                        #{idx + 1}
                      </span>
                      <div className="w-9 h-9 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
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
                      <div>
                        <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {flower.name}
                        </div>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-md ${
                            flower.tier === 'ม่วง'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                              : flower.tier === 'ส้ม'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          พื้นสี{flower.tier}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                        {count} สมาชิก
                      </span>
                      <ArrowRight className="w-4 h-4 text-zinc-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Active Members */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  สมาชิกที่มีดอกไม้สะสมมากที่สุด
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  (แสดงจำนวนดอกไม้ของสมาชิกแต่ละคน)
                </p>
              </div>
              <button
                onClick={() => onNavigate('members')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                ดูสมาชิกทั้งหมด
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {stats.topMembers.map((member, idx) => {
                // Tier breakdown of this member's flowers
                const mFlowers = flowers.filter((f) => member.flowerIds.includes(f.id));
                const purple = mFlowers.filter((f) => f.tier === 'ม่วง').length;
                const orange = mFlowers.filter((f) => f.tier === 'ส้ม').length;
                const red = mFlowers.filter((f) => f.tier === 'แดง').length;

                return (
                  <div
                    key={member.id}
                    onClick={() => onSelectMemberForFlowers(member)}
                    className="p-3.5 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 cursor-pointer transition flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${
                          member.avatarColor || 'from-indigo-500 to-purple-600'
                        } flex items-center justify-center text-white font-bold text-sm shadow-xs`}
                      >
                        {(member.guildName || member.name || 'G').charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                            {member.guildName || member.name}
                          </span>
                          {member.lineName && (
                            <span className="text-[10px] px-1.5 py-0.2 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded font-medium">
                              LINE: {member.lineName}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                            ม่วง {purple}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                            ส้ม {orange}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                            แดง {red}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                        {member.flowerIds.length} ดอก
                      </span>
                      <p className="text-[10px] text-zinc-400">ครอบครอง</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

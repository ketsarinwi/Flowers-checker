import React, { useState, useMemo } from 'react';
import { Search, X, Users, Flower2, ArrowRight } from 'lucide-react';
import { Flower, Member } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  flowers: Flower[];
  members: Member[];
  onClose: () => void;
  onSelectMember: (member: Member) => void;
  onSelectFlower: (flower: Flower) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  flowers,
  members,
  onClose,
  onSelectMember,
  onSelectFlower,
}) => {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return { matchedMembers: [], matchedFlowers: [] };
    const q = query.toLowerCase().trim();

    const matchedMembers = members.filter(
      (m) =>
        (m.guildName && m.guildName.toLowerCase().includes(q)) ||
        (m.lineName && m.lineName.toLowerCase().includes(q)) ||
        (m.name && m.name.toLowerCase().includes(q))
    ).slice(0, 8);

    const matchedFlowers = flowers.filter((f) =>
      f.name.toLowerCase().includes(q) || f.tier.includes(q)
    ).slice(0, 12);

    return { matchedMembers, matchedFlowers };
  }, [query, flowers, members]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-indigo-500 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาชื่อในกิลด์, ชื่อในไลน์, หรือ ชื่อดอกไม้..."
            className="w-full text-sm bg-transparent border-none focus:outline-hidden text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-zinc-400 hover:text-zinc-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg hover:bg-zinc-200"
          >
            ESC
          </button>
        </div>

        {/* Search Results */}
        <div className="overflow-y-auto p-4 space-y-5">
          {!query.trim() ? (
            <div className="py-12 text-center text-zinc-400 text-xs">
              พิมพ์ชื่อในกิลด์ ชื่อในไลน์ หรือชื่อดอกไม้เพื่อค้นหาทันที
            </div>
          ) : results.matchedMembers.length === 0 && results.matchedFlowers.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-xs">
              ไม่พบผลการค้นหาสำหรับ "{query}"
            </div>
          ) : (
            <>
              {/* Member Matches */}
              {results.matchedMembers.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-500" />
                    สมาชิก ({results.matchedMembers.length})
                  </h4>
                  <div className="space-y-1.5">
                    {results.matchedMembers.map((member) => (
                      <div
                        key={member.id}
                        onClick={() => {
                          onSelectMember(member);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${
                              member.avatarColor || 'from-indigo-500 to-purple-600'
                            } flex items-center justify-center text-white text-xs font-bold`}
                          >
                            {(member.guildName || member.name || 'G').charAt(0)}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                              {member.guildName || member.name}
                            </span>
                            {member.lineName && (
                              <span className="ml-1.5 text-[10px] px-1.5 py-0.2 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded border border-emerald-200">
                                LINE: {member.lineName}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-indigo-600 font-semibold">
                          <span>{member.flowerIds.length} ดอก</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Flower Matches */}
              {results.matchedFlowers.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Flower2 className="w-3.5 h-3.5 text-purple-500" />
                    ดอกไม้ ({results.matchedFlowers.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {results.matchedFlowers.map((flower) => {
                      const tierBadge =
                        flower.tier === 'ม่วง'
                          ? 'bg-purple-100 text-purple-700'
                          : flower.tier === 'ส้ม'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-rose-100 text-rose-700';

                      return (
                        <div
                          key={flower.id}
                          onClick={() => {
                            onSelectFlower(flower);
                            onClose();
                          }}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${tierBadge}`}>
                              {flower.tier}
                            </span>
                            <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
                              {flower.name}
                            </span>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

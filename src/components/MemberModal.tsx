import React, { useState, useEffect } from 'react';
import { X, UserPlus, UserCheck, MessageCircle, Shield } from 'lucide-react';
import { Member } from '../types';

interface MemberModalProps {
  isOpen: boolean;
  member: Member | null; // null if adding new
  onClose: () => void;
  onSave: (data: { guildName: string; lineName: string; avatarColor?: string }) => void;
}

const AVATAR_COLORS = [
  { label: 'ชมพู-แดง', value: 'from-pink-500 to-rose-500' },
  { label: 'ฟ้า-คราม', value: 'from-blue-500 to-indigo-600' },
  { label: 'เขียวมรกต', value: 'from-emerald-500 to-teal-600' },
  { label: 'ส้มสดใส', value: 'from-amber-500 to-orange-500' },
  { label: 'ม่วงลาเวนเดอร์', value: 'from-purple-500 to-violet-600' },
  { label: 'ฟ้าทะเล', value: 'from-cyan-500 to-blue-500' },
];

export const MemberModal: React.FC<MemberModalProps> = ({
  isOpen,
  member,
  onClose,
  onSave,
}) => {
  const [guildName, setGuildName] = useState('');
  const [lineName, setLineName] = useState('');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0].value);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (member) {
      setGuildName(member.guildName || member.name || '');
      setLineName(member.lineName || '');
      setAvatarColor(member.avatarColor || AVATAR_COLORS[0].value);
    } else {
      setGuildName('');
      setLineName('');
      setAvatarColor(AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)].value);
    }
    setError(null);
  }, [member, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guildName.trim()) {
      setError('กรุณาระบุชื่อในกิลด์');
      return;
    }
    if (!lineName.trim()) {
      setError('กรุณาระบุชื่อในไลน์');
      return;
    }
    onSave({
      guildName: guildName.trim(),
      lineName: lineName.trim(),
      avatarColor,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              {member ? <UserCheck className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {member ? 'แก้ไขข้อมูลสมาชิก' : 'เพิ่มสมาชิกใหม่'}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                ระบุชื่อในกิลด์และชื่อในไลน์ของสมาชิก
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1.5 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-500" />
                ชื่อในกิลด์ <span className="text-rose-500">*</span>
              </span>
            </label>
            <input
              type="text"
              required
              value={guildName}
              onChange={(e) => {
                setGuildName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="เช่น มังกรหยก, ดาบพิฆาตฟ้า"
              className="w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              <span className="flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                ชื่อในไลน์ <span className="text-rose-500">*</span>
              </span>
            </label>
            <input
              type="text"
              required
              value={lineName}
              onChange={(e) => {
                setLineName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="เช่น Ketsarin_W, พี่เบิร์ด"
              className="w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
            />
          </div>

          {error && <p className="text-xs text-rose-500">{error}</p>}

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              สีประจำตัว (Avatar Theme)
            </label>
            <div className="flex items-center gap-2">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setAvatarColor(c.value)}
                  className={`w-8 h-8 rounded-full bg-gradient-to-tr ${c.value} transition ${
                    avatarColor === c.value
                      ? 'ring-4 ring-indigo-500/30 scale-110 shadow-sm'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-md shadow-indigo-600/20 transition"
            >
              {member ? 'บันทึกการแก้ไข' : 'บันทึกสมาชิก'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

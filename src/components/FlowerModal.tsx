import React, { useState, useEffect } from 'react';
import { X, Flower2, Edit3, PlusCircle } from 'lucide-react';
import { Flower, FlowerTier } from '../types';

interface FlowerModalProps {
  isOpen: boolean;
  flower: Flower | null; // null if adding new
  onClose: () => void;
  onSave: (data: { name: string; tier: FlowerTier; notes?: string }) => void;
}

export const FlowerModal: React.FC<FlowerModalProps> = ({
  isOpen,
  flower,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [tier, setTier] = useState<FlowerTier>('ม่วง');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (flower) {
      setName(flower.name);
      setTier(flower.tier);
      setNotes(flower.notes || '');
    } else {
      setName('');
      setTier('ม่วง');
      setNotes('');
    }
    setError(null);
  }, [flower, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('กรุณาระบุชื่อดอกไม้');
      return;
    }
    onSave({
      name: name.trim(),
      tier,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2.5 rounded-xl ${
                tier === 'ม่วง'
                  ? 'bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-300'
                  : tier === 'ส้ม'
                  ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300'
                  : 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300'
              }`}
            >
              {flower ? <Edit3 className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {flower ? 'แก้ไขชื่อ/ข้อมูลดอกไม้' : 'เพิ่มดอกไม้ใหม่'}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {flower ? 'แก้ไขชื่อหรือปรับเปลี่ยนระดับสีพื้น' : 'ระบุชื่อดอกไม้และเลือกระดับสีพื้น'}
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
              ชื่อดอกไม้ <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="เช่น เดลฟิเนียมสีม่วง, กาแลกซีทอประกาย"
              className="w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
            />
            {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              ระดับสีพื้น (Tier) <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTier('ม่วง')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 transition ${
                  tier === 'ม่วง'
                    ? 'border-purple-600 bg-purple-600 text-white shadow-xs'
                    : 'border-zinc-200 dark:border-zinc-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
                พื้นสีม่วง
              </button>

              <button
                type="button"
                onClick={() => setTier('ส้ม')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 transition ${
                  tier === 'ส้ม'
                    ? 'border-amber-600 bg-amber-600 text-white shadow-xs'
                    : 'border-zinc-200 dark:border-zinc-700 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                พื้นสีส้ม
              </button>

              <button
                type="button"
                onClick={() => setTier('แดง')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 transition ${
                  tier === 'แดง'
                    ? 'border-rose-600 bg-rose-600 text-white shadow-xs'
                    : 'border-zinc-200 dark:border-zinc-700 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                พื้นสีแดง
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              หมายเหตุ (ถ้ามี)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="เช่น พันธุ์พิเศษฤดูหนาว / ดอกหายาก"
              className="w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 resize-none"
            />
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
              {flower ? 'บันทึกการแก้ไขชื่อ' : 'เพิ่มดอกไม้'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

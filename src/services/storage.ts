import { Flower, Member } from '../types';
import { getInitialFlowers } from '../data/initialFlowers';

const STORAGE_KEYS = {
  FLOWERS: 'flower_tracker_flowers_v1',
  MEMBERS: 'flower_tracker_members_v1',
  LAST_SYNC: 'flower_tracker_last_sync_v1',
};

const SYNC_CHANNEL_NAME = 'flower_tracker_sync_channel';

// Sample members to initialize demo experience
const INITIAL_SAMPLE_MEMBERS: { guildName: string; lineName: string; avatarColor?: string; flowerIds: string[] }[] = [
  {
    guildName: 'มังกรหยก',
    lineName: 'Ketsarin',
    avatarColor: 'from-pink-500 to-rose-500',
    flowerIds: ['flw-1', 'flw-2', 'flw-3', 'flw-132', 'flw-133', 'flw-175'],
  },
  {
    guildName: 'ดาบพิฆาตฟ้า',
    lineName: 'Theerapong_P',
    avatarColor: 'from-blue-500 to-indigo-500',
    flowerIds: ['flw-2', 'flw-3', 'flw-4', 'flw-5', 'flw-20', 'flw-135'],
  },
  {
    guildName: 'เซียนบุปผา',
    lineName: 'Nan_Rose',
    avatarColor: 'from-emerald-500 to-teal-500',
    flowerIds: ['flw-132', 'flw-134', 'flw-136', 'flw-175', 'flw-176', 'flw-177'],
  },
  {
    guildName: 'เมฆาลอย',
    lineName: 'Chidchanok_99',
    avatarColor: 'from-amber-500 to-orange-500',
    flowerIds: ['flw-1', 'flw-4', 'flw-10', 'flw-133', 'flw-178'],
  },
  {
    guildName: 'แสงสุริยัน',
    lineName: 'Panuwat_S',
    avatarColor: 'from-purple-500 to-violet-600',
    flowerIds: ['flw-5', 'flw-6', 'flw-140'],
  },
];

let syncChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    syncChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
  } catch (err) {
    console.warn('BroadcastChannel not supported in this environment', err);
  }
}

function notifySync() {
  const now = Date.now();
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, now.toString());
    syncChannel?.postMessage({ type: 'DATA_UPDATED', timestamp: now });
  } catch (err) {
    console.warn('Failed to notify sync', err);
  }
}

export function getFlowers(): Flower[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FLOWERS);
    if (!raw) {
      const initial = getInitialFlowers();
      localStorage.setItem(STORAGE_KEYS.FLOWERS, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading flowers from storage:', err);
    return getInitialFlowers();
  }
}

export function saveFlowers(flowers: Flower[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FLOWERS, JSON.stringify(flowers));
    notifySync();
  } catch (err) {
    console.error('Error saving flowers to storage:', err);
  }
}

export function getMembers(): Member[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    if (!raw) {
      const now = Date.now();
      const initial: Member[] = INITIAL_SAMPLE_MEMBERS.map((m, idx) => ({
        id: `mem-${idx + 1}`,
        guildName: m.guildName,
        lineName: m.lineName,
        avatarColor: m.avatarColor,
        flowerIds: m.flowerIds,
        createdAt: now - (5 - idx) * 86400000,
        updatedAt: now - (5 - idx) * 86400000,
      }));
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((m: any) => ({
        ...m,
        guildName: m.guildName || m.name || 'ไม่ระบุชื่อ',
        lineName: m.lineName || '',
      }));
    }
    return [];
  } catch (err) {
    console.error('Error reading members from storage:', err);
    return [];
  }
}

export function saveMembers(members: Member[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    notifySync();
  } catch (err) {
    console.error('Error saving members to storage:', err);
  }
}

export function addMember(data: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>): Member {
  const members = getMembers();
  const now = Date.now();
  const newMember: Member = {
    ...data,
    id: `mem-${now}-${Math.floor(Math.random() * 1000)}`,
    createdAt: now,
    updatedAt: now,
  };
  members.unshift(newMember);
  saveMembers(members);
  return newMember;
}

export function updateMember(id: string, updates: Partial<Omit<Member, 'id' | 'createdAt'>>): Member | null {
  const members = getMembers();
  const index = members.findIndex((m) => m.id === id);
  if (index === -1) return null;

  const updated: Member = {
    ...members[index],
    ...updates,
    updatedAt: Date.now(),
  };
  members[index] = updated;
  saveMembers(members);
  return updated;
}

export function deleteMember(id: string): boolean {
  const members = getMembers();
  const filtered = members.filter((m) => m.id !== id);
  if (filtered.length === members.length) return false;
  saveMembers(filtered);
  return true;
}

export function addFlower(data: { name: string; tier: Flower['tier']; imageUrl?: string; notes?: string }): Flower {
  const flowers = getFlowers();
  const now = Date.now();
  const newFlower: Flower = {
    id: `flw-${now}-${Math.floor(Math.random() * 1000)}`,
    name: data.name.trim(),
    tier: data.tier,
    imageUrl: data.imageUrl,
    notes: data.notes,
    createdAt: now,
    updatedAt: now,
  };
  flowers.unshift(newFlower);
  saveFlowers(flowers);
  return newFlower;
}

export function updateFlower(
  id: string,
  updates: Partial<Omit<Flower, 'id' | 'createdAt'>>
): Flower | null {
  const flowers = getFlowers();
  const index = flowers.findIndex((f) => f.id === id);
  if (index === -1) return null;

  const updated: Flower = {
    ...flowers[index],
    ...updates,
    updatedAt: Date.now(),
  };
  flowers[index] = updated;
  saveFlowers(flowers);
  return updated;
}

export function deleteFlower(id: string): boolean {
  const flowers = getFlowers();
  const filteredFlowers = flowers.filter((f) => f.id !== id);
  if (filteredFlowers.length === flowers.length) return false;
  saveFlowers(filteredFlowers);

  // Also remove this flower ID from all members who own it
  const members = getMembers();
  let membersChanged = false;
  const updatedMembers = members.map((m) => {
    if (m.flowerIds.includes(id)) {
      membersChanged = true;
      return {
        ...m,
        flowerIds: m.flowerIds.filter((fid) => fid !== id),
        updatedAt: Date.now(),
      };
    }
    return m;
  });

  if (membersChanged) {
    saveMembers(updatedMembers);
  }
  return true;
}

export function assignFlowersToMember(memberId: string, flowerIds: string[]): Member | null {
  return updateMember(memberId, { flowerIds });
}

export function toggleMemberFlower(memberId: string, flowerId: string): Member | null {
  const members = getMembers();
  const member = members.find((m) => m.id === memberId);
  if (!member) return null;

  const exists = member.flowerIds.includes(flowerId);
  const newFlowerIds = exists
    ? member.flowerIds.filter((id) => id !== flowerId)
    : [...member.flowerIds, flowerId];

  return updateMember(memberId, { flowerIds: newFlowerIds });
}

export function subscribeToSync(callback: () => void): () => void {
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEYS.FLOWERS || e.key === STORAGE_KEYS.MEMBERS || e.key === STORAGE_KEYS.LAST_SYNC) {
      callback();
    }
  };

  const handleBroadcast = (event: MessageEvent) => {
    if (event.data?.type === 'DATA_UPDATED') {
      callback();
    }
  };

  window.addEventListener('storage', handleStorage);
  syncChannel?.addEventListener('message', handleBroadcast);

  return () => {
    window.removeEventListener('storage', handleStorage);
    syncChannel?.removeEventListener('message', handleBroadcast);
  };
}

export function resetAllDataToDefault(): void {
  localStorage.removeItem(STORAGE_KEYS.FLOWERS);
  localStorage.removeItem(STORAGE_KEYS.MEMBERS);
  notifySync();
}

export function exportBackupJSON(): string {
  const data = {
    exportedAt: new Date().toISOString(),
    flowers: getFlowers(),
    members: getMembers(),
  };
  return JSON.stringify(data, null, 2);
}

export function importBackupJSON(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (Array.isArray(parsed.flowers) && Array.isArray(parsed.members)) {
      saveFlowers(parsed.flowers);
      saveMembers(parsed.members);
      return true;
    }
    return false;
  } catch (err) {
    console.error('Failed to import backup JSON', err);
    return false;
  }
}

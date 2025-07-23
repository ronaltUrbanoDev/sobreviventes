
export interface Character {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  magicAttack: number;
  magicDefense: number;
  precision: number;
  attackType: 'physical' | 'magical';
  avatar: string;
  xp: number;
  xpToNextLevel: number;
  level: number;
  gold: number;
  critChance: number;
  critMultiplier: number;
  absorptionChance: number;
  absorptionReduction: number;
  lives?: number;
  equipment: { [key in EquipmentSlot]?: EquipmentItem };
  inventory: EquipmentItem[];
  consumables: Record<string, { item: Consumable; quantity: number }>;
  baseMagicAttack: number; // To check if character can use magic
  vitality: number;
  luck: number;
  characterType?: 'normal' | 'elite' | 'boss';
}

export type GameMode = 'survival' | 'story' | 'mastery';
export type GameState = 'splash' | 'modeSelection' | 'home' | 'difficultySelection' | 'ready' | 'battling' | 'over' | 'levelUp' | 'settings' | 'storyMap' | 'treasure' | 'shop' | 'luck' | 'victory' | 'masteryTree';

export type StatKey = 'attack' | 'defense' | 'speed' | 'maxHp' | 'magicAttack' | 'magicDefense' | 'critChance' | 'absorptionChance' | 'precision' | 'vitality' | 'luck' | 'critMultiplier' | 'absorptionReduction';

export type PlayerStatKey = Exclude<StatKey, 'maxHp' | 'critChance' | 'absorptionChance' | 'critMultiplier' | 'absorptionReduction'>;

export type DeterminationStatKey = PlayerStatKey | 'critChance';

export type Rarity = 'Comum' | 'Raro' | 'Épico' | 'Lendário' | 'Único';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'impossible';

export type EquipmentSlot = 'weapon' | 'shield' | 'helmet' | 'armor' | 'boots' | 'necklace';

export interface EquipmentItem {
  id: string;
  name: string;
  description: string;
  slot: EquipmentSlot;
  stats: Partial<Record<StatKey, number>>;
  icon: string;
  cost: number;
  rarity: Rarity;
  isNew?: boolean;
  isEquipped?: boolean;
  uniqueOwner?: string; // e.g., 'Dragon' boss
}

export interface Consumable {
  id: string;
  name: string;
  description: string;
  icon: string;
  effect: {
    type: 'HEAL_HP';
    amount: number;
  };
}

// --- Story Mode Types ---
export type MapNodeType = 'BATTLE' | 'ELITE_BATTLE' | 'TREASURE' | 'REST' | 'BOSS' | 'SHOP' | 'LUCK' | 'EXIT';

export interface MapNode {
  id: string;
  type: MapNodeType;
  isCompleted: boolean;
  x: number;
  y: number;
  level: number;
  connections: string[]; // IDs of nodes this one connects to
  // Optional data based on type
  enemyName?: string; 
  reward?: { gold?: number; item?: EquipmentItem; points?: number; consumable?: Consumable };
  rest?: { hpPercentage: number };
}

// --- Mastery System Types ---
export interface MasteryTalent {
  id: string;
  name: string;
  description: string;
  maxLevel: number;
  cost: (level: number) => number;
  effect: (level: number) => Partial<Record<StatKey, number>>;
}

export interface MasteryData {
  [characterId: string]: {
    totalPoints: number;
    spentPoints: number;
    talents: { [talentId: string]: number }; // talentId: level
  };
}

// --- Thematic Floor Types ---
export interface FloorTheme {
  name: string;
  backgroundUrl: string;
  enemies: { name: string; avatar: string; }[];
  eliteEnemies: { name: string; avatar: string; }[];
  boss: { name: string; avatar: string; attackType: 'physical' | 'magical'; };
  uniqueItem: Omit<EquipmentItem, 'id' | 'cost' | 'stats' | 'description'>;
}
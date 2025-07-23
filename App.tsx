
import React, { useState, useEffect, useRef, useCallback, useMemo, useLayoutEffect } from 'react';
import { Character, GameState, StatKey, Difficulty, GameMode, MapNode, MapNodeType, EquipmentItem, EquipmentSlot, Consumable, PlayerStatKey, DeterminationStatKey, Rarity, MasteryData } from './types';
import { calculateXpToNextLevel, STRINGS, DIFFICULTY_MODS, generateStoryMap, generateEquipmentItems, RARITY_BORDER_COLORS, RARITY_COLORS, CONSUMABLE_ITEMS, FLOOR_THEMES, getEnemyData, EnemyName, ENEMY_LEVEL_SCALING_CONFIG } from './constants';
import CharacterCard from './components/CharacterCard';
import BattleLog from './components/BattleLog';
import GameControls from './components/GameControls';
import CharacterSelection from './components/CharacterSelection';
import LevelUp from './components/LevelUp';
import SplashScreen from './components/SplashScreen';
import PlayerHUD from './components/PlayerHUD';
import ShopModal from './components/ShopModal';
import MechanicsModal from './components/MechanicsModal';
import EquipmentModal from './components/EquipmentModal';

const initialStats = { xp: 0, gold: 0, equipment: {}, consumables: {}, inventory: [] };

const baseBonusStats = { critMultiplier: 0.5, absorptionReduction: 0.1, critChance: 0, absorptionChance: 0 };

const WIZARD_HERO: Character = { id: 'wizard', name: 'Mago', level: 1, hp: 0, maxHp: 0, vitality: 13, luck: 5, attack: 5, defense: 11, speed: 13, magicAttack: 21, magicDefense: 15, precision: 10, baseMagicAttack: 21, attackType: 'magical', avatar: '🧙', ...initialStats, xpToNextLevel: calculateXpToNextLevel(1), ...baseBonusStats };
const KNIGHT_HERO: Character = { id: 'knight', name: 'Cavaleiro', level: 1, hp: 0, maxHp: 0, vitality: 17, luck: 2, attack: 15, defense: 17, speed: 10, magicAttack: 0, magicDefense: 8, precision: 10, baseMagicAttack: 0, attackType: 'physical', avatar: '🤺', ...initialStats, xpToNextLevel: calculateXpToNextLevel(1), ...baseBonusStats };
const ARCHER_HERO: Character = { id: 'archer', name: 'Arqueira', level: 1, hp: 0, maxHp: 0, vitality: 14, luck: 7, attack: 19, defense: 8, speed: 18, magicAttack: 0, magicDefense: 6, precision: 20, baseMagicAttack: 0, attackType: 'physical', avatar: '🏹', ...initialStats, xpToNextLevel: calculateXpToNextLevel(1), ...baseBonusStats };
const DRUID_HERO: Character = { id: 'druid', name: 'Druida', level: 1, hp: 0, maxHp: 0, vitality: 16, luck: 5, attack: 10, defense: 15, speed: 13, magicAttack: 15, magicDefense: 15, precision: 10, baseMagicAttack: 15, attackType: 'magical', avatar: '🐾', ...initialStats, xpToNextLevel: calculateXpToNextLevel(1), ...baseBonusStats };

const HERO_OPTIONS = [WIZARD_HERO, KNIGHT_HERO, ARCHER_HERO, DRUID_HERO];

const calculateEffectiveStats = (baseCharacter: Character | null): Character => {
    if (!baseCharacter) throw new Error("Cannot calculate stats for null character");

    const effectiveStats: Character = JSON.parse(JSON.stringify(baseCharacter));

    // Reset derived stats to base values to ensure a clean calculation
    effectiveStats.critChance = baseBonusStats.critChance;
    effectiveStats.critMultiplier = baseBonusStats.critMultiplier;
    effectiveStats.absorptionChance = baseBonusStats.absorptionChance;
    effectiveStats.absorptionReduction = baseBonusStats.absorptionReduction;

    // Apply equipment bonuses
    for (const slot in baseCharacter.equipment) {
        const item = baseCharacter.equipment[slot as EquipmentSlot];
        if (item) {
            for (const stat in item.stats) {
                const key = stat as StatKey;
                (effectiveStats[key] as number) = (effectiveStats[key] || 0) + item.stats[key]!;
            }
        }
    }

    // Apply synergy calculations
    const totalAttack = effectiveStats.attack + effectiveStats.magicAttack;
    const totalDefense = effectiveStats.defense + effectiveStats.magicDefense;

    effectiveStats.critChance += (totalAttack * 0.0011) + (effectiveStats.luck * 0.004);
    effectiveStats.critMultiplier += (totalAttack * 0.003);

    effectiveStats.absorptionChance += (totalDefense * 0.0005) + (effectiveStats.luck * 0.004);
    effectiveStats.absorptionReduction += (totalDefense * 0.0015);

    // Apply flat level bonuses
    const levelBonusMultiplier = baseCharacter.level > 1 ? baseCharacter.level - 1 : 0;
    if (levelBonusMultiplier > 0) {
        effectiveStats.critChance += levelBonusMultiplier * 0.0017;
        effectiveStats.absorptionChance += levelBonusMultiplier * 0.0017;
        effectiveStats.precision += levelBonusMultiplier * 0.17;
        effectiveStats.critMultiplier += levelBonusMultiplier * 0.0083;
        effectiveStats.absorptionReduction += levelBonusMultiplier * 0.0083;
    }

    // Update maxHp based on final vitality
    effectiveStats.maxHp = effectiveStats.vitality * 9;

    return effectiveStats;
}

const acquireItem = (playerState: Character, item: EquipmentItem): Character => {
    let newPlayerData = JSON.parse(JSON.stringify(playerState)); // Deep copy
    const newItem = { ...item, isNew: true };

    // Auto-equip logic if slot is empty
    if (!newPlayerData.equipment[item.slot]) {
        const oldEffectiveStats = calculateEffectiveStats(newPlayerData);
        // Preserve HP percentage. If HP is 0 (start of game), default to 100% to set to new max HP.
        const oldHpPercentage = oldEffectiveStats.hp > 0 ? (newPlayerData.hp / oldEffectiveStats.maxHp) : 1;

        newPlayerData.equipment = { ...newPlayerData.equipment, [item.slot]: { ...newItem, isNew: false } };

        const newEffectiveStats = calculateEffectiveStats(newPlayerData);
        newPlayerData.hp = Math.round(newEffectiveStats.maxHp * oldHpPercentage);
    } else {
        newPlayerData.inventory = [...(newPlayerData.inventory || []), newItem];
    }
    return newPlayerData;
};


const createEnemy = (level: number, difficulty: Difficulty, gameMode: GameMode, type: 'normal' | 'elite' | 'boss' = 'normal', isBossBuffed: boolean, enemyName?: EnemyName): Character => {
    const enemyTypeData = enemyName ? getEnemyData(enemyName) : getEnemyData('Esqueleto');

    let diffMod = DIFFICULTY_MODS[difficulty].multiplier;

    if (gameMode === 'story' && type === 'normal') {
        diffMod *= 0.85;
    }

    const baseLevelMultiplier = 1 + (level - 1) * 0.1;
    const hpMultiplier = type === 'elite' ? 1.36 : type === 'boss' ? 2.55 : 1.0;
    const damageMultiplier = type === 'elite' ? 1.0625 : type === 'boss' ? 1.275 : 1.0;
    const defenseMultiplier = type === 'elite' ? 1.02 : type === 'boss' ? 1.19 : 1.0;

    const baseHp = (15 + (enemyTypeData.vitality || 10) * 2 + level * 5) * baseLevelMultiplier;
    let hp = baseHp * diffMod * hpMultiplier;

    let attack = (enemyTypeData.attack * 0.8 + level * 1.5) * baseLevelMultiplier * diffMod * damageMultiplier;
    let magicAttack = (enemyTypeData.magicAttack * 0.8 + level * 1.5) * baseLevelMultiplier * diffMod * damageMultiplier;
    let defense = (enemyTypeData.defense * 0.8 + level * 1.2) * baseLevelMultiplier * diffMod * defenseMultiplier;
    let magicDefense = (enemyTypeData.magicDefense * 0.8 + level * 1.2) * baseLevelMultiplier * diffMod * defenseMultiplier;
    let speed = (enemyTypeData.speed + level * 0.5) * diffMod;
    let precision = (10 + level * 0.8) * diffMod;
    let luck = (5 + level * 0.5) * diffMod;

    // Apply boss buff from Luck node
    if (type === 'boss' && isBossBuffed) {
        hp = Math.floor(hp * 1.3); // 30% HP buff
    }

    const finalHp = Math.floor(hp);

    const enemyBase: Character = {
        id: `enemy-${Date.now()}`, name: enemyName || 'Esqueleto',
        hp: finalHp, maxHp: finalHp, vitality: Math.floor(finalHp / 9), luck,
        attack: Math.floor(attack), defense: Math.floor(defense), speed: Math.floor(speed),
        magicAttack: Math.floor(magicAttack), magicDefense: Math.floor(magicDefense),
        avatar: enemyTypeData.avatar,
        attackType: enemyTypeData.attackType,
        equipment: {}, consumables: {}, inventory: [], xp: 0, xpToNextLevel: 0, gold: 0, level: level, ...baseBonusStats,
        critChance: (0.05 + level * 0.005),
        absorptionChance: (0.03 + level * 0.003),
        precision: Math.floor(precision),
        baseMagicAttack: Math.floor(magicAttack),
        characterType: type,
    };
    return calculateEffectiveStats(enemyBase);
};

const App: React.FC = () => {
    const [language, setLanguage] = useState<'pt' | 'en'>('pt');
    const [gameState, setGameState] = useState<GameState>('splash');
    const [gameMode, setGameMode] = useState<GameMode>('survival');
    const [playerData, setPlayerData] = useState<Character | null>(null);
    const [enemy, setEnemy] = useState<Character | null>(null);
    const [log, setLog] = useState<string[]>([]);
    const [winner, setWinner] = useState<string | null>(null);
    const [attackingCharacterId, setAttackingCharacterId] = useState<string | null>(null);
    const [attributePoints, setAttributePoints] = useState(0);
    const [basePlayerStats, setBasePlayerStats] = useState<Character | null>(null);
    const [level, setLevel] = useState(1);
    const [autoDistributeEnabled, setAutoDistributeEnabled] = useState(false);
    const [autoSpendGoldEnabled, setAutoSpendGoldEnabled] = useState(false);
    const [gameSpeed, setGameSpeed] = useState(1);
    const [difficulty, setDifficulty] = useState<Difficulty>('medium');
    const [lastBattleGains, setLastBattleGains] = useState({ xp: 0, gold: 0 });
    const [isRetrying, setIsRetrying] = useState(false);
    const [determination, setDetermination] = useState<{ stat: DeterminationStatKey, boost: number } | null>(null);
    const [determinationTriggered, setDeterminationTriggered] = useState(false);

    // Story Mode State
    const [storyMap, setStoryMap] = useState<MapNode[]>([]);
    const [floor, setFloor] = useState(1);
    const [floorDangerLevel, setFloorDangerLevel] = useState(1);
    const [nodesTraversed, setNodesTraversed] = useState(0);
    const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
    const [completedNodeIds, setCompletedNodeIds] = useState<string[]>([]);
    const [treasureReward, setTreasureReward] = useState<MapNode['reward'] | null>(null);
    const [shopItems, setShopItems] = useState<EquipmentItem[]>([]);
    const [isEquipmentOpen, setIsEquipmentOpen] = useState(false);
    const [isGoHomeConfirmOpen, setIsGoHomeConfirmOpen] = useState(false);
    const [isConsumableConfirmOpen, setIsConsumableConfirmOpen] = useState<Consumable | null>(null);
    const [luckEventResult, setLuckEventResult] = useState<{ type: string, details?: any } | null>(null);
    const [isMechanicsModalOpen, setIsMechanicsModalOpen] = useState(false);
    const [isBossBuffed, setIsBossBuffed] = useState(false);
    const [isPreBattleConsumablePanelOpen, setIsPreBattleConsumablePanelOpen] = useState(false);
    const [isNextFloorConfirmOpen, setIsNextFloorConfirmOpen] = useState(false);

    // Mastery Mode State
    const [masteryData, setMasteryData] = useState<MasteryData>({});

    const player = useMemo(() => playerData ? calculateEffectiveStats(playerData) : null, [playerData]);


    const t = useCallback((key: keyof typeof STRINGS.pt, params: Record<string, string | number> = {}) => {
        let str = (STRINGS as any)[language]?.[key] || STRINGS.pt[key] || key;
        for (const p in params) { str = str.replace(`{${p}}`, String(params[p])); }
        return str;
    }, [language]);

    const playerRef = useRef(player); useEffect(() => { playerRef.current = player; }, [player]);
    const playerDataRef = useRef(playerData); useEffect(() => { playerDataRef.current = playerData; }, [playerData]);
    const enemyRef = useRef(enemy); useEffect(() => { enemyRef.current = enemy; }, [enemy]);
    const levelRef = useRef(level); useEffect(() => { levelRef.current = level; }, [level]);
    const determinationRef = useRef(determination); useEffect(() => { determinationRef.current = determination; }, [determination]);
    const winnerRef = useRef(winner); useEffect(() => { winnerRef.current = winner; }, [winner]);
    const gameModeRef = useRef(gameMode); useEffect(() => { gameModeRef.current = gameMode; }, [gameMode]);
    const nodesTraversedRef = useRef(nodesTraversed); useEffect(() => { nodesTraversedRef.current = nodesTraversed; }, [nodesTraversed]);
    const gameStateRef = useRef(gameState); useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
    const floorRef = useRef(floor); useEffect(() => { floorRef.current = floor; }, [floor]);

    // Load Mastery Data on init
    useEffect(() => {
        try {
            const savedMastery = localStorage.getItem('dungeonSurvivorMastery');
            if (savedMastery) {
                setMasteryData(JSON.parse(savedMastery));
            }
        } catch (error) {
            console.error("Failed to load mastery data:", error);
        }
    }, []);

    // Save Mastery Data on change
    useEffect(() => {
        try {
            localStorage.setItem('dungeonSurvivorMastery', JSON.stringify(masteryData));
        } catch (error) {
            console.error("Failed to save mastery data:", error);
        }
    }, [masteryData]);

    const handleModeSelect = (mode: GameMode) => {
        if (mode === 'mastery') {
            setGameState('masteryTree');
        } else {
            setGameMode(mode);
            setGameState('home');
        }
    };

    const handleCharacterSelect = (character: Character) => {
        const initialPlayerState: Character = { ...character, ...initialStats, xpToNextLevel: calculateXpToNextLevel(1) };
        const effectiveInitialState = calculateEffectiveStats(initialPlayerState);
        const newPlayer: Character = { ...initialPlayerState, hp: effectiveInitialState.maxHp };

        if (gameMode === 'survival') newPlayer.lives = 2;
        setLevel(1);
        setPlayerData(newPlayer);
        setLog([]);
        setWinner(null);
        setGameState('difficultySelection');
    };

    const handleDifficultySelect = (selectedDifficulty: Difficulty) => {
        setDifficulty(selectedDifficulty);

        setPlayerData(p => {
            if (!p) return null;
            let newPlayerData = { ...p };

            if (selectedDifficulty === 'easy') {
                newPlayerData.gold += 100;
                const [item] = generateEquipmentItems(1, 1, { forceRarity: 'Comum', playerAttackType: newPlayerData.attackType });
                if (item) {
                    newPlayerData = acquireItem(newPlayerData, item);
                }
            } else if (selectedDifficulty === 'medium') {
                newPlayerData.gold += 100;
            }

            const newEffectiveStats = calculateEffectiveStats(newPlayerData);
            newPlayerData.hp = newEffectiveStats.maxHp;

            return newPlayerData;
        });

        if (gameMode === 'survival') {
            const enemyLevel = 1;
            setEnemy(createEnemy(enemyLevel, selectedDifficulty, gameMode, 'normal', false, 'Aranha Gigante'));
            setGameState('ready');
        } else { // Story Mode
            setFloor(1);
            setIsBossBuffed(false);
            setFloorDangerLevel(1);
            const map = generateStoryMap(difficulty, 1);
            setStoryMap(map);
            setNodesTraversed(0);
            const startNode = map.find(n => n.y === 50 && n.x < 10);
            if (startNode) {
                setCurrentNodeId(startNode.id);
                setCompletedNodeIds([startNode.id]);
                // Immediately apply rest effect from start node
                setPlayerData(p => p ? { ...p, hp: calculateEffectiveStats(p).maxHp } : null);
            }
            setGameState('storyMap');
        }
    };

    const handleGoHome = useCallback(() => {
        setPlayerData(null); setWinner(null); setLog([]); setDetermination(null);
        setDeterminationTriggered(false); setStoryMap([]); setNodesTraversed(0);
        setFloor(1); setIsBossBuffed(false);
        setGameState('splash');
    }, []);

    const requestGoHome = () => {
        if (gameStateRef.current === 'over' || (gameModeRef.current !== 'story' && gameModeRef.current !== 'mastery') || isGoHomeConfirmOpen) {
            handleGoHome();
        } else {
            setIsGoHomeConfirmOpen(true);
        }
    };

    const handleStart = () => {
        const p = playerRef.current;
        const e = enemyRef.current;
        if (!p || !e) return;

        setIsPreBattleConsumablePanelOpen(false);
        setLog([t('battleStart', { level: gameMode === 'survival' ? level : (e.level), pName: p.name, eName: e.name })]);
        setDetermination(null); setDeterminationTriggered(false);
        setGameState('battling');
    };

    const setupNextSurvivalBattle = useCallback(() => {
        if (!playerData) return;
        const nextLevel = level + 1;
        setLevel(nextLevel);
        const enemyLevel = Math.max(1, nextLevel - Math.floor(Math.random() * 2)); // Enemy level can be a bit lower
        const newEnemy = createEnemy(enemyLevel, difficulty, gameMode, 'normal', false, 'Esqueleto');
        setEnemy(newEnemy);
        setLog([t('newEnemyAppears', { eName: newEnemy.name, nextLevel: newEnemy.level })]);
        setWinner(null); setBasePlayerStats(null); setDetermination(null); setDeterminationTriggered(false);
        setPlayerData(p => p ? { ...p, hp: calculateEffectiveStats(p).maxHp } : null); // Full heal
        setGameState('ready');
    }, [playerData, level, difficulty, gameMode, t]);

    const retryBattle = useCallback(() => {
        if (!player || !enemy) return;
        setPlayerData(p => p ? { ...p, hp: player.maxHp } : null);
        setEnemy(e => e ? { ...e, hp: e.maxHp } : null);
        setLog([t('rematchReady', { level })]);
        setWinner(null); setDetermination(null); setDeterminationTriggered(false); setIsRetrying(false);
        setIsPreBattleConsumablePanelOpen(false);
        setGameState('battling');
    }, [player, enemy, level, t]);

    const handleContinueAfterDefeat = () => {
        if (!playerData || (playerData.lives ?? 0) <= 0) return;

        setPlayerData(p => {
            if (!p) return null;
            const playerStateAfterDefeat = { ...p, lives: (p.lives ?? 1) - 1 };
            const effectivePlayer = calculateEffectiveStats(playerStateAfterDefeat);
            playerStateAfterDefeat.hp = effectivePlayer.maxHp;
            setBasePlayerStats(JSON.parse(JSON.stringify(playerStateAfterDefeat)));
            return playerStateAfterDefeat;
        });

        setAttributePoints(prev => prev + 20);
        setLastBattleGains({ xp: 0, gold: 0 });
        setIsRetrying(true);
        setGameState('levelUp');
    };

    const autoPurchaseItems = useCallback(() => {
        setPlayerData(p => {
            if (!p) return null;
            let currentGold = p.gold;
            let currentEquipment = { ...p.equipment };
            let currentInventory = [...(p.inventory || [])];
            let purchasedSomething = true;
            const availableItems = [...shopItems];

            while (purchasedSomething) {
                purchasedSomething = false;
                let bestItemToBuy: EquipmentItem | null = null;
                let bestItemIndex = -1;

                availableItems.sort((a, b) => b.cost - a.cost);

                for (let i = 0; i < availableItems.length; i++) {
                    const item = availableItems[i];
                    if (item.cost <= currentGold) {
                        const currentItemInSlot = currentEquipment[item.slot];
                        if (!currentItemInSlot || item.cost > (currentItemInSlot.cost || 0)) {
                            bestItemToBuy = item;
                            bestItemIndex = i;
                            break;
                        }
                    }
                }

                if (bestItemToBuy) {
                    currentGold -= bestItemToBuy.cost;
                    const previouslyEquipped = currentEquipment[bestItemToBuy.slot];
                    if (previouslyEquipped) {
                        currentInventory.push(previouslyEquipped);
                    }
                    currentEquipment[bestItemToBuy.slot] = bestItemToBuy;
                    availableItems.splice(bestItemIndex, 1);
                    purchasedSomething = true;
                }
            }

            return { ...p, gold: currentGold, equipment: currentEquipment, inventory: currentInventory };
        });
    }, [shopItems]);

    const handleCloseShop = useCallback(() => {
        if (gameMode === 'survival') {
            if (autoSpendGoldEnabled) {
                autoPurchaseItems();
            }
            setupNextSurvivalBattle();
        } else {
            setGameState('storyMap');
        }
        setShopItems([]);
    }, [gameMode, autoSpendGoldEnabled, setupNextSurvivalBattle, autoPurchaseItems]);

    const handleCloseEquipmentModal = () => {
        setIsEquipmentOpen(false);
        setPlayerData(p => {
            if (!p) return null;

            const newInventory = p.inventory.map(item => ({ ...item, isNew: false }));
            const newEquipment: { [key in EquipmentSlot]?: EquipmentItem } = {};
            for (const slot in p.equipment) {
                const item = p.equipment[slot as EquipmentSlot];
                if (item) {
                    newEquipment[slot as EquipmentSlot] = { ...item, isNew: false };
                }
            }
            return { ...p, inventory: newInventory, equipment: newEquipment };
        });
    };

    const handleContinueFromLevelUp = useCallback(() => {
        if (gameMode === 'survival') {
            if (isRetrying) {
                retryBattle();
            } else {
                setShopItems(generateEquipmentItems(player?.level || 1, 6, { playerAttackType: player?.attackType, isShop: true }));
                setGameState('shop');
            }
        } else {
            setGameState('storyMap');
        }
    }, [gameMode, isRetrying, retryBattle, player]);

    useEffect(() => {
        if (gameState === 'levelUp' && gameMode === 'survival' && autoDistributeEnabled && attributePoints > 0 && playerData) {

            const pointsToDistribute = attributePoints;
            const newPlayerData = JSON.parse(JSON.stringify(playerData));

            const primaryStats: PlayerStatKey[] = ['vitality'];
            if (newPlayerData.attackType === 'physical') {
                primaryStats.push('attack', 'defense');
            } else {
                primaryStats.push('magicAttack', 'magicDefense');
            }
            primaryStats.push('speed', 'luck', 'precision');

            let pointsLeft = pointsToDistribute;
            while (pointsLeft > 0) {
                for (const stat of primaryStats) {
                    if (pointsLeft > 0) {
                        (newPlayerData[stat] as number)++;
                        pointsLeft--;
                    } else {
                        break;
                    }
                }
            }

            // Batch state updates
            setPlayerData(newPlayerData);
            setAttributePoints(0);
        }
    }, [gameState, gameMode, autoDistributeEnabled, attributePoints, playerData]);

    useEffect(() => {
        if (gameState !== 'battling' || winner) return;

        const handleAttack = (attackerInput: Character, defenderInput: Character) => {
            let attacker = { ...attackerInput };
            let defender = { ...defenderInput };

            if (attacker.id === playerRef.current?.id && determinationRef.current) {
                const { stat, boost } = determinationRef.current;
                if (stat !== 'critChance') { (attacker[stat] as number) += boost; }
            }

            const hitChance = Math.max(0.25, Math.min(1.0, 1.0 + (attacker.precision - defender.speed) * 0.01));
            if (Math.random() > hitChance) {
                setLog(prev => [...prev, t('missedHit', { attacker: attacker.name, defender: defender.name })]);
                setAttackingCharacterId(attacker.id);
                setTimeout(() => setAttackingCharacterId(null), 400);
                return;
            }

            const isPhysical = attacker.attackType === 'physical';
            const attackStat = isPhysical ? attacker.attack : attacker.magicAttack;
            const defenseStat = isPhysical ? defender.defense : defender.magicDefense;

            const attackVariance = attackStat * 0.15;
            const variedAttack = attackStat + (Math.random() * attackVariance * 2 - attackVariance);

            const effectiveCritChance = attacker.critChance + (attacker.id === playerRef.current?.id && determinationRef.current?.stat === 'critChance' ? (determinationRef.current.boost / 100) : 0);
            const isCritical = Math.random() < effectiveCritChance;

            const rawDamage = variedAttack * (variedAttack / (variedAttack + defenseStat));
            const baseDamage = Math.max(1, Math.floor(rawDamage));
            let finalDamage = isCritical ? Math.floor(baseDamage * (1 + attacker.critMultiplier)) : baseDamage;

            let logMessages: string[] = [];

            if (Math.random() < Math.max(0, defender.absorptionChance)) {
                const absorbedAmount = Math.floor(finalDamage * defender.absorptionReduction);
                finalDamage -= absorbedAmount;
                logMessages.push(t('absorbDamage', { name: defender.name, amount: absorbedAmount }));
            }

            logMessages.push(isCritical
                ? t('criticalHit', { attacker: attacker.name, defender: defender.name, damage: finalDamage })
                : t('normalHit', { attacker: attacker.name, defender: defender.name, damage: finalDamage }));

            setLog(prev => [...prev, ...logMessages]);
            setAttackingCharacterId(attacker.id);
            setTimeout(() => setAttackingCharacterId(null), 400);

            const newHp = Math.max(0, defenderInput.hp - finalDamage);

            if (defenderInput.id === playerRef.current?.id && !determinationTriggered && newHp > 0 && newHp < defenderInput.maxHp * 0.3) {
                setDeterminationTriggered(true);

                // Context-aware determination stat selection
                const possibleStats: DeterminationStatKey[] = ['speed', 'critChance', 'precision', 'vitality', 'luck'];
                if (defenderInput.attackType === 'physical') {
                    possibleStats.push('attack');
                } else { // 'magical'
                    possibleStats.push('magicAttack');
                }
                if (attackerInput.attackType === 'physical') {
                    possibleStats.push('defense');
                } else { // 'magical'
                    possibleStats.push('magicDefense');
                }

                const randomStat = possibleStats[Math.floor(Math.random() * possibleStats.length)];
                const boostValue = (levelRef.current * 3) + ((playerRef.current?.vitality || 0) * 0.11);
                const statNameMap: { [key: string]: string } = { attack: t('statAttack'), defense: t('statDefense'), speed: t('statSpeed'), critChance: t('statCrit'), maxHp: t('statLife'), magicAttack: t('statMagicAttack'), magicDefense: t('statMagicDefense'), absorptionChance: t('statAbsorb'), precision: t('statPrecision'), vitality: t('statVitality'), luck: t('statLuck') };
                setDetermination({ stat: randomStat, boost: boostValue });
                setLog(prev => [...prev, t('determinationActivated', { name: defenderInput.name, boost: boostValue.toFixed(2), isPercent: randomStat === 'critChance' ? '%' : '', statName: statNameMap[randomStat] })]);
            }

            if (defender.id === playerRef.current?.id) {
                setPlayerData(p => p ? { ...p, hp: newHp } : null);
            } else {
                setEnemy(e => e ? { ...e, hp: newHp } : null);
            }

            if (newHp === 0) {
                setWinner(attacker.name);
                setLog(prev => [...prev, t('defeated', { name: defender.name }), t('winner', { name: attacker.name })]);

                if (attacker.id === playerRef.current?.id) {
                    const currentEnemy = enemyRef.current;
                    if (!currentEnemy) return;

                    const difficultyBonuses = DIFFICULTY_MODS[difficulty];
                    let uniqueItemDropped: EquipmentItem | null = null;

                    if (currentEnemy.characterType === 'boss') {
                        const [uniqueItem] = generateEquipmentItems(currentEnemy.level, 1, { forceUniqueOwner: currentEnemy.name, playerAttackType: playerRef.current?.attackType });
                        if (uniqueItem) {
                            uniqueItemDropped = uniqueItem;
                            setLog(prev => [...prev, `Você obteve um item Único: ${uniqueItem.name}!`]);
                        }
                    }

                    setPlayerData(p => {
                        if (!p) return null;

                        let newPlayerData = uniqueItemDropped ? acquireItem(p, uniqueItemDropped) : { ...p };

                        const effectivePlayerForGold = calculateEffectiveStats(newPlayerData);

                        const baseXp = 10 + Math.floor((currentEnemy.level - 1) * 3);
                        let xpGained = Math.max(10, Math.floor(baseXp * difficultyBonuses.xpBonus));

                        if (currentEnemy.characterType === 'elite') {
                            xpGained = Math.floor(xpGained * 2.5);
                        } else if (currentEnemy.characterType === 'boss') {
                            xpGained = Math.floor(xpGained * 5.0);
                        }

                        let goldGained = Math.floor((12 + Math.floor(currentEnemy.level * 2.5)) * difficultyBonuses.goldBonus);
                        goldGained = Math.floor(goldGained * (1 + (effectivePlayerForGold.luck * 0.008)));

                        setLastBattleGains({ xp: xpGained, gold: goldGained });

                        newPlayerData = { ...newPlayerData, gold: newPlayerData.gold + goldGained, xp: newPlayerData.xp + xpGained };
                        let didLevelUp = false;
                        let pointsGained = 0;
                        let currentHpBeforeLevelUp = newPlayerData.hp;

                        while (newPlayerData.xp >= newPlayerData.xpToNextLevel) {
                            didLevelUp = true;
                            newPlayerData.level++;
                            pointsGained += 3;
                            newPlayerData.xp -= newPlayerData.xpToNextLevel;
                            newPlayerData.xpToNextLevel = calculateXpToNextLevel(newPlayerData.level);
                        }

                        if (didLevelUp) {
                            const effectiveStatsAfterLevelUp = calculateEffectiveStats(newPlayerData);
                            const healAmount = Math.floor(effectiveStatsAfterLevelUp.maxHp * 0.5);
                            newPlayerData.hp = (gameModeRef.current === 'survival') ? effectiveStatsAfterLevelUp.maxHp : Math.min(effectiveStatsAfterLevelUp.maxHp, currentHpBeforeLevelUp + healAmount);
                            setAttributePoints(prev => prev + pointsGained);
                            setBasePlayerStats(JSON.parse(JSON.stringify(newPlayerData)));
                            setGameState('levelUp');
                        } else {
                            if (gameModeRef.current === 'survival') {
                                setShopItems(generateEquipmentItems(newPlayerData.level, 6, { playerAttackType: newPlayerData.attackType, isShop: true }));
                                setGameState('shop');
                            } else {
                                setGameState('storyMap');
                            }
                        }
                        return newPlayerData;
                    });
                } else { // Player was defeated
                    if ((gameModeRef.current === 'survival' || gameModeRef.current === 'story') && playerRef.current) {
                        const charId = playerRef.current.id;
                        let pointsEarned = 0;
                        if (gameModeRef.current === 'story') {
                            pointsEarned = (floorRef.current - 1) * 10 + nodesTraversedRef.current;
                        } else { // survival
                            pointsEarned = (levelRef.current - 1) * 3;
                        }

                        pointsEarned = Math.floor(pointsEarned);

                        if (pointsEarned > 0) {
                            setMasteryData(prev => {
                                const newMastery = { ...prev };
                                if (!newMastery[charId]) {
                                    newMastery[charId] = { totalPoints: 0, spentPoints: 0, talents: {} };
                                }
                                newMastery[charId].totalPoints += pointsEarned;
                                return newMastery;
                            });
                            setLog(prev => [...prev, `Você ganhou ${pointsEarned} Pontos de Maestria pela sua bravura!`]);
                        }
                    }
                    setGameState('over');
                }
            }
        };

        const BATTLE_TICK_SPEED = 250;
        const ACTION_POINT_THRESHOLD = 100;
        let playerActionPoints = 0;
        let enemyActionPoints = 0;

        const battleInterval = setInterval(() => {
            const currentPlayer = playerRef.current;
            const currentEnemy = enemyRef.current;
            if (!currentPlayer || !currentEnemy || winnerRef.current || currentPlayer.hp <= 0 || currentEnemy.hp <= 0) {
                clearInterval(battleInterval);
                return;
            }

            playerActionPoints += currentPlayer.speed;
            enemyActionPoints += currentEnemy.speed;

            const playerCanAttack = playerActionPoints >= ACTION_POINT_THRESHOLD;
            const enemyCanAttack = enemyActionPoints >= ACTION_POINT_THRESHOLD;
            let attackerToProcess: 'player' | 'enemy' | null = null;
            if (playerCanAttack && enemyCanAttack) {
                attackerToProcess = playerActionPoints > enemyActionPoints ? 'player' : 'enemy';
            } else if (playerCanAttack) { attackerToProcess = 'player'; }
            else if (enemyCanAttack) { attackerToProcess = 'enemy'; }

            if (attackerToProcess) {
                if (attackerToProcess === 'player') {
                    playerActionPoints -= ACTION_POINT_THRESHOLD;
                    handleAttack(currentPlayer, currentEnemy);
                } else if (!winnerRef.current) {
                    enemyActionPoints -= ACTION_POINT_THRESHOLD;
                    handleAttack(currentEnemy, currentPlayer);
                }
            }
        }, BATTLE_TICK_SPEED / gameSpeed);
        return () => clearInterval(battleInterval);
    }, [gameState, winner, gameSpeed, determinationTriggered, t, difficulty]);

    const handleAttributeIncrease = (stat: PlayerStatKey) => {
        if (attributePoints > 0 && playerData) {
            setPlayerData(p => {
                if (!p) return null;
                const newPlayerData = { ...p };
                (newPlayerData[stat] as number) += 1;
                return newPlayerData;
            });
            setAttributePoints(pts => pts - 1);
        }
    };

    const handleAttributeDecrease = (stat: PlayerStatKey) => {
        if (!playerData || !basePlayerStats) return;

        const originalValue = basePlayerStats[stat as keyof Character];
        const currentValue = playerData[stat as keyof Character];

        if (typeof currentValue === 'number' && typeof originalValue === 'number' && currentValue > originalValue) {
            setPlayerData(p => {
                if (!p) return null;
                const newPlayerData = { ...p };
                (newPlayerData[stat] as number) -= 1;
                return newPlayerData;
            });
            setAttributePoints(pts => pts + 1);
        }
    };

    const handlePurchase = (item: EquipmentItem) => {
        setPlayerData(p => {
            if (!p || p.gold < item.cost) return p;
            let newPlayer = { ...p, gold: p.gold - item.cost };
            newPlayer = acquireItem(newPlayer, item);
            return newPlayer;
        });
        setShopItems(items => items.filter(i => i.id !== item.id));
    };

    const handleEquipItem = useCallback((itemToEquip: EquipmentItem) => {
        setPlayerData(p => {
            if (!p) return null;

            const newInventory = [...(p.inventory || [])];
            const inventoryIndex = newInventory.findIndex(i => i.id === itemToEquip.id);

            if (inventoryIndex === -1) {
                console.error("Tentativa de equipar item que não está no inventário.", itemToEquip);
                return p;
            }

            const oldEffectiveStats = calculateEffectiveStats(p);
            const oldHpPercentage = (oldEffectiveStats.hp / oldEffectiveStats.maxHp);

            newInventory.splice(inventoryIndex, 1);

            const currentlyEquippedItem = p.equipment[itemToEquip.slot];
            if (currentlyEquippedItem) {
                newInventory.push({ ...currentlyEquippedItem, isNew: false });
            }

            const newEquipment = { ...p.equipment, [itemToEquip.slot]: { ...itemToEquip, isNew: false } };
            let newPlayerData = { ...p, equipment: newEquipment, inventory: newInventory };

            const newEffectiveStats = calculateEffectiveStats(newPlayerData);
            newPlayerData.hp = Math.round(newEffectiveStats.maxHp * oldHpPercentage);

            return newPlayerData;
        });
    }, []);

    const handleUnequipItem = useCallback((itemToUnequip: EquipmentItem) => {
        setPlayerData(p => {
            if (!p) return null;

            if (p.equipment[itemToUnequip.slot]?.id !== itemToUnequip.id) {
                console.error("Attempting to unequip an item that is not in the correct slot.", itemToUnequip);
                return p;
            }

            const oldEffectiveStats = calculateEffectiveStats(p);
            const oldHpPercentage = oldEffectiveStats.hp > 0 ? (oldEffectiveStats.hp / oldEffectiveStats.maxHp) : 1;

            const newEquipment = { ...p.equipment };
            delete newEquipment[itemToUnequip.slot];

            const newInventory = [...(p.inventory || []), { ...itemToUnequip, isNew: false }];

            let newPlayerData = { ...p, equipment: newEquipment, inventory: newInventory };

            const newEffectiveStats = calculateEffectiveStats(newPlayerData);
            newPlayerData.hp = Math.round(newEffectiveStats.maxHp * oldHpPercentage);

            return newPlayerData;
        });
    }, []);

    const handleSellItem = useCallback((itemToSell: EquipmentItem) => {
        setPlayerData(p => {
            if (!p) return null;

            const inventoryIndex = p.inventory.findIndex(i => i.id === itemToSell.id);
            if (inventoryIndex === -1) return p;

            const newInventory = [...p.inventory];
            newInventory.splice(inventoryIndex, 1);

            const sellPrice = Math.floor(itemToSell.cost * 0.4);
            const newGold = p.gold + sellPrice;

            return { ...p, inventory: newInventory, gold: newGold };
        });
    }, []);


    const handleUseConsumable = useCallback((consumableToUse: Consumable) => {
        setIsConsumableConfirmOpen(null); // Close confirmation modal first
        setPlayerData(p => {
            if (!p) return null;

            const consumableInventory = p.consumables[consumableToUse.id];
            if (!consumableInventory || consumableInventory.quantity <= 0) return p;

            let newPlayerData = { ...p };
            const { effect } = consumableInventory.item;

            if (effect.type === 'HEAL_HP') {
                if (newPlayerData.hp >= calculateEffectiveStats(p).maxHp) return p; // Do nothing if HP is full
                const currentEffectiveStats = calculateEffectiveStats(p);
                newPlayerData.hp = Math.min(currentEffectiveStats.maxHp, newPlayerData.hp + effect.amount);
            }

            const newConsumables = { ...newPlayerData.consumables };
            if (newConsumables[consumableToUse.id].quantity > 1) {
                newConsumables[consumableToUse.id] = { ...newConsumables[consumableToUse.id], quantity: newConsumables[consumableToUse.id].quantity - 1 };
            } else {
                delete newConsumables[consumableToUse.id];
            }
            newPlayerData.consumables = newConsumables;

            return newPlayerData;
        });
    }, []);

    const handleAdvanceToNextFloor = useCallback(() => {
        setIsNextFloorConfirmOpen(false);
        const newFloor = floor + 1;
        if (newFloor > Object.keys(FLOOR_THEMES).length) { // Victory condition
            setGameState('victory');
            return;
        }
        setFloor(newFloor);
        setIsBossBuffed(false);

        let newFloorDangerLevel = newFloor;
        if (playerData && (playerData.level - floorDangerLevel > 2)) {
            newFloorDangerLevel = newFloor + 5;
        }
        setFloorDangerLevel(newFloorDangerLevel);

        const newMap = generateStoryMap(difficulty, newFloor);
        setStoryMap(newMap);
        const startNode = newMap.find(n => n.y === 50 && n.x < 10);
        setCurrentNodeId(startNode?.id || null);
        setCompletedNodeIds(startNode ? [startNode.id] : []);
        setPlayerData(p => {
            if (!p) return null;
            const currentEffective = calculateEffectiveStats(p);
            const healAmount = Math.floor(currentEffective.maxHp * 0.5);
            setLog([`Você avançou para o Andar ${newFloor} e recuperou ${healAmount} de vida!`]);
            const newPlayerData = { ...p, hp: Math.min(currentEffective.maxHp, p.hp + healAmount) };
            return newPlayerData;
        });
        setGameState('storyMap');
    }, [floor, difficulty, playerData, floorDangerLevel]);

    const handleNodeSelect = (node: MapNode) => {
        if (completedNodeIds.includes(node.id)) return;

        if (node.type === 'EXIT') {
            setIsNextFloorConfirmOpen(true);
            return;
        }

        setCompletedNodeIds(ids => [...ids, node.id]);
        setCurrentNodeId(node.id);
        setNodesTraversed(n => n + 1);

        if (node.type.includes('BATTLE') || node.type === 'BOSS') {
            const enemyTypeMap = { 'BATTLE': 'normal', 'ELITE_BATTLE': 'elite', 'BOSS': 'boss' };
            const enemyType = enemyTypeMap[node.type as keyof typeof enemyTypeMap] as 'normal' | 'elite' | 'boss';

            // Calculate step-based level bonus
            const scalingConfig = ENEMY_LEVEL_SCALING_CONFIG[difficulty][enemyType];
            const stepsPerLevel = scalingConfig.length > 1
                ? Math.floor(Math.random() * (scalingConfig[1] - scalingConfig[0] + 1)) + scalingConfig[0]
                : scalingConfig[0];
            const bonusLevel = Math.floor(nodesTraversed / stepsPerLevel);

            const enemyLvl = floorDangerLevel + bonusLevel;

            const newEnemy = createEnemy(enemyLvl, difficulty, 'story', enemyType, isBossBuffed, node.enemyName as EnemyName);
            setEnemy({ ...newEnemy, id: node.id, level: enemyLvl });

            setWinner(null);
            setIsPreBattleConsumablePanelOpen(true); // Open panel before battle
            setGameState('ready');
        } else if (node.type === 'TREASURE') {
            let generatedReward: MapNode['reward'] = {};
            const rand = Math.random();
            const playerLevelForReward = player?.level || floor;

            if (rand < 0.25) { // Item
                const [item] = generateEquipmentItems(playerLevelForReward, 1, { playerAttackType: player?.attackType, floor: floor });
                generatedReward = { item };
            } else if (rand < 0.5) { // Consumable
                generatedReward = { consumable: CONSUMABLE_ITEMS.HEALING_POTION_S };
            } else { // Gold
                generatedReward = { gold: 50 + Math.floor(Math.random() * 51) * floor };
            }

            setPlayerData(p => {
                if (!p) return null;
                let newPlayer = { ...p };
                if (generatedReward.item) newPlayer = acquireItem(newPlayer, generatedReward.item);
                if (generatedReward.gold) newPlayer.gold += generatedReward.gold;
                if (generatedReward.consumable) {
                    const { id } = generatedReward.consumable;
                    const newConsumables = { ...newPlayer.consumables };
                    if (newConsumables[id]) { newConsumables[id].quantity++; }
                    else { newConsumables[id] = { item: generatedReward.consumable!, quantity: 1 }; }
                    newPlayer.consumables = newConsumables;
                }
                return newPlayer;
            });
            setTreasureReward(generatedReward);
            setGameState('treasure');
        } else if (node.type === 'REST') {
            setPlayerData(p => {
                if (!p) return null;
                const currentEffective = calculateEffectiveStats(p);
                const healAmount = Math.floor(currentEffective.maxHp * (node.rest?.hpPercentage || 0));
                setLog([t('restMessage', { hp: healAmount })]);
                return { ...p, hp: Math.min(currentEffective.maxHp, p.hp + healAmount) };
            });
            setGameState('storyMap');
        } else if (node.type === 'SHOP') {
            setShopItems(generateEquipmentItems(
                player?.level || floorDangerLevel,
                6,
                { playerAttackType: player?.attackType, floor: floor, isShop: true }
            ));
            setGameState('shop');
        } else if (node.type === 'LUCK') {
            const roll = Math.random();
            let result: { type: string, details?: any } | null = null;
            const playerLevel = player?.level || 1;
            let itemFound: EquipmentItem | null = null;

            if (roll < 0.01) { // 1% Trap
                const damage = Math.floor(50 + Math.random() * 51);
                setPlayerData(p => p ? ({ ...p, hp: Math.max(1, p.hp - damage) }) : p);
                result = { type: 'trap', details: { hp: damage } };
            } else if (roll < 0.02) { [itemFound] = generateEquipmentItems(playerLevel, 1, { forceRarity: 'Lendário', playerAttackType: player?.attackType }); }
            else if (roll < 0.04) { [itemFound] = generateEquipmentItems(playerLevel, 1, { forceRarity: 'Épico', playerAttackType: player?.attackType }); }
            else if (roll < 0.09) { [itemFound] = generateEquipmentItems(playerLevel, 1, { forceRarity: 'Raro', playerAttackType: player?.attackType }); }
            else if (roll < 0.29) { [itemFound] = generateEquipmentItems(playerLevel, 1, { forceRarity: 'Comum', playerAttackType: player?.attackType }); }
            else if (roll < 0.59) { // 30% Attribute
                setPlayerData(p => {
                    if (!p) return null;
                    const newPlayerData = { ...p };
                    const primaryStats: PlayerStatKey[] = ['vitality', 'luck', 'precision'];
                    if (p.attackType === 'physical') { primaryStats.push('attack', 'defense'); }
                    else { primaryStats.push('magicAttack', 'magicDefense'); }
                    const statToBoost = primaryStats[Math.floor(Math.random() * primaryStats.length)];
                    (newPlayerData[statToBoost] as number)++;
                    const statName = t(`stat${statToBoost.charAt(0).toUpperCase() + statToBoost.slice(1)}` as any);
                    result = { type: 'attribute', details: { statName } };
                    return newPlayerData;
                });
            } else if (roll < 0.75) { // 16% Gold
                const gold = 50 + Math.floor(Math.random() * 151);
                setPlayerData(p => p ? ({ ...p, gold: p.gold + gold }) : p);
                result = { type: 'gold', details: { gold } };
            } else if (roll < 0.90) { // 15% Consumable
                const consumable = CONSUMABLE_ITEMS.HEALING_POTION_S;
                setPlayerData(p => {
                    if (!p) return null;
                    const newConsumables = { ...p.consumables };
                    if (newConsumables[consumable.id]) { newConsumables[consumable.id].quantity++; }
                    else { newConsumables[consumable.id] = { item: consumable, quantity: 1 }; }
                    return { ...p, consumables: newConsumables };
                });
                result = { type: 'consumable', details: { item: consumable } };
            } else if (roll < 0.95) { // 5% Elite spawn
                setStoryMap(currentMap => {
                    const uncompletedBattleNodes = currentMap.filter(n => n.type === 'BATTLE' && !completedNodeIds.includes(n.id));
                    const nodesToUpgradeCount = Math.min(uncompletedBattleNodes.length, Math.floor(Math.random() * 2) + 1); // 1 to 2
                    const nodesToUpgrade = uncompletedBattleNodes.sort(() => 0.5 - Math.random()).slice(0, nodesToUpgradeCount);
                    const upgradedNodeIds = new Set(nodesToUpgrade.map(n => n.id));
                    return currentMap.map(n => upgradedNodeIds.has(n.id) ? { ...n, type: 'ELITE_BATTLE' } : n);
                });
                result = { type: 'elite' };
            } else { // 5% Boss Buff
                setIsBossBuffed(true);
                result = { type: 'bossBuff' };
            }

            if (itemFound) {
                setPlayerData(p => p ? acquireItem(p, itemFound!) : null);
                result = { type: 'item', details: { item: itemFound } };
            }

            setLuckEventResult(result);
            setGameState('luck');
        }
    };

    const handleCloseTreasure = () => {
        setGameState('storyMap');
        setTreasureReward(null);
    }

    const isHudVisible = player && (gameState === 'storyMap' || gameState === 'shop' || gameState === 'treasure' || gameState === 'luck');

    const MainContent = () => {
        switch (gameState) {
            case 'splash': return <SplashScreen onStart={() => setGameState('modeSelection')} onSettings={() => setGameState('settings')} onMechanics={() => setIsMechanicsModalOpen(true)} onSetLanguage={setLanguage} t={t} />;
            case 'modeSelection': return <ModeSelection onSelectMode={handleModeSelect} onBack={() => setGameState('splash')} t={t} />;
            case 'home': return <CharacterSelection heroes={HERO_OPTIONS} onSelect={handleCharacterSelect} onBack={() => setGameState('modeSelection')} t={t} />;
            case 'difficultySelection': return <DifficultySelection onSelect={handleDifficultySelect} onBack={() => setGameState('home')} t={t} />;
            case 'storyMap': return player && <StoryMapView map={storyMap} completedNodeIds={completedNodeIds} currentNodeId={currentNodeId} onNodeSelect={handleNodeSelect} floor={floor} t={t} difficulty={difficulty} />;
            case 'masteryTree': return <MasteryTreeView heroes={HERO_OPTIONS} masteryData={masteryData} onBack={() => setGameState('modeSelection')} t={t} />;
            case 'treasure': return null;
            case 'shop': return null;
            case 'luck': return null;
            case 'victory': return <VictoryScreen onGoHome={requestGoHome} t={t} />;
            case 'levelUp':
                return player && basePlayerStats && playerData && (
                    <LevelUp player={player} basePlayerStats={basePlayerStats} points={attributePoints} gains={lastBattleGains} onAttributeIncrease={handleAttributeIncrease} onAttributeDecrease={handleAttributeDecrease} onContinue={handleContinueFromLevelUp} autoDistributeEnabled={autoDistributeEnabled} onToggleAutoDistribute={() => setAutoDistributeEnabled(p => !p)} isRetrying={isRetrying} t={t} gameMode={gameMode} playerData={playerData} />
                );
            case 'ready':
            case 'battling':
            case 'over':
                return player && enemy && (
                    <>
                        <div className="flex flex-col md:flex-row justify-center items-start gap-4 mb-4">
                            <div className="flex items-start gap-4">
                                {gameState === 'ready' && isPreBattleConsumablePanelOpen && <PreBattleConsumablesPanel player={player} onUseConsumable={handleUseConsumable} onClose={() => setIsPreBattleConsumablePanelOpen(false)} t={t} />}
                                <CharacterCard character={player} isAttacking={attackingCharacterId === player.id} isPlayer={true} determination={determination} determinationActive={determination !== null} t={t} opponentAttackType={enemy.attackType} opponent={enemy} />
                            </div>
                            <CharacterCard character={enemy} isAttacking={attackingCharacterId === enemy?.id} isPlayer={false} t={t} opponentAttackType={player.attackType} opponent={player} />
                        </div>
                        <GameControls gameState={gameState} winner={winner} onGoHome={requestGoHome} onContinueAfterDefeat={handleContinueAfterDefeat} playerWon={winner === player.name} playerLives={player.lives ?? 0} t={t} gameMode={gameMode} onStart={handleStart} />
                        <BattleLog log={log} t={t} />
                    </>
                );
            default: return null;
        }
    };

    const title = gameMode === 'story' && gameState !== 'splash' ? t('story') : t('gameTitle');

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white p-4 font-sans select-none">
            {gameState === 'settings' && <SettingsModal t={t} onClose={() => setGameState('splash')} gameSpeed={gameSpeed} setGameSpeed={setGameSpeed} autoDistribute={autoDistributeEnabled} setAutoDistribute={setAutoDistributeEnabled} autoSpendGold={autoSpendGoldEnabled} setAutoSpendGold={setAutoSpendGoldEnabled} />}
            {isMechanicsModalOpen && <MechanicsModal onClose={() => setIsMechanicsModalOpen(false)} t={t} />}
            {player && isEquipmentOpen && <EquipmentModal player={player} onEquip={handleEquipItem} onUnequip={handleUnequipItem} onClose={handleCloseEquipmentModal} t={t} onUseConsumable={(item) => setIsConsumableConfirmOpen(item)} />}

            {gameState === 'treasure' && player && treasureReward && <TreasureModal player={player} reward={treasureReward} onClose={handleCloseTreasure} t={t} />}
            {player && gameState === 'shop' && <ShopModal player={player} items={shopItems} onPurchase={handlePurchase} onSell={handleSellItem} onEquip={handleEquipItem} onUnequip={handleUnequipItem} onClose={handleCloseShop} t={t} />}
            {gameState === 'luck' && luckEventResult && <LuckEventModal result={luckEventResult} onClose={() => { setGameState('storyMap'); setLuckEventResult(null); }} t={t} />}

            {isHudVisible && <PlayerHUD player={player} onEquipmentClick={() => setIsEquipmentOpen(true)} onGoHome={requestGoHome} t={t} />}
            {isGoHomeConfirmOpen && <ConfirmationModal title={t('confirmGoHomeTitle')} message={t('confirmGoHomeMessage')} onConfirm={() => { handleGoHome(); setIsGoHomeConfirmOpen(false); }} onCancel={() => setIsGoHomeConfirmOpen(false)} t={t} />}
            {isConsumableConfirmOpen && player && <ConfirmationModal title={t('confirmUseItemTitle')} message={t('confirmUseItemMessage', { itemName: isConsumableConfirmOpen.name })} onConfirm={() => handleUseConsumable(isConsumableConfirmOpen)} onCancel={() => setIsConsumableConfirmOpen(null)} t={t} />}
            {isNextFloorConfirmOpen && <NextFloorModal onConfirm={handleAdvanceToNextFloor} onCancel={() => setIsNextFloorConfirmOpen(false)} t={t} />}

            <div className={`relative w-full max-w-5xl mx-auto ${isHudVisible ? 'pt-28' : ''}`}>
                {(gameState !== 'splash' && gameState !== 'home' && gameState !== 'difficultySelection' && gameState !== 'modeSelection' && gameState !== 'settings' && gameState !== 'masteryTree') && (
                    <div className="absolute top-0 right-0 flex items-center gap-2 mt-2 mr-2 z-10">
                        <span className="text-xl font-bold bg-gray-800/70 px-4 py-2 rounded-lg">{t('battlePhase')}: {gameMode === 'survival' ? level : enemy?.level || player?.level}</span>
                        <button onClick={() => setGameSpeed(s => (s >= 3 ? 1 : s + 1))} className="px-4 py-2 bg-purple-700 text-white font-bold rounded-lg text-sm hover:bg-purple-600 transition-all w-28" aria-label={t('speedControl')}> {t('speedControl')}: {gameSpeed}x </button>
                        <button onClick={requestGoHome} className="px-4 py-2 bg-gray-700 text-white font-bold rounded-lg text-sm hover:bg-gray-600 transition-all" aria-label={t('goHome')}> {t('goHome')} </button>
                    </div>
                )}
                <h1 className="text-6xl font-bold text-center mb-8 text-yellow-400" style={{ textShadow: '3px 3px 6px #000' }}> {title} </h1>
                <div className="animate-fade-in" key={gameState + (currentNodeId || '') + (player?.level || 0) + floor}>
                    <MainContent />
                </div>
            </div>
        </div>
    );
};

// --- Inlined Components ---

const NextFloorModal: React.FC<{ onConfirm: () => void; onCancel: () => void; t: (key: any) => string; }> = ({ onConfirm, onCancel, t }) => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100] animate-modal-fade-in">
        <div className="bg-gray-800 rounded-2xl border-2 border-yellow-400 p-8 shadow-lg max-w-md w-full text-center">
            <h2 className="text-3xl font-bold text-yellow-300 mb-4">{t('nextFloorConfirmTitle')}</h2>
            <div className="text-8xl my-4">🚪</div>
            <p className="text-gray-300 mb-8">{t('nextFloorConfirmMessage')}</p>
            <div className="flex justify-center gap-6">
                <button onClick={onCancel} className="px-10 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500 transition-all">{t('nextFloorConfirmStay')}</button>
                <button onClick={onConfirm} className="px-10 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-all">{t('nextFloorConfirmEnter')}</button>
            </div>
        </div>
    </div>
);

const PreBattleConsumablesPanel: React.FC<{ player: Character, onUseConsumable: (item: Consumable) => void, onClose: () => void, t: (key: any, params?: any) => string; }> = ({ player, onUseConsumable, onClose, t }) => {
    return (
        <div
            className="bg-gray-800 border-2 border-yellow-500 shadow-xl p-4 flex flex-col gap-4 w-64 animate-fade-in rounded-lg"
            onClick={e => e.stopPropagation()}
        >
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-yellow-300">Consumíveis</h3>
                <button onClick={onClose} className="text-2xl font-bold text-red-400 hover:text-red-300 leading-none">&times;</button>
            </div>
            <div className="flex-grow overflow-y-auto space-y-3 pr-2 h-64">
                {Object.values(player.consumables).length > 0 ? (
                    Object.values(player.consumables).map(({ item, quantity }) => {
                        const isHeal = item.effect.type === 'HEAL_HP';
                        const isDisabled = isHeal && player.hp >= player.maxHp;
                        return (
                            <div key={item.id} className={`bg-gray-700 p-2 rounded-lg flex items-center justify-between ${isDisabled ? 'opacity-60' : ''}`}>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">{item.icon}</span>
                                    <div>
                                        <p className="font-semibold text-white text-sm">{item.name} ({quantity})</p>
                                        <p className="text-xs text-gray-400">{item.description}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onUseConsumable(item)}
                                    disabled={isDisabled}
                                    className="px-2 py-1 bg-blue-600 text-white font-bold rounded-md text-xs hover:bg-blue-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                                >
                                    {t('useItem', { itemName: '' }).trim()}
                                </button>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-gray-400 text-center mt-8">Nenhum consumível disponível.</p>
                )}
            </div>
        </div>
    );
};

const MasteryTreeView: React.FC<{ heroes: Character[], masteryData: MasteryData, onBack: () => void, t: (key: any) => string; }> = ({ heroes, masteryData, onBack, t }) => {
    const [selectedHero, setSelectedHero] = useState<Character | null>(null);

    if (selectedHero) {
        const heroMastery = masteryData[selectedHero.id] || { totalPoints: 0, spentPoints: 0, talents: {} };
        return (
            <div className="flex flex-col items-center gap-6 animate-fade-in bg-gray-800/50 p-8 rounded-2xl border-2 border-purple-400">
                <div className="flex items-center gap-4">
                    <span className="text-7xl">{selectedHero.avatar}</span>
                    <h2 className="text-4xl font-bold text-purple-300">{selectedHero.name}</h2>
                </div>
                <div className="text-center">
                    <p className="text-lg text-gray-300">Pontos de Maestria Totais</p>
                    <p className="text-5xl font-bold text-yellow-300">{heroMastery.totalPoints}</p>
                </div>
                <div className="w-full max-w-lg text-center bg-gray-900/50 p-6 rounded-lg mt-4">
                    <h3 className="text-2xl font-bold text-yellow-200 mb-4">Árvore de Talentos</h3>
                    <p className="text-gray-400">A Árvore de Talentos será implementada em breve. Continue jogando para acumular pontos!</p>
                </div>
                <button onClick={() => setSelectedHero(null)} className="px-8 py-3 bg-gray-600 text-white font-bold rounded-lg text-xl hover:bg-gray-500 transition-all mt-4">
                    {t('back')}
                </button>
            </div>
        )
    }

    return (
        <div className="animate-fade-in">
            <h2 className="text-4xl font-bold text-center mb-8 text-purple-300">Maestria dos Heróis</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-screen-lg mx-auto">
                {heroes.map(hero => {
                    const points = masteryData[hero.id]?.totalPoints || 0;
                    return (
                        <div
                            key={hero.id}
                            onClick={() => setSelectedHero(hero)}
                            className="bg-gray-800 p-4 rounded-2xl shadow-lg border-2 border-purple-600 flex flex-col items-center gap-3 text-center cursor-pointer transform transition-all hover:scale-105 hover:border-purple-300 duration-300"
                        >
                            <span className="text-8xl">{hero.avatar}</span>
                            <h3 className="text-3xl font-bold text-purple-300">{hero.name}</h3>
                            <p className="text-lg font-semibold text-yellow-300">{points} Pontos</p>
                        </div>
                    );
                })}
            </div>
            <div className="text-center mt-10">
                <button onClick={onBack} className="px-8 py-3 bg-gray-600 text-white font-bold rounded-lg text-xl hover:bg-gray-500 transition-all">
                    {t('back')}
                </button>
            </div>
        </div>
    );
};


const VictoryScreen: React.FC<{ onGoHome: () => void; t: (key: any) => string; }> = ({ onGoHome, t }) => (
    <div className="flex flex-col items-center gap-4 animate-fade-in text-center p-8">
        <h2 className="text-5xl font-bold text-green-400">{t('victoryTitle')}</h2>
        <p className="text-xl text-gray-200 mt-2">{t('victoryMessage')}</p>
        <div className="text-8xl my-4">🏆</div>
        <button
            onClick={onGoHome}
            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg text-xl hover:bg-blue-500 transition-all"
        >
            {t('goHome')}
        </button>
    </div>
);

const ModeSelection: React.FC<{ onSelectMode: (mode: GameMode) => void; onBack: () => void; t: (key: any) => string; }> = ({ onSelectMode, onBack, t }) => (
    <div className="flex flex-col items-center gap-8 animate-fade-in">
        <h2 className="text-4xl font-bold text-center">{t('modeSelectionTitle')}</h2>
        <div className="flex flex-col gap-6 w-full max-w-md">
            <button onClick={() => onSelectMode('story')} className="bg-gray-800 p-6 rounded-lg border-2 border-yellow-400 hover:bg-yellow-900/50 hover:border-yellow-300 transition-all transform hover:scale-105">
                <h3 className="text-3xl font-bold text-yellow-300">{t('story')}</h3>
                <p className="mt-2 text-gray-300">{t('storyDesc')}</p>
            </button>
            <button onClick={() => onSelectMode('survival')} className="bg-gray-800 p-6 rounded-lg border-2 border-blue-400 hover:bg-blue-900/50 hover:border-blue-300 transition-all transform hover:scale-105">
                <h3 className="text-3xl font-bold text-blue-300">{t('survival')}</h3>
                <p className="mt-2 text-gray-300">{t('survivalDesc')}</p>
            </button>
            <button onClick={() => onSelectMode('mastery')} className="bg-gray-800 p-6 rounded-lg border-2 border-purple-400 hover:bg-purple-900/50 hover:border-purple-300 transition-all transform hover:scale-105">
                <h3 className="text-3xl font-bold text-purple-300">{t('mastery')}</h3>
                <p className="mt-2 text-gray-300">{t('masteryDesc')}</p>
            </button>
            <button onClick={onBack} className="px-8 py-3 bg-gray-600 text-white font-bold rounded-lg text-xl hover:bg-gray-500 transition-all mt-4">
                {t('back')}
            </button>
        </div>
    </div>
);

const DifficultySelection: React.FC<{ onSelect: (d: Difficulty) => void; t: (key: any) => string; onBack: () => void; }> = ({ onSelect, t, onBack }) => {
    const difficulties: { key: Difficulty; color: string, border: string }[] = [
        { key: 'easy', color: 'bg-green-600', border: 'border-green-400' },
        { key: 'medium', color: 'bg-yellow-600', border: 'border-yellow-400' },
        { key: 'hard', color: 'bg-red-600', border: 'border-red-400' },
        { key: 'impossible', color: 'bg-purple-700', border: 'border-purple-500' },
    ];
    return (
        <div className="flex flex-col items-center gap-6">
            <h2 className="text-4xl font-bold text-center mb-4">{t('difficultyTitle')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {difficulties.map(({ key, color, border }) => (
                    <div className="tooltip" key={key}>
                        <button onClick={() => onSelect(key)} className={`w-full px-10 py-4 ${color} text-white font-bold rounded-lg border-2 ${border} text-2xl hover:brightness-125 transition-all transform hover:scale-105 shadow-lg`}>
                            {t(key)}
                        </button>
                        <span className="tooltiptext">{t(DIFFICULTY_MODS[key].descriptionKey)}</span>
                    </div>
                ))}
            </div>
            <button onClick={onBack} className="px-8 py-3 bg-gray-600 text-white font-bold rounded-lg text-xl hover:bg-gray-500 transition-all mt-4">
                {t('back')}
            </button>
        </div>
    );
};

const StoryMapView: React.FC<{ map: MapNode[], completedNodeIds: string[], currentNodeId: string | null, onNodeSelect: (node: MapNode) => void, floor: number, t: (key: any, params?: Record<string, string | number>) => string, difficulty: Difficulty }> = ({ map, completedNodeIds, currentNodeId, onNodeSelect, floor, t, difficulty }) => {
    if (map.length === 0) return <div>Carregando mapa...</div>;
    const nodeIcons: { [key in MapNodeType]: string } = { BATTLE: '💀', ELITE_BATTLE: '🔥', BOSS: '👑', TREASURE: '🧰', REST: '⛺', SHOP: '🛒', LUCK: '❓', EXIT: '🚪' };
    const nodeColors: { [key in MapNodeType]: string } = { BATTLE: 'bg-gray-600 border-gray-400', ELITE_BATTLE: 'bg-red-800 border-red-500', BOSS: 'bg-purple-900 border-purple-500', TREASURE: 'bg-yellow-600 border-yellow-400', REST: 'bg-green-700 border-green-500', SHOP: 'bg-blue-700 border-blue-500', LUCK: 'bg-indigo-700 border-indigo-500', EXIT: 'bg-stone-500 border-stone-300' };
    const nodeLabels: { [key in MapNodeType]: string } = { BATTLE: t('nodeBattle'), ELITE_BATTLE: t('nodeElite'), BOSS: t('nodeBoss'), TREASURE: t('nodeTreasure'), REST: t('nodeRest'), SHOP: t('nodeShop'), LUCK: t('nodeLuck'), EXIT: t('nodeExit') };

    const actualCurrentNodeId = currentNodeId || map.find(n => n.x < 10)?.id;
    const theme = FLOOR_THEMES[floor] || FLOOR_THEMES[1];
    const backgroundUrl = theme.backgroundUrl;

    return (
        <div className="flex flex-col items-center gap-4 animate-fade-in">
            <h2 className="text-3xl font-bold text-yellow-300">{t('storyMapTitle', { level: floor })} <span className="text-xl text-gray-400 font-medium">({t(difficulty)})</span></h2>
            <div
                style={{ backgroundImage: backgroundUrl ? `url('${backgroundUrl}')` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}
                className="relative w-full h-[75vh] rounded-lg p-4 overflow-hidden border-4 border-yellow-800/50 shadow-inner bg-gray-900"
            >
                <div className={`absolute inset-0 ${backgroundUrl ? 'bg-black/40' : ''}`}></div>
                <div className="relative w-full h-full">
                    <svg className="absolute top-0 left-0 w-full h-full" style={{ zIndex: 0 }}>
                        {map.map(node => node.connections.map(connId => {
                            const targetNode = map.find(n => n.id === connId);
                            if (!node || !targetNode) return null;

                            const isCompletedPath = completedNodeIds.includes(node.id) && completedNodeIds.includes(targetNode.id);
                            const currentNode = map.find(n => n.id === actualCurrentNodeId);
                            const isActivePath = currentNode?.connections.includes(targetNode.id);

                            let strokeColor = '#4b5563'; // gray-600
                            if (isCompletedPath) strokeColor = '#facc15'; // yellow-400
                            if (isActivePath) strokeColor = '#93c5fd'; // blue-300

                            return <line key={`${node.id}-${connId}`} x1={`${node.x}%`} y1={`${node.y}%`} x2={`${targetNode.x}%`} y2={`${targetNode.y}%`} stroke={strokeColor} strokeWidth="2" />;
                        }))}
                    </svg>

                    {map.map(node => {
                        const isCompleted = completedNodeIds.includes(node.id);
                        const currentNode = map.find(n => n.id === actualCurrentNodeId);
                        const isSelectable = (currentNode?.connections.includes(node.id) && !isCompleted) || (node.id === actualCurrentNodeId && !isCompleted);

                        return (
                            <div key={node.id} className="absolute transition-all duration-300" style={{ top: `${node.y}%`, left: `${node.x}%`, zIndex: 1, transform: 'translate(-50%, -50%)' }}>
                                <button disabled={!isSelectable} onClick={() => onNodeSelect(node)} className={`w-20 h-20 rounded-full flex flex-col items-center justify-center p-1 text-center border-4 transition-all ${nodeColors[node.type]} ${isSelectable ? 'transform hover:scale-110 shadow-lg animate-pulse' : (isCompleted ? 'opacity-70 filter saturate-50' : 'opacity-40 cursor-not-allowed')}`}>
                                    <span className="text-2xl">{nodeIcons[node.type]}</span>
                                    <span className="text-[10px] font-bold">{nodeLabels[node.type]}</span>
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const TreasureModal: React.FC<{ player: Character, reward: MapNode['reward'], onClose: () => void, t: (key: any, params?: Record<string, string | number>) => string }> = ({ player, reward, onClose, t }) => {
    let message = '';
    if (reward?.gold) message = t('goldFound', { gold: reward.gold });
    else if (reward?.points) message = t('pointsFound', { points: reward.points });
    else if (reward?.item) message = t('itemFound', { itemName: reward.item.name });
    else if (reward?.consumable) message = t('consumableFound', { itemName: reward.consumable.name });

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-2xl border-2 border-yellow-400 p-8 shadow-lg max-w-md w-full animate-modal-fade-in text-center">
                <h2 className="text-4xl font-bold text-yellow-300 mb-4">{t('treasureFound')}</h2>
                <div className="text-8xl mb-4">🧰</div>
                <p className="text-xl text-gray-200 mb-6">{message}</p>
                <button onClick={onClose} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition-all text-xl">{t('continue')}</button>
            </div>
        </div>
    );
};

const LuckEventModal: React.FC<{ result: { type: string, details?: any }, onClose: () => void, t: (key: any, params?: Record<string, string | number>) => string }> = ({ result, onClose, t }) => {
    const content = useMemo(() => {
        switch (result.type) {
            case 'item': return { icon: result.details.item.icon, message: t('luckItemFound', { itemName: result.details.item.name, rarity: result.details.item.rarity }) };
            case 'gold': return { icon: '💰', message: t('luckGold', { gold: result.details.gold }) };
            case 'attribute': return { icon: '💪', message: t('luckAttribute', { statName: result.details.statName }) };
            case 'bossBuff': return { icon: '👹', message: t('luckBossBuff') };
            case 'elite': return { icon: '🔥', message: t('luckElite') };
            case 'trap': return { icon: '☠️', message: t('luckTrap', { hp: result.details.hp }) };
            case 'consumable': return { icon: '🧪', message: t('luckConsumable', { itemName: result.details.item.name }) };
            default: return { icon: '❓', message: '...' };
        }
    }, [result, t]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-2xl border-2 border-indigo-400 p-8 shadow-lg max-w-md w-full animate-modal-fade-in text-center">
                <h2 className="text-4xl font-bold text-indigo-300 mb-4">{t('luckEvent')}</h2>
                <div className="text-8xl mb-4">{content.icon}</div>
                <p className="text-xl text-gray-200 mb-6">{content.message}</p>
                <button onClick={onClose} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition-all text-xl">{t('continue')}</button>
            </div>
        </div>
    );
};



const ConfirmationModal: React.FC<{ title: string; message: string; onConfirm: () => void; onCancel: () => void; t: (key: any) => string; }> = ({ title, message, onConfirm, onCancel, t }) => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100] animate-modal-fade-in">
        <div className="bg-gray-800 rounded-2xl border-2 border-yellow-400 p-8 shadow-lg max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-yellow-300 mb-4">{title}</h2>
            <p className="text-gray-300 mb-8">{message}</p>
            <div className="flex justify-center gap-6">
                <button onClick={onCancel} className="px-10 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500 transition-all">{t('no')}</button>
                <button onClick={onConfirm} className="px-10 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500 transition-all">{t('yes')}</button>
            </div>
        </div>
    </div>
);

const ToggleSwitch: React.FC<{ id: string; checked: boolean; onChange: () => void; label: string; tooltip?: string; }> = ({ id, checked, onChange, label, tooltip }) => (
    <div className="flex items-center justify-between w-full bg-gray-700 p-3 rounded-lg">
        <div className="tooltip" style={{ display: 'inline-block' }}>
            <span className="text-gray-200 font-medium">{label}</span>
            {tooltip && <div className="tooltiptext" style={{ width: '260px', marginLeft: '-130px' }}>{tooltip}</div>}
        </div>
        <label htmlFor={id} className="flex items-center cursor-pointer">
            <div className="relative">
                <input type="checkbox" id={id} className="sr-only" checked={checked} onChange={onChange} />
                <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${checked ? 'transform translate-x-full bg-green-400' : ''}`}></div>
            </div>
        </label>
    </div>
);


const SettingsModal: React.FC<{
    t: (key: any, params?: any) => string;
    onClose: () => void;
    gameSpeed: number;
    setGameSpeed: (s: number | ((s: number) => number)) => void;
    autoDistribute: boolean;
    setAutoDistribute: (b: boolean) => void;
    autoSpendGold: boolean;
    setAutoSpendGold: (b: boolean) => void;
}> = ({ t, onClose, gameSpeed, setGameSpeed, autoDistribute, setAutoDistribute, autoSpendGold, setAutoSpendGold }) => {
    const [activeTab, setActiveTab] = useState('geral');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-2xl border-2 border-yellow-400 p-6 shadow-lg max-w-lg w-full animate-modal-fade-in flex flex-col">
                <h2 className="text-3xl font-bold text-center mb-4">{t('settingsTitle')}</h2>
                <div className="flex justify-center border-b-2 border-gray-600 mb-4">
                    <button onClick={() => setActiveTab('geral')} className={`px-6 py-2 text-lg font-bold transition-colors ${activeTab === 'geral' ? 'text-yellow-300 border-b-2 border-yellow-300' : 'text-gray-400 hover:text-yellow-200'}`}>{t('settingsGeneral')}</button>
                    <button onClick={() => setActiveTab('survival')} className={`px-6 py-2 text-lg font-bold transition-colors ${activeTab === 'survival' ? 'text-yellow-300 border-b-2 border-yellow-300' : 'text-gray-400 hover:text-yellow-200'}`}>{t('settingsSurvival')}</button>
                </div>

                <div className="space-y-4 h-48">
                    {activeTab === 'geral' && (
                        <div className="flex items-center justify-between bg-gray-700 p-4 rounded-lg">
                            <label className="text-lg font-medium">{t('speedControl')}</label>
                            <div className="flex items-center gap-4">
                                <button onClick={() => setGameSpeed(s => Math.max(1, s - 1))} className="w-10 h-10 bg-purple-700 rounded-full text-2xl">-</button>
                                <span className="text-xl font-bold w-12 text-center">{gameSpeed}x</span>
                                <button onClick={() => setGameSpeed(s => Math.min(3, s + 1))} className="w-10 h-10 bg-purple-700 rounded-full text-2xl">+</button>
                            </div>
                        </div>
                    )}
                    {activeTab === 'survival' && (
                        <div className='space-y-3'>
                            <ToggleSwitch id="auto-distribute-toggle" checked={autoDistribute} onChange={() => setAutoDistribute(!autoDistribute)} label={t('autoDistribute')} />
                            <ToggleSwitch id="auto-spend-gold-toggle" checked={autoSpendGold} onChange={() => setAutoSpendGold(!autoSpendGold)} label={t('autoSpendGold')} tooltip={t('autoSpendGoldTooltip')} />
                        </div>
                    )}
                </div>

                <div className="mt-8 flex justify-center">
                    <button onClick={onClose} className="px-8 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500 transition-all">{t('close')}</button>
                </div>
            </div>
        </div>
    );
};

export default App;
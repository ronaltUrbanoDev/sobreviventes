
import { Rarity, EquipmentItem, StatKey, Difficulty, MapNode, MapNodeType, EquipmentSlot, Consumable, FloorTheme, Character } from './types';
export type { EquipmentItem };

export const calculateXpToNextLevel = (level: number): number => {
    // Rebalanced XP curve based on user feedback. Formula: level^2 + 9*level
    return Math.round(Math.pow(level, 2) + level * 9);
};

export const STRINGS = {
    pt: {
        gameTitle: 'Sobrevivente da Masmorra',
        splashTitle: 'Bem-vindo ao Sobrevivente da Masmorra',
        splashSubtitle: 'Escolha seu herói, enfrente monstros e veja até onde consegue chegar!',
        splashButton: 'Começar Aventura',
        settings: 'Opções',
        modeSelectionTitle: 'Escolha seu Modo de Jogo',
        survival: 'Sobrevivência',
        story: 'Aventura',
        mastery: 'Maestria',
        survivalDesc: 'Enfrente ondas infinitas de inimigos, suba de nível e teste seus limites. Você tem 2 vidas extras.',
        storyDesc: 'Siga um caminho, enfrente desafios, encontre tesouros e derrote chefes poderosos.',
        masteryDesc: 'Jogue para ganhar Pontos de Maestria e fortalecer permanentemente seus heróis. O desafio final!',
        difficultyTitle: 'Selecione a Dificuldade',
        easy: 'Fácil',
        medium: 'Médio',
        hard: 'Difícil',
        impossible: 'Impossível',
        easyDesc: 'Inimigos mais fracos. Comece com 100 de ouro e 1 item comum.',
        mediumDesc: 'Uma experiência balanceada. Comece com 100 de ouro.',
        hardDesc: 'Inimigos mais fortes, melhores recompensas. Para jogadores experientes.',
        impossibleDesc: 'Um desafio brutal. Apenas para os mais corajosos.',
        heroSelectionTitle: 'Escolha seu Herói',
        selectHero: 'Selecionar',
        levelUpTitle: 'Você subiu de Nível!',
        levelUpMessage: 'Distribua seus',
        secondChanceTitle: 'Segunda Chance',
        secondChanceMessage: 'Use esses pontos para ficar mais forte!',
        points: 'pontos de atributo!',
        almostThere: 'Pronto para a Batalha!',
        almostThereMessage: 'Você distribuiu todos os seus pontos.',
        nextChallenge: 'Próximo Desafio',
        returnToMap: 'Voltar ao Mapa',
        tryAgain: 'Tentar Novamente',
        autoDistribute: 'Continuar Automaticamente',
        autoSpendGold: 'Gastar ouro automaticamente',
        autoSpendGoldTooltip: 'Ao sair da loja no modo Sobrevivência, compra e equipa automaticamente os melhores itens que você pode pagar.',
        decrease: 'Diminuir',
        increase: 'Aumentar',
        xpGained: 'XP Ganho',
        goldGained: 'Ouro Ganho',
        interest: 'Juros',
        battlePhase: 'Nível da Batalha',
        speedControl: 'Velocidade',
        goHome: 'Menu Principal',
        backToMenu: 'Voltar ao Menu',
        back: 'Voltar',
        battleStart: 'A batalha nível {level} começa! {pName} vs. {eName}!',
        newEnemyAppears: '{eName} (Nível {nextLevel}) aparece!',
        rematchReady: 'Revanche nível {level} pronta!',
        winner: 'O vencedor é {name}!',
        defeated: '{name} foi derrotado.',
        criticalHit: '💥 CRÍTICO! {attacker} ataca {defender} causando {damage} de dano!',
        normalHit: '⚔️ {attacker} ataca {defender} causando {damage} de dano.',
        missedHit: '💨 {attacker} errou o ataque em {defender}!',
        absorbDamage: '🛡️ {name} absorveu {amount} de dano!',
        determinationActivated: '🔥 A Determinação de {name} foi ativada! +{boost}{isPercent} em {statName}!',
        battleLogEntry: 'Turno {index}:',
        startBattle: 'Começar Batalha',
        battling: 'Batalhando...',
        youWereDefeated: 'Você foi derrotado!',
        useLifeToRetry: 'Você ainda tem vidas sobrando. Use uma para tentar novamente.',
        retryBonus: 'Você ganha pontos de atributo de bônus para ajudar!',
        continue: 'Continuar',
        giveUp: 'Desistir',
        gameOver: 'Fim de Jogo!',
        level: 'Nível',
        lives: 'Vidas',
        statLife: 'Vida',
        statVitality: 'Vitalidade',
        statLuck: 'Sorte',
        statMaxHp: 'Vida Máxima',
        statAttack: 'Ataque Físico',
        statMagicAttack: 'Ataque Mágico',
        statDefense: 'Defesa Física',
        statMagicDefense: 'Defesa Mágica',
        statSpeed: 'Velocidade',
        statPrecision: 'Precisão',
        statCrit: 'Chance de Crítico',
        statCritMultiplier: 'Multiplicador Crítico',
        statAbsorb: 'Chance de Absorção',
        statAbsorptionReduction: 'Redução de Absorção',
        storyMapTitle: 'Mapa da Aventura - Andar {level}',
        nodeBattle: 'Batalha',
        nodeElite: 'Batalha de Elite',
        nodeBoss: 'Chefe',
        nodeTreasure: 'Tesouro',
        nodeRest: 'Descanso',
        nodeShop: 'Loja',
        buy: 'Comprar',
        sell: 'Vender',
        nodeLuck: 'Sorte',
        nodeExit: 'Próximo Andar',
        nextFloorConfirmTitle: 'Próximo Andar',
        nextFloorConfirmMessage: 'Você sente uma brisa vindo da próxima sala. Deseja continuar?',
        nextFloorConfirmEnter: 'Entrar',
        nextFloorConfirmStay: 'Ficar',
        treasureFound: 'Tesouro Encontrado!',
        goldFound: 'Você encontrou {gold} de ouro!',
        pointsFound: 'Você encontrou {points} pontos de atributo!',
        itemFound: 'Você encontrou um item: {itemName}!',
        consumableFound: 'Você encontrou: {itemName}!',
        restMessage: 'Você descansa e recupera {hp} de vida.',
        close: 'Fechar',
        settingsTitle: 'Opções',
        settingsGeneral: 'Geral',
        settingsSurvival: 'Sobrevivência',
        shopTitle: 'Loja do Aventureiro',
        equipment: 'Equipamento',
        attributes: 'Atributos',
        backpack: 'Mochila',
        weapon: 'Arma',
        shield: 'Escudo',
        helmet: 'Capacete',
        armor: 'Armadura',
        boots: 'Botas',
        necklace: 'Colar',
        equipmentTitle: 'Inventário do Herói',
        luckEvent: 'Evento de Sorte',
        luckItemFound: 'Você encontrou um item: {itemName} ({rarity})!',
        luckGold: 'Você encontrou {gold} de ouro extra!',
        luckAttribute: 'Você se sente mais forte! +1 em {statName}!',
        luckElite: 'Uma energia sombria percorre o andar... Algumas batalhas se tornaram mais perigosas!',
        luckBossBuff: 'Você sente uma presença maligna se fortalecendo... O Chefe deste andar parece mais perigoso!',
        luckTrap: 'Você ativou uma armadilha e foi ferido, perdendo {hp} de vida!',
        luckConsumable: 'Você encontrou uma {itemName}!',
        useItem: 'Usar {itemName}',
        confirmUseItemTitle: 'Confirmar Uso',
        confirmUseItemMessage: 'Tem certeza que deseja usar {itemName}?',
        confirmGoHomeTitle: 'Confirmar Saída',
        confirmGoHomeMessage: 'Tem certeza que deseja voltar ao menu principal? Todo o progresso na aventura será perdido.',
        yes: 'Sim',
        no: 'No',
        formulas: 'Fórmulas',
        mechanicsTitle: 'Fórmulas do Jogo',
        mechanicsClose: 'Fechar',
        mechanicsVitalityTitle: 'Vitalidade (❤️‍🔥)',
        mechanicsVitalityDesc: 'Aumenta sua <strong>Vida Máxima</strong>. Cada ponto de vitalidade concede 9 de Vida. Este é o atributo principal para sobrevivência.',
        mechanicsAttackTitle: 'Ataque Físico (⚔️)',
        mechanicsAttackDesc: 'O principal atributo para dano físico. Cada ponto aumenta seu <strong>Ataque</strong> base, que é usado no cálculo de dano contra a <strong>Defesa Física</strong> do inimigo. Também contribui para sua <strong>Chance de Crítico</strong> e <strong>Dano Crítico</strong>.',
        mechanicsMagicAttackTitle: 'Ataque Mágico (✨)',
        mechanicsMagicAttackDesc: 'O principal atributo para dano mágico. Cada ponto aumenta seu <strong>Ataque Mágico</strong> base, que é usado no cálculo de dano contra a <strong>Defesa Mágica</strong> do inimigo. Também contribui para sua <strong>Chance de Crítico</strong> e <strong>Dano Crítico</strong>.',
        mechanicsDefenseTitle: 'Defesa Física (🛡️)',
        mechanicsDefenseDesc: 'Reduz o dano recebido de ataques físicos. Cada ponto aumenta sua <strong>Defesa Física</strong>, tornando-o mais resistente. Também contribui para sua <strong>Chance de Absorção</strong> e <strong>Redução de Dano</strong> de absorção.',
        mechanicsMagicDefenseTitle: 'Defesa Mágica (🔮)',
        mechanicsMagicDefenseDesc: 'Reduz o dano recebido de ataques mágicos. Cada ponto aumenta sua <strong>Defesa Mágica</strong>, tornando-o mais resistente. Também contribui para sua <strong>Chance de Absorção</strong> e <strong>Redução de Dano</strong> de absorção.',
        mechanicsSpeedTitle: 'Velocidade (💨)',
        mechanicsSpeedDesc: 'Determina a frequência com que seu herói ataca. Personagens mais rápidos realizam mais ações ao longo do tempo.',
        mechanicsLuckTitle: 'Sorte (🍀)',
        mechanicsLuckDesc: 'Aumenta ligeiramente a <strong>Chance de Crítico</strong>, a <strong>Chance de Absorção</strong> e a quantidade de <strong>Ouro</strong> que você ganha. Um atributo versátil que pode virar o jogo a seu favor.',
        mechanicsHitChanceTitle: 'Precisão e Chance de Acerto (👁️)',
        mechanicsHitChanceDesc: 'Sua chance de acertar um ataque é baseada na sua <strong>Precisão</strong> contra a <strong>Velocidade</strong> do oponente. A fórmula é:<br/><code>Chance = 100% + (Sua Precisão - Velocidade do Inimigo) * 1%</code>. A chance mínima é 25% e a máxima é 100%.',
        mechanicsDamageTitle: 'Cálculo de Dano',
        mechanicsDamageDesc: 'O dano é calculado com base no seu <strong>Ataque</strong> (Físico ou Mágico) contra a <strong>Defesa</strong> correspondente do inimigo. A fórmula é:<br/><code>Dano = Ataque * (Ataque / (Ataque + Defesa))</code>. Há uma pequena variação aleatória de +/- 15% no ataque base antes do cálculo.',
        mechanicsCritTitle: 'Crítico (💥)',
        mechanicsCritDesc: 'Ataques críticos causam dano aumentado. Sua <strong>Chance de Crítico</strong> é influenciada pelo seu Ataque Total e Sorte. O dano extra é determinado pelo seu <strong>Multiplicador Crítico</strong>, que também aumenta com o Ataque Total.',
        mechanicsAbsorbTitle: 'Absorção (🛡️)',
        mechanicsAbsorbDesc: 'Quando um ataque é absorvido, parte do dano é ignorada. Sua <strong>Chance de Absorção</strong> é influenciada pela sua Defesa Total e Sorte. A quantidade de dano reduzido é determinada pela sua <strong>Redução de Absorção</strong>, que também aumenta com a Defesa Total.',
        mechanicsDeterminationTitle: 'Determinação (🔥)',
        mechanicsDeterminationDesc: 'Quando sua vida fica abaixo de 30%, você tem uma chance de ativar a <strong>Determinação</strong>. Este efeito concede um bônus temporário e significativo a um de seus atributos de combate (Ataque, Defesa, Velocidade, etc.) pelo resto da batalha.',
        mechanicsLevelScalingTitle: 'Progressão de Nível',
        mechanicsLevelScalingDesc: 'Ao subir de nível, você ganha <strong>3 Pontos de Atributo</strong> para distribuir, e seus atributos secundários (Crítico, Absorção, Precisão) também recebem pequenos bônus passivos.',
        victoryTitle: 'Vitória!',
        victoryMessage: 'Você conquistou a masmorra! Parabéns, nobre aventureiro!',
        selectItem: 'Selecionar Item',
    },
    en: {
      // English translations can go here
        gameTitle: 'Dungeon Survivor',
        splashTitle: 'Welcome to Dungeon Survivor',
        splashSubtitle: 'Choose your hero, face monsters, and see how far you can go!',
        splashButton: 'Start Adventure',
        settings: 'Options',
        modeSelectionTitle: 'Choose Your Game Mode',
        survival: 'Survival',
        story: 'Adventure',
        mastery: 'Mastery',
        survivalDesc: 'Face endless waves of enemies, level up and test your limits. You have 2 extra lives.',
        storyDesc: 'Follow a path, face challenges, find treasures and defeat powerful bosses.',
        masteryDesc: 'Play to earn Mastery Points and permanently strengthen your heroes. The ultimate challenge!',
        difficultyTitle: 'Select Difficulty',
        easy: 'Easy',
        medium: 'Medium',
        hard: 'Hard',
        impossible: 'Impossible',
        easyDesc: 'Weaker enemies. Start with 100 gold and 1 common item.',
        mediumDesc: 'A balanced experience. Start with 100 gold.',
        hardDesc: 'Stronger enemies, better rewards. For experienced players.',
        impossibleDesc: 'A brutal challenge. Only for the bravest.',
        heroSelectionTitle: 'Choose Your Hero',
        selectHero: 'Select',
        levelUpTitle: 'You Leveled Up!',
        levelUpMessage: 'Distribute your',
        secondChanceTitle: 'Second Chance',
        secondChanceMessage: 'Use these points to become stronger!',
        points: 'attribute points!',
        almostThere: 'Ready for Battle!',
        almostThereMessage: 'You have distributed all your points.',
        nextChallenge: 'Next Challenge',
        returnToMap: 'Return to Map',
        tryAgain: 'Try Again',
        autoDistribute: 'Automatically Continue',
        autoSpendGold: 'Auto-spend gold',
        autoSpendGoldTooltip: 'When leaving the shop in Survival mode, automatically buys and equips the best items you can afford.',
        decrease: 'Decrease',
        increase: 'Increase',
        xpGained: 'XP Gained',
        goldGained: 'Gold Gained',
        interest: 'Interest',
        battlePhase: 'Battle Level',
        speedControl: 'Speed',
        goHome: 'Main Menu',
        backToMenu: 'Back to Menu',
        back: 'Back',
        battleStart: 'Battle level {level} begins! {pName} vs. {eName}!',
        newEnemyAppears: '{eName} (Level {nextLevel}) appears!',
        rematchReady: 'Rematch level {level} ready!',
        winner: 'The winner is {name}!',
        defeated: '{name} was defeated.',
        criticalHit: '💥 CRITICAL! {attacker} hits {defender} for {damage} damage!',
        normalHit: '⚔️ {attacker} hits {defender} for {damage} damage.',
        missedHit: '💨 {attacker} missed {defender}!',
        absorbDamage: '🛡️ {name} absorbed {amount} damage!',
        determinationActivated: '🔥 {name}\'s Determination activated! +{boost}{isPercent} to {statName}!',
        battleLogEntry: 'Turn {index}:',
        startBattle: 'Start Battle',
        battling: 'Battling...',
        youWereDefeated: 'You were defeated!',
        useLifeToRetry: 'You still have lives left.',
    }
};

export const getStatTranslationKey = (stat: StatKey): keyof typeof STRINGS.pt => {
    switch (stat) {
        case 'critChance': return 'statCrit';
        case 'absorptionChance': return 'statAbsorb';
        default:
            const defaultKey = `stat${stat.charAt(0).toUpperCase() + stat.slice(1)}`;
            return defaultKey as keyof typeof STRINGS.pt;
    }
}

export const RARITY_COLORS: Record<Rarity, string> = {
  Comum: 'text-gray-300',
  Raro: 'text-blue-400',
  Épico: 'text-purple-400',
  Lendário: 'text-orange-400',
  Único: 'text-red-400',
};

export const RARITY_BORDER_COLORS: Record<Rarity, string> = {
  Comum: 'border-gray-500',
  Raro: 'border-blue-500',
  Épico: 'border-purple-500',
  Lendário: 'border-orange-500',
  Único: 'border-red-500',
};

export const DIFFICULTY_MODS: Record<Difficulty, { multiplier: number, xpBonus: number, goldBonus: number, descriptionKey: keyof typeof STRINGS.pt }> = {
    easy:       { multiplier: 0.75, xpBonus: 0.8,  goldBonus: 1.0, descriptionKey: 'easyDesc' },
    medium:     { multiplier: 1.0,  xpBonus: 1.0,  goldBonus: 1.0, descriptionKey: 'mediumDesc' },
    hard:       { multiplier: 1.3,  xpBonus: 1.25, goldBonus: 1.2, descriptionKey: 'hardDesc' },
    impossible: { multiplier: 1.7,  xpBonus: 1.6,  goldBonus: 1.4, descriptionKey: 'impossibleDesc' },
};

export const ENEMY_LEVEL_SCALING_CONFIG: Record<Difficulty, { normal: number[], elite: number[], boss: number[] }> = {
    easy:       { normal: [8, 9], elite: [15, 16], boss: [30] },
    medium:     { normal: [6, 7], elite: [12, 13], boss: [25] },
    hard:       { normal: [4, 5], elite: [10, 11], boss: [20] },
    impossible: { normal: [3, 4], elite: [8, 9],  boss: [15] },
};


export const CONSUMABLE_ITEMS = {
    HEALING_POTION_S: {
        id: 'consumable-heal-s',
        name: 'Poção de Cura Pequena',
        description: 'Recupera 100 de vida.',
        icon: '🧪',
        effect: { type: 'HEAL_HP', amount: 100 }
    } as Consumable,
};

// =================================================================
// ITEM GENERATION
// =================================================================

const RARITY_PROBABILITY: Record<Rarity, number> = {
    Comum: 0.50,
    Raro: 0.35,
    Épico: 0.12,
    Lendário: 0.03,
    Único: 0, // Uniques are special drops
};

const RARITY_STAT_MULTIPLIERS: Record<Rarity, number> = {
    Comum: 1.0,
    Raro: 1.25,
    Épico: 1.6,
    Lendário: 2.1,
    Único: 1.0, // Unique items have manually set stats
};

const RARITY_COST_MULTIPLIERS: Record<Rarity, number> = {
    Comum: 1.0,
    Raro: 2.5,
    Épico: 5.0,
    Lendário: 12.0,
    Único: 25.0,
};

const RARITY_TO_NUM_STATS: Record<Rarity, number> = {
    Comum: 2,
    Raro: 3,
    Épico: 4,
    Lendário: 5,
    Único: 5,
};

const prefixes = {
    physical: ["Danificado", "Enferrujado", "Resistente", "Refinado", "Letal", "Brutal", "Divino"],
    magical: ["Fraco", "Instável", "Carregado", "Potente", "Arcano", "Etéreo", "Celestial"],
    neutral: ["Comum", "Sólido", "Superior", "Obra-prima", "Excepcional", "Magnífico", "Lendário"]
};

const baseNames: Record<EquipmentSlot, any> = {
    weapon: {
        physical: ["Espada Curta", "Machado de Batalha", "Maça de Guerra", "Adaga", "Lança", "Arco Curto", "Besta Leve"],
        magical: ["Cajado de Aprendiz", "Varinha de Faíscas", "Tomo Gasto", "Orbe de Energia"]
    },
    shield: ["Broquel", "Escudo Gota", "Escudo Torre", "Escudo com Espigões"],
    helmet: {
        physical: ["Capuz de Couro", "Elmo de Ferro", "Grande Elmo", "Elmo com Chifres"],
        magical: ["Chapéu de Mago", "Círculo Mágico", "Tiara Encantada", "Coroa Rúnica"]
    },
    armor: {
        physical: ["Armadura de Couro Batido", "Cota de Malha", "Armadura de Placas", "Brigantina"],
        magical: ["Robe de Linho", "Túnica Encantada", "Manto do Conjurador"]
    },
    boots: {
        physical: ["Botas de Couro", "Botas de Ferro", "Grevas de Placas", "Mocassins"],
        magical: ["Sapatos de Feiticeiro", "Botas do Silêncio", "Sandálias Etéreas"]
    },
    necklace: ["Amuleto da Vitalidade", "Pingente de Proteção", "Talismã da Rapidez", "Encanto da Sorte", "Colar de Precisão"]
};


export const generateEquipmentItems = (
    playerLevel: number, 
    count: number, 
    options: {
        forceRarity?: Rarity,
        forceUniqueOwner?: string,
        playerAttackType?: 'physical' | 'magical',
        floor?: number,
        isShop?: boolean
    } = {}
): EquipmentItem[] => {
    const items: EquipmentItem[] = [];

    for (let i = 0; i < count; i++) {
        const itemLevel = Math.max(1, playerLevel + Math.floor(Math.random() * 4 - 2) + (options.floor || 0));
        let rarity: Rarity;

        if (options.forceRarity) {
            rarity = options.forceRarity;
        } else {
            const rand = Math.random();
            let cumulative = 0;
            rarity = 'Lendário'; // fallback
            for (const r in RARITY_PROBABILITY) {
                const a_r = r as Rarity;
                cumulative += RARITY_PROBABILITY[a_r];
                if (rand < cumulative) {
                    rarity = a_r;
                    break;
                }
            }
        }
        
        // Handle Unique Item generation
        if (options.forceUniqueOwner) {
            const ownerKey = Object.keys(FLOOR_THEMES).find(key => FLOOR_THEMES[key as any].boss.name === options.forceUniqueOwner);
            if (ownerKey) {
                const theme = FLOOR_THEMES[ownerKey as any];
                const uniqueTemplate = theme.uniqueItem;
                 const uniqueStats: Partial<Record<StatKey, number>> = {};
                const statMultiplier = 1 + (itemLevel - 1) * 0.15;

                if(options.playerAttackType === 'physical') {
                    uniqueStats.attack = Math.floor(20 * statMultiplier);
                    uniqueStats.defense = Math.floor(10 * statMultiplier);
                } else {
                    uniqueStats.magicAttack = Math.floor(20 * statMultiplier);
                    uniqueStats.magicDefense = Math.floor(10 * statMultiplier);
                }
                uniqueStats.vitality = Math.floor(15 * statMultiplier);
                uniqueStats.speed = Math.floor(5 * statMultiplier);
                uniqueStats.luck = Math.floor(5 * statMultiplier);

                items.push({
                    id: `unique-${Date.now()}-${i}`,
                    name: uniqueTemplate.name,
                    slot: uniqueTemplate.slot,
                    icon: uniqueTemplate.icon,
                    description: `Um item poderoso deixado para trás por ${options.forceUniqueOwner}.`,
                    stats: uniqueStats,
                    rarity: 'Único',
                    cost: 300 * itemLevel,
                    uniqueOwner: options.forceUniqueOwner,
                });
                continue;
            }
        }
        
        const availableSlots: EquipmentSlot[] = ['weapon', 'shield', 'helmet', 'armor', 'boots', 'necklace'];
        const slot = availableSlots[Math.floor(Math.random() * availableSlots.length)];

        const itemCategory = options.playerAttackType || (Math.random() < 0.5 ? 'physical' : 'magical');
        
        let namePool: string[];
        const slotNames = baseNames[slot];
        if (typeof slotNames === 'object' && 'physical' in slotNames) {
            namePool = slotNames[itemCategory];
        } else {
            namePool = slotNames as string[];
        }
        const baseName = namePool[Math.floor(Math.random() * namePool.length)];

        const prefixPool = (itemCategory === 'physical' && (slot === 'weapon' || slot === 'armor')) 
            ? prefixes.physical 
            : (itemCategory === 'magical' && (slot === 'weapon' || slot === 'armor')) 
            ? prefixes.magical 
            : prefixes.neutral;
        const prefix = prefixPool[Math.floor(Math.random() * prefixPool.length)];
        const itemName = `${prefix} ${baseName}`;
        
        const itemStats: Partial<Record<StatKey, number>> = {};
        const rarityMultiplier = RARITY_STAT_MULTIPLIERS[rarity];
        const costMultiplier = RARITY_COST_MULTIPLIERS[rarity];
        
        const baseStatValue = (itemLevel * 0.3) + (Math.random() * itemLevel * 0.15) + 1;
        const finalStatValue = Math.max(1, Math.round(baseStatValue * rarityMultiplier));

        let statPool: StatKey[];
        let primaryStat: StatKey;
        
        if (itemCategory === 'physical') {
            statPool = ['attack', 'defense', 'speed', 'maxHp', 'precision', 'luck', 'vitality'];
            primaryStat = (slot === 'weapon') ? 'attack' : (slot === 'shield' || slot === 'armor' || slot === 'boots') ? 'defense' : 'maxHp';
        } else { // magical
            statPool = ['magicAttack', 'magicDefense', 'speed', 'maxHp', 'precision', 'luck', 'vitality'];
            primaryStat = (slot === 'weapon') ? 'magicAttack' : (slot === 'shield' || slot === 'armor' || slot === 'boots') ? 'magicDefense' : 'maxHp';
        }

        if (rarity === 'Épico' || rarity === 'Lendário') { statPool.push('critChance', 'absorptionChance'); }
        if (rarity === 'Lendário') { statPool.push('critMultiplier', 'absorptionReduction'); }
        
        itemStats[primaryStat] = finalStatValue;
        
        let remainingStats = RARITY_TO_NUM_STATS[rarity] - 1;
        while (remainingStats > 0 && statPool.length > 0) {
            const randomIndex = Math.floor(Math.random() * statPool.length);
            const randomStat = statPool.splice(randomIndex, 1)[0];
            
            if (randomStat !== primaryStat && !itemStats[randomStat]) {
                const statValueMultiplier = (randomStat === 'maxHp' || randomStat === 'vitality') ? 0.7 : 0.5;
                let value = Math.max(1, Math.round(finalStatValue * statValueMultiplier * (0.8 + Math.random() * 0.4)));

                if (randomStat === 'critChance' || randomStat === 'absorptionChance') {
                    value = parseFloat((value / 100 * 0.2).toFixed(3));
                } else if(randomStat === 'critMultiplier' || randomStat === 'absorptionReduction') {
                    value = parseFloat((value / 100 * 0.5).toFixed(3));
                }
                
                itemStats[randomStat] = value;
                remainingStats--;
            }
        }
        
        if (itemStats.maxHp && !itemStats.vitality) {
             itemStats.vitality = Math.round(itemStats.maxHp / 9);
             delete itemStats.maxHp;
        }

        const cost = Math.floor((10 * itemLevel + 20) * costMultiplier * (options.isShop ? 1.5 : 1));
        
        items.push({
            id: `${slot}-${Date.now()}-${i}`,
            name: itemName,
            description: '',
            slot,
            stats: itemStats,
            icon: '❓', // Will be replaced later
            cost: cost,
            rarity,
        });
    }
    
    // Assign icons based on slot and name
    return items.map(item => {
        let icon = '❓';
        if (item.slot === 'weapon') {
             if (item.name.includes('Espada')) icon = '🗡️';
             else if (item.name.includes('Machado')) icon = '🪓';
             else if (item.name.includes('Maça')) icon = '🔨';
             else if (item.name.includes('Adaga')) icon = '🔪';
             else if (item.name.includes('Lança')) icon = '🔱';
             else if (item.name.includes('Arco')) icon = '🏹';
             else if (item.name.includes('Besta')) icon = '🎯';
             else if (item.name.includes('Cajado')) icon = '🪄';
             else if (item.name.includes('Varinha')) icon = '✨';
             else icon = '⚔️';
        } else if (item.slot === 'shield') icon = '🛡️';
        else if (item.slot === 'helmet') icon = '⛑️';
        else if (item.slot === 'armor') icon = '🎽';
        else if (item.slot === 'boots') icon = '👢';
        else if (item.slot === 'necklace') icon = '💍';
        return { ...item, icon };
    });
};

// =================================================================
// MAP GENERATION
// =================================================================
export const generateStoryMap = (difficulty: Difficulty, floor: number): MapNode[] => {
    const map: MapNode[] = [];
    const numLevels = 10;
    const verticalSpread = 30;
    const theme = FLOOR_THEMES[floor] || FLOOR_THEMES[1];
    
    // Start Node
    const startNode: MapNode = {
        id: `node-${floor}-0-0`, type: 'REST', isCompleted: false, 
        x: 5, y: 50, level: floor, connections: [], rest: { hpPercentage: 1.0 }
    };
    map.push(startNode);

    let lastLevelNodes = [startNode];
    let nodeIdCounter = 1;

    // Generate intermediate levels
    for (let level = 1; level < numLevels - 1; level++) {
        const currentLevelNodes: MapNode[] = [];
        let createdNodesThisLevel = 0;
        
        lastLevelNodes.forEach(parentNode => {
            const numConnections = Math.random() < 0.4 ? 2 : 1;
            for (let i = 0; i < numConnections; i++) {
                if (createdNodesThisLevel >= 4) continue; // Limit nodes per level
                
                const randType = Math.random();
                let type: MapNodeType;
                if (randType < 0.55) type = 'BATTLE';
                else if (randType < 0.70) type = 'ELITE_BATTLE';
                else if (randType < 0.82) type = 'TREASURE';
                else if (randType < 0.90) type = 'REST';
                else if (randType < 0.96) type = 'SHOP';
                else type = 'LUCK';
                
                let enemyName: string | undefined;
                if (type === 'BATTLE') enemyName = theme.enemies[Math.floor(Math.random() * theme.enemies.length)].name;
                else if (type === 'ELITE_BATTLE') enemyName = theme.eliteEnemies[Math.floor(Math.random() * theme.eliteEnemies.length)].name;
                
                const newNode: MapNode = {
                    id: `node-${floor}-${level}-${nodeIdCounter++}`,
                    type, isCompleted: false,
                    x: (level * (90 / (numLevels - 1))) + 5,
                    y: parentNode.y + (Math.random() * verticalSpread * 2 - verticalSpread),
                    level: floor, connections: [],
                    enemyName,
                    rest: type === 'REST' ? { hpPercentage: 0.3 } : undefined
                };
                
                // Clamp Y position
                newNode.y = Math.max(10, Math.min(90, newNode.y));
                
                parentNode.connections.push(newNode.id);
                currentLevelNodes.push(newNode);
                createdNodesThisLevel++;
            }
        });

        if (currentLevelNodes.length === 0) {
            // Ensure at least one path forward
            const parent = lastLevelNodes[Math.floor(Math.random() * lastLevelNodes.length)];
            const newNode: MapNode = {
                id: `node-${floor}-${level}-${nodeIdCounter++}`, type: 'BATTLE', isCompleted: false,
                x: (level * (90 / (numLevels - 1))) + 5, y: 50, level: floor, connections: [],
                enemyName: theme.enemies[0].name
            };
            parent.connections.push(newNode.id);
            currentLevelNodes.push(newNode);
        }

        map.push(...currentLevelNodes);
        lastLevelNodes = currentLevelNodes;
    }

    // Boss Node
    const bossNode: MapNode = {
        id: `node-${floor}-boss`, type: 'BOSS', isCompleted: false,
        x: 95, y: 50, level: floor, connections: [],
        enemyName: theme.boss.name,
    };
    lastLevelNodes.forEach(node => node.connections.push(bossNode.id));
    map.push(bossNode);
    
    // Exit Node
    const exitNodeId = `node-${floor}-exit`;
    map.push({
        id: exitNodeId, type: 'EXIT', x: 105, y: 50, 
        isCompleted: false, level: floor, connections: [],
    });
    bossNode.connections.push(exitNodeId);

    return map;
};

// =================================================================
// ENEMY AND FLOOR DATA
// =================================================================
export type EnemyName = 'Esqueleto' | 'Aranha Gigante' | 'Goblin' | 'Morcego Vampiro' | 'Orc' | 'Ogro' | 'Necromante' | 'Golem de Pedra' | 'Dragão Vermelho';

export const ENEMY_DATA: Record<EnemyName, { avatar: string; attackType: 'physical' | 'magical'; vitality: number, attack: number, magicAttack: number, defense: number, magicDefense: number, speed: number }> = {
    'Esqueleto':       { avatar: '💀', attackType: 'physical', vitality: 10, attack: 12, magicAttack: 0,  defense: 8,  magicDefense: 5,  speed: 10 },
    'Aranha Gigante':  { avatar: '🕷️', attackType: 'physical', vitality: 8,  attack: 15, magicAttack: 0,  defense: 6,  magicDefense: 4,  speed: 14 },
    'Goblin':          { avatar: '👺', attackType: 'physical', vitality: 7,  attack: 10, magicAttack: 0,  defense: 5,  magicDefense: 3,  speed: 16 },
    'Morcego Vampiro': { avatar: '🦇', attackType: 'physical', vitality: 6,  attack: 8,  magicAttack: 5,  defense: 4,  magicDefense: 8,  speed: 20 },
    'Orc':             { avatar: '👹', attackType: 'physical', vitality: 15, attack: 18, magicAttack: 0,  defense: 12, magicDefense: 6,  speed: 8  },
    'Ogro':            { avatar: '🗿', attackType: 'physical', vitality: 20, attack: 22, magicAttack: 0,  defense: 18, magicDefense: 8,  speed: 6  },
    'Necromante':      { avatar: '🧛', attackType: 'magical',  vitality: 12, attack: 5,  magicAttack: 20, defense: 8,  magicDefense: 18, speed: 12 },
    'Golem de Pedra':  { avatar: '🧱', attackType: 'physical', vitality: 25, attack: 25, magicAttack: 0,  defense: 25, magicDefense: 10, speed: 4  },
    'Dragão Vermelho': { avatar: '🐉', attackType: 'magical',  vitality: 30, attack: 20, magicAttack: 30, defense: 22, magicDefense: 22, speed: 15 },
};

export const getEnemyData = (name: EnemyName) => ENEMY_DATA[name] || ENEMY_DATA['Esqueleto'];

export const FLOOR_THEMES: { [key: number]: FloorTheme } = {
    1: {
        name: 'Cripta Assombrada',
        backgroundUrl: 'https://img.freepik.com/premium-photo/dark-dungeon-with-arched-ceilings-torches-either-side_988349-1630.jpg?w=1060',
        enemies: [{name: 'Esqueleto', avatar: '💀'}, {name: 'Morcego Vampiro', avatar: '🦇'}],
        eliteEnemies: [{name: 'Necromante', avatar: '🧛'}],
        boss: { name: 'Ogro', avatar: '🗿', attackType: 'physical' },
        uniqueItem: { name: 'Quebra-Crânios do Ogro', slot: 'weapon', rarity: 'Único', icon: '🔨' }
    },
    2: {
        name: 'Ninho da Aranha',
        backgroundUrl: 'https://st.depositphotos.com/1000244/3110/i/450/depositphotos_31108253-stock-photo-fantasy-dungeon-interior.jpg',
        enemies: [{name: 'Aranha Gigante', avatar: '🕷️'}, {name: 'Goblin', avatar: '👺'}],
        eliteEnemies: [{name: 'Orc', avatar: '👹'}],
        boss: { name: 'Golem de Pedra', avatar: '🧱', attackType: 'physical' },
        uniqueItem: { name: 'Coração do Golem', slot: 'necklace', rarity: 'Único', icon: '💎' }
    },
    3: {
        name: 'Covil do Dragão',
        backgroundUrl: 'https://c4.wallpaperflare.com/wallpaper/479/812/34/dragon-lava-cave-art-wallpaper-preview.jpg',
        enemies: [{name: 'Orc', avatar: '👹'}, {name: 'Golem de Pedra', avatar: '🧱'}],
        eliteEnemies: [{name: 'Necromante', avatar: '🧛'}],
        boss: { name: 'Dragão Vermelho', avatar: '🐉', attackType: 'magical' },
        uniqueItem: { name: 'Escama do Dragão Vermelho', slot: 'armor', rarity: 'Único', icon: '🎽' }
    }
};
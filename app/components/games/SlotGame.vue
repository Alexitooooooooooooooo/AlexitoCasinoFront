<template>
    <div class="w-full h-[calc(100vh-150px)] md:h-[80vh] bg-surface-900 flex flex-col items-center justify-center relative overflow-hidden rounded-xl">
        
        <!-- Game Canvas Container -->
        <div ref="gameContainer" class="absolute inset-0 z-0 flex items-center justify-center bg-black">
        </div>

        <!-- UI Overlay -->
        <div class="absolute inset-x-0 bottom-4 z-10 flex justify-center pointer-events-none scale-75 md:scale-100 origin-bottom">
             <div class="bg-black/80 backdrop-blur-md rounded-full border border-surface-700 p-4 flex items-center gap-6 pointer-events-auto shadow-2xl">
                <!-- Balance -->
                 <div class="text-center min-w-[80px]">
                    <div class="text-[10px] text-surface-400 uppercase tracking-wider font-bold">Saldo</div>
                    <div class="text-xl font-bold text-yellow-500">{{ parseFloat(balance).toFixed(2) }}</div>
                 </div>

                 <!-- Win -->
                 <div class="text-center min-w-[80px]">
                     <div class="text-[10px] text-surface-400 uppercase tracking-wider font-bold">Ganancia</div>
                     <div class="text-xl font-bold text-green-400">{{ parseFloat(win).toFixed(2) }}</div>
                 </div>

                 <!-- Bet -->
                 <div class="text-center">
                     <div class="text-[10px] text-surface-400 uppercase tracking-wider font-bold mb-1">Apuesta</div>
                     <Select 
                        v-model="currentBet" 
                        :options="betOptions" 
                        class="!bg-surface-800 !text-white !border-surface-600 !h-10 w-24 !items-center !justify-center"
                        :pt="{ 
                            label: { class: '!text-white !font-bold' },
                            overlay: { class: '!bg-surface-800 !border-surface-700' },
                            option: { class: '!text-surface-200 hover:!bg-surface-700 focus:!bg-surface-700' }
                        }"
                    />
                 </div>

                 <!-- Spin Button -->
                 <Button 
                    label="GIRAR" 
                    class="!rounded-full !px-8 !py-3 !text-lg !font-black !tracking-wide hover:scale-105 active:scale-95 transition-transform" 
                    :class="{'opacity-50 cursor-not-allowed': running}"
                    severity="warn"
                    @click="handleSpin"
                    :disabled="running"
                 />
             </div>
        </div>
        
        <!-- Debug/Messages -->
        <div v-if="debugMsg" class="absolute top-4 left-4 z-20 bg-black/50 text-yellow-400 font-mono text-sm px-2 py-1 rounded">
             {{ debugMsg }}
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import Button from 'primevue/button';
import Select from 'primevue/select';
import * as PIXI from 'pixi.js';

const emit = defineEmits(['close']);
const client = useSanctumClient();
const { user } = useSanctumAuth(); 

const props = defineProps<{
    gameSlug: string; 
    endpoint: string; 
    gameId?: number; 
}>();

const data = ref({});
const userId = ref(0);
const gameConfigData = ref<any>(null);

// Computeds based on fetched config
const config = computed(() => gameConfigData.value?.config || {});
const VISIBLE_ROWS = computed(() => config.value.rows || 3);
const REEL_COUNT = computed(() => config.value.cols || 5);
const PAYLINES = computed(() => config.value.lines || []);
const SYMBOLS_LIST = computed(() => config.value.symbols || [1, 2, 3, 4, 5, 6]);

async function getData() {
    try {
        const res: any = await client('/me', { method: 'GET' });
        userId.value = res.user.id;
    } catch (e) {
        console.error("Error loading data:", e);
        debugMsg.value = "Error cargando datos";
    }
}

async function fetchGameConfig() {
    if (!props.gameId) return;
    try {
        debugMsg.value = "Cargando configuración...";
        const res: any = await client(`/slots/${props.gameId}`, { method: 'GET' });
        // Response format based on user provided JSON
        gameConfigData.value = res.data || res; 
        
        // Initialize bets based on config
        const min = Number(gameConfigData.value.min_bet) || 1;
        const max = Number(gameConfigData.value.max_bet) || 100;
        currentBet.value = min;
        
        // Generate filtered options
        const standardSteps = [1, 2, 5, 10, 20, 25, 50, 75, 100, 150, 200, 250, 500, 1000, 2000, 5000];
        let steps = standardSteps.filter(s => s >= min && s <= max);
        
        if (!steps.includes(min)) steps.unshift(min);
        if (!steps.includes(max)) steps.push(max);
        
        // Deduplicate and sort
        steps = [...new Set(steps)].sort((a, b) => a - b);
        betOptions.value = steps;

    } catch (e) {
        console.error("Error fetching game config:", e);
        debugMsg.value = "Error configuración";
    }
}

// Game State
const balance = ref(0);
const win = ref(0);
const currentBet = ref(10);
const betOptions = ref([1, 2, 5, 10, 20, 50, 100]); // Default before load

const running = ref(false);
const debugMsg = ref(`Cargando ${props.gameSlug}...`);
const gameContainer = ref<HTMLElement | null>(null);

// Pixi App Refs
let app: PIXI.Application | null = null;
let reels: any[] = [];
let tweening: any[] = [];
let slotContainer: PIXI.Container | null = null;
let paylinesLayer: PIXI.Container | null = null;

const REEL_WIDTH = 150;
const SYMBOL_SIZE = 150;

// Dynamic Asset Loading
const SYMBOL_TEXTURES: Record<number, string> = {};

async function chargeBalance() {
    try {
        if (!user.value?.id) {
             debugMsg.value = "Esperando usuario...";
        }
        const res: any = await client('/wallet/' + userId.value, { method: 'GET' });
        if (res.data && res.data.Balance !== undefined) {
             balance.value = Number(res.data.Balance);
        } else if (res.Balance !== undefined) {
             balance.value = Number(res.Balance);
        }
    } catch (e) {
        console.error("Error loading balance:", e);
        debugMsg.value = "Error cargando saldo";
    }
}

onMounted(async () => {
    await getData();
    await fetchGameConfig(); // Fetch config first
    await chargeBalance();
    
    // Only init Pixi if we have config or a fallback exists
    if (gameConfigData.value) {
        initPixi();
    } else {
        // Fallback for failed config or empty ID
        initPixi(); 
    }
});

onUnmounted(() => {
    if (app) {
        app.destroy(true, { children: true, texture: true, baseTexture: true });
        app = null;
    }
});

async function initPixi() {
    if (!gameContainer.value) return;

    app = new PIXI.Application();
    
    // Calculate size based on container
    const width = gameContainer.value.clientWidth;
    const height = gameContainer.value.clientHeight;

    await app.init({
        resizeTo: gameContainer.value, 
        backgroundColor: 0x111111,
        backgroundAlpha: 1,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        antialias: true,
        roundPixels: true
    });

    gameContainer.value.appendChild(app.canvas);

    const assetsToLoad = [];
    const baseUrl = `/games/${props.gameSlug}`;

    // Load dynamic symbols
    // SYMBOLS_LIST uses config.value.symbols
    for (const symId of SYMBOLS_LIST.value) {
        const key = `${props.gameSlug}_symbol_${symId}`;
        const url = `${baseUrl}/${'symbol_' + symId}.webp`;
        SYMBOL_TEXTURES[symId] = key; 
        
        // Check if exists to avoid warning/error
        if (!PIXI.Assets.cache.has(key)) {
            PIXI.Assets.add({ alias: key, src: url });
        }
        assetsToLoad.push(key);
    }

    const bgKey = `${props.gameSlug}_background`;
    if (!PIXI.Assets.cache.has(bgKey)) PIXI.Assets.add({ alias: bgKey, src: `${baseUrl}/background.webp` });
    assetsToLoad.push(bgKey);

    const titleKey = `${props.gameSlug}_title`;
    if (!PIXI.Assets.cache.has(titleKey)) PIXI.Assets.add({ alias: titleKey, src: `${baseUrl}/title.png` });
    assetsToLoad.push(titleKey);

    try {
        await PIXI.Assets.load(assetsToLoad);
        setupGame();
        debugMsg.value = `Listo. Juego: ${props.gameSlug}`;
    } catch (err) {
        console.error(err);
        debugMsg.value = "Error cargando recursos. Verifique rutas.";
    }
}

function setupGame() {
    if (!app) return;

    // Background
    try {
        const bgSprite = PIXI.Sprite.from(`${props.gameSlug}_background`);
        bgSprite.anchor.set(0.5);
        bgSprite.x = app.screen.width / 2;
        bgSprite.y = app.screen.height / 2;
        
        const scale = Math.max(
            app.screen.width / bgSprite.texture.width,
            app.screen.height / bgSprite.texture.height
        );
        bgSprite.scale.set(scale);
        app.stage.addChild(bgSprite);
    } catch (e) {
        const g = new PIXI.Graphics().rect(0, 0, app.screen.width, app.screen.height).fill(0x000000);
        app.stage.addChild(g);
    }

    // Slot Container
    slotContainer = new PIXI.Container();
    const desiredWidth = REEL_WIDTH * REEL_COUNT.value;
    const desiredHeight = SYMBOL_SIZE * VISIBLE_ROWS.value;
    
    const scaleFactor = Math.min(
        (app.screen.width * 0.9) / desiredWidth,
        (app.screen.height * 0.7) / desiredHeight
    );
    
    slotContainer.scale.set(scaleFactor);
    slotContainer.x = (app.screen.width - (desiredWidth * scaleFactor)) / 2;
    slotContainer.y = (app.screen.height - (desiredHeight * scaleFactor)) / 2;
    app.stage.addChild(slotContainer);

    // Title / Logo
    try {
        const title = PIXI.Sprite.from(`${props.gameSlug}_title`);
        title.anchor.set(0.5, 0.5); 
        const topGap = slotContainer.y;
        const targetY = topGap > 0 ? topGap / 2 : 50; 
        const maxHeight = Math.max(topGap * 0.9, 100); 
        const maxWidth = app.screen.width * 0.6;
        const scale = Math.min(maxWidth / title.width, maxHeight / title.height);
        
        title.scale.set(scale);
        title.x = app.screen.width / 2;
        title.y = targetY;
        app.stage.addChild(title);
    } catch(e) {}

    const reelsContainer = new PIXI.Container();
    slotContainer.addChild(reelsContainer);

    paylinesLayer = new PIXI.Container();
    
    // Panel
    const panelPadding = 20;
    const panel = new PIXI.Graphics();
    panel.roundRect(
        -panelPadding,
        -panelPadding,
        desiredWidth + panelPadding * 2,
        desiredHeight + panelPadding * 2,
        20
    ).fill({ color: 0x000000, alpha: 0.7 });
    reelsContainer.addChild(panel);

    // Mask
    const mask = new PIXI.Graphics();
    mask.rect(0, 0, desiredWidth, desiredHeight).fill(0xffffff);
    reelsContainer.mask = mask;
    reelsContainer.addChild(mask);

    // Reels
    for (let i = 0; i < REEL_COUNT.value; i++) {
        const rc = new PIXI.Container();
        rc.x = i * REEL_WIDTH;
        reelsContainer.addChild(rc);

        const reel = {
            container: rc,
            symbols: [] as PIXI.Sprite[],
            position: 0,
            previousPosition: 0,
            blur: new PIXI.BlurFilter(),
            isStopping: false,
            resultData: [] as number[],
            resultIndex: -1,
            stopTarget: 0
        };

        rc.filters = [reel.blur];

        for (let j = 0; j < (VISIBLE_ROWS.value + 2); j++) { 
            const rndId = SYMBOLS_LIST.value[Math.floor(Math.random() * SYMBOLS_LIST.value.length)];
            const key = `${props.gameSlug}_symbol_${rndId}`;
            // Use namespaced key for texture
            const textureName = SYMBOL_TEXTURES[rndId] || key;
            
            let symbol;
            try {
                symbol = PIXI.Sprite.from(textureName);
            } catch(e) {
                 // Fallback if texture missing
                 symbol = new PIXI.Graphics().rect(0,0,100,100).fill(0xFF0000);
            }

            symbol.anchor.set(0.5);
            symbol.x = REEL_WIDTH / 2;
            symbol.y = j * SYMBOL_SIZE + SYMBOL_SIZE / 2;
            
            const scale = Math.min(SYMBOL_SIZE / 150, SYMBOL_SIZE / 150) * 0.8;
            symbol.scale.set(scale);

            reel.symbols.push(symbol);
            rc.addChild(symbol);
        }
        reels.push(reel);
    }
    reelsContainer.addChild(paylinesLayer);

    app.ticker.add((delta) => {
        updateTweens();
        updateReels();
    });
}

function updateTweens() {
    const now = Date.now();
    const remove = [];
    for (let i = 0; i < tweening.length; i++) {
        const t = tweening[i];
        const phase = Math.min(1, (now - t.start) / t.time);
        t.object[t.property] = lerp(t.propertyBeginValue, t.target, t.easing(phase));
        if (t.change) t.change(t);
        if (phase === 1) {
            t.object[t.property] = t.target;
            if (t.complete) t.complete(t);
            remove.push(t);
        }
    }
    for (const item of remove) tweening.splice(tweening.indexOf(item), 1);
}

function updateReels() {
    for (let i = 0; i < reels.length; i++) {
        const r = reels[i];
        const diff = r.position - r.previousPosition;
        const speed = diff * 8;
        r.blur.blurY = speed;
        r.blur.enabled = Math.abs(speed) > 0.1;
        r.previousPosition = r.position;

        for (let j = 0; j < r.symbols.length; j++) {
            const s = r.symbols[j];
            const prevY = s.y;
            s.y = ((r.position + j) % r.symbols.length) * SYMBOL_SIZE - (SYMBOL_SIZE / 2);

            if (s.y < 0 && prevY > SYMBOL_SIZE) {
                if (r.isStopping) {
                     const finalTarget = Math.round(r.stopTarget ?? r.position); 
                     const finalSlot = (finalTarget + j) % r.symbols.length;
                     let textureId = null;
                     
                     // Dynamic Row Checking
                     for(let k=0; k < VISIBLE_ROWS.value; k++) {
                         if (finalSlot === (k + 1)) textureId = r.resultData[k];
                     }

                     if (textureId) {
                         try { s.texture = PIXI.Texture.from(`${props.gameSlug}_symbol_${textureId}`); } catch(e){}
                     } else {
                         const rndId = SYMBOLS_LIST.value[Math.floor(Math.random() * SYMBOLS_LIST.value.length)];
                         try { s.texture = PIXI.Texture.from(`${props.gameSlug}_symbol_${rndId}`); } catch(e){}
                     }
                } else {
                     const rndId = SYMBOLS_LIST.value[Math.floor(Math.random() * SYMBOLS_LIST.value.length)];
                     try { s.texture = PIXI.Texture.from(`${props.gameSlug}_symbol_${rndId}`); } catch(e){}
                }
                const scale = Math.min(SYMBOL_SIZE / s.texture.width, SYMBOL_SIZE / s.texture.height) * 0.8;
                s.scale.set(scale);
            }
        }
    }
}

async function handleSpin() {
    if (running.value) return;
    running.value = true;
    win.value = 0;
    debugMsg.value = "Girando...";

    try {
        const res: any = await client(`/slots/${props.endpoint}/spin/` + userId.value, {
            method: 'POST',
            body: { amount: currentBet.value }
        });
        const data = res.data || res;

        if ((data.success === false) || (!data.grid)) throw new Error(data.message || 'Error API');

        debugMsg.value = "Aterrizando...";
        startLandingAnimation(data);

    } catch (e: any) {
        console.error(e);
        debugMsg.value = "Error: " + (e.response?._data?.message || e.message);
        running.value = false;
    }
}

function startLandingAnimation(data: any) {
    const resultCols = [];
    for (let c = 0; c < REEL_COUNT.value; c++) {
        const col = [];
        for (let r = 0; r < VISIBLE_ROWS.value; r++) { col.push(data.grid[r][c]); }
        resultCols.push(col);
    }

    for (let i = 0; i < reels.length; i++) {
        const r = reels[i];
        r.isStopping = false;
        r.resultData = resultCols[i];
        
        const extraSpins = 4;
        const target = r.position + (r.symbols.length * extraSpins) + (i * 4);
        r.stopTarget = target;
        
        const duration = 2500 + (i * 400);

        tweenTo(
            r, 'position', target, duration, backout(0.4),
            (t: any) => { if (r.position >= t.target - 3.5 && !r.isStopping) r.isStopping = true; },
            (t: any) => {
                if (i === reels.length - 1) {
                    running.value = false;
                    if (data.balance_after !== undefined) balance.value = Number(data.balance_after);
                    if (data.win_amount !== undefined) win.value = Number(data.win_amount);
                    debugMsg.value = data.win_amount > 0 ? `¡GANASTE ${data.win_amount}! 🎉` : "Suerte para la próxima";
                    drawWinningLines(data);
                }
            }
        );
    }
}

function drawWinningLines(data: any) {
    if (!paylinesLayer || !Array.isArray(data.win_lines) || data.win_lines.length === 0) return;
    paylinesLayer.removeChildren();

    // Use passed paylines or dynamic ones
    const activePaylines = PAYLINES.value;

    data.win_lines.forEach((lineInfo: any, idx: number) => {
        const lineId = lineInfo.line;
        let coords = activePaylines[lineId];
        
        // Fallback for straight lines if not defined or mismatch
        if (!coords || coords.length !== REEL_COUNT.value) {
             if (lineId < VISIBLE_ROWS.value) coords = Array(REEL_COUNT.value).fill(lineId);
        }
        
        if (!coords) return;

        const g = new PIXI.Graphics();
        const colors = [0xffff00, 0x00ffe0, 0xffcc00, 0xff00ff, 0x00ff00];
        const color = colors[idx % colors.length];

        for (let c = 0; c < REEL_COUNT.value; c++) {
            const row = coords[c];
            const x = c * REEL_WIDTH + REEL_WIDTH / 2;
            const y = row * SYMBOL_SIZE + SYMBOL_SIZE / 2;
            if (c === 0) g.moveTo(x, y); else g.lineTo(x, y);
        }
        g.stroke({ width: 8, color: color, alpha: 0.8, cap: 'round', join: 'round' });
        
        // Draw dots
        for (let c = 0; c < REEL_COUNT.value; c++) {
            const row = coords[c];
            const x = c * REEL_WIDTH + REEL_WIDTH / 2;
            const y = row * SYMBOL_SIZE + SYMBOL_SIZE / 2;
            g.circle(x, y, 12).fill({ color: color, alpha: 1 });
        }

        paylinesLayer!.addChild(g);
    });

    setTimeout(() => { if (paylinesLayer && !paylinesLayer.destroyed) paylinesLayer.removeChildren(); }, 3000);
}

function lerp(a1: number, a2: number, t: number) { return a1 * (1 - t) + a2 * t; }
function backout(amount: number) { return (t: number) => (--t * t * ((amount + 1) * t + amount) + 1); }
function tweenTo(object: any, property: string, target: number, time: number, easing: any, onChange: any, onComplete: any) {
    const tween = { object, property, target, easing, time, change: onChange, complete: onComplete, propertyBeginValue: object[property], start: Date.now() };
    tweening.push(tween);
}
</script>

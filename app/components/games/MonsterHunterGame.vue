<template>
    <div class="w-full h-[600px] md:h-[80vh] bg-surface-900 flex flex-col items-center justify-center relative overflow-hidden rounded-xl">
        
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
import { ref, onMounted, onUnmounted } from 'vue';
import Button from 'primevue/button';
import Select from 'primevue/select';
import * as PIXI from 'pixi.js';

const emit = defineEmits(['close']);
const client = useSanctumClient();
const { user } = useSanctumAuth(); // Get logged in user


const data = ref({});

const id = ref(0);

async function getData() {
    try {
        const res: any = await client('/me', { method: 'GET' });
        id.value = res.user.id;
    } catch (e) {
        console.error("Error loading data:", e);
        debugMsg.value = "Error cargando datos";
    }
}


const props = defineProps<{
    gameName?: string;
    gameId?: number;
}>();

// Game State
const balance = ref(0);
const win = ref(0);
const currentBet = ref(10);
const betOptions = [2, 5, 10, 15, 20, 40, 50, 100];
const running = ref(false);
const debugMsg = ref('Cargando Monster Hunter...');
const gameContainer = ref<HTMLElement | null>(null);

// Pixi App Refs
let app: PIXI.Application | null = null;
let reels: any[] = [];
let tweening: any[] = [];
let slotContainer: PIXI.Container | null = null;
let paylinesLayer: PIXI.Container | null = null;

// Configs
const REEL_WIDTH = 150;
const SYMBOL_SIZE = 150;
const VISIBLE_ROWS = 3;
const REEL_COUNT = 5;

// Asset Map 
const SYMBOL_TEXTURES: Record<number, string> = {
    1: '/Slot/MHW-Icono_Rathalos.webp',
    2: '/Slot/MHW-Icono_Rathalos_Celeste.webp',
    3: '/Slot/MHWI-Icono_Rathalos_Plateado.webp',
    4: '/Slot/MHWI-Icono_Nargacuga.webp',
    5: '/Slot/MHW-Icono_Paolumu.webp',
    6: '/Slot/MHWI-Icono_Tigrex.webp'
};

// --- USER & BALANCE ---
async function chargeBalance() {
    try {
        if (!user.value?.id) {
             debugMsg.value = "Esperando usuario...";
        }
        const res: any = await client('/wallet/' + id.value, { method: 'GET' });
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
    await chargeBalance();
    initPixi();
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
        resizeTo: gameContainer.value, // Auto resizes to the div
        backgroundColor: 0x111111,
        backgroundAlpha: 1,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        antialias: true,
        roundPixels: true
    });

    gameContainer.value.appendChild(app.canvas);

    const assetsToLoad = [];
    for (const [key, url] of Object.entries(SYMBOL_TEXTURES)) {
        PIXI.Assets.add({ alias: key, src: url });
        assetsToLoad.push(key);
    }
    PIXI.Assets.add({ alias: 'fondo', src: '/Slot/fondo.webp' });
    assetsToLoad.push('fondo');
    PIXI.Assets.add({ alias: 'title', src: '/Slot/Name.png' });
    assetsToLoad.push('title');

    try {
        await PIXI.Assets.load(assetsToLoad);
        setupGame();
        debugMsg.value = `Listo. ID Jugador: ${id.value}`;
    } catch (err) {
        console.error(err);
        debugMsg.value = "Error recursos";
    }
}

function setupGame() {
    if (!app) return;

    // Background
    try {
        const bgSprite = PIXI.Sprite.from('fondo');
        bgSprite.anchor.set(0.5);
        bgSprite.x = app.screen.width / 2;
        bgSprite.y = app.screen.height / 2;
        
        // Cover logic
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

    // Slot Container (Scaled to fit)
    slotContainer = new PIXI.Container();
    const desiredWidth = REEL_WIDTH * REEL_COUNT;
    const desiredHeight = SYMBOL_SIZE * VISIBLE_ROWS;
    
    // Scale container to fit screen with padding
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
        const title = PIXI.Sprite.from('title');
        title.anchor.set(0.5, 0.5); 
        
        // Calculate available space above slots
        const topGap = slotContainer.y;
        
        // Ideally center in the top gap, but ensure it exists
        const targetY = topGap > 0 ? topGap / 2 : 50; 
        
        // Max height is 80% of the gap
        const maxHeight = Math.max(topGap * 0.9, 200); 
        const maxWidth = app.screen.width * 0.6;

        const scale = Math.min(
            maxWidth / title.width,
            maxHeight / title.height
        );
        
        title.scale.set(scale);
        title.x = app.screen.width / 2;
        title.y = targetY;
        
        app.stage.addChild(title);
    } catch(e) {
        console.error("Error adding title", e);
    }

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
    for (let i = 0; i < REEL_COUNT; i++) {
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

        for (let j = 0; j < 5; j++) {
            const keys = Object.keys(SYMBOL_TEXTURES);
            const rndKey = keys[Math.floor(Math.random() * keys.length)];
            const symbol = PIXI.Sprite.from(rndKey);

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
        
        // Fix for blur sticking: if very slow or stopped, snap to 0 and disable filter
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
                     if (finalSlot === 1) textureId = r.resultData[0];
                     else if (finalSlot === 2) textureId = r.resultData[1];
                     else if (finalSlot === 3) textureId = r.resultData[2];

                     if (textureId && SYMBOL_TEXTURES[textureId]) {
                         s.texture = PIXI.Texture.from(String(textureId));
                     } else {
                         const rnd = Object.keys(SYMBOL_TEXTURES)[Math.floor(Math.random() * Object.keys(SYMBOL_TEXTURES).length)];
                         s.texture = PIXI.Texture.from(String(rnd));
                     }
                } else {
                     const rnd = Object.keys(SYMBOL_TEXTURES)[Math.floor(Math.random() * Object.keys(SYMBOL_TEXTURES).length)];
                     s.texture = PIXI.Texture.from(String(rnd));
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
        const res: any = await client('/slots/monster_hunter/spin/' + id.value, {
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
    for (let c = 0; c < REEL_COUNT; c++) {
        const col = [];
        for (let r = 0; r < VISIBLE_ROWS; r++) { col.push(data.grid[r][c]); }
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

// Paylines definition (Standard 5x3 configuration)
const PAYLINES = [
    [0, 0, 0, 0, 0], // 0 Top
    [1, 1, 1, 1, 1], // 1 Middle
    [2, 2, 2, 2, 2], // 2 Bottom
    [0, 1, 2, 1, 0], // 3 V-Shape
    [2, 1, 0, 1, 2], // 4 Inverted V
    [0, 0, 1, 0, 0], // 5
    [2, 2, 1, 2, 2], // 6
    [1, 2, 2, 2, 1], // 7
    [1, 0, 0, 0, 1], // 8
    [0, 1, 1, 1, 0], // 9
    [2, 1, 1, 1, 2], // 10
];

function drawWinningLines(data: any) {
    if (!paylinesLayer || !Array.isArray(data.win_lines) || data.win_lines.length === 0) return;
    paylinesLayer.removeChildren();

    data.win_lines.forEach((lineInfo: any, idx: number) => {
        const lineId = lineInfo.line;
        // Default to middle line if undefined, or handle straight rows if < 3 and not in map (fallback)
        let coords = PAYLINES[lineId];
        
        // Fallback for simple row indices if not in PAYLINES map but valid row
        if (!coords && lineId < VISIBLE_ROWS) {
            coords = Array(REEL_COUNT).fill(lineId);
        }
        
        if (!coords) return; // Unknown line

        const g = new PIXI.Graphics();
        const colors = [0xffff00, 0x00ffe0, 0xffcc00, 0xff00ff, 0x00ff00];
        const color = colors[idx % colors.length];

        // Draw path
        for (let c = 0; c < REEL_COUNT; c++) {
            const row = coords[c];
            const x = c * REEL_WIDTH + REEL_WIDTH / 2;
            const y = row * SYMBOL_SIZE + SYMBOL_SIZE / 2;

            if (c === 0) g.moveTo(x, y);
            else g.lineTo(x, y);
        }

        g.stroke({ width: 8, color: color, alpha: 0.8, cap: 'round', join: 'round' });

        // Draw dots
        for (let c = 0; c < REEL_COUNT; c++) {
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

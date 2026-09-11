<script setup lang="ts">
import type { IPlayer } from '~/types/game';
import { useAudioSfx } from '~/composables/useAudioSfx';
import { useTranslation } from '~/composables/useTranslation';

const props = withDefaults(
  defineProps<{
    players: IPlayer[];
    selectedPlayerNumber: number | null;
    isSpinning: boolean;
    size?: number;
  }>(),
  {
    size: 520
  }
);

const emit = defineEmits<{
  (e: 'spinComplete', chosenPlayer: IPlayer): void;
}>();

const { playWheelTick } = useAudioSfx();
const { t } = useTranslation();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const currentRotation = ref(0);
const spinAnimationId = ref<number | null>(null);
const isLocallyAnimating = ref(false);

const alivePlayers = computed(() => {
  return props.players.filter((p) => p.status === 'ALIVE' || p.status === 'REVIVED');
});

watch(
  () => props.isSpinning,
  (newSpinning) => {
    if (newSpinning && alivePlayers.value.length > 0 && !isLocallyAnimating.value) {
      startSpinAnimation();
    }
  }
);

watch(
  () => props.selectedPlayerNumber,
  (newNum) => {
    if (props.isSpinning && newNum && !isLocallyAnimating.value) {
      startSpinAnimation();
    }
  }
);

watch(
  [() => alivePlayers.value, () => props.selectedPlayerNumber, () => props.size, () => props.isSpinning],
  () => {
    nextTick(() => {
      drawWheel();
    });
  },
  { deep: true, flush: 'post' }
);

function handleResize() {
  nextTick(() => {
    drawWheel();
  });
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleResize);
  }
  nextTick(() => {
    drawWheel();
  });
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', handleResize);
  }
  if (spinAnimationId.value) {
    cancelAnimationFrame(spinAnimationId.value);
  }
});

function drawWheel() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = width / 2 - 20;

  ctx.clearRect(0, 0, width, height);

  const list = alivePlayers.value;
  const count = list.length;

  if (count === 0) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#14141a';
    ctx.fill();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 16px "Cairo", "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(t('emptyLobbyMsg'), centerX, centerY);
    ctx.restore();
    return;
  }

  const arc = (Math.PI * 2) / count;

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(currentRotation.value);

  list.forEach((player, index) => {
    const angle = index * arc;
    const isChosen = props.selectedPlayerNumber === player.number && !props.isSpinning && !isLocallyAnimating.value;

    // Draw Wheel Segment Wedge
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, angle, angle + arc);
    ctx.closePath();

    if (isChosen) {
      ctx.fillStyle = '#6366f1'; // Bright Indigo
    } else if (index % 2 === 0) {
      ctx.fillStyle = '#141824'; // Dark Navy Slate
    } else {
      ctx.fillStyle = '#2e1065'; // Deep Indigo Violet
    }
    ctx.fill();

    ctx.strokeStyle = isChosen ? '#ffffff' : '#090a10';
    ctx.lineWidth = isChosen ? 3.5 : 2;
    ctx.stroke();

    // Draw Player Text (Radially aligned along spoke so letters are ALWAYS upright)
    ctx.save();
    const midAngle = angle + arc / 2;
    ctx.rotate(midAngle);

    ctx.fillStyle = isChosen ? '#ffffff' : index % 2 === 0 ? '#f8fafc' : '#e0e7ff';
    const fontSize = Math.max(12, Math.min(18, Math.floor(props.size / Math.max(count, 10))));
    ctx.font = `bold ${fontSize}px "Cairo", "Inter", sans-serif`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'right';

    const label = `#${player.number} ${player.displayName.substring(0, 13)}`;
    ctx.fillText(label, radius - 24, 0);
    ctx.restore();
  });

  // Center Tactical Hub
  ctx.beginPath();
  ctx.arc(0, 0, 48, 0, Math.PI * 2);
  ctx.fillStyle = '#0e111a';
  ctx.fill();
  ctx.strokeStyle = '#6366f1';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Center Emblem
  ctx.fillStyle = '#6366f1';
  ctx.font = '900 15px "Cairo", "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('CHATWAR', 0, 0);

  ctx.restore();

  // Outer Glowing Border Ring
  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius + 4, 0, Math.PI * 2);
  ctx.strokeStyle = '#4f46e5';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Outer Glowing Accent Studs
  const dotCount = Math.min(count * 2, 28);
  for (let i = 0; i < dotCount; i++) {
    const dotAngle = (i * (Math.PI * 2)) / dotCount;
    const dotX = centerX + (radius + 11) * Math.cos(dotAngle);
    const dotY = centerY + (radius + 11) * Math.sin(dotAngle);

    ctx.beginPath();
    ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
    ctx.fillStyle = i % 2 === 0 ? '#6366f1' : '#38bdf8';
    ctx.fill();
  }
  ctx.restore();
}

function startSpinAnimation() {
  const count = alivePlayers.value.length;
  if (count === 0) return;

  isLocallyAnimating.value = true;
  drawWheel();

  const arc = (Math.PI * 2) / count;
  let targetIndex = 0;

  if (props.selectedPlayerNumber) {
    const idx = alivePlayers.value.findIndex((p) => p.number === props.selectedPlayerNumber);
    if (idx !== -1) targetIndex = idx;
  }

  // Pointer is at Top (3 * Math.PI / 2, or 270 degrees)
  const spins = 5 + Math.floor(Math.random() * 3);
  const segmentOffset = targetIndex * arc + arc / 2;
  const targetRotation = spins * Math.PI * 2 + ((3 * Math.PI) / 2 - segmentOffset);

  const startRot = currentRotation.value % (Math.PI * 2);
  const totalDelta = targetRotation - startRot;

  const duration = 4000;
  const startTime = performance.now();
  let lastTickAngle = startRot;

  function animate(now: number) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const easeOut = 1 - Math.pow(1 - progress, 3);
    currentRotation.value = startRot + totalDelta * easeOut;

    if (Math.abs(currentRotation.value - lastTickAngle) >= arc) {
      playWheelTick(1 + (1 - progress) * 0.5);
      lastTickAngle = currentRotation.value;
    }

    drawWheel();

    if (progress < 1) {
      spinAnimationId.value = requestAnimationFrame(animate);
    } else {
      currentRotation.value = targetRotation;
      isLocallyAnimating.value = false;
      drawWheel();
      if (alivePlayers.value[targetIndex]) {
        emit('spinComplete', alivePlayers.value[targetIndex]);
      }
    }
  }

  spinAnimationId.value = requestAnimationFrame(animate);
}
</script>

<template>
  <div class="relative inline-flex flex-col items-center justify-center select-none transition-all duration-500 max-w-full">
    <!-- Top Pointer / Blade Indicator -->
    <div class="absolute -top-5 z-20 flex flex-col items-center drop-shadow-[0_0_20px_rgba(239,68,68,0.95)]">
      <div class="w-7 h-9 bg-arena-crimson rounded-full shadow-glow-crimson flex items-center justify-center border-2 border-white/80">
        <div class="w-2.5 h-2.5 bg-white rounded-full animate-ping" />
      </div>
      <div class="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[14px] border-t-arena-crimson -mt-1.5" />
    </div>

    <!-- Canvas Wheel Container -->
    <div
      class="relative p-3 rounded-full border-2 border-arena-borderLight/90 bg-arena-card/95 backdrop-blur-2xl shadow-glow-crimson transition-all duration-500 hover:shadow-glow-crimson-lg max-w-[92vw] max-h-[92vw]"
      :style="{ width: `${size + 28}px`, height: `${size + 28}px` }"
    >
      <canvas
        ref="canvasRef"
        :width="size"
        :height="size"
        class="rounded-full transition-transform w-full h-full object-contain"
      />
    </div>

    <!-- Active Selection Overlay Card -->
    <div
      v-if="selectedPlayerNumber && !isSpinning && !isLocallyAnimating"
      class="mt-4 px-8 py-3 bg-arena-cardHover/95 border-2 border-arena-crimson rounded-full shadow-glow-crimson animate-pulse flex items-center gap-3"
    >
      <span class="w-3 h-3 bg-arena-crimson rounded-full animate-ping" />
      <span class="font-cairo font-black text-base tracking-wider text-white">
        {{ t('turnOfPlayer') }} #{{ selectedPlayerNumber }}
      </span>
    </div>
  </div>
</template>

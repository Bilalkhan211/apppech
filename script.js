// --- CONSTANTS & CONFIGURATION ---
const PLEADING_TEXTS = [
    "No 💔",
    "Are you sure? 🥺",
    "Think again! 🌸",
    "Recalculating... 🤖",
    "What if I say please? 👉👈",
    "Pretty please? 🎀",
    "Don't do this to me... 😭",
    "Access Denied! 🚫",
    "Error 404: Choice not found",
    "But we are so cute together! 💕",
    "Change your mind! ✨",
    "Please? 🥺",
    "Still no? 💔"
];

// --- DOM ELEMENTS ---
const noBtn = document.getElementById("noBtn");
const yesBtn = document.getElementById("yesBtn");
const resetBtn = document.getElementById("resetBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const backToGalleryBtn = document.getElementById("backToGalleryBtn");
const musicToggle = document.getElementById("musicToggle");
const musicIconPlay = document.getElementById("musicIconPlay");
const musicIconMuted = document.getElementById("musicIconMuted");
const questionCard = document.getElementById("questionCard");
const successCard = document.getElementById("successCard");
const loveLetterCard = document.getElementById("loveLetterCard");
const questionText = document.getElementById("questionText");
const heartCanvas = document.getElementById("heartCanvas");

// --- STATE VARIABLES ---
let noClickCount = 0;
let isMusicPlaying = false;
let audioCtx = null;
let synth = null;

// --- CANVAS PARTICLE SYSTEM (HEARTS & CONFETTI) ---
const ctx = heartCanvas.getContext("2d");
let particles = [];
let mouse = { x: null, y: null };

// Resize canvas to cover screen
function resizeCanvas() {
    heartCanvas.width = window.innerWidth;
    heartCanvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Track mouse position for hover interaction
window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    
    // Periodically spawn small hearts/sparkles on mouse move
    if (Math.random() < 0.08) {
        spawnHeartParticle(mouse.x, mouse.y, true);
    }
});

// Particle Class
class Particle {
    constructor(x, y, isHeart = true, isConfetti = false) {
        this.x = x;
        this.y = y;
        this.isHeart = isHeart;
        this.isConfetti = isConfetti;
        
        if (isConfetti) {
            // Confetti physics: explosion velocity
            const angle = Math.random() * Math.PI * 2;
            const force = Math.random() * 8 + 4;
            this.vx = Math.cos(angle) * force;
            this.vy = Math.sin(angle) * force - 3; // Initial upward boost
            this.gravity = 0.15;
            this.size = Math.random() * 6 + 6;
            this.color = `hsl(${Math.random() * 360}, 90%, 65%)`;
            this.rotation = Math.random() * 360;
            this.rotationSpeed = Math.random() * 6 - 3;
            this.shape = Math.random() < 0.5 ? "circle" : "rect";
            this.alpha = 1;
            this.decay = Math.random() * 0.01 + 0.005;
        } else {
            // Floating Heart physics
            this.vx = Math.random() * 1 - 0.5;
            this.vy = -(Math.random() * 1.2 + 0.6);
            this.size = Math.random() * 14 + 8;
            this.alpha = Math.random() * 0.5 + 0.3;
            this.color = `hsl(${Math.random() * 15 + 345}, 100%, ${Math.random() * 15 + 70}%)`; // Soft pastel pinks/reds
            this.swaySpeed = Math.random() * 0.02 + 0.01;
            this.swayOffset = Math.random() * 100;
        }
    }

    update() {
        if (this.isConfetti) {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += this.gravity;
            this.vx *= 0.98; // Friction
            this.rotation += this.rotationSpeed;
            this.alpha -= this.decay;
        } else {
            this.y += this.vy;
            this.x += this.vx + Math.sin(this.y * this.swaySpeed + this.swayOffset) * 0.3;
            
            // Mouse interaction: push away slightly if close
            if (mouse.x && mouse.y) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) {
                    const force = (100 - dist) / 100;
                    this.x += (dx / dist) * force * 3;
                    this.y += (dy / dist) * force * 3;
                }
            }
        }
    }

    draw() {
        if (this.alpha <= 0) return;

        if (this.isConfetti) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate((this.rotation * Math.PI) / 180);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.alpha;
            
            if (this.shape === "circle") {
                ctx.beginPath();
                ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
            }
            ctx.restore();
        } else {
            drawHeartShape(this.x, this.y, this.size, this.color, this.alpha);
        }
    }
}

// Draw a beautiful vector heart shape
function drawHeartShape(x, y, size, color, alpha) {
    ctx.save();
    ctx.beginPath();
    ctx.translate(x, y);
    ctx.scale(size / 15, size / 15);
    ctx.moveTo(0, -3);
    // Draw heart curves
    ctx.bezierCurveTo(-5, -9, -13, -5, -13, 3);
    ctx.bezierCurveTo(-13, 10, -5, 15, 0, 21);
    ctx.bezierCurveTo(5, 15, 13, 10, 13, 3);
    ctx.bezierCurveTo(13, -5, 5, -9, 0, -3);
    
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.restore();
}

function spawnHeartParticle(x, y, isMouse = false) {
    particles.push(new Particle(x, y, true, false));
}

// Main background loop
function animateBackground() {
    ctx.clearRect(0, 0, heartCanvas.width, heartCanvas.height);
    
    // Spawn ambient hearts
    if (particles.filter(p => !p.isConfetti).length < 25 && Math.random() < 0.03) {
        particles.push(new Particle(Math.random() * heartCanvas.width, heartCanvas.height + 20, true, false));
    }
    
    // Update and draw particles
    particles = particles.filter(p => {
        p.update();
        p.draw();
        
        // Keep particles inside screen bounds or check confetti alpha decay
        if (p.isConfetti) {
            return p.alpha > 0;
        } else {
            return p.y > -30 && p.x > -30 && p.x < heartCanvas.width + 30;
        }
    });
    
    requestAnimationFrame(animateBackground);
}
animateBackground();

// Trigger Confetti Fountain from card location
function triggerConfettiBurst() {
    const cardRect = successCard.getBoundingClientRect();
    const burstX = cardRect.left + cardRect.width / 2;
    const burstY = cardRect.top + cardRect.height / 3;
    
    // Spawn a large amount of confetti particles
    for (let i = 0; i < 150; i++) {
        particles.push(new Particle(burstX, burstY, false, true));
    }
}

// --- WEB AUDIO API SYNTHESIZER ---
class CuteAudioSynth {
    constructor() {
        this.ctx = null;
        this.masterVolume = null;
        this.delayNode = null;
        this.feedbackNode = null;
        this.isPlaying = false;
        this.schedulerIntervalId = null;
        
        // Music progression sequence (120 BPM)
        this.tempo = 115;
        this.beatLength = 60 / this.tempo; // Duration of one beat in seconds
        this.eighthNoteLength = this.beatLength / 2;
        
        // Notes definition (frequencies)
        this.notes = {
            F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
            C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, Fs4: 369.99, G4: 392.00, A4: 440.00, B4: 493.88,
            C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
            C6: 1046.50, E6: 1318.51, G6: 1567.98, C7: 2093.00
        };
        
        // Romantic Royal progression arpeggio loop: IV -> V -> iii -> vi
        this.chordProgression = [
            // Measure 1: F Major 7
            ['F3', 'C4', 'E4', 'A4', 'C5', 'A4', 'E4', 'C4'],
            // Measure 2: G 7 / G Major
            ['G3', 'D4', 'Fs4', 'B4', 'D5', 'B4', 'Fs4', 'D4'],
            // Measure 3: E Minor 7
            ['E3', 'B3', 'D4', 'G4', 'B4', 'G4', 'D4', 'B3'],
            // Measure 4: A Minor 7
            ['A3', 'E4', 'G4', 'C5', 'E5', 'C5', 'G4', 'E4']
        ];
        
        this.currentChordIndex = 0;
        this.currentNoteIndex = 0;
        this.nextNoteTime = 0.0;
    }

    init() {
        if (this.ctx) return;
        
        // Create audio context
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create nodes
        this.masterVolume = this.ctx.createGain();
        this.masterVolume.gain.value = 0.08; // Gentle background volume
        
        // Cute echo delay loop
        this.delayNode = this.ctx.createDelay(1.0);
        this.delayNode.delayTime.value = this.eighthNoteLength * 1.5; // Sweet dotted beat echo
        
        this.feedbackNode = this.ctx.createGain();
        this.feedbackNode.gain.value = 0.35; // Soft echo volume decay
        
        // Connect echo effect
        this.delayNode.connect(this.feedbackNode);
        this.feedbackNode.connect(this.delayNode);
        
        // Connect sound routing
        this.delayNode.connect(this.masterVolume);
        this.masterVolume.connect(this.ctx.destination);
    }

    start() {
        this.init();
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        
        // Resume context if browser suspended it
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        
        this.currentChordIndex = 0;
        this.currentNoteIndex = 0;
        this.nextNoteTime = this.ctx.currentTime + 0.05;
        
        // Run scheduling engine
        this.schedulerIntervalId = setInterval(() => this.scheduler(), 50);
    }

    stop() {
        if (!this.isPlaying) return;
        this.isPlaying = false;
        clearInterval(this.schedulerIntervalId);
    }

    scheduler() {
        const scheduleAheadTime = 0.15; // Schedule notes 150ms ahead
        while (this.nextNoteTime < this.ctx.currentTime + scheduleAheadTime) {
            this.scheduleNote(this.currentChordIndex, this.currentNoteIndex, this.nextNoteTime);
            this.advanceNote();
        }
    }

    advanceNote() {
        this.currentNoteIndex++;
        if (this.currentNoteIndex >= 8) {
            this.currentNoteIndex = 0;
            this.currentChordIndex = (this.currentChordIndex + 1) % this.chordProgression.length;
        }
        this.nextNoteTime += this.eighthNoteLength;
    }

    scheduleNote(chordIdx, noteIdx, time) {
        if (!this.isPlaying) return;
        
        const noteName = this.chordProgression[chordIdx][noteIdx];
        const freq = this.notes[noteName];
        if (!freq) return;

        // Create oscillator for music box feel (gentle sound)
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'triangle'; // Smooth rounded cute tone
        osc.frequency.setValueAtTime(freq, time);
        
        // Soft envelope: fast attack, slow ring decay
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.5, time + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.8);
        
        // Connect to direct volume output and delay line
        osc.connect(gain);
        gain.connect(this.masterVolume);
        gain.connect(this.delayNode);
        
        osc.start(time);
        osc.stop(time + 0.9);
    }

    // Play high-pitched happy level up chime on YES
    playSuccessChime() {
        this.init();
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        
        const now = this.ctx.currentTime;
        const chimeNotes = ['C5', 'E5', 'G5', 'C6', 'E6', 'G6', 'C7'];
        const delayBetween = 0.06; // Arpeggio delay
        
        chimeNotes.forEach((noteName, i) => {
            const freq = this.notes[noteName];
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            // Combination of sine and triangle for pure crystal-like tone
            osc.type = i % 2 === 0 ? 'sine' : 'triangle';
            osc.frequency.setValueAtTime(freq, now + i * delayBetween);
            
            gain.gain.setValueAtTime(0, now + i * delayBetween);
            gain.gain.linearRampToValueAtTime(0.8, now + i * delayBetween + 0.005);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * delayBetween + 0.5);
            
            osc.connect(gain);
            
            // Higher volume level for success fanfare
            const successGainNode = this.ctx.createGain();
            successGainNode.gain.value = 0.12;
            successGainNode.connect(this.ctx.destination);
            
            gain.connect(successGainNode);
            gain.connect(this.delayNode);
            
            osc.start(now + i * delayBetween);
            osc.stop(now + i * delayBetween + 0.6);
        });
    }
}

// Instantiate Synth
synth = new CuteAudioSynth();

// Toggle Audio Playback
function toggleMusic() {
    if (isMusicPlaying) {
        synth.stop();
        musicIconPlay.classList.add("hidden");
        musicIconMuted.classList.remove("hidden");
        isMusicPlaying = false;
    } else {
        synth.start();
        musicIconPlay.classList.remove("hidden");
        musicIconMuted.classList.add("hidden");
        isMusicPlaying = true;
    }
}

musicToggle.addEventListener("click", toggleMusic);

// --- INTERACTIVE BUTTON DYNAMICS ---

// Relocate the NO button smoothly and logically
function fleeNoButton() {
    noClickCount++;
    
    // Update button text to pleading phrases
    const textIdx = Math.min(noClickCount, PLEADING_TEXTS.length - 1);
    noBtn.textContent = PLEADING_TEXTS[textIdx];

    // Calculate maximum displacement area
    // Constrain within viewport padding to avoid button jumping off-screen
    const padding = 20;
    const maxX = window.innerWidth - noBtn.offsetWidth - padding * 2;
    const maxY = window.innerHeight - noBtn.offsetHeight - padding * 2;

    // We calculate a random spot that is NOT too close to the current cursor
    let targetX = Math.random() * maxX + padding;
    let targetY = Math.random() * maxY + padding;
    
    if (mouse.x !== null && mouse.y !== null) {
        // If random spot is too close to mouse, push it further away
        let dist = Math.sqrt(Math.pow(targetX - mouse.x, 2) + Math.pow(targetY - mouse.y, 2));
        let attempts = 0;
        while (dist < 150 && attempts < 10) {
            targetX = Math.random() * maxX + padding;
            targetY = Math.random() * maxY + padding;
            dist = Math.sqrt(Math.pow(targetX - mouse.x, 2) + Math.pow(targetY - mouse.y, 2));
            attempts++;
        }
    }

    // Set absolute positioning variables relative to viewport
    noBtn.style.position = "fixed";
    noBtn.style.left = targetX + "px";
    noBtn.style.top = targetY + "px";

    // Progressively scale the buttons: Make YES huge, and NO tiny
    const scaleFactorYes = 1 + noClickCount * 0.22;
    const scaleFactorNo = Math.max(0.4, 1 - noClickCount * 0.08);

    yesBtn.style.transform = `scale(${scaleFactorYes})`;
    noBtn.style.transform = `scale(${scaleFactorNo})`;
    
    // Add extra padding to the YES button container to handle the sizing growth
    if (noClickCount > 4) {
        yesBtn.style.zIndex = "10"; // Keep YES overlaying everything if it gets gigantic
    }
    
    // Spawn playful heart explosions near the NO button as it flees
    const rect = noBtn.getBoundingClientRect();
    for(let i=0; i<3; i++) {
        spawnHeartParticle(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
}

// Set up both mouse hover and mobile touch listeners for the fleeing behavior
noBtn.addEventListener("mouseover", fleeNoButton);
noBtn.addEventListener("click", (e) => {
    e.preventDefault();
    fleeNoButton();
});

// YES Button Event - Switch to Success celebration
yesBtn.addEventListener("click", () => {
    // Stop ambient synth music & trigger success sound
    if (isMusicPlaying) {
        synth.stop();
    }
    synth.playSuccessChime();

    // Trigger success music after the fanfare ends
    setTimeout(() => {
        if (isMusicPlaying) {
            synth.start();
        }
    }, 800);

    // Hide question card and show success card with elegant glass flip transition
    questionCard.classList.add("hidden-exit");
    
    setTimeout(() => {
        questionCard.classList.add("hidden");
        successCard.classList.remove("hidden");
        
        // Delay visual active scaling for neat 3D reveal
        setTimeout(() => {
            successCard.classList.add("active-enter");
            // Blow confetti
            triggerConfettiBurst();
        }, 50);
    }, 400);
});

// Reset Proposal Flow
resetBtn.addEventListener("click", () => {
    // Reset state counters
    noClickCount = 0;
    
    // Reset button states
    yesBtn.style.transform = "scale(1)";
    yesBtn.style.zIndex = "2";
    noBtn.style.transform = "scale(1)";
    noBtn.textContent = PLEADING_TEXTS[0];
    
    // Put NO button back into its normal flow inside the button group
    noBtn.style.position = "absolute";
    noBtn.style.left = "calc(50% + 10px)";
    noBtn.style.top = "auto";

    // Hide love letter card too if visible
    loveLetterCard.classList.remove("active-enter");
    loveLetterCard.classList.add("hidden");

    // Reveal question card & hide success card with transition
    successCard.classList.remove("active-enter");
    
    setTimeout(() => {
        successCard.classList.add("hidden");
        questionCard.classList.remove("hidden");
        
        setTimeout(() => {
            questionCard.classList.remove("hidden-exit");
        }, 50);
    }, 400);
});

// --- PAGE 2 → PAGE 3: Next Page (Love Letter) ---
nextPageBtn.addEventListener("click", () => {
    // Flip success card out
    successCard.classList.remove("active-enter");

    setTimeout(() => {
        successCard.classList.add("hidden");
        loveLetterCard.classList.remove("hidden");

        setTimeout(() => {
            loveLetterCard.classList.add("active-enter");
        }, 50);
    }, 400);
});

// --- PAGE 3 → PAGE 2: Back to Gallery ---
backToGalleryBtn.addEventListener("click", () => {
    loveLetterCard.classList.remove("active-enter");

    setTimeout(() => {
        loveLetterCard.classList.add("hidden");
        successCard.classList.remove("hidden");

        setTimeout(() => {
            successCard.classList.add("active-enter");
        }, 50);
    }, 400);
});

const CONFIG = window.APP_CONFIG;

const WISHES = CONFIG.wishes;

let currentWishIndex = 0;

let wishInterval = null;

let confettiAnimationId = null;

let heartInterval = null;

let isMusicPlaying = false;

let useFallbackTone = false;

let audioContext = null;

let musicInterval = null;

let scrollObserver = null;
let isOpening = false;

const elements = {
  introScreen: document.getElementById("intro-screen"),
  celebration: document.getElementById("celebration"),
  launchFlash: document.getElementById("launch-flash"),
  envelope: document.getElementById("open-envelope"),
  envelopeScene: document.getElementById("envelope-scene"),
  envelopeSparkles: document.getElementById("envelope-sparkles"),
  introPetals: document.getElementById("intro-petals"),
  ageCounter: document.getElementById("age-counter"),
  rotatingWish: document.getElementById("rotating-wish"),
  musicToggle: document.getElementById("music-toggle"),
  confettiCanvas: document.getElementById("confetti-canvas"),
  birthdayMusic: document.getElementById("birthday-music"),
  floatingHearts: document.getElementById("floating-hearts"),
  wishDots: document.querySelectorAll(".wish-dot"),
};

function openCelebration() {
  if (isOpening) return;
  isOpening = true;

  elements.envelope.classList.add("is-opening", "open");
  burstEnvelopeSparkles();
  trackVisit("abrio_sobre");

  setTimeout(() => {
    elements.introScreen.classList.add("is-exiting");
  }, 650);

  setTimeout(() => {
    elements.introScreen.classList.add("hidden");
    elements.introScreen.classList.remove("is-exiting");
    elements.celebration.classList.remove("hidden");
    playLaunchFlash();
    startCelebration();
    isOpening = false;
  }, 1400);
}

function burstEnvelopeSparkles() {
  const container = elements.envelopeSparkles;
  if (!container) return;

  container.innerHTML = "";
  const count = 14;

  for (let i = 0; i < count; i++) {
    const sparkle = document.createElement("span");
    sparkle.className = "envelope-sparkle";
    sparkle.style.left = "50%";
    sparkle.style.top = "45%";
    const angle = (Math.PI * 2 * i) / count;
    const distance = 40 + Math.random() * 50;
    sparkle.style.setProperty("--tx", `${Math.cos(angle) * distance}px`);
    sparkle.style.setProperty("--ty", `${Math.sin(angle) * distance}px`);
    container.appendChild(sparkle);
  }
}

function initIntroPetals() {
  const container = elements.introPetals;
  if (!container) return;

  const petals = ["🌸", "✿", "🩷", "·"];

  function spawnPetal() {
    const petal = document.createElement("span");
    petal.className = "intro-petal";
    petal.textContent = petals[Math.floor(Math.random() * petals.length)];
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.animationDuration = `${8 + Math.random() * 8}s`;
    petal.style.animationDelay = `${Math.random() * 2}s`;
    container.appendChild(petal);
    setTimeout(() => petal.remove(), 18000);
  }

  for (let i = 0; i < 6; i++) spawnPetal();
  setInterval(spawnPetal, 2200);
}

function initIntroParallax() {
  const scene = elements.envelopeScene;
  if (!scene || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  window.addEventListener("mousemove", (event) => {
    if (isOpening) return;
    const x = (event.clientX / window.innerWidth - 0.5) * 12;
    const y = (event.clientY / window.innerHeight - 0.5) * 8;
    scene.style.transform = `rotateY(${x * 0.4}deg) rotateX(${-y * 0.3}deg)`;
  });
}

function playLaunchFlash() {
  elements.launchFlash.classList.add("play");

  setTimeout(() => {
    elements.launchFlash.classList.remove("play");
  }, 900);
}

function startCelebration() {
  elements.celebration.classList.add("is-active");

  animateAgeCounter();

  startWishRotation();

  fireConfettiBurst();

  startConfetti();

  startFloatingHearts();

  initScrollReveal();

  window.scrollTo({
    top: 0,
    behavior: "instant" in window ? "instant" : "auto",
  });
}

function stopCelebration() {
  if (wishInterval) {
    clearInterval(wishInterval);

    wishInterval = null;
  }

  if (confettiAnimationId) {
    cancelAnimationFrame(confettiAnimationId);

    confettiAnimationId = null;
  }

  if (heartInterval) {
    clearInterval(heartInterval);

    heartInterval = null;
  }

  stopMusic();
}

function animateAgeCounter() {
  const targetAge = CONFIG.age;

  const duration = 1800;

  const startTime = Date.now();

  function update() {
    const elapsed = Date.now() - startTime;

    const progress = Math.min(elapsed / duration, 1);

    const easeProgress = 1 - Math.pow(1 - progress, 3);

    elements.ageCounter.textContent = Math.floor(easeProgress * targetAge);

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      elements.ageCounter.textContent = targetAge;

      elements.ageCounter.classList.add("age-pop");
    }
  }

  update();
}

function startWishRotation() {
  currentWishIndex = 0;

  showWish();

  wishInterval = setInterval(() => {
    currentWishIndex = (currentWishIndex + 1) % WISHES.length;

    showWish();
  }, 4500);
}

function showWish() {
  const wishElement = elements.rotatingWish;

  wishElement.style.opacity = "0";

  wishElement.style.transform = "translateY(12px) scale(0.98)";

  setTimeout(() => {
    wishElement.textContent = WISHES[currentWishIndex];

    wishElement.style.opacity = "1";

    wishElement.style.transform = "translateY(0) scale(1)";

    updateWishDots();
  }, 350);
}

function updateWishDots() {
  elements.wishDots.forEach((dot, index) => {
    dot.classList.toggle("active", index === currentWishIndex % 3);
  });
}

function initScrollReveal() {
  if (scrollObserver) {
    scrollObserver.disconnect();
  }

  scrollObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },

    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
  );

  document.querySelectorAll(".reveal-scroll").forEach((el) => {
    scrollObserver.observe(el);
  });
}

function startFloatingHearts() {
  const hearts = ["💕", "💖", "💗", "🌸", "✨"];

  function spawnHeart() {
    const heart = document.createElement("span");

    heart.className = "float-heart";

    heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];

    heart.style.left = `${Math.random() * 100}%`;

    heart.style.fontSize = `${0.8 + Math.random() * 0.8}rem`;

    heart.style.animationDuration = `${5 + Math.random() * 4}s`;

    elements.floatingHearts.appendChild(heart);

    setTimeout(() => heart.remove(), 9000);
  }

  spawnHeart();

  heartInterval = setInterval(spawnHeart, 1400);
}

const confettiColors = [
  "#ff6b9d",
  "#ffa8d5",
  "#ffd6a5",
  "#ffc8dd",
  "#ffffff",
  "#c06c84",
];

let confettiParticles = [];

class ConfettiParticle {
  constructor(canvas, options = {}) {
    this.canvas = canvas;

    this.isBurst = options.isBurst || false;

    this.reset(options);

    if (!this.isBurst) {
      this.y = Math.random() * canvas.height;
    }
  }

  reset(options = {}) {
    if (this.isBurst && options.burst) {
      this.x = options.x ?? this.canvas.width / 2;

      this.y = options.y ?? this.canvas.height * 0.35;

      const angle = Math.random() * Math.PI * 2;

      const speed = Math.random() * 8 + 4;

      this.speedX = Math.cos(angle) * speed;

      this.speedY = Math.sin(angle) * speed - 3;

      this.gravity = 0.12;

      this.life = 1;

      this.decay = Math.random() * 0.012 + 0.008;
    } else {
      this.x = Math.random() * this.canvas.width;

      this.y = -10;

      this.speedY = Math.random() * 3 + 2;

      this.speedX = Math.random() * 2 - 1;

      this.gravity = 0;

      this.life = 1;

      this.decay = 0;
    }

    this.size = Math.random() * 8 + 4;

    this.color =
      confettiColors[Math.floor(Math.random() * confettiColors.length)];

    this.rotation = Math.random() * 360;

    this.rotationSpeed = Math.random() * 12 - 6;

    this.opacity = Math.random() * 0.5 + 0.5;
  }

  update() {
    this.y += this.speedY;

    this.x += this.speedX;

    this.speedY += this.gravity;

    this.rotation += this.rotationSpeed;

    if (this.isBurst) {
      this.life -= this.decay;

      this.opacity = this.life;
    }

    if (!this.isBurst && this.y > this.canvas.height + 10) {
      this.reset();
    }
  }

  isDead() {
    return this.isBurst && this.life <= 0;
  }

  draw(ctx) {
    if (this.opacity <= 0) return;

    ctx.save();

    ctx.translate(this.x, this.y);

    ctx.rotate((this.rotation * Math.PI) / 180);

    ctx.globalAlpha = this.opacity;

    ctx.fillStyle = this.color;

    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size / 2);

    ctx.restore();
  }
}

function setupCanvas() {
  const canvas = elements.confettiCanvas;

  canvas.width = window.innerWidth;

  canvas.height = window.innerHeight;
}

function fireConfettiBurst() {
  const canvas = elements.confettiCanvas;

  const burstCount = 80;

  for (let i = 0; i < burstCount; i++) {
    confettiParticles.push(
      new ConfettiParticle(canvas, {
        isBurst: true,

        burst: true,

        x: canvas.width / 2 + (Math.random() - 0.5) * 200,

        y: canvas.height * 0.32,
      }),
    );
  }
}

function startConfetti() {
  const canvas = elements.confettiCanvas;

  const ctx = canvas.getContext("2d");

  const particleCount = Math.min(100, Math.floor(window.innerWidth / 14));

  for (let i = 0; i < particleCount; i++) {
    confettiParticles.push(new ConfettiParticle(canvas));
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    confettiParticles = confettiParticles.filter(
      (particle) => !particle.isDead(),
    );

    confettiParticles.forEach((particle) => {
      particle.update();

      particle.draw(ctx);
    });

    confettiAnimationId = requestAnimationFrame(animate);
  }

  animate();
}

function playBirthdayTone() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  const notes = [264, 264, 297, 264, 352, 330, 264, 264, 297, 264, 396, 352];

  let noteIndex = 0;

  function playNote() {
    if (!isMusicPlaying) return;

    const oscillator = audioContext.createOscillator();

    const gainNode = audioContext.createGain();

    oscillator.type = "sine";

    oscillator.frequency.value = notes[noteIndex % notes.length];

    gainNode.gain.value = 0.08;

    oscillator.connect(gainNode);

    gainNode.connect(audioContext.destination);

    oscillator.start();

    oscillator.stop(audioContext.currentTime + 0.45);

    noteIndex += 1;
  }

  playNote();

  musicInterval = setInterval(playNote, 500);
}

function stopMusic() {
  isMusicPlaying = false;

  elements.musicToggle.classList.remove("is-playing");

  elements.birthdayMusic.pause();

  elements.birthdayMusic.currentTime = 0;

  if (musicInterval) {
    clearInterval(musicInterval);

    musicInterval = null;
  }
}

function toggleMusic() {
  if (isMusicPlaying) {
    stopMusic();

    return;
  }

  if (useFallbackTone) {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    isMusicPlaying = true;

    elements.musicToggle.classList.add("is-playing");

    playBirthdayTone();

    return;
  }

  const playPromise = elements.birthdayMusic.play();

  if (playPromise === undefined) return;

  playPromise

    .then(() => {
      isMusicPlaying = true;

      elements.musicToggle.classList.add("is-playing");
    })

    .catch(() => {
      isMusicPlaying = false;

      elements.musicToggle.classList.remove("is-playing");
    });
}

function setupMusic() {
  elements.birthdayMusic.src = CONFIG.musicFile;

  elements.birthdayMusic.load();

  elements.birthdayMusic.addEventListener("error", () => {
    useFallbackTone = true;
  });
}

elements.envelope.addEventListener("click", openCelebration);

elements.envelope.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();

    openCelebration();
  }
});

elements.musicToggle.addEventListener("click", toggleMusic);

window.addEventListener("resize", setupCanvas);

setupCanvas();
setupMusic();
initIntroPetals();
initIntroParallax();
trackVisit("visita");
showWish();
updateWishDots();

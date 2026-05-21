const canvas = document.querySelector("#black-field");
const ctx = canvas.getContext("2d");
const cursor = document.querySelector(".cursor");
const heroTitle = document.querySelector(".hero-title");
const typedRole = document.querySelector("#typed-role");

const pointer = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
  active: false,
};

let width = 0;
let height = 0;
let dpr = 1;
let shards = [];

function resizeCanvas() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const count = Math.min(72, Math.max(30, Math.floor((width * height) / 24000)));
  shards = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.22,
    vy: (Math.random() - 0.5) * 0.22,
    length: 24 + Math.random() * 82,
    alpha: 0.04 + Math.random() * 0.12,
    angle: Math.random() * Math.PI,
  }));
}

function drawField() {
  ctx.clearRect(0, 0, width, height);

  for (const shard of shards) {
    const dx = pointer.x - shard.x;
    const dy = pointer.y - shard.y;
    const distance = Math.hypot(dx, dy);

    if (pointer.active && distance < 210) {
      shard.vx -= dx * 0.000012;
      shard.vy -= dy * 0.000012;
      shard.angle += 0.004;
    }

    shard.x += shard.vx;
    shard.y += shard.vy;
    shard.vx *= 0.998;
    shard.vy *= 0.998;

    if (shard.x < -140) shard.x = width + 140;
    if (shard.x > width + 140) shard.x = -140;
    if (shard.y < -140) shard.y = height + 140;
    if (shard.y > height + 140) shard.y = -140;

    const endX = shard.x + Math.cos(shard.angle) * shard.length;
    const endY = shard.y + Math.sin(shard.angle) * shard.length;

    ctx.strokeStyle = `rgba(255, 255, 255, ${shard.alpha})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(shard.x, shard.y);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }

  requestAnimationFrame(drawField);
}

function setupCursor() {
  window.addEventListener("pointermove", (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
    cursor.classList.add("is-active");
    cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;
  });

  window.addEventListener("pointerleave", () => {
    pointer.active = false;
    cursor.classList.remove("is-active");
  });
}

function setupReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll("[data-reveal]").forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index * 55, 330)}ms`;
    observer.observe(element);
  });
}

function setupTilt() {
  document.querySelectorAll("[data-tilt]").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${y * -6}deg) rotateY(${x * 8}deg) translateY(-3px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

function setupMagnetic() {
  document.querySelectorAll(".magnetic").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      element.style.transform = `translate(${x * 0.14}px, ${y * 0.18}px)`;
      cursor.classList.add("is-hovering");
    });

    element.addEventListener("pointerleave", () => {
      element.style.transform = "";
      cursor.classList.remove("is-hovering");
    });
  });
}

function setupTyping() {
  const words = [
    "frontend / backend developer",
    "product engineer",
    "api + interface",
    "T-Bank now",
  ];
  let wordIndex = 0;
  let charIndex = words[0].length;
  let deleting = true;

  window.setInterval(() => {
    if (deleting) {
      charIndex -= 1;
      if (charIndex <= 2) {
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
      }
    } else {
      charIndex += 1;
      if (charIndex >= words[wordIndex].length) {
        deleting = true;
      }
    }

    typedRole.textContent = words[wordIndex].slice(0, charIndex);
  }, 88);
}

function setupHeroName() {
  const sourceName = heroTitle.dataset.name || heroTitle.textContent;
  const rawName = sourceName.replace(/\s+/g, " ").trim().toUpperCase();

  heroTitle.textContent = "";
  heroTitle.dataset.text = rawName;
  heroTitle.style.setProperty("--title-chars", Math.max(rawName.length, 6));

  const line = document.createElement("span");
  line.className = "title-line";

  const word = document.createElement("span");
  word.className = "title-word";
  word.textContent = rawName;

  line.append(word);
  heroTitle.append(line);
}

function setupScrollProgress() {
  const update = () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    document.documentElement.style.setProperty("--scroll", progress.toFixed(4));
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();
drawField();
setupCursor();
setupReveal();
setupTilt();
setupMagnetic();
setupHeroName();
setupTyping();
setupScrollProgress();

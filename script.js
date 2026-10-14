document.documentElement.classList.add("js");

const select = (selector, root = document) => root.querySelector(selector);
const selectAll = (selector, root = document) => [...root.querySelectorAll(selector)];

// Compact mobile navigation.
const menuToggle = select("#menuToggle");
const primaryNav = select("#primaryNav");
if (menuToggle && primaryNav) {
  const closeMenu = () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    primaryNav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  };
  menuToggle.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") !== "true";
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    primaryNav.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
  });
  selectAll("a", primaryNav).forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) closeMenu();
  });
}

// Reading progress, reflected in the top rule and the navigation state.
const topProgress = select("#scrollProgress");
const headerProgress = select("#headerProgress");
let scrollTicking = false;
function updateScrollProgress() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const amount = maxScroll > 0 ? Math.min(100, Math.max(0, (window.scrollY / maxScroll) * 100)) : 0;
  if (topProgress) topProgress.style.width = `${amount}%`;
  if (headerProgress) headerProgress.style.width = `${amount}%`;
  scrollTicking = false;
}
window.addEventListener("scroll", () => {
  if (!scrollTicking) {
    window.requestAnimationFrame(updateScrollProgress);
    scrollTicking = true;
  }
}, { passive: true });
updateScrollProgress();

const revealItems = selectAll(".reveal");
if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const navigationLinks = selectAll(".nav-link");
const pageSections = selectAll("[data-section]");
if ("IntersectionObserver" in window && navigationLinks.length) {
  const sectionObserver = new IntersectionObserver((entries) => {
    const active = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!active) return;
    navigationLinks.forEach((link) => {
      const current = link.getAttribute("href") === `#${active.target.id}`;
      link.classList.toggle("is-current", current);
    });
  }, { threshold: [0.12, 0.28, 0.48], rootMargin: "-18% 0px -58% 0px" });
  pageSections.forEach((section) => sectionObserver.observe(section));
}

// The calculator screenshot picker works like a little mode switcher.
const calcImage = select("#calcImage");
const calcModeLabel = select("#calcModeLabel");
const modeButtons = selectAll(".mode-button");
modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!calcImage) return;
    modeButtons.forEach((item) => {
      const selected = item === button;
      item.classList.toggle("is-active", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    calcImage.classList.add("is-changing");
    window.setTimeout(() => {
      calcImage.src = button.dataset.src;
      calcImage.alt = button.dataset.alt || "Scientific Calculator Pro screenshot";
      if (calcModeLabel) calcModeLabel.textContent = button.dataset.label || "";
      calcImage.onload = () => calcImage.classList.remove("is-changing");
      if (calcImage.complete) calcImage.classList.remove("is-changing");
    }, 110);
  });
});

// Pakistan Standard Time, useful when coordinating across time zones.
const clock = select("#pkClock");
function updatePakistanClock() {
  if (!clock) return;
  try {
    const now = new Intl.DateTimeFormat("en-PK", {
      timeZone: "Asia/Karachi",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
    clock.textContent = now.format(new Date());
  } catch (_) {
    clock.textContent = "UTC+5";
  }
}
updatePakistanClock();
window.setInterval(updatePakistanClock, 30_000);

// The contact form deliberately opens the visitor's email app; there is no form backend.
const contactForm = select("#contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;
    const fields = new FormData(contactForm);
    const name = String(fields.get("name") || "").trim();
    const email = String(fields.get("email") || "").trim();
    const message = String(fields.get("message") || "").trim();
    const subject = `Portfolio hello from ${name}`;
    const body = `${message}\n\n— ${name}\n${email}`;
    const mailto = `mailto:khannmat12@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  });
}

// A small, self-contained arcade intermission. It only animates after the visitor launches it.
(() => {
  const canvas = select("#gameCanvas");
  const screen = select("#gameScreen");
  const overlay = select("#gameOverlay");
  const launchButton = select("#gameStart");
  const scoreValue = select("#scoreValue");
  const gemValue = select("#gemValue");
  const bestValue = select("#bestValue");
  const gameStatus = select("#gameStatus");
  const overlayKicker = select("#overlayKicker");
  const overlayTitle = select("#overlayTitle");
  const overlayCopy = select("#overlayCopy");
  const flash = select("#gameFlash");
  if (!canvas || !screen || !overlay || !launchButton) return;

  const context = canvas.getContext("2d");
  if (!context) return;
  const keys = { left: false, right: false };
  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let animationFrame = 0;
  let stars = [];
  let pointerTarget = null;
  let bestScore = 0;
  try { bestScore = Number(window.localStorage.getItem("nemat-asteroid-dodge-best")) || 0; } catch (_) { bestScore = 0; }

  const game = {
    mode: "idle",
    score: 0,
    gemsCollected: 0,
    elapsed: 0,
    rockClock: 0,
    gemClock: 0,
    rocks: [],
    gems: [],
    particles: [],
    player: { x: 0, y: 0, radius: 11, trail: 0 },
    lastTime: 0
  };

  if (bestValue) bestValue.textContent = String(bestScore).padStart(3, "0");

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    width = rect.width;
    height = rect.height;
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    game.player.y = height - 39;
    if (!game.player.x || game.player.x > width) game.player.x = width / 2;
    stars = Array.from({ length: Math.max(38, Math.floor(width / 7)) }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.25 + .25,
      a: Math.random() * .55 + .15,
      drift: Math.random() * 12 + 3
    }));
    drawGame();
  }

  function drawGame() {
    if (!width || !height) return;
    context.clearRect(0, 0, width, height);
    context.fillStyle = "#090c10";
    context.fillRect(0, 0, width, height);

    // Quiet grid, like a test environment waiting for input.
    context.save();
    context.strokeStyle = "rgba(217,245,83,.075)";
    context.lineWidth = 1;
    const gridSize = 46;
    for (let x = 0; x <= width; x += gridSize) {
      context.beginPath(); context.moveTo(x, 0); context.lineTo(x, height); context.stroke();
    }
    for (let y = 0; y <= height; y += gridSize) {
      context.beginPath(); context.moveTo(0, y); context.lineTo(width, y); context.stroke();
    }
    context.restore();

    for (const star of stars) {
      context.globalAlpha = star.a;
      context.fillStyle = "#e7e9d8";
      context.beginPath(); context.arc(star.x, star.y, star.r, 0, Math.PI * 2); context.fill();
    }
    context.globalAlpha = 1;

    // Slow star drift gives the empty state a pulse too.
    if (game.mode === "idle") {
      context.save();
      context.globalAlpha = .23;
      context.strokeStyle = "#d9f553";
      context.setLineDash([2, 7]);
      context.beginPath(); context.moveTo(width * .18, height * .22); context.lineTo(width * .82, height * .22); context.stroke();
      context.restore();
    }

    game.rocks.forEach((rock) => {
      context.save();
      context.translate(rock.x, rock.y);
      context.rotate(rock.spin);
      context.beginPath();
      for (let i = 0; i < rock.points.length; i++) {
        const angle = (Math.PI * 2 * i) / rock.points.length;
        const radius = rock.radius * rock.points[i];
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 0) context.moveTo(x, y); else context.lineTo(x, y);
      }
      context.closePath();
      context.fillStyle = "rgba(240,107,75,.13)";
      context.strokeStyle = "rgba(240,107,75,.88)";
      context.lineWidth = 1.3;
      context.shadowColor = "rgba(240,107,75,.24)";
      context.shadowBlur = 12;
      context.fill(); context.stroke();
      context.restore();
    });

    game.gems.forEach((gem) => {
      context.save();
      context.translate(gem.x, gem.y);
      context.rotate(gem.turn);
      context.shadowColor = "rgba(217,245,83,.75)";
      context.shadowBlur = 13;
      context.fillStyle = "#d9f553";
      context.strokeStyle = "#f2ffc1";
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(0, -gem.radius);
      context.lineTo(gem.radius * .7, 0);
      context.lineTo(0, gem.radius);
      context.lineTo(-gem.radius * .7, 0);
      context.closePath();
      context.fill(); context.stroke();
      context.restore();
    });

    game.particles.forEach((particle) => {
      context.globalAlpha = Math.max(0, particle.life / particle.maxLife);
      context.fillStyle = particle.color;
      context.beginPath(); context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2); context.fill();
    });
    context.globalAlpha = 1;

    // Little shuttle: a sharp silhouette and an ember-colored exhaust.
    const player = game.player;
    context.save();
    context.translate(player.x || width / 2, player.y || height - 39);
    context.shadowColor = "rgba(217,245,83,.45)";
    context.shadowBlur = 17;
    context.fillStyle = "#f06b4b";
    context.beginPath();
    context.moveTo(-4, 8); context.lineTo(0, 18 + Math.random() * 5); context.lineTo(4, 8); context.closePath();
    context.fill();
    context.shadowColor = "rgba(217,245,83,.8)";
    context.shadowBlur = 14;
    context.fillStyle = "#d9f553";
    context.strokeStyle = "#f5ffd0";
    context.lineWidth = 1.2;
    context.beginPath();
    context.moveTo(0, -15); context.lineTo(12, 11); context.lineTo(4, 7); context.lineTo(0, 10); context.lineTo(-4, 7); context.lineTo(-12, 11); context.closePath();
    context.fill(); context.stroke();
    context.restore();
  }

  function updateScore() {
    game.score = Math.floor(game.elapsed * 10) + game.gemsCollected * 25;
    if (scoreValue) scoreValue.textContent = String(game.score).padStart(3, "0");
    if (gemValue) gemValue.textContent = String(game.gemsCollected).padStart(2, "0");
  }

  function spawnRock() {
    const radius = 12 + Math.random() * 15;
    const pointCount = 7 + Math.floor(Math.random() * 4);
    const points = Array.from({ length: pointCount }, () => .72 + Math.random() * .45);
    game.rocks.push({
      x: radius + Math.random() * Math.max(1, width - radius * 2),
      y: -radius - 8,
      radius,
      speed: 132 + Math.random() * 82 + Math.min(118, game.elapsed * 3.5),
      vx: (Math.random() - .5) * 38,
      spin: Math.random() * 6,
      spinSpeed: (Math.random() - .5) * 1.6,
      points
    });
  }

  function spawnGem() {
    const radius = 7 + Math.random() * 3;
    game.gems.push({
      x: 18 + Math.random() * Math.max(1, width - 36),
      y: -20,
      radius,
      speed: 116 + Math.random() * 44,
      turn: Math.random() * 6
    });
  }

  function addBurst(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 24 + Math.random() * 100;
      const life = .25 + Math.random() * .5;
      game.particles.push({
        x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        radius: 1 + Math.random() * 2, color, life, maxLife: life
      });
    }
  }

  function endGame() {
    game.mode = "over";
    if (game.score > bestScore) {
      bestScore = game.score;
      try { window.localStorage.setItem("nemat-asteroid-dodge-best", String(bestScore)); } catch (_) { /* local storage is optional */ }
    }
    if (bestValue) bestValue.textContent = String(bestScore).padStart(3, "0");
    if (gameStatus) gameStatus.textContent = "RUN ENDED";
    if (overlayKicker) overlayKicker.textContent = "COLLISION DETECTED";
    if (overlayTitle) overlayTitle.innerHTML = "One more?";
    if (overlayCopy) overlayCopy.textContent = `Score ${game.score}. You collected ${game.gemsCollected} gem${game.gemsCollected === 1 ? "" : "s"}.`;
    launchButton.innerHTML = 'Run it back <span aria-hidden="true">↗</span>';
    overlay.classList.remove("is-hidden");
    if (flash) {
      flash.classList.remove("hit");
      void flash.offsetWidth;
      flash.classList.add("hit");
    }
    drawGame();
  }

  function updateGame(delta) {
    game.elapsed += delta;
    game.rockClock += delta;
    game.gemClock += delta;
    const player = game.player;
    player.y = height - 38;
    const minX = 17;
    const maxX = width - 17;
    const moveSpeed = Math.max(200, width * 1.05);

    if (pointerTarget !== null) {
      const difference = pointerTarget - player.x;
      player.x += Math.max(-moveSpeed * delta, Math.min(moveSpeed * delta, difference));
    } else if (keys.left !== keys.right) {
      player.x += (keys.right ? 1 : -1) * moveSpeed * delta;
    }
    player.x = Math.max(minX, Math.min(maxX, player.x || width / 2));

    const spawnInterval = Math.max(.36, .83 - game.elapsed * .006);
    if (game.rockClock >= spawnInterval) {
      game.rockClock = 0;
      spawnRock();
      if (game.elapsed > 18 && Math.random() > .6) spawnRock();
    }
    if (game.gemClock >= 2.65) {
      game.gemClock = 0;
      spawnGem();
    }

    game.rocks.forEach((rock) => {
      rock.y += rock.speed * delta;
      rock.x += rock.vx * delta;
      rock.spin += rock.spinSpeed * delta;
      if (rock.x < rock.radius || rock.x > width - rock.radius) rock.vx *= -1;
    });
    game.gems.forEach((gem) => {
      gem.y += gem.speed * delta;
      gem.turn += delta * 1.5;
    });
    game.particles.forEach((particle) => {
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
      particle.vy += 75 * delta;
      particle.life -= delta;
    });
    game.particles = game.particles.filter((particle) => particle.life > 0);
    game.rocks = game.rocks.filter((rock) => rock.y < height + rock.radius + 20);
    game.gems = game.gems.filter((gem) => gem.y < height + 20);

    for (const rock of game.rocks) {
      const dx = rock.x - player.x;
      const dy = rock.y - player.y;
      if (dx * dx + dy * dy < (rock.radius + 10) * (rock.radius + 10)) {
        addBurst(player.x, player.y, "#f06b4b", 23);
        updateScore();
        endGame();
        return;
      }
    }

    game.gems = game.gems.filter((gem) => {
      const dx = gem.x - player.x;
      const dy = gem.y - player.y;
      if (dx * dx + dy * dy < (gem.radius + 15) * (gem.radius + 15)) {
        game.gemsCollected++;
        addBurst(gem.x, gem.y, "#d9f553", 12);
        return false;
      }
      return true;
    });
    updateScore();
  }

  function runFrame(now) {
    if (game.mode !== "running") return;
    const delta = Math.min(.04, Math.max(0, (now - game.lastTime) / 1000));
    game.lastTime = now;
    updateGame(delta);
    drawGame();
    if (game.mode === "running") animationFrame = window.requestAnimationFrame(runFrame);
  }

  function startGame() {
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
    game.mode = "running";
    game.score = 0;
    game.gemsCollected = 0;
    game.elapsed = 0;
    game.rockClock = .45;
    game.gemClock = 0;
    game.rocks = [];
    game.gems = [];
    game.particles = [];
    game.player.x = width / 2;
    game.player.y = height - 38;
    pointerTarget = null;
    keys.left = false;
    keys.right = false;
    if (scoreValue) scoreValue.textContent = "000";
    if (gemValue) gemValue.textContent = "00";
    if (gameStatus) gameStatus.textContent = "LIVE";
    if (overlayKicker) overlayKicker.textContent = "READY WHEN YOU ARE";
    if (overlayTitle) overlayTitle.innerHTML = "Asteroid<br>Dodge";
    if (overlayCopy) overlayCopy.textContent = "Dodge the rocks. Grab the gems. Try not to blink.";
    launchButton.innerHTML = 'Launch run <span aria-hidden="true">↗</span>';
    overlay.classList.add("is-hidden");
    game.lastTime = performance.now();
    drawGame();
    animationFrame = window.requestAnimationFrame(runFrame);
  }

  launchButton.addEventListener("click", startGame);
  canvas.addEventListener("pointermove", (event) => {
    if (game.mode !== "running") return;
    const rect = canvas.getBoundingClientRect();
    pointerTarget = Math.max(12, Math.min(width - 12, event.clientX - rect.left));
  });
  canvas.addEventListener("pointerdown", (event) => {
    if (game.mode !== "running") return;
    canvas.setPointerCapture?.(event.pointerId);
    const rect = canvas.getBoundingClientRect();
    pointerTarget = Math.max(12, Math.min(width - 12, event.clientX - rect.left));
  });
  canvas.addEventListener("pointerleave", () => { pointerTarget = null; });

  window.addEventListener("keydown", (event) => {
    if (game.mode !== "running") return;
    const target = event.target;
    if (target && ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(target.tagName) && target !== launchButton) return;
    if (["ArrowLeft", "a", "A"].includes(event.key)) { keys.left = true; event.preventDefault(); }
    if (["ArrowRight", "d", "D"].includes(event.key)) { keys.right = true; event.preventDefault(); }
  });
  window.addEventListener("keyup", (event) => {
    if (["ArrowLeft", "a", "A"].includes(event.key)) keys.left = false;
    if (["ArrowRight", "d", "D"].includes(event.key)) keys.right = false;
  });
  window.addEventListener("blur", () => { keys.left = false; keys.right = false; });
  if ("ResizeObserver" in window) {
    new ResizeObserver(resizeCanvas).observe(screen);
  } else {
    window.addEventListener("resize", resizeCanvas);
  }
  resizeCanvas();
})();

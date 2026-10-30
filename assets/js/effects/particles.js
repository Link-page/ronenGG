import { uiState } from '../state.js';

const PARTICLE_SPEED = 0.4;
const MAX_PARTICLES = 120;
const PARTICLE_COLORS = ['rgba(255,140,0,0.8)', 'rgba(255,170,0,0.9)', 'rgba(255,255,255,0.6)'];

/** A glowing ember that drifts upward with a slight sideways wobble. */
class Particle {
  constructor(canvas) {
    this.canvas = canvas;
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2.5 + 0.5;
    this.speedY = (Math.random() * -1.5 - 0.5) * PARTICLE_SPEED;
    this.speedX = (Math.random() * 1 - 0.5) * PARTICLE_SPEED;
    this.spin = (Math.random() * 0.05 - 0.025) * PARTICLE_SPEED;
    this.color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
    this.angle = Math.random() * Math.PI * 2;
  }

  update() {
    const { width, height } = this.canvas;
    this.y += this.speedY;
    this.x += Math.sin(this.angle) * 0.5 + this.speedX;
    this.angle += this.spin;
    // Once it leaves the top or sides, respawn just below the bottom edge.
    if (this.y < -10 || this.x < -10 || this.x > width + 10) {
      this.y = height + 10;
      this.x = Math.random() * width;
    }
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = this.size * 3;
    ctx.shadowColor = this.color;
    ctx.fill();
  }
}

/**
 * Starts the full-screen ember animation on #particles-canvas. The particle
 * count scales with the initial viewport width; drawing is skipped while
 * animations are paused from the accessibility menu.
 */
export function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');

  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const particles = [];
  const count = Math.min(window.innerWidth / 8, MAX_PARTICLES);
  for (let i = 0; i < count; i++) {
    particles.push(new Particle(canvas));
  }

  const renderFrame = () => {
    if (!uiState.animationsPaused) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const particle of particles) {
        particle.update();
        particle.draw(ctx);
      }
    }
    requestAnimationFrame(renderFrame);
  };
  renderFrame();
}

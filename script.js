/* ============================================================
   NHI STEM Club — Form Logic
   - Animated particles
   - Progress tracking
   - Tool chip toggles
   - Character counters
   - Validation (native :user-invalid + ARIA sync)
   - Submit / success flow
   ============================================================ */

(function () {
  'use strict';

  /* ——————————————————————————————
     1. Animated Particles
  —————————————————————————————— */
  function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    const colors = ['rgba(0,212,255,0.6)', 'rgba(124,58,237,0.5)', 'rgba(16,185,129,0.5)', 'rgba(245,158,11,0.4)'];
    const count = 18;

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = Math.random() * 4 + 2;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const delay = Math.random() * 12;
      const duration = Math.random() * 14 + 8;
      const left = Math.random() * 100;

      Object.assign(p.style, {
        width: size + 'px',
        height: size + 'px',
        background: color,
        left: left + '%',
        boxShadow: `0 0 ${size * 2}px ${color}`,
        animationDuration: duration + 's',
        animationDelay: delay + 's',
      });

      container.appendChild(p);
    }
  }

  /* ——————————————————————————————
     2. Progress Bar
  —————————————————————————————— */
  function updateProgress() {
    const form = document.getElementById('stemForm');
    if (!form) return;

    const requiredFields = [
      document.getElementById('fullName'),
      document.getElementById('contact'),
      document.getElementById('email'),
      document.getElementById('stream'),
      document.getElementById('whyJoin'),
      document.getElementById('problemSolving'),
      document.getElementById('dreamBuild'),
      document.getElementById('declaration'),
    ];

    const interestChecks = document.querySelectorAll('.interest-checkbox:checked');

    let filled = 0;
    const total = requiredFields.length + 1; // +1 for interests

    requiredFields.forEach(field => {
      if (!field) return;
      if (field.type === 'checkbox') {
        if (field.checked) filled++;
      } else if (field.value.trim().length > 0) {
        filled++;
      }
    });

    if (interestChecks.length > 0) filled++;

    const pct = Math.round((filled / total) * 100);
    const fill = document.getElementById('progressFill');
    const label = document.getElementById('progressLabel');
    const wrap = document.getElementById('progressBarWrap');

    if (fill) fill.style.width = pct + '%';
    if (label) label.textContent = pct + '% Complete';
    if (wrap) wrap.setAttribute('aria-valuenow', pct);
  }

  /* ——————————————————————————————
     3. Character Counter for Textareas
  —————————————————————————————— */
  function initCharCounts() {
    const pairs = [
      { textarea: 'whyJoin',        counter: 'whyJoin-count',        min: 50 },
      { textarea: 'problemSolving', counter: 'problemSolving-count', min: 50 },
      { textarea: 'dreamBuild',     counter: 'dreamBuild-count',     min: 50 },
    ];

    pairs.forEach(({ textarea, counter, min }) => {
      const ta = document.getElementById(textarea);
      const ct = document.getElementById(counter);
      if (!ta || !ct) return;

      function update() {
        const len = ta.value.length;
        ct.textContent = len >= min
          ? `${len} chars ✓`
          : `${len} / ${min} min`;
        ct.classList.toggle('reached', len >= min);
      }

      ta.addEventListener('input', update);
      update();
    });
  }

  /* ——————————————————————————————
     4. Tool Chip Toggle
  —————————————————————————————— */
  function initChips() {
    const toolInput = document.getElementById('tools');
    if (!toolInput) return;

    document.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const tool = chip.dataset.tool;
        const current = toolInput.value;
        const tags = current.split(',').map(t => t.trim()).filter(Boolean);
        const idx = tags.findIndex(t => t.toLowerCase() === tool.toLowerCase());

        if (idx === -1) {
          tags.push(tool);
          chip.classList.add('active');
        } else {
          tags.splice(idx, 1);
          chip.classList.remove('active');
        }

        toolInput.value = tags.join(', ');
        updateProgress();
      });
    });
  }

  /* ——————————————————————————————
     5. ARIA Sync for :user-invalid
     (Required per modern-web-guidance best practices)
  —————————————————————————————— */
  function syncAriaInvalid(input) {
    if (!input || typeof input.checkValidity !== 'function') return;
    if (!input.checkValidity()) {
      input.setAttribute('aria-invalid', 'true');
    } else {
      input.removeAttribute('aria-invalid');
    }
  }

  function initAriaSync() {
    const form = document.getElementById('stemForm');
    if (!form) return;

    // Sync on blur
    form.addEventListener('blur', (e) => {
      if (e.target.matches('input[required], select[required], textarea[required]')) {
        syncAriaInvalid(e.target);
      }
    }, true);

    // Clear on valid input
    form.addEventListener('input', (e) => {
      if (e.target.matches('[required]') && e.target.checkValidity?.()) {
        e.target.removeAttribute('aria-invalid');
      }
      updateProgress();
    });

    form.addEventListener('change', () => updateProgress());
  }

  /* ——————————————————————————————
     6. Interests Validation
  —————————————————————————————— */
  function validateInterests() {
    const checked = document.querySelectorAll('.interest-checkbox:checked');
    const errorEl = document.getElementById('interests-error');
    if (checked.length === 0) {
      if (errorEl) errorEl.style.display = 'flex';
      return false;
    }
    if (errorEl) errorEl.style.display = 'none';
    return true;
  }

  /* ——————————————————————————————
     7. Form Submission
  —————————————————————————————— */
  function initFormSubmit() {
    const form = document.getElementById('stemForm');
    const successScreen = document.getElementById('successScreen');
    const submitBtn = document.getElementById('submitBtn');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Sync ARIA for all required fields
      form.querySelectorAll('input[required], select[required], textarea[required]').forEach(syncAriaInvalid);

      // Validate interests separately
      const interestsValid = validateInterests();

      // Check native validity
      if (!form.checkValidity() || !interestsValid) {
        // Focus first invalid field
        const firstInvalid = form.querySelector(':invalid, [aria-invalid="true"]');
        if (firstInvalid) {
          firstInvalid.focus();
          firstInvalid.closest('.form-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        return;
      }

      // Simulate submission (loading state)
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;

      setTimeout(() => {
        form.hidden = true;
        if (successScreen) {
          successScreen.removeAttribute('hidden');
          successScreen.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
      }, 1200);
    });

    // Reset
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        form.reset();
        form.hidden = false;
        if (successScreen) successScreen.hidden = true;

        // Clear chip active states
        document.querySelectorAll('.chip.active').forEach(c => c.classList.remove('active'));

        // Reset char counts
        ['whyJoin-count', 'problemSolving-count', 'dreamBuild-count'].forEach(id => {
          const el = document.getElementById(id);
          const match = id.replace('-count', '');
          const pairs = { 'whyJoin': 50, 'problemSolving': 50, 'dreamBuild': 50 };
          if (el) {
            el.textContent = `0 / ${pairs[match]} min`;
            el.classList.remove('reached');
          }
        });

        updateProgress();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  /* ——————————————————————————————
     8. Animate sections on scroll
  —————————————————————————————— */
  function initScrollReveal() {
    const sections = document.querySelectorAll('.form-section');
    if (!('IntersectionObserver' in window)) {
      sections.forEach(s => s.style.opacity = '1');
      return;
    }

    sections.forEach(s => {
      s.style.opacity = '0';
      s.style.transform = 'translateY(20px)';
      s.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    sections.forEach(s => obs.observe(s));
  }

  /* ——————————————————————————————
     9. Interest card ripple effect
  —————————————————————————————— */
  function initInterestRipple() {
    document.querySelectorAll('.interest-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const ripple = document.createElement('span');
        const rect = card.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        Object.assign(ripple.style, {
          position: 'absolute',
          width: size + 'px',
          height: size + 'px',
          borderRadius: '50%',
          background: 'rgba(0,212,255,0.15)',
          left: (e.clientX - rect.left - size / 2) + 'px',
          top: (e.clientY - rect.top - size / 2) + 'px',
          transform: 'scale(0)',
          animation: 'ripple 0.5s ease-out forwards',
          pointerEvents: 'none',
        });

        card.style.overflow = 'hidden';
        card.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
        updateProgress();
      });
    });

    // Add ripple keyframe
    if (!document.getElementById('rippleStyle')) {
      const style = document.createElement('style');
      style.id = 'rippleStyle';
      style.textContent = `
        @keyframes ripple {
          to { transform: scale(2.5); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  /* ——————————————————————————————
     10. Boot
  —————————————————————————————— */
  function init() {
    createParticles();
    initCharCounts();
    initChips();
    initAriaSync();
    initFormSubmit();
    initScrollReveal();
    initInterestRipple();
    updateProgress();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

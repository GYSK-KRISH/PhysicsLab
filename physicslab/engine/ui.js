// Canvas UI System for PhysicsLab (No HTML tags used)
import { Colors, Renderer } from './renderer.js';

export class Button {
  constructor(options = {}) {
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.width = options.width || 200;
    this.height = options.height || 50;
    this.text = options.text || 'Button';
    this.subtext = options.subtext || '';
    this.badgeText = options.badgeText || '';
    this.badgeColor = options.badgeColor || Colors.cyan;
    this.callback = options.callback || (() => {});
    this.disabled = options.disabled || false;
    this.accentColor = options.accentColor || Colors.cyan;

    // Interactive states
    this.hoverAnim = 0; // Smooth 0 to 1 transition
    this.isHovered = false;
    this.isPressed = false;
  }

  contains(px, py) {
    return (
      px >= this.x &&
      px <= this.x + this.width &&
      py >= this.y &&
      py <= this.y + this.height
    );
  }

  update(dt, inputManager) {
    if (!inputManager) return;

    const pointer = inputManager.pointer;
    this.isHovered = this.contains(pointer.x, pointer.y);

    // Smooth hover animation
    const targetHover = (this.isHovered && !this.disabled) ? 1 : 0;
    const speed = 12; // animation speed
    this.hoverAnim += (targetHover - this.hoverAnim) * Math.min(1, dt * speed);

    if (this.isHovered && !this.disabled) {
      if (pointer.justPressed) {
        this.isPressed = true;
      }
      if (this.isPressed && pointer.justReleased) {
        this.isPressed = false;
        this.callback();
      }
    } else {
      if (!pointer.isDown) {
        this.isPressed = false;
      }
    }
  }

  render(ctx) {
    ctx.save();

    const isAvailable = !this.disabled;
    
    // Background color blending
    let bgFill = Colors.panel;
    let borderColor = Colors.panelBorder;
    let textColor = Colors.text;

    if (this.disabled) {
      bgFill = '#0D131E';
      borderColor = '#1E293B';
      textColor = Colors.textDark;
    } else {
      // Glow and hover response
      if (this.hoverAnim > 0.01) {
        borderColor = this.accentColor;
      }
    }

    // Draw Button Body
    const glowBlur = this.hoverAnim * 12;
    Renderer.drawRoundedRect(ctx, this.x, this.y, this.width, this.height, 10, {
      fill: bgFill,
      stroke: borderColor,
      lineWidth: 1 + this.hoverAnim * 0.5,
      glowColor: isAvailable ? this.accentColor : null,
      glowBlur: glowBlur,
      opacity: this.disabled ? 0.6 : 1.0
    });

    // Hover overlay highlight
    if (this.hoverAnim > 0.01 && isAvailable) {
      ctx.save();
      ctx.globalAlpha = this.hoverAnim * 0.1;
      Renderer.drawRoundedRect(ctx, this.x, this.y, this.width, this.height, 10, {
        fill: this.accentColor
      });
      ctx.restore();
    }

    // Draw Accent Bar on Left
    if (isAvailable) {
      const barWidth = 4;
      const barHeight = this.height - 16;
      Renderer.drawRoundedRect(ctx, this.x + 8, this.y + 8, barWidth, barHeight, 2, {
        fill: this.accentColor,
        glowColor: this.accentColor,
        glowBlur: this.hoverAnim * 8
      });
    }

    // Text positioning
    const textX = this.x + (isAvailable ? 24 : 16);
    const textY = this.subtext ? this.y + 20 : this.y + this.height / 2;
    const baseline = this.subtext ? 'top' : 'middle';

    Renderer.drawText(ctx, this.text, textX, textY, {
      fill: textColor,
      font: `600 16px "Segoe UI", Roboto, sans-serif`,
      baseline: baseline
    });

    if (this.subtext) {
      Renderer.drawText(ctx, this.subtext, textX, this.y + 40, {
        fill: Colors.textMuted,
        font: `12px "Segoe UI", Roboto, sans-serif`,
        baseline: 'top'
      });
    }

    // Badge (AVAILABLE / COMING SOON)
    if (this.badgeText) {
      const badgePaddingX = 8;
      const badgeHeight = 20;
      ctx.font = '700 10px "Segoe UI", Roboto, sans-serif';
      const badgeTextWidth = ctx.measureText(this.badgeText).width;
      const badgeWidth = badgeTextWidth + badgePaddingX * 2;
      const badgeX = this.x + this.width - badgeWidth - 12;
      const badgeY = this.y + (this.height - badgeHeight) / 2;

      Renderer.drawRoundedRect(ctx, badgeX, badgeY, badgeWidth, badgeHeight, 4, {
        fill: this.disabled ? '#161F2E' : 'rgba(94, 231, 255, 0.15)',
        stroke: this.disabled ? '#334155' : this.badgeColor,
        lineWidth: 1
      });

      Renderer.drawText(ctx, this.badgeText, badgeX + badgeWidth / 2, badgeY + badgeHeight / 2, {
        fill: this.disabled ? Colors.textDark : this.badgeColor,
        font: '700 10px "Segoe UI", Roboto, sans-serif',
        align: 'center',
        baseline: 'middle'
      });
    }

    ctx.restore();
  }
}

export class Slider {
  constructor(options = {}) {
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.width = options.width || 200;
    this.height = options.height || 40;
    this.min = options.min !== undefined ? options.min : 0;
    this.max = options.max !== undefined ? options.max : 100;
    this.value = options.value !== undefined ? options.value : 50;
    this.step = options.step || 0;
    this.label = options.label || 'Slider';
    this.unit = options.unit || '';
    this.callback = options.callback || (() => {});
    this.accentColor = options.accentColor || Colors.cyan;

    this.isDragging = false;
    this.isHovered = false;
    this.hoverAnim = 0;
  }

  getKnobPos() {
    const trackPadding = 12;
    const trackWidth = this.width - trackPadding * 2;
    const pct = (this.value - this.min) / (this.max - this.min);
    const knobX = this.x + trackPadding + pct * trackWidth;
    const knobY = this.y + this.height - 12;
    return { knobX, knobY, trackWidth, trackPadding };
  }

  update(dt, inputManager) {
    if (!inputManager) return;
    const pointer = inputManager.pointer;

    const bounds = {
      x: this.x,
      y: this.y,
      w: this.width,
      h: this.height
    };

    this.isHovered = (
      pointer.x >= bounds.x &&
      pointer.x <= bounds.x + bounds.w &&
      pointer.y >= bounds.y &&
      pointer.y <= bounds.y + bounds.h
    );

    const targetHover = this.isHovered ? 1 : 0;
    this.hoverAnim += (targetHover - this.hoverAnim) * Math.min(1, dt * 12);

    if (this.isHovered && pointer.justPressed) {
      this.isDragging = true;
    }

    if (this.isDragging) {
      if (!pointer.isDown) {
        this.isDragging = false;
      } else {
        const { trackPadding, trackWidth } = this.getKnobPos();
        let rawPct = (pointer.x - (this.x + trackPadding)) / trackWidth;
        rawPct = Math.max(0, Math.min(1, rawPct));

        let val = this.min + rawPct * (this.max - this.min);
        if (this.step > 0) {
          val = Math.round((val - this.min) / this.step) * this.step + this.min;
        }
        val = Math.max(this.min, Math.min(this.max, val));

        if (val !== this.value) {
          this.value = val;
          this.callback(this.value);
        }
      }
    }
  }

  render(ctx) {
    ctx.save();

    // Render Label and Current Value
    Renderer.drawText(ctx, this.label, this.x, this.y + 12, {
      fill: Colors.text,
      font: '600 13px "Segoe UI", Roboto, sans-serif',
      baseline: 'middle'
    });

    const displayVal = Number.isInteger(this.value) ? this.value : this.value.toFixed(1);
    Renderer.drawText(ctx, `${displayVal}${this.unit}`, this.x + this.width, this.y + 12, {
      fill: this.accentColor,
      font: '600 13px "Segoe UI", Roboto, sans-serif',
      align: 'right',
      baseline: 'middle'
    });

    // Track line
    const { knobX, knobY, trackWidth, trackPadding } = this.getKnobPos();
    const trackY = knobY;
    const trackX1 = this.x + trackPadding;
    const trackX2 = this.x + this.width - trackPadding;

    // Background track
    Renderer.drawLine(ctx, trackX1, trackY, trackX2, trackY, {
      stroke: '#1E293B',
      lineWidth: 6
    });

    // Active filled track
    Renderer.drawLine(ctx, trackX1, trackY, knobX, trackY, {
      stroke: this.accentColor,
      lineWidth: 6,
      glowColor: this.accentColor,
      glowBlur: this.hoverAnim * 6
    });

    // Handle Knob
    const knobRadius = this.isDragging ? 9 : (7 + this.hoverAnim * 2);
    Renderer.drawCircle(ctx, knobX, knobY, knobRadius, {
      fill: '#FFFFFF',
      stroke: this.accentColor,
      lineWidth: 3,
      glowColor: this.accentColor,
      glowBlur: (this.isDragging || this.hoverAnim > 0) ? 10 : 0
    });

    ctx.restore();
  }
}

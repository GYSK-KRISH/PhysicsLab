// Canvas UI System for PhysicsLab (Pure Canvas — ZERO DOM/HTML tags)
import { Colors, Renderer } from './renderer.js';
import { TextEngine } from './textEngine.js';

export class Button {
  constructor(options = {}) {
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.width = options.width || 120;
    this.height = options.height || 36;
    this.text = options.text || 'Button';
    this.subtext = options.subtext || '';
    this.badgeText = options.badgeText || '';
    this.badgeColor = options.badgeColor || Colors.cyan;
    this.callback = options.callback || (() => {});
    this.disabled = options.disabled || false;
    this.active = options.active || false;
    this.accentColor = options.accentColor || Colors.cyan;
    this.align = options.align || 'center'; // 'left' | 'center' | 'right'
    this.variant = options.variant || 'default'; // 'default' | 'primary' | 'outline' | 'ghost' | 'danger'
    this.fontSize = options.fontSize || 13;
    this.icon = options.icon || '';

    // Interactive states
    this.hoverAnim = 0; // Smooth 0 to 1 transition
    this.isHovered = false;
    this.isPressed = false;
    this.isFocused = false;
  }

  setRect(x, y, width, height) {
    this.x = Math.round(x);
    this.y = Math.round(y);
    this.width = Math.max(20, Math.round(width));
    this.height = Math.max(16, Math.round(height));
    return this;
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
    const speed = 14;
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
    const pressOffset = (this.isPressed && isAvailable) ? 1 : 0;
    const renderY = this.y + pressOffset;

    // Determine colors based on state & variant
    let bgFill = Colors.panel;
    let borderColor = this.active ? this.accentColor : Colors.panelBorder;
    let textColor = Colors.text;

    if (this.disabled) {
      bgFill = '#0A0E17';
      borderColor = '#162030';
      textColor = Colors.textDark;
    } else if (this.active) {
      bgFill = 'rgba(94, 231, 255, 0.12)';
      borderColor = this.accentColor;
      textColor = '#FFFFFF';
    } else {
      if (this.hoverAnim > 0.01) {
        borderColor = this.accentColor;
      }
    }

    if (this.variant === 'primary' && isAvailable) {
      bgFill = this.accentColor;
      textColor = '#080B12';
    } else if (this.variant === 'danger' && isAvailable) {
      borderColor = '#EF4444';
      if (this.hoverAnim > 0.01) bgFill = 'rgba(239, 68, 68, 0.2)';
    }

    // Draw Button Body
    const radius = Math.min(8, Math.floor(this.height / 3));
    const glowBlur = this.active ? 8 : (this.hoverAnim * 10);
    const glowColor = isAvailable ? (this.active ? this.accentColor : this.accentColor) : null;

    Renderer.drawRoundedRect(ctx, this.x, renderY, this.width, this.height, radius, {
      fill: bgFill,
      stroke: borderColor,
      lineWidth: this.active ? 1.8 : (1 + this.hoverAnim * 0.5),
      glowColor: glowColor,
      glowBlur: glowBlur,
      opacity: this.disabled ? 0.5 : 1.0
    });

    // Hover overlay highlight
    if (this.hoverAnim > 0.01 && isAvailable && this.variant !== 'primary') {
      ctx.save();
      ctx.globalAlpha = this.hoverAnim * 0.08;
      Renderer.drawRoundedRect(ctx, this.x, renderY, this.width, this.height, radius, {
        fill: this.accentColor
      });
      ctx.restore();
    }

    // Accent indicator bar (for left-aligned cards or active items)
    if (this.align === 'left' && isAvailable && this.height >= 28) {
      const barH = Math.max(12, this.height - 14);
      Renderer.drawRoundedRect(ctx, this.x + 6, renderY + (this.height - barH) / 2, 3, barH, 1.5, {
        fill: this.accentColor,
        glowColor: this.accentColor,
        glowBlur: this.hoverAnim * 6
      });
    }

    // Text & Badge measurements
    const leftMargin = this.align === 'left' ? 14 : 6;
    const rightMargin = this.badgeText ? (Math.min(60, this.width * 0.25) + 8) : 6;
    const availableTextW = Math.max(10, this.width - leftMargin - rightMargin);

    // Auto-fit font size to ensure text never escapes bounds
    const fitted = TextEngine.fitFontSize(
      ctx,
      this.text,
      availableTextW,
      this.fontSize,
      Math.max(9, this.fontSize - 4),
      '"Segoe UI", Roboto, sans-serif',
      '600'
    );

    let textX = this.x + leftMargin;
    let textAlign = 'left';

    if (this.align === 'center') {
      textX = this.x + (this.badgeText ? (this.width - rightMargin) / 2 : this.width / 2);
      textAlign = 'center';
    } else if (this.align === 'right') {
      textX = this.x + this.width - rightMargin;
      textAlign = 'right';
    }

    const textY = this.subtext ? renderY + 8 : renderY + this.height / 2;
    const baseline = this.subtext ? 'top' : 'middle';

    Renderer.drawText(ctx, this.text, textX, textY, {
      fill: textColor,
      font: fitted.font,
      align: textAlign,
      baseline: baseline,
      maxWidth: availableTextW
    });

    if (this.subtext && this.height >= 48) {
      const subFitted = TextEngine.fitFontSize(
        ctx,
        this.subtext,
        availableTextW,
        11,
        8,
        '"Segoe UI", Roboto, sans-serif',
        '400'
      );
      Renderer.drawText(ctx, this.subtext, textX, renderY + this.height - 18, {
        fill: Colors.textMuted,
        font: subFitted.font,
        align: textAlign,
        baseline: 'middle',
        maxWidth: availableTextW
      });
    }

    // Badge Render
    if (this.badgeText && this.width >= 90) {
      const badgePaddingX = 4;
      const badgeH = Math.min(18, Math.max(14, this.height - 12));
      ctx.font = '700 9px "Segoe UI", Roboto, sans-serif';
      const badgeTextW = ctx.measureText(this.badgeText).width;
      const badgeW = Math.min(54, badgeTextW + badgePaddingX * 2);
      const badgeX = this.x + this.width - badgeW - 6;
      const badgeY = renderY + (this.height - badgeH) / 2;

      Renderer.drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 3, {
        fill: this.disabled ? '#121824' : 'rgba(94, 231, 255, 0.12)',
        stroke: this.disabled ? '#223044' : this.badgeColor,
        lineWidth: 1
      });

      Renderer.drawText(ctx, this.badgeText, badgeX + badgeW / 2, badgeY + badgeH / 2, {
        fill: this.disabled ? Colors.textDark : this.badgeColor,
        font: '700 9px "Segoe UI", Roboto, sans-serif',
        align: 'center',
        baseline: 'middle',
        maxWidth: badgeW - 2
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
    this.height = options.height || 42;
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

  setRect(x, y, width, height = this.height) {
    this.x = Math.round(x);
    this.y = Math.round(y);
    this.width = Math.max(40, Math.round(width));
    this.height = Math.max(28, Math.round(height));
    return this;
  }

  getKnobPos() {
    const trackPadding = 10;
    const trackWidth = Math.max(10, this.width - trackPadding * 2);
    const range = (this.max - this.min) || 1;
    const pct = Math.max(0, Math.min(1, (this.value - this.min) / range));
    const knobX = this.x + trackPadding + pct * trackWidth;
    const knobY = this.y + this.height - 10;
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
    this.hoverAnim += (targetHover - this.hoverAnim) * Math.min(1, dt * 14);

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

    // Render Label and Value
    const labelMaxW = Math.max(10, this.width * 0.62);
    Renderer.drawText(ctx, this.label, this.x, this.y + 10, {
      fill: Colors.text,
      font: '600 11px "Segoe UI", Roboto, sans-serif',
      baseline: 'middle',
      maxWidth: labelMaxW
    });

    let displayVal = '';
    if (Number.isInteger(this.value)) {
      displayVal = `${this.value}`;
    } else if (Math.abs(this.value) >= 100) {
      displayVal = this.value.toFixed(0);
    } else if (Math.abs(this.value) >= 10) {
      displayVal = this.value.toFixed(1);
    } else {
      displayVal = this.value.toFixed(2);
    }

    Renderer.drawText(ctx, `${displayVal}${this.unit ? ' ' + this.unit : ''}`, this.x + this.width, this.y + 10, {
      fill: this.accentColor,
      font: 'bold 11px "Segoe UI", Roboto, sans-serif',
      align: 'right',
      baseline: 'middle',
      maxWidth: this.width * 0.35
    });

    // Track line
    const { knobX, knobY, trackWidth, trackPadding } = this.getKnobPos();
    const trackY = knobY;
    const trackX1 = this.x + trackPadding;
    const trackX2 = this.x + this.width - trackPadding;

    // Background track
    Renderer.drawLine(ctx, trackX1, trackY, trackX2, trackY, {
      stroke: '#1A2333',
      lineWidth: 5
    });

    // Active filled track
    if (knobX > trackX1) {
      Renderer.drawLine(ctx, trackX1, trackY, knobX, trackY, {
        stroke: this.accentColor,
        lineWidth: 5,
        glowColor: this.accentColor,
        glowBlur: this.hoverAnim * 5
      });
    }

    // Handle Knob
    const knobRadius = this.isDragging ? 8 : (6 + this.hoverAnim * 1.5);
    Renderer.drawCircle(ctx, knobX, knobY, knobRadius, {
      fill: '#FFFFFF',
      stroke: this.accentColor,
      lineWidth: 2.5,
      glowColor: this.accentColor,
      glowBlur: (this.isDragging || this.hoverAnim > 0) ? 8 : 0
    });

    ctx.restore();
  }
}

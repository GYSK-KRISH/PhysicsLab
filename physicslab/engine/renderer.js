// Renderer Module for PhysicsLab

export const Colors = {
  background: '#080B12',
  panel: '#111722',
  panelBorder: '#1E293B',
  cyan: '#5EE7FF',
  purple: '#8B5CF6',
  green: '#4ADE80',
  yellow: '#FACC15',
  text: '#E5E7EB',
  textMuted: '#94A3B8',
  textDark: '#64748B',
  disabled: '#1E293B'
};

export class Renderer {
  static applyStyles(ctx, options = {}) {
    if (options.opacity !== undefined) {
      ctx.globalAlpha = options.opacity;
    } else {
      ctx.globalAlpha = 1.0;
    }

    if (options.shadowColor || options.glowColor) {
      ctx.shadowColor = options.shadowColor || options.glowColor;
      ctx.shadowBlur = options.shadowBlur || options.glowBlur || 10;
      ctx.shadowOffsetX = options.shadowOffsetX || 0;
      ctx.shadowOffsetY = options.shadowOffsetY || 0;
    } else {
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }

    if (options.fill) {
      ctx.fillStyle = options.fill;
    }

    if (options.stroke) {
      ctx.strokeStyle = options.stroke;
      ctx.lineWidth = options.lineWidth || 1;
      if (options.lineDash) {
        ctx.setLineDash(options.lineDash);
      } else {
        ctx.setLineDash([]);
      }
    }
  }

  static drawText(ctx, text, x, y, options = {}) {
    ctx.save();
    this.applyStyles(ctx, options);
    
    const font = options.font || '16px "Segoe UI", Roboto, sans-serif';
    ctx.font = font;
    ctx.textAlign = options.align || 'left';
    ctx.textBaseline = options.baseline || 'alphabetic';

    if (options.fill !== false) {
      ctx.fillStyle = options.fill || Colors.text;
      ctx.fillText(text, x, y);
    }
    if (options.stroke) {
      ctx.strokeText(text, x, y);
    }
    ctx.restore();
  }

  static drawLine(ctx, x1, y1, x2, y2, options = {}) {
    ctx.save();
    this.applyStyles(ctx, { stroke: options.stroke || Colors.cyan, ...options });
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    
    ctx.restore();
  }

  static drawCircle(ctx, x, y, radius, options = {}) {
    ctx.save();
    this.applyStyles(ctx, options);

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);

    if (options.fill) {
      ctx.fill();
    }
    if (options.stroke) {
      ctx.stroke();
    }
    ctx.restore();
  }

  static drawRect(ctx, x, y, width, height, options = {}) {
    ctx.save();
    this.applyStyles(ctx, options);

    ctx.beginPath();
    ctx.rect(x, y, width, height);

    if (options.fill) {
      ctx.fill();
    }
    if (options.stroke) {
      ctx.stroke();
    }
    ctx.restore();
  }

  static drawRoundedRect(ctx, x, y, width, height, radius = 8, options = {}) {
    ctx.save();
    this.applyStyles(ctx, options);

    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();

    if (options.fill) {
      ctx.fill();
    }
    if (options.stroke) {
      ctx.stroke();
    }
    ctx.restore();
  }

  static drawPanel(ctx, x, y, width, height, options = {}) {
    const bgFill = options.fill || Colors.panel;
    const borderStroke = options.stroke || Colors.panelBorder;
    const radius = options.radius || 12;

    this.drawRoundedRect(ctx, x, y, width, height, radius, {
      fill: bgFill,
      stroke: borderStroke,
      lineWidth: options.lineWidth || 1,
      glowColor: options.glowColor,
      glowBlur: options.glowBlur,
      opacity: options.opacity
    });
  }

  static drawGrid(ctx, width, height, spacing = 40, options = {}) {
    ctx.save();
    const gridColor = options.color || 'rgba(94, 231, 255, 0.04)';
    const majorGridColor = options.majorColor || 'rgba(94, 231, 255, 0.08)';
    const majorInterval = options.majorInterval || 5;

    ctx.lineWidth = 1;

    for (let x = 0; x <= width; x += spacing) {
      const isMajor = Math.round(x / spacing) % majorInterval === 0;
      ctx.strokeStyle = isMajor ? majorGridColor : gridColor;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y <= height; y += spacing) {
      const isMajor = Math.round(y / spacing) % majorInterval === 0;
      ctx.strokeStyle = isMajor ? majorGridColor : gridColor;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.restore();
  }

  static drawButton(ctx, button) {
    button.render(ctx);
  }

  static drawSlider(ctx, slider) {
    slider.render(ctx);
  }
}

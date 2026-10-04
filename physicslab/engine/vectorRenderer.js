// Universal Vector and Mechanics Canvas Drawing Engine for PhysicsLab
import { Colors, Renderer } from './renderer.js';

export const VectorColors = {
  velocity: '#5EE7FF', // Cyan
  force: '#EF4444', // Red / Coral
  netForce: '#F43F5E',
  acceleration: '#F97316', // Orange
  momentum: '#3B82F6', // Blue
  position: '#A855F7', // Purple
  energy: '#FACC15', // Yellow
  normal: '#10B981', // Green
  friction: '#EC4899', // Pink
  gravity: '#EAB308', // Amber
  tension: '#06B6D4' // Light cyan
};

export class VectorRenderer {
  // Draw an arrow from (fromX, fromY) to (toX, toY)
  static drawArrow(ctx, fromX, fromY, toX, toY, options = {}) {
    const strokeColor = options.stroke || options.color || VectorColors.velocity;
    const lineWidth = options.lineWidth || 2.5;
    const headLength = options.headLength || 10;
    const headAngle = options.headAngle || Math.PI / 6;

    const dx = toX - fromX;
    const dy = toY - fromY;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 2) return;

    const angle = Math.atan2(dy, dx);

    ctx.save();
    Renderer.applyStyles(ctx, {
      stroke: strokeColor,
      lineWidth: lineWidth,
      glowColor: options.glow ? strokeColor : null,
      glowBlur: options.glowBlur || 6
    });

    // Shaft
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    // Arrowhead
    ctx.fillStyle = strokeColor;
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headLength * Math.cos(angle - headAngle),
      toY - headLength * Math.sin(angle - headAngle)
    );
    ctx.lineTo(
      toX - headLength * 0.6 * Math.cos(angle),
      toY - headLength * 0.6 * Math.sin(angle)
    );
    ctx.lineTo(
      toX - headLength * Math.cos(angle + headAngle),
      toY - headLength * Math.sin(angle + headAngle)
    );
    ctx.closePath();
    ctx.fill();

    // Optional text label
    if (options.label) {
      const midX = (fromX + toX) / 2;
      const midY = (fromY + toY) / 2;
      const perpX = -Math.sin(angle) * 14;
      const perpY = Math.cos(angle) * 14;

      Renderer.drawText(ctx, options.label, midX + perpX, midY + perpY, {
        fill: options.labelColor || strokeColor,
        font: options.font || 'bold 12px "Segoe UI", Roboto, sans-serif',
        align: 'center',
        baseline: 'middle'
      });
    }

    ctx.restore();
  }

  // Draw a scaled physics vector starting at (startX, startY)
  static drawVector(ctx, startX, startY, vx, vy, scale = 1.0, options = {}) {
    const endX = startX + vx * scale;
    const endY = startY + vy * scale;
    this.drawArrow(ctx, startX, startY, endX, endY, options);
  }

  // Draw decomposed x and y component vectors with dashed projection lines
  static drawComponentVector(ctx, startX, startY, vx, vy, scale = 1.0, options = {}) {
    const endX = startX + vx * scale;
    const endY = startY + vy * scale;

    const compColor = options.componentColor || 'rgba(148, 163, 184, 0.7)';

    // X-component arrow
    this.drawArrow(ctx, startX, startY, endX, startY, {
      stroke: compColor,
      lineWidth: 1.5,
      headLength: 7,
      label: options.xLabel || (options.label ? `${options.label}x` : '')
    });

    // Y-component arrow
    this.drawArrow(ctx, endX, startY, endX, endY, {
      stroke: compColor,
      lineWidth: 1.5,
      headLength: 7,
      label: options.yLabel || (options.label ? `${options.label}y` : '')
    });

    // Dashed guide lines
    ctx.save();
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(startX, endY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.restore();

    // Resultant vector
    this.drawArrow(ctx, startX, startY, endX, endY, options);
  }

  // Draw angle arc with label between two angles
  static drawAngleArc(ctx, centerX, centerY, radius, startAngleRad, endAngleRad, label = '', options = {}) {
    ctx.save();
    const color = options.color || Colors.yellow;
    ctx.strokeStyle = color;
    ctx.lineWidth = options.lineWidth || 1.5;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngleRad, endAngleRad, false);
    ctx.stroke();

    if (label) {
      const midAngle = (startAngleRad + endAngleRad) / 2;
      const lx = centerX + (radius + 12) * Math.cos(midAngle);
      const ly = centerY + (radius + 12) * Math.sin(midAngle);
      Renderer.drawText(ctx, label, lx, ly, {
        fill: color,
        font: 'bold 12px "Segoe UI", Roboto, sans-serif',
        align: 'center',
        baseline: 'middle'
      });
    }
    ctx.restore();
  }

  // Draw a helical spring between two points
  static drawSpring(ctx, x1, y1, x2, y2, coils = 12, radius = 12, options = {}) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 5) return;

    const angle = Math.atan2(dy, dx);
    const strokeColor = options.color || Colors.cyan;

    ctx.save();
    ctx.translate(x1, y1);
    ctx.rotate(angle);

    Renderer.applyStyles(ctx, {
      stroke: strokeColor,
      lineWidth: options.lineWidth || 2.5,
      glowColor: options.glow ? strokeColor : null,
      glowBlur: 6
    });

    const leadIn = 15;
    const leadOut = 15;
    const coilLength = Math.max(10, len - leadIn - leadOut);
    const step = coilLength / coils;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(leadIn, 0);

    for (let i = 0; i < coils; i++) {
      const currentX = leadIn + i * step;
      ctx.lineTo(currentX + step * 0.25, -radius);
      ctx.lineTo(currentX + step * 0.75, radius);
      ctx.lineTo(currentX + step, 0);
    }

    ctx.lineTo(len, 0);
    ctx.stroke();
    ctx.restore();
  }

  // Draw an inclined plane with surface hatching
  static drawIncline(ctx, originX, originY, baseWidth, height, angleDeg, options = {}) {
    ctx.save();
    const fillColor = options.fill || '#161F2E';
    const strokeColor = options.stroke || Colors.panelBorder;

    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX + baseWidth, originY);
    ctx.lineTo(originX, originY - height);
    ctx.closePath();

    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Base ground line
    Renderer.drawLine(ctx, originX - 20, originY, originX + baseWidth + 40, originY, {
      stroke: Colors.panelBorder,
      lineWidth: 3
    });

    // Angle Arc at the corner
    const angleRad = Math.atan2(height, baseWidth);
    this.drawAngleArc(ctx, originX + baseWidth, originY, 40, Math.PI, Math.PI + angleRad, `${angleDeg.toFixed(1)}°`, {
      color: Colors.yellow
    });

    ctx.restore();
  }

  // Draw a measurement ruler with graduation marks
  static drawRuler(ctx, x1, y1, x2, y2, totalValue, unit = 'm', options = {}) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 5) return;

    const angle = Math.atan2(dy, dx);
    const color = options.color || Colors.textMuted;

    ctx.save();
    ctx.translate(x1, y1);
    ctx.rotate(angle);

    ctx.strokeStyle = color;
    ctx.lineWidth = 1;

    // Main line
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(len, 0);
    // End caps
    ctx.moveTo(0, -6);
    ctx.lineTo(0, 6);
    ctx.moveTo(len, -6);
    ctx.lineTo(len, 6);
    ctx.stroke();

    // Graduation ticks
    const divisions = 10;
    for (let i = 1; i < divisions; i++) {
      const tx = (i / divisions) * len;
      const tickH = i % 5 === 0 ? 5 : 3;
      ctx.beginPath();
      ctx.moveTo(tx, -tickH);
      ctx.lineTo(tx, tickH);
      ctx.stroke();
    }

    // Label
    Renderer.drawText(ctx, `${totalValue.toFixed(2)} ${unit}`, len / 2, -10, {
      fill: Colors.text,
      font: '600 11px "Segoe UI", Roboto, sans-serif',
      align: 'center',
      baseline: 'bottom'
    });

    ctx.restore();
  }
}

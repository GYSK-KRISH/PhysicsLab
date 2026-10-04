// Ray Tracer & Rendering Abstraction for PhysicsLab Optics
import { Colors, Renderer } from '../../engine/renderer.js';

export const RayType = {
  REAL: 'REAL',
  VIRTUAL: 'VIRTUAL',
  INCIDENT: 'INCIDENT',
  REFLECTED: 'REFLECTED',
  REFRACTED: 'REFRACTED',
  EXTENSION: 'EXTENSION'
};

export class RayTracer {
  static drawRay(ctx, x1, y1, x2, y2, options = {}) {
    ctx.save();
    const color = options.color || Colors.cyan;
    const isVirtual = options.type === RayType.VIRTUAL || options.type === RayType.EXTENSION || options.dashed;
    const isActive = options.active !== false;

    ctx.strokeStyle = color;
    ctx.lineWidth = options.lineWidth || (isActive ? 2 : 1);
    ctx.globalAlpha = options.opacity !== undefined ? options.opacity : (isActive ? 1.0 : 0.4);

    if (isActive) {
      ctx.shadowColor = color;
      ctx.shadowBlur = options.glowBlur || 8;
    }

    if (isVirtual) {
      ctx.setLineDash(options.dashPattern || [5, 4]);
    } else {
      ctx.setLineDash([]);
    }

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Directional Arrow Indicator along ray
    if (options.showArrow !== false) {
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      const angle = Math.atan2(y2 - y1, x2 - x1);

      ctx.save();
      ctx.translate(midX, midY);
      ctx.rotate(angle);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(4, 0);
      ctx.lineTo(-4, -4);
      ctx.lineTo(-4, 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  static drawRayParticle(ctx, x1, y1, x2, y2, progress, options = {}) {
    ctx.save();
    const color = options.color || Colors.cyan;
    const px = x1 + (x2 - x1) * progress;
    const py = y1 + (y2 - y1) * progress;

    Renderer.drawCircle(ctx, px, py, options.radius || 3.5, {
      fill: '#FFFFFF',
      stroke: color,
      lineWidth: 1.5,
      glowColor: color,
      glowBlur: 10
    });

    ctx.restore();
  }

  static drawNormal(ctx, x, y, height, options = {}) {
    ctx.save();
    const color = options.color || Colors.textDark;
    Renderer.drawLine(ctx, x, y - height / 2, x, y + height / 2, {
      stroke: color,
      lineWidth: 1.5,
      lineDash: [4, 4]
    });
    ctx.restore();
  }

  static drawAngleArc(ctx, x, y, radius, startAngleRad, endAngleRad, label, options = {}) {
    ctx.save();
    const color = options.color || Colors.yellow;

    ctx.beginPath();
    ctx.arc(x, y, radius, startAngleRad, endAngleRad);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    if (label) {
      const midAngle = (startAngleRad + endAngleRad) / 2;
      const textX = x + (radius + 14) * Math.cos(midAngle);
      const textY = y + (radius + 14) * Math.sin(midAngle);

      Renderer.drawText(ctx, label, textX, textY, {
        fill: color,
        font: 'bold 11px "Segoe UI", Roboto, sans-serif',
        align: 'center',
        baseline: 'middle'
      });
    }

    ctx.restore();
  }

  static drawFocalPoint(ctx, x, y, label, color = Colors.purple) {
    Renderer.drawCircle(ctx, x, y, 4, {
      fill: color,
      stroke: '#FFFFFF',
      lineWidth: 1.5,
      glowColor: color,
      glowBlur: 8
    });

    if (label) {
      Renderer.drawText(ctx, label, x, y + 16, {
        fill: color,
        font: 'bold 11px "Segoe UI", Roboto, sans-serif',
        align: 'center',
        baseline: 'top'
      });
    }
  }

  static drawOpticalAxis(ctx, x1, y1, x2, y2, options = {}) {
    Renderer.drawLine(ctx, x1, y1, x2, y2, {
      stroke: options.color || Colors.cyan,
      lineWidth: 1.5,
      glowColor: Colors.cyan,
      glowBlur: 6
    });

    if (options.label !== false) {
      Renderer.drawText(ctx, 'PRINCIPAL AXIS', x1 + 15, y1 - 10, {
        fill: 'rgba(94, 231, 255, 0.6)',
        font: '10px "Segoe UI", Roboto, sans-serif'
      });
    }
  }
}

// Universal Canvas Graph Engine for PhysicsLab Mechanics
import { Colors, Renderer } from './renderer.js';

export class GraphRenderer {
  constructor(options = {}) {
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.width = options.width || 400;
    this.height = options.height || 200;

    this.title = options.title || 'Graph';
    this.xLabel = options.xLabel || 'Time';
    this.xUnit = options.xUnit || 's';
    this.yLabel = options.yLabel || 'Value';
    this.yUnit = options.yUnit || '';

    this.minX = options.minX !== undefined ? options.minX : 0;
    this.maxX = options.maxX !== undefined ? options.maxX : 10;
    this.minY = options.minY !== undefined ? options.minY : -10;
    this.maxY = options.maxY !== undefined ? options.maxY : 10;
    this.autoScale = options.autoScale !== undefined ? options.autoScale : true;

    this.datasets = []; // Array of { label, color, points: [{x, y}], fillArea: boolean }
  }

  setRect(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = Math.max(150, width);
    this.height = Math.max(100, height);
  }

  clearDatasets() {
    this.datasets = [];
  }

  addDataset(dataset) {
    this.datasets.push({
      label: dataset.label || 'Data',
      color: dataset.color || Colors.cyan,
      points: dataset.points || [],
      fillArea: !!dataset.fillArea,
      lineWidth: dataset.lineWidth || 2
    });
  }

  updateDataset(index, points) {
    if (this.datasets[index]) {
      this.datasets[index].points = points;
    }
  }

  render(ctx) {
    ctx.save();

    // 1. Draw Graph Panel Background
    Renderer.drawPanel(ctx, this.x, this.y, this.width, this.height, {
      fill: '#0D131E',
      stroke: Colors.panelBorder,
      radius: 8
    });

    const paddingLeft = 48;
    const paddingRight = 16;
    const paddingTop = 28;
    const paddingBottom = 28;

    const plotX = this.x + paddingLeft;
    const plotY = this.y + paddingTop;
    const plotW = this.width - paddingLeft - paddingRight;
    const plotH = this.height - paddingTop - paddingBottom;

    // 2. Title & Axis Labels
    Renderer.drawText(ctx, this.title, this.x + 14, this.y + 14, {
      fill: Colors.text,
      font: 'bold 12px "Segoe UI", Roboto, sans-serif',
      baseline: 'middle'
    });

    // Determine Plot Ranges (with autoscale support)
    let minX = this.minX;
    let maxX = this.maxX;
    let minY = this.minY;
    let maxY = this.maxY;

    if (this.autoScale && this.datasets.length > 0) {
      let found = false;
      let dMinX = Infinity, dMaxX = -Infinity, dMinY = Infinity, dMaxY = -Infinity;

      for (const ds of this.datasets) {
        for (const p of ds.points) {
          if (Number.isFinite(p.x) && Number.isFinite(p.y)) {
            found = true;
            if (p.x < dMinX) dMinX = p.x;
            if (p.x > dMaxX) dMaxX = p.x;
            if (p.y < dMinY) dMinY = p.y;
            if (p.y > dMaxY) dMaxY = p.y;
          }
        }
      }

      if (found) {
        minX = Math.min(0, dMinX);
        maxX = Math.max(minX + 0.5, dMaxX);
        minY = Math.min(0, dMinY * 1.1);
        maxY = Math.max(0.5, dMaxY * 1.1);
      }
    }

    const mapX = (val) => plotX + ((val - minX) / (maxX - minX || 1)) * plotW;
    const mapY = (val) => plotY + plotH - ((val - minY) / (maxY - minY || 1)) * plotH;

    // 3. Grid Lines & Axis Ticks
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    const gridDivs = 4;
    for (let i = 0; i <= gridDivs; i++) {
      // Horizontal grid lines
      const gy = plotY + (i / gridDivs) * plotH;
      ctx.beginPath();
      ctx.moveTo(plotX, gy);
      ctx.lineTo(plotX + plotW, gy);
      ctx.stroke();

      const yVal = maxY - (i / gridDivs) * (maxY - minY);
      Renderer.drawText(ctx, yVal.toFixed(1), plotX - 6, gy, {
        fill: Colors.textMuted,
        font: '10px "Segoe UI", Roboto, sans-serif',
        align: 'right',
        baseline: 'middle'
      });

      // Vertical grid lines
      const gx = plotX + (i / gridDivs) * plotW;
      ctx.beginPath();
      ctx.moveTo(gx, plotY);
      ctx.lineTo(gx, plotY + plotH);
      ctx.stroke();

      const xVal = minX + (i / gridDivs) * (maxX - minX);
      Renderer.drawText(ctx, xVal.toFixed(1), gx, plotY + plotH + 12, {
        fill: Colors.textMuted,
        font: '10px "Segoe UI", Roboto, sans-serif',
        align: 'center',
        baseline: 'middle'
      });
    }

    // Zero-axis lines
    if (minY <= 0 && maxY >= 0) {
      const zeroY = mapY(0);
      Renderer.drawLine(ctx, plotX, zeroY, plotX + plotW, zeroY, {
        stroke: 'rgba(255, 255, 255, 0.2)',
        lineWidth: 1.5
      });
    }
    if (minX <= 0 && maxX >= 0) {
      const zeroX = mapX(0);
      Renderer.drawLine(ctx, zeroX, plotY, zeroX, plotY + plotH, {
        stroke: 'rgba(255, 255, 255, 0.2)',
        lineWidth: 1.5
      });
    }

    // 4. Clip to plot area & Draw Datasets
    ctx.save();
    ctx.beginPath();
    ctx.rect(plotX, plotY, plotW, plotH);
    ctx.clip();

    for (const ds of this.datasets) {
      if (!ds.points || ds.points.length < 2) continue;

      // Area Shading under curve (for integrals / work)
      if (ds.fillArea) {
        ctx.fillStyle = ds.color.includes('rgba') ? ds.color : `${ds.color}22`;
        ctx.beginPath();
        const firstPt = ds.points[0];
        ctx.moveTo(mapX(firstPt.x), mapY(0));
        for (const p of ds.points) {
          ctx.lineTo(mapX(p.x), mapY(p.y));
        }
        const lastPt = ds.points[ds.points.length - 1];
        ctx.lineTo(mapX(lastPt.x), mapY(0));
        ctx.closePath();
        ctx.fill();
      }

      // Curve Line
      ctx.strokeStyle = ds.color;
      ctx.lineWidth = ds.lineWidth || 2;
      ctx.beginPath();
      let started = false;
      for (const p of ds.points) {
        if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) continue;
        const px = mapX(p.x);
        const py = mapY(p.y);
        if (!started) {
          ctx.moveTo(px, py);
          started = true;
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();

      // Current live tip marker dot
      if (ds.points.length > 0) {
        const lastPt = ds.points[ds.points.length - 1];
        if (Number.isFinite(lastPt.x) && Number.isFinite(lastPt.y)) {
          Renderer.drawCircle(ctx, mapX(lastPt.x), mapY(lastPt.y), 4, {
            fill: '#FFFFFF',
            stroke: ds.color,
            lineWidth: 2,
            glowColor: ds.color,
            glowBlur: 6
          });
        }
      }
    }
    ctx.restore();

    // 5. Legends at top right
    let legendX = plotX + plotW - 10;
    for (let i = this.datasets.length - 1; i >= 0; i--) {
      const ds = this.datasets[i];
      ctx.font = 'bold 11px "Segoe UI", Roboto, sans-serif';
      const textW = ctx.measureText(ds.label).width;

      Renderer.drawCircle(ctx, legendX - textW - 8, this.y + 14, 4, { fill: ds.color });
      Renderer.drawText(ctx, ds.label, legendX, this.y + 14, {
        fill: Colors.text,
        font: 'bold 11px "Segoe UI", Roboto, sans-serif',
        align: 'right',
        baseline: 'middle'
      });

      legendX -= (textW + 24);
    }

    // Units label
    Renderer.drawText(ctx, `${this.yLabel} (${this.yUnit})`, plotX + 6, plotY + 12, {
      fill: Colors.textMuted,
      font: '10px "Segoe UI", Roboto, sans-serif',
      baseline: 'top'
    });

    Renderer.drawText(ctx, `${this.xLabel} (${this.xUnit})`, plotX + plotW, plotY + plotH - 8, {
      fill: Colors.textMuted,
      font: '10px "Segoe UI", Roboto, sans-serif',
      align: 'right',
      baseline: 'bottom'
    });

    ctx.restore();
  }
}

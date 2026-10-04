// Canvas Text Measurement and Text Wrapping Engine for PhysicsLab
// Pure Canvas text layout — ZERO DOM / HTML created

export class TextEngine {
  static measureText(ctx, text, font) {
    if (!text) return 0;
    ctx.save();
    if (font) ctx.font = font;
    const width = ctx.measureText(String(text)).width;
    ctx.restore();
    return width;
  }

  static fitFontSize(ctx, text, maxWidth, startFontSize = 14, minFontSize = 9, fontFamily = '"Segoe UI", Roboto, sans-serif', fontWeight = '600') {
    if (!text || maxWidth <= 0) {
      return { fontSize: minFontSize, font: `${fontWeight} ${minFontSize}px ${fontFamily}` };
    }

    ctx.save();
    let size = startFontSize;
    while (size > minFontSize) {
      const font = `${fontWeight} ${size}px ${fontFamily}`;
      ctx.font = font;
      const width = ctx.measureText(String(text)).width;
      if (width <= maxWidth) {
        ctx.restore();
        return { fontSize: size, font };
      }
      size -= 0.5;
    }
    ctx.restore();

    return {
      fontSize: minFontSize,
      font: `${fontWeight} ${minFontSize}px ${fontFamily}`
    };
  }

  static wrapText(ctx, text, maxWidth, font = '13px "Segoe UI", Roboto, sans-serif', lineGap = 4) {
    if (!text || maxWidth <= 0) return { lines: [], totalHeight: 0, lineHeight: 16 };

    const fontStr = typeof font === 'string' ? font : (font?.font || '13px "Segoe UI", Roboto, sans-serif');

    ctx.save();
    ctx.font = fontStr;

    const fontSizeMatch = fontStr.match(/(\d+)px/);
    const fontSize = fontSizeMatch ? parseInt(fontSizeMatch[1], 10) : 13;
    const lineHeight = Math.round(fontSize * 1.3) + lineGap;

    const rawParagraphs = String(text).split('\n');
    const lines = [];

    for (const para of rawParagraphs) {
      if (para.trim() === '') {
        lines.push('');
        continue;
      }

      const words = para.split(' ');
      let currentLine = '';

      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        if (!word) continue;

        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = ctx.measureText(testLine).width;

        if (testWidth <= maxWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            lines.push(currentLine);
            currentLine = '';
          }

          // Check if single word exceeds maxWidth
          const wordWidth = ctx.measureText(word).width;
          if (wordWidth > maxWidth) {
            // Break long word into characters
            let part = '';
            for (let c = 0; c < word.length; c++) {
              const testPart = part + word[c];
              if (ctx.measureText(testPart + '-').width <= maxWidth) {
                part = testPart;
              } else {
                lines.push(part + '-');
                part = word[c];
              }
            }
            currentLine = part;
          } else {
            currentLine = word;
          }
        }
      }

      if (currentLine) {
        lines.push(currentLine);
      }
    }

    ctx.restore();

    return {
      lines,
      lineHeight,
      totalHeight: Math.max(lineHeight, lines.length * lineHeight)
    };
  }

  static drawWrappedText(ctx, text, x, y, maxWidth, options = {}) {
    if (!text || maxWidth <= 0) return 0;

    const font = options.font || '13px "Segoe UI", Roboto, sans-serif';
    const fill = options.fill || '#E5E7EB';
    const align = options.align || 'left';
    const lineGap = options.lineGap || 4;
    const maxHeight = options.maxHeight || Infinity;

    const wrapped = this.wrapText(ctx, text, maxWidth, font, lineGap);

    ctx.save();
    ctx.font = font;
    ctx.fillStyle = fill;
    ctx.textAlign = align;
    ctx.textBaseline = 'top';

    let currentY = y;
    let renderedHeight = 0;

    for (const line of wrapped.lines) {
      if (currentY + wrapped.lineHeight > y + maxHeight) {
        // Truncate with ellipsis if maxHeight reached
        ctx.fillText('...', x, currentY);
        renderedHeight += wrapped.lineHeight;
        break;
      }

      if (line !== '') {
        let drawX = x;
        if (align === 'center') drawX = x + maxWidth / 2;
        if (align === 'right') drawX = x + maxWidth;
        ctx.fillText(line, drawX, currentY);
      }
      currentY += wrapped.lineHeight;
      renderedHeight += wrapped.lineHeight;
    }

    ctx.restore();
    return renderedHeight;
  }
}

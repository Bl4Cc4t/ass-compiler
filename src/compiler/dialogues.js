import { compileText } from './text.js';
import { assign } from '../utils.js';

export function compileDialogues({ styles, dialogues }) {
  let minLayer = Infinity;
  const results = [];
  for (let i = 0; i < dialogues.length; i++) {
    const dia = dialogues[i];
    if (dia.Start >= dia.End) {
      continue;
    }
    const stl = styles[dia.Style] ? styles[dia.Style].style : styles["Default"].style
    const compiledText = compileText({
      styles,
      name: dia.Style,
      parsed: dia.Text.parsed,
      start: dia.Start,
      end: dia.End,
    });
    const alignment = compiledText.alignment || stl.Alignment;
    minLayer = Math.min(minLayer, dia.Layer);
    results.push(assign({
      layer: dia.Layer,
      start: dia.Start,
      end: dia.End,
      // reset style by `\r` will not effect margin and alignment
      margin: {
        left: dia.MarginL, //|| stl.MarginL,
        right: dia.MarginR, //|| stl.MarginR,
        vertical: dia.MarginV //|| stl.MarginV,
      },
      effect: dia.Effect,
      actor: dia.Name,
      isComment: dia.isComment
    }, compiledText, { alignment }));
  }
  for (let i = 0; i < results.length; i++) {
    results[i].layer -= minLayer;
  }
  return results //results.sort((a, b) => a.start - b.start || a.end - b.end);
}

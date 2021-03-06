import { parseDialogue } from './dialogue.js';
import { parseFormat } from './format.js';
import { parseStyle } from './style.js';

export function parse(text) {
  const tree = {
    info: {},
    garbage: {},
    styles: { format: [], style: [] },
    events: { format: [], comment: [], dialogue: [] },
  };
  const lines = text.split(/\r?\n/);
  let state = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (/^;/.test(line)) continue;

    if (/^\[Script Info\]/i.test(line))                   state = 1
    else if (/^\[Aegisub Project Garbage\]/i.test(line))  state = 2
    else if (/^\[V4\+? Styles\]/i.test(line))             state = 3
    else if (/^\[Events\]/i.test(line))                   state = 4
    else if (/^\[.*\]/.test(line))                        state = 0

    if (state === 0) continue;
    if (state === 1) {
      if (/:/.test(line)) {
        const [, key, value] = line.match(/(.*?)\s*:\s*(.*)/);
        tree.info[key] = value;
      }
    }
    if (state === 2) {
      if (/:/.test(line)) {
        const [, key, value] = line.match(/(.*?)\s*:\s*(.*)/)
        tree.garbage[key] = value
      }
    }
    if (state === 3) {
      if (/^Format\s*:/i.test(line)) {
        tree.styles.format = parseFormat(line);
      }
      if (/^Style\s*:/i.test(line)) {
        tree.styles.style.push(parseStyle(line));
      }
    }
    if (state === 4) {
      if (/^Format\s*:/i.test(line)) {
        tree.events.format = parseFormat(line);
      }
      if (/^(?:Comment|Dialogue)\s*:/i.test(line)) {
        const [, key, value] = line.match(/^(\w+?)\s*:\s*(.*)/i);
        tree.events["dialogue"].push(parseDialogue(value, tree.events.format, key == "Comment" ? true : false));
      }
    }
  }

  return tree;
}

import { compileDrawing } from './drawing.js';
import { compileTag } from './tag.js';
import { assign } from '../utils.js';

const a2an = [
  null, 1, 2, 3,
  null, 7, 8, 9,
  null, 4, 5, 6,
];

const globalTags = ['r', 'a', 'an', 'pos', 'org', 'move', 'fade', 'fad', 'clip'];

function createSlice(name, styles) {
  return {
    style: name,
    // borderStyle: styles[name].style.BorderStyle,
    // tag: styles[name].tag,
    fragments: [],
  };
}

export function compileText({ styles, name, parsed, start, end }) {
  let alignment;
  let pos;
  let org;
  let move;
  let fade;
  let clip;
  const slices = [];
  let slice = createSlice(name, styles);
  let prevTag = {};
  for (let i = 0; i < parsed.length; i++) {
    const { tags, text, drawing } = parsed[i];
    let reset;
    for (let j = 0; j < tags.length; j++) {
      const tag = tags[j];
      reset = tag.r === undefined ? reset : tag.r;
    }
    const fragment = {
      tag: reset === undefined ? JSON.parse(JSON.stringify(prevTag)) : {},
      text,
      drawing: drawing.length ? compileDrawing(drawing) : null,
    };
    for (let j = 0; j < tags.length; j++) {
      const tag = tags[j];
      alignment = alignment || a2an[tag.a || 0] || tag.an;
      pos = move ? move : pos || compileTag(tag, 'pos');
      org = org || compileTag(tag, 'org');
      move = pos ? pos : move || compileTag(tag, 'move');
      fade = fade || compileTag(tag, 'fade') || compileTag(tag, 'fad');
      clip = compileTag(tag, 'clip') || clip;
      const key = Object.keys(tag)[0];
      if (key && !~globalTags.indexOf(key)) {
        const { c1, c2, c3, c4 } = styles[slice.style] ? styles[slice.style].tag : styles["Default"].tag
        const fs = prevTag.fs || styles[slice.style] ? styles[slice.style].tag.fs : styles["Default"].tag.fs
        const compiledTag = compileTag(tag, key, { start, end, c1, c2, c3, c4, fs });
        if (key === 't') {
          fragment.tag.t = fragment.tag.t || [];
          fragment.tag.t.push(compiledTag.t);
        } else {
          assign(fragment.tag, compiledTag);
        }
      }
    }
    prevTag = fragment.tag;
    if (reset !== undefined) {
      slices.push(slice);
      slice = createSlice(styles[reset] ? reset : name, styles);
    }
    if (fragment.text || fragment.drawing) {
      const prev = slice.fragments[slice.fragments.length - 1] || {};
      if (prev.text && fragment.text && !Object.keys(fragment.tag).length) {
        // merge fragment to previous if its tag is empty
        prev.text += fragment.text;
      } else {
        slice.fragments.push(fragment);
      }
    }
  }
  slices.push(slice);

  return assign({ alignment, slices }, pos, org, move, fade, clip);
}

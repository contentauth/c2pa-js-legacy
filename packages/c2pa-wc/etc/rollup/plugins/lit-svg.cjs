/**
 * Copyright 2021 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

const { flow, camelCase, upperFirst } = require('lodash/fp');
const { optimize } = require('svgo');
const { readFileSync } = require('fs');
const path = require('path');
const prettier = require('prettier');
const { createFilter } = require('@rollup/pluginutils');

const classCase = flow([camelCase, upperFirst]);

const colorOverrides = [
  'removeDimensions',
  {
    name: 'removeViewBox',
    active: false,
  },
  {
    name: 'addAttributesToSVGElement',
    params: {
      attributes: [
        {
          preserveAspectRatio: 'xMidYMid meet',
        },
        {
          part: 'svg',
        },
      ],
    },
  },
];

const monochromeOverrides = [
  ...colorOverrides,
  'removeStyleElement',
  {
    name: 'removeAttrs',
    params: {
      attrs: ['id', 'stroke', 'fill'],
    },
  },
];

function renderElement({ prefix, isMonochrome, name, svg }) {
  const className = `Icon${classCase(name)}`;
  const elementName = name.replace(/(-|_|\s)+/g, '-');
  const code = `
    import { LitElement, html, css } from 'lit';

    export default class ${className} extends LitElement {
      static get styles() { 
        return css\`
          :host {
            display: inline-block;
            width: var(--cai-icon-width, 16px);
            height: var(--cai-icon-height, 16px);
          }

          svg {
            width: 100%;
            height: 100%;
            fill: var(--cai-icon-fill, currentColor);
          }

          path { 
            ${isMonochrome ? `fill: inherit;` : ``}
          }
        \`;
      }
    
      render() {
        return html\`${svg}\`;
      }
    }

    customElements.define('${prefix}-icon-${elementName}', ${className});
  `;
  return prettier.format(code, { parser: 'typescript' });
}

function rollupLitSvg(options = {}) {
  const filter = createFilter(options.include, options.exclude);

  return {
    name: 'rollup-lit-svg',
    transform(_, id) {
      if (!filter(id) || path.extname(id) !== '.svg') {
        return null;
      }

      try {
        // We load this here instead of using the arg in transform since Vite
        // keeps inlining it instead of keeping it as is (probably due to the
        // fact that we are in library mode)
        const svg = readFileSync(id).toString();
        const { name, dir } = path.parse(id);
        const isMonochrome = dir.split(path.sep).includes('monochrome');
        const overrides = isMonochrome ? monochromeOverrides : colorOverrides;
        const config = { path: id, plugins: ['preset-default', ...overrides] };
        const optimized = optimize(svg.trim(), config);
        if (optimized.error) {
          throw new Error(optimized.error);
        }
        const code = renderElement({
          name,
          isMonochrome,
          svg: optimized.data,
          prefix: options.prefix || 'cai',
        });

        return { code };
      } catch (err) {
        const message = `Could not process SVG file: ${id}`;
        const position = parseInt(/[\d]/.exec(err.message)[0], 10);
        this.warn({ message, id, position });
        return null;
      }
    },
  };
}

module.exports = rollupLitSvg;

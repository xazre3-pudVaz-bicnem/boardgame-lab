import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

/** 生成物と、Nextの型定義は検査しない。スクリプトはNode用なのでブラウザ向けの規則を当てない。 */
const config = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: ['.next/**', 'node_modules/**', 'data/**', 'public/**', 'scripts/**', 'next-env.d.ts'],
  },
];

export default config;

export * from './define.mjs';
export * from './Extern.mjs';

import { Token } from './Instruction.mjs';

export const isToken = (any) => any instanceof Token;

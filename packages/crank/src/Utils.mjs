
import { U } from '@produck/mold';

export const TypeError = U.throwError;

export const RuntimeError = (message, scope) => {
	throw `In ${scope}, ${message}`;
};

export const Instance = (any, constructor) => any instanceof constructor;

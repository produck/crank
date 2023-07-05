
import { U } from '@produck/mold';

export const TypeError = U.throwError;

export const RuntimeError = (message) => {
	throw new Error(message);
};

export const Instance = (any, constructor) => any instanceof constructor;

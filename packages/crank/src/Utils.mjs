
import { U } from '@produck/mold';

export const TypeError = U.throwError;

export const RuntimeError = (e) => {
	throw e;
};

export const Instance = (any, constructor) => any instanceof constructor;

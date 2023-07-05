import { Extern } from './Extern.mjs';
import { S, P, Cust, Normalizer, PROPERTY, U } from '@produck/mold';

const DEFAULT_CALL = (_s, _sc, next) => next();

const OptionsSchema = Cust(S.Object({
	name: P.String('Crank'),
	call: P.Function(DEFAULT_CALL),
	Extern: P.Function(Extern),
	abort: P.Function(() => false),
}), (_value, _empty, next) => {
	const options = next();
	const { Extern: _Extern } = options;
	const isExtern = _Extern === Extern;
	const isCustomExtern = Object.prototype.isPrototypeOf.call(Extern, _Extern);

	if (!isExtern && !isCustomExtern) {
		U.throwError('.Extern', 'CustomExtern or Extern');
	}

	return options;
});

export const normalizeOptions = Normalizer(OptionsSchema);

const ExecutorsSchema = S.Object({
	[PROPERTY]: P.Function(),
});

export const normalizeExecutors = Normalizer(ExecutorsSchema);

const GeneratorFunction = (function* () {}).constructor;

const ScriptSchema = S.Object({
	main: P.Instance(GeneratorFunction),
	[PROPERTY]: P.Instance(GeneratorFunction),
});

export const normalizeProgram = Normalizer(ScriptSchema);

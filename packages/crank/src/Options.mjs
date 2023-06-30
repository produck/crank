import { Context } from './Context.mjs';
import { S, P, Cust, Normalizer, PROPERTY, U } from '@produck/mold';

const DEFAULT_CALL = (_s, _sc, next) => next();

const OptionsSchema = Cust(S.Object({
	name: P.String('Crank'),
	call: P.Function(DEFAULT_CALL),
	Context: P.Function(Context),
}), (_value, _empty, next) => {
	const options = next();

	if (options.Context !== Context && !Object.prototype.isPrototypeOf.call(Context, options.Context)) {
		U.throwError('.Context', 'sub class of Context');
	}

	return options;
});

export const normalizeOptions = Normalizer(OptionsSchema);

const ExecutorSchema = S.Object({
	[PROPERTY]: P.Function(),
});

export const normalizeExecutors = Normalizer(ExecutorSchema);

const GeneratorFunction = (function* () {}).constructor;

const ScriptSchema = S.Object({
	main: P.Instance(GeneratorFunction),
	[PROPERTY]: P.Instance(GeneratorFunction),
});

export const normalizeScript = Normalizer(ScriptSchema);

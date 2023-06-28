import Crank from '@produck/crank'

const custom = Crank('testEngine', {}, { scope: function () {}, call: function () {} });

console.log(custom, custom.name)

export const compare2 = function () {
	return true;
};


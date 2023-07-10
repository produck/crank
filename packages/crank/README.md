![GitHub Workflow Status (with event)](https://img.shields.io/github/actions/workflow/status/produck/crank/node.js.yml)
![Coveralls branch](https://img.shields.io/coverallsCoverage/github/produck/crank)
![npm (scoped)](https://img.shields.io/npm/v/%40produck/crank)
![npm](https://img.shields.io/npm/dm/%40produck/crank)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)
[![NPM](https://img.shields.io/npm/l/@produck/crank)](https://opensource.org/licenses/MIT)

# crank
The framework is to generate program execution engine. You should provide `executors`, `program` and `extern` that is customized. By providing as mentioned above, you can customize the functions of engine. And then you will get the result of execution.THe execution of program support async function and common functon.

## Installation
```
$ npm install @produck/crank
```

## Examples

```js
import * as Crank from '@produck/crank';

const CustomEngine = Crank.defineEngine({}, {
	a: async (process) => {
		return 'pass';
	},
});

const extern = new CustomEngine.Extern();
const vm = new CustomEngine();

const ret = vm.execute({
	*SAT() {
		return yield this._a();
	},
	*main() {
		return yield this.SAT();
	},
}, extern).then(value => {
	console.log(value); // 'pass'
});
```

## Usage
### Import & Require
As esModule,
```js
import {
	defineEngine, define,
	Extern,
	isToken
} from '@produck/crank';
// Or
import * as Crank from '@produck/crank';
```

As CommonJS,
```js
const {
	defineEngine, define,
	Extern,
	isToken
} = require('@produck/crank');
// Or
const Crank = require('@produck/crank');
```

### Creating a Engine class by default options
```js
import * as Crank from '@produck/crank';

const Engine = Crank.define();
```
### Creating a Engine class by custom options
You can customize Engine features by custom options.

`options.name`: the name of Engine class.\
`options.call`: customized the calling of functions.\
`options.Extern`: customized Extern, should be subclass of Crank.Extern.\
`options.abort`: customize when to abort the running program.
```js
import * as Crank from '@produck/crank';

const Engine = Crank.define({
	name: 'CustomEngine',
	call: async (process, nextFrame, next) => await next(),
	Extern,
	abort: (lastInstruction) => false;
});
```

### Creating a Engine class by custom executors
You can customize Engine functions by custom executors.

The item of executors should be async function or common functon.
```js
import * as Crank from '@produck/crank';

const Engine = Crank.define({}, {
	async b() {
		return Promise.resolve(1);
	},
	a() {
		return 1;
	}
});
```

### Execute a program
You can execute program and get returnValue.

The function of program should be `GeneratorFunction` or `AsyncGeneratorFunction`.\
The `main` function is required.\
The executors should be calling by `this._[executorName]`.\
The function of program should be calling by `this.[functionName]`.

The extern should be the instance of `Engine.Extern`.
```js
import * as Crank from '@produck/crank';

const Engine = Crank.define({}, {
	a() {
		return 1;
	}
});
const vm = new Engine();

const program = {
	*main() {
		return yield this._a();
	}
};
const extern = new Engine.Extern();

vm.execute(program, extern).then(val => {
	console.log(val); // 1
});
```

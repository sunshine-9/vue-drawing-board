# vue-drawing-borad

[![Build Status](https://badgen.net/travis/whb/vue-drawing-borad/master)](https://travis-ci.com/whb/vue-drawing-borad)
[![NPM Download](https://badgen.net/npm/dm/@whb/vue-drawing-borad)](https://www.npmjs.com/package/@whb/vue-drawing-borad)
[![NPM Version](https://badge.fury.io/js/%40whb%2Fvue-drawing-borad.svg)](https://www.npmjs.com/package/@whb/vue-drawing-borad)
[![NPM License](https://badgen.net/npm/license/@whb/vue-drawing-borad)](https://github.com/whb/vue-drawing-borad/blob/master/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/whb/vue-drawing-borad/pulls)
[![Automated Release Notes by gren](https://img.shields.io/badge/%F0%9F%A4%96-release%20notes-00B2EE.svg)](https://github-tools.github.io/github-release-notes/)

short description + sample image(png/gif/mp4)

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Install](#install)
- [Usage](#usage)
- [Links](#links)
- [Contributing](#contributing)
- [Contributors](#contributors)
- [License](#license)

## Introduction

If there is no more words to write, this section can be deleted.

[⬆ Back to Top](#table-of-contents)

## Features

[⬆ Back to Top](#table-of-contents)

## Install


```
npm i vue-drawing-board -S
```

[⬆ Back to Top](#table-of-contents)

## Usage

```
// main.js
import VueDrawingBoard from 'vue-drawing-board';
Vue.use(VueDrawingBoard)

// 组件中直接引入
<vue-drawing-board />

// 初始图片加载
<vue-drawing-board :img-url="curImgUrl"/>

<vue-drawing-board :img-url="curImgUrl" :width="curW" :height="curH"/>

<vue-drawing-board :img-url="curImgUrl" @save="cusSaveFuc"/>

save(base64Img)

```

[⬆ Back to Top](#table-of-contents)

## Links

- [docs](https://whb1.github.io/vue-drawing-borad/)

[⬆ Back to Top](#table-of-contents)

## Contributing

For those who are interested in contributing to this project, such as:

- report a bug
- request new feature
- fix a bug
- implement a new feature


[⬆ Back to Top](#table-of-contents)

## Contributors

Thanks goes to these wonderful people 

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the specification. Contributions of any kind welcome!

[⬆ Back to Top](#table-of-contents)

## License

[MIT](./LICENSE)

[⬆ Back to Top](#table-of-contents)

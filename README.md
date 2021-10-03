# EZYNC

A library for handling asynchronous task with easy

## Installation

NPM

```js
npm i ezync --save
```

YARN

```js
yarn add ezync
```

## Usages

### Basic usage

```js
import { ezync } from "ezync";

async function fetchData() {
  const [data, error] = await ezync(axios.get("/api/get/data"));
  if (error) {
    throw error;
  }
  return data;
}
```

### Default promise result

```js
import { ezync } from "ezync";

async function fetchData(defaultData) {
  const [data = defaultData] = await ezync(axios.get("/api/get/data"));
  return data;
}
```

### Cancellable promise

```js
import { ezync } from "ezync";

async function fetchData() {
  const promise = ezync(axios.get("/api/get/data"));
  setTimeout(promise.cancel, 5000);
  const [data] = await promise;
  // this line cannot be reach if the ajax request takes longer than 5s
  return data;
}
```

### Cancellable ajax request (using Axios)

```js
import { ezync } from "ezync";
import { CancelToken } from 'axios';

async function fetchData() {
  const { cancel, token } = CancelToken.source();
  return ezync(axios.get("/api/get/data", { cancelToken: token }), cancel);
}
```

### Cancellable ajax request (using fetch)

```js
import { ezync } from "ezync";

async function fetchData() {
  const ctrl = new AbortController();
  return ezync(fetch("/api/get/data", { signal: ctrl.signal }), () => ctrl.abort());
}
```


### Chaining

```js
import { ezync } from "ezync";

async function fetchData1() {
  return ezync(fetch("/api/get/data"))
    .then(res => res.json())
    .then(json => json.data);
}

async function fetchData2() {
  return ezync(fetch("/api/get/data")).chain(
    res => res.json(),
    json => json.data
  );
}

const p1 = fetchData1(); // normal promise
const p2 = fetchData2(); // cancellable promise. p2.cancel()
```
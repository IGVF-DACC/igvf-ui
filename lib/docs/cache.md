# Cache Library

## Introduction

This project has two servers:

1. The backend server (igvfd) that contains the primary database and a REST API to access database objects.
1. The Next.js UI server that generates the HTML and Javascript sent to the user’s browser.

When you visit a typical page in your browser, the UI server fetches the object that the page represents from the backend server. The UI server uses that data to generate the HTML for the page and sends that to your browser.

Sometimes, the UI server fetches the same object from the backend server over and over, which puts a lot of stress on the backend server. This is especially true when multiple browsers are using the same object at the same time.

This cache library helps reduce this stress by storing certain frequently requested objects in a Redis database on the UI server. This data only travels between the UI server and users’ browsers — the data-provider doesn’t know any of that happens.

You can also use this cache to store data that’s not from the backend server, but for data you want to save across sessions, browsers, and devices. The Redis cache doesn’t guarantee that this data will stay there forever, so losing it shouldn’t hurt the user experience too much. For example, you could store a list of recent search terms for a user by putting the user’s ID in the Redis key for this data. Losing a list of recent search terms probably won’t bother the user much.

Code that uses this cache library only runs on the UI server -- it should never run in the browser.

## Usage Guide

To import this caching module into your project:

```typescript
import { getCachedDataFetch, getObjectCached, setCachedData } from "lib/cache";
```

## Module API Reference

### `getCachedDataFetch` Async Function

Request data from the backend, caching the data in the Redis database. The next time you request the same data (as identified by `key`), you retrieve it from the cache instead of sending the request to the backend. After a configurable amount of time, the cached data can expire, and a request goes to the backend server for fresh data that then gets cached until expiration. Code calling `getCachedDataFetch()` doesn't need to know whether the data came from the backend server or the cache.

The calling code supplies the fetcher function that issues the fetch request to the backend and returns it as a function result. The fetcher function only gets called on a cache miss. If anything goes wrong, `getCachedDataFetch()` expects a `null` from the fetcher function. `getCachedDataFetch()` doesn’t pass any arguments to the fetcher function so if it needs any, supply it in the calling function’s closure as demonstrated in the example below.

```typescript
getCachedDataFetch<T>(
  key:     string,
  fetcher: CacheFetcher<T>,
  ttl:     number
): Promise<T | null>
```

| Parameter | Type     | Required | Description                                                                                                               |
| --------- | -------- | -------- | ------------------------------------------------------------------------------------------------------------------------- |
| key       | string   | Yes      | Identifier for cached data, unique to each object you request from the backend.                                           |
| fetcher   | function | Yes      | Asynchronous function that gets called on a cache miss to request the data from the backend.                              |
| ttl       | number   | No       | Number of seconds before the cached data expires, causing the next request to go to the backend. The default is one hour. |

### Example

```typescript
async function fetchLabData(cookie: string, queryString: string): Promise<Data | null> {
  // Send a fetch request to the backend and return it as a function result. `getCacheData()`
  // caches this data before returning it to the caller. The next time the caller calls
  // `getCachedDataFetch()` with the same key, `getCachedDataFetch()` doesn't call this function
  // unless `THIRTY_SECOND_TTL` has passed, instead getting the requested data from the Redis cache.
}

const THIRTY_SECOND_TTL = 30;
const cookie = req.headers.cookie;
const queryString = `labId=${id}`;
const labData = await getCachedDataFetch<LabData>(
  `lab-${labId}`
  async () => fetchLabData(cookie, queryString),
  THIRTY_SECOND_TTL,
);

// You do not have to `await fetchLabData(...)` because this expression returns a value in an
// async context. The `await` would be redundant.
```

### `getObjectCached` Async Function

Convenience function for fetching and caching an object from a path on the backend server. Use it very similarly to `getCachedDataFetch()` but instead of passing it a fetcher function, just pass the path to an object on the backend server. `getObjectCached()` provides a standard fetcher function to fetch this object on a cache miss.

```typescript
getObjectCached<T>(
  cookie: string,
  key:    string,
  path:   string,
  ttl?:   number
): Promise<T | null> {
```

| Parameter | Type   | Required | Description                                                                                                                |
| --------- | ------ | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| cookie    | string | Yes      | Cookie from the `getServerSideProps()` `req` argument.                                                                     |
| key       | string | Yes      | Identifier for cached data, unique to each object you request from the backend.                                            |
| path      | string | Yes      | Path to the backend object to fetch and cache.                                                                             |
| ttl       | number | No       | Number of seconds before the cached data expires, causing the next request to go to the back end. The default is one hour. |

### Example

```typescript
const SIXTY_SECOND_TTL = 60;
const cookie = req.headers.cookie;
const labData = await getObjectCached<LabData>(
  cookie,
  `lab-${labId}`,
  `/lab/${labId}`,
  SIXTY_SECOND_TTL
);
```

### `getCachedData` Async Function

Retrieves data cached by the `setCachedData()` function. Use this to cache data that doesn't involve data from the backend. Examples include user preferences, prior search terms, etc.

```typescript
getCachedData<T>(
  key: string
): Promise<T | null> {
```

| Parameter | Type   | Required | Description                                                   |
| --------- | ------ | -------- | ------------------------------------------------------------- |
| key       | string | Yes      | Identifier for cached data, unique to the data you've cached. |

### Example

```typescript
const userPreference = await getCachedData<UserPreference>(
  "user-preference-chris_robin"
);
```

### `setCachedData` Async Function

Caches data in the Redis database under a unique key. You can then retrieve this data using `getCachedData()`.

```typescript
setCachedData(
  key:  string,
  data: unknown,
  ttl:  number
): Promise<void> {
```

| Parameter | Type    | Required | Description                                                                                        |
| --------- | ------- | -------- | -------------------------------------------------------------------------------------------------- |
| key       | string  | Yes      | Identifier for cached data, unique to the data to cache.                                           |
| data      | unknown | Yes      | Data to cache to the Redis database. You can use any serializable type.                            |
| ttl       | number  | No       | Number of seconds before the cached data expires, effectively deleting it from the Redis database. |

### Example

```typescript
const ONE_HOUR_TTL = 3600;
const userPreference = { darkMode: true; };
setCachedData("user-preference-chris_robin", userPreference, ONE_HOUR_TTL);

// Though `setCachedData()` is async it returns no value, so you don't necessarily have to await
// it unless the following code depends on the caching operation to complete.
```

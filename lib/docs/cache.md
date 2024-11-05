# Cache Library

## Introduction

This project has two servers:

1. The data-provider server that contains the primary database and a REST API to access database objects.
1. The UI server that generates the HTML and Javascript sent to the user’s browser.

When you visit a typical page in your browser, the UI server asks the data-provider server for the object you want. The UI server uses that data to make the HTML that your browser sees.

Sometimes, the UI server asks the data-provider server for the same object over and over, which puts a lot of stress on the data-provider server. This is especially true when multiple browsers are using the same object at the same time. This cache library helps reduce this stress by storing these objects in a Redis database on the UI server. This data only travels between the UI server and users’ browsers — the data-provider doesn’t know any of that happens.

You can also use this cache to store data that’s not for the data-provider server, but for browser data you want to save across sessions, browsers, and devices. The Redis cache doesn’t guarantee that this data will stay there forever, so losing it shouldn’t hurt the user experience too much. For example, you could store a list of recent search terms for a user by putting the user’s ID in the Redis key for this data. Losing a list of recent search terms probably won’t bother the user much.

Code that uses this cache library only runs on the UI server -- it should never run in the browser.

## Usage Guide

To import this caching module into your project:

```typescript
import { ServerCache, retrieveCacheBackedData } from "lib/cache";
```

`retrieveCacheBackedData` is a utility function for simple cases of caching data-provider objects.

## API Reference

### `ServerCache` Class

Use this class to cache data-provider objects, as well as to store browser data.

#### Example Usage For Saving Browser Data

```typescript
// This item stored under the `browser-data-key` ID.
const cacheRef = new ServerCache("browser-data-key");
cacheRef.setData({ test: "data" });
...
const cachedObject = cacheRef.getData();
```

#### Example Usage For Caching Data-Provider Objects

```typescript
// Called to fetch the object from the data provider on a cache miss.
function fetchCacheBackedData(request: FetchRequest) {
  const data = (await request.getObject("/object/path")).optional();
  return data ? JSON.stringify(data) : null;
}

const request = new FetchRequest({ cookie });
const cacheRef = new ServerCache("cached-data-key");
cacheRef.setFetchConfig(fetchCacheBackedData, request);
// Get data from the cache, or from the data provider on a cache miss.
return await cacheRef.getData();
```

#### constructor

| parameter      | description                                                                                                                                |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `key` (string) | The unique key to store a data item under in the Redis database.                                                                           |
| `ttl` [number] | Number of seconds before the data item gets automatically purged from the Redis database. The default value is for one hour (3600 seconds) |

##### Example

```typescript
const cacheRef = ServerCache("example-key", 60);
```

#### `setFetchConfig`

For `ServerCache` instances intended to cache data from the data provider, call this method to allow this to happen. When you get data from the `ServerCache` instance, the arguments you pass this method allow `ServerCache` to request the data from the data provider if it doesn’t exist in the cache.

| parameter                | description                                                                                    |
| ------------------------ | ---------------------------------------------------------------------------------------------- |
| `fetchData` (function)   | Called by the `ServerCache` instance to fetch an object from the data provider on a cache miss |
| `request` (FetchRequest) | `FetchRequest` object for communicating with the data provider                                 |
| `meta` [object]          | Passes arbitrary data to `fetchData` if needed                                                 |

The `fetchData` parameter references a function you supply to request the data from the data provider.

The type signature for `fetchData` is:

```typescript
(request: FetchRequest, meta?: Record<string, any>) => Promise<string | null>;
```

`request` and `meta` contain copies of the arguments you passed to `setFetchConfig`. Notice `fetchData` must return a string. That includes regular strings, numbers converted to JSON stingified strings, or JSON stringified objects or arrays. If this function can’t retrieve the data, it must return null.

#### Example Usage to Fetch and Cache an Object From a Dynamic Path

```typescript
// Called to fetch the object from the data provider on a cache miss.
function fetchCacheBackedData(request: FetchRequest, meta: { path: string }) {
  const data = (await request.getObject(meta.path)).optional();
  return data ? JSON.stringify(data) : null;
}

const path = "/some/path";
const request = new FetchRequest({ cookie });
const cacheRef = new ServerCache("cached-data-key");
cacheRef.setFetchConfig(fetchCacheBackedData, request, { path });
const data = await cacheRef.getData();
```

#### `clearFetchConfig`

If you had used a `ServerCache` instance to cache data for the data provider, and now you want to use this instance to store data in the Redis database, call this function to do that conversion. You probably won’t ever use this capability.

#### Example Usage to Convert a Data-Provider Cache Instance to Redis Storage

```typescript
const request = new FetchRequest({ cookie });
const cacheRef = new ServerCache("cached-data-key");
cacheRef.setFetchConfig(fetchCacheBackedData, request, { path });
const data = await cacheRef.getData();
...
cacheRef.clearFetchConfig();
```

#### `getData`

Retrieves data for the instance’s key from Redis database if it exists. For `ServerCache` instances with a fetch configuration, if the data doesn’t exist in the Redis database, `getData` then calls the `fetchData` function you passed in the `setFetchConfig` method to request this data from the data provider. Once this data gets received, it gets cached in the Redis database before it gets returned to you.

The type of the data returned from the cache matches the type of data passed to the `fetchData` function.

| parameter                  | description                                     |
| -------------------------- | ----------------------------------------------- |
| `options` [GetDataOptions] | Options for modifying the behavior of `getData` |

`GetDataOptions` is an object with this type signature:

```typescript
{
  forceFetch?: boolean;
}
```

Setting `forceFetch` to true causes `getData` to skip the cache for that request and get the data from the data provider instead.

#### `setData`

Puts the given data into the Redis database. This method does nothing if you had set a fetch config for this `ServerCache` instance.

| parameter        | description                |
| ---------------- | -------------------------- |
| `data` (unknown) | Data to put into the cache |

#### Example Usage

```typescript
const cacheRef = ServerCache("data-storage");
await cacheRef.setData({ test: "data" });
...
const data = cacheRef.getData();
// data === { test: "data" }
```

### `retrieveCacheBackedData`

This utility function retrieves a single object from the data provider, caches it in Redis, and ensures subsequent calls retrieve the cached data instead of fetching it from the server.

| parameter         | description                                                                |
| ----------------- | -------------------------------------------------------------------------- |
| `cookie` (string) | Authentication cookie from NextJS for the authenticated request, if needed |
| `key` (string)    | Unique ID to associate with the data                                       |
| `path` (string)   | Path to the object on the data provider                                    |

#### Example Usage

```typescript
export async function getServerSideProps({ req }) {
  const data = retrieveCachedBackedData(
    req.headers.cookie,
    "data-key",
    "/data/path"
  );
  console.log("DATA", data);
}
```

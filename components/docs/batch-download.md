# Batch Download

This module controls the downloading of multiple files relevant to whatever the user sees — maybe an individual file set, or all the files within multiple file sets. We don’t have a mechanism to download multiple files directly from the UI. Instead, we download a manifest file with the paths of all relevant files as well as the path of a single metadata file that describes each of the files. The user then passes this manifest file to a command line to actually download all the relevant files.

If the user downloads files from an individual file set, from multiple file sets, or some other situation we haven’t defined yet, the URL to generate the relevant manifest file might require different kinds of data. We call these different situations “batch-download scenarios” in the code.

The batch-download mechanism comprises three major components:

1. Actuator
2. Modal
3. Controller

## Actuator

The actuator displays and controls the button that lets the user begin the process of downloading the manifest file. Only one actuator exists across all batch-download scenarios — you don’t need to define a different actuator for different scenarios.

## Modal

The modal appears when the user clicks the actuator. The standard modal contents show instructions for the file-download mechanism, and displays a button to download the manifest file. Only one modal exists across all batch-download scenarios, but you can customize the modal’s contents either by adding to the standard modal contents, or by replacing the contents completely for specific scenarios.

## Controller

The controller defines the batch-download mechanism for specific scenarios. Each distinguishable scenario requires a specific batch-download controller. Different scenarios require different data to build the URL to the data-provider instance to initiate the batch download. The controller accepts data specific for each scenario and uses that data to build the URL in a way each scenario needs. The controller does the specific work so that you don’t have to change anything about the actuator nor the code to handle the modal for each scenario.

Almost certainly the controller mechanism needs more methods than currently defined to handle future scenarios.

## Batch Download Scenarios

Different parts of the UI need different kinds of URLs to initiate the batch-download process. Each of these distinguishable methods of building batch-download URLs goes by the name "batch-download scenario."

For example:

### Search Results Scenario

To download files from search results, you need:

1. the object type to collect the files from
2. optional query-string terms from the user’s facet selections

In this case the batch-download URL could look like:

`/batch-download/?type=AnalysisSet&file_set_type=intermediate+analysis&status=released`

### Individual File Set Scenario

To download the files associated with a single file set, you need:

1. the individual file-set object type
2. the path of the file set that the downloaded files associate with

In this case the batch-download URL could look like:

`/batch-download/?type=AnalysisSet&@id=/analysis-sets/IGVFDS2543RTRC/`

## Base Controller

The base batch-download controller comprises an abstract Typescript class that defines all the methods concrete batch-download controllers can use to build the batch-download URL specific for a scenario. Concrete controllers can extend the base controller and override methods as needed to generate the batch-download URL.

### Base-Controller Methods

When you create a concrete controller, you can override any or all of these methods to build a batch-download URL.

#### Syntax

**`constructor(query)`**

#### Parameters

**`query`** [required] `QueryString`

#### Returns

_none_

Pass a `QueryString` object, a copy of which gets stored within the controller — the original `QueryString` object you pass it does not get modified by the controller. This query string can help build the batch-download URL. If your controller needs to override the base controller constructor, it can take whatever parameters you need. But if your constructor calls the base controller constructor, it must provide this one `QueryString` object, even if it’s for the empty string.

<hr />

#### Syntax

**`buildQueryStrings()`**

#### Parameters

_none_

#### Returns

_none_

This method gets called by the `initiateDownload` method the moment the user clicks the “Download” button in the modal. If needed it takes data gathered in the constructor to build the query string for the batch-download operation. It must then put the result into a data member so that the `initiateDownload` method can format the query into a string for the batch-download URL, or this method can format the string itself — it’s up to you.

<hr />

#### Syntax

**`offerDownload`**

#### Parameters

_none_

#### Returns

`boolean`

This getter function determines whether the user can perform a batch download or not, returning `true` if they can. Usually, the component rendering the UI containing the batch-download actuator calls this getter function to determine whether it should render the actuator or not. This getter function can use data gathered in the constructor to determine whether conditions allow for batch download.

<hr />

#### Syntax

**`initiateDownloads()`**

Once the user clicks the “Download” button in the modal, the modal calls this method to start the batch download. In most cases this method does the final composition of the batch-download URL and assigns the result to `window.location.href` to start the download. This function, called in response to a user action, can never execute on the server, so it can assume the `window` DOM variable exists.

### Base-Controller Data Members

**`query`** `QueryString`

This keeps a clone of the query string object the user passed in. Child classes of the base batch-download controller must not modify this so that they can use it for knowing the original query string if needed.

**`downloadQuery`**

This gets initialized to the same value as `query`, but the child-class methods can modify this clone to build the final formatted query string for the batch-download URL.

## Making a New Concrete Controller

Extend the base controller to import its basic functionality so that you can extend the functionality for whatever needs this concrete controller satisfies.

The following example (mostly copied from `fileset-controller.ts`) uses most of the base controller’s functionality, but it also takes a file-set object as the first argument, and adds a `fileSet` data member. It overrides the `buildQueryStrings()` method to add a `type=` and `@id=` into the `downloadQuery` data member. The base class’s `initiateDownload()` method calls this overridden method, then uses its result to initiate the batch-download operation.

```typescript
import BaseController from "./base-controller";

export default class ConcreteController extends BaseController {
  private fileSet: DatabaseObject;

  constructor(fileSet: DatabaseObject, query?: QueryString) {
    super(query || new QueryString(""));
    this.fileSet = fileSet;
  }

  buildQueryStrings() {
    this.downloadQuery.addKeyValue("type", this.fileSet["@type"][0]);
    this.downloadQuery.addKeyValue("@id", this.fileSet["@id"]);
  }
}
```

## Batch-Download UI

When you need to add batch download to a UI element, you need to import two things:

1. the relevant batch-download controller from /lib/batch-download
2. the `BatchDownloadActuator` React component from /components/batch-download

The specific controller depends on what information you have for the download. At the time of this writing, we have two batch-download controllers:

- search results for the list and report views — needs the type of file set to search as well as any terms the user has selected from the facets
- individual file-set derived object — needs the type of file set the user views as well as its path

### Example React Component Including an Example Controller

```typescript
function Component({ query: QueryString }) {
  const controller = new RelevantController(query);

  return (
    <BatchDownloadActuator
      controller={controller}
      label="Example batch download"
      size="sm"
    />
  );
}
```

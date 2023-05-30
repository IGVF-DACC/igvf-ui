# Sortable Grid Component

The `SortableGrid` component renders a sortable (case insensitive) table of data with a header. Pass in an array of objects to render — one object per row — as well as a column-configuration object that describes the column headers as well as other aspects about each column. Example:

```javascript
// Array of objects to display in the table
const data = [
  {
    name: "First item",
    count: 5,
    description: "This is the first item",
    ontology: {
      term: 'HepG2',
      classification: 'cell line'
    }
    uuid: "84ec63e4-2c0b-4860-a47b-0a42b07b0c4e",
  },
  {
    name: "Second item",
    count: 2,
    description: "This is the second item",
    ontology: {
      "term_name": "cortex",
      "classification": "tissue"
    }
    uuid: "f0186254-504a-4f75-9489-aa1162e05d60",
  },
]

// Column configuration for the table
const columns = [
  {
    id: "name"
    title: "Name",
  },
  {
    id: "count",
    title: "Count",
  },
  {
    id: "description",
    title: "Description",
    isSortable: false,
  },
  {
    id: "ontology",
    title: "Ontology",
    value: (item) => `${item.ontology} / ${item.classification}`
  }
}

return (
  <DataGridContainer>
    <SortableGrid data={data} columns={columns} keyProp="uuid" />
  </DataGridContainer>
)
```

Expected output:

| Name        | Count | Description             | Ontology          |
| ----------- | ----- | ----------------------- | ----------------- |
| First item  | 5     | This is the first item  | HepG2 / cell line |
| Second item | 2     | This is the second item | context / tissue  |

<br>
<br>

## Column Configuration Array

You define the appearance and functionality of the table columns with the column-configuration array of objects. Each object in the array represents a column in the displayed table in left-to-right order. Use the following properties for each column configuration object:

---

**id** {string} required

Unique identifier for the column that must match the name of the property within each object that this column displays.

---

**title** {string | number | Component} required

Title to display in the column header. If you provide a React component, it gets rendered into the `RowComponent` property of the data-grid format, either the default one (`HeaderCell` below) or one you provide (`CustomHeaderCell` prop for `SortableGrid`). If you need control over the entire cell instead of just its contents, use the `CustomHeaderCell` prop. See the section “[Title Component Properties](#title-component-properties)” to see how to write this React component.

---

**isSortable** {boolean}

If you set this value to true, or don’t supply it at all, the user can click on the column’s header to sort it. If you specifically set this value to false, clicks in the column header do nothing, making this column not sortable.

---

**value** {function}

If the property in the object isn’t a primitive type — usually because it’s an array or object type — supply this function to transform the value to a primitive type. This function takes one parameter containing the whole data object for the cell being displayed. It returns the transformed primitive value which gets converted to lowercase (if needed) for case-insensitive sorting by `SortableGrid`.

```javascript
...
  {
    id: "biosample_ontology",
    title: "Biosample",
    value: (item) =>
      (item.biosample_ontology &&
        `${item.biosample_ontology.term_name} / ${item.biosample_ontology.classification}`) ||
      null,
  },
...
```

---

**sorter** {function}

If the values for the property don’t sort well with a regular case-insensitive string sort, provide a single-argument sorting function here. This function takes one parameter containing the whole data object for the cell being sorted. It returns a single value to use as a sorting key. Sorting by numeric value is a common use case.

```javascript
...
  {
    id: "age",
    title: "Age",
    sorter: (item) => Number(item.age),
  },
...
```

---

**display** {function}

Use this property if the data for the cell needs displaying with something more complex than a string, such as displaying a React component, or displaying different things depending on a condition. This function receives two parameters: 1) an object for the data-grid format cell for the cell being rendered; 2) The `meta` object passed to `SortableGrid`. See [Display Function Arguments](#display-function-arguments) for details and an example.

---

<br>
<br>

## <a name="title-component-properties"></a>Title Component Properties

When supplying a React component for a column configuration’s `title` property, this component receives the following props in addition to any you pass directly to the title component:

---

**columnConfiguration** {object}

The column configuration object for the column being rendered.

---

**sortBy** {string}

The current sorted column ID.

---

**sortDirection** {string}

The current sort direction; see `SORT_DIRECTIONS` constant in the code.

---

### Example:

```javascript
...
  {
    id: "count",
    title: <CountDisplay bold />
  },
...

const CountDisplay = ({ columnConfiguration, sortBy, sortDirection, bold }) => {
  return <div>...</div>
}
```

<br>
<br>

## <a name="display-function-arguments"></a>Display Function Arguments

The function you provide the `display` property of a column-configuration object receives these arguments:

---

**cell** {object}

The data-grid format cell object for the cell being rendered. See the documentation for data-grid for details. With sortable grid, in addition to the `id` and `content` properties, you also get the `source` property that refers to the original data object for this cell.

---

**meta** {object}

This holds the meta object you pass to `SortableGrid`, and in addition it holds:

- **sortBy** {string} — ID of the currently sorted column
- **columns** {object} — Entire `columns` object you pass to `SortableGrid`
- **sortDirection** {string} — Current sort direction; see `SORT_DIRECTIONS` in the code
- **handleSortClick** {function} — `SortableGrid`’s function to call to handle a click in a sortable header cell

---

### Example

```javascript
...
  {
    id: "description",
    title: "Description",
    display: (cell, meta) => {
      <DisplayComponent data={cell.source} columns={meta.columns}>
    },
  }
...
```

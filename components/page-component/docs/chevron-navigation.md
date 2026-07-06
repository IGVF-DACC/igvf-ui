# Chevron Component CHEVRON_NAV

This component places a horizontal navigation area into the page made up of horizontal chevrons, each with a specified color, letting you link each item to an external website, an internal page, or an anchor elsewhere on the page. The color of the text within gets set to black or white automatically based on the luminance of the background color you chose for each link.

![Demonstration of the chevron navigation page component](../../../public/pages/chevron-navigation-demo.png)

## Properties

All the properties of this page component define the titles, corresponding links, and chevron colors so you can have essentially any number of properties (menu items) you want. All the properties appear as `Title=link|color`, where the title specifies what the reader sees as a menu item, and clicking it goes to the link.

This menu acts responsively, adapting to the width of the viewport or container. Keep that in mind as you add more menu items that the items within could wrap to a second line, and then as many lines of links as needed to fit within the available width.

The link can take any of these three forms:

- An external site, e.g. `https://encodeproject.org/`
- An internal page, e.g. `/tissues/`
- An anchor on the page, e.g. `#tissue-biosamples`

Don’t use a full URL for internal pages (pages that exist in the data portal) — use the page path instead. Using the full URL loads all the HTML for the page (needed for external sites), while using the page path loads only the markdown content for the page.

Specify the required color of each button after a pipe character following the link. Use hex colors without the leading hash mark (#).

### Anchors

You can link to a header (`#`, `##`, etc.) elsewhere on the same page for the reader’s convenience. You add anchor tags by adding an anchor tag that looks like `{#tissue-biosamples}` to the end of the header line. You must separate the tag from the rest of the title with white space, an open brace, hash, then the kebab case ID you want for that tag which must be unique on the page. Here, an anchor named `tissue-biosamples` gets added to a level 2 header. The anchor tag must be separated from the header text with white space, normally a single space. Nothing can follow the anchor tag on the line, including whitespace. If the anchor tag doesn’t follow these rules, it appears as part of the header text and no anchor is generated in the HTML.

```
## Tissue Biosamples {#tissue-biosamples}
```

You can then use `#tissue-biosamples` as the link to have the browser scroll to this spot.

```
CHEVRON_NAV
Tissue Biosamples=#tissue-biosamples|0000ff
```

## Example

```
CHEVRON_NAV
First Topic=#first-topic|404080
Second Topic=/tissues/IGVFSM0000DDDD|c0c020
Third Topic=#third-topic|208c4f
Fourth Topic=https://www.genome.gov/|72c6c2
Fifth Topic=#fifth-topic|c92020
...
## First Topic {#first-topic}
...
### Third Topic {#third-topic}
...
## Fifth Topic {#fifth-topic}
```

“First Topic,” “Third Topic,” and “Fifth Topic” link to their anchors on the same page, so clicking them simply scrolls the page to those locations. “Second Topic” links to the IGVFSM0000DDDD tissue page on this site. “Fourth Topic” links to the NHGRI website.

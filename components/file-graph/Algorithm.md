// Build file set nodes
external files = determine which external files native files derive from
native nodes = generate nodes for native files

file set nodes = []
for each native file
for each external file it derives from
file sets = determine the file sets for those external files
for each file set
potential file set node = { external files for that file set }
if existing file set node has same external files
add native file to its metadata
else
add new file set node with native file for its metadata
update native file node with upstream file set node

At this point I have

- native file nodes with upstream file set node
- file set nodes with list of external files belonging to it

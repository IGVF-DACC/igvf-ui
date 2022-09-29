# Page Component VIDEO_YOUTUBE

This component lets you embed a YouTube video on the page. Because this site filters certain HTML before displaying the Markdown, you cannot use the YouTube embed code in this site’s Markdown because it also gets filtered out.

This VIDEO_YOUTUBE component generates the embed code without getting filtered, and makes YouTube embeds easier by requiring only minimal information about the video.

## Properties

**`id`** — required

Specify the ID of the YouTube video you want to embed.

```
id=8yrnf4oG95Y
```

You can get this by clicking the “Share” button under the video and then copying the code after the short YouTube domain, e.g.

```
https://youtu.be/8yrnf4oG95Y
```

Copy the `8yrnf4oG95Y` and use that as the id for this page component. You can also get this from the video’s URL by copying the code after the `v=`, e.g.

```
https://www.youtube.com/watch?v=8yrnf4oG95Y
```

**`start`** — optional — No default

Specifies where to start playing the video. You do this by giving the number of seconds from the start of the video

```
start=250
```

To get this number, first play the video to the point that you want the embedded video to start, then click the “Share” button under the video, click the “Start at” checkbox, then copy the number that appears after the `t=` in the short URL:

```
https://youtu.be/8yrnf4oG95Y?t=250
```

## Example

This embeds a video starting at 250 seconds into the video:

```
VIDEO_YOUTUBE
id=8yrnf4oG95Y
start=250
```

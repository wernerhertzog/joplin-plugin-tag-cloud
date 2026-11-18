# Tag Cloud for Joplin

Tag Cloud adds a panel to Joplin desktop that shows your tags as a cloud. Tags used on more notes appear larger. Hover over a tag to see its note count, or click it to show the associated notes.

## Requirements

- Joplin desktop 3.7.22 or newer. Tested on macOS with Joplin 3.7.22.
- The plugin is intended for desktop, not mobile.

## Install

### From Joplin's plugin directory

Once Tag Cloud is published in the directory, open **Settings / Preferences → Plugins**, search for **Tag Cloud**, click **Install**, and restart Joplin when prompted.

### From a file

1. Download the plugin's `.jpl` release file, or build it locally as described below.
2. In Joplin, open **Settings / Preferences → Plugins**.
3. Click the gear-shaped **Plugin tools** button and choose **Install from file**.
4. Select the `.jpl` file and restart Joplin when prompted. The Tag Cloud panel should appear.

## Use

- Choose **View → Toggle Tag Cloud** to show or hide the panel.
- Scroll inside the panel to browse all tags. Use the circular arrow to refresh the cloud.
- Hover over a tag to see the exact number of notes, and click it to open those notes in Joplin.
- To move the panel, choose **View → Change application layout**, drag the panel to a convenient location, and exit layout mode.

The cloud is a separate panel: Joplin's plugin API does not allow it to be placed inside the built-in sidebar. The existing tag list remains available. Tags with no associated notes are omitted. Font sizes reflect note counts on a logarithmic scale.

The cloud loads when opened and refreshes after synchronisation. When changing notes, it refreshes if its data is over 30 seconds old; use the refresh button to update it immediately after changing tags.

## Privacy

The plugin works locally and does not modify your notes or tags. It uses a read-only connection to Joplin's database to read the same tag-count view as the sidebar. If that view is unavailable, it uses Joplin's data API instead and displays loading progress. The plugin does not send your data to an external service.

## Build and test

Building requires Node.js 18 or newer and the `tar` command. No npm packages are needed.

```sh
npm run dist
npm test
```

The build produces `publish/tag-cloud.jpl` and the accompanying metadata required for the Joplin plugin directory. For development, use a separate [Joplin development profile](https://joplinapp.org/help/api/references/development_mode/). See [PUBLISHING.md](PUBLISHING.md) for the release process.

## License

[MIT](LICENSE).

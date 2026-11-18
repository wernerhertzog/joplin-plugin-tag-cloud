# Publishing Tag Cloud

This project is prepared for Joplin's npm-based plugin discovery, but has not yet been published. The GitHub repository is initially private.

## Before the first release

1. Make the GitHub repository public when you are ready to share the source. Check that the author, copyright notice, repository URLs and version in `src/manifest.json` and `package.json` are correct.
2. Verify the npm package name `joplin-plugin-tag-cloud` is available to your npm account. It was not present in the registry when checked, but availability can change.
3. Test the `.jpl` in a Joplin development profile, including installation, scrolling, tag navigation, refresh, panel visibility and restarting. Test on other desktop operating systems before claiming verified support for them.
4. Remove `"private": true` from `package.json` only when ready to publish. It currently prevents accidental npm publication.
5. Run:

   ```sh
   npm test
   npm run dist
   npm pack --dry-run
   ```

   Confirm that the npm package contains `publish/tag-cloud.jpl` and `publish/tag-cloud.json`, as well as the README and license. The metadata contains a SHA-256 hash of the archive. Ensure the version numbers in `package.json` and `src/manifest.json` match.
6. Sign in to an npm account that can publish the chosen package name. When ready to release publicly, run `npm publish`. This is a public action and cannot be fully undone once others have downloaded the release.
7. Check Joplin's plugin directory for the submission and follow any current review process. Appearance is not immediate or guaranteed. Follow [Joplin's generator publishing instructions](https://github.com/laurent22/joplin/tree/dev/packages/generator-joplin#publishing-the-plugin).

For subsequent releases, increment both versions, rebuild, test, and publish the new npm version. Do not change the plugin ID after publishing: Joplin uses it to identify installations and updates.

## Early local installation

The early private test builds used the ID `org.joplinapp.plugins.tag-cloud-local`. The independent release uses `io.github.wernerhertzog.joplin-tag-cloud`. Because these are different IDs, Joplin treats them as separate plugins. Anyone using the early test build should remove or disable it before installing the release build.

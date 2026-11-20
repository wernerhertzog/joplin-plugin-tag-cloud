# Publishing Tag Cloud

Version 0.2.3 is published on npm. Joplin's plugin directory imports eligible packages separately; publication to npm does not guarantee or immediately confirm a directory listing.

## Preparing a release

1. Ensure the GitHub repository is public and check that the author, copyright notice, repository URLs and version in `src/manifest.json` and `package.json` are correct.
2. Confirm you have publishing access to `joplin-plugin-tag-cloud` and choose an unpublished version. Version 0.2.3 is already published.
3. Test the `.jpl` in a Joplin development profile, including installation, scrolling, tag navigation, refresh, panel visibility and restarting. Test on other desktop operating systems before claiming verified support for them.
4. Run:

   ```sh
   npm test
   npm run check:release
   ```

   Confirm that the npm package contains `publish/tag-cloud.jpl` and `publish/tag-cloud.json`, as well as the README and license. The metadata contains a SHA-256 hash of the archive. Ensure the version numbers in `package.json` and `src/manifest.json` match.
5. Sign in with `npm login` to an npm account that can publish the chosen package name. When ready to release publicly, run `npm publish`. This is a public action and cannot be fully undone once others have downloaded the release.
6. Check Joplin's plugin directory for the submission and follow any current review process. Appearance is not immediate or guaranteed. Follow [Joplin's generator publishing instructions](https://github.com/laurent22/joplin/blob/dev/packages/generator-joplin/generators/app/templates/GENERATOR_DOC.md#publishing-the-plugin).

For subsequent releases, increment both versions, rebuild, test, and publish the new npm version. Do not change the plugin ID after publishing: Joplin uses it to identify installations and updates.

## Early local installation

The early private test builds used the ID `org.joplinapp.plugins.tag-cloud-local`. The independent release uses `io.github.wernerhertzog.joplin-tag-cloud`. Because these are different IDs, Joplin treats them as separate plugins. Anyone using the early test build should remove or disable it before installing the release build.

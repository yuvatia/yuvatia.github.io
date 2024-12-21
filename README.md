icon.svg sourced from https://www.reshot.com/free-svg-icons/item/3d-glasses-NPFH7JUGMD/

Since we rely on class names we need to build with class names.

Troubleshooting:

Q: `yarn deploy` crashes with
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory

A:
`export NODE_OPTIONS="--max-old-space-size=8192"`

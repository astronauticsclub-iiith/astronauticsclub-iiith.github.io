## Couple of things to keep in mind:
- Adhere to the self explanatory folder structure when creating new files.

- Write your HTML according to desktop-view and CSS according to the mobile view. Then use media queries to adjust the CSS for desktop-view, otherwise you will be overwriting a lot of CSS code.

- Use elaborate class names, otherwise collisions are very likely.

- Any font imports should be done in the `font.css` file not in any of the `.html` file.

- `common.css` is the file which contains the styling for universal-selector, body, navbar. It should not contain any other styling.

- Similarly comming stylings must be done in their respective css files e.g. footer styling must done in `footer.css`.
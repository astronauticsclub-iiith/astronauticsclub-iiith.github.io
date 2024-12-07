## Couple of things to keep in mind:
- Adhere to the self explanatory directory structure when creating new files.

- Styling code should be written in a appropriatory named `.css` file and similarly for JS code as well.

- Import the CSS in the `.html` file in the header and JS at the end of the body (otherwise several document.getElementById will throw error).

- As a suggestion, write your HTML according to desktop-view div structure and CSS styling according to the mobile view. After that use media queries to adjust the CSS for desktop-view, otherwise a lot of CSS code needs to be overwritten.

- Please try to use elaborate class names, otherwise collisions are very likely.

- Any font imports should be done in the `font.css` file not in any of the `.html` file.

- `common.css` is the file which contains the styling for universal-selector, body, navbar. It should not contain any other styling.

- Similarly comming stylings must be done in their respective css files e.g. footer styling must done in `footer.css`.

- Use semantic tags as much as possible.
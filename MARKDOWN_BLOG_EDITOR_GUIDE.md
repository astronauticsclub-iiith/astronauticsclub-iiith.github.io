# Blog Editor Guide

This guide explains how to use the Markdown editor for the blog. It supports standard Markdown syntax with some custom extensions for styling and layout.

## Headings

Use `#` for headings. The editor supports up to 6 levels of headings.

```markdown
# Heading 1 (Page Title style)
## Heading 2 (Section Title)
### Heading 3 (Subsection)
#### Heading 4
##### Heading 5
###### Heading 6
```

## Text Formatting

- **Bold**: `**text**` or `__text__`
- *Italic*: `*text*` or `_text_`
- ~~Strikethrough~~: `~~text~~`

## Lists

### Unordered List
```markdown
- Item 1
- Item 2
  - Subitem
```

### Ordered List
```markdown
1. First item
2. Second item
```

## Links

Links automatically open in a new tab.

```markdown
[Link Text](https://example.com)
```

## Images

You can include images using standard Markdown syntax. You can also specify dimensions by appending `#widthxheight` to the URL.

```markdown
![Alt Text](/path/to/image.jpg)
![Alt Text](/path/to/image.jpg#800x600)
```
- Default size if unspecified is 800x400. You can resize using '#'.
- Images are automatically optimized and lazy-loaded.

## Blockquotes

Use `>` for blockquotes. They are styled with a left border and specific background.

```markdown
> This is a blockquote.
```

## Code Blocks

Use triple backticks for code blocks.

\`\`\`javascript
console.log("Hello World");
\`\`\`

## Tables

Standard Markdown tables are supported.

```markdown
| Header 1 | Header 2 |
|Data 1    | Data 2   |
```

## Alignment

You can use HTML `<div>` tags with specific classes to align content.

### Center Alignment
```html
<div className="align-center">

Content to center (text, images, etc.)

</div>
```

### Right Alignment
```html
<div className="align-right">

Content to align right

</div>
```

## Horizontal Rule

Use `---` for a horizontal divider.

```markdown
---
```

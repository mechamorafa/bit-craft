# Bit-Craft Static Site Generator

This is a simple static site generator built with Node.js. 

- Add markdown files to the `posts/` directory. Each `.md` file becomes a post.
- Customize your site using the templates in `templates/`.
- Run `node src/generate.js` to generate HTML files in `dist/`.

## Features
- Customizable header, body, and footer templates
- Markdown posts automatically converted to HTML
- Home page with links to all posts
- Support of pagination

## Getting Started
1. Install dependencies:
   ```sh
   npm install marked
   ```
2. Add markdown files to `posts/`.
3. Run the generator:
   ```sh
   node src/generate.js
   ```
4. Open `dist/index.html` in your browser.

import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templatesDir = path.join(__dirname, '../templates');
const postsDir = path.join(__dirname, '../posts');
const distDir = path.join(__dirname, '../dist');

function loadTemplate(name) {
    return fs.readFileSync(path.join(templatesDir, name), 'utf8');
}

function renderPage({ title, content, date }) {
    const mainTemplate = loadTemplate('main.html');
    const header = loadTemplate('header.html').replace('{{siteTitle}}', 'Bit-Craft');
    const body = loadTemplate('body.html').replace('{{content}}', content + (date ? `<p class='post-date'>${date}</p>` : ''));
    const footer = loadTemplate('footer.html').replace('{{year}}', new Date().getFullYear());
    return mainTemplate
        .replace('{{title}}', title)
        .replace('{{header}}', header)
        .replace('{{body}}', body)
        .replace('{{footer}}', footer);
}

function paginate(array, page_size) {
    return Array.from({ length: Math.ceil(array.length / page_size) }, (_, i) =>
        array.slice(i * page_size, i * page_size + page_size)
    );
}

function generateSite() {
    if (!fs.existsSync(distDir)) fs.mkdirSync(distDir);
    const postFiles = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
    // Sort by creation time descending (newest first)
    const sortedFiles = postFiles.map(file => {
        const mdPath = path.join(postsDir, file);
        const stats = fs.statSync(mdPath);
        return { file, birthtime: stats.birthtime };
    }).sort((a, b) => b.birthtime - a.birthtime).map(obj => obj.file);
    const posts = sortedFiles.map(file => {
        const mdPath = path.join(postsDir, file);
        const md = fs.readFileSync(mdPath, 'utf8');
        const html = marked.parse(md);
        const title = file.replace('.md', '');
        const stats = fs.statSync(mdPath);
        const date = stats.birthtime.toLocaleDateString();
        // Generate post page
        const page = renderPage({ title, content: html, date });
        const outPath = path.join(distDir, `${title}.html`);
        fs.writeFileSync(outPath, page);
        return { title, date };
    });

    // Pagination for index
    const pageSize = 10;
    const paginated = paginate(posts, pageSize);
    paginated.forEach((pagePosts, i) => {
        let indexContent = `<ul class='post-list'>`;
        pagePosts.forEach(post => {
            indexContent += `<li><span class='post-date'>${post.date}</span> <a href="${post.title}.html">${post.title}</a></li>`;
        });
        indexContent += '</ul>';
        // Navigation
        let nav = '<nav class="pagination">';
        for (let j = 0; j < paginated.length; j++) {
            if (j === i) {
                nav += `<span class='current-page'>${j + 1}</span> `;
            } else {
                nav += `<a href='index${j === 0 ? '' : j + 1}.html'>${j + 1}</a> `;
            }
        }
        nav += '</nav>';
        indexContent += nav;
        const indexPage = renderPage({ title: 'Home', content: indexContent });
        const indexName = `index${i === 0 ? '' : i + 1}.html`;
        fs.writeFileSync(path.join(distDir, indexName), indexPage);
    });
}

generateSite();

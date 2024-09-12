import { promises as fs } from 'fs';
import path from 'path';

// Get __dirname equivalent in ES modules
const __dirname = import.meta.dirname;

const main = async () => {
  // Read the original file content
  const filePath = '../README.md';
  const markdown = await readFile(filePath);

  // Proceed only if the file was read successfully
  if (markdown) {
    // Fetch latest articles
    const articles = await fetchArticles();

    // Generate new content
    const newContent = generateArticlesContent(articles);

    // Replace content between markers
    const START_MARKER = '<!-- ARTICLES:START -->';
    const END_MARKER = '<!-- ARTICLES:END -->';
    const updatedMarkdown = replaceContentBetweenMarkers(
      markdown,
      START_MARKER,
      END_MARKER,
      newContent
    );

    // Save the updated file
    await saveFile(filePath, updatedMarkdown);
  }
};

// Fetch latest articles
const fetchArticles = async () => {
  const response = await fetch(
    'https://dev.to/api/articles?username=joanroucoux&page=1&per_page=5'
  );
  const data = await response.json();
  return data?.map((article) => ({
    title: article.title,
    url: article.url,
  }));
};

// Generate markdown from articles
const generateArticlesContent = (articles) => {
  let markdown = '';

  articles?.forEach((article) => {
    markdown += `- [${article.title}](${article.url})\n`;
  });

  return markdown;
};

// Read file
const readFile = async (filePath) => {
  try {
    const absolutePath = path.resolve(__dirname, filePath);
    console.log('Reading file from:', absolutePath);
    const data = await fs.readFile(absolutePath, 'utf8');
    return data;
  } catch (err) {
    console.error('Error reading file:', err);
    return null;
  }
};

// Generate updated markdown
const replaceContentBetweenMarkers = (
  markdown,
  startMarker,
  endMarker,
  newContent
) => {
  const regex = new RegExp(`(${startMarker})([\\s\\S]*?)(${endMarker})`, 'g');
  const updatedMarkdown = markdown.replace(regex, `$1\n${newContent}$3`);
  return updatedMarkdown;
};

// Save file
const saveFile = async (filePath, content) => {
  try {
    const absolutePath = path.resolve(__dirname, filePath);
    await fs.writeFile(absolutePath, content, 'utf8');
    console.log('File has been saved successfully!');
  } catch (err) {
    console.error('Error saving file:', err);
  }
};

main();

import * as fs from 'node:fs/promises';
import path from 'node:path';
import { Article, ArticlePreview } from './types.ts';

const DEV_TO_API_BASE_URL = 'https://dev.to/api';
const USERNAME = 'joanroucoux';

const main = async (): Promise<void> => {
  // Read the original file content
  const filePath = '../README.md';
  const markdown = await readFile(filePath);

  // Proceed only if the file was read successfully
  if (markdown) {
    // Fetch latest articles
    const articles = await fetchArticles(USERNAME);

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
const fetchArticles = async (
  username: string,
  page: number = 1,
  perPage: number = 5
): Promise<ArticlePreview[]> => {
  const response = await fetch(
    `${DEV_TO_API_BASE_URL}/articles?username=${username}&page=${page}&per_page=${perPage}`
  );
  const data: Article[] = await response.json();
  return data?.map((article: Article) => ({
    title: article.title,
    url: article.url,
  }));
};

// Generate markdown from articles
const generateArticlesContent = (articles: ArticlePreview[]): string => {
  let markdown = '';

  articles?.forEach((article) => {
    markdown += `- [${article.title}](${article.url})\n`;
  });

  return markdown;
};

// Read file
const readFile = async (filePath: string): Promise<string | null> => {
  try {
    const absolutePath = path.resolve(import.meta.dirname, filePath);
    console.log('Reading file from:', absolutePath);
    return await fs.readFile(absolutePath, 'utf8');
  } catch (err) {
    console.error('Error reading file:', err);
    return null;
  }
};

// Generate updated markdown
const replaceContentBetweenMarkers = (
  markdown: string,
  startMarker: string,
  endMarker: string,
  newContent: string
): string => {
  const regex = new RegExp(`(${startMarker})([\\s\\S]*?)(${endMarker})`, 'g');
  return markdown.replace(regex, `$1\n${newContent}$3`);
};

// Save file
const saveFile = async (filePath: string, content: string): Promise<void> => {
  try {
    const absolutePath = path.resolve(import.meta.dirname, filePath);
    await fs.writeFile(absolutePath, content, 'utf8');
    console.log('File has been saved successfully!');
  } catch (err) {
    console.error('Error saving file:', err);
  }
};

main();

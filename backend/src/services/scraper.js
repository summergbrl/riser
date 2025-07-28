import axios from 'axios';
import cheerio from 'cheerio';
import natural from 'natural';

export async function scrapeNews() {
  // Example: Scrape a news site for flood reports
  const url = 'https://news.abs-cbn.com/news';
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const posts = [];
  $('.news-title').each((i, el) => {
    posts.push($(el).text());
  });
  return posts;
}

export function filterFloodPosts(posts) {
  // Simple NLP filter for flood-related posts
  const floodKeywords = ['flood', 'baha', 'overflow', 'evacuation'];
  return posts.filter(post =>
    floodKeywords.some(keyword => post.toLowerCase().includes(keyword))
  );
}

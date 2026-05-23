#!/usr/bin/env node

import { writeFile, mkdir, rename } from "node:fs/promises";
import { dirname } from "node:path";

const FEED_URL = "https://blog.mathankumar.in/feed";
const BLOG_ORIGIN = "https://blog.mathankumar.in";
const OUTPUT_PATH = "assets/data/blogs.json";
const MAX_POSTS = 6;

const decodeEntities = (value = "") =>
  value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/g, "/");

const textFromTag = (xml, tag) => {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeEntities(match[1]).trim() : "";
};

const stripHtml = (html = "") =>
  decodeEntities(html)
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const excerptFromHtml = (html, maxLength = 150) => {
  const text = stripHtml(html);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).replace(/\s+\S*$/, "")}...`;
};

const imageFromItem = (itemXml) => {
  const enclosure = itemXml.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]*>/i)?.[1];
  if (enclosure) return decodeEntities(enclosure);

  const mediaContent = itemXml.match(/<media:content[^>]+url=["']([^"']+)["'][^>]*>/i)?.[1];
  if (mediaContent) return decodeEntities(mediaContent);

  const content = textFromTag(itemXml, "content:encoded") || textFromTag(itemXml, "description");
  const img = content.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i)?.[1];
  return img ? decodeEntities(img) : "";
};

const toIsoDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? "" : date.toISOString();
};

const normalizePostUrl = (value) => {
  try {
    const url = new URL(value);
    const slugPath = url.pathname.replace(/^\/@[^/]+/, "");
    return `${BLOG_ORIGIN}${slugPath}`;
  } catch {
    return value;
  }
};

const fetchFeed = async () => {
  const response = await fetch(FEED_URL, {
    headers: {
      "user-agent": "mathankumar-portfolio-feed-updater/1.0",
      accept: "application/rss+xml, application/xml, text/xml",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${FEED_URL}: ${response.status} ${response.statusText}`);
  }

  return response.text();
};

const parseFeed = (xml) => {
  const items = xml.match(/<item\b[\s\S]*?<\/item>/gi) ?? [];

  return items.slice(0, MAX_POSTS).map((item) => {
    const title = textFromTag(item, "title");
    const link = textFromTag(item, "link");
    const publishedAt = toIsoDate(textFromTag(item, "pubDate"));
    const content = textFromTag(item, "content:encoded") || textFromTag(item, "description");

    return {
      title,
      url: normalizePostUrl(link),
      publishedAt,
      image: imageFromItem(item),
      excerpt: excerptFromHtml(content),
    };
  }).filter((post) => post.title && post.url);
};

const main = async () => {
  const xml = await fetchFeed();
  const posts = parseFeed(xml);

  if (!posts.length) {
    throw new Error(`No posts found in ${FEED_URL}`);
  }

  const payload = {
    source: FEED_URL,
    posts,
  };

  await mkdir(dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(`${OUTPUT_PATH}.tmp`, `${JSON.stringify(payload, null, 2)}\n`);
  await rename(`${OUTPUT_PATH}.tmp`, OUTPUT_PATH);

  console.log(`Updated ${OUTPUT_PATH} with ${posts.length} posts.`);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// Making types available for import when package is installed
export type {
  Category,
  ConfigureOptions,
  GlobalParams,
  Page,
  PagesWithId,
  Post,
  PostParams,
  PostsWithId,
} from './types';

// These types are enums, they can be also used as values
export { CategoryFields, Endpoints, PageFields, PostFields } from './types';

// Import Api helper functions

import {
  detectRedirects,
  endpointParamsBuilder,
  queryBuilder,
} from './helperFunctions';

// import TS types

import type {
  CategoryFields,
  Post,
  PageFields,
  PostsWithId,
  PagesWithId,
  ConfigureOptions,
} from './types';
import { Endpoints, PostFields } from './types';

// Variables Declarations

const WP_API = '/wp-json/wp/v2'; // This may change if Wordpress changes the Wordpress API
let BASE_URL: string;

export function configure(options: ConfigureOptions) {
  BASE_URL = options.BASE_URL;
}

// Functions Declarations

/**
 * Fetches data from the specified endpoint and query parameters.
 * @param {string} endpoint - The API endpoint to fetch data from.
 * @param {URLSearchParams} [query] - The query parameters for the request.
 * @returns {Promise<any>} The fetched data as a JSON object.
 * @throws {Error} If the fetch request fails.
 */
export async function fetchData(
  endpoint: Endpoints | PostsWithId | PagesWithId,
  query?: URLSearchParams
) {
  try {
    const url = new URL(`${BASE_URL}${WP_API}/${endpoint}`);

    if (query) url.search = query.toString();

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Error in fetchData: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();

    return data;
  } catch (error) {
    console.error('Error in fetchData:', error);
    throw error; // Propagate the error to the caller
  }
}

// #### POSTS ####

/**
 * Fetches a specified number of posts with optional fields.
 * @param {number} [quantity] - The number of posts to fetch.
 * @param {PostFields[]} [postFields] - The fields to include in the fetched posts.
 * @returns {Promise<Post[]>} The fetched posts as an array of Post objects.
 * @throws {Error} If the fetch request fails.
 */
export async function fetchPosts(quantity?: number, postFields?: PostFields[]) {
  try {
    if (typeof postFields === 'undefined' && !quantity)
      return await fetchData(Endpoints.posts);

    const endpointParams = endpointParamsBuilder(postFields, quantity);

    const data = await fetchData(Endpoints.posts, queryBuilder(endpointParams));
    const posts: Post[] = await detectRedirects(data);

    return posts;
  } catch (error) {
    console.error('Error in fetchPosts:', error);
    throw error; // Propagate the error to the caller
  }
}

/**
 * Fetches posts in a specific category with optional fields and quantity.
 * @param {number} categoryId - The ID of the category to fetch posts from.
 * @param {PostFields[]} [postFields] - The fields to include in the fetched posts.
 * @param {number} [quantity] - The number of posts to fetch.
 * @returns {Promise<Post[]>} The fetched posts as an array of Post objects.
 * @throws {Error} If the fetch request fails.
 */
export async function fetchPostsInCategory(
  categoryId: number,
  postFields?: PostFields[],
  quantity?: number
) {
  try {
    const endpointParams = endpointParamsBuilder(postFields, quantity);

    endpointParams.categories = categoryId;

    const data = await fetchData(Endpoints.posts, queryBuilder(endpointParams));
    const posts: Post[] = await detectRedirects(data);

    return posts;
  } catch (error) {
    console.error('Error in fetchPostsInCategory:', error);
    throw error; // Propagate the error to the caller
  }
}

/**
 * Fetches a post by its slug with optional fields.
 * @param {string} slug - The slug of the post to fetch.
 * @param {PostFields[]} [postFields] - The fields to include in the fetched post.
 * @returns {Promise<Post>} The fetched post as a Post object.
 * @throws {Error} If the fetch request fails.
 */
export async function fetchPostBySlug(slug: string, postFields?: PostFields[]) {
  try {
    const endpointParams = endpointParamsBuilder(postFields);

    endpointParams.slug = slug;

    const post = await fetchData(Endpoints.posts, queryBuilder(endpointParams));

    return post;
  } catch (error) {
    console.error('Error in fetchPostBySlug:', error);
    throw error; // Propagate the error to the caller
  }
}

/**
 * Fetches a post by its ID with optional fields.
 * @param {number} id - The ID of the post to fetch.
 * @param {PostFields[]} [postFields] - The fields to include in the fetched post.
 * @returns {Promise<Post>} The fetched post as a Post object.
 * @throws {Error} If the fetch request fails.
 */
export async function fetchPostById(id: number, postFields?: PostFields[]) {
  try {
    const endpointParams = endpointParamsBuilder(postFields);
    return await fetchData(
      `${Endpoints.posts}/${id}`,
      queryBuilder(endpointParams)
    );
  } catch (error) {
    console.error('Error in fetchPostById:', error);
    throw error; // Propagate the error to the caller
  }
}

// #### CATEGORIES ####

/**
 * Fetches all categories with optional fields.
 * @param {CategoryFields[]} [categoryFields] - The fields to include in the fetched categories.
 * @returns {Promise<any[]>} The fetched categories as an array of objects.
 * @throws {Error} If the fetch request fails.
 */
export async function fetchAllCategories(categoryFields?: CategoryFields[]) {
  try {
    if (typeof categoryFields === 'undefined')
      return await fetchData(Endpoints.categories);

    const endpointParams = endpointParamsBuilder(categoryFields);

    return await fetchData(Endpoints.categories, queryBuilder(endpointParams));
  } catch (error) {
    console.error('Error in fetchAllCategories:', error);
    throw error; // Propagate the error to the caller
  }
}

// #### PAGES ####

/**
 * Fetches a specified number of pages with optional fields.
 * @param {number} [quantity] - The number of pages to fetch.
 * @param {PageFields[]} [pageFields] - The fields to include in the fetched pages.
 * @returns {Promise<any[]>} The fetched pages as an array of objects.
 * @throws {Error} If the fetch request fails.
 */
export async function fetchPages(quantity?: number, pageFields?: PageFields[]) {
  try {
    if (typeof pageFields === 'undefined' && !quantity)
      return await fetchData(Endpoints.pages);

    const endpointParams = endpointParamsBuilder(pageFields, quantity);

    return await fetchData(Endpoints.pages, queryBuilder(endpointParams));
  } catch (error) {
    console.error('Error in fetchPages:', error);
    throw error; // Propagate the error to the caller
  }
}

/**
 * Fetches a page by its slug with optional fields.
 * @param {string} slug - The slug of the page to fetch.
 * @param {PageFields[]} [pageFields] - The fields to include in the fetched page.
 * @returns {Promise<any>} The fetched page as an object.
 * @throws {Error} If the fetch request fails.
 */
export async function fetchPageBySlug(slug: string, pageFields?: PageFields[]) {
  try {
    const endpointParams = endpointParamsBuilder(pageFields);

    endpointParams.slug = slug;

    return await fetchData(Endpoints.pages, queryBuilder(endpointParams));
  } catch (error) {
    console.error('Error in fetchPageBySlug:', error);
    throw error; // Propagate the error to the caller
  }
}

/**
 * Fetches a page by its ID with optional fields.
 * @param {number} id - The ID of the page to fetch.
 * @param {PageFields[]} [pageFields] - The fields to include in the fetched page.
 * @returns {Promise<any>} The fetched page as an object.
 * @throws {Error} If the fetch request fails.
 */
export async function fetchPageById(id: number, pageFields?: PageFields[]) {
  try {
    const endpointParams = endpointParamsBuilder(pageFields);
    return await fetchData(
      `${Endpoints.pages}/${id}`,
      queryBuilder(endpointParams)
    );
  } catch (error) {
    console.error('Error in fetchPageById:', error);
    throw error; // Propagate the error to the caller
  }
}


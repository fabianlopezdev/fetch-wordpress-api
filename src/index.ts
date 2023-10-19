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
  Media,
  CustomEndpoint,
} from './types';

// These types are enums, they can be also used as values
export { CategoryFields, Endpoints, PageFields, PostFields } from './types';

// Import Api helper functions

import {
  addImagesToPost,
  detectRedirects,
  endpointParamsBuilder,
  getImagesLink,
  queryBuilder,
  removeParagraphTags,
} from './helperFunctions';

// import TS types

import type {
  CategoryFields,
  Post,
  PageFields,
  Endpoints,
  PostFields,
  PostsWithId,
  PagesWithId,
  ConfigureOptions,
  Category,
  Page,
  MediaWithId,
  Media,
  ExtendedMedia,
  CustomEndpoint,
  CustomImage,
} from './types';

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
 * @returns {Promise<Post[] | Category[] | Page[]>} The fetched data as a JSON object.
 * @throws {Error} If the fetch request fails.
 */
export async function fetchData<T>(
  endpoint:
    | Endpoints
    | PostsWithId
    | PagesWithId
    | MediaWithId
    | CustomEndpoint,
  query?: URLSearchParams
): Promise<T[]> {
  try {
    const url = new URL(`https://cbgranollers.cat${WP_API}/${endpoint}`);

    if (query) url.search = query.toString();

    const res = await fetch(url);

    if (!res.ok) {
      console.error('Response object:', res);
      throw new Error(`Error in fetchData: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    const fieldValue = query?.get('_fields');

    if (
      (endpoint.includes('pages') || endpoint.includes('posts')) &&
      (!fieldValue || fieldValue.includes('image'))
    ) {
      const dataWithImages = await addImagesToPost(data);
      return dataWithImages as any;
    } else {
      return Array.isArray(data) ? data : [data];
    }
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
export async function fetchPosts(
  quantity?: number,
  postFields?: PostFields[]
): Promise<Post[]> {
  try {
    if (typeof postFields === 'undefined' && !quantity) {
      const allPosts = await fetchData<Post>('posts');

      return allPosts;
    } else if (typeof postFields !== 'undefined' && quantity === -1) {
      const endpointParams = endpointParamsBuilder(postFields);

      const data = await fetchData<Post>('posts', queryBuilder(endpointParams));

      const allPostsWithCustomFields = await detectRedirects(data);

      return allPostsWithCustomFields;
    }

    const endpointParams = endpointParamsBuilder(postFields, quantity);

    const data = await fetchData<Post>('posts', queryBuilder(endpointParams));
    const posts = await detectRedirects(data);

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
): Promise<Post[]> {
  try {
    const endpointParams = endpointParamsBuilder(postFields, quantity);

    endpointParams.categories = categoryId;

    const data = await fetchData<Post>('posts', queryBuilder(endpointParams));
    const posts = await detectRedirects(data);

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
 * @returns {Promise<Post[]>} The fetched post as a Post object in an array.
 * @throws {Error} If the fetch request fails.
 */
export async function fetchPostBySlug(
  slug: string,
  postFields?: PostFields[]
): Promise<Post[]> {
  try {
    const endpointParams = endpointParamsBuilder(postFields);

    endpointParams.slug = slug;

    const post = await fetchData<Post>('posts', queryBuilder(endpointParams));

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
 * @returns {Promise<Post[]>} The fetched post as a Post object in an array.
 * @throws {Error} If the fetch request fails.
 */
export async function fetchPostById(
  id: number,
  postFields?: PostFields[]
): Promise<Post[]> {
  try {
    const endpointParams = endpointParamsBuilder(postFields);
    const post = await fetchData<Post>(
      `${'posts'}/${id}`,
      queryBuilder(endpointParams)
    );
    return post;
  } catch (error) {
    console.error('Error in fetchPostById:', error);
    throw error; // Propagate the error to the caller
  }
}

// #### CATEGORIES ####

/**
 * Fetches all categories with optional fields.
 * @param {CategoryFields[]} [categoryFields] - The fields to include in the fetched categories.
 * @returns {Promise<Category[]>} The fetched categories as an array of objects.
 * @throws {Error} If the fetch request fails.
 */
export async function fetchAllCategories(
  categoryFields?: CategoryFields[]
): Promise<Category[]> {
  try {
    if (typeof categoryFields === 'undefined') {
      const allCategories = await fetchData<Category>('categories');
      return allCategories;
    }

    const endpointParams = endpointParamsBuilder(categoryFields);

    const categoriesWithCustomFields = await fetchData<Category>(
      'categories',
      queryBuilder(endpointParams)
    );

    return categoriesWithCustomFields;
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
 * @returns {Promise<Page[]>} The fetched pages as an array of objects.
 * @throws {Error} If the fetch request fails.
 */
export async function fetchPages(
  quantity?: number,
  pageFields?: PageFields[]
): Promise<Page[]> {
  try {
    if (typeof pageFields === 'undefined' && !quantity) {
      const allPages = await fetchData<Page>('pages');
      return allPages;
    } else if (typeof pageFields !== 'undefined' && quantity === -1) {
      const endpointParams = endpointParamsBuilder(pageFields);

      const allPagesWithCustomFields = await fetchData<Page>(
        'pages',
        queryBuilder(endpointParams)
      );

      return allPagesWithCustomFields;
    }

    const endpointParams = endpointParamsBuilder(pageFields, quantity);

    const pages = await fetchData<Page>('pages', queryBuilder(endpointParams));

    return pages;
  } catch (error) {
    console.error('Error in fetchPages:', error);
    throw error; // Propagate the error to the caller
  }
}

/**
 * Fetches a page by its slug with optional fields.
 * @param {string} slug - The slug of the page to fetch.
 * @param {PageFields[]} [pageFields] - The fields to include in the fetched page.
 * @returns {Promise<Page[]>} The fetched page as a Page object in an array.
 * @throws {Error} If the fetch request fails.
 */

export async function fetchPageBySlug(
  slug: string,
  pageFields?: PageFields[]
): Promise<Page[]> {
  try {
    const endpointParams = endpointParamsBuilder(pageFields);

    endpointParams.slug = slug;

    const page = await fetchData<Page>('pages', queryBuilder(endpointParams));
    if (page.length === 0) throw new Error('Page not found');
    return page;
  } catch (error) {
    console.error('Error in fetchPageBySlug:', error);
    throw error; // Propagate the error to the caller
  }
}

/**
 * Fetches a page by its ID with optional fields.
 * @param {number} id - The ID of the page to fetch.
 * @param {PageFields[]} [pageFields] - The fields to include in the fetched page.
 * @returns {Promise<Page[]>} The fetched page as a Page object in an array.
 * @throws {Error} If the fetch request fails.
 */
export async function fetchPageById(
  id: number,
  pageFields?: PageFields[]
): Promise<Page[]> {
  try {
    const endpointParams = endpointParamsBuilder(pageFields);
    const page = await fetchData<Page>(
      `${'pages'}/${id}`,
      queryBuilder(endpointParams)
    );
    return page;
  } catch (error) {
    console.error('Error in fetchPageById:', error);
    throw error; // Propagate the error to the caller
  }
}

function getBaseUrl(url: string): string {
  // Remove dimension, file extension and trailing '.' (e.g., "-150x150.png") from URL
  return url.replace(/-\d+x\d+(\.\w+)?$/, '').replace(/\.\w+$/, '');
}

let imageFetchPromise: Promise<any[] | null> | null = null;



export async function fetchAllImages() {
  try {
    if (imageFetchPromise) {
      // If a fetch is already in progress, return the existing promise
      return await imageFetchPromise;
    }

    // Store the new fetch promise in the cache
    imageFetchPromise = fetchData<Media>(
      `${'media'}`,
      queryBuilder({ per_page: 100 } as { per_page: number })
    ).then((images) => {
      return images.map((image) => ({
        id: image.id,
        url: image.source_url,
        title: image.title.rendered,
        alt: image.alt_text,
        caption: removeParagraphTags(image.caption.rendered),
      }));
    });

    // Wait for the fetch to complete, then return the data
    const imageDetails = await imageFetchPromise;
    return imageDetails;
  } catch (error) {
    console.error('Error in fetchAllImages:', error);
    throw error;
  }
}


export async function fetchImagesInPageBySlug(slug: string) {
  try {
    const page = await fetchPageBySlug(slug);
    if (page.length === 0) throw new Error('Page not found');
    const { id, content } = page[0];
    const imageUrls = extractImageUrlsFromContent(content.rendered);
    const imageUrlSet = new Set(imageUrls);

    // Use Promise.all to fetch images and allMedia concurrently
    const [images, allMedia] = await Promise.all([
      getImagesLink(id),
      fetchAllImages(),
    ]);

    let filteredImages;
    if (imageUrls.length === images.length) {
      filteredImages = images.filter((image) => imageUrlSet.has(image.url));
      return sortImagesByAppearanceOrder(filteredImages, imageUrls);
    }

    // If images don't share the same parent page
    if (allMedia) {
      filteredImages = allMedia.filter((media) => imageUrlSet.has(media.url));
    } else {
      filteredImages = [];
    }

    if (filteredImages.length === 0) {
      return images;
    }

    return sortImagesByAppearanceOrder(filteredImages, imageUrls);
  } catch (error) {
    console.error('Error in fetchImagesInPageBySlug:', error);
    throw error;
  }
}


function extractImageUrlsFromContent(content: string): string[] {
  const urls: string[] = [];
  const imgTagRegex = /<img[^>]+src="(https:\/\/[^">]+)"/g;
  let match;

  while ((match = imgTagRegex.exec(content))) {
    urls.push(match[1]);
  }

  return urls;
}


function sortImagesByAppearanceOrder(
  images: any[],
  imageUrls: string[]
): any[] {
  const imageUrlOrderMapping: { [url: string]: number } = {};
  imageUrls.forEach((url, index) => {
    const baseUrl = getBaseUrl(url);
    imageUrlOrderMapping[baseUrl] = index;
  });

  images.sort(
    (a, b) =>
      imageUrlOrderMapping[getBaseUrl(a.url)] -
      imageUrlOrderMapping[getBaseUrl(b.url)]
  );

  return images;
}

















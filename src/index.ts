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
  query?: URLSearchParams,
  isImage?: boolean // add isImage parameter to control the image fetching logic
): Promise<T[]> {
  const url = new URL(`https://cbgranollers.cat${WP_API}/${endpoint}`);
  try {
    let fieldValue: string | null = null;
    if (query) {
      fieldValue = query.get('_fields');
      if (fieldValue && fieldValue.includes('image')) {
        // Split the _fields string into an array
        const fieldsArray = fieldValue.split(',');
        // Filter out 'image'
        const updatedFieldsArray = fieldsArray.filter(
          (field) => field !== 'image'
        );
        // Join the array back into a string
        const updatedFieldValue = updatedFieldsArray.join(',');
        query.set('_fields', updatedFieldValue);
        // set isImage flag to true
        isImage = true;
      }
      url.search = query.toString();
    }

    const res = await fetchWithRetry(url);
    if (!res.ok) {
      console.error(
        'Error in fetchData:',
        `Response not OK. Status: ${res.status}, StatusText: ${res.statusText}`,
        'URL:',
        url.toString()
      );
      throw new Error(`Error in fetchData: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();

    if (
      (isImage || fieldValue === null || fieldValue.includes('page')) && // modified condition
      (endpoint.includes('pages') || endpoint.includes('posts'))
    ) {
      const dataWithImages = await addImagesToPost(data);
      return dataWithImages as any;
    } else {
      return Array.isArray(data) ? data : [data];
    }
  } catch (error) {
    console.error('Error in fetchData:', error, 'URL:', url.toString());
    throw error;
  }
}


// #### POSTS ####

interface PostsQueryCache {
  [key: string]: Post[];
}
let postsQueryCache: PostsQueryCache = {};
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
    // Create a cache key from the function parameters
    const cacheKey = JSON.stringify({ quantity, postFields });
    // Check the cache for a previous result
    if (postsQueryCache[cacheKey]) {
      return postsQueryCache[cacheKey];
    }
    if (typeof postFields === 'undefined' && !quantity) {
      const allPosts = await fetchData<Post>('posts');
      postsQueryCache[cacheKey] = allPosts;
      return allPosts;
    } else if (typeof postFields !== 'undefined' && quantity === -1) {
      const endpointParams = endpointParamsBuilder(postFields);

      const data = await fetchData<Post>('posts', queryBuilder(endpointParams));

      const allPostsWithCustomFields = await detectRedirects(data);
      postsQueryCache[cacheKey] = allPostsWithCustomFields;
      return allPostsWithCustomFields;
    }

    const endpointParams = endpointParamsBuilder(postFields, quantity);

    const data = await fetchData<Post>('posts', queryBuilder(endpointParams));
    const posts = await detectRedirects(data);
    postsQueryCache[cacheKey] = posts;

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

function extractUrl(caption: string, description: string) {
  const match = description.match(
    /<blockquote[^>]*>.*?href=["'](http[^"']+)["']/
  );

  if (match) {
    // Extract the URL from the match
    const url = match[1];
    // Extract the homepage URL by finding the third slash
    const homepage = url.slice(0, url.indexOf('/', url.indexOf('//') + 2) + 1);
    return homepage;
  }
  return removeParagraphTags(caption);
}

interface TransformedResultCache {
  allImages?:{id: number, url: string,title: string, alt: string, caption: string} [];  // Replace YourImageType with the type of your images
}
let transformedResultCache: TransformedResultCache = {};  // Initialize cache as an object

export async function fetchAllImages() {
  try {
    // Check the cache first
    if (transformedResultCache['allImages']) {
      return transformedResultCache['allImages'];
    }

    if (imageFetchPromise) {
      // If a fetch is already in progress, return the existing promise
      return await imageFetchPromise;
    }

    // Specify the fields to fetch and the number of pages
    const fields = [
      'id',
      'source_url',
      'title',
      'alt_text',
      'caption',
      'description',
    ];
    const quantity = 100; // Number of pages

    // Build the endpoint parameters using the updated endpointParamsBuilder
    const endpointParams = endpointParamsBuilder(fields, quantity);

    // Store the new fetch promise in the cache
    imageFetchPromise = fetchData<Media>(
      `${'media'}`,
      queryBuilder(endpointParams)
    ).then((images) => {
      // Transform the result
      const transformedResult = images.map((image) => {
        return {
          id: image.id,
          url: image.source_url,
          title: image.title.rendered,
          alt: image.alt_text,
          caption: extractUrl(
            image.caption.rendered,
            image.description.rendered
          ),
        };
      });

      // Cache the transformed result for future use
      transformedResultCache['allImages'] = transformedResult;
      return transformedResult;
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
    const page = await fetchPageBySlug(slug, ['id', 'content']);
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
      if (images.length === 1) return images;

      return sortImagesByAppearanceOrder(images, imageUrls);
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

class FetchError extends Error {
  status: number;
  url: string;

  constructor(message: string, status: number, url: string) {
    super(message);
    this.status = status;
    this.url = url;
  }
}

const timeout = (ms: number): Promise<never> => {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Request timed out')), ms)
  );
};

async function fetchWithRetry(
  url: URL,
  retries: number = 3,
  delay: number = 1000
): Promise<Response> {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url.toString());
      if (!res.ok) {
        // Log status and headers if there's an error
        console.error('Response Status:', res.status);
        console.error('Response Headers:', JSON.stringify([...res.headers]));

        // Log response body if there's an error
        const responseBody = await res.text();
        console.error('Response Body:', responseBody);

        throw new FetchError(
          `Error in fetch: ${res.status} ${res.statusText}`,
          res.status,
          url.toString()
        );
      }
      return res;
    } catch (error) {
      console.error(
        `Attempt ${i + 1} failed. Retrying in ${delay}ms...`,
        error
      );
      lastError = error;
      if (i < retries - 1) await new Promise((res) => setTimeout(res, delay));
    }
  }
  throw lastError; // Ensure that an error is thrown if all retries fail
}






















"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchPageById = exports.fetchPageBySlug = exports.fetchPages = exports.fetchAllCategories = exports.fetchPostById = exports.fetchPostBySlug = exports.fetchPostsInCategory = exports.fetchPosts = exports.fetchData = void 0;
// // Import env variables (example using import.meta.env as in ASTRO framework)
const DOMAIN = import.meta.env.DOMAIN;
const WP_API = '/wp-json/wp/v2';
// Import Api helper functions
const helperFunctions_1 = require("./helperFunctions");
const types_1 = require("./types");
/**
 * Fetches data from the specified endpoint and query parameters.
 * @param {string} endpoint - The API endpoint to fetch data from.
 * @param {URLSearchParams} [query] - The query parameters for the request.
 * @returns {Promise<any>} The fetched data as a JSON object.
 * @throws {Error} If the fetch request fails.
 */
async function fetchData(endpoint, query) {
    try {
        const url = new URL(`${DOMAIN}${WP_API}/${endpoint}`);
        if (query)
            url.search = query.toString();
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`Error in fetchData: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        return data;
    }
    catch (error) {
        console.error('Error in fetchData:', error);
        throw error; // Propagate the error to the caller
    }
}
exports.fetchData = fetchData;
// #### POSTS ####
/**
 * Fetches a specified number of posts with optional fields.
 * @param {number} [quantity] - The number of posts to fetch.
 * @param {PostFields[]} [postFields] - The fields to include in the fetched posts.
 * @returns {Promise<Post[]>} The fetched posts as an array of Post objects.
 * @throws {Error} If the fetch request fails.
 */
async function fetchPosts(quantity, postFields) {
    try {
        if (typeof postFields === 'undefined' && !quantity)
            return await fetchData(types_1.Endpoints.posts);
        const endpointParams = (0, helperFunctions_1.endpointParamsBuilder)(postFields, quantity);
        const data = await fetchData(types_1.Endpoints.posts, (0, helperFunctions_1.queryBuilder)(endpointParams));
        const posts = await (0, helperFunctions_1.detectRedirects)(data);
        return posts;
    }
    catch (error) {
        console.error('Error in fetchPosts:', error);
        throw error; // Propagate the error to the caller
    }
}
exports.fetchPosts = fetchPosts;
/**
 * Fetches posts in a specific category with optional fields and quantity.
 * @param {number} categoryId - The ID of the category to fetch posts from.
 * @param {PostFields[]} [postFields] - The fields to include in the fetched posts.
 * @param {number} [quantity] - The number of posts to fetch.
 * @returns {Promise<Post[]>} The fetched posts as an array of Post objects.
 * @throws {Error} If the fetch request fails.
 */
async function fetchPostsInCategory(categoryId, postFields, quantity) {
    try {
        const endpointParams = (0, helperFunctions_1.endpointParamsBuilder)(postFields, quantity);
        endpointParams.categories = categoryId;
        const data = await fetchData(types_1.Endpoints.posts, (0, helperFunctions_1.queryBuilder)(endpointParams));
        const posts = await (0, helperFunctions_1.detectRedirects)(data);
        return posts;
    }
    catch (error) {
        console.error('Error in fetchPostsInCategory:', error);
        throw error; // Propagate the error to the caller
    }
}
exports.fetchPostsInCategory = fetchPostsInCategory;
/**
 * Fetches a post by its slug with optional fields.
 * @param {string} slug - The slug of the post to fetch.
 * @param {PostFields[]} [postFields] - The fields to include in the fetched post.
 * @returns {Promise<Post>} The fetched post as a Post object.
 * @throws {Error} If the fetch request fails.
 */
async function fetchPostBySlug(slug, postFields) {
    try {
        const endpointParams = (0, helperFunctions_1.endpointParamsBuilder)(postFields);
        endpointParams.slug = slug;
        const post = await fetchData(types_1.Endpoints.posts, (0, helperFunctions_1.queryBuilder)(endpointParams));
        return post;
    }
    catch (error) {
        console.error('Error in fetchPostBySlug:', error);
        throw error; // Propagate the error to the caller
    }
}
exports.fetchPostBySlug = fetchPostBySlug;
/**
 * Fetches a post by its ID with optional fields.
 * @param {number} id - The ID of the post to fetch.
 * @param {PostFields[]} [postFields] - The fields to include in the fetched post.
 * @returns {Promise<Post>} The fetched post as a Post object.
 * @throws {Error} If the fetch request fails.
 */
async function fetchPostById(id, postFields) {
    try {
        const endpointParams = (0, helperFunctions_1.endpointParamsBuilder)(postFields);
        return await fetchData(`${types_1.Endpoints.posts}/${id}`, (0, helperFunctions_1.queryBuilder)(endpointParams));
    }
    catch (error) {
        console.error('Error in fetchPostById:', error);
        throw error; // Propagate the error to the caller
    }
}
exports.fetchPostById = fetchPostById;
// #### CATEGORIES ####
/**
 * Fetches all categories with optional fields.
 * @param {CategoryFields[]} [categoryFields] - The fields to include in the fetched categories.
 * @returns {Promise<any[]>} The fetched categories as an array of objects.
 * @throws {Error} If the fetch request fails.
 */
async function fetchAllCategories(categoryFields) {
    try {
        if (typeof categoryFields === 'undefined')
            return await fetchData(types_1.Endpoints.categories);
        const endpointParams = (0, helperFunctions_1.endpointParamsBuilder)(categoryFields);
        return await fetchData(types_1.Endpoints.categories, (0, helperFunctions_1.queryBuilder)(endpointParams));
    }
    catch (error) {
        console.error('Error in fetchAllCategories:', error);
        throw error; // Propagate the error to the caller
    }
}
exports.fetchAllCategories = fetchAllCategories;
// #### PAGES ####
/**
 * Fetches a specified number of pages with optional fields.
 * @param {number} [quantity] - The number of pages to fetch.
 * @param {PageFields[]} [pageFields] - The fields to include in the fetched pages.
 * @returns {Promise<any[]>} The fetched pages as an array of objects.
 * @throws {Error} If the fetch request fails.
 */
async function fetchPages(quantity, pageFields) {
    try {
        if (typeof pageFields === 'undefined' && !quantity)
            return await fetchData(types_1.Endpoints.pages);
        const endpointParams = (0, helperFunctions_1.endpointParamsBuilder)(pageFields, quantity);
        return await fetchData(types_1.Endpoints.pages, (0, helperFunctions_1.queryBuilder)(endpointParams));
    }
    catch (error) {
        console.error('Error in fetchPages:', error);
        throw error; // Propagate the error to the caller
    }
}
exports.fetchPages = fetchPages;
/**
 * Fetches a page by its slug with optional fields.
 * @param {string} slug - The slug of the page to fetch.
 * @param {PageFields[]} [pageFields] - The fields to include in the fetched page.
 * @returns {Promise<any>} The fetched page as an object.
 * @throws {Error} If the fetch request fails.
 */
async function fetchPageBySlug(slug, pageFields) {
    try {
        const endpointParams = (0, helperFunctions_1.endpointParamsBuilder)(pageFields);
        endpointParams.slug = slug;
        return await fetchData(types_1.Endpoints.pages, (0, helperFunctions_1.queryBuilder)(endpointParams));
    }
    catch (error) {
        console.error('Error in fetchPageBySlug:', error);
        throw error; // Propagate the error to the caller
    }
}
exports.fetchPageBySlug = fetchPageBySlug;
/**
 * Fetches a page by its ID with optional fields.
 * @param {number} id - The ID of the page to fetch.
 * @param {PageFields[]} [pageFields] - The fields to include in the fetched page.
 * @returns {Promise<any>} The fetched page as an object.
 * @throws {Error} If the fetch request fails.
 */
async function fetchPageById(id, pageFields) {
    try {
        const endpointParams = (0, helperFunctions_1.endpointParamsBuilder)(pageFields);
        return await fetchData(`${types_1.Endpoints.pages}/${id}`, (0, helperFunctions_1.queryBuilder)(endpointParams));
    }
    catch (error) {
        console.error('Error in fetchPageById:', error);
        throw error; // Propagate the error to the caller
    }
}
exports.fetchPageById = fetchPageById;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectRedirects = exports.slugExtractor = exports.queryBuilder = exports.endpointParamsBuilder = void 0;
const index_1 = require("./index");
/**
 * Builds an object containing endpoint parameters based on the provided fields and quantity.
 * @param {string[]} [fields] - The fields to include in the endpoint parameters.
 * @param {number} [quantity] - The number of items to fetch.
 * @returns {PostParams} An object containing the endpoint parameters.
 */
function endpointParamsBuilder(fields, quantity) {
    const endpointParams = {};
    if (Array.isArray(fields) && fields.length > 0) {
        endpointParams._fields = fields.join(',');
    }
    if (typeof quantity === 'number') {
        endpointParams.per_page = quantity;
    }
    return endpointParams;
}
exports.endpointParamsBuilder = endpointParamsBuilder;
/**
 * Constructs a URLSearchParams object from the provided endpoint parameters.
 * @param {PostParams} endpointParams - The endpoint parameters to convert into a query string.
 * @returns {URLSearchParams} A URLSearchParams object containing the query parameters.
 */
function queryBuilder(endpointParams) {
    // create an empty URLSearchParams object
    const query = new URLSearchParams();
    // loop through the endpointParams object and append each key-value pair to the query
    for (const [key, value] of Object.entries(endpointParams)) {
        query.append(key, value);
    }
    return query;
}
exports.queryBuilder = queryBuilder;
/**
 * Extracts the slug from a given URL.
 * @param {string} link - The URL to extract the slug from.
 * @returns {string} The extracted slug.
 */
function slugExtractor(link) {
    return new URL(link).pathname.split('/')[1];
}
exports.slugExtractor = slugExtractor;
/**
 * Detects and resolves redirects in an array of posts.
 * @param {Post[]} posts - The array of posts to check for redirects.
 * @returns {Promise<Post[]>} A new array of posts with redirects resolved.
 */
async function detectRedirects(posts) {
    const newPosts = await Promise.all(posts.map(async (post) => {
        try {
            const linkSlug = slugExtractor(post.link);
            if (post.slug !== linkSlug) {
                const redirectedPost = await (0, index_1.fetchPageBySlug)(linkSlug);
                if (redirectedPost && redirectedPost.length > 0) {
                    redirectedPost[0] = {
                        ...redirectedPost[0],
                        categories: post.categories,
                    };
                }
                return redirectedPost;
            }
            else {
                return post;
            }
        }
        catch (error) {
            console.error('Error in detectRedirects:', error);
            return post;
        }
    }));
    return newPosts.flat();
}
exports.detectRedirects = detectRedirects;

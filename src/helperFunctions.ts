import type { Media, Page, Post, PostParams } from './types';
import { configure, fetchData, fetchPageBySlug } from './index';

/**
 * Builds an object containing endpoint parameters based on the provided fields and quantity.
 * @param {string[]} [fields] - The fields to include in the endpoint parameters.
 * @param {number} [quantity] - The number of items to fetch.
 * @returns {PostParams} An object containing the endpoint parameters.
 */
export function endpointParamsBuilder(
  fields?: string[],
  quantity?: number
): PostParams {
  const endpointParams: PostParams = {};

  if (Array.isArray(fields) && fields.length > 0) {
    const uniqueFields = [...new Set(fields)];
    endpointParams._fields = uniqueFields.join(',');
  }
  if (typeof quantity === 'number') {
    endpointParams.per_page = quantity;
  }

  return endpointParams;
}

/**
 * Constructs a URLSearchParams object from the provided endpoint parameters.
 * @param {PostParams} endpointParams - The endpoint parameters to convert into a query string.
 * @returns {URLSearchParams} A URLSearchParams object containing the query parameters.
 */
export function queryBuilder(endpointParams: PostParams) {
  // create an empty URLSearchParams object
  const query = new URLSearchParams();
  // loop through the endpointParams object and append each key-value pair to the query
  for (const [key, value] of Object.entries(endpointParams)) {
    query.append(key, value as string);
  }

  return query;
}

/**
 * Extracts the slug from a given URL.
 * @param {string} link - The URL to extract the slug from.
 * @returns {string} The extracted slug.
 */
export function slugExtractor(link: string) {
  return new URL(link).pathname.split('/')[1];
}

/**
 * Detects and resolves redirects in an array of posts.
 * @param {Post[]} posts - The array of posts to check for redirects.
 * @returns {Promise<Post[]>} A new array of posts with redirects resolved.
 */
export async function detectRedirects(posts: Post[]): Promise<Post[]> {
  const newPosts = await Promise.all(
    posts.map(async (post) => {
      try {
        const linkSlug = slugExtractor(post.link as string);
        if (post.slug !== linkSlug) {
          const redirectedPost = await fetchPageBySlug(linkSlug);

          if (redirectedPost && redirectedPost.length > 0) {
            redirectedPost[0] = {
              ...redirectedPost[0],
              categories: post.categories,
              image: post.image,
              title: { rendered: post.title.rendered },
            };
          }

          return redirectedPost;
        } else {
          return post;
        }
      } catch (error) {
        console.error('Error in detectRedirects:', error);
        return post;
      }
    })
  );

  return newPosts.flat() as Post[];
}

export async function addImagesToPost(data: Post[] | Page[]) {
  const postsWithImages = await Promise.all(
    data.map(async (post: Post | Page) => {
      try {
        if (post?.image || !post?.featured_media) return post;
        const imageLink = await getImageLink(post.featured_media);
        post = { ...post, image: imageLink };

        return post;
      } catch (error) {
        console.error('Error in addImageToPost:', error);
        return post;
      }
    })
  );

  return postsWithImages;
}

export async function getImageLink(featured_media: number) {
  try {
    const imageMetaInfo = await fetchData<Media>(
      `${'media'}/${featured_media}`
    );

    // Default return object in case anything is missing
    const defaultResponse = {
      id: null,
      url: '',
      title: '',
      alt: '',
      description: '',
      caption: '',
      // ... add any other properties you want to default to here
    };

    if (!imageMetaInfo || !imageMetaInfo[0]) {
      return defaultResponse;
    }

    const mediaItem = imageMetaInfo[0];
    const mediaDetails = mediaItem.media_details;
    const title = mediaItem.title;
    const description = mediaItem.description
      ? mediaItem.description.rendered
      : '';
    const caption = mediaItem.caption ? mediaItem.caption.rendered : '';
    const imageId = mediaItem.id; // Extracting the image ID

    if (!mediaDetails || !mediaDetails.sizes) {
      return defaultResponse;
    }

    const fullSize = mediaDetails.sizes.full;

    if (!fullSize || !fullSize.source_url) {
      return defaultResponse;
    }

    const imageUrl = fullSize.source_url;
    const imageTitle = title ? title.rendered : '';
    const imageAlt = mediaItem.alt_text || '';

    return {
      id: imageId,
      url: imageUrl,
      title: imageTitle,
      alt: imageAlt,
      caption: removeParagraphTags(caption),
      // ... extract other properties from mediaItem here
    };
  } catch (error) {
    console.error('Error in getImageLink:', error);
    return {
      id: null,
      url: '',
      title: 'Error retrieving image',
      alt: 'Error retrieving image',
      description: 'Error retrieving image description',
      caption: 'Error retrieving image caption',
      // ... add any other error default properties here
    };
  }
}

// Remove the import statement for PostParams since it is already imported in another file
// import { PostParams } from './types';

export async function getImagesLink(id: number) {
  try {
    const images = await fetchData<Media>(
      `${'media'}`,
      queryBuilder({ parent: id, per_page: 100 } as {
        parent: number;
        per_page: number;
      })
    );

    const imageDetails = images.map((image) => ({
      id: image.id,
      url: image.source_url,
      title: image.title.rendered,
      alt: image.alt_text,
      caption: removeParagraphTags(image.caption.rendered),
    }));

    return imageDetails;
  } catch (error) {
    console.error('Error in getArrOfImagesFromPage:', error);
    throw error; // Propagate the error to the caller
  }
}

export function removeParagraphTags(string: string) {
  // Remove the <p> and </p> tags and newlines
  let cleanedString = string.replace(/<\/?p[^>]*>/g, '').replace(/\n/g, '');

  // Trim spaces at the beginning and end
  return cleanedString.trim();
}



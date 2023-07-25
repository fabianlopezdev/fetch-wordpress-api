# Fetch WordPress API

[![npm version](https://badge.fury.io/js/fetch-wordpress-api.svg)](https://badge.fury.io/js/fetch-wordpress-api)
![WordPress](https://img.shields.io/badge/WordPress-%23117AC9.svg?style=flat&logo=WordPress&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=flat&logo=typescript&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=flat&logo=javascript&logoColor=%23F7DF1E)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=Fabs-and_fetch-wordpress-api&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=Fabs-and_fetch-wordpress-api)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=Fabs-and_fetch-wordpress-api&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=Fabs-and_fetch-wordpress-api)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=Fabs-and_fetch-wordpress-api&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=Fabs-and_fetch-wordpress-api)

This module provides a set of utility functions for interacting with a headless WordPress CMS via the WordPress REST API. It includes functions for fetching posts, pages, and categories, with support for custom fields and query parameters.

Installation

To install the package, run the following command:

```
npm install fetch-wordpress-api
```

## Usage

Before using the package's functions, you need to configure the `BASE_URL` variable by calling the `configure` function and passing an object with the `BASE_URL` property set to the base URL of your WordPress site.

Here's an example of how to configure the `BASE_URL` and use the package's functions:

```typescript
import { configure, fetchPosts, PostFields } from 'fetch-wordpress-api';

configure({ BASE_URL: 'https://example.com' });

// This will return an array of posts objects
const posts = await fetchPosts();

// Fetch only 5 posts
const posts = await fetchPosts(5);

// Fetch 3 posts containing only the title, content, and categories
const postFields: PostFields[] = ['title', 'content', 'categories']; // Remember to import the type PostFields to get suggestions about the post fields available and to avoid passing anything other than a possible field.

const posts = await fetchPosts(3, postFields);
```

Each function in this module performs a fetch request to a specific WordPress API endpoint. They return a Promise that resolves with the fetched data as a JSON object or rejects with an Error if the fetch request fails.

Please refer to the source code and TypeScript type definitions for detailed information on the available functions and their parameters.

## API

The package includes the following utility functions:

- **`configure(options)`:**

This function sets up the package by using the provided options. It's crucial to use this function first in order to establish a connection with your Wordpress domain.

`configure({BASE_URL: 'your-wordpress-domain'}).`

- **`fetchData(endpoint?, query?)`:**

Main function that all other utility functions use to retrieve data.

- **`fetchPosts(quantity?, postFields?)`:**

Retrieve either all posts or a specified number of posts. You can specify the fields you want returned for each post.

`fetchPosts(5, ['id', 'title']).`

**Note:** `fetchPosts()` with no arguments will retrieve all posts with all fields. If you still want to retrieve all posts, but just with certain fields (as opposed to all of them), you can pass -1 in quantity: `fetchPosts(-1, ['id', 'title'])`

- **`fetchPostsInCategory(categoryId, postFields?, quantity?)`:**

Retrieve posts from a specific category. You can specify the fields you want returned for each post and limit the number of posts.

`fetchPostsInCategory(1, ['id', 'title'], 5).`

- **`fetchPostBySlug(slug, postFields?)`:**

Retrieve a post using its slug. You can specify the fields you want returned.

`fetchPostBySlug('your/post-slug', ['id', 'title']).`

- **`fetchPostById('id', postFields?)`:**

Retrieve a post by its ID. You can specify the fields you want returned.

`fetchPostById(123, ['id', 'title']).`

- **`fetchAllCategories(categoryFields?)`:**

Retrieve all categories. You can specify the fields you want for each category.

`fetchAllCategories(['id', 'name']).`

- **`fetchPages(quantity?, pageFields?)`**:

Retrieve a specified number of pages. You can specify the fields you want returned for each page.

**Note:** `fetchPages()` with no arguments will retrieve all pages with all fields. If you still want to retrieve all pages, but just with certain fields (as opposed to all of them), you can pass -1 in quantity: `fetchPages(-1, ['id', 'title'])`

`fetchPages(5, ['id', 'title']).`

- **`fetchPageBySlug(slug, pageFields?)`:**

Retrieve a page using its slug. You can specify the fields you want returned.

`fetchPageBySlug('page-slug', ['id', 'title']).`

- **`fetchPageById(id, pageFields?)`:**

Retrieve a page by its ID. You can specify the fields you want returned.

`fetchPageById(123, ['id', 'title']).`

For more detailed information on the available functions and their parameters, please refer to the source code and TypeScript type definitions.

## Importing Types

In addition to importing the functions, you can also import the Typescript types from this package. This can be useful when working with the functions and their return values in a Typescript project.

To import the types, simply include them in your import statement:

```typescript
import type { CategoryFields } from 'fetch-wordpress-api';
```

By importing the types, you can benefit from TypeScript's type checking and autocompletion features when using this package.

These are the types available to use in your application:

```typescript
type Post = {
  author: number;
  categories: number[];
  comment_status: string;
  content: { rendered: string };
  date: string;
  date_gmt: string | null | Date;
  excerpt: { rendered: string };
  featured_media: number;
  format: string;
  guid: string;
  id: { rendered: string; raw: string };
  link: string | Url;
  meta: Record<string, string | number | boolean | any[] | Record<string, any>>;
  modified: string | Date;
  modified_gmt: string | Date;
  ping_status: string;
  slug: string;
  status: string;
  sticky: string;
  tags: number[];
  template: string;
  title: { rendered: string };
  type: string;
};

export type PostFields =
  | 'author'
  | 'categories'
  | 'comment_status'
  | 'content'
  | 'date'
  | 'date_gmt'
  | 'excerpt'
  | 'featured_media'
  | 'format'
  | 'guid'
  | 'id'
  | 'link'
  | 'meta'
  | 'modified'
  | 'modified_gmt'
  | 'ping_status'
  | 'slug'
  | 'status'
  | 'sticky'
  | 'tags'
  | 'template'
  | 'title'
  | 'type';

type Category = {
  count: number;
  description: string;
  id: number;
  link: string;
  meta: Record<string, string | number | boolean | any[] | Record<string, any>>;
  name: string;
  slug: string;
  taxonomy: string;
};

export type CategoryFields =
  | 'count'
  | 'description'
  | 'id'
  | 'link'
  | 'meta'
  | 'parent'
  | 'name'
  | 'slug'
  | 'taxonomy';

export type PageFields =
  | 'author'
  | 'comment_status'
  | 'content'
  | 'date'
  | 'date_gmt'
  | 'excerpt'
  | 'featured_media'
  | 'generated_slug'
  | 'guid'
  | 'id'
  | 'link'
  | 'menu_order'
  | 'meta'
  | 'modified'
  | 'modified_gmt'
  | 'password'
  | 'permalink_template'
  | 'ping_status'
  | 'slug'
  | 'status'
  | 'template'
  | 'title'
  | 'type';

type Page = {
  author: number;
  comment_status: 'open' | 'closed';
  content: {
    rendered: string;
    raw?: string;
    protected?: boolean;
  };
  date: string | null;
  date_gmt: string | null;
  excerpt: {
    rendered: string;
    raw?: string;
    protected?: boolean;
  };
  featured_media: number;
  generated_slug: string;
  guid: {
    rendered: string;
  };
  id: number;
  link: string;
  menu_order: number;
  meta: Record<string, any>;
  modified: string;
  modified_gmt: string;
  parent: number;
  password: string;
  permalink_template: string;
  ping_status: 'open' | 'closed';
  slug: string;
  status: 'publish' | 'future' | 'draft' | 'pending' | 'private';
  template: string;
  title: {
    rendered: string;
    raw?: string;
  };
  type: 'page';
};
```

## Contributing

If you'd like to contribute to this project, please feel free to submit a pull request or open an issue on the GitHub repository.

## License

This package is released under the MIT License.


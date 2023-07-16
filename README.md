# Fetch WordPress API

  

This module provides a set of utility functions for interacting with a headless WordPress CMS via the WordPress REST API. It includes functions for fetching posts, pages, and categories, with support for custom fields and query parameters.

Installation

To install the package, run the following command:

  

```
npm install fetch-wordpress-api
```

## Usage

Before using the package's functions, you need to configure the `DOMAIN` variable by calling the `configure` function and passing an object with the `DOMAIN` property set to the base URL of your WordPress site. 

Here's an example of how to configure the `DOMAIN` and use the package's functions:

```typescript
import  { configure, fetchPosts }  from  'fetch-wordpress-api'; 

configure({  DOMAIN:  'https://example.com'  });

const posts = await fetchPosts() // It will return an array posts
```

Each function in this module performs a fetch request to a specific WordPress API endpoint. They return a Promise that resolves with the fetched data as a JSON object or rejects with an Error if the fetch request fails.

Please refer to the source code and TypeScript type definitions for detailed information on the available functions and their parameters.

## API

The package includes the following utility functions:

-   **`configure(options: ConfigureOptions)`:**  Configures the package with the provided options. `Important` to establish the connection with your  Wordpress domain. 
- **`fetchData(endpoing?: Endpoints | PostWithId | PagesWithId, query?: URLSearchParams)`:** Core function that all the other utility functions use to fetch data. This function can be used to fetch data from any specified endpoint with any specified query parameters.
-   **`fetchPosts(quantity?: number, postFields?: PostFields[])`:** Fetches a specified number of posts with optional fields.
-   **`fetchPostsInCategory(categoryId: number, postFields?: PostFields[], quantity?: number)`:** Fetches posts in a specific category with optional fields and quantity.
-   **`fetchPostBySlug(slug: string, postFields?: PostFields[])`:** Fetches a post by its slug with optional fields.
-   **`fetchPostById(id: number, postFields?: PostFields[])`:** Fetches a post by its ID with optional fields.
-   **`fetchAllCategories(categoryFields?: CategoryFields[])`:** Fetches all categories with optional fields.
-   **`fetchPages(quantity?: number, pageFields?: PageFields[])`**: Fetches a specified number of pages with optional fields.
-   **`fetchPageBySlug(slug: string, pageFields?: PageFields[])`:** Fetches a page by its slug with optional fields.
-   **`fetchPageById(id: number, pageFields?: PageFields[])`:** Fetches a page by its ID with optional fields.

For more detailed information on the available functions and their parameters, please refer to the source code and TypeScript type definitions.
  
## Importing Types

In addition to importing the functions, you can also import the Typescript types from this package. This can be useful when working with the functions and their return values in a Typescript project. 

To import the types, simply include them in your import statement:

```typescript 
import { fetchPosts, Post, CategoryFields } from 'fetch-wordpress-api';
```
By importing the types, you can benefit from TypeScript's type checking and autocompletion features when using this package.

## Contributing

If you'd like to contribute to this project, please feel free to submit a pull request or open an issue on the GitHub repository.

## License

This package is released under the MIT License.
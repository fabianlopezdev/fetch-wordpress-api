import {configure, fetchPosts} from './index'

configure({ BASE_URL: 'https://cbgranollers.cat/' });

const posts = await fetchPosts(1,['content']);

console.log(posts);

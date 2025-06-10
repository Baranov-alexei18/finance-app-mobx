import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

const apiKey = import.meta.env.VITE_HYGRAPH_AUTH_TOKEN;

export const HYGRAPH_ENDPOINT =
  'https://us-west-2.cdn.hygraph.com/content/cm8ylspei070n07uy75ijd9hz/master';

const client = new ApolloClient({
  link: new HttpLink({
    uri: HYGRAPH_ENDPOINT,
    headers: {
      Authorization: apiKey,
    },
  }),
  cache: new InMemoryCache(),
});

export default client;

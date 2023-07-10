/* eslint-disable */

// @ts-ignore
const graphqlUrl = baseconf.GRAPHQL_URL || import.meta.env.VITE_GRAPHQL_URL

export default {
  graphql: {
    url: graphqlUrl as string,
  },
}

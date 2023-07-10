import { defineStore } from "pinia"
import { computed, ref } from "vue"
import config from "@/config"

import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
} from "@apollo/client/core"
import { provideApolloClient, useApolloClient } from "@vue/apollo-composable"
import { onError } from "@apollo/client/link/error"

import gql from "graphql-tag"

const httpLink = createHttpLink({
  uri: config.graphql.url,
})

// for handling all graphql errors in the response
const errorLink = onError(({ graphQLErrors }) => {
  if (graphQLErrors)
    graphQLErrors.map(({ message, locations, path }) =>
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    )
})

// const authMiddleware = new ApolloLink((operation, forward) => {
//   // add the authorization token to the headers
//   const token = useGlobalStore().getToken

//   operation.setContext({
//     headers: {
//       authorization: token ? `Bearer ${token}` : null,
//     },
//   })

//   return forward(operation)
// })

export const apolloClient = new ApolloClient({
  link: errorLink.concat(httpLink),
  cache: new InMemoryCache(),
})

export interface Prefixlist {
  id: string
  createdAt: string
  updatedAt: string
  name: string
  description: string
  collection: string
  prefixes: string[]
}

export const useGraphqlStore = defineStore("graphql", () => {
  useApolloClient()
  provideApolloClient(apolloClient)

  const currentPrefixlist = ref({} as Prefixlist)
  const prefixlists = ref([] as Prefixlist[])

  const getCurrentPrefixlist = computed(() => {
    return currentPrefixlist.value
  })

  const getPrefixlists = computed(() => {
    return prefixlists.value
  })

  async function queryPrefixlistByID(id: string) {
    console.debug("query prefixlist", id)

    const query = gql`
      query PrefixListByID($id: ID!) {
        prefixList(id: $id) {
          id
          createdAt
          updatedAt
          name
          description
          collection
          prefixes {
            id
            cidr
          }
        }
      }
    `

    try {
      const response = await apolloClient.query({
        query: query,
        variables: { id: id },
        fetchPolicy: "no-cache",
      })

      console.debug("response", response)
      currentPrefixlist.value = graphqlDataToPrefixlist(
        response.data.prefixList
      )
    } catch (err: any) {
      console.error(err.message)
    }
  }

  async function queryPrefixlists() {
    console.debug("query prefixlists")

    const query = gql`
      query PrefixLists {
        prefixLists {
          id
          createdAt
          updatedAt
          name
          description
          collection
        }
      }
    `

    try {
      const response = await apolloClient.query({
        query: query,
        fetchPolicy: "no-cache",
      })

      // console.debug("response", response)
      prefixlists.value = graphqlDataToPrefixlists(response.data)
    } catch (err: any) {
      console.error(err.message)
    }
  }

  return {
    getCurrentPrefixlist,
    getPrefixlists,
    queryPrefixlistByID,
    queryPrefixlists,
  }
})

// Helper functions to convert graphql data to our types

function graphqlDataToPrefixlist(data: any): Prefixlist {
  if (!data) {
    return {} as Prefixlist
  }

  return {
    id: data.id,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    name: data.name,
    description: data.description,
    collection: data.collection,
    prefixes: data.prefixes?.map((prefix: any) => {
      return prefix.cidr
    }),
  } as Prefixlist
}

function graphqlDataToPrefixlists(data: any): Prefixlist[] {
  if (!data) {
    return [] as Prefixlist[]
  }

  return data.prefixLists?.map((prefixlist: any) => {
    return graphqlDataToPrefixlist(prefixlist)
  })
}

// function graphqlDataToTenant(data: any): Tenant {
//   if (!data) {
//     return {} as Tenant
//   }

//   const annotationNamespaces: AnnotationNamespace[] =
//     data.annotationNamespaces?.edges.map((edge: any) => {
//       return graphqlDataToAnnotationNamespace(edge.node)
//     })

//   const locations: Location[] = data.locations?.edges.map((edge: any) => {
//     return graphqlDataToLocation(edge.node)
//   })

//   const children: Tenant[] = data.children?.edges.map((edge: any) => {
//     return graphqlDataToTenant(edge.node)
//   })

//   return {
//     id: data.id,
//     name: data.name,
//     description: data.description,
//     createdAt: data.createdAt,
//     updatedAt: data.updatedAt,
//     parent: graphqlDataToTenant(data.parent),
//     children: children,
//     annotationNamespaces: annotationNamespaces,
//     locations: locations,
//   }
// }

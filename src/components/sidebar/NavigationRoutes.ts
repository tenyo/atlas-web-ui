export interface INavigationRoute {
  name: string
  displayName: string
  meta: { icon: string }
  children?: INavigationRoute[]
}

const navigation = {
  root: {
    name: "/",
    displayName: "navigationRoutes.home",
  },

  routes: [
    {
      name: "dashboard",
      displayName: "Dashboard",
      meta: {
        icon: "vuestic-iconset-dashboard",
      },
    },
    {
      name: "builder",
      displayName: "Config builder",
      meta: {
        icon: "handyman",
      },
    },
    {
      name: "validator",
      displayName: "Config validator",
      meta: {
        icon: "rule",
      },
    },
    {
      name: "prefixlists",
      displayName: "Prefix lists",
      meta: {
        icon: "dns",
      },
    },
  ] as INavigationRoute[],
}

export default navigation

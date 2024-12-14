````markdown
# React Router as a Framework: A Complete Tutorial

Welcome to this comprehensive tutorial on using React Router as a full-fledged framework for building modern, data-driven web applications. We will walk through key concepts and APIs in a structured manner, starting from installation and going all the way through custom rendering strategies, data loading, actions, navigation, pending UI states, testing, and more. By the end of this guide, you’ll have a solid understanding of how React Router can streamline your development workflow.

_(Prefer video content? Check out my [YouTube channel PedroTechnologies](https://www.youtube.com/@pedrotechnologies) for video tutorials and deep dives!)_

## Table of Contents

1. [Installation](#installation)
2. [Routing](#routing)
3. [Route Module](#route-module)
4. [Rendering Strategies](#rendering-strategies)
5. [Data Loading](#data-loading)
6. [Actions](#actions)
7. [Navigating](#navigating)
8. [Pending UI](#pending-ui)
9. [Testing](#testing)
10. [Custom Framework](#custom-framework)

---

## Installation

Most React Router projects start with a template. These templates are maintained by the React Router team and help you quickly get set up:

```bash
npx create-react-router@latest my-react-router-app
```
````

Now change into the new directory and start the development server:

```bash
cd my-react-router-app
npm i
npm run dev
```

Open your browser to `http://localhost:5173` to see the running app.

For more templates and deployment-ready setups, refer to the official React Router templates.

---

## Routing

**Where do routes live?**  
Routes are defined in `app/routes.ts`. Each route has a URL pattern and a file path that points to its route module (the file defining its logic and UI).

**Basic Example:**

```typescript
import { type RouteConfig, route } from "@react-router/dev/routes";

export default [route("some/path", "./some/file.tsx")] satisfies RouteConfig;
```

**More Complex Example:**

```typescript
import {
  type RouteConfig,
  route,
  index,
  layout,
  prefix,
} from "@react-router/dev/routes";

export default [
  index("./home.tsx"),
  route("about", "./about.tsx"),

  layout("./auth/layout.tsx", [
    route("login", "./auth/login.tsx"),
    route("register", "./auth/register.tsx"),
  ]),

  ...prefix("concerts", [
    index("./concerts/home.tsx"),
    route(":city", "./concerts/city.tsx"),
    route("trending", "./concerts/trending.tsx"),
  ]),
] satisfies RouteConfig;
```

You can also use file-system routing conventions by using `@react-router/fs-routes`.

**Nested Routes:**

```typescript
export default [
  route("dashboard", "./dashboard.tsx", [
    index("./home.tsx"),
    route("settings", "./settings.tsx"),
  ]),
];
```

The parent route’s `<Outlet />` renders the child routes.

**Root Route:**  
Every route is nested inside `app/root.tsx`. This special root route can provide global layouts or error boundaries.

**Layout Routes:**  
Layout routes create nesting in the UI without adding to the URL.

**Index Routes:**  
`index()` defines a default child route at the parent’s URL.

**Route Prefixes:**  
`prefix()` can add a path prefix to a set of routes for organization.

**Dynamic Segments:**  
Use `:paramName` in the path to define a dynamic URL segment. These values are available in `params` in loaders, actions, and components.

---

## Route Module

Each route’s file (referenced in `routes.ts`) is a "route module." It can contain:

- A default exported component to render the UI.
- `loader` or `clientLoader` for data fetching.
- `action` or `clientAction` for data mutations.
- Error boundaries and headers.

**Example:**

```typescript
import type { Route } from "./+types/team";

export async function loader({ params }: Route.LoaderArgs) {
  let team = await fetchTeam(params.teamId);
  return { name: team.name };
}

export default function Team({ loaderData }: Route.ComponentProps) {
  return <h1>{loaderData.name}</h1>;
}
```

Nested routes let you build complex layouts. Remember to place `<Outlet />` in the parent route’s component to render children.

---

## Rendering Strategies

React Router supports three main strategies:

1. **Client Side Rendering (CSR):**  
   The entire app runs in the browser.

   ```typescript
   import type { Config } from "@react-router/dev/config";
   export default {
     ssr: false,
   } satisfies Config;
   ```

2. **Server Side Rendering (SSR):**  
   The initial render happens on the server.

   ```typescript
   export default {
     ssr: true,
   } satisfies Config;
   ```

3. **Static Pre-rendering:**  
   Generate static HTML at build time.
   ```typescript
   export default {
     async prerender() {
       return ["/", "/about", "/contact"];
     },
   } satisfies Config;
   ```

These strategies can be mixed. For example, you can statically pre-render some URLs and server-render others.

---

## Data Loading

Data is fetched in route modules using `loader` and `clientLoader`.

- **clientLoader:** Fetch data in the browser only.
- **loader:** Fetch data on the server (for SSR) or at build time (for pre-rendering).

**Client Data Loading Example:**

```typescript
export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const res = await fetch(`/api/products/${params.pid}`);
  return await res.json();
}
```

**Server Data Loading Example:**

```typescript
export async function loader({ params }: Route.LoaderArgs) {
  return fakeDb.getProduct(params.pid);
}
```

You can use both `loader` and `clientLoader` in the same route: `loader` for SSR/pre-rendered content, and `clientLoader` for subsequent navigations in the browser.

---

## Actions

Actions handle data mutations (POST, PUT, DELETE). After completion, all loader data is revalidated automatically.

- **clientAction:** Runs in the browser.
- **action:** Runs on the server.

**Client Action Example:**

```typescript
export async function clientAction({ request }: Route.ClientActionArgs) {
  let formData = await request.formData();
  let title = formData.get("title");
  let project = await someApi.updateProject({ title });
  return project;
}
```

**Calling Actions:**

- Using `<Form method="post">`
- Using `useSubmit()` hook
- Using `<fetcher.Form>` for no-navigation updates

---

## Navigating

Users navigate using:

- **`<NavLink>`:** For styled navigation with active/pending states.
- **`<Link>`:** Simple navigation.
- **`<Form>`:** Submit data and navigate based on user input.
- **`redirect`** inside loaders/actions.
- **`useNavigate()`:** Imperative navigation hook.

**Example `<NavLink>`:**

```jsx
<NavLink to="/home" className={({ isActive }) => (isActive ? "active" : "")}>
  Home
</NavLink>
```

---

## Pending UI

Show pending states while data loads or actions run:

- `useNavigation()` gives global navigation states.
- `<NavLink>` can display pending states.
- `<fetcher>` forms show localized pending states.

**Fetcher Example:**

```jsx
const fetcher = useFetcher();
return (
  <fetcher.Form method="post">
    <button type="submit">
      {fetcher.state !== "idle" ? "Saving..." : "Save"}
    </button>
  </fetcher.Form>
);
```

**Optimistic UI:**  
Use the submitted data to immediately update the UI, even before the server responds, for a more responsive feel.

---

## Testing

Use `createRoutesStub` to test components that rely on React Router’s context:

```jsx
import { createRoutesStub } from "react-router";
import { render, screen } from "@testing-library/react";
import { LoginForm } from "./LoginForm";

const Stub = createRoutesStub([
  {
    path: "/login",
    Component: LoginForm,
    action() {
      return { errors: { username: "Username required" } };
    },
  },
]);

test("shows error messages", async () => {
  render(<Stub initialEntries={["/login"]} />);
  // interact and assert...
});
```

This allows you to test route modules and components in isolation, ensuring your UI logic is solid.

---

## Custom Framework

Putting it all together, React Router behaves like a full framework:

- File-based (or configuration-based) routing
- Nested routes for layouts
- Data loading and actions integrated at the route level
- SSR, CSR, and static pre-rendering all supported
- Automatic data revalidation after actions
- Pending states, optimistic UI, and fetchers for a rich user experience

This cohesive approach reduces boilerplate, clarifies data flow, and makes building scalable, data-driven React apps much simpler.

---

## Conclusion

By following these steps, you’ve learned how to install React Router, configure routes, define route modules, choose rendering strategies, load data, perform actions, navigate efficiently, handle pending UI states, test route modules, and leverage React Router’s tools as a complete framework.

For more tutorials, examples, and in-depth guides, subscribe and check out my [YouTube channel PedroTechnologies](https://www.youtube.com/@pedrotechnologies).

Happy routing!

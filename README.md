# Using `<fetcher.Form>` vs. `<Form>` in React Router for a Better User Experience

In this tutorial, we'll dive into one of React Router's powerful features: `<fetcher.Form>`. We'll compare it with the standard `<Form>` component and show you when and why you might prefer `<fetcher.Form>`. By the end, you'll understand how `<fetcher.Form>` can greatly enhance your users' experience with more granular loading states, partial updates, and no full-page navigations.

_(If you prefer video content, check out my [YouTube channel PedroTechnologies](https://www.youtube.com/@pedrotechnologies) for more in-depth explanations and demos!)_

## Introduction

In React Router, forms are a built-in tool for triggering data mutations and navigation. The most common way to handle a form submission is by using the `<Form>` component:

```jsx
import { Form } from "react-router";

function UserProfile() {
  return (
    <Form method="post">
      <label>
        Username:
        <input type="text" name="username" />
      </label>
      <button type="submit">Save</button>
    </Form>
  );
}
```

````

When submitted, `<Form>` will send the form data to the route's action. Once the action completes, the router will perform a navigation (if needed) and revalidate data, giving you updated loader data. This is great for many workflows. However, sometimes you need something more subtle—enter `<fetcher.Form>`.

## What is `<fetcher.Form>`?

`<fetcher.Form>` is similar to `<Form>` but does **not** cause a navigation when you submit it. Instead, it calls the action and updates just the relevant parts of the UI. Think of it as performing an inline update, like submitting a small piece of data without leaving the current page or cluttering the user's browser history.

For example, consider toggling a favorite state on a post:

```jsx
import { useFetcher } from "react-router";

function Post({ post }) {
  const fetcher = useFetcher();
  const optimisticFavorite = fetcher.formData
    ? fetcher.formData.get("favorite") === "true"
    : post.favorite;

  return (
    <div>
      <h1>{post.title}</h1>
      <fetcher.Form method="post">
        <button
          type="submit"
          name="favorite"
          value={optimisticFavorite ? "false" : "true"}
        >
          {optimisticFavorite ? "★" : "☆"}
        </button>
      </fetcher.Form>
    </div>
  );
}
```

Here’s what makes `<fetcher.Form>` special:

1. **No Navigation:** The URL stays the same, no new history entries are created.
2. **Optimistic UI:** Since we know what we’re submitting, we can immediately show the user the updated state (like toggling from "☆" to "★") before the server even confirms it.
3. **Granular Loading States:** Each fetcher has its own state, so you can show a loading spinner or pending text specifically for that action. This doesn’t affect the rest of the page.

## When to Use `<fetcher.Form>`

Use `<fetcher.Form>` for:

- **Inline Updates:** Small changes that don’t warrant a full page refresh. For example, updating a task’s completion status, liking a post, or adding a comment in-place.
- **Avoiding Browser History Pollution:** If you do a lot of quick changes that shouldn’t appear in the user’s backward/forward history, `<fetcher.Form>` is ideal.
- **Optimistic UI:** If you know the future state of your data from the submitted form fields, you can display it immediately for snappier interactions.

## Comparison with Normal `<Form>`

**Normal `<Form>`:**

- Causes a route navigation after submission.
- Great for operations where the user expects to move to another page or see an updated version of the current page as a whole.
- The entire route and its data might revalidate, potentially changing large sections of the UI.

**`<fetcher.Form>`:**

- No route navigation, just a data mutation.
- Perfect for quick, partial UI updates.
- Lets you show loading states and optimistic updates in a more focused manner.

## Example: Deleting a Post

Consider a scenario where you have a list of posts, and each post has a "Delete" button. Using a normal `<Form>` would navigate away after deletion, but what if we just want to remove the post from the list without changing the URL?

```jsx
import { useFetcher } from "react-router";

function PostList({ posts }) {
  const fetcher = useFetcher();

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>
          {post.title}
          <fetcher.Form method="post" action={`/posts/${post.id}/destroy`}>
            <button type="submit">Delete</button>
          </fetcher.Form>
          {fetcher.state !== "idle" && <span>Deleting...</span>}
        </li>
      ))}
    </ul>
  );
}
```

In this code:

- The `<fetcher.Form>` submits to the destroy action for the post.
- On success, we can remove the post from the local state that generates `posts` or rely on a subsequent revalidation from a parent loader that updates the posts array.
- The user never leaves the page, and no extraneous browser history entries are created.

## Conclusion

`<fetcher.Form>` is a powerful tool that gives you fine-grained control over the user experience in React Router. It helps you create more dynamic, app-like experiences by avoiding full navigations and offering immediate, optimistic UI updates.

For more tips, tutorials, and in-depth looks at React Router features, be sure to subscribe and check out my [YouTube channel PedroTechnologies](https://www.youtube.com/@pedrotechnologies).

Happy coding!
````

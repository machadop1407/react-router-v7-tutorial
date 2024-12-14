import {
  Form,
  Link,
  NavLink,
  redirect,
  useFetcher,
  useNavigate,
  useNavigation,
} from "react-router";
import type { Route } from "./+types/post";

export async function clientLoader({ params }: Route.LoaderArgs) {
  const postId = params.postId;
  const res = await fetch(
    `https://jsonplaceholder.typicode.com/posts/${postId}`
  );
  return await res.json();
}

export async function clientAction({ params }: Route.ClientActionArgs) {
  try {
    await fetch(`https://jsonplaceholder.typicode.com/posts/${params.postId}`, {
      method: "DELETE",
    });
    return { isDeleted: true };
  } catch (err) {
    return { isDeleted: false };
  }
}

export default function Post({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const navigation = useNavigation();

  const isNavigating = Boolean(navigation.location);

  const isDeleted = fetcher.data?.isDeleted;
  const isDeleting = fetcher.state !== "idle";

  if (isNavigating) {
    return <p> Navigating...</p>;
  }

  return (
    <div>
      {" "}
      {!isDeleted && (
        <>
          <p> Title: {loaderData.title}</p>
          <p> Body: {loaderData.body}</p>
        </>
      )}
      <button onClick={() => navigate("/")}> Redirect </button>
      <fetcher.Form method="delete">
        <button type="submit"> Delete </button>
      </fetcher.Form>
      {isDeleting && <p> Deleting Post...</p>}
    </div>
  );
}

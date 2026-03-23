import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import { ErrorLink } from "@apollo/client/link/error";
import { CombinedGraphQLErrors, CombinedProtocolErrors } from "@apollo/client/errors";


// HTTP link
const httpLink = new HttpLink({
  uri: "http://localhost:4000/graphql",
});

// Auth link
const authLink = new SetContextLink((prevContext) => {
  const token = localStorage.getItem("accessToken");

  return {
    headers: {
      ...prevContext.headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// Error link
const errorLink = new ErrorLink(({ error }) => {
  //GraphQL errors
  if (CombinedGraphQLErrors.is(error)) {
    error.errors.forEach((err) => {
      console.error("GraphQL Error:", err.message);

      if (err.message === "Authentication required") {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    });
  }

  //Network / protocol errors
  else if (CombinedProtocolErrors.is(error)) {
    console.error("Network/Protocol Error:", error);
  }

  //Fallback
  else {
    console.error("Unknown Error:", error);
  }
});


// Combine links
export const client = new ApolloClient({
  link: errorLink.concat(authLink).concat(httpLink),
  cache: new InMemoryCache(),
});
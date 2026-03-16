import express from "express";
import cors from "cors";
import { json } from "body-parser";
import { ApolloServer } from "apollo-server-express";

import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";

const app = express();

app.use(cors());
app.use(json());

export const startApolloServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      const token = req.headers.authorization || "";

      return {
        token
      };
    }
  });

  await server.start();

  server.applyMiddleware({
    app,
    path: "/graphql"
  });

  return app;
};

export default app;
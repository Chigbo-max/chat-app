import express from "express";
import cors from "cors";
import * as dotenv from 'dotenv';
import { json } from "body-parser";
import { ApolloServer } from "apollo-server-express";

import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";

import authRoute from "./routes/auth.routes";



dotenv.config();

const app = express();



app.use(cors());
app.use(json());

app.use('/api/v1/auth', authRoute);

app.get('/', (_req, res) => {
  res.send('Works!!');
});

export const startApolloServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      const authHeader = req.headers.authorization || "";
      const token = authHeader.replace("Bearer ", "");
      return { token };
    },
  });
  
  await server.start();
  server.applyMiddleware({ app });

  return app;
};

export default app;
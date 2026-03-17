import { startApolloServer } from "./app";
import { connectDatabase } from "./config/database";

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    await connectDatabase();
    const app = await startApolloServer();


    app.listen(PORT, () => {
      console.log(`Server rrunning at: http://localhost:${PORT}`);
      console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error);
  }
}

startServer();
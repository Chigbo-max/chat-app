import { gql } from "apollo-server-express";
import { mergeTypeDefs } from "@graphql-tools/merge";

import { userSchema } from "./user.schema";
import { conversationSchema } from "./conversation.schema";
import { messageSchema } from "./message.schema";
import { notificationSchema } from "./notification.schema";

export const typeDefs = mergeTypeDefs([
  userSchema,
  conversationSchema,
  messageSchema,
  notificationSchema
]);
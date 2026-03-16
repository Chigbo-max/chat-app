import { userResolver } from "./user.resolver";
import { conversationResolver } from "./conversation.resolver";
import { messageResolver } from "./message.resolver";
import { notificationResolver } from "./notification.resolver";

export const resolvers:any = {
  Query: {
    ...userResolver.Query,
    ...conversationResolver.Query,
    ...messageResolver.Query,
    ...notificationResolver.Query
  },
  Mutation: {
    ...userResolver.Mutation,
    ...conversationResolver.Mutation,
    ...messageResolver.Mutation,
    ...notificationResolver.Mutation
  }
};
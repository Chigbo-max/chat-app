import { userResolver } from "./user.resolver";
import { conversationResolver } from "./conversation.resolver";
import { messageResolver } from "./message.resolver";
import { notificationResolver } from "./notification.resolver";
import { MessageService } from "../../services/concrete/MessageService";
import { ReactionService } from "../../services/concrete/ReactionService";


const messageService = new MessageService();
const reactionService = new ReactionService();


export const resolvers:any = {
  Query: {
    ...userResolver.Query,
    ...conversationResolver.Query,
    ...messageResolver(messageService, reactionService).Query,
    ...notificationResolver.Query
  },
  Mutation: {
    ...userResolver.Mutation,
    ...conversationResolver.Mutation,
    ...messageResolver(messageService, reactionService).Mutation,
    ...notificationResolver.Mutation
  },

  User: userResolver.User,


};
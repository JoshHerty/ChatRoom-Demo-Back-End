export default interface ChatMessage {
  avatar: string;
  userName: string;
  message: string;
  currentTime: string;
  roomId?: string;
}

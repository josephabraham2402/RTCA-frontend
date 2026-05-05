export const mockChats = [
  { id: 1, name: "Alice Johnson", avatar: "https://i.pravatar.cc/150?u=alice", message: "Hey! Are we still on for lunch?", time: "9:41 AM", unread: 2, isOnline: true, isGroup: false },
  { id: 2, name: "Dev Team", avatar: "https://i.pravatar.cc/150?u=devteam", message: "Sarah: Can you push the latest...", time: "9:28 AM", unread: 5, isGroup: true },
  { id: 3, name: "Emma Williams", avatar: "https://i.pravatar.cc/150?u=emma", message: "Thanks! That helps a lot.", time: "Yesterday", unread: 0, isOnline: false, isGroup: false },
  { id: 4, name: "Project Alpha", avatar: "https://i.pravatar.cc/150?u=projectalpha", message: "Mike: Updated the roadmap", time: "Yesterday", unread: 3, isGroup: true },
  { id: 5, name: "James Smith", avatar: "https://i.pravatar.cc/150?u=james", message: "Sounds good 👍", time: "Mon", unread: 0, isOnline: true, isGroup: false },
  { id: 6, name: "Marketing Team", avatar: "https://i.pravatar.cc/150?u=marketing", message: "Lisa: Here's the deck", time: "Mon", unread: 1, isGroup: true },
  { id: 7, name: "Olivia Brown", avatar: "https://i.pravatar.cc/150?u=olivia", message: "Can you share the file?", time: "Sun", unread: 0, isOnline: false, isGroup: false },
  { id: 8, name: "Design Squad", avatar: "https://i.pravatar.cc/150?u=design", message: "Alex: New Figma link", time: "Sun", unread: 0, isGroup: true },
];

export const mockFriendRequests = [
  { id: 1, name: "Liam Carter", avatar: "https://i.pravatar.cc/150?u=liam", mutualFriends: 8 },
  { id: 2, name: "Sophie Moore", avatar: "https://i.pravatar.cc/150?u=sophie", mutualFriends: 5 },
];

export const mockCallLogs = [
  { id: 1, name: "Alice Johnson", avatar: "https://i.pravatar.cc/150?u=alice", type: "outgoing", time: "9:15 AM", duration: "12:45" },
  { id: 2, name: "Dev Team", avatar: "https://i.pravatar.cc/150?u=devteam", type: "missed", time: "Yesterday", duration: "00:00" },
  { id: 3, name: "James Smith", avatar: "https://i.pravatar.cc/150?u=james", type: "outgoing", time: "Mon", duration: "08:32" },
  { id: 4, name: "Emma Williams", avatar: "https://i.pravatar.cc/150?u=emma", type: "outgoing", time: "Mon", duration: "05:11" },
];

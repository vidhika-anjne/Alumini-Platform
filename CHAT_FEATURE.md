# Chat Feature - Setup Instructions

This project now includes a complete one-to-one chat functionality between alumni and students.

## Setup Steps

### 1. Run the Database Migration

Execute the SQL migration script to create the necessary tables:

```sql
-- Run this in your Supabase SQL Editor
-- File: scripts/004_create_chat_tables.sql
```

Or use the Supabase CLI:

```bash
supabase db push
```

### 2. Enable Realtime (Optional but Recommended)

For real-time message updates, enable Realtime on the `messages` table in Supabase:

1. Go to your Supabase Dashboard
2. Navigate to Database > Replication
3. Enable replication for the `messages` table

## Features Included

### Database Schema
- **conversations table**: Stores one-to-one conversations between users
- **messages table**: Stores individual messages with read status
- **RLS Policies**: Secure row-level security ensuring users can only access their own conversations
- **Helper Functions**: `get_or_create_conversation()` for seamless conversation creation

### API Functions (`lib/supabase/chat.ts`)
- `getOrCreateConversation()` - Get or create a conversation with another user
- `getUserConversations()` - Fetch all conversations for the current user
- `getConversationMessages()` - Get messages for a specific conversation
- `sendMessage()` - Send a message in a conversation
- `markMessagesAsRead()` - Mark messages as read
- `subscribeToMessages()` - Real-time message subscription
- `getUnreadMessageCount()` - Get unread message count

### UI Components
- **ChatWindow**: Main chat interface with message display and input
- **ChatList**: List of conversations with last message preview
- **StartChatButton**: Button component to initiate new conversations

### Pages
- `/dashboard/student/chat` - Student chat page
- `/dashboard/alumni/chat` - Alumni chat page

### Integration Points
- Navigation menu includes "Messages" link for both students and alumni
- Alumni Directory includes "Message" buttons to start conversations
- Auto-navigation to conversations when starting a chat

## Usage

### Starting a Conversation
Students can start conversations with alumni from the Alumni Directory by clicking the "Message" button on any alumni profile card.

### Viewing Conversations
Navigate to the "Messages" page from the dashboard navigation to view all active conversations.

### Real-time Updates
Messages are updated in real-time when both users are active. The chat automatically scrolls to the latest message.

### Read Receipts
Messages are automatically marked as read when a user views a conversation.

## Security

- Row Level Security (RLS) ensures users can only access their own conversations
- Messages can only be sent by authenticated users who are part of the conversation
- All database operations are validated through Supabase's security policies

## Future Enhancements

Possible improvements:
- File/image sharing
- Typing indicators
- Message deletion/editing
- Group chats
- Push notifications for new messages
- Message search functionality
- Emoji reactions

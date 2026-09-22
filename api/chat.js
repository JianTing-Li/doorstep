// Vercel only routes functions found in /api at the project root, and this
// project's root is the repo root. The implementation stays in the chat
// product so that folder remains self-contained; this is only the entry point.
export { default } from "../chat/api/chat.js";

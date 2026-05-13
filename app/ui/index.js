// UI components

export function UserProfile({ userId }) {
  return `<div class="profile" id="user-${userId}"></div>`;
}

// Exercise: add the NotesList component below this line


export function NotesList({ userId }) {
  return `<ul id="notes-${userId}"></ul>`;
}


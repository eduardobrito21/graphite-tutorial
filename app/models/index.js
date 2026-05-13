// Data models for the app

export const User = {
  id: 'string',
  name: 'string',
  email: 'string',
};

// Exercise: add the Note model below this line

export const Note = {
  id: 'string',
  userId: 'string',
  body: 'string',
  createdAt: 'Date',
};
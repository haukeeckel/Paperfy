# Paperfy Overview

Service for people interested in the game genre Pen and Paper. Paperfy will be a plattform to find a Group to play with. Interact as a Player or Game Master and connect to others. We offer you an easy way into the first steps with Pen and Paper.

We have created Paperfy to connect interested people and to give an uncomplicated start into the hobby.

### Problem Statement

- Pen and Paper is only playable in Groups
- Current solutions are very anonymous

### Proposed Solution

- Socialized platform to connect

# Success Criteria

Find a group to play Pen and Paper and to have an easy start. Each user has a profile with some personal information, his characters and adventure history.

# User Stories

What will the user be able to do after the solution is shipped?

### Global

- **404** - As a user I want to see a nice 404 page when I go to a page that doesn’t exist so that I know it was my fault
- **500** - As a user I want to see a nice error page when the super team screws it up so that I know that is not my fault
- **homepage** - As a user I want to be able to access the homepage so that I see what the app is about and login and signup
- **sign up** - As a user I want to sign up on the website so that I can create Characters and join Adventures
- **login** - As a user I want to be able to log in on the website so that I can get back to my account
- **logout** - As a user I want to be able to log out from the webpage so that I can make sure no one will access my account

### User

- **userProfile** - As a user I want to access my profile and see which Characters I added which Adventures I've joined
- **userAccount** - As a user I want to be able to edit or delete my profile
- **userPermisson** - As a user I
- **createCharacter** - As a user I want to create my own Characters
- **editCharacter** - As a user I want to edit my own Characters
- **createAdventure** - As a user I want to create an Adventure
- **editAdventure** - As a user I want to edit my Adventure
- **findAdventure** - As a user I want to find an Adventure
- **joinAdventure** - As a user I want to join an Adventure

# Code

## Routes

### Public Routes

- GET/

### **Authentification Routes**

- GET /signup
- POST /signup
- GET /signin
- POST /signin
- GET /logout

### User **Routes**

- GET /me
- POST /me/delete

## Models

### UserModel

```jsx
username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      default: 'Unknown',
    },
    lastName: {
      type: String,
      default: 'Unknown',
    },
    isGameMaster: {
      type: Boolean,
      default: false,
    },
    birthDate: {
      type: Date,
    },
    status: {
      type: String,
      default: 'Hey Fellows, ready to dive in?',
    },
    avatar: {
      type: String,
    },
    playerExp: {
      type: String,
      enum: ['NONE', 'LOW', 'MEDIUM', 'HIGH'],
      default: 'LOW',
    },
    gameMasterExp: {
      type: String,
      enum: ['NONE', 'LOW', 'MEDIUM', 'HIGH'],
      default: 'NONE',
    },
    characters: {
      type: [Schema.Types.ObjectId],
      ref: 'Character',
    },
    location: {
      type: String,
      default: 'Unknown',
    },
    languages: {
      type: [String],
      default: ['Unknown'],
    }
```

### CharacterModel

### AdventureModel

# Scope

### Requirements

- Authentification & Authorization
- Find Group - Filter Options
  - Language
  - Setting
  - Rules
- User Profile
  - Avatar-API
  - Experience
  - Permission Role (Player/GM/Admin)
  - Delete Profile
- Character Subsite
  - Display Users Characters
  - Upload Char Bow
  - Display Group
  - Adventure Recap
- Game Master Subsite
  - Display Adventure Summery
  - Display Group
  - Adventure Recap
- Adventures
  - Create an Adventure
    - Permission GM
  - Apply Adventure
    - Permission Player
  - Display Adventure
    - Visitor

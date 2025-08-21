# Recipe sharing app

## About the project

Recipe sharing app primarily orientied for students. Users can look for various created recipes and create their own ones.

## Installation guide

### Requirements

- [Node.js](https://nodejs.org/en/)

### Setup

1. `npm install`
2. Create a PostgreSQL database.
3. Setup `.env` file based on `.env.example` files.

#### Environment variables

- <a href="https://github.com/settings/developers" target="_blank">GitHub Developer Portal</a>
- <a href="https://console.cloud.google.com/apis/dashboard" target="_blank">Google Cloud Console</a>
- <a href="https://aws.amazon.com/s3/" target="_blank">AWS S3 Storage</a>

#### Setting up GitHub App in <a href="https://github.com/settings/developers" target="_blank">GitHub Developer Portal</a>

- Set redirect URL to: http://localhost:3000/api/auth/callback/github
- Set homepage URL to: http://localhost:5173

#### Setting up Google Client in <a href="https://console.cloud.google.com/apis/dashboard" target="_blank">Google Cloud Console</a>

- Set Authorized redirect URL to: http://localhost:3000/api/auth/callback/google
- Set Authorized JavaScript origin to: http://localhost:3000

#### Running the server in development

```bash
# automatically restarts the server
npm run dev
```

#### Tests

```bash
# back end tests
npm test
```

#### Migrations

```bash
# prepare a migration
npm run migrate:new myMigrationName

# migrate up to the latest migration
npm run migrate:latest
```

#### Running the server in production

```bash
npm run build
npm run start

# or migrate + start
npm run prod
```

#### Updating types

If you make changes to the database schema, you will need to update the types. You can do this by running the following command:

```bash
npm run gen:types
```

#### Running the client in development

```bash
# automatically restarts the client
npm run dev
```

### Testing out the features from server

#### Via trpc-panel

<details>
<summary><strong>recipes.create</strong></summary>

_Example usage:_

```json
{
  "json": {
    "title": "Delicious recipe",
    "duration": "40 minutes",
    "steps": [
      "Boil pasta",
      "Fry pancetta.",
      "Mix eggs and cheese.",
      "Combine all."
    ],
    "ingredients": ["spaghetti", "eggs", "pancetta", "parmesan", "pepper"],
    "tools": ["pot", "frying pan", "mixing bowl", "tongs"]
  }
}
```

</details>

<details>
<summary><strong>recipes.findAll</strong></summary>

_Example usage:_

```json
{
  "json": {
    "offset": 0,
    "limit": 5
  }
}
```

</details>

<details>
<summary><strong>recipes.findById</strong></summary>

_Example usage:_

```json
{
  "json": 3334
}
```

</details>

<details>
<summary><strong>recipes.remove</strong></summary>

_Example usage:_

```json
{
  "json": 3336
}
```

</details>

<details>
<summary><strong>recipes.findCreated</strong></summary>

_Example usage:_

```json
{
  "json": {
    "userId": "abcdefghiklmnop",
    "offset": 0,
    "limit": 5
  }
}
```

</details>

<details>
<summary><strong>recipes.findSaved</strong></summary>

_Example usage:_

```json
{
  "json": {
    "userId": "abcdefghiklmnop",
    "offset": 0,
    "limit": 5
  }
}
```

</details>

<details>
<summary><strong>savedRecipes.save</strong></summary>

_Example usage:_

```json
{
  "json": 2694
}
```

</details>

<details>
<summary><strong>savedRecipes.unsave</strong></summary>

_Example usage:_

```json
{
  "json": 2694
}
```

</details>

<details>
<summary><strong>users.getRecipes</strong></summary>

_Example usage:_

```json
{
  "json": {
    "userId": "abcdefghiklmnop",
    "offset": 0,
    "limit": 5
  }
}
```

</details>

<details>
<summary><strong>users.findById</strong></summary>

_Example usage:_

```json
{
  "json": "abcdefghiklmnop"
}
```

</details>

#### Via front-end

**Homepage testing**

- Traditional sign-up/sign-in (Email verification is required. After signing up can just change email_verified to true in database)
- OAuth sign-ins via Github or Google accounts
- Check session (Shows user ID)
- Logout
- Password reset:
  - Click 'Check Session' to get userId in broswer console
  - Enter the userId in input where 'UserId:' placeholder is
  - Click 'Get Link For Password Reset'
  - Go to email and click on the button
  - Enter new password and click 'Reset Password'

**Testing with real pages** (only mobile design done so far)

##### Signup

- Route: _/signup_
- Test - traditional signup, OAuth sign-ins via Google or Github
- Email verification is required if signed up via traditional method. After signing up can just change email_verified to true in database

##### Login

- Route: _/login_
- Test - traditional login, OAuth sign-ins via Google or Github

##### Request reset password

- Route: _/request-reset-password_
- Test - Link sending to email for password reset

##### Reset password

- Route: _/reset-password_
- Test - reset password

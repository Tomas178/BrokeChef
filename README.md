# Recipe sharing app

## About the project

Recipe sharing app primarily orientied for students. Users can look for various created recipes and create their own ones.

### Hosted site URL

https://brokechef.sk05mvs33xkna.eu-central-1.cs.amazonlightsail.com/

## Features

- Sign up/Sign in
- Reset password
- Change email/password
- Add/update profile image
- Create recipe (User can add his own image or an AI will generate based of ingredients and title)
- Delete recipe
- Save/unsave recipe
- Rate/remove rating
- Follow/unfollow another user
- Look through following/followers list of a user
- Search recipes in homepage
- Sorting (newest/oldest, highest/lowest rated)

## Installation guide

### Requirements

- [Node.js](https://nodejs.org/en/)
- [Docker](https://www.docker.com/) (To start up mailhog for development purposes)

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
    "limit": 5,
    "sort": "newest"
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
<summary><strong>recipes.isAuthor</strong></summary>

_Example usage:_

```json
{
  "json": 1
}
```

</details>

<details>
<summary><strong>recipes.totalCount</strong></summary>

_Example usage:_

```json
{
  "json": {}
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
<summary><strong>savedRecipes.isSaved</strong></summary>

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
<summary><strong>users.getCreatedRecipes</strong></summary>

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
<summary><strong>users.getSavedRecipes</strong></summary>

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
<summary><strong>users.totalCreated</strong></summary>

_Example usage:_

```json
{
  "json": null || "abcdefghiklmnop"
}
```

</details>

<details>
<summary><strong>users.totalSaved</strong></summary>

_Example usage:_

```json
{
  "json": null || "abcdefghiklmnop"
}
```

</details>

<details>
<summary><strong>users.findById</strong></summary>

_Example usage:_

```json
{
  "json": null || "abcdefghiklmnop"
}
```

</details>

<details>
<summary><strong>users.updateImage</strong></summary>

_Example usage:_

```json
{
  "json": "image-url"
}
```

</details>

<details>
<summary><strong>ratings.getUserRatingForRecipe</strong></summary>

_Example usage:_

```json
{
  "json": ${recipeId}
}
```

</details>

<details>
<summary><strong>ratings.rate</strong></summary>

_Example usage:_

```json
{
  "json": {
    "recipeId": 927,
    "rating": 2
  }
}
```

</details>

<details>
<summary><strong>ratings.update</strong></summary>

_Example usage:_

```json
{
  "json": {
    "recipeId": 927,
    "rating": 2
  }
}
```

</details>

<details>
<summary><strong>ratings.remove</strong></summary>

_Example usage:_

```json
{
  "json": 1352
}
```

</details>

<details>
<summary><strong>follows.follow</strong></summary>

_Example usage:_

```json
{
  "json": ${Other User ID}
}
```

</details>

<details>
<summary><strong>follows.unfollow</strong></summary>

_Example usage:_

```json
{
  "json": ${Other User ID}
}
```

</details>

<details>
<summary><strong>follows.isFollowing</strong></summary>

_Example usage:_

```json
{
  "json": ${Other User ID}
}
```

</details>

<details>
<summary><strong>follows.totalFollowing</strong></summary>

_Example usage:_

```json
{
  "json": null || ${Other User ID}
}
```

</details>

<details>
<summary><strong>follows.totalFollowers</strong></summary>

_Example usage:_

```json
{
  "json": null || ${Other User ID}
}
```

</details>

<details>
<summary><strong>follows.getFollowing</strong></summary>

_Example usage:_

```json
{
  "json": null || ${Other User ID}
}
```

</details>

<details>
<summary><strong>follows.getFollowers</strong></summary>

_Example usage:_

```json
{
  "json": null || ${Other User ID}
}
```

</details>

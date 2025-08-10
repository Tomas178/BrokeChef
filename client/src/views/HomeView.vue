<script setup lang="ts">
import { authClient } from '@/lib/auth-client';
import { trpc } from '@/trpc';
import { ref } from 'vue';

const signUpUsername = ref('');
const signUpEmail = ref('');
const signUpPassword = ref('');

const signInEmail = ref('');
const signInPassword = ref('');

const userId = ref('');

const newPassword = ref('');

const resetPassword = async (newPass: string) => {
  const token = new URLSearchParams(window.location.search).get('token');

  if (!token) {
    console.log('No token!');
    return;
  }

  await authClient.resetPassword({
    newPassword: newPass,
    token,
    fetchOptions: {
      onSuccess: () => console.log('Password is resetted'),
    },
  });
};

const sendPasswordResetLink = async () => {
  const user = await trpc.users.findById.query(userId.value);

  await authClient.requestPasswordReset({
    email: user.email,
    redirectTo: 'http://localhost:5173',
    fetchOptions: {
      onSuccess: () => {
        console.log(`Password reset link sent to: ${user.email}`);
      },
    },
  });
};

const loginWithSocials = async (providerName: string) => {
  await authClient.signIn.social({
    provider: providerName,
    callbackURL: 'http://localhost:5173',
  });
};

const logout = async () => {
  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        console.log('User logged out successfully!');
      },
    },
  });
};

const checkSession = async () => {
  try {
    const user = await trpc.auth.me.query();
    console.log('User:', user);
  } catch (err) {
    console.error('Not authenticated:', err);
  }
};

const checkUserById = async (id: string) => {
  const user = await trpc.users.findById.query(id);
  console.log({ user });
};

const signUp = async () => {
  await authClient.signUp.email({
    name: signUpUsername.value,
    email: signUpEmail.value,
    password: signUpPassword.value,
    callbackURL: 'http://localhost:5173/',
    fetchOptions: {
      onSuccess: () => {
        console.log(`${signUpEmail.value} Registered!`);
      },
    },
  });
};

const signIn = async () => {
  await authClient.signIn.email({
    email: signInEmail.value,
    password: signInPassword.value,
    fetchOptions: {
      onSuccess: () => {
        console.log(`${signInEmail.value} Logged in!`);
      },
      onError: (ctx) => {
        if (ctx.error.status === 403) {
          alert('Please verify your email address');
        }
      },
    },
  });
};
</script>

<template>
  <div id="sign-up">
    <input type="text" v-model="signUpUsername" placeholder="Username:" />
    <input type="email" v-model="signUpEmail" placeholder="Email:" />
    <input type="password" v-model="signUpPassword" placeholder="Password:" />
    <button class="sign" @click="signUp">Sign Up</button>
  </div>

  <div id="sign-in">
    <input type="email" v-model="signInEmail" placeholder="Email:" />
    <input type="password" v-model="signInPassword" placeholder="Password:" />
    <button class="sign" @click="signIn">Sign In</button>
  </div>

  <button class="social-button" @click="loginWithSocials('github')">
    Login with GitHub
  </button>
  <button class="social-button" @click="loginWithSocials('google')">
    Login with Google
  </button>
  <button @click="checkSession">Check Session</button>

  <input type="text" v-model="userId" placeholder="UserId:" />
  <button @click="checkUserById(userId)">Check user by id</button>

  <button @click="logout">Logout</button>

  <div id="reset-password">
    <input type="password" v-model="newPassword" placeholder="new password:" />
    <button @click="sendPasswordResetLink">Get Link For Password Reset</button>
    <button @click="resetPassword(newPassword)">Reset Password</button>
  </div>
</template>

<style>
@reference '../assets/styles.css';

#sign-up {
  @apply flex flex-col justify-center border-4;
}

input {
  @apply ml-4;
}

#sign-in {
  @apply my-4 flex flex-col justify-center border-4;
}

.sign {
  @apply bg-amber-600;
}

.social-button {
  @apply bg-blue-500;
}

button {
  @apply mx-2 cursor-pointer;
}
</style>

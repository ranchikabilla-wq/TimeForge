# 🔐 Supabase Google OAuth Setup Guide

This guide will help you fix the **404 Not Found** error when logging in with Google.

---

## 🚨 Common Issue: 404 Error on Google Login

If you're getting a **404 Not Found** error after clicking "Continue with Google", it means your Supabase project isn't properly configured for OAuth redirects.

---

## ✅ Step-by-Step Fix

### 1. Configure Redirect URLs in Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication** → **URL Configuration**
4. Add the following URLs to **Redirect URLs**:

   ```
   http://localhost:5173/login
   http://localhost:5173/home
   https://yourdomain.com/login
   https://yourdomain.com/home
   ```

   **Important:** Replace `yourdomain.com` with your actual production domain.

5. Click **Save**

### 2. Enable Google OAuth Provider

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Find **Google** in the list
3. Toggle it **ON** (enabled)
4. You'll need to provide:
   - **Client ID** (from Google Cloud Console)
   - **Client Secret** (from Google Cloud Console)

### 3. Get Google OAuth Credentials

If you don't have Google OAuth credentials yet:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure the OAuth consent screen if prompted
6. For **Application type**, select **Web application**
7. Add **Authorized redirect URIs**:
   ```
   https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback
   ```
   Replace `YOUR_SUPABASE_PROJECT_REF` with your actual Supabase project reference (found in your Supabase project URL)

8. Click **Create**
9. Copy the **Client ID** and **Client Secret**
10. Paste them into Supabase (step 2 above)

### 4. Update Your Supabase API Key

In [`src/supabaseClient.js`](src/supabaseClient.js:11), replace the placeholder with your actual Supabase anon key:

```javascript
// BEFORE (won't work):
const SUPABASE_PUBLIC_KEY = "YOUR_SUPABASE_ANON_KEY_HERE";

// AFTER (get this from Supabase Dashboard → Settings → API):
const SUPABASE_PUBLIC_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."; // Your actual key
```

To find your anon key:
1. Go to Supabase Dashboard
2. Navigate to **Settings** → **API**
3. Copy the **anon public** key (starts with `eyJ...`)

---

## 🧪 Testing the Fix

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to the login page:**
   ```
   http://localhost:5173/login
   ```

3. **Click "Continue with Google"**
   - You should be redirected to Google's login page
   - After logging in, you should be redirected back to `/login`
   - The app will then automatically navigate you to `/home`

4. **Check for errors:**
   - Open browser DevTools (F12)
   - Check the Console tab for any errors
   - If you see authentication errors, verify your API key is correct

---

## 🔍 Troubleshooting

### Still getting 404?

**Check these:**

1. ✅ Redirect URLs are correctly added in Supabase Dashboard
2. ✅ Google OAuth provider is enabled in Supabase
3. ✅ Google OAuth credentials (Client ID & Secret) are correctly entered
4. ✅ Authorized redirect URI in Google Cloud Console matches your Supabase callback URL
5. ✅ Supabase anon key is correctly set in `src/supabaseClient.js`

### "Invalid API key" error?

- Your `SUPABASE_PUBLIC_KEY` is still set to the placeholder
- Go to Supabase Dashboard → Settings → API
- Copy the **anon public** key
- Replace the placeholder in `src/supabaseClient.js`

### "Redirect URI mismatch" error?

- The redirect URI in Google Cloud Console doesn't match
- Make sure you added: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
- Replace `YOUR_PROJECT_REF` with your actual Supabase project reference

### OAuth works but redirects to wrong page?

- Check the `redirectTo` option in [`src/supabaseClient.js:25`](src/supabaseClient.js:25)
- It's currently set to `/login` which is correct
- The auth state listener in [`LoginPage.tsx:39`](src/pages/LoginPage.tsx:39) will handle navigation to `/home`

---

## 📝 How It Works

1. User clicks "Continue with Google"
2. App calls `signInWithGoogle()` which redirects to Google
3. User logs in with Google
4. Google redirects to Supabase callback URL
5. Supabase processes the OAuth response
6. Supabase redirects to your app at `/login` (with auth tokens in URL)
7. The `onAuthStateChange` listener detects the sign-in
8. App navigates user to `/home`

---

## 🎯 Quick Checklist

Before deploying to production:

- [ ] Supabase anon key is configured (not placeholder)
- [ ] Google OAuth provider is enabled in Supabase
- [ ] Google OAuth credentials are added to Supabase
- [ ] Production domain redirect URLs are added to Supabase
- [ ] Production domain is added to Google Cloud Console authorized URIs
- [ ] Test login flow in production environment

---

## 📚 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase OAuth Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)

---

## 💡 Need Help?

If you're still experiencing issues:

1. Check the browser console for detailed error messages
2. Check Supabase logs in Dashboard → Logs → Auth
3. Verify all URLs match exactly (no trailing slashes, correct protocol)
4. Make sure your Supabase project is not paused (free tier limitation)

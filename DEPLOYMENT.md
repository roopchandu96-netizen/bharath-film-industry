
# Bharath Film Industry - Deployment Guide

This project is a React application built with Vite and TypeScript. It is configured for easy deployment on Netlify.

## Deployment Steps

1.  **Connect to Netlify:**
    *   Push your code to a Git repository (GitHub, GitLab, or Bitbucket).
    *   Log in to [Netlify](https://app.netlify.com/).
    *   Click "Add new site" -> "Import an existing project".
    *   Select your repository.

2.  **Configure Build Settings:**
    *   Netlify should automatically detect the settings from the `netlify.toml` file included in this project.
    *   **Build command:** `npm run build`
    *   **Publish directory:** `dist`

3.  **Environment Variables:**
    *   Go to **Site configuration > Environment variables**.
    *   Add the following variables (you can find these in your source code):
        *   `VITE_GEMINI_API_KEY`: [Your Gemini API Key]
        *   `VITE_SUPABASE_URL`: `https://qpgidlybygavthytsxvl.supabase.co`
        *   `VITE_SUPABASE_ANON_KEY`: `sb_publishable_IfneTTGO7RqW4vjlMJ8HQw_xRq83L6o`

4.  **Deploy:**
    *   Click "Deploy site".

## Local Development

To run the project locally:

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Start the development server:
    ```bash
    npm run dev
    ```

3.  Build for production:
    ```bash
    npm run build
    ```

## Troubleshooting

*   **Routing Issues:** If you encounter 404 errors when refreshing pages, ensure the `_redirects` rule or `netlify.toml` redirect configuration is present. This project includes a `netlify.toml` which handles this automatically.
*   **Build Failures:** Check the "Build logs" in Netlify for specific error messages. Ensure all dependencies are listed in `package.json`.

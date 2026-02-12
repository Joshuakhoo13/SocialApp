# Social App

Short one-sentence description

## 🚀 Features

## 🛠 Tech Stack

## 📦 Installation

### 1. Install Node.js

Node.js is required to run this application.

#### Download Node.js (LTS)

Go to:

https://nodejs.org

Download the **LTS (Long Term Support)** version.  
⚠️ Do **NOT** download the “Current” version.

#### Run the Installer

1. Double click the downloaded `.msi` file  
2. Click **Next**  
3. Accept the license agreement  
4. Keep the default settings  
5. Make sure this option is checked:

   ✅ Add to PATH  

6. Click **Install**

#### Verify Installation

Open **Command Prompt (CMD)** and run:

```bash
node -v
```
You should see something like:
v20.x.x

### 2. Install Expo Go

Go to Appstore/Playstore and download Expo Go app on your phone.

### 3. Clone Repository and Install Dependencies

1. Clone the repository:

```bash
git clone https://github.com/Joshuakhoo13/SocialApp.git
cd SocialApp
```

2. Install dependencies:

```bash
npm install
```

### 3. Create a Supabase Account and Project

Supabase provides the backend (database and auth) for this application.

#### Create an Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click **Start your project**
3. Sign up with GitHub, Google, or your email

#### Create a New Project

1. After signing in, click **New Project**
2. Choose your organization (or create one)
3. Fill in the project details:
   - **Name** – e.g. `social-app`
   - **Database Password** – choose a strong password and save it
   - **Region** – select Singapore
4. Enable RLS and data api
5. Click **Create new project**
6. Wait for the project to finish provisioning (1–2 minutes)

#### Create the post-photos Bucket

1. In the Supabase dashboard, go to **Storage** in the left sidebar
2. Click **New bucket**
3. Set the bucket name to `post-photos`
4. Make it public if the app needs to display images
5. Click **Create bucket**

### 4. Configure the .env File

Create a `.env` file in the project root with your Supabase credentials.

1. Copy the example file:

```bash
cp .env.example .env
```

2. Open `.env` and replace the placeholder values with your Supabase project details:

   - **SUPABASE_URL** / **EXPO_PUBLIC_SUPABASE_URL** – Project URL from the project overview page
   - **SUPABASE_ANON_KEY** / **EXPO_PUBLIC_SUPABASE_ANON_KEY** – anon public key from **Project Settings** → **API keys** → Legacy anon, service_role API keys
   - **SUPABASE_SERVICE_ROLE_KEY** – service role key from **Project Settings** → **API keys** → Legacy anon, service_role API keys (keep this secret)

3. Save the file. The app will load these variables when you run it.

⚠️ Never commit `.env` to git – it is already in `.gitignore`.

### 5. Run the Database Schema

1. Open `databaseconfig/schema.sql` in this project
2. Copy all the code
3. In your Supabase dashboard, go to **SQL Editor**
4. Click **New query**
5. Paste the schema code into the editor
6. Click **Run** to create the tables and policies

## ▶️ Running the App

1. Add seed.json file into project root (can just drag and drop).

2. Seed users (creates auth users and populates the user table from authors in `seed.json`):

```bash
npm run seed
```

3. Import posts (populates the post table; requires users to exist first):

```bash
npm run import:posts
```

4. Start the development server:

```bash
npx expo start
```

5. Choose how to run: scan the QR code with Expo Go for android, scan with camera for ios

## 🧪 Testing

## 📂 Project Structure

## 🔐 Environment Variables (if any)

## 📸 Screenshots (Optional but impressive)

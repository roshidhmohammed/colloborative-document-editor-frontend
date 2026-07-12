# Colloborative Document Editor - Frontend

# Instruction to set up the project on the local machine

1. First, run the development server:

```bash
git clone https://github.com/roshidhmohammed/colloborative-document-editor-frontend.git
cd colloborative-document-editor-frontend
```

2.  Install all the dependencies used in this app using the below command:

```bash
npm install
```

3.  Create .env file on the root on the project folder (outside the src folder) and then add the below fields into the file

```bash
VITE_BACKEND_URL=""
eg: VITE_BACKEND_URL=""http://localhost:5000/api""
```

4.  Start the project using the below command:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) with your browser to see the app.

# Assumptions made

1.  The authenticated has permission to create, update, delete task, and assigning user to the task.

2.  Only showing all the users in assigning users list except the authenticated user. The list also includes the creator of the specific task.

3. The task creators can choose the likely given option for status (such as pending, in progress, completed) while creating the task.


# Project Architecture

- **src/api** - API related functions and methods (eg: axiosInstance)
- **src/common/** - Reusable components across the application like headers, buttons, modals, etc...
- **src/pages** - Every frontend page structure and contains the components
- **src/components** - contains all the components other than reusable components
**src/constants** - constants variables and hardcoded data
- **src/ProtectedRoutes** - Protected route logic
- **src/slices** - Reducers
- **src/utils** - reusable function and input validation functions
-  **src/store.js** - store for the application global state

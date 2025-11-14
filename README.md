# 

## Setup Instructions

To run the project you need node >= 22.

### Frontend

If we want to run the project frontend locally starting from the project root run the 
following commands:

```bash
$ cd frontend
$ npm i
$ npm run dev
```

### Backend

To run the backend the following environment variables need to be set up:
- `PORT` - the port where the app will run
- `MONGO_molson_desks` - the connection string for the desks database
- `MONGO_molson_user` - the connection string for the users database
- `JWT_SECRET` - the secret used to sign the JWT tokens
- `JWT_EXPIRES_IN` - the expiration time for the JWT tokens (e.g. 1d, 7d, etc.)

If we want to run the project backend locally, starting from the project root we run
the following commands:

```bash
$ cd backend
$ npm i
$ npm run dev
```

## Tech Stack

The frontend of the project is built with React and Tailwindcss, bundled with
Vite. The backend is built with Node.js and Express, using MongoDB as the primary database.

## Demo Credentials

The demo database starts with users that have following roles:

admin role:
- email: test@example.com
- password: Hackathon@1234

The website can be found at https://molsongbsspaces.onrender.com/

# Molsongbsspaces

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
- ``PORT``
- ``MONGO_molson_desks``
- ``MONGO_molson_user``
- ``JWT_SECRET``
- ``JWT_EXPIRES_IN``

If we want to run the project backend locally, starting from the project root we run
the following commands:

```bash
$ cd backend
$ npm i
$ npm run dev
```

## Tech Stack

The project was made with the MERN Stack. The frontend was made with React 
while the backend was made using ExpressJS and NextJS. The database of the 
project is MongoDB (noSQL database).

## Demo Credentials

The demo database starts with users that have following roles:

admin role:
- email: test@example.com
- password: Hackathon@1234


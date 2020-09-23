# Task_Manager_API
A REST Api for managing tasks. The API can handle creatiion,updation and deletion of tasks along with authentication and authorization of the user. A welcome mail is also sent on every new user registration.
Live Demo of API: https://task-manager-by-arnab-ap.herokuapp.com

## Routes
- Create User - (POST) /user
- Upload Avatar - (POST) /user/me/avatar
- User Login - (POST) /user/login 
- User Logout -  (POST) /user/logout
- User Logout(All Devices) - (POST) /user/logoutAll
- Create Task - (POST) /task
- Read Profile - (GET) /user/me
- Read Tasks - (GET) /task?sortBy=createdAt:desc
- Read Task - (GET) /task/{:id}
- Update User - (PATCH) /user/me
- Update Task -  (PATCH) /user/{id}
- Delete User - (DELETE) /user/me
- Delete Avatar - (DELETE) /user/me/avatar
- Delete Task - (DELETE) /task/{:id}

## Tech Stack
 - Runtime Env - Node.js
 - Backend Framework - Express.js 
 - Database - Mongo DB
 - Emailing - SendGrid
 - API testing Framework - Jest
 - Deployment - Heroku



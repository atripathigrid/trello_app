Module 10. Capstone project
This is a final project for this course. Consider the description below as a recommendation. It allows using different technologies, which means that implementation may vary. It intentionally doesn’t contain all the details, so that you could think of your unique solution. Please use all knowledge and skills received in the previous modules and propose your own implementation. Discuss the solution and all related questions with your mentor.
Expected duration:
4 weeks

Module goals
After completing this this module, you will:
 Create a unique solution and deploy your application to the Cloud
 Set up a test suite for you application
 Dockerize your application for easy distribution

Practical task
Trello REST API implementation.

Trello is a web-based project management that uses a Kanban-style approach to help individuals and teams organize and track their tasks. It provides a visual interface with boards, sections and cards allowing users to create, assign and prioritize tasks; set due dates; collaborate with team members. Trello helps streamline workflows and facilitates efficient project management.


Part 1 of the Capstone project

Part 1 has following requirements: your application should have many abilities such as (but not limited to):
 Ability to register users in the system (and save them to Database). Confirmation can be omitted for this one. Data to provide: email, password, first name, last name. Response: same user data if http response is 200
 Ability to login with email and password (to get auth token). All other functionality should be available only to the authorized user
 Ability to create Board with its name and description
 Ability to get list of boards that are associated with current user
 Ability to get detailed information of selected boards (only if it is accessible to the user). Detailed information includes (but not limited to): all board’s sections, all tickets in the section, all users associated with the board, invitation token
 Ability to send invitations (tokens/links). Given a board you should have the ability to send an invitation token/link to another user. Invited users may only work on tickets that they created themselves on this board. Board owner can edit any data that is related to this board
 CRUD operations for sections. Parent board cannot be changed. Section has a name and description
 CRUD operations for tickets. Parent section can be changed but should be on the same board. Ticket has a name, description and a person assigned to it

Project source code should be uploaded to your GD GitHub repository and be visible to your mentor (you may have to add your mentor to the project). Project should contain documentation and a Readme file with a complete set of instructions on how to set up a local environment to run and develop your application from scratch. Note: do not upload any of your testing databases/tokens/etc to the repository, everything should be created at the start.


Part 2 of the Capstone project
Write a test coverage of your project. Part 2 has following requirements:
 At least 50% of your functions should be covered with unit tests
 At least 50% of your endpoints should be covered with integration tests
 Project’s Readme file should contain all the necessary information on how to set up a testing environment and run actual tests


Part 3 of the Capstone project
Dockerize your application. Part 3 requires from you to complete the following (but not limited to) tasks such as creating a Dockerfile and docker-compose files. Docker-compose files should contain definitions of at least 3 containers:
 uvicorn/gunicorn runner with application’s backend data (should be built from project’s Dockerfile)
 Database container (PostgreSQL)
 Nginx/Traefik webserver container (or you can choose another one)



Depending of what you have chosen for your backend earlier (either Flask or FastAPI) you may find following links with materials useful to you:

 Dockerizing Flask with Postgres, Gunicorn, and Nginx
 Dockerizing FastAPI with Postgres, Uvicorn, and Traefik


Part 4 of the Capstone project
Part 4 implies that you need to create a cloud infrastructure for your project. You can use any cloud resources provider (AWS, Azure, GCP) but preferred will be the one that you are going to get a cloud certificate for. Part 4 requirements are as follows:

 Application should be able to scale horizontally
 Actual instances shouldn’t have public IP addresses
 Database should be deployed into cloud database service (this may differ from service to service but the general idea should be the same). Database must have 1 instance without any replicas
 Application instances should have multi-regional deployment


[Optional] Part 5 of the Capstone project
Part 5 implies that you need to create a CI/CD pipeline for your project. This most probably should be implemented using GitHub actions since the theoretical part of the course was focused on it. Part 5 requirements are as follows:

 On every created PR to master - CI pipeline should be runned. CI stage in this case will only include unit tests run.
 On every merge/commit into master CI/CD pipeline should be started. CI stage here will include also building a new version of docker-image and pushing it to the Container repository. On CD stage you should apply your IAC files to deploy new versions of infrastructure to update existing deployment.


Assessment
Once the project is ready, get prepared to make a demo.

During the demo you need to:
 Show the architecture diagram for your infrastructure (if any) and describe the solution
 Demonstrate that the application is connecting to a Database
 Demonstrate all the required functionality of you application
 Walk through the code and configuration files, and explain how the solution was implemented
 Be ready to answer the questions from the demo viewers (your mentor and other possible participants of the demo session)
 Ask your mentor to confirm(in the next module) that this module is completed

Internship demo session should be organized by the mentor. Mentor may add another participants such as other interns to the session alongside with devops interns (if any), specialization lead, other mentors, etc. Mentor may request a feedback from other participants of the session and use their feedback during the performance review.
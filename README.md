# Enterprise Software Lifecycle and DevOps Management System

A full-stack web application designed to provide a centralized platform for managing software development lifecycle and DevOps activities.

The system brings together project management, sprint planning, task tracking, defect management, repository management, code commits, test cases, deployments, team management, activity logs, and other software engineering activities within a single platform.

## Overview

Modern software development teams often rely on multiple disconnected tools for planning, development, testing, deployment, and monitoring. This can result in fragmented information, repeated data entry, and difficulty tracking the complete software lifecycle.

The **Enterprise Software Lifecycle and DevOps Management System** addresses this problem by providing a centralized web-based platform where users can manage and monitor important software development and DevOps activities from one place.

The application consists of a React-based frontend, a Spring Boot backend, and a MySQL database connected through REST APIs.

## Problem Statement

Software development activities are frequently distributed across different tools and platforms. Managing projects, sprints, tasks, defects, repositories, testing, and deployments separately can make it difficult to maintain a clear view of the overall development process.

This project aims to provide a unified platform that reduces this fragmentation and improves visibility, organization, and management of software development activities.

## Objectives

- Centralize software development lifecycle activities in one platform.
- Manage projects, sprints, and tasks efficiently.
- Track bugs and defects throughout their lifecycle.
- Manage repositories and code commits.
- Manage software test cases and testing activities.
- Track deployment information and deployment status.
- Provide team management functionality.
- Implement secure user authentication using JWT.
- Implement role-based access control.
- Provide a centralized dashboard for project information.
- Provide API documentation for backend services.

## Key Features

### Dashboard

Provides a centralized overview of the software development workspace and important project information.

### Project Management

Users can create, view, update, and delete project records.

### Sprint Management

Users can create and manage sprints and associate them with projects.

### Task Management

Users can create and manage tasks, associate them with projects and sprints, and update task status through the task board.

### Bug and Defect Tracking

Users can create, update, delete, and manage the status of bugs and defects.

### Repository Management

Users can maintain repository records and manage repository information.

### Commit Management

Users can view and manage code commit records associated with repositories.

### Test Case Management

Users can create, update, delete, and manage the status of test cases.

### Deployment Management

Users can create deployment records and update deployment status.

### Activity Logs

Provides an interface for viewing activities performed within the application.

### Team Management

Authorized users can manage team members and user records.

### User Settings

Provides a dedicated settings interface for user-related preferences.

### AI Copilot

The application includes a NeuroForge AI Copilot interface that provides an assistant-style experience for users.

The current implementation uses predefined responses and simulated processing rather than an external LLM service.

## Modules

The main modules of the system are:

1. Dashboard
2. AI Copilot
3. Projects
4. Sprints
5. Tasks
6. Bugs
7. Repositories
8. Commits
9. Test Cases
10. Deployments
11. Activity Logs
12. Team Management
13. User Settings

## User Roles

The system currently supports role-based access control.

### DevOps Engineer

The DevOps Engineer has administrative-level access to system functionality, including team management.

### Developer

Developers can access the main software development modules available to authenticated users.

The backend uses JWT authentication and Spring Security to secure protected API requests.

## Technology Stack

### Frontend

- React
- Vite
- React Router
- Axios
- Tailwind CSS
- Lucide React
- JavaScript
- JSX

### Backend

- Java 17
- Spring Boot
- Spring Web MVC
- Spring Data JPA
- Hibernate
- Spring Security
- JWT
- JJWT
- Lombok
- Springdoc OpenAPI

### Database

- MySQL
- Hibernate/JPA

### Development Tools

- Visual Studio Code
- IntelliJ IDEA
- Git
- GitHub
- Maven
- npm

## System Architecture

```text
+-----------------------+
|        User           |
+-----------+-----------+
            |
            v
+-----------------------+
| React + Vite Frontend |
| Tailwind CSS          |
+-----------+-----------+
            |
            | REST API
            | Axios
            | JWT Bearer Token
            v
+-----------------------+
|   Spring Boot Backend |
|   Spring Web MVC      |
|   Spring Security     |
|   JWT Authentication  |
+-----------+-----------+
            |
            | JPA / Hibernate
            v
+-----------------------+
|        MySQL          |
|      neuroforge       |
+-----------------------+

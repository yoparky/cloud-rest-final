# Harbor Master - A Node.js REST API Project with Auth0 Authentication
## [Click here to visit Harbor Master](https://a9-portfolio.wl.r.appspot.com/)
This repository hosts a Node.js-based REST API project, Harbor Master, designed as a RESTful API that allows ship owners and operators to efficiently track and manage their vessels' cargo loads, deployed on Google Cloud Platform (GCP). 
The project leverages Google Datastore for persistent storage and integrates Auth0 for robust OAuth authentication.
Also check out a [docker containerized early version of the project](https://github.com/yoparky/cloud-rest-docker).

## Features

- **Node.js Backend**: The API is built using Node.js, emphasizing asynchronous patterns and efficient data handling.
- **Auth0 Authentication**: User authentication is managed via Auth0, providing a secure and scalable identity verification mechanism.
- **Datastore Integration**: Utilizes Google Datastore for structured data storage, ensuring scalability and flexibility.
- **GCP Deployment**: The application is deployed on Google Cloud Platform, leveraging the cloud's capabilities for high availability and performance.
- **Pagination & Status Codes**: Implements pagination for data queries and comprehensive HTTP status code handling.
- **Entity Relationships and API Documentation**: [API Documentation PDF](parky8_project.pdf)

## Entity Overview

- **User Entity**: Managed through Auth0, each user has a unique identifier in the system.
- **Boats & Loads Entities**: Two non-user entities that are interrelated (e.g., a boat can carry multiple loads).
- **Protected Resources**: Certain API endpoints are protected and require a valid JWT obtained through Auth0 authentication.

### Entities

- **Boats**: Represents a collection of boats, each potentially linked to a user and carrying loads.
- **Loads**: Represents various loads that can be assigned to boats. 1 to Many relationship, Boats : Loads.
- **Users**: Represents a collection of boat owners' data from autho0 and Datastore id.
- JWTs must match to have owner-sensitive boat information to be returned. Only users with matching JWT with a given boat will be able to do all CRUD operations on a given boat entity.

## API Endpoints

The API features resource-based URLs with endpoints for managing users, boats, and loads, among others. Pagination is implemented to enhance performance and usability.

### Key Endpoints

- `GET /boats`: Retrieves a paginated list of boats related to the authenticated user.
- `PUT /boats/{id}`: Updates a specific boat's details.
- `DELETE /boats/{id}`: Deletes a specific boat.
- `GET /loads`: Lists loads with pagination support.
- Create, Put, Patch, Get, List all, Assign and unassign, and many more. Refer to the [API Documentation PDF](parky8_project.pdf) for more endpoints.

## Authentication with Auth0

User authentication is handled through Auth0. The application redirects to Auth0 for login, returning a JWT for authorized API access.

### User Flow

1. **Account Creation/Login**: Users are redirected to an Auth0 page for secure account creation or login.
2. **JWT Generation**: Auth0 returns a JWT upon successful authentication.
3. **API Access**: The JWT is used for accessing protected endpoints. After login, the user-unique JWT to be used as a bearer token to interact with the API is displayed.

## HTTP Status Codes

The application appropriately responds with various HTTP status codes, including but not limited to 200 (OK), 201 (Created), 401 (Unauthorized), and 403 (Forbidden).
For more details, refer to the [API Documentation PDF](parky8_project.pdf).

## Deployment and Usage

The application is hosted on GCP.

## Testing

A comprehensive Postman test suite is included for endpoint validation, including tests for CRUD operations and authentication flows.

---

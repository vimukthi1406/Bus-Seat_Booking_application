# CI/CD & DevOps Integration Guide

This guide explains how to set up the Bus Seat Booking application with Docker and Jenkins for automated CI/CD.

## 1. Docker Setup

Your application is now containerized using Docker.

### Files Created:
-   **`server/Dockerfile`**: Builds the Node.js backend.
-   **`client/Dockerfile`**: Builds the React frontend and serves it with Nginx.
-   **`client/nginx.conf`**: Configures Nginx to handle React Router (client-side routing).
-   **`docker-compose.yml`**: Orchestrates both services.

### How to Run with Docker:
1.  Ensure Docker Desktop is running.
2.  Open a terminal in the project root.
3.  Run:
    ```bash
    docker-compose up --build
    ```
4.  Access the app at `http://localhost:8080`.
    -   Frontend: `http://localhost:8080`
    -   Backend API: `http://localhost:3000`

---

## 2. Jenkins CI/CD Setup

A `Jenkinsfile` has been added to the project root to define the pipeline.

### Prerequisites:
1.  **Jenkins** installed and running.
2.  **Docker** installed on the Jenkins server (or local machine).
3.  **Jenkins Permissions**: Jenkins user must have permission to run docker commands.

### Setting up the Pipeline:

1.  **Create New Item**:
    -   Go to Jenkins Dashboard -> **New Item**.
    -   Enter a name (e.g., "BusBooking-Pipeline").
    -   Select **Pipeline** and click **OK**.

2.  **Configure Pipeline**:
    -   Scroll down to the **Pipeline** section.
    -   **Definition**: Select "Pipeline script from SCM".
    -   **SCM**: Select "Git".
    -   **Repository URL**: Enter the URL of your Git repository (e.g., local path or GitHub URL).
    -   **Script Path**: Ensure it says `Jenkinsfile`.

3.  **Run Pipeline**:
    -   Click **Build Now**.
    -   Jenkins will:
        1.  Checkout code.
        2.  Build Docker images.
        3.  Deploy containers using `docker-compose`.

---

## 3. GitHub Integration (Optional)

To trigger builds automatically on push:

1.  **Push Code to GitHub**:
    ```bash
    git add .
    git commit -m "Initial commit with Docker and Jenkins"
    git branch -M main
    git remote add origin <your-github-repo-url>
    git push -u origin main
    ```

2.  **Configure Webhook**:
    -   Go to GitHub Repo Settings -> Webhooks.
    -   Add your Jenkins URL (e.g., `http://your-jenkins-ip:8080/github-webhook/`).
    -   In Jenkins, enable "GitHub hook trigger for GITScm polling" in the pipeline configuration.

## Troubleshooting

-   **Port Conflicts**: If port 3000 or 8080 is in use, verify `docker-compose.yml` port mappings.
-   **Permission Denied**: If Jenkins fails with docker permission errors, add the jenkins user to the docker group: `sudo usermod -aG docker jenkins`.

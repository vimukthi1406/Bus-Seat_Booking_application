pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_CMD = 'docker compose'
        DOCKER_CREDENTIALS_ID = 'docker-hub-bus-id'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    sh "${DOCKER_COMPOSE_CMD} build"
                }
            }
        }

        stage('Login to Docker Hub') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: DOCKER_CREDENTIALS_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                         sh "echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin"
                    }
                }
            }
        }

        stage('Push Images') {
            steps {
                script {
                    sh "${DOCKER_COMPOSE_CMD} push"
                }
            }
        }

        stage('Test') {
            steps {
                echo 'Running tests...'
                // Add your test commands here, e.g.,
                // sh "${DOCKER_COMPOSE_CMD} run server npm test"
            }
        }

        stage('Deploy') {
            steps {
                script {
                    sh "${DOCKER_COMPOSE_CMD} up -d"
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished'
        }
        success {
            echo 'Deployment successful!'
        }
        failure {
            echo 'Deployment failed.'
        }
    }
}

pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_CMD = 'docker-compose'
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

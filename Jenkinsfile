pipeline {
    agent any

    environment {
        NODE_ENV = 'production'
    }

    stages {
        stage('Install Node') {
            steps {
                sh '''
                    export NVM_DIR="$HOME/.nvm"
                    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
                    . "$NVM_DIR/nvm.sh"
                    nvm install 20
                    nvm use 20
                    node -v
                    npm -v

                    # Store node path for later steps
                    echo "export PATH=$NVM_DIR/versions/node/v20*/bin:$PATH" > .nvm_env.sh
                '''
            }
        }

        stage('Install deps') {
            steps {
                sh '''
                    export NVM_DIR="$HOME/.nvm"
                    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
                    nvm use 20

                    npm install
                '''
            }
        }

        stage('Write .env') {
            steps {
                writeFile file: '.env', text: """
REPOS=${params.REPOS}
SOURCE_WORKSPACE=${params.SOURCE_WORKSPACE}
SOURCE_USERNAME=${params.SOURCE_USERNAME}
SOURCE_APP_PASSWORD=${params.SOURCE_APP_PASSWORD}
DEST_WORKSPACE=${params.DEST_WORKSPACE}
DEST_USERNAME=${params.DEST_USERNAME}
DEST_APP_PASSWORD=${params.DEST_APP_PASSWORD}
DEST_PROJECT_KEY=${params.DEST_PROJECT_KEY}
"""
            }
        }

        stage('Sync Repos') {
            steps {
                sh '''
                    export NVM_DIR="$HOME/.nvm"
                    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
                    nvm use 20

                    node index.mjs
                '''
            }
        }
    }
}

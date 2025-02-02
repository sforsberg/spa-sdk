/*
 * Copyright 2020 Bloomreach
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

pipeline {
  agent {
    docker {
      label 'docker'
      image 'node:16'
      args '-v  /etc/passwd:/etc/passwd'
    }
  }

  environment {
    // Setup HOME to WORKSPACE path to avoid access errors during npm install
    HOME = "${env.WORKSPACE}"
  }

  options {
    gitLabConnection('https://code.bloomreach.com/')
    gitlabCommitStatus(name: 'jenkins')
  }

  triggers {
    gitlab(
      triggerOnPush: true,
      pendingBuildName: 'SPA SDK'
    )
  }

  post {
    cleanup {
      deleteDir()
    }
  }

  stages {
    stage('Install') {
      steps {
        sh 'npm ci'
      }
    }
    stage('Build') {
      steps {
        sh 'npm run build'
      }
    }
    stage('Lint') {
      steps {
        sh 'npm run lint'
      }
    }
    stage('Unit tests') {
      steps {
        sh 'npm run test'
      }
    }
    stage('Release') {
      when {
        branch 'main'
      }

      environment {
        GIT_SSH_COMMAND='ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no'
        VERSION = sh(script: "node -p -e \"require('./package.json').version\"", returnStdout: true).trim()
      }

      stages {
        stage('Fetch tags') {
          steps {
            sshagent (credentials: ['a9511950-0b5d-4727-aa82-a0d7f205b1f4']) {
              sh 'git fetch --tags'
            }
          }
        }
        stage('Publish to Github') {
          steps {
            sshagent (credentials: ['github-spa-sdk']) {
              sh 'git remote add github git@github.com:bloomreach/spa-sdk.git'
              sh 'git push github HEAD:refs/heads/main'
              sh 'git push github "spa-sdk-${VERSION}"'
            }
          }
        }
        stage('Setup git config') {
          steps {
            sh 'git config --global user.email "jenkins@code.bloomreach.com"'
            sh 'git config --global user.name "Jenkins"'
          }
        }
        stage('Generate and publish SPA SDK TypeDoc') {
          stages {
            stage('Generate SPA SDK TypeDoc') {
              steps {
                sh 'npm run docs --workspace @bloomreach/spa-sdk'
              }
            }
            stage('Clone github pages with TypeDoc') {
              steps {
                sshagent (credentials: ['github-spa-sdk']) {
                  sh 'git clone -b gh-pages --single-branch git@github.com:bloomreach/spa-sdk.git spa-sdk-typedoc'
                }
              }
            }
            stage('Copy new version of TypeDoc') {
              steps {
                sh 'rm -rf spa-sdk-typedoc/*'
                sh 'cp -r packages/spa-sdk/docs/. spa-sdk-typedoc/'
              }
            }
            stage('Publish to github pages') {
              steps {
                sh 'git -C spa-sdk-typedoc add --all'
                sh 'git -C spa-sdk-typedoc commit -m "Update SPA SDK TypeDocs for release ${VERSION}"'
                sshagent (credentials: ['github-spa-sdk']) {
                  sh 'git -C spa-sdk-typedoc push'
                }
              }
            }
            stage('Cleanup') {
              steps {
                sh 'rm -rf spa-sdk-typedoc'
              }
            }
          }
        }
        stage('Publish to NPM') {
          steps {
            withCredentials([[$class: 'StringBinding', credentialsId: 'NPM_AUTH_TOKEN', variable: 'NPM_AUTH_TOKEN']]) {
              sh 'echo "//registry.npmjs.org/:_authToken=${NPM_AUTH_TOKEN}" >> ~/.npmrc'
              sh 'npm run release -- --yes'
            }
          }
        }
        stage('Deploy to Heroku') {
          environment {
            // Replace dots with dashes in version because the Heroku URL requires dashes
            VERSION_FOR_HEROKU = "${VERSION.replace('.', '-')}"
            HEROKU_TEAM = "bloomreach"
          }

          stages {
            stage('Deploy apps') {
              matrix {
                axes {
                  axis {
                    name 'APP_TYPE'
                    values 'ssr', 'csr'
                  }
                  axis {
                    name 'APP_NAME'
                    values 'ng', 'react', 'vue'
                  }
                }
                stages {
                  stage('Deploy app') {
                    steps {
                      withCredentials([[$class: 'StringBinding', credentialsId: 'HEROKU_API_KEY', variable: 'HEROKU_API_KEY']]) {
                        sh 'npm run deploy-to-heroku "${APP_TYPE}" "${APP_NAME}" "${VERSION_FOR_HEROKU}"'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

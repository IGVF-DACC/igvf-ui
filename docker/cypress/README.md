## Custom Cypress Docker image for M1 mac.

The official Cypress image doesn't currently support M1 architecture (see https://github.com/cypress-io/cypress-docker-images/issues/431). To run Cypress tests locally in Docker on an M1 we build a custom image with Cypress installed (see https://github.com/webnexusmobile/cy-m1/blob/main/Dockerfile). This image takes a long time to build, so we push the resulting image to our public Docker repository for quick reuse.

If you need to update the image, build it locally (on M1) and then push to our AWS ECR.

```bash
# Authenticate with AWS.
$ aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws/p4j3k8v5
# Tag built image.
$ docker tag c08cc7711923 public.ecr.aws/p4j3k8v5/cherry-lab:cypress-9.4.1-m1
# Push to ECR.
$ docker push public.ecr.aws/p4j3k8v5/cherry-lab:cypress-9.4.1-m1
```
The image (e.g. `cypress-9.4.1-m1`) should be publically available to use. Update the `docker-compose.cypress-m1.yml` image specification to use desired tag, e.g.: `public.ecr.aws/p4j3k8v5/cherry-lab:cypress-9.4.1-m1`.
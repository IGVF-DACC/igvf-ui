## Infrastructure
Install Node.js 18 using `nvm` (Node Version Manager):

```
# Install nvm.
$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
```

Then in new terminal:

```
# Install and use node 18.
$ nvm install 18
$ nvm use 18
# Check version.
$ node --version
```

Install CDK toolkit (requires Node.js 16.x):

```
$ npm install -g aws-cdk@2.88.0
```

Create virtual Python 3.11 environment and install requirements:

```
$ pip install -r requirements.txt -r requirements-dev.txt
```

Make sure Docker is running.

## Deploy demo stacks

### Overview

Demo applications are not deployed directly. Instead you deploy an `AWS CodePipeline` pipeline once, tied to your Github branch, that deploys the actual application. Once the pipeline is deployed every new commit to your branch will trigger a pipeline execution that updates the application with the new commit. You can watch your pipeline in the `AWS CodePipeline` console to see the commit moving through the deployment steps.

### Configure

Configure your AWS credentials for the `igvf-dev` account (e.g. in `igvf-dev` profile). This is the account where your demo will be deployed.

```
# In ~/.aws/credentials
[igvf-dev]
aws_secret_access_key = XYZ123
aws_access_key_id = ABC321
```

```
# In ~/.aws/config
[profile igvf-dev]
region = us-west-2
```

This sets the access key and region used when you specify `--profile igvf-dev` on the command line.

Ask to be invited to the `aws-chatbot` Slack channel, where you can monitor the status transitions of your deployment pipeline.

### Command

Make sure your Python virtual environment is activated, the Node and Python requirements above are installed, and Docker is running.

Push all of your changes to your Github branch (e.g. `IGVF-1234-my-feature-branch`) before deploying. Pick a branch name that doesn't conflict with anyone else's pipeline.

```bash
$ git push origin IGVF-1234-my-feature-branch
```

Make sure you are in the `cdk` folder of the repo and deploy the pipeline.

```bash
$ cdk deploy -c branch=IGVF-1234-my-feature-branch --profile igvf-dev
```

This passes the branch name as a context variable, and tells the CDK to use your credentials for the `igvf-dev` account. It's important to match the branch name that you've pushed to Github exactly, as this is where the pipeline listens for code changes. The branch name is also used for generating a URL for the demo.

## Clean up demo stacks

```bash
$ cdk destroy -c branch=IGVF-1234-my-feature-branch --profile igvf-dev
```

This only cleans up the CodePipeline stack, not the application stacks deployed by the pipeline.

In most cases you probably want to clean up everything:

```bash
$ python commands/cdk_destroy_all_stacks.py -c branch=IGVF-1234-my-feature-branch --profile igvf-dev
# Follow (y/n) prompts...
```

Pass the `--force` flag to bypass the confirmation prompts.

### Automatic clean up

By default demo stacks have a lifetime of 72 hours, after which they get destroyed. Additionally, by default the demo stacks will be deleted during the Friday night (Friday night means 0000-0659 hours on Saturday, US/Pacific timezone). This behavior is configured in `cdk/infrastructure/config.py`. Altering the default behavior can be done by editing and committing changes to values in
```
'tags': [
    ('time-to-live-hours', '72'),
    ('turn-off-on-friday-night', 'yes'),
],
```
In `turn-off-on-friday-night` tag, any value other than `yes` is interpreted as a negative (as well as the absence of the tag).

## Notes on demos

Avoid deploying a demo stack to our primary/shared branches (e.g. `dev` or `main`) as these already have their own pipelines associated with them. If you want to deploy your own demo that matches `dev`, for example, first checkout `dev`, pull all of the changes, and then copy them to your own branch with a special name:

```bash
$ git checkout dev
$ git pull
$ git checkout -b dev-keenan
```

Then use this new branch to deploy your pipeline.

## Using a specific igvfd demo for your igvf-ui demo

In most cases when deploying an igvf-ui demo, you create an igvfd branch with the same name as your igvf-ui branch, push that to the igvfd repo, then deploy that branch as an igvfd demo. Because your igvf-ui and igvfd demo have the same branch name, they automatically connect with each other so that your igvf-ui demo uses the data from your igvfd demo.

But in some cases, you might want your igvf-ui demo to use another specific igvfd demo instead, for example:

* Your igvf-ui branch relies on changes in a specific igvfd branch, so their demos have to work together.
* Your igvf-ui demo relies on the data in a specific igvfd demo.
* You simply don’t want to start an igvfd demo, as the data in an existing igvfd demo works well enough for your igvf-ui demo, and you have no need to change that data.

To point your igvf-ui demo at a specific igvfd demo, open the file at `cdk/infrastructure/config.py` and go to the `config` Dict. Within there, look for the `environment` property, and within that, look for the `demo` property. It should already have `frontend` and `tags` properties. Add a third property: `backend_url`. For its value, enter the complete URL for the igvfd demo you want your igvf-ui demo to use. Make sure not to include the trailing slash after the domain name. If you want your igvf-ui demo to connect with the igvfd “dev” demo for example, your `demo` object would look like:
```python
'demo': {
    'frontend': {
        'cpu': 1024,
        'memory_limit_mib': 2048,
        'desired_count': 1,
        'max_capacity': 4,
    },
    'backend_url': 'https://igvfd-dev.demo.igvf.org',
    'tags': [
        ('time-to-live-hours', '72'),
        ('turn-off-on-friday-night', 'yes'),
    ],
},
```
Leave this modified config.py file in your branch as it goes through code review and QA. That `backend_url` property gets removed before merging your branch into the dev branch of the igvf-ui repo. If you try to remove this line before QA finishes, it could cause your igvf-ui demo to get rebuilt and lose the connection with the igvfd demo.

This change to your branch’s config.py file causes a CircleCI failure in the “check-demo-config” test. That test makes sure your config file has the correct default values, so ignore that failure.

## Useful commands

 * `cdk ls`          list all stacks in the app
 * `cdk synth`       emits the synthesized CloudFormation template
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk docs`        open CDK documentation

## Run type checking with mypy
```
# In cdk folder.
$ pip install -r requirements.txt -r requirements-dev.txt
$ mypy .
```
Runs in strict mode, excluding `test` folder.

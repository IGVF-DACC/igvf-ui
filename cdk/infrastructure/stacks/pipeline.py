from aws_cdk import Stack
from aws_cdk import Stage

from constructs import Construct

from aws_cdk.aws_codepipeline import Pipeline

from aws_cdk.pipelines import CodePipeline
from aws_cdk.pipelines import CodePipelineSource
from aws_cdk.pipelines import DockerCredential

from aws_cdk.pipelines import ShellStep

from shared_infrastructure.igvf_dev.secret import DockerHubCredentials
from shared_infrastructure.igvf_dev.environment import US_WEST_2
from shared_infrastructure.igvf_dev.notification import Notification

from infrastructure.stacks.frontend import FrontendStack

from infrastructure.naming import prepend_branch_name
from infrastructure.naming import prepend_project_name


class DevStage(Stage):

    def __init__(
            self,
            scope: Construct,
            construct_id: str,
            branch,
            **kwargs
    ) -> None:
        super().__init__(scope, construct_id, **kwargs)
        FrontendStack(
            self,
            'FrontendStack',
            branch=branch,
            env=US_WEST_2,
        )


class PipelineStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, branch, **kwargs):
        super().__init__(scope, construct_id, **kwargs)
        self.branch = branch
        self._define_github_connection()
        self._define_cdk_synth_step()
        self._make_code_pipeline()
        self._add_demo_deploy_stage()
        self._add_slack_notifications()

    def _define_github_connection(self) -> None:
        self.github = CodePipelineSource.connection(
            'IGVF-DACC/igvf-ui',
            self.branch,
            connection_arn=(
                'arn:aws:codestar-connections:'
                'us-west-2:109189702753:'
                'connection/d65802e7-37d9-4be6-bc86-f94b2104b5ff'
            )
        )

    def _define_cdk_synth_step(self) -> None:
        self.synth = ShellStep(
            'SynthStep',
            input=self.github,
            env={
                'BRANCH': self.branch,
            },
            commands=[
                'npm install -g aws-cdk@2',
                'cd ./cdk',
                'python -m venv .venv',
                '. .venv/bin/activate',
                'pip install -r requirements.txt -r requirements-dev.txt',
                'cdk synth -c branch=$BRANCH'
            ],
            primary_output_directory='cdk/cdk.out',
        )

    def _get_docker_credentials(self) -> DockerCredential:
        dhc = DockerHubCredentials(
            self,
            'DockerHubCredentials',
        )
        return DockerCredential.docker_hub(
            dhc.secret,
            secret_username_field='DOCKER_USER',
            secret_password_field='DOCKER_SECRET',
        )

    def _make_code_pipeline(self) -> None:
        self.code_pipeline = CodePipeline(
            self,
            'CodePipeline',
            synth=self.synth,
            docker_credentials=[
                self._get_docker_credentials(),
            ],
            docker_enabled_for_synth=True,
        )

    def _get_underlying_pipeline(self) -> Pipeline:
        if getattr(self, 'pipeline', None) is None:
            # Can't modify high-level CodePipeline after build.
            self.code_pipeline.build_pipeline()
            # Low-level pipeline.
            self.pipeline = self.code_pipeline.pipeline
        return self.pipeline

    def _add_slack_notifications(self) -> None:
        notification = Notification(
            self,
            'Notification',
        )
        self._get_underlying_pipeline().notify_on_execution_state_change(
            'NotifySlack',
            notification.encode_dcc_chatbot,
        )

    def _add_demo_deploy_stage(self) -> None:
        stage = DevStage(
            self,
            prepend_project_name(
                prepend_branch_name(
                    self.branch,
                    'DeployDemo',
                )
            ),
            branch=self.branch,
        )
        self.code_pipeline.add_stage(
            stage,
        )

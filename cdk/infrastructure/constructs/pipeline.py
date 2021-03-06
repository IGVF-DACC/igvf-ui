from constructs import Construct

from aws_cdk.aws_codepipeline import Pipeline

from aws_cdk.pipelines import CodePipeline
from aws_cdk.pipelines import CodePipelineSource
from aws_cdk.pipelines import DockerCredential
from aws_cdk.pipelines import ManualApprovalStep
from aws_cdk.pipelines import ShellStep

from infrastructure.config import Config

from infrastructure.naming import prepend_branch_name
from infrastructure.naming import prepend_project_name
from infrastructure.stages.dev import DevelopmentDeployStage

from infrastructure.constructs.existing.types import ExistingResources

from typing import Any

from dataclasses import dataclass


@dataclass
class BasicSelfUpdatingPipelineProps:
    config: Config
    existing_resources: ExistingResources
    github_repo: str


class BasicSelfUpdatingPipeline(Construct):

    github: CodePipelineSource
    synth: ShellStep
    code_pipeline: CodePipeline
    pipeline: Pipeline

    def __init__(
            self,
            scope: Construct,
            construct_id: str,
            *,
            props: BasicSelfUpdatingPipelineProps,
            **kwargs: Any
    ) -> None:
        super().__init__(scope, construct_id, **kwargs)
        self.props = props
        self._define_github_connection()
        self._define_cdk_synth_step()
        self._make_code_pipeline()

    def _define_github_connection(self) -> None:
        self.github = CodePipelineSource.connection(
            self.props.github_repo,
            self.props.config.branch,
            connection_arn=self.props.existing_resources.code_star_connection.arn
        )

    def _define_cdk_synth_step(self) -> None:
        self.synth = ShellStep(
            'SynthStep',
            input=self.github,
            env={
                'CONFIG_NAME': self.props.config.name,
                'BRANCH': self.props.config.branch,
            },
            commands=[
                f'npm install -g aws-cdk@{self.props.config.common.aws_cdk_version}',
                'cd ./cdk',
                'python -m venv .venv',
                '. .venv/bin/activate',
                'pip install -r requirements.txt -r requirements-dev.txt',
                'pytest tests/',
                'cdk synth -v -c branch=$BRANCH -c config-name=$CONFIG_NAME',
            ],
            primary_output_directory='cdk/cdk.out',
        )

    def _get_docker_credentials(self) -> DockerCredential:
        return DockerCredential.docker_hub(
            self.props.existing_resources.docker_hub_credentials.secret,
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
        self._get_underlying_pipeline().notify_on_execution_state_change(
            'NotifySlack',
            self.props.existing_resources.notification.encode_dcc_chatbot,
        )


DemoDeploymentPipelineProps = BasicSelfUpdatingPipelineProps


class DemoDeploymentPipeline(BasicSelfUpdatingPipeline):

    def __init__(
            self,
            scope: Construct,
            construct_id: str,
            *,
            props: DemoDeploymentPipelineProps,
            **kwargs: Any,
    ) -> None:
        super().__init__(
            scope,
            construct_id,
            props=props,
            **kwargs,
        )
        self._add_development_deploy_stage()
        self._add_slack_notifications()

    def _add_development_deploy_stage(self) -> None:
        stage = DevelopmentDeployStage(
            self,
            prepend_project_name(
                prepend_branch_name(
                    self.props.config.branch,
                    'DeployDevelopment',
                )
            ),
            config=self.props.config,
        )
        self.code_pipeline.add_stage(
            stage,
        )

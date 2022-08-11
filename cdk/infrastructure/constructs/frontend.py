from aws_cdk import Duration
from aws_cdk import Tags

from constructs import Construct

from aws_cdk.aws_ec2 import Port

from aws_cdk.aws_ecs import AwsLogDriverMode
from aws_cdk.aws_ecs import CfnService
from aws_cdk.aws_ecs import ContainerImage
from aws_cdk.aws_ecs import DeploymentCircuitBreaker
from aws_cdk.aws_ecs import Secret
from aws_cdk.aws_ecs import LogDriver

from aws_cdk.aws_ecs_patterns import ApplicationLoadBalancedFargateService
from aws_cdk.aws_ecs_patterns import ApplicationLoadBalancedTaskImageOptions

from aws_cdk.aws_iam import ManagedPolicy

from aws_cdk.aws_secretsmanager import Secret as SMSecret
from aws_cdk.aws_secretsmanager import SecretStringGenerator

from infrastructure.config import Config

from infrastructure.constructs.existing.types import ExistingResources


from typing import Any
from typing import cast

from dataclasses import dataclass


@dataclass
class FrontendProps:
    config: Config
    existing_resources: ExistingResources
    cpu: int
    memory_limit_mib: int
    desired_count: int
    max_capacity: int


class Frontend(Construct):

    props: FrontendProps
    application_image: ContainerImage
    fargate_service: ApplicationLoadBalancedFargateService

    def __init__(
            self,
            scope: Construct,
            construct_id: str,
            *,
            props: FrontendProps,
            **kwargs: Any
    ) -> None:
        super().__init__(scope, construct_id, **kwargs)
        self.props = props
        self._define_docker_assets()
        self._define_fargate_service()
        self._configure_health_check()
        self._add_tags_to_fargate_service()
        self._enable_exec_command()
        self._configure_task_scaling()

    def _define_docker_assets(self) -> None:
        self.application_image = ContainerImage.from_asset(
            '../',
            file='docker/nextjs/Dockerfile',
        )

    def _define_fargate_service(self) -> None:
        self.fargate_service = ApplicationLoadBalancedFargateService(
            self,
            'Fargate',
            vpc=self.props.existing_resources.network.vpc,
            cpu=self.props.cpu,
            desired_count=self.props.desired_count,
            circuit_breaker=DeploymentCircuitBreaker(
                rollback=True,
            ),
            task_image_options=ApplicationLoadBalancedTaskImageOptions(
                container_name='nextjs',
                container_port=3000,
                image=self.application_image,
                environment={
                    'NODE_ENV': 'development',
                    'BACKEND_URL': self.props.config.backend_url,
                },
                log_driver=LogDriver.aws_logs(
                    stream_prefix='nextjs',
                    mode=AwsLogDriverMode.NON_BLOCKING,
                ),
            ),
            memory_limit_mib=self.props.memory_limit_mib,
            public_load_balancer=True,
            assign_public_ip=True,
            certificate=self.props.existing_resources.domain.certificate,
            domain_zone=self.props.existing_resources.domain.zone,
            domain_name=f'igvf-ui-{self.props.config.branch}.{self.props.existing_resources.domain.name}',
            redirect_http=True,
        )

    def _configure_health_check(self) -> None:
        self.fargate_service.target_group.configure_health_check(
            interval=Duration.seconds(60),
        )

    def _add_tags_to_fargate_service(self) -> None:
        Tags.of(self.fargate_service).add(
            'branch',
            self.props.config.branch
        )
        Tags.of(self.fargate_service).add(
            'backend_url',
            self.props.config.backend_url
        )

    def _enable_exec_command(self) -> None:
        self.fargate_service.task_definition.task_role.add_managed_policy(
            ManagedPolicy.from_aws_managed_policy_name(
                'AmazonSSMManagedInstanceCore'
            )
        )
        # Make mypy happy (default child is Optional[IConstruct]).
        cfn_service = cast(
            CfnService,
            self.fargate_service.service.node.default_child
        )
        cfn_service.enable_execute_command = True

    def _configure_task_scaling(self) -> None:
        scalable_task = self.fargate_service.service.auto_scale_task_count(
            max_capacity=self.props.max_capacity,
        )
        scalable_task.scale_on_request_count(
            'RequestCountScaling',
            requests_per_target=600,
            target_group=self.fargate_service.target_group,
            scale_in_cooldown=Duration.seconds(60),
            scale_out_cooldown=Duration.seconds(60),
        )

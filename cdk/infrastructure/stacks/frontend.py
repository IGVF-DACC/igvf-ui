from aws_cdk import Stack

from constructs import Construct

from aws_cdk import Duration
from aws_cdk import Tags

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

from shared_infrastructure.igvf_dev.network import DemoNetwork
from shared_infrastructure.igvf_dev.domain import DemoDomain



def delme():
    pass
def delme2():
    pass
class FrontendStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, *, branch, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        cpu = 1024
        memory_limit_mib = 2048
        desired_count = 1
        max_capacity = 4

        demo_network = DemoNetwork(
            self,
            'DemoNetwork'
        )

        demo_domain = DemoDomain(
            self,
            'DemoDomain',
        )

        nextjs_image = ContainerImage.from_asset(
            '../',
            file='docker/nextjs/Dockerfile',
        )

        fargate_service = ApplicationLoadBalancedFargateService(
            self,
            'Fargate',
            vpc=demo_network.vpc,
            cpu=cpu,
            desired_count=desired_count,
            circuit_breaker=DeploymentCircuitBreaker(
                rollback=True,
            ),
            task_image_options=ApplicationLoadBalancedTaskImageOptions(
                container_name='nextjs',
                container_port=3000,
                image=nextjs_image,
                log_driver=LogDriver.aws_logs(
                    stream_prefix='nextjs',
                    mode=AwsLogDriverMode.NON_BLOCKING,
                ),
            ),
            memory_limit_mib=memory_limit_mib,
            public_load_balancer=True,
            assign_public_ip=True,
            certificate=demo_domain.certificate,
            domain_zone=demo_domain.zone,
            domain_name=f'igvf-ui-{branch}.{demo_domain.name}',
            redirect_http=True,
        )

        fargate_service.target_group.configure_health_check(
            interval=Duration.seconds(60),
        )

        Tags.of(fargate_service).add(
            'branch',
            branch,
        )

        fargate_service.task_definition.task_role.add_managed_policy(
            ManagedPolicy.from_aws_managed_policy_name(
                'AmazonSSMManagedInstanceCore'
            )
        )

        cfn_service = fargate_service.service.node.default_child
        cfn_service.enable_execute_command = True

        scalable_task = fargate_service.service.auto_scale_task_count(
            max_capacity=max_capacity,
        )
        scalable_task.scale_on_request_count(
            'RequestCountScaling',
            requests_per_target=600,
            target_group=fargate_service.target_group,
            scale_in_cooldown=Duration.seconds(60),
            scale_out_cooldown=Duration.seconds(60),
        )
